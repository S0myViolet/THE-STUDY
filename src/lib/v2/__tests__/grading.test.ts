import { describe, expect, it } from "vitest";
import { practiceItem } from "@/content/v2";
import type { PracticeItem } from "@/lib/v2/content-types";
import { classifyError, evidenceKindFor, gradeItem, keyPointCoverage, normalizeText, orderingScore, parseNumber } from "@/lib/v2/grading";

function mk(partial: Partial<PracticeItem>): PracticeItem {
  return {
    id: "it-test-01",
    skill: "mathematics",
    subskill: "test",
    concepts: ["c-primary", "c-secondary"],
    level: "basic",
    difficulty: 2,
    format: "numeric",
    prompt: "Test prompt",
    solution: "Test solution",
    method: "Test method",
    hints: [],
    commonErrors: [],
    transfer: 0,
    minutes: 1,
    origin: "seeded",
    ...partial,
  };
}

describe("normalizeText", () => {
  it.each([
    ["  The Gambler's Fallacy!  ", "gambler s fallacy"],
    ["Modus Ponens.", "modus ponens"],
    ["an  Ad   Hominem", "ad hominem"],
    ["Café—Résumé", "cafe resume"],
    ["x + 3", "x + 3"],
    ["x - 3", "x - 3"],
    ["2 × 10^5", "2 * 10^5"],
    ["base-rate neglect", "base rate neglect"],
    ["and/or", "and or"],
    ["3/4 or 0.75", "3/4 or 0.75"],
    ["25 / 30", "25 / 30"],
    ["−2", "-2"],
    ["50%", "50%"],
    ["“quoted”", "quoted"],
    ["", ""],
  ])("normalises %j to %j", (input, expected) => {
    expect(normalizeText(input)).toBe(expected);
  });
});

describe("parseNumber", () => {
  it.each<[unknown, number | undefined]>([
    [42, 42],
    ["42", 42],
    ["1,500", 1500],
    ["1,234,567.5", 1234567.5],
    ["1,5", 1.5],
    ["£2.50", 2.5],
    ["$1,000", 1000],
    ["25 %", 25],
    ["25%", 25],
    ["-2", -2],
    ["−2", -2],
    ["+7", 7],
    ["3/4", 0.75],
    ["1 1/2", 1.5],
    ["-1/4", -0.25],
    ["0.75", 0.75],
    [".5", 0.5],
    ["1.5e3", 1500],
    ["3 × 10⁵", 300000],
    ["3 x 10^5", 300000],
    ["≈ 40 km", 40],
    ["about 3", 3],
    ["approximately 0.52", 0.52],
    ["12 dice", 12],
    [["3"], 3],
    ["", undefined],
    ["abc", undefined],
    ["km 40", undefined],
    ["1/0", undefined],
    [true, undefined],
    [null, undefined],
    [Number.NaN, undefined],
  ])("parses %j as %j", (input, expected) => {
    const got = parseNumber(input);
    if (expected === undefined) expect(got).toBeUndefined();
    else expect(got).toBeCloseTo(expected, 9);
  });
});

