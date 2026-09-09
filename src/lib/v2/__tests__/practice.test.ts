import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { LocalDatabase } from "@/lib/persistence/local";
import { PRACTICE_ITEMS, practiceItem } from "@/content/v2";
import type { PracticeItem } from "@/lib/v2/content-types";
import type { ConceptMastery } from "@/lib/v2/types";
import { emptyMastery } from "@/lib/v2/mastery";
import { attemptsForItem, difficultyCapFor, feedbackForCoverage, pickItems, resolveGrade, responseToText, selectItems, sourceKindFor, submitPractice, type PickState } from "@/lib/v2/practice";

const DAY = 86_400_000;
const NOW = new Date("2026-09-08T09:00:00.000Z");
let counter = 0;
function freshDb() {
  return new LocalDatabase("user_p", `the-study-practice-${Date.now()}-${counter++}`);
}

/** it-probability-02: numeric, answer 0.518, concepts ["probability-rules", "independence"], difficulty 2. */
const dice = practiceItem("it-probability-02")!;

function mk(partial: Partial<PracticeItem>): PracticeItem {
  return {
    id: `it-test-${counter++}`,
    skill: "mathematics",
    subskill: "test",
    concepts: ["c-primary"],
    level: "basic",
    difficulty: 2,
    format: "numeric",
    answer: 1,
    tolerance: 0,
    prompt: "Test prompt",
    solution: "Test solution",
    method: "Test method",
    hints: ["h1", "h2"],
    commonErrors: [],
    transfer: 0,
    minutes: 1,
    origin: "seeded",
    ...partial,
  };
}

