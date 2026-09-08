/**
 * THE STUDY V2 — memory scheduler.
 *
 * SM-2 lineage (see `src/lib/scoring/spaced.ts`) with the V2 rules: a base ladder of
 * intervals adapted by ease, stated confidence and performance; a retrieval *stage*
 * (recall → application → reconstruction → connection) that advances every second
 * success and drives the prompt offered; and retention buckets for Review.
 *
 * Pure functions first; thin `db` wrappers at the end. `reviewRetrieval` is the only
 * write path for retrieval reviews and records concept evidence through mastery.
 */
import type { Concept } from "./content-types";
import type { RetrievalItem, RetrievalMode, RetrievalReview, SourceRef, Entity } from "./types";
import type { StudyDatabase } from "@/lib/persistence/store";
import { stamp } from "@/lib/persistence/store";
import { conceptContent } from "@/content/v2";
import { recordConceptEvidence } from "@/lib/v2/mastery";

const DAY_MS = 86_400_000;

/** Days, at ease 2.5. Adapted by performance — not a fixed schedule. */
export const BASE_INTERVALS = [1, 4, 12, 30, 90];

/** Highest retrieval stage: 0 recall → 1 recall → 2 application → 3 reconstruction → 4 connection. */
export const MAX_STAGE = 4;

export type Grade = 0 | 1 | 2 | 3 | 4 | 5;

export interface GradeInput {
  correct: boolean;
  /** 0..1 */
  score?: number;
  latencyMs?: number;
  /** 0..1 */
  confidence?: number;
}

/**
 * 0 blackout / confidently wrong, 1 wrong, 2 wrong but partly there,
 * 3 correct with effort, 4 correct, 5 correct and fast.
 */
export function gradeFrom(r: GradeInput): Grade {
  if (!r.correct) {
    if (r.confidence !== undefined && r.confidence >= 0.8) return 0;
    if (r.score !== undefined && r.score >= 0.4) return 2;
    return 1;
  }
  let grade: Grade = 4;
  if (r.latencyMs !== undefined) {
    if (r.latencyMs < 4_000) grade = 5;
    else if (r.latencyMs < 12_000) grade = 4;
    else grade = 3;
  }
  // A correct but incomplete answer (free recall covering most points) is a hard success.
  if (r.score !== undefined && r.score < 0.8 && grade > 3) grade = 3;
  return grade;
}

export type ScheduleState = Pick<RetrievalItem, "ease" | "intervalDays" | "reps" | "lapses" | "stage">;

export interface ScheduleInput {
  grade: Grade;
  confidence?: number;
  latencyMs?: number;
}