describe("gradeItem", () => {
  describe("numeric", () => {
    const item = mk({ format: "numeric", answer: 0.1667, tolerance: 0.005 });
    it.each<[unknown, boolean, number]>([
      [0.1667, true, 1],
      ["0.167", true, 1],
      ["1/6", true, 1],
      [" 0.17 ", true, 1],
      ["0.18", false, 0.5],
      ["0.2", false, 0],
      ["16.67", false, 0],
      ["", false, 0],
      ["six", false, 0],
    ])("grades %j → correct %s, score %s", (response, correct, score) => {
      expect(gradeItem(item, response)).toEqual({ gradeable: true, correct, score });
    });

    it("accepts units, thousands separators and percent signs against the answer", () => {
      const pct = mk({ format: "numeric", answer: 25, tolerance: 0.5, unit: "%" });
      expect(gradeItem(pct, "25%").correct).toBe(true);
      expect(gradeItem(pct, "25 percent").correct).toBe(true);
      expect(gradeItem(pct, "0.25").correct).toBe(false);
      const money = mk({ format: "numeric", answer: 1500, tolerance: 1, unit: "£" });
      expect(gradeItem(money, "£1,500").correct).toBe(true);
      expect(gradeItem(money, "1500.4").correct).toBe(true);
    });

    it("uses relative tolerance when set and an exact match otherwise", () => {
      const rel = mk({ format: "numeric", answer: 200, relativeTolerance: 0.05 });
      expect(gradeItem(rel, 209).correct).toBe(true);
      expect(gradeItem(rel, 211).correct).toBe(false);
      expect(gradeItem(rel, 211).score).toBe(0.5);
      const exact = mk({ format: "numeric", answer: 56 });
      expect(gradeItem(exact, "56").correct).toBe(true);
      expect(gradeItem(exact, "57").correct).toBe(false);
      expect(gradeItem(exact, "57").score).toBe(0);
    });

    it("is not gradeable without a numeric answer", () => {
      expect(gradeItem(mk({ format: "numeric" }), 3).gradeable).toBe(false);
    });
  });

  describe("mcq", () => {
    const item = mk({ format: "mcq", options: ["25/30", "30/30", "20/30", "13/30"], answer: 0 });
    it.each<[unknown, boolean]>([
      [0, true],
      ["0", true],
      ["A", true],
      ["a", true],
      ["25/30", true],
      [" 25 / 30 ", true],
      [[0], true],
      [1, false],
      ["B", false],
      ["30/30", false],
      [4, false],
      ["Z", false],
      [undefined, false],
    ])("grades %j → %s", (response, correct) => {
      expect(gradeItem(item, response)).toEqual({ gradeable: true, correct, score: correct ? 1 : 0 });
    });

    it("matches option text regardless of case, punctuation and articles", () => {
      const words = mk({ format: "mcq", options: ["The base rate", "A likelihood", "The posterior"], answer: 2 });
      expect(gradeItem(words, "posterior.").correct).toBe(true);
      expect(gradeItem(words, "the POSTERIOR").correct).toBe(true);
      expect(gradeItem(words, "the prior").correct).toBe(false);
    });
  });

  describe("multi_select", () => {
    const item = mk({ format: "multi_select", options: ["addition", "multiplication", "complement", "inversion", "exclusive"], answer: [0, 2, 4] });
    it("is correct only for the exact set, with Jaccard partial credit otherwise", () => {
      expect(gradeItem(item, [0, 2, 4])).toEqual({ gradeable: true, correct: true, score: 1 });
      expect(gradeItem(item, [4, 0, 2]).correct).toBe(true);
      expect(gradeItem(item, ["0", "2", "4"]).correct).toBe(true);
      expect(gradeItem(item, ["addition", "complement", "exclusive"]).correct).toBe(true);
      expect(gradeItem(item, "addition, complement, exclusive").correct).toBe(true);
      expect(gradeItem(item, [0, 2])).toEqual({ gradeable: true, correct: false, score: 0.667 });
      expect(gradeItem(item, [0, 1, 2, 4])).toEqual({ gradeable: true, correct: false, score: 0.75 });
      expect(gradeItem(item, [1, 3]).score).toBe(0);
      expect(gradeItem(item, []).score).toBe(0);
      expect(gradeItem(item, [0, 9]).score).toBe(0);
    });
  });

  describe("true_false", () => {
    const item = mk({ format: "true_false", answer: "true" });
    it.each<[unknown, boolean]>([
      ["true", true],
      ["True", true],
      [true, true],
      ["yes", true],
      ["T", true],
      [1, true],
      ["false", false],
      [false, false],
      ["no", false],
      ["maybe", false],
    ])("grades %j → %s", (response, correct) => {
      expect(gradeItem(item, response).correct).toBe(correct);
    });
    it("grades a false answer", () => {
      const f = mk({ format: "true_false", answer: "false" });
      expect(gradeItem(f, "False").correct).toBe(true);
      expect(gradeItem(f, "n").correct).toBe(true);
      expect(gradeItem(f, "true").correct).toBe(false);
    });
  });

  describe("short", () => {
    const item = mk({ format: "short", answer: "modus ponens", accept: ["MP", "affirming the antecedent"] });
    it.each<[unknown, boolean]>([
      ["modus ponens", true],
      ["Modus Ponens", true],
      ["  modus ponens. ", true],
      ["the modus ponens", true],
      ["mp", true],
      ["Affirming the Antecedent", true],
      ["affirming antecedent", true],
      ["modus tollens", false],
      ["", false],
      [{ text: "modus ponens" }, true],
    ])("grades %j → %s", (response, correct) => {
      expect(gradeItem(item, response)).toEqual({ gradeable: true, correct, score: correct ? 1 : 0 });
    });

    it("ignores spacing inside expressions and reads numeric answers as numbers", () => {
      const expr = mk({ format: "short", answer: "x + 3", accept: ["3 + x"] });
      expect(gradeItem(expr, "x+3").correct).toBe(true);
      expect(gradeItem(expr, "(x + 3)").correct).toBe(true);
      expect(gradeItem(expr, "3+x").correct).toBe(true);
      expect(gradeItem(expr, "x - 3").correct).toBe(false);
      expect(gradeItem(expr, "x-3").correct).toBe(false);
      expect(gradeItem(expr, "x 3").correct).toBe(false);
      const hyphen = mk({ format: "short", answer: "base rate" });
      expect(gradeItem(hyphen, "base-rate").correct).toBe(true);
      expect(gradeItem(hyphen, "the base-rate").correct).toBe(true);
      const frac = mk({ format: "short", answer: "3/4" });
      expect(gradeItem(frac, "0.75").correct).toBe(true);
      expect(gradeItem(frac, "6/8").correct).toBe(true);
      expect(gradeItem(frac, "0.7").correct).toBe(false);
    });

    it("grades the seeded gambler's fallacy item through its accept list", () => {
      const seeded = practiceItem("it-probability-14")!;
      expect(gradeItem(seeded, "Gambler's fallacy").correct).toBe(true);
      expect(gradeItem(seeded, "the gamblers fallacy").correct).toBe(true);
      expect(gradeItem(seeded, "hot hand").correct).toBe(false);
    });
  });

  describe("ordering", () => {
    const options = ["assume", "square", "p even", "q even", "contradiction", "conclude"];
    const item = mk({ format: "ordering", options });
    it("is correct for the exact order given as indexes or option texts, with Kendall partial credit", () => {
      expect(gradeItem(item, [0, 1, 2, 3, 4, 5])).toEqual({ gradeable: true, correct: true, score: 1 });
      expect(gradeItem(item, options).correct).toBe(true);
      expect(gradeItem(item, ["Assume", "square", "P even", "q even.", "contradiction", "conclude"]).correct).toBe(true);
      const swap = gradeItem(item, [0, 2, 1, 3, 4, 5]);
      expect(swap.correct).toBe(false);
      expect(swap.score).toBe(0.933);
      expect(gradeItem(item, [5, 4, 3, 2, 1, 0]).score).toBe(0);
      expect(gradeItem(item, [0, 1, 2]).score).toBe(0);
      expect(gradeItem(item, [0, 0, 1, 2, 3, 4]).score).toBe(0);
      expect(gradeItem(item, "assume, square").score).toBe(0);
    });
    it("orderingScore is the share of concordant pairs", () => {
      expect(orderingScore([0, 1, 2, 3])).toBe(1);
      expect(orderingScore([3, 2, 1, 0])).toBe(0);
      expect(orderingScore([1, 0, 2, 3])).toBeCloseTo(5 / 6, 6);
      expect(orderingScore([0])).toBe(1);
    });
    it("needs at least two options", () => {
      expect(gradeItem(mk({ format: "ordering", options: ["only"] }), ["only"]).gradeable).toBe(false);
    });
  });

  describe("free", () => {
    const item = mk({ format: "free", keyPoints: ["base rate|prior", "false positive", "posterior|updated", "sample size", "independence"] });
    it("scores key-point coverage and is correct at 60 % or more", () => {
      const good = gradeItem(item, "Start from the prior, count the false positives, then the posterior follows; the sample size matters too.");
      expect(good).toEqual({ gradeable: true, correct: true, score: 0.8, covered: ["base rate|prior", "false positive", "posterior|updated", "sample size"], missed: ["independence"] });
      const thin = gradeItem(item, "The Base Rate and the false-positive rate.");
      expect(thin.correct).toBe(false);
      expect(thin.score).toBe(0.4);
      expect(thin.covered).toEqual(["base rate|prior", "false positive"]);
      expect(gradeItem(item, "Three of five: prior, false positive, updated.").correct).toBe(true);
      expect(gradeItem(item, "").score).toBe(0);
    });
    it("is not gradeable without key points", () => {
      expect(gradeItem(mk({ format: "free" }), "anything")).toEqual({ gradeable: false, score: 0 });
    });
  });

  it("keyPointCoverage matches alternatives and ignores case and punctuation", () => {
    const { covered, missed, ratio } = keyPointCoverage("Regression to the mean explains it; correlation is not causation.", ["regression to the mean|regression", "confound", "correlation is not causation"]);
    expect(covered).toEqual(["regression to the mean|regression", "correlation is not causation"]);
    expect(missed).toEqual(["confound"]);
    expect(ratio).toBeCloseTo(2 / 3, 6);
    expect(keyPointCoverage("anything", []).ratio).toBe(1);
  });
});