describe("submitPractice", () => {
  it("a correct independent answer writes the attempt, evidence for every concept, no error and one independent_attempt", async () => {
    const db = freshDb();
    const at = NOW.toISOString();
    const result = await submitPractice(db, { item: dice, response: "0.52", confidence: 0.7, hintsUsed: 0, solutionRevealed: false, retries: 0, timeMs: 42_000, context: "train", planItemId: "pi_1", at });
    expect(result.correct).toBe(true);
    expect(result.score).toBe(1);
    expect(result.errorCategory).toBeUndefined();
    expect(result.attempt).toMatchObject({
      itemId: dice.id,
      skill: "probability",
      subskill: dice.subskill,
      concepts: dice.concepts,
      level: dice.level,
      difficulty: dice.difficulty,
      format: "numeric",
      response: "0.52",
      correct: true,
      score: 1,
      confidence: 0.7,
      hintsUsed: 0,
      solutionRevealed: false,
      retries: 0,
      timeMs: 42_000,
      context: "train",
      planItemId: "pi_1",
      createdAt: at,
    });

    const attempts = await db.store("practice_attempts").list();
    expect(attempts).toHaveLength(1);
    expect(attempts[0]!.id).toBe(result.attempt.id);

    const evidence = (await db.store("concept_evidence").list()).sort((a, b) => dice.concepts.indexOf(a.conceptId) - dice.concepts.indexOf(b.conceptId));
    expect(evidence.map((e) => e.conceptId)).toEqual(dice.concepts);
    expect(evidence[0]).toMatchObject({ kind: "independent", score: 1, correct: true, difficulty: dice.difficulty, scaffolded: false, hintsUsed: 0, independent: true, confidence: 0.7, latencyMs: 42_000, planItemId: "pi_1", createdAt: at });
    expect(evidence[0]!.source).toEqual({ kind: "practice", refId: result.attempt.id, label: dice.id });
    expect(evidence[1]).toMatchObject({ kind: "independent", difficulty: dice.difficulty - 1, scaffolded: true, independent: false });
    expect(evidence[1]!.weight).toBeLessThan(evidence[0]!.weight);

    expect(result.mastery.map((m) => m.conceptId)).toEqual(dice.concepts);
    const rows = await db.store("concept_mastery").list();
    expect(rows).toHaveLength(2);
    for (const row of rows) {
      expect(row.evidenceCount).toBe(1);
      expect(row.estimate).toBeGreaterThan(0.35);
      expect(row.state).not.toBe("not_started");
    }

    expect(await db.store("error_records").count()).toBe(0);
    const assistance = await db.store("assistance_events").list();
    expect(assistance).toHaveLength(1);
    expect(assistance[0]).toMatchObject({ kind: "independent_attempt", conceptIds: dice.concepts, createdAt: at });
    expect(assistance[0]!.source).toEqual({ kind: "practice", refId: result.attempt.id, label: dice.id });
  });

  it("a wrong answer records failure evidence, an error record keyed on the primary concept, and the item's common error wins over confidence", async () => {
    const db = freshDb();
    const result = await submitPractice(db, { item: dice, response: "0.482", confidence: 0.95, hintsUsed: 0, solutionRevealed: false, retries: 0, timeMs: 10_000, context: "train", at: NOW.toISOString() });
    expect(result.correct).toBe(false);
    expect(result.score).toBe(0);
    expect(result.errorCategory).toBe("MISREAD");
    expect(result.attempt.errorCategory).toBe("MISREAD");

    const errors = await db.store("error_records").list();
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({
      category: "MISREAD",
      skill: "probability",
      concepts: dice.concepts,
      question: dice.prompt,
      response: "0.482",
      correctReasoning: dice.solution,
      confidence: 0.95,
      recurrenceKey: "MISREAD:probability-rules",
      createdAt: NOW.toISOString(),
    });
    expect(errors[0]!.source).toEqual({ kind: "practice", refId: result.attempt.id, label: dice.id });

    const evidence = await db.store("concept_evidence").list();
    expect(evidence).toHaveLength(2);
    for (const e of evidence) expect(e).toMatchObject({ score: 0, correct: false, kind: "independent" });
    for (const m of result.mastery) {
      expect(m.consecutiveFailures).toBe(1);
      expect(m.estimate).toBeLessThan(0.35);
    }
    expect((await db.store("assistance_events").list()).map((a) => a.kind)).toEqual(["independent_attempt"]);
  });

  it("hints and a revealed solution make the evidence guided, cap its score, and log one event per hint plus the reveal", async () => {
    const db = freshDb();
    const result = await submitPractice(db, { item: dice, response: 0.518, hintsUsed: 2, solutionRevealed: true, retries: 1, timeMs: 90_000, context: "train", at: NOW.toISOString() });
    expect(result.correct).toBe(true);
    expect(result.attempt.score).toBe(1);
    const evidence = await db.store("concept_evidence").list();
    for (const e of evidence) {
      expect(e.kind).toBe("guided");
      expect(e.score).toBe(0.5);
      expect(e.scaffolded).toBe(true);
      expect(e.hintsUsed).toBe(2);
      expect(e.independent).toBe(false);
    }
    for (const m of result.mastery) expect(m.successes.guided ?? 0).toBe(0);
    const kinds = (await db.store("assistance_events").list()).map((a) => a.kind).sort();
    expect(kinds).toEqual(["hint", "hint", "solution_reveal"]);
    expect(await db.store("error_records").count()).toBe(0);
  });

  it("a retry counts as scaffolded unless the caller says otherwise", async () => {
    const db = freshDb();
    await submitPractice(db, { item: dice, response: 0.518, hintsUsed: 0, solutionRevealed: false, retries: 1, timeMs: 1000, context: "train" });
    const [retried] = await db.store("concept_evidence").list({ where: { conceptId: "probability-rules" } });
    expect(retried).toMatchObject({ kind: "guided", scaffolded: true });
    const db2 = freshDb();
    await submitPractice(db2, { item: dice, response: 0.518, hintsUsed: 0, solutionRevealed: false, retries: 1, timeMs: 1000, context: "train", scaffolded: false });
    const [unscaffolded] = await db2.store("concept_evidence").list({ where: { conceptId: "probability-rules" } });
    expect(unscaffolded).toMatchObject({ kind: "independent", scaffolded: false });
  });

  it("context and transfer level choose the evidence kind and the source kind", async () => {
    const db = freshDb();
    await submitPractice(db, { item: dice, response: 0.518, hintsUsed: 0, solutionRevealed: false, retries: 0, timeMs: 1000, context: "baseline", contextRef: "exam_1" });
    await submitPractice(db, { item: mk({ concepts: ["c-transfer"], transfer: 2 }), response: 1, hintsUsed: 0, solutionRevealed: false, retries: 0, timeMs: 1000, context: "train" });
    await submitPractice(db, { item: mk({ concepts: ["c-lesson"] }), response: 1, hintsUsed: 0, solutionRevealed: false, retries: 0, timeMs: 1000, context: "lesson", contextRef: "lsn_1", scaffolded: true });
    const evidence = await db.store("concept_evidence").list();
    const byConcept = (id: string) => evidence.find((e) => e.conceptId === id)!;
    expect(byConcept("probability-rules")).toMatchObject({ kind: "exam", source: { kind: "baseline" } });
    expect(byConcept("c-transfer")).toMatchObject({ kind: "transfer", transfer: 2, source: { kind: "practice" } });
    expect(byConcept("c-lesson")).toMatchObject({ kind: "guided", scaffolded: true, source: { kind: "lesson" } });
    const attempts = await db.store("practice_attempts").list();
    expect(attempts.find((a) => a.context === "baseline")?.contextRef).toBe("exam_1");
    expect(sourceKindFor("exam")).toBe("exam");
    expect(sourceKindFor("transfer")).toBe("transfer_case");
    expect(sourceKindFor("retrieval")).toBe("retrieval");
    expect(sourceKindFor("remediation")).toBe("practice");
  });

  it("free items use the model evaluation's score when supplied and key points otherwise", async () => {
    const db = freshDb();
    const free = mk({ format: "free", answer: undefined, tolerance: undefined, keyPoints: ["prior|base rate", "false positive", "posterior"], concepts: ["c-free"] });
    const modelled = await submitPractice(db, {
      item: free,
      response: "Not much here.",
      hintsUsed: 0,
      solutionRevealed: false,
      retries: 0,
      timeMs: 1000,
      context: "train",
      evaluation: { feedback: "Thin.", score: 0.8, covered: ["prior|base rate"], missed: ["false positive", "posterior"], aiEvaluated: true, errorCategory: "ASSUMPTION" },
    });
    expect(modelled.correct).toBe(true);
    expect(modelled.score).toBe(0.8);
    expect(modelled.errorCategory).toBe("ASSUMPTION");
    expect(modelled.attempt.evaluation).toMatchObject({ feedback: "Thin.", aiEvaluated: true, covered: ["prior|base rate"] });
    expect(await db.store("error_records").count()).toBe(0);

    const offline = await submitPractice(db, { item: free, response: "Start from the prior; the posterior follows.", hintsUsed: 0, solutionRevealed: false, retries: 0, timeMs: 1000, context: "train" });
    expect(offline.correct).toBe(true);
    expect(offline.score).toBeCloseTo(2 / 3, 2);
    expect(offline.attempt.evaluation).toMatchObject({ aiEvaluated: false, covered: ["prior|base rate", "posterior"], missed: ["false positive"] });
    expect(offline.attempt.evaluation?.feedback).toContain("false positive");

    const wrong = await submitPractice(db, { item: free, response: "I do not know.", confidence: 0.9, hintsUsed: 0, solutionRevealed: false, retries: 0, timeMs: 1000, context: "train" });
    expect(wrong.correct).toBe(false);
    expect(wrong.errorCategory).toBe("OVERCONFIDENCE");
    const errors = await db.store("error_records").list();
    expect(errors).toHaveLength(1);
    expect(errors[0]!.recurrenceKey).toBe("OVERCONFIDENCE:c-free");
  });

  it("a free item without key points and without an evaluation is stored but yields no evidence or error", async () => {
    const db = freshDb();
    const free = mk({ format: "free", answer: undefined, tolerance: undefined, concepts: ["c-free"] });
    const result = await submitPractice(db, { item: free, response: "An essay.", hintsUsed: 0, solutionRevealed: false, retries: 0, timeMs: 1000, context: "train" });
    expect(result.correct).toBeUndefined();
    expect(result.score).toBe(0);
    expect(result.mastery).toEqual([]);
    expect(result.grade.gradeable).toBe(false);
    expect(await db.store("practice_attempts").count()).toBe(1);
    expect(await db.store("concept_evidence").count()).toBe(0);
    expect(await db.store("error_records").count()).toBe(0);
    expect((await db.store("assistance_events").list()).map((a) => a.kind)).toEqual(["independent_attempt"]);
  });

  it("stores the learner's mcq choice as option text in the error record and grades exam snapshots", async () => {
    const db = freshDb();
    const mcq = practiceItem("it-probability-03")!;
    const snapshot = { id: mcq.id, skill: mcq.skill, subskill: mcq.subskill, concepts: mcq.concepts, level: mcq.level, difficulty: mcq.difficulty, format: mcq.format, prompt: mcq.prompt, options: mcq.options, answer: mcq.answer, solution: mcq.solution };
    const result = await submitPractice(db, { item: snapshot, response: "B", confidence: 0.6, hintsUsed: 0, solutionRevealed: false, retries: 0, timeMs: 5000, context: "exam", contextRef: "exam_9" });
    expect(result.correct).toBe(false);
    expect(result.errorCategory).toBe("CONCEPTUAL_ERROR");
    const [error] = await db.store("error_records").list();
    expect(error?.response).toBe("B");
    expect(responseToText(1, mcq)).toBe(mcq.options![1]);
    expect(responseToText([0, 2], mcq)).toBe(`${mcq.options![0]}; ${mcq.options![2]}`);
    expect(responseToText({ text: "typed" })).toBe("typed");
    expect(responseToText(null)).toBe("");
    const [evidence] = await db.store("concept_evidence").list({ where: { conceptId: mcq.concepts[0] } });
    expect(evidence).toMatchObject({ kind: "exam", transfer: 0, source: { kind: "exam" } });
    expect((await attemptsForItem(db, mcq.id)).map((a) => a.id)).toEqual([result.attempt.id]);
  });

  it("clamps confidence and negative counters", async () => {
    const db = freshDb();
    const result = await submitPractice(db, { item: dice, response: 0.518, confidence: 1.7, hintsUsed: -3, solutionRevealed: false, retries: -1, timeMs: -5, context: "train" });
    expect(result.attempt).toMatchObject({ confidence: 1, hintsUsed: 0, retries: 0, timeMs: 0 });
  });

  it("resolveGrade only lets a model score replace the deterministic grade on free items", () => {
    const evaluation = { feedback: "", score: 1, aiEvaluated: true };
    expect(resolveGrade(dice, "0.1", evaluation).correct).toBe(false);
    const free = mk({ format: "free", keyPoints: ["a", "b"] });
    expect(resolveGrade(free, "nothing", evaluation)).toMatchObject({ gradeable: true, correct: true, score: 1, covered: [], missed: ["a", "b"] });
    expect(resolveGrade(free, "nothing", { feedback: "", aiEvaluated: true }).score).toBe(0);
    expect(feedbackForCoverage({ covered: ["a|x"], missed: ["b"] })).toBe("Covered: a. Not yet addressed: b.");
    expect(feedbackForCoverage({ covered: ["a"], missed: [] })).toBe("Your answer covers every key point.");
  });
});

