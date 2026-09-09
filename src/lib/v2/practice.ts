/**
 * THE STUDY V2 — the practice write path and item selection.
 *
 * `submitPractice` is the only way a practice answer reaches the database. It grades
 * the response (deterministically, or with a supplied model evaluation for free items),
 * writes the attempt, records concept evidence for every concept the item names,
 * files an error record when the answer was wrong, and logs assistance events so the
 * independence rate can be computed later. Nothing else writes `practice_attempts`.
 *
 * `pickItems` chooses items for a session: never exam-only, adapted to the mastery of
 * each item's primary concept, avoiding items attempted in the last seven days, and
 * deterministic for a seed.
 *
 * Contract: docs/V2.md §5 "grading.ts and practice.ts".
 */
import type { StudyDatabase } from "@/lib/persistence/store";
import { stamp } from "@/lib/persistence/store";
import { PRACTICE_ITEMS } from "@/content/v2";
import { createRng } from "@/lib/scene/rng";
import type { Difficulty, ErrorCategory, ItemLevel, PracticeItem, SkillArea, TransferLevel } from "./content-types";
import type { AssistanceEvent, ConceptMastery, PracticeAttempt, PracticeContext, PracticeEvaluation, SourceKind, SourceRef } from "./types";
import { classifyError, evidenceKindFor, gradeItem, type GradeResult, type GradeableItem } from "./grading";
import { recordError } from "./errors";
import { PRIOR, masteryMap as loadMasteryMap, recordConceptEvidenceMany, type ConceptEvidenceInput } from "./mastery";

const DAY_MS = 86_400_000;

/** Items attempted within this many days are avoided by `pickItems`. */
export const RECENT_ATTEMPT_DAYS = 7;

/** Free answers count as correct at this key-point coverage (or model score). */
export const FREE_CORRECT_THRESHOLD = 0.6;

/** When the solution was revealed before submitting, evidence is capped here so it never counts as a success. */
export const REVEALED_SCORE_CAP = 0.5;

/* ------------------------------------------------------------------ */
/* Difficulty adaptation                                                */
/* ------------------------------------------------------------------ */

/**
 * Highest difficulty offered for a concept at a given estimate:
 * below 0.4 → 3, below 0.65 → 5, otherwise anything.
 */
export function difficultyCapFor(estimate: number): Difficulty {
  if (estimate < 0.4) return 3;
  if (estimate < 0.65) return 5;
  return 8;
}

/* ------------------------------------------------------------------ */
/* submitPractice                                                       */
/* ------------------------------------------------------------------ */

export interface SubmitPracticeInput {
  item: GradeableItem;
  response: unknown;
  /** 0..1, stated before submitting. */
  confidence?: number;
  hintsUsed: number;
  solutionRevealed: boolean;
  /** Retries before this final submission. */
  retries: number;
  timeMs: number;
  context: PracticeContext;
  /** Exam attempt, lesson session, transfer case, retrieval item… */
  contextRef?: string;
  planItemId?: string;
  /**
   * A model evaluation. For free items its `score` (0..1) replaces the deterministic grade;
   * its `errorCategory` replaces the deterministic classification when present.
   */
  evaluation?: PracticeEvaluation & { score?: number; errorCategory?: ErrorCategory };
  /**
   * Scaffolding (worked example, guided-practice scaffold text) was visible before the answer.
   * Defaults to `solutionRevealed || retries > 0`.
   */
  scaffolded?: boolean;
  /** ISO timestamp of the submission; defaults to now. Used by seeding and tests. */
  at?: string;
}

export interface SubmitPracticeResult {
  attempt: PracticeAttempt;
  correct?: boolean;
  /** 0..1 */
  score: number;
  errorCategory?: ErrorCategory;
  /** Final mastery row for each concept the item evidences, primary first. */
  mastery: ConceptMastery[];
  /** The deterministic grade, including covered/missed key points for free items. */
  grade: GradeResult;
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
}

function transferOf(item: GradeableItem): TransferLevel {
  return "transfer" in item && typeof item.transfer === "number" ? item.transfer : 0;
}

