/**
 * THE STUDY V2 — concept mastery.
 *
 * Each concept keeps a smoothed estimate in [0, 1] that moves only on evidence.
 * New evidence pulls the estimate toward the observed score with a gain that
 * shrinks as evidence mass accumulates, so one item never causes a large move
 * (lineage: src/lib/scoring/estimates.ts). Concept state is derived from the
 * bookkeeping, never set by hand, and changes only when evidence arrives or
 * when time passes without any (decay).
 *
 * Every learning event reaches `concept_mastery` through `recordConceptEvidence`
 * (or a write path that calls it); nothing else writes the collection.
 *
 * Contract: docs/V2.md §5 "mastery.ts".
 */
import type { StudyDatabase } from "@/lib/persistence/store";
import { newId, nowIso } from "@/lib/persistence/store";
import type { Difficulty, TransferLevel } from "./content-types";
import type { ConceptEvidence, ConceptMastery, ConceptState, EvidenceConfidence, EvidenceKind, SourceRef } from "./types";

/* ------------------------------------------------------------------ */
/* Weights                                                              */
/* ------------------------------------------------------------------ */

export const EVIDENCE_WEIGHT: Record<EvidenceKind, number> = {
  recognition: 0.4,
  checkpoint: 0.5,
  recall: 0.6,
  guided: 0.6,
  explain: 0.8,
  independent: 1.0,
  delayed: 1.3,
  application: 1.4,
  project: 1.4,
  transfer: 1.5,
  exam: 1.6,
};

/** Beyond this mass the estimate becomes slow to move. */
export const MASS_CAP = 40;
/** Estimate before any evidence. */
export const PRIOR = 0.35;
/** Weight the prior carries against the first pieces of evidence. */
export const PRIOR_MASS = 2;
/** No single piece of evidence may count for more than half of the belief (caps one-item moves at 0.325). */
export const MAX_GAIN = 0.5;
/** Score at or above which a piece of evidence counts as a success. */
export const SUCCESS_THRESHOLD = 0.7;
/** History points kept per concept. */
export const HISTORY_CAP = 120;
/** Days of delay beyond which extra delay earns no extra weight. */
export const DELAY_CAP_DAYS = 30;

const DAY_MS = 86_400_000;

/** 1 → 0.6, 8 → 1.8. */
export function difficultyWeight(d: Difficulty): number {
  return 0.6 + ((d - 1) / 7) * 1.2;
}

/**
 * kind × difficulty × (scaffolded ? 0.7 : 1) × max(0.5, 1 − 0.15·hints)
 *   × (1 + min(delayDays, 30)/30 × 0.5) × (1 + transfer × 0.2)
 */
export function evidenceWeight(e: { kind: EvidenceKind; difficulty: Difficulty; scaffolded: boolean; hintsUsed: number; delayDays: number; transfer: TransferLevel }): number {
  const hints = Math.max(0, e.hintsUsed);
  const delay = Math.max(0, Math.min(DELAY_CAP_DAYS, e.delayDays));
  const w =
    EVIDENCE_WEIGHT[e.kind] *
    difficultyWeight(e.difficulty) *
    (e.scaffolded ? 0.7 : 1) *
    Math.max(0.5, 1 - 0.15 * hints) *
    (1 + (delay / DELAY_CAP_DAYS) * 0.5) *
    (1 + e.transfer * 0.2);
  return Math.round(w * 1000) / 1000;
}

/* ------------------------------------------------------------------ */
/* Pure state                                                           */
/* ------------------------------------------------------------------ */

export function emptyMastery(userId: string, conceptId: string, at: string = nowIso()): ConceptMastery {
  return {
    id: newId("cm"),
    userId,
    createdAt: at,
    updatedAt: at,
    conceptId,
    state: "not_started",
    estimate: PRIOR,
    evidenceConfidence: "low",
    evidenceMass: 0,
    evidenceCount: 0,
    counts: {},
    successes: {},
    longestSuccessfulDelayDays: 0,
    consecutiveFailures: 0,
    trend: "flat",
    history: [],
  };
}