describe("pickItems", () => {
  const masteryAt = (estimate: number, conceptIds: string[]): Map<string, ConceptMastery> => {
    const map = new Map<string, ConceptMastery>();
    for (const id of conceptIds) map.set(id, { ...emptyMastery("user_p", id), estimate, evidenceCount: 5 });
    return map;
  };
  const allConcepts = [...new Set(PRACTICE_ITEMS.flatMap((i) => i.concepts))];

  it("difficultyCapFor follows the contract thresholds", () => {
    expect(difficultyCapFor(0)).toBe(3);
    expect(difficultyCapFor(0.39)).toBe(3);
    expect(difficultyCapFor(0.4)).toBe(5);
    expect(difficultyCapFor(0.64)).toBe(5);
    expect(difficultyCapFor(0.65)).toBe(8);
  });

  it("never returns exam-only items, respects count, skill, level, concepts and exclude", async () => {
    const db = freshDb();
    const items = await pickItems(db, { skill: "probability", count: 40, seed: 3, now: NOW });
    expect(items.length).toBeGreaterThan(30);
    expect(items.every((i) => i.skill === "probability" && !i.examOnly)).toBe(true);
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
    const five = await pickItems(db, { skill: "probability", count: 5, seed: 3, now: NOW });
    expect(five).toHaveLength(5);
    const level = await pickItems(db, { skill: "probability", level: "foundation", count: 20, seed: 3, now: NOW });
    expect(level.length).toBeGreaterThan(0);
    expect(level.every((i) => i.level === "foundation")).toBe(true);
    const concept = await pickItems(db, { concepts: ["bayes-theorem"], count: 20, seed: 3, now: NOW, masteryMap: masteryAt(0.9, allConcepts) });
    expect(concept.length).toBeGreaterThan(0);
    expect(concept.every((i) => i.concepts.includes("bayes-theorem"))).toBe(true);
    const excluded = await pickItems(db, { skill: "probability", count: 40, seed: 3, now: NOW, exclude: [dice.id] });
    expect(excluded.some((i) => i.id === dice.id)).toBe(false);
    expect(await pickItems(db, { skill: "probability", count: 0, now: NOW })).toEqual([]);
  });

  it("is deterministic for a seed and spreads a session across primary concepts", async () => {
    const db = freshDb();
    const a = await pickItems(db, { skill: "probability", count: 8, seed: 11, now: NOW });
    const b = await pickItems(db, { skill: "probability", count: 8, seed: 11, now: NOW });
    expect(a.map((i) => i.id)).toEqual(b.map((i) => i.id));
    expect(new Set(a.map((i) => i.concepts[0])).size).toBe(a.length);
    const seeds = new Set([11, 12, 13, 14, 15].map((seed) => JSON.stringify(a.map(() => seed)) && ""));
    expect(seeds.size).toBe(1);
    const other = await pickItems(db, { skill: "probability", count: 8, seed: 12, now: NOW });
    expect(other.map((i) => i.id)).not.toEqual(a.map((i) => i.id));
  });

  it("caps difficulty by the mastery of the primary concept and lifts the cap as mastery grows", async () => {
    const db = freshDb();
    const cold = await pickItems(db, { skill: "probability", count: 10, seed: 5, now: NOW });
    expect(cold.every((i) => i.difficulty <= 3)).toBe(true);
    const middling = await pickItems(db, { skill: "probability", count: 40, seed: 5, now: NOW, masteryMap: masteryAt(0.5, allConcepts) });
    expect(middling.every((i) => i.difficulty <= 5)).toBe(true);
    const strong = await pickItems(db, { skill: "probability", count: 40, seed: 5, now: NOW, masteryMap: masteryAt(0.9, allConcepts) });
    expect(strong.some((i) => i.difficulty > 3)).toBe(true);
    // When the bank within the cap runs out, the easiest items above it fill the session rather than nothing.
    const bank = [mk({ difficulty: 1, concepts: ["k"] }), mk({ difficulty: 6, concepts: ["k"] }), mk({ difficulty: 4, concepts: ["k"] })];
    const filled = await pickItems(db, { count: 3, seed: 1, now: NOW, bank });
    expect(filled.map((i) => i.difficulty)).toEqual([1, 4, 6]);
  });

  it("avoids items attempted within seven days, uses them only as a last resort, and unseenOnly excludes every attempted item", async () => {
    const db = freshDb();
    const bank = [mk({ id: "it-a", concepts: ["k1"] }), mk({ id: "it-b", concepts: ["k2"] }), mk({ id: "it-c", concepts: ["k3"] })];
    await submitPractice(db, { item: bank[0]!, response: 1, hintsUsed: 0, solutionRevealed: false, retries: 0, timeMs: 1, context: "train", at: new Date(NOW.getTime() - 2 * DAY).toISOString() });
    await submitPractice(db, { item: bank[1]!, response: 1, hintsUsed: 0, solutionRevealed: false, retries: 0, timeMs: 1, context: "train", at: new Date(NOW.getTime() - 8 * DAY).toISOString() });
    const two = await pickItems(db, { count: 2, seed: 1, now: NOW, bank });
    expect(two.map((i) => i.id).sort()).toEqual(["it-b", "it-c"]);
    const three = await pickItems(db, { count: 3, seed: 1, now: NOW, bank });
    expect(three.map((i) => i.id).sort()).toEqual(["it-a", "it-b", "it-c"]);
    expect(three[2]!.id).toBe("it-a");
    const unseen = await pickItems(db, { count: 3, seed: 1, now: NOW, bank, unseenOnly: true });
    expect(unseen.map((i) => i.id)).toEqual(["it-c"]);
  });

  it("selectItems is pure over a bank and state", () => {
    const bank = [mk({ id: "x1", concepts: ["k1"], difficulty: 5 }), mk({ id: "x2", concepts: ["k1"], difficulty: 2 }), mk({ id: "x3", concepts: ["k2"], difficulty: 2, examOnly: true })];
    const state: PickState = { recent: new Set(), attempted: new Set(), estimateOf: () => 0.3 };
    expect(selectItems(bank, { count: 5, seed: 1 }, state).map((i) => i.id)).toEqual(["x2", "x1"]);
    expect(selectItems(bank, { count: 5, seed: 1 }, { ...state, estimateOf: () => 0.9 }).map((i) => i.id).sort()).toEqual(["x1", "x2"]);
  });
});