/** The learner's response as text, for the error library. */
export function responseToText(response: unknown, item?: GradeableItem): string {
  if (response === null || response === undefined) return "";
  if (typeof response === "string") return response;
  const options = item?.options ?? [];
  const optionText = (n: number) => (Number.isInteger(n) && options[n] !== undefined ? options[n]! : String(n));
  if (typeof response === "number") return optionText(response);
  if (typeof response === "boolean") return String(response);
  if (Array.isArray(response)) return response.map((r) => (typeof r === "number" ? optionText(r) : responseToText(r))).join("; ");
  if (typeof response === "object" && "text" in response && typeof (response as { text: unknown }).text === "string") return (response as { text: string }).text;
  try {
    return JSON.stringify(response);
  } catch {
    return String(response);
  }
}

/** Source kind for evidence, errors and assistance produced in a practice context. */
export function sourceKindFor(context: PracticeContext): SourceKind {
  switch (context) {
    case "exam":
      return "exam";
    case "baseline":
      return "baseline";
    case "transfer":
      return "transfer_case";
    case "lesson":
      return "lesson";
    case "retrieval":
      return "retrieval";
    default:
      return "practice";
  }
}

/**
 * Applies the grading policy: the deterministic grade, unless the item is free and a model
 * score was supplied. Returns `gradeable: false` only when nothing can grade the response.
 */
export function resolveGrade(item: GradeableItem, response: unknown, evaluation?: SubmitPracticeInput["evaluation"]): GradeResult {
  const deterministic = gradeItem(item, response);
  if (item.format === "free" && evaluation && typeof evaluation.score === "number" && Number.isFinite(evaluation.score)) {
    const score = Math.round(clamp01(evaluation.score) * 1000) / 1000;
    return {
      gradeable: true,
      correct: score >= FREE_CORRECT_THRESHOLD,
      score,
      covered: evaluation.covered ?? deterministic.covered,
      missed: evaluation.missed ?? deterministic.missed,
    };
  }
  return deterministic;
}

/**
 * The single write path for practice. Order of writes: attempt → concept evidence (through
 * mastery) → error record when wrong → assistance events. Free items without key points and
 * without a model score are stored as attempts but produce no evidence, since there is no signal.
 */
export async function submitPractice(db: StudyDatabase, input: SubmitPracticeInput): Promise<SubmitPracticeResult> {
  const { item, context } = input;
  const at = input.at ?? new Date().toISOString();
  const hintsUsed = Math.max(0, Math.floor(input.hintsUsed || 0));
  const retries = Math.max(0, Math.floor(input.retries || 0));
  const scaffolded = input.scaffolded ?? (input.solutionRevealed || retries > 0);
  const transfer = transferOf(item);
  const confidence = input.confidence === undefined ? undefined : clamp01(input.confidence);

  const grade = resolveGrade(item, input.response, input.evaluation);
  const score = grade.gradeable ? grade.score : 0;
  const correct = grade.gradeable ? grade.correct : undefined;

  const errorCategory = grade.gradeable ? input.evaluation?.errorCategory ?? classifyError(item, input.response, { correct }, confidence, transfer) : undefined;

  const evaluation: PracticeEvaluation | undefined = input.evaluation
    ? { feedback: input.evaluation.feedback, strengths: input.evaluation.strengths, improvements: input.evaluation.improvements, covered: input.evaluation.covered ?? grade.covered, missed: input.evaluation.missed ?? grade.missed, aiEvaluated: input.evaluation.aiEvaluated }
    : grade.covered || grade.missed
      ? { feedback: feedbackForCoverage(grade), covered: grade.covered, missed: grade.missed, aiEvaluated: false }
      : undefined;

  const attempt = stamp<PracticeAttempt>(db.userId, "pa", {
    itemId: item.id,
    skill: item.skill,
    subskill: item.subskill,
    concepts: [...item.concepts],
    level: item.level,
    difficulty: item.difficulty,
    format: item.format,
    response: input.response,
    correct,
    score,
    confidence,
    hintsUsed,
    solutionRevealed: input.solutionRevealed,
    retries,
    timeMs: Math.max(0, Math.floor(input.timeMs || 0)),
    errorCategory,
    evaluation,
    context,
    contextRef: input.contextRef,
    planItemId: input.planItemId,
  });
  attempt.createdAt = at;
  attempt.updatedAt = at;
  await db.store("practice_attempts").put(attempt);

  const source: SourceRef = { kind: sourceKindFor(context), refId: attempt.id, label: item.id };

  let mastery: ConceptMastery[] = [];
  if (grade.gradeable) {
    const kind = evidenceKindFor(context, hintsUsed, scaffolded, transfer);
    const evidenceScore = input.solutionRevealed ? Math.min(score, REVEALED_SCORE_CAP) : score;
    const concepts = item.concepts.filter((id, k, arr) => id && arr.indexOf(id) === k);
    const inputs: ConceptEvidenceInput[] = concepts.map((conceptId, k) => ({
      conceptId,
      kind,
      score: evidenceScore,
      correct,
      difficulty: k === 0 ? item.difficulty : (Math.max(1, item.difficulty - 1) as Difficulty),
      scaffolded: k === 0 ? scaffolded : true,
      hintsUsed,
      transfer,
      confidence,
      latencyMs: attempt.timeMs,
      source,
      planItemId: input.planItemId,
      at,
    }));
    mastery = await recordConceptEvidenceMany(db, inputs);
  }

  if (correct === false && errorCategory) {
    await recordError(
      db,
      {
        category: errorCategory,
        skill: item.skill,
        concepts: [...item.concepts],
        question: item.prompt,
        response: responseToText(input.response, item),
        correctReasoning: item.solution,
        confidence,
        source,
      },
      new Date(at),
    );
  }

  const events: AssistanceEvent[] = [];
  const conceptIds = item.concepts.length ? [...item.concepts] : undefined;
  if (hintsUsed === 0 && !input.solutionRevealed) events.push(assistance(db.userId, "independent_attempt", source, conceptIds, at));
  for (let k = 0; k < hintsUsed; k++) events.push(assistance(db.userId, "hint", source, conceptIds, at));
  if (input.solutionRevealed) events.push(assistance(db.userId, "solution_reveal", source, conceptIds, at));
  if (events.length) await db.store("assistance_events").putMany(events);

  return { attempt, correct, score, errorCategory, mastery, grade };
}