export function isSuccess(score: number): boolean {
  return score >= SUCCESS_THRESHOLD;
}

function daysBetween(from: string | undefined, to: Date | string): number {
  if (!from) return 0;
  const a = new Date(from).getTime();
  const b = typeof to === "string" ? new Date(to).getTime() : to.getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return Math.max(0, Math.round(((b - a) / DAY_MS) * 100) / 100);
}

/** Days from the last evidence to `at`; 0 when there is none (or the clock went backwards). */
export function delayDaysFor(m: Pick<ConceptMastery, "lastEvidenceAt">, at: string): number {
  return daysBetween(m.lastEvidenceAt, at);
}

function trendFor(history: { estimate: number }[]): ConceptMastery["trend"] {
  const window = history.slice(-10);
  if (window.length < 6) return "flat";
  const recent = window.slice(-5);
  const prior = window.slice(0, -5);
  const mean = (xs: { estimate: number }[]) => xs.reduce((s, x) => s + x.estimate, 0) / xs.length;
  const delta = mean(recent) - mean(prior);
  if (delta > 0.03) return "up";
  if (delta < -0.03) return "down";
  return "flat";
}

/**
 * Folds one piece of evidence into a mastery row (pure; returns a new row).
 * Shrinkage: gain = w / (PRIOR_MASS + min(mass, MASS_CAP) + w), capped at MAX_GAIN.
 * The row's `state` is left for `deriveState`; `recordConceptEvidence` keeps it in sync.
 */
export function foldEvidence(m: ConceptMastery, e: ConceptEvidence, now: Date = new Date()): ConceptMastery {
  const at = e.createdAt || now.toISOString();
  const score = Math.max(0, Math.min(1, Number.isFinite(e.score) ? e.score : 0));
  const w = Math.max(0, Number.isFinite(e.weight) ? e.weight : 0);
  const success = isSuccess(score);

  const mass = Math.min(Math.max(0, m.evidenceMass), MASS_CAP);
  const gain = Math.min(MAX_GAIN, w / (PRIOR_MASS + mass + w));
  const base = m.evidenceCount === 0 ? PRIOR : m.estimate;
  const estimate = Math.round((base + gain * (score - base)) * 10000) / 10000;

  const counts = { ...m.counts, [e.kind]: (m.counts[e.kind] ?? 0) + 1 };
  const successes = success ? { ...m.successes, [e.kind]: (m.successes[e.kind] ?? 0) + 1 } : { ...m.successes };
  const history = [...m.history, { at, estimate }].slice(-HISTORY_CAP);
  const delayed = e.delayDays >= 1 && success;

  const next: ConceptMastery = {
    ...m,
    estimate,
    evidenceMass: Math.min(m.evidenceMass + w, MASS_CAP + 10),
    evidenceCount: m.evidenceCount + 1,
    counts,
    successes,
    firstExposedAt: m.firstExposedAt ?? at,
    lastEvidenceAt: at,
    longestSuccessfulDelayDays: delayed ? Math.max(m.longestSuccessfulDelayDays, e.delayDays) : m.longestSuccessfulDelayDays,
    consecutiveFailures: success ? 0 : m.consecutiveFailures + 1,
    trend: trendFor(history),
    history,
    updatedAt: at,
  };
  if (success) next.lastSuccessAt = at;
  if (delayed) next.lastDelayedSuccessAt = at;
  next.evidenceConfidence = evidenceConfidenceFor(next);
  return next;
}

/**
 * low: mass < 6 or count < 3; high: mass ≥ 20, count ≥ 8, at least two kinds, and at
 * least one delayed / transfer / exam / project success; otherwise medium.
 */
