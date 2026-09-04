import type { StudyDatabase } from "@/lib/persistence/store";
import { stamp } from "@/lib/persistence/store";
import type { EvidenceSourceKind, MemoryItem, MemoryKind, MemoryReview } from "@/lib/domain/types";
import { gradeFrom, isDue, schedule } from "@/lib/scoring/spaced";
import { recordEvidence } from "./evidence";

export interface NewMemoryItem {
  kind: MemoryKind;
  prompt: string;
  answer: string;
  accept?: string[];
  hint?: string;
  person?: MemoryItem["person"];
  sequence?: string[];
  sourceRef?: { kind: EvidenceSourceKind; refId: string; label?: string };
  palaceLocusId?: string;
  tags?: string[];
  /** first due date; defaults to tomorrow-ish (0.5 day) */
  dueInDays?: number;
}

/** Create a memory item unless an identical prompt from the same source already exists. */
export async function createMemoryItem(db: StudyDatabase, input: NewMemoryItem): Promise<MemoryItem> {
  const store = db.store("memory_items");
  const existing = await store.list({ filter: (m) => m.prompt === input.prompt && m.sourceRef?.refId === input.sourceRef?.refId });
  if (existing[0]) return existing[0];
  const dueDays = input.dueInDays ?? 0.5;
  const item = stamp<MemoryItem>(db.userId, "mem", {
    kind: input.kind,
    prompt: input.prompt,
    answer: input.answer,
    accept: input.accept,
    hint: input.hint,
    person: input.person,
    sequence: input.sequence,
    sourceRef: input.sourceRef,
    palaceLocusId: input.palaceLocusId,
    tags: input.tags,
    ease: 2.5,
    intervalDays: dueDays,
    due: new Date(Date.now() + dueDays * 86400000).toISOString(),
    reps: 0,
    lapses: 0,
  });
  await store.put(item);
  return item;
}

export async function dueMemoryItems(db: StudyDatabase, now = new Date()): Promise<MemoryItem[]> {
  const all = await db.store("memory_items").list();
  return all.filter((m) => isDue(m, now)).sort((a, b) => a.due.localeCompare(b.due));
}

export interface ReviewInput {
  item: MemoryItem;
  correct: boolean;
  latencyMs?: number;
  confidence?: number;
  sessionId?: string;
  /** explicit grade overrides derived grade */
  grade?: 0 | 1 | 2 | 3 | 4 | 5;
}

/** Record a review, reschedule, and write memory evidence (delayed recall counts more). */
export async function reviewMemoryItem(db: StudyDatabase, input: ReviewInput): Promise<{ item: MemoryItem; review: MemoryReview }> {
  const grade = input.grade ?? gradeFrom(input.correct, input.latencyMs, input.confidence);
  const next = schedule(input.item, { grade, latencyMs: input.latencyMs, confidence: input.confidence });
  const item: MemoryItem = { ...input.item, ...next, lastReviewedAt: new Date().toISOString() };
  await db.store("memory_items").put(item);
  const review = stamp<MemoryReview>(db.userId, "rev", {
    itemId: item.id,
    grade,
    correct: input.correct,
    confidence: input.confidence,
    latencyMs: input.latencyMs,
    intervalBefore: input.item.intervalDays,
    intervalAfter: next.intervalDays,
    sessionId: input.sessionId,
  });
  await db.store("memory_reviews").put(review);
  const delayed = input.item.intervalDays >= 3;
  const subskill =
    input.item.kind === "person" ? "memory.names" : input.item.kind === "sequence" ? "memory.sequences" : input.item.kind === "spatial" ? "memory.spatial" : input.item.kind === "reconstruction" ? "memory.reconstruction" : delayed ? "memory.retention" : "memory.recall";
  const difficulty = Math.min(8, Math.max(1, Math.round(1 + Math.log2(1 + input.item.intervalDays)))) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  await recordEvidence(db, {
    subskill,
    score: input.correct ? (grade >= 5 ? 1 : grade === 4 ? 0.85 : 0.7) : grade === 0 ? 0 : 0.2,
    difficulty,
    format: delayed ? "delayed" : "free",
    source: { kind: "memory", refId: item.id, label: item.prompt.slice(0, 60) },
    latencyMs: input.latencyMs,
    confidence: input.confidence,
    correct: input.correct,
    sessionId: input.sessionId,
  });
  if (input.confidence !== undefined) {
    const { recordConfidence } = await import("./evidence");
    await recordConfidence(db, { confidence: input.confidence, correct: input.correct, domain: "memory", source: { kind: "memory", refId: item.id }, sessionId: input.sessionId, asEvidence: false });
  }
  return { item, review };
}
