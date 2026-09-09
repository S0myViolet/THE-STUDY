/**
 * THE STUDY V2 — exams (PROVE).
 *
 * An exam form is assembled from the seeded item bank before the learner sees a
 * question, frozen into `ExamAttempt.form` and never touched again: no item is
 * generated or replaced after the attempt starts. Assembly is deterministic for a
 * seed, balances difficulty across each section's band, and excludes items the
 * learner has already met in earlier attempts of the same kind. Scoring is pure and
 * reproducible from the attempt alone; `finishExam` is the only write path for exam
 * evidence.
 *
 * Contract: docs/V2.md §5 "exams.ts".
 */
import type { UserProfile } from "@/lib/domain/types";
import type { StudyDatabase } from "@/lib/persistence/store";
import { nowIso, stamp } from "@/lib/persistence/store";
import { createRng } from "@/lib/scene/rng";
import type { Rng } from "@/lib/scene/types";
import { calibrationVerdict, meanBrier } from "@/lib/scoring/calibration";
import { EXAM_BLUEPRINTS, PASSAGES, PRACTICE_ITEMS, WRITING_PROMPTS, conceptContent, skeletonConcept } from "@/content/v2";
import { SKILL_AREAS, type Difficulty, type DomainId, type ExamBlueprint, type ExamKind, type ExamSectionBlueprint, type ItemLevel, type Passage, type PracticeItem, type SkillArea, type TransferLevel, type WritingPrompt } from "./content-types";
import type { ConceptMastery, ExamAttempt, ExamForm, ExamItemSnapshot, ExamResponse, ExamResult, ExamSectionResult, SourceKind } from "./types";
import { classifyError, gradeItem } from "./grading";
import { recordError } from "./errors";
import { masteryMap as loadMasteryMap, recordConceptEvidence, type ConceptEvidenceInput } from "./mastery";
import { responseToText } from "./practice";

const DAY_MS = 86_400_000;

/* ------------------------------------------------------------------ */
/* Small helpers shared with the planner                                */
/* ------------------------------------------------------------------ */