export function evidenceConfidenceFor(m: ConceptMastery): EvidenceConfidence {
  if (m.evidenceMass < 6 || m.evidenceCount < 3) return "low";
  const kinds = Object.entries(m.counts).filter(([, n]) => (n ?? 0) > 0).length;
  const strong = (m.successes.delayed ?? 0) + (m.successes.transfer ?? 0) + (m.successes.exam ?? 0) + (m.successes.project ?? 0);
  if (m.evidenceMass >= 20 && m.evidenceCount >= 8 && kinds >= 2 && strong >= 1) return "high";
  return "medium";
}

/**
 * The most recent delayed attempt failed. `lastDelayedSuccessAt` records the latest
 * success after a gap of a day or more, and `delayDays` is measured from the previous
 * evidence, so any evidence a day or more after that success was itself a delayed
 * attempt; if it had succeeded, `lastDelayedSuccessAt` would have moved forward.
 */
function lastDelayedAttemptFailed(m: ConceptMastery): boolean {
  if (!m.lastDelayedSuccessAt || !m.lastEvidenceAt) return false;
  return daysBetween(m.lastDelayedSuccessAt, m.lastEvidenceAt) >= 1;
}

/**
 * State from bookkeeping alone. Checked from the top:
 *   fragile     had a delayed success and (the last delayed attempt failed, or no evidence for
 *               more than max(21, 2 × longestSuccessfulDelayDays) days)
 *   durable     ≥ 2 delayed successes, longest successful delay ≥ 7 days, estimate ≥ 0.75, confidence not low
 *   applied     a transfer / project / application / exam success and estimate ≥ 0.6
 *   retained    a delayed success and estimate ≥ 0.6
 *   practicing  ≥ 2 guided/independent attempts with ≥ 1 success and estimate ≥ 0.5
 *   understood  a checkpoint or explain success, or estimate ≥ 0.5 with ≥ 2 pieces of evidence
 *   exposed     anything else with a row
 */
export function deriveState(m: ConceptMastery, now: Date = new Date()): ConceptState {
  if (m.evidenceCount === 0) return "exposed";
  const hadDelayedSuccess = !!m.lastDelayedSuccessAt;
  if (hadDelayedSuccess) {
    if (lastDelayedAttemptFailed(m)) return "fragile";
    const idleDays = daysBetween(m.lastEvidenceAt, now);
    if (idleDays > Math.max(21, 2 * m.longestSuccessfulDelayDays)) return "fragile";
  }
  const s = m.successes;
  const c = m.counts;
  if ((s.delayed ?? 0) >= 2 && m.longestSuccessfulDelayDays >= 7 && m.estimate >= 0.75 && evidenceConfidenceFor(m) !== "low") return "durable";
  const appliedSuccess = (s.transfer ?? 0) + (s.project ?? 0) + (s.application ?? 0) + (s.exam ?? 0) > 0;
  if (appliedSuccess && m.estimate >= 0.6) return "applied";
  if (hadDelayedSuccess && m.estimate >= 0.6) return "retained";
  const practiceAttempts = (c.guided ?? 0) + (c.independent ?? 0);
  const practiceSuccesses = (s.guided ?? 0) + (s.independent ?? 0);
  if (practiceAttempts >= 2 && practiceSuccesses >= 1 && m.estimate >= 0.5) return "practicing";
  if ((s.checkpoint ?? 0) + (s.explain ?? 0) > 0 || (m.estimate >= 0.5 && m.evidenceCount >= 2)) return "understood";
  return "exposed";
}

/* ------------------------------------------------------------------ */
/* Labels for the UI                                                    */
/* ------------------------------------------------------------------ */