function assistance(userId: string, kind: AssistanceEvent["kind"], source: SourceRef, conceptIds: string[] | undefined, at: string): AssistanceEvent {
  const e = stamp<AssistanceEvent>(userId, "asst", { kind, source, conceptIds });
  e.createdAt = at;
  e.updatedAt = at;
  return e;
}

/** One calm sentence naming what a free answer covered and what it missed. */
export function feedbackForCoverage(grade: Pick<GradeResult, "covered" | "missed">): string {
  const covered = grade.covered ?? [];
  const missed = grade.missed ?? [];
  const label = (kp: string) => kp.split("|")[0]!.trim();
  if (!missed.length) return covered.length ? "Your answer covers every key point." : "Nothing to grade against.";
  if (!covered.length) return `Your answer does not yet reach the key points: ${missed.map(label).join("; ")}.`;
  return `Covered: ${covered.map(label).join("; ")}. Not yet addressed: ${missed.map(label).join("; ")}.`;
}

/* ------------------------------------------------------------------ */
/* pickItems                                                            */
/* ------------------------------------------------------------------ */

export interface PickItemsOptions {
  skill?: SkillArea;
  /** Items evidencing any of these concepts. */
  concepts?: string[];
  level?: ItemLevel;
  count: number;
  exclude?: string[];
  masteryMap?: Map<string, ConceptMastery>;
  seed?: number;
  /** Only items never attempted. */
  unseenOnly?: boolean;
  /** Restrict the bank (tests, generated items); defaults to the seeded bank. */
  bank?: PracticeItem[];
  now?: Date;
}

export interface PickState {
  /** Item ids attempted within the last `RECENT_ATTEMPT_DAYS`. */
  recent: Set<string>;
  /** Item ids ever attempted. */
  attempted: Set<string>;
  estimateOf: (conceptId: string) => number;
}

function seededOrder<T extends { id: string }>(xs: T[], seed: number): T[] {
  const sorted = [...xs].sort((a, b) => a.id.localeCompare(b.id));
  return createRng(seed).shuffle(sorted);
}

/**
 * Greedy selection that spreads a session across primary concepts: take one item per
 * concept in shuffled order before taking a second item on any concept.
 */