/** FNV-1a over a string, as a non-negative 32-bit seed. Deterministic across runtimes. */
export function hashSeed(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export const SKILL_LABELS: Record<SkillArea, string> = {
  mathematics: "Mathematics",
  probability: "Probability",
  statistics: "Statistics",
  logic: "Logic",
  causal_reasoning: "Causal reasoning",
  decision_making: "Decision making",
  argument_analysis: "Argument analysis",
  writing: "Writing",
  speaking: "Speaking",
  memory: "Memory",
  research: "Research",
  programming: "Programming",
  questioning: "Questioning",
  strategic_reasoning: "Strategic reasoning",
  knowledge: "Knowledge",
  reading: "Reading",
};

export function skillLabel(skill: string): string {
  return SKILL_LABELS[skill as SkillArea] ?? skill.replace(/_/g, " ");
}

/** The concept's title from the curriculum or the skeleton, else a readable form of the id. */
export function conceptTitle(conceptId: string): string {
  return conceptContent(conceptId)?.title ?? skeletonConcept(conceptId)?.title ?? conceptId.replace(/[-_]+/g, " ");
}

export function conceptDomain(conceptId: string): DomainId | undefined {
  return conceptContent(conceptId)?.domainId ?? skeletonConcept(conceptId)?.domainId;
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/* ------------------------------------------------------------------ */
/* Bank and blueprints                                                  */
/* ------------------------------------------------------------------ */

/** Seeded items that may appear on an exam: `examEligible` or `examOnly`. */
export function itemBank(bank: PracticeItem[] = PRACTICE_ITEMS): PracticeItem[] {
  return bank.filter((i) => i.examEligible || i.examOnly);
}

export const EXAM_KIND_LABELS: Record<ExamKind, string> = {
  weekly: "Weekly check",
  monthly: "Monthly exam",
  quarterly: "Quarterly exam",
  baseline: "Baseline",
  transfer: "Transfer challenge",
};

interface DefaultShape {
  minutes: number;
  perSection: number;
  maxSections: number;
  band: [Difficulty, Difficulty];
  levels?: ItemLevel[];
  summary: string;
}

const DEFAULT_SHAPES: Record<ExamKind, DefaultShape> = {
  weekly: { minutes: 20, perSection: 4, maxSections: 3, band: [1, 4], summary: "A short unseen check across the skills you have been training this week. No hints, no notes." },
  monthly: { minutes: 45, perSection: 5, maxSections: 5, band: [1, 5], summary: "A cumulative exam over everything studied so far, with harder items than the weekly check." },
  quarterly: { minutes: 75, perSection: 6, maxSections: 6, band: [2, 6], summary: "A long cumulative exam reaching into transfer and synthesis." },
  baseline: { minutes: 30, perSection: 4, maxSections: 6, band: [1, 4], summary: "A first measurement of where you stand. It sets a provisional starting profile; nothing here is final." },
  transfer: { minutes: 30, perSection: 3, maxSections: 3, band: [3, 6], levels: ["advanced", "transfer", "synthesis"], summary: "Unfamiliar problems that reward recognising a known structure in a new setting." },
};

function matchesFilter(item: PracticeItem, f: ExamSectionBlueprint["filter"]): boolean {
  if (f.skills?.length && !f.skills.includes(item.skill)) return false;
  if (f.levels?.length && !f.levels.includes(item.level)) return false;
  if (f.formats?.length && !f.formats.includes(item.format)) return false;
  if (f.concepts?.length && !item.concepts.some((c) => f.concepts!.includes(c))) return false;
  if (f.domains?.length) {
    const domains = item.concepts.map(conceptDomain).filter((d): d is DomainId => !!d);
    if (!domains.some((d) => f.domains!.includes(d))) return false;
  }
  if (f.tags?.length && !(item.tags ?? []).some((t) => f.tags!.includes(t))) return false;
  if (f.passage !== undefined && Boolean(item.passageId) !== f.passage) return false;
  return true;
}

function inBand(item: PracticeItem, band: [Difficulty, Difficulty]): boolean {
  return item.difficulty >= band[0] && item.difficulty <= band[1];
}

/**
 * A blueprint built from whatever the bank holds: one section per skill area with
 * enough eligible items in the band, in `SKILL_AREAS` order, weighted equally. Used
 * when the content has no authored blueprint for a kind, so exams work as soon as
 * any domain has items.
 */
export function defaultBlueprint(kind: ExamKind, bank: PracticeItem[] = itemBank()): ExamBlueprint {
  const shape = DEFAULT_SHAPES[kind];
  const sections: ExamSectionBlueprint[] = [];
  for (const skill of SKILL_AREAS) {
    if (sections.length >= shape.maxSections) break;
    const filter: ExamSectionBlueprint["filter"] = shape.levels ? { skills: [skill], levels: shape.levels } : { skills: [skill] };
    const available = bank.filter((i) => matchesFilter(i, filter) && inBand(i, shape.band)).length;
    if (available < shape.perSection) continue;
    sections.push({ id: `${kind}-${skill}`, title: SKILL_LABELS[skill], weight: 1, itemCount: shape.perSection, filter, band: shape.band });
  }
  for (const s of sections) s.weight = sections.length ? round3(1 / sections.length) : 1;
  return { id: `bp-${kind}-default`, kind, title: EXAM_KIND_LABELS[kind], minutes: shape.minutes, summary: shape.summary, sections, askConfidence: true };
}

/** The authored blueprint for a kind, or the default built from the bank. */
export function blueprintFor(kind: ExamKind, blueprints: ExamBlueprint[] = EXAM_BLUEPRINTS): ExamBlueprint {
  return blueprints.find((b) => b.kind === kind) ?? defaultBlueprint(kind);
}

export function blueprintById(id: string, blueprints: ExamBlueprint[] = EXAM_BLUEPRINTS): ExamBlueprint | undefined {
  const authored = blueprints.find((b) => b.id === id);
  if (authored) return authored;
  const m = id.match(/^bp-(weekly|monthly|quarterly|baseline|transfer)-default$/);
  return m ? defaultBlueprint(m[1] as ExamKind) : undefined;
}

/* ------------------------------------------------------------------ */
/* Assembly                                                             */
/* ------------------------------------------------------------------ */

export interface AssembleOptions {
  exclude: Set<string>;
  seed: number;
  masteryMap?: Map<string, ConceptMastery>;
  passages: Passage[];
  writingPrompts: WritingPrompt[];
}

/** The frozen copy of an item: what is needed to show, answer and grade it, nothing that helps. */
export function snapshotItem(item: PracticeItem): ExamItemSnapshot {
  const s: ExamItemSnapshot = {
    id: item.id,
    skill: item.skill,
    subskill: item.subskill,
    concepts: [...item.concepts],
    level: item.level,
    difficulty: item.difficulty,
    format: item.format,
    prompt: item.prompt,
    solution: item.solution,
  };
  if (item.options) s.options = [...item.options];
  if (item.answer !== undefined) s.answer = Array.isArray(item.answer) ? [...item.answer] : item.answer;
  if (item.tolerance !== undefined) s.tolerance = item.tolerance;
  if (item.relativeTolerance !== undefined) s.relativeTolerance = item.relativeTolerance;
  if (item.accept) s.accept = [...item.accept];
  if (item.keyPoints) s.keyPoints = [...item.keyPoints];
  if (item.passageId) s.passageId = item.passageId;
  return s;
}

/**
 * Picks `count` items spread across the difficulties of the band: candidates are
 * bucketed by difficulty, each bucket is shuffled by the seed (items on concepts the
 * learner has studied come first when a mastery map is given), and buckets are drawn
 * round-robin from the easiest up until the count is met.
 */
function balancedSample(candidates: PracticeItem[], count: number, band: [Difficulty, Difficulty], rng: Rng, masteryMap?: Map<string, ConceptMastery>): PracticeItem[] {
  const buckets = new Map<number, PracticeItem[]>();
  for (let d = band[0]; d <= band[1]; d++) buckets.set(d, []);
  for (const c of [...candidates].sort((a, b) => a.id.localeCompare(b.id))) buckets.get(c.difficulty)?.push(c);
  const studied = (i: PracticeItem) => {
    if (!masteryMap) return 0;
    const m = masteryMap.get(i.concepts[0] ?? "");
    return m && m.evidenceCount > 0 ? 0 : 1;
  };
  const ordered: PracticeItem[][] = [];
  for (let d = band[0]; d <= band[1]; d++) {
    const shuffled = rng.shuffle(buckets.get(d) ?? []);
    if (masteryMap) shuffled.sort((a, b) => studied(a) - studied(b));
    ordered.push(shuffled);
  }
  const out: PracticeItem[] = [];
  while (out.length < count) {
    let took = false;
    for (const bucket of ordered) {
      if (out.length >= count) break;
      const next = bucket.shift();
      if (next) {
        out.push(next);
        took = true;
      }
    }
    if (!took) break;
  }
  return out;
}

function pickWritingPrompt(level: number, prompts: WritingPrompt[], rng: Rng): WritingPrompt | undefined {
  if (!prompts.length) return undefined;
  const sorted = [...prompts].sort((a, b) => a.id.localeCompare(b.id));
  const exact = sorted.filter((p) => p.level === level);
  if (exact.length) return rng.pick(exact);
  let best = sorted[0]!;
  for (const p of sorted) if (Math.abs(p.level - level) < Math.abs(best.level - level)) best = p;
  return rng.pick(sorted.filter((p) => p.level === best.level));
}

/**
 * Builds a form for a blueprint. Per section: filter and band, exclude ids already used
 * (across previous attempts and earlier sections of this form), balanced seeded
 * sampling, and a snapshot of every item and every passage it references. Writing
 * sections take a prompt of the requested level (or the nearest). Throws when any
 * section cannot be filled, so a short form is never served silently.
 */
export function assembleForm(bp: ExamBlueprint, bank: PracticeItem[], o: AssembleOptions): ExamForm {
  const rng = createRng(o.seed >>> 0);
  const used = new Set(o.exclude);
  const items: ExamForm["items"] = {};
  const passages: ExamForm["passages"] = {};
  const sections: ExamForm["sections"] = [];
  const passageById = new Map(o.passages.map((p) => [p.id, p]));

  for (const s of bp.sections) {
    if (s.writingPromptLevel !== undefined) {
      const prompt = pickWritingPrompt(s.writingPromptLevel, o.writingPrompts, rng);
      if (!prompt) throw new Error(`Exam section "${s.title}" needs a level ${s.writingPromptLevel} writing prompt but none is available`);
      sections.push({ id: s.id, title: s.title, weight: s.weight, itemIds: [], writingPromptId: prompt.id });
      continue;
    }
    const candidates = bank.filter((i) => !used.has(i.id) && inBand(i, s.band) && matchesFilter(i, s.filter));
    if (candidates.length < s.itemCount) throw new Error(`Exam section "${s.title}" needs ${s.itemCount} items but only ${candidates.length} unused ${candidates.length === 1 ? "item is" : "items are"} available`);
    const chosen = balancedSample(candidates, s.itemCount, s.band, rng, o.masteryMap);
    if (chosen.length < s.itemCount) throw new Error(`Exam section "${s.title}" could not be filled`);
    for (const c of chosen) {
      used.add(c.id);
      items[c.id] = snapshotItem(c);
      if (c.passageId && !passages[c.passageId]) {
        const p = passageById.get(c.passageId);
        if (!p) throw new Error(`Item ${c.id} references passage ${c.passageId}, which is not available`);
        passages[c.passageId] = { title: p.title, text: p.text };
      }
    }
    const section: ExamForm["sections"][number] = { id: s.id, title: s.title, weight: s.weight, itemIds: chosen.map((c) => c.id) };
    if (s.memoryStudy) section.memoryStudy = { itemIds: [...s.memoryStudy.itemIds], studySeconds: s.memoryStudy.studySeconds };
    sections.push(section);
  }
  return { sections, items, passages, seed: o.seed >>> 0 };
}

/* ------------------------------------------------------------------ */
/* Starting and answering                                               */
/* ------------------------------------------------------------------ */

export interface StartExamOptions {
  planItemId?: string;
  seed?: number;
  /** ISO timestamp of the start; defaults to now. Used by seeding and tests. */
  at?: string;
  /** Restrict the bank (tests); defaults to the seeded exam bank. */
  bank?: PracticeItem[];
}

/**
 * Assembles and persists the form before returning, so nothing can change once the
 * learner sees a question. Items used by previous attempts of the same kind are
 * excluded; when that leaves too few, only the most recent attempt's items are excluded.
 */
export async function startExam(db: StudyDatabase, blueprint: ExamBlueprint, o: StartExamOptions = {}): Promise<ExamAttempt> {
  const at = o.at ?? nowIso();
  const now = new Date(at);
  const previous = (await db.store("exam_attempts").list({ where: { kind: blueprint.kind } })).sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  const seed = o.seed ?? hashSeed(`${db.userId}:${blueprint.id}:${previous.length}:${at}`);
  const mm = await loadMasteryMap(db, now);
  const bank = itemBank(o.bank ?? PRACTICE_ITEMS);
  const options = { seed, masteryMap: mm, passages: PASSAGES, writingPrompts: WRITING_PROMPTS };

  const allUsed = new Set<string>();
  for (const p of previous) for (const id of Object.keys(p.form.items)) allUsed.add(id);
  let form: ExamForm;
  try {
    form = assembleForm(blueprint, bank, { ...options, exclude: allUsed });
  } catch (error) {
    const latest = previous[previous.length - 1];
    if (!latest) throw error;
    form = assembleForm(blueprint, bank, { ...options, exclude: new Set(Object.keys(latest.form.items)) });
  }

  const attempt = stamp<ExamAttempt>(db.userId, "exam", {
    blueprintId: blueprint.id,
    kind: blueprint.kind,
    title: blueprint.title,
    status: "in_progress",
    startedAt: at,
    timeLimitMinutes: blueprint.minutes,
    form,
    responses: {},
    sectionIndex: 0,
  });
  if (o.planItemId) attempt.planItemId = o.planItemId;
  attempt.createdAt = at;
  attempt.updatedAt = at;
  await db.store("exam_attempts").put(attempt);
  return attempt;
}

/**
 * Records one response. Gradeable items are graded deterministically against the frozen
 * snapshot; free items without key points and writing responses keep a supplied score.
 * The form itself is never touched.
 */
export async function answerExamItem(db: StudyDatabase, attemptId: string, itemId: string, r: ExamResponse): Promise<void> {
  const store = db.store("exam_attempts");
  const attempt = await store.get(attemptId);
  if (!attempt) throw new Error(`Unknown exam attempt ${attemptId}`);
  if (attempt.status !== "in_progress") throw new Error("This exam is no longer in progress");
  const snapshot = attempt.form.items[itemId];
  const isWriting = attempt.form.sections.some((s) => s.writingPromptId === itemId);
  if (!snapshot && !isWriting) throw new Error(`Item ${itemId} is not part of this exam`);

  const response: ExamResponse = { response: r.response, timeMs: Math.max(0, Math.floor(r.timeMs || 0)) };
  if (r.confidence !== undefined) response.confidence = clamp01(r.confidence);
  const graded = snapshot ? gradeItem(snapshot, r.response) : { gradeable: false, score: 0 };
  if (graded.gradeable) {
    response.correct = graded.correct;
    response.score = graded.score;
  } else if (r.score !== undefined) {
    response.score = clamp01(r.score);
    response.correct = r.correct ?? response.score >= 0.6;
  }
  await store.update(attemptId, { responses: { ...attempt.responses, [itemId]: response } });
}

/** Moves the learner to the next section (bounded by the form). */
export async function advanceExamSection(db: StudyDatabase, attemptId: string): Promise<ExamAttempt | undefined> {
  const store = db.store("exam_attempts");
  const attempt = await store.get(attemptId);
  if (!attempt || attempt.status !== "in_progress") return attempt;
  const next = Math.min(attempt.form.sections.length - 1, attempt.sectionIndex + 1);
  return store.update(attemptId, { sectionIndex: next });
}

/* ------------------------------------------------------------------ */
/* Scoring                                                              */
/* ------------------------------------------------------------------ */

function gradedResponse(item: ExamItemSnapshot, resp: ExamResponse | undefined): { score: number; correct?: boolean; gradeable: boolean } {
  if (!resp) return { score: 0, correct: false, gradeable: true };
  if (resp.score !== undefined) return { score: clamp01(resp.score), correct: resp.correct ?? resp.score >= 0.7, gradeable: true };
  const g = gradeItem(item, resp.response);
  return g.gradeable ? { score: g.score, correct: g.correct, gradeable: true } : { score: 0, gradeable: false };
}

function transferOfLevel(level: ItemLevel): TransferLevel {
  if (level === "transfer") return 2;
  if (level === "synthesis") return 3;
  return 0;
}

interface Acc {
  sum: number;
  n: number;
  correct: number;
}

function add(map: Record<string, Acc>, key: string, score: number, correct: boolean | undefined): void {
  const acc = map[key] ?? (map[key] = { sum: 0, n: 0, correct: 0 });
  acc.sum += score;
  acc.n += 1;
  if (correct) acc.correct += 1;
}

function finish(map: Record<string, Acc>): Record<string, { score: number; n: number }> {
  const out: Record<string, { score: number; n: number }> = {};
  for (const key of Object.keys(map).sort()) {
    const acc = map[key]!;
    out[key] = { score: round3(acc.n ? acc.sum / acc.n : 0), n: acc.n };
  }
  return out;
}

/**
 * Deterministic score from the attempt alone. Items use their stored grade or are graded
 * against the snapshot; unanswered items score zero. Writing sections use the supplied
 * `writingOverall` (or the response's score). Calibration comes from confidence-rated
 * items via the shared calibration maths.
 */
export function scoreForm(attempt: ExamAttempt, o: { writingOverall?: number } = {}): ExamResult {
  const sections: ExamSectionResult[] = [];
  const bySkill: Record<string, Acc> = {};
  const byConcept: Record<string, Acc> = {};
  const calibration: { confidence: number; correct: boolean }[] = [];
  let writingOverall: number | undefined;

  for (const s of attempt.form.sections) {
    if (s.writingPromptId) {
      const supplied = o.writingOverall ?? attempt.responses[s.writingPromptId]?.score;
      const score = supplied === undefined ? 0 : clamp01(supplied);
      if (supplied !== undefined) writingOverall = round3(score);
      sections.push({ id: s.id, title: s.title, weight: s.weight, score: round3(score), correct: score >= 0.6 ? 1 : 0, count: 1 });
      add(bySkill, "writing", score, score >= 0.6);
      continue;
    }
    let sum = 0;
    let correctCount = 0;
    for (const itemId of s.itemIds) {
      const item = attempt.form.items[itemId];
      if (!item) continue;
      const g = gradedResponse(item, attempt.responses[itemId]);
      sum += g.score;
      if (g.correct) correctCount += 1;
      add(bySkill, item.skill, g.score, g.correct);
      for (const c of item.concepts) add(byConcept, c, g.score, g.correct);
      const resp = attempt.responses[itemId];
      if (resp?.confidence !== undefined && g.correct !== undefined && g.gradeable) calibration.push({ confidence: resp.confidence, correct: g.correct });
    }
    const count = s.itemIds.length;
    sections.push({ id: s.id, title: s.title, weight: s.weight, score: round3(count ? sum / count : 0), correct: correctCount, count });
  }

  const totalWeight = sections.reduce((acc, s) => acc + s.weight, 0);
  const total = round3(totalWeight ? sections.reduce((acc, s) => acc + s.weight * s.score, 0) / totalWeight : 0);

  const result: ExamResult = { total, sections, bySkill: finish(bySkill), byConcept: finish(byConcept), interventions: [] };
  if (writingOverall !== undefined) result.writingOverall = writingOverall;

  if (calibration.length) {
    const verdict = calibrationVerdict(calibration);
    const brierMean = meanBrier(calibration.map((c) => ({ probability: c.confidence, outcome: c.correct }))) ?? 0;
    result.calibration = { brier: round3(brierMean), verdict: verdict.verdict, n: calibration.length };
  }

  result.interventions = interventionsFor(result, bySkill, byConcept);
  return result;
}

function interventionsFor(result: ExamResult, bySkill: Record<string, Acc>, byConcept: Record<string, Acc>): string[] {
  const out: string[] = [];
  for (const skill of Object.keys(bySkill).sort()) {
    const acc = bySkill[skill]!;
    if (skill !== "writing" && acc.n >= 3 && acc.sum / acc.n < 0.5) out.push(`Practise ${skillLabel(skill).toLowerCase()}: ${acc.correct} of ${acc.n} correct on this exam.`);
  }
  const weakConcepts = Object.keys(byConcept)
    .filter((c) => byConcept[c]!.n >= 2 && byConcept[c]!.sum / byConcept[c]!.n < 0.5)
    .sort((a, b) => byConcept[a]!.sum / byConcept[a]!.n - byConcept[b]!.sum / byConcept[b]!.n || a.localeCompare(b))
    .slice(0, 3);
  for (const c of weakConcepts) out.push(`Revisit ${conceptTitle(c)}: ${byConcept[c]!.correct} of ${byConcept[c]!.n} items on it were right.`);
  if (result.calibration?.verdict === "overconfident") out.push("Your stated confidence ran ahead of your accuracy; before committing, name one way the answer could be wrong.");
  if (result.calibration?.verdict === "underconfident") out.push("You were right more often than your confidence suggested; where the method is sound, commit at the confidence it warrants.");
  if (result.writingOverall !== undefined && result.writingOverall < 0.5) out.push(`The writing section scored ${Math.round(result.writingOverall * 100)} %; work through the writing levels before the next exam.`);
  return out;
}

/** Skill-by-skill comparison with an earlier result; a move of 0.1 or more counts as a change. */
export function compareResults(current: ExamResult, previous: ExamResult, previousId: string): ExamResult["comparedTo"] {
  const improved: string[] = [];
  const flat: string[] = [];
  const declined: string[] = [];
  for (const skill of Object.keys(current.bySkill).sort()) {
    const before = previous.bySkill[skill];
    if (!before || !before.n || !current.bySkill[skill]!.n) continue;
    const diff = current.bySkill[skill]!.score - before.score;
    if (diff >= 0.1) improved.push(skill);
    else if (diff <= -0.1) declined.push(skill);
    else flat.push(skill);
  }
  return { attemptId: previousId, delta: round3(current.total - previous.total), improved, flat, declined };
}

/* ------------------------------------------------------------------ */
/* Finishing                                                            */
/* ------------------------------------------------------------------ */

export interface FinishExamOptions {
  writingOverall?: number;
  /** ISO timestamp of completion; defaults to now. Used by seeding and tests. */
  at?: string;
}

/**
 * Scores the attempt, compares it with the previous completed attempt of the same kind
 * (the baseline stands in for a first monthly or quarterly exam), records concept
 * evidence of kind "exam" for every answered gradeable item (source "baseline" for the
 * baseline), files error records for wrong answers, and stores the result. Idempotent:
 * a completed attempt is returned unchanged.
 */
export async function finishExam(db: StudyDatabase, attemptId: string, o: FinishExamOptions = {}): Promise<ExamAttempt> {
  const store = db.store("exam_attempts");
  const attempt = await store.get(attemptId);
  if (!attempt) throw new Error(`Unknown exam attempt ${attemptId}`);
  if (attempt.status === "completed" && attempt.result) return attempt;
  const at = o.at ?? nowIso();

  const result = scoreForm(attempt, o.writingOverall === undefined ? {} : { writingOverall: o.writingOverall });

  const completed = (await store.list({ where: { status: "completed" } })).filter((p) => p.id !== attempt.id && p.result && (p.completedAt ?? p.startedAt) <= at);
  const byRecency = (a: ExamAttempt, b: ExamAttempt) => (b.completedAt ?? "").localeCompare(a.completedAt ?? "");
  let previous = completed.filter((p) => p.kind === attempt.kind).sort(byRecency)[0];
  if (!previous && (attempt.kind === "monthly" || attempt.kind === "quarterly")) previous = completed.filter((p) => p.kind === "baseline").sort(byRecency)[0];
  if (previous?.result) result.comparedTo = compareResults(result, previous.result, previous.id);

  const sourceKind: SourceKind = attempt.kind === "baseline" ? "baseline" : "exam";
  for (const s of attempt.form.sections) {
    if (s.writingPromptId) continue;
    for (const itemId of s.itemIds) {
      const item = attempt.form.items[itemId];
      const resp = attempt.responses[itemId];
      if (!item || !resp) continue;
      const g = gradedResponse(item, resp);
      if (!g.gradeable) continue;
      const transfer = transferOfLevel(item.level);
      const source = { kind: sourceKind, refId: attempt.id, label: item.id };
      const concepts = item.concepts.filter((id, k, arr) => id && arr.indexOf(id) === k);
      for (let k = 0; k < concepts.length; k++) {
        const input: ConceptEvidenceInput = {
          conceptId: concepts[k]!,
          kind: "exam",
          score: g.score,
          difficulty: k === 0 ? item.difficulty : (Math.max(1, item.difficulty - 1) as Difficulty),
          scaffolded: k > 0,
          hintsUsed: 0,
          transfer,
          latencyMs: resp.timeMs,
          source,
          at,
        };
        if (g.correct !== undefined) input.correct = g.correct;
        if (resp.confidence !== undefined) input.confidence = resp.confidence;
        if (attempt.planItemId) input.planItemId = attempt.planItemId;
        await recordConceptEvidence(db, input);
      }
      if (g.correct === false) {
        const category = classifyError(item, resp.response, { correct: false }, resp.confidence, transfer);
        if (category) {
          await recordError(
            db,
            { category, skill: item.skill, concepts: [...item.concepts], question: item.prompt, response: responseToText(resp.response, item), correctReasoning: item.solution, confidence: resp.confidence, source },
            new Date(at),
          );
        }
      }
    }
  }

  const done: ExamAttempt = { ...attempt, status: "completed", completedAt: at, result };
  await store.put(done);
  return done;
}

/** Marks an in-progress attempt abandoned; no evidence is written. */
export async function abandonExam(db: StudyDatabase, attemptId: string): Promise<ExamAttempt | undefined> {
  const store = db.store("exam_attempts");
  const attempt = await store.get(attemptId);
  if (!attempt || attempt.status !== "in_progress") return attempt;
  return store.update(attemptId, { status: "abandoned" });
}

/* ------------------------------------------------------------------ */
/* Cadence                                                              */
/* ------------------------------------------------------------------ */

export const EXAM_PERIOD_DAYS: Record<"weekly" | "monthly" | "quarterly", number> = { weekly: 7, monthly: 30, quarterly: 90 };

export interface ExamDue {
  kind: ExamKind;
  blueprintId: string;
  dueAt: string;
  overdue: boolean;
}

/**
 * The next scheduled exam: weekly every 7 days, monthly every 30, quarterly every 90,
 * counted from `profile.v2.startedAt`. For each kind the due date is the first schedule
 * point after the last completed attempt of that kind (or the first point when there is
 * none); the kind with the earliest due date wins, longer periods first on a tie.
 */
export async function nextExamDue(db: StudyDatabase, profile: Pick<UserProfile, "v2"> | null | undefined, now: Date = new Date()): Promise<ExamDue | undefined> {
  const startedAt = profile?.v2?.startedAt;
  if (!startedAt) return undefined;
  const start = new Date(startedAt).getTime();
  if (!Number.isFinite(start)) return undefined;
  const completed = await db.store("exam_attempts").list({ where: { status: "completed" } });
  const kinds: ("weekly" | "monthly" | "quarterly")[] = ["quarterly", "monthly", "weekly"];
  const candidates: ExamDue[] = [];
  for (const kind of kinds) {
    const period = EXAM_PERIOD_DAYS[kind] * DAY_MS;
    const last = completed.filter((a) => a.kind === kind && a.completedAt).sort((a, b) => b.completedAt!.localeCompare(a.completedAt!))[0];
    let dueAt = start + period;
    if (last) {
      const lastT = new Date(last.completedAt!).getTime();
      const k = Math.floor((lastT - start) / period) + 1;
      dueAt = start + Math.max(1, k) * period;
      if (dueAt <= lastT) dueAt += period;
    }
    candidates.push({ kind, blueprintId: blueprintFor(kind).id, dueAt: new Date(dueAt).toISOString(), overdue: dueAt <= now.getTime() });
  }
  candidates.sort((a, b) => a.dueAt.localeCompare(b.dueAt) || kinds.indexOf(a.kind as "weekly") - kinds.indexOf(b.kind as "weekly"));
  return candidates[0];
}

/* ------------------------------------------------------------------ */
/* The baseline                                                         */
/* ------------------------------------------------------------------ */

export interface StartingProfile {
  skills: { skill: SkillArea; score: number; n: number; band: "provisional" }[];
  calibration?: ExamResult["calibration"];
  note: string;
}

export const STARTING_PROFILE_NOTE = "This profile is provisional. It rests on one short measurement; the estimates it seeds move only as real evidence arrives, and a week of study will say more than this exam did.";

/** The provisional starting profile a completed baseline gives. */
export function startingProfile(attempt: ExamAttempt): StartingProfile {
  const result = attempt.result ?? scoreForm(attempt);
  const skills = Object.keys(result.bySkill)
    .sort()
    .map((skill) => ({ skill: skill as SkillArea, score: result.bySkill[skill]!.score, n: result.bySkill[skill]!.n, band: "provisional" as const }));
  const out: StartingProfile = { skills, note: STARTING_PROFILE_NOTE };
  if (result.calibration) out.calibration = result.calibration;
  return out;
}