export const STATE_META: Record<ConceptState, { label: string; description: string; tone: "neutral" | "brass" | "forest" | "wine" }> = {
  not_started: { label: "Not started", description: "No lesson, practice or retrieval yet.", tone: "neutral" },
  exposed: { label: "Exposed", description: "Seen in a lesson or reading; nothing shows it was understood.", tone: "neutral" },
  understood: { label: "Understood", description: "Explained back or passed a checkpoint; not yet practised independently.", tone: "brass" },
  practicing: { label: "Practising", description: "Solved problems on it, with at least one unaided success.", tone: "brass" },
  retained: { label: "Retained", description: "Recalled correctly after at least a day away.", tone: "forest" },
  applied: { label: "Applied", description: "Used successfully on a transfer problem, a project, an exam or in the world.", tone: "forest" },
  durable: { label: "Durable", description: "Recalled after a week or more, twice, with a strong estimate.", tone: "forest" },
  fragile: { label: "Fragile", description: "Once retained, but the last delayed recall failed or too much time has passed.", tone: "wine" },
};

export function stateLabel(state: ConceptState): string {
  return STATE_META[state].label;
}

/* ------------------------------------------------------------------ */
/* Database wrappers                                                    */
/* ------------------------------------------------------------------ */

export interface ConceptEvidenceInput {
  conceptId: string;
  kind: EvidenceKind;
  /** 0..1 */
  score: number;
  correct?: boolean;
  difficulty: Difficulty;
  scaffolded?: boolean;
  hintsUsed?: number;
  transfer?: TransferLevel;
  confidence?: number;
  latencyMs?: number;
  source: SourceRef;
  planItemId?: string;
  /** ISO timestamp of the event; defaults to now. */
  at?: string;
}

async function masteryRowFor(db: StudyDatabase, conceptId: string): Promise<ConceptMastery | undefined> {
  const rows = await db.store("concept_mastery").list({ where: { conceptId }, orderBy: "createdAt" });
  return rows[0];
}

/**
 * The single write path for concept evidence. Computes `delayDays` from the row's
 * `lastEvidenceAt` (0 when there is none), weights the evidence, folds it in and
 * re-derives the state, then writes both the evidence and the mastery row.
 */
export async function recordConceptEvidence(db: StudyDatabase, input: ConceptEvidenceInput): Promise<{ evidence: ConceptEvidence; mastery: ConceptMastery }> {
  const at = input.at ?? nowIso();
  const existing = await masteryRowFor(db, input.conceptId);
  const current = existing ?? emptyMastery(db.userId, input.conceptId, at);

  const scaffolded = input.scaffolded ?? false;
  const hintsUsed = Math.max(0, Math.floor(input.hintsUsed ?? 0));
  const transfer = input.transfer ?? 0;
  const delayDays = delayDaysFor(current, at);
  const score = Math.max(0, Math.min(1, Number.isFinite(input.score) ? input.score : 0));

  const evidence: ConceptEvidence = {
    id: newId("ce"),
    userId: db.userId,
    createdAt: at,
    updatedAt: at,
    conceptId: input.conceptId,
    kind: input.kind,
    score,
    difficulty: input.difficulty,
    scaffolded,
    hintsUsed,
    delayDays,
    transfer,
    weight: evidenceWeight({ kind: input.kind, difficulty: input.difficulty, scaffolded, hintsUsed, delayDays, transfer }),
    independent: !scaffolded && hintsUsed === 0,
    source: input.source,
  };
  if (input.correct !== undefined) evidence.correct = input.correct;
  if (input.confidence !== undefined) evidence.confidence = input.confidence;
  if (input.latencyMs !== undefined) evidence.latencyMs = input.latencyMs;
  if (input.planItemId !== undefined) evidence.planItemId = input.planItemId;

  const folded = foldEvidence(current, evidence, new Date(at));
  folded.state = deriveState(folded, new Date(at));

  await db.store("concept_evidence").put(evidence);
  const mastery = await db.store("concept_mastery").put(folded);
  return { evidence, mastery };
}

/** Records several pieces of evidence in order; returns the final mastery row per concept, in first-seen order. */
export async function recordConceptEvidenceMany(db: StudyDatabase, inputs: ConceptEvidenceInput[]): Promise<ConceptMastery[]> {
  const latest = new Map<string, ConceptMastery>();
  for (const input of inputs) {
    const { mastery } = await recordConceptEvidence(db, input);
    latest.set(input.conceptId, mastery);
  }
  return [...latest.values()];
}