export interface ScheduleResult extends ScheduleState {
  due: string;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * grade < 3: lapse — reps 0, interval 1 day (0.5 for a blackout), stage drops one.
 * grade ≥ 3: BASE_INTERVALS[min(reps, 4)] × ease/2.5 × (0.85 + 0.3·confidence); beyond the ladder
 * the previous interval grows by ease. Stage advances every second success up to 4.
 * Ease follows SM-2 (minimum 1.3). Intervals are clamped to 0.5..365 days.
 */
export function scheduleReview(item: ScheduleState, r: ScheduleInput, now: Date = new Date()): ScheduleResult {
  let { ease, intervalDays, reps, lapses, stage } = item;
  const g = r.grade;
  if (g < 3) {
    reps = 0;
    lapses += 1;
    intervalDays = g === 0 ? 0.5 : 1;
    stage = Math.max(0, stage - 1);
  } else {
    const ladder = BASE_INTERVALS[Math.min(reps, BASE_INTERVALS.length - 1)]!;
    const base = reps < BASE_INTERVALS.length ? ladder : Math.max(ladder, intervalDays * ease);
    const confidenceFactor = r.confidence === undefined ? 1 : 0.85 + 0.3 * Math.max(0, Math.min(1, r.confidence));
    intervalDays = base * (ease / 2.5) * confidenceFactor;
    reps += 1;
    if (reps % 2 === 0) stage = Math.min(MAX_STAGE, stage + 1);
  }
  ease = Math.max(1.3, ease + (0.1 - (5 - g) * (0.08 + (5 - g) * 0.02)));
  intervalDays = Math.max(0.5, Math.min(365, round1(intervalDays)));
  const due = new Date(now.getTime() + intervalDays * DAY_MS).toISOString();
  return { ease: Math.round(ease * 100) / 100, intervalDays, reps, lapses, stage, due };
}

export function isDue(item: Pick<RetrievalItem, "due" | "suspended">, now: Date = new Date()): boolean {
  return !item.suspended && new Date(item.due).getTime() <= now.getTime();
}

/** 0..1 — how likely the item is to be forgotten right now. */
export function retentionRisk(item: Pick<RetrievalItem, "due" | "intervalDays" | "lapses">, now: Date = new Date()): number {
  const overdueDays = (now.getTime() - new Date(item.due).getTime()) / DAY_MS;
  const span = Math.max(1, item.intervalDays);
  const base = overdueDays <= 0 ? Math.max(0, 0.3 + overdueDays / span) : Math.min(1, 0.5 + overdueDays / span);
  return Math.min(1, Math.max(0, base + item.lapses * 0.05));
}

export type RetentionBucket = "durable" | "fragile" | "decaying" | "due";

/** A lapse resets reps to 0; a later success increments them. So reps 0 with lapses means the last review failed. */
function lastReviewFailed(item: Pick<RetrievalItem, "reps" | "lapses">): boolean {
  return item.reps === 0 && item.lapses > 0;
}

/**
 * due: past due. fragile: lapses ≥ 2 or the last review failed. decaying: within 20 % of the
 * interval before due. durable: interval ≥ 21 days and lapses < 2. Otherwise fragile when the
 * risk is ≥ 0.6, else decaying.
 */
export function retentionBucket(item: Pick<RetrievalItem, "due" | "intervalDays" | "lapses" | "reps">, now: Date = new Date()): RetentionBucket {
  const dueMs = new Date(item.due).getTime();
  if (dueMs <= now.getTime()) return "due";
  if (item.lapses >= 2 || lastReviewFailed(item)) return "fragile";
  const remainingDays = (dueMs - now.getTime()) / DAY_MS;
  if (remainingDays <= 0.2 * Math.max(0.5, item.intervalDays)) return "decaying";
  if (item.intervalDays >= 21 && item.lapses < 2) return "durable";
  return retentionRisk(item, now) >= 0.6 ? "fragile" : "decaying";
}

const FREE_MODES: ReadonlySet<RetrievalMode> = new Set(["free_recall", "process", "compare", "application", "explanation", "connection"]);

function topicOf(item: Pick<RetrievalItem, "conceptId" | "prompt" | "answer">): string {
  const concept = item.conceptId ? conceptContent(item.conceptId) : undefined;
  if (concept) return concept.title;
  const p = item.prompt.trim().replace(/[.?!]+$/, "");
  return p.length > 80 ? `${p.slice(0, 77).trimEnd()}…` : p;
}

/**
 * Stage 0–1: the item's own prompt. Stage 2: application. Stage 3: reconstruction
 * (process items keep their mode). Stage 4: connection to another concept.
 */
export function promptFor(item: RetrievalItem): { mode: RetrievalMode; prompt: string; expectsFree: boolean } {
  const stage = Math.max(0, Math.min(MAX_STAGE, Math.floor(item.stage)));
  if (stage <= 1) return { mode: item.mode, prompt: item.prompt, expectsFree: FREE_MODES.has(item.mode) };
  const topic = topicOf(item);
  const isConcept = Boolean(item.conceptId && conceptContent(item.conceptId));
  const subject = isConcept ? topic : `what this asks (“${topic}”)`;
  if (stage === 2) {
    return { mode: "application", prompt: `Apply ${subject} to a situation of your own. Describe the situation, then show how it applies and what it predicts.`, expectsFree: true };
  }
  if (stage === 3) {
    const mode: RetrievalMode = item.mode === "process" ? "process" : "explanation";
    const verb = mode === "process" ? "Reconstruct the steps of" : "Reconstruct";
    return { mode, prompt: `${verb} ${subject} from memory, as you would explain it to someone meeting it for the first time. Do not look anything up.`, expectsFree: true };
  }
  return { mode: "connection", prompt: `Connect ${subject} to another concept you know. Name the second concept, state the link precisely, and say where the two differ.`, expectsFree: true };
}

/* ------------------------------------------------------------------ */
/* Persistence                                                          */
/* ------------------------------------------------------------------ */

export type NewRetrievalItem = Omit<RetrievalItem, keyof Entity | "ease" | "intervalDays" | "due" | "reps" | "lapses" | "stage"> & { due?: string };

export async function createRetrievalItem(db: StudyDatabase, input: NewRetrievalItem, now: Date = new Date()): Promise<RetrievalItem> {
  const { due, ...rest } = input;
  const firstInterval = BASE_INTERVALS[0]!;
  const item = stamp<RetrievalItem>(db.userId, "ret", {
    ...rest,
    ease: 2.5,
    intervalDays: firstInterval,
    due: due ?? new Date(now.getTime() + firstInterval * DAY_MS).toISOString(),
    reps: 0,
    lapses: 0,
    stage: 0,
  });
  await db.store("retrieval_items").put(item);
  return item;
}

/** A recall prompt that asks for an explanation is a concept item; a name, number or date is a fact. */
function modeForRecallPrompt(prompt: string, answer: string): RetrievalMode {
  const p = prompt.trim().toLowerCase();
  if (/^(why|how|explain|describe|what does .* mean|what is the difference|distinguish|in what sense|what happens)/.test(p)) return "concept";
  return answer.trim().split(/\s+/).length > 12 ? "concept" : "fact";
}

/**
 * Idempotent per concept: one fact/concept item per recall prompt plus one free-recall item
 * carrying the concept's key points. Returns the existing items when the concept already has any.
 */
export async function createRetrievalForConcept(db: StudyDatabase, concept: Concept, source: SourceRef, now: Date = new Date()): Promise<RetrievalItem[]> {
  const store = db.store("retrieval_items");
  const existing = await store.list({ where: { conceptId: concept.id } as Partial<RetrievalItem> });
  if (existing.length) return existing.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const created: RetrievalItem[] = [];
  for (const rp of concept.recallPrompts) {
    created.push(
      await createRetrievalItem(
        db,
        { mode: modeForRecallPrompt(rp.prompt, rp.answer), prompt: rp.prompt, answer: rp.answer, accept: rp.accept, conceptId: concept.id, source, tags: concept.tags },
        now,
      ),
    );
  }
  created.push(
    await createRetrievalItem(
      db,
      {
        mode: "free_recall",
        prompt: `Recall everything you can about ${concept.title}: what it says, why it holds, and where it applies.`,
        answer: concept.summary,
        keyPoints: concept.keyPoints,
        conceptId: concept.id,
        source,
        tags: concept.tags,
      },
      now,
    ),
  );
  return created;
}

export async function dueRetrievals(db: StudyDatabase, now: Date = new Date(), limit?: number): Promise<RetrievalItem[]> {
  const all = await db.store("retrieval_items").list();
  const due = all.filter((i) => isDue(i, now)).sort((a, b) => a.due.localeCompare(b.due) || a.createdAt.localeCompare(b.createdAt));
  return limit === undefined ? due : due.slice(0, Math.max(0, limit));
}

export interface ReviewRetrievalInput {
  item: RetrievalItem;
  correct: boolean;
  /** 0..1 */
  score: number;
  confidence?: number;
  latencyMs?: number;
  response?: string;
  planItemId?: string;
}

/** Whole days since the previous review (or creation). */
export function delayDaysFor(item: Pick<RetrievalItem, "lastReviewedAt" | "createdAt">, now: Date = new Date()): number {
  const since = new Date(item.lastReviewedAt ?? item.createdAt).getTime();
  if (!Number.isFinite(since)) return 0;
  return Math.max(0, Math.round((now.getTime() - since) / DAY_MS));
}

/**
 * Writes the review, reschedules the item and — when the item belongs to a concept — records
 * concept evidence: "delayed" after at least a day, otherwise "recall".
 */
export async function reviewRetrieval(db: StudyDatabase, input: ReviewRetrievalInput, now: Date = new Date()): Promise<{ item: RetrievalItem; review: RetrievalReview }> {
  const score = Math.max(0, Math.min(1, input.score));
  const grade = gradeFrom({ correct: input.correct, score, latencyMs: input.latencyMs, confidence: input.confidence });
  const next = scheduleReview(input.item, { grade, confidence: input.confidence, latencyMs: input.latencyMs }, now);
  const delayDays = delayDaysFor(input.item, now);
  const offered = promptFor(input.item);
  const item: RetrievalItem = { ...input.item, ...next, lastReviewedAt: now.toISOString() };
  await db.store("retrieval_items").put(item);
  const review = stamp<RetrievalReview>(db.userId, "rrv", {
    itemId: item.id,
    conceptId: item.conceptId,
    grade,
    correct: input.correct,
    score,
    confidence: input.confidence,
    latencyMs: input.latencyMs,
    mode: offered.mode,
    intervalBefore: input.item.intervalDays,
    intervalAfter: next.intervalDays,
    delayDays,
    response: input.response,
    planItemId: input.planItemId,
  });
  review.createdAt = now.toISOString();
  review.updatedAt = review.createdAt;
  await db.store("retrieval_reviews").put(review);
  if (item.conceptId) {
    const concept = conceptContent(item.conceptId);
    await recordConceptEvidence(db, {
      conceptId: item.conceptId,
      kind: delayDays >= 1 ? "delayed" : "recall",
      score,
      correct: input.correct,
      difficulty: concept?.difficulty ?? 3,
      scaffolded: false,
      hintsUsed: 0,
      transfer: offered.mode === "connection" || offered.mode === "application" ? 1 : 0,
      confidence: input.confidence,
      latencyMs: input.latencyMs,
      source: { kind: "retrieval", refId: item.id, label: item.prompt },
      planItemId: input.planItemId,
      at: now.toISOString(),
    });
  }
  return { item, review };
}

const BUCKET_SEVERITY: Record<RetentionBucket, number> = { due: 3, fragile: 2, decaying: 1, durable: 0 };

export interface RetentionSummary {
  total: number;
  durable: number;
  fragile: number;
  decaying: number;
  due: number;
  /** Delayed reviews (≥ 1 day) that failed in the last seven days. */
  failedDelayed7d: number;
  /** Worst bucket per concept. */
  byConcept: Map<string, RetentionBucket>;
}

export async function retentionSummary(db: StudyDatabase, now: Date = new Date()): Promise<RetentionSummary> {
  const items = (await db.store("retrieval_items").list()).filter((i) => !i.suspended);
  const summary: RetentionSummary = { total: items.length, durable: 0, fragile: 0, decaying: 0, due: 0, failedDelayed7d: 0, byConcept: new Map() };
  for (const item of items) {
    const bucket = retentionBucket(item, now);
    summary[bucket] += 1;
    if (item.conceptId) {
      const current = summary.byConcept.get(item.conceptId);
      if (!current || BUCKET_SEVERITY[bucket] > BUCKET_SEVERITY[current]) summary.byConcept.set(item.conceptId, bucket);
    }
  }
  const since = now.getTime() - 7 * DAY_MS;
  const reviews = await db.store("retrieval_reviews").list({ filter: (r) => new Date(r.createdAt).getTime() >= since && new Date(r.createdAt).getTime() <= now.getTime() });
  summary.failedDelayed7d = reviews.filter((r) => r.delayDays >= 1 && !r.correct).length;
  return summary;
}