describe("classifyError", () => {
  it("returns nothing for a correct answer unless it was underconfident, and nothing when ungraded", () => {
    const item = mk({ format: "numeric", answer: 5, tolerance: 0 });
    expect(classifyError(item, 5, { correct: true })).toBeUndefined();
    expect(classifyError(item, 5, { correct: true }, 0.9)).toBeUndefined();
    expect(classifyError(item, 5, { correct: true }, 0.4)).toBe("UNDERCONFIDENCE");
    expect(classifyError(item, 5, { correct: true }, 0.2)).toBe("UNDERCONFIDENCE");
    expect(classifyError(item, "x", {})).toBeUndefined();
  });

  it("the item's own common errors come first, before confidence or sign heuristics", () => {
    const seeded = practiceItem("it-probability-02")!;
    expect(classifyError(seeded, "0.482", { correct: false }, 0.95)).toBe("MISREAD");
    expect(classifyError(seeded, "0.6667", { correct: false }, 0.95)).toBe("CONCEPTUAL_ERROR");
    const mcq = practiceItem("it-probability-03")!;
    expect(classifyError(mcq, 2, { correct: false }, 0.9)).toBe("ALGEBRA_ERROR");
    expect(classifyError(mcq, "13/30", { correct: false })).toBe("MISREAD");
    const multi = practiceItem("it-probability-04")!;
    expect(classifyError(multi, [0, 2, 3, 4], { correct: false })).toBe("CONCEPTUAL_ERROR");
    const pattern = mk({ format: "short", answer: "modus tollens", commonErrors: [{ description: "Named the affirming form", category: "LOGIC_ERROR", pattern: "modus ponens" }], skill: "knowledge" });
    expect(classifyError(pattern, "I think it is Modus Ponens.", { correct: false }, 0.9)).toBe("LOGIC_ERROR");
  });

  it("flags a sign or power-of-ten slip as an algebra error, and a percent-fraction mix-up as precision", () => {
    const plain = mk({ format: "numeric", answer: 0.05, tolerance: 0.001 });
    expect(classifyError(plain, "-0.05", { correct: false }, 0.9)).toBe("ALGEBRA_ERROR");
    expect(classifyError(plain, "0.5", { correct: false }, 0.9)).toBe("ALGEBRA_ERROR");
    expect(classifyError(plain, "0.005", { correct: false })).toBe("ALGEBRA_ERROR");
    const pct = mk({ format: "numeric", answer: 25, tolerance: 0.5, unit: "%" });
    expect(classifyError(pct, "0.25", { correct: false }, 0.9)).toBe("PRECISION_ERROR");
    expect(classifyError(pct, "2500", { correct: false })).toBe("PRECISION_ERROR");
    expect(classifyError(pct, "-25", { correct: false })).toBe("ALGEBRA_ERROR");
  });

  it("then confidence, then transfer level, then the skill", () => {
    const mcq = mk({ format: "mcq", options: ["a", "b", "c"], answer: 0 });
    expect(classifyError(mcq, 1, { correct: false }, 0.8)).toBe("OVERCONFIDENCE");
    expect(classifyError(mcq, 1, { correct: false }, 0.5, 2)).toBe("TRANSFER_FAILURE");
    expect(classifyError({ ...mcq, transfer: 3 }, 1, { correct: false })).toBe("TRANSFER_FAILURE");
    expect(classifyError({ ...mcq, transfer: 1 }, 1, { correct: false })).toBe("CONCEPTUAL_ERROR");
    expect(classifyError({ ...mcq, skill: "probability", subskill: "bayes" }, 1, { correct: false })).toBe("BASE_RATE_NEGLECT");
    expect(classifyError({ ...mcq, skill: "probability", subskill: "conditional", tags: ["base-rate"] }, 1, { correct: false })).toBe("BASE_RATE_NEGLECT");
    expect(classifyError({ ...mcq, skill: "probability", subskill: "combinatorics" }, 1, { correct: false })).toBe("CONCEPTUAL_ERROR");
    expect(classifyError({ ...mcq, skill: "logic" }, 1, { correct: false })).toBe("LOGIC_ERROR");
    expect(classifyError({ ...mcq, skill: "argument_analysis" }, 1, { correct: false })).toBe("LOGIC_ERROR");
    expect(classifyError({ ...mcq, skill: "causal_reasoning" }, 1, { correct: false })).toBe("CAUSAL_ERROR");
    expect(classifyError({ ...mcq, skill: "statistics" }, 1, { correct: false })).toBe("STATISTICAL_ERROR");
    expect(classifyError({ ...mcq, skill: "knowledge" }, 1, { correct: false })).toBe("KNOWLEDGE_GAP");
    expect(classifyError({ ...mcq, skill: "reading" }, 1, { correct: false })).toBe("MISREAD");
    expect(classifyError({ ...mcq, skill: "mathematics" }, 1, { correct: false }, 0.79)).toBe("CONCEPTUAL_ERROR");
  });
});

describe("evidenceKindFor", () => {
  it("follows exam → transfer → guided → independent", () => {
    expect(evidenceKindFor("exam", 0, false, 0)).toBe("exam");
    expect(evidenceKindFor("baseline", 3, true, 3)).toBe("exam");
    expect(evidenceKindFor("transfer", 0, false, 0)).toBe("transfer");
    expect(evidenceKindFor("train", 0, false, 2)).toBe("transfer");
    expect(evidenceKindFor("train", 1, false, 1)).toBe("guided");
    expect(evidenceKindFor("lesson", 0, true, 0)).toBe("guided");
    expect(evidenceKindFor("train", 0, false, 1)).toBe("independent");
    expect(evidenceKindFor("remediation", 0, false, 0)).toBe("independent");
  });
});