/**
 * Creates rows in state "exposed" for concepts that have none, without touching the
 * estimate; existing rows are left alone. Exposure is not evidence, so nothing is
 * written to `concept_evidence` — the source is required so callers name where the
 * exposure happened, and the row's `firstExposedAt` is set to the time of the call.
 */
export async function markExposed(db: StudyDatabase, conceptIds: string[], source: SourceRef): Promise<void> {
  if (!source.kind || !source.refId) throw new Error("markExposed needs a source with a kind and a refId");
  const unique = conceptIds.filter((id, k, arr) => id && arr.indexOf(id) === k);
  if (!unique.length) return;
  const at = nowIso();
  const existing = new Set((await db.store("concept_mastery").list()).map((r) => r.conceptId));
  const fresh: ConceptMastery[] = [];
  for (const conceptId of unique) {
    if (existing.has(conceptId)) continue;
    const row = emptyMastery(db.userId, conceptId, at);
    row.state = "exposed";
    row.firstExposedAt = at;
    fresh.push(row);
  }
  if (fresh.length) await db.store("concept_mastery").putMany(fresh);
}

/**
 * All mastery rows keyed by concept id. State is re-derived for `now`, so decay shows
 * without a write; when two rows exist for one concept the earlier one wins.
 */
export async function masteryMap(db: StudyDatabase, now: Date = new Date()): Promise<Map<string, ConceptMastery>> {
  const rows = await db.store("concept_mastery").list({ orderBy: "createdAt" });
  const map = new Map<string, ConceptMastery>();
  for (const row of rows) {
    if (map.has(row.conceptId)) continue;
    const state = row.evidenceCount === 0 ? row.state : deriveState(row, now);
    map.set(row.conceptId, state === row.state ? row : { ...row, state });
  }
  return map;
}

/**
 * Rebuilds every mastery row by replaying `concept_evidence` in `createdAt` order,
 * using the delay and weight stored on each piece of evidence. Rows without evidence
 * keep their exposure; duplicate rows for one concept collapse into the earliest.
 */
export async function rebuildMastery(db: StudyDatabase, now: Date = new Date()): Promise<void> {
  const masteryStore = db.store("concept_mastery");
  const evidence = await db.store("concept_evidence").list();
  evidence.sort((a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  const rows = await masteryStore.list({ orderBy: "createdAt" });
  const keep = new Map<string, ConceptMastery>();
  const stale: string[] = [];
  for (const row of rows) {
    if (keep.has(row.conceptId)) stale.push(row.id);
    else keep.set(row.conceptId, row);
  }

  const byConcept = new Map<string, ConceptEvidence[]>();
  for (const e of evidence) {
    const list = byConcept.get(e.conceptId);
    if (list) list.push(e);
    else byConcept.set(e.conceptId, [e]);
  }

  const rebuilt: ConceptMastery[] = [];
  const conceptIds = new Set([...keep.keys(), ...byConcept.keys()]);
  for (const conceptId of conceptIds) {
    const previous = keep.get(conceptId);
    const events = byConcept.get(conceptId) ?? [];
    let row = emptyMastery(db.userId, conceptId, previous?.createdAt ?? events[0]?.createdAt ?? now.toISOString());
    if (previous) {
      row.id = previous.id;
      if (previous.firstExposedAt) row.firstExposedAt = previous.firstExposedAt;
      if (previous.evidenceCount === 0 && previous.state === "exposed") row.state = "exposed";
    }
    for (const e of events) row = foldEvidence(row, e, new Date(e.createdAt));
    if (events.length) row.state = deriveState(row, now);
    rebuilt.push(row);
  }

  for (const id of stale) await masteryStore.delete(id);
  if (rebuilt.length) await masteryStore.putMany(rebuilt);
}