function spread(items: PracticeItem[], count: number, taken: Set<string>): PracticeItem[] {
  const out: PracticeItem[] = [];
  const remaining = items.filter((i) => !taken.has(i.id));
  while (out.length < count && remaining.length) {
    const seen = new Set<string>();
    for (let k = 0; k < remaining.length && out.length < count; ) {
      const item = remaining[k]!;
      const primary = item.concepts[0] ?? item.id;
      if (seen.has(primary)) {
        k += 1;
        continue;
      }
      seen.add(primary);
      out.push(item);
      taken.add(item.id);
      remaining.splice(k, 1);
    }
  }
  return out;
}

/**
 * Pure selection over a bank. Tiers, in order: items within the difficulty cap of their
 * primary concept that were not attempted recently; items above the cap (easiest first) not
 * attempted recently; and, unless `unseenOnly`, recently attempted items as a last resort.
 * Each tier is shuffled by the seed, so the result is deterministic for (bank, state, seed).
 */
export function selectItems(bank: PracticeItem[], o: Omit<PickItemsOptions, "masteryMap" | "bank" | "now">, state: PickState): PracticeItem[] {
  const count = Math.max(0, Math.floor(o.count));
  if (!count) return [];
  const exclude = new Set(o.exclude ?? []);
  const concepts = o.concepts?.length ? new Set(o.concepts) : undefined;
  const eligible = bank.filter((i) => {
    if (i.examOnly || exclude.has(i.id)) return false;
    if (o.skill && i.skill !== o.skill) return false;
    if (o.level && i.level !== o.level) return false;
    if (concepts && !i.concepts.some((c) => concepts.has(c))) return false;
    if (o.unseenOnly && state.attempted.has(i.id)) return false;
    return true;
  });
  const capOf = (i: PracticeItem) => difficultyCapFor(state.estimateOf(i.concepts[0] ?? ""));
  const fresh = eligible.filter((i) => !state.recent.has(i.id));
  const seed = o.seed ?? 1;
  const withinCap = seededOrder(
    fresh.filter((i) => i.difficulty <= capOf(i)),
    seed,
  );
  const aboveCap = seededOrder(
    fresh.filter((i) => i.difficulty > capOf(i)),
    seed + 1,
  ).sort((a, b) => a.difficulty - b.difficulty);
  const recent = o.unseenOnly ? [] : seededOrder(eligible.filter((i) => state.recent.has(i.id)), seed + 2);

  const taken = new Set<string>();
  const out = spread(withinCap, count, taken);
  if (out.length < count) out.push(...spread(aboveCap, count - out.length, taken));
  if (out.length < count) out.push(...spread(recent, count - out.length, taken));
  return out;
}

/**
 * Items for a session. Difficulty adapts to the mastery of each item's primary concept
 * (estimate < 0.4 → difficulty ≤ 3; < 0.65 → ≤ 5; otherwise any); items attempted within
 * the last seven days are avoided; exam-only items never appear; deterministic for a seed.
 */
export async function pickItems(db: StudyDatabase, o: PickItemsOptions): Promise<PracticeItem[]> {
  const now = o.now ?? new Date();
  const map = o.masteryMap ?? (await loadMasteryMap(db, now));
  const since = now.getTime() - RECENT_ATTEMPT_DAYS * DAY_MS;
  const attempts = await db.store("practice_attempts").list();
  const recent = new Set<string>();
  const attempted = new Set<string>();
  for (const a of attempts) {
    attempted.add(a.itemId);
    const t = new Date(a.createdAt).getTime();
    if (t >= since && t <= now.getTime()) recent.add(a.itemId);
  }
  const state: PickState = { recent, attempted, estimateOf: (id) => map.get(id)?.estimate ?? PRIOR };
  return selectItems(o.bank ?? PRACTICE_ITEMS, o, state);
}

/** Recent attempts on an item (newest first), for retry and feedback screens. */
export async function attemptsForItem(db: StudyDatabase, itemId: string, limit = 10): Promise<PracticeAttempt[]> {
  return db.store("practice_attempts").list({ where: { itemId } as Partial<PracticeAttempt>, orderBy: "createdAt", desc: true, limit });
}
