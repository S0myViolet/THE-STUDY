/**
 * THE STUDY V2 — importing what V1 left behind.
 *
 * V1 memory items are the one kind of V1 state that carries over as working
 * material: a fact, concept or archive recall prompt is still worth retrieving
 * in V2. Everything else V1 recorded (skill evidence, estimates, red threads)
 * stays in its own collections and is shown in Review only as history — nothing
 * here ever writes concept mastery.
 */
import type { MemoryItem, UserProfile } from "@/lib/domain/types";
import type { CollectionName } from "@/lib/persistence/collections";
import type { StudyDatabase } from "@/lib/persistence/store";
import { nowIso } from "@/lib/persistence/store";
import type { RetrievalItem, RetrievalMode } from "./types";

/** V1 collections whose rows show the person actually used V1. */
export const V1_DATA_COLLECTIONS: CollectionName[] = ["memory_items", "skill_evidence", "case_attempts", "archive_progress", "investigations", "daily_sessions"];

/** V1 memory kinds that become V2 retrieval items, and the mode each takes. */
export const V1_IMPORTABLE_KINDS: Partial<Record<MemoryItem["kind"], RetrievalMode>> = {
  fact: "fact",
  concept: "concept",
  archive: "fact",
};

/** Retrieval item id derived from a V1 memory item id, so re-running the import can never duplicate. */
export function importedRetrievalId(memoryItemId: string): string {
  return `ri_v1_${memoryItemId}`;
}

/** True when any V1 collection that evidences use has at least one row. */
export async function hasV1Data(db: StudyDatabase): Promise<boolean> {
  for (const c of V1_DATA_COLLECTIONS) {
    if ((await db.store(c).count()) > 0) return true;
  }
  return false;
}

/** The V2 retrieval item a V1 memory item becomes. Pure; scheduling state is copied, the stage starts at 0. */
export function retrievalItemFromV1(item: MemoryItem, userId: string, at: string = nowIso()): RetrievalItem | undefined {
  const mode = V1_IMPORTABLE_KINDS[item.kind];
  if (!mode) return undefined;
  const out: RetrievalItem = {
    id: importedRetrievalId(item.id),
    userId,
    createdAt: item.createdAt || at,
    updatedAt: at,
    mode,
    prompt: item.prompt,
    answer: item.answer,
    source: { kind: "v1", refId: item.id, label: item.sourceRef?.label },
    ease: Number.isFinite(item.ease) && item.ease > 0 ? item.ease : 2.5,
    intervalDays: Number.isFinite(item.intervalDays) && item.intervalDays >= 0 ? item.intervalDays : 0,
    due: item.due || at,
    reps: Math.max(0, Math.floor(item.reps || 0)),
    lapses: Math.max(0, Math.floor(item.lapses || 0)),
    stage: 0,
  };
  if (item.accept?.length) out.accept = [...item.accept];
  if (item.lastReviewedAt) out.lastReviewedAt = item.lastReviewedAt;
  if (item.suspended) out.suspended = true;
  if (item.tags?.length) out.tags = [...item.tags];
  if (!out.source.label) delete out.source.label;
  return out;
}

/**
 * Imports V1 memory items of kind fact / concept / archive as V2 retrieval
 * items. Idempotent: an item already imported (by id or by `source.refId`) is
 * left alone, so this can run on every visit to the entrance without harm.
 * Stamps `profile.v2.v1ImportedAt` when the profile has a V2 section.
 */
export async function importV1(db: StudyDatabase, profile: UserProfile): Promise<{ retrievalItems: number }> {
  const memory = await db.store("memory_items").list({ orderBy: "createdAt" });
  const candidates = memory.filter((m) => V1_IMPORTABLE_KINDS[m.kind] !== undefined);

  const retrieval = db.store("retrieval_items");
  const existing = await retrieval.list({ filter: (r) => r.source?.kind === "v1" });
  const already = new Set<string>();
  for (const r of existing) {
    already.add(r.id);
    if (r.source?.refId) already.add(importedRetrievalId(r.source.refId));
  }

  const at = nowIso();
  const fresh: RetrievalItem[] = [];
  for (const m of candidates) {
    const id = importedRetrievalId(m.id);
    if (already.has(id)) continue;
    const item = retrievalItemFromV1(m, db.userId, at);
    if (!item) continue;
    already.add(id);
    fresh.push(item);
  }
  if (fresh.length) await retrieval.putMany(fresh);

  if (profile.v2 && profile.id) {
    const current = (await db.store("profiles").get(profile.id)) ?? profile;
    const v2 = current.v2 ?? profile.v2;
    if (!v2.v1ImportedAt || fresh.length) {
      await db.store("profiles").update(current.id, { v2: { ...v2, v1ImportedAt: at } });
    }
  }
  return { retrievalItems: fresh.length };
}
