import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { LocalDatabase } from "@/lib/persistence/local";
import { ERROR_CATEGORIES, type ErrorCategory } from "@/lib/v2/content-types";
import { ERROR_CATEGORY_META, conceptTitleFor, markRemediated, recordError, recurrenceKeyFor, recurrenceMessage, recurringErrors, remediationPlanItem, remediationSkill, type NewErrorRecord } from "@/lib/v2/errors";

const DAY = 86_400_000;
const NOW = new Date("2026-09-08T09:00:00.000Z");
let counter = 0;
function freshDb() {
  return new LocalDatabase("user_e", `the-study-errors-${Date.now()}-${counter++}`);
}

function input(category: ErrorCategory, concept: string, extra: Partial<NewErrorRecord> = {}): NewErrorRecord {
  return {
    category,
    skill: "logic",
    concepts: [concept],
    question: "Q",
    response: "R",
    correctReasoning: "S",
    source: { kind: "practice", refId: "pa_1" },
    ...extra,
  };
}

const daysAgo = (n: number, hours = 0) => new Date(NOW.getTime() - n * DAY - hours * 3_600_000);

describe("ERROR_CATEGORY_META", () => {
  it("names, describes and gives a remedy for every category", () => {
    for (const c of ERROR_CATEGORIES) {
      const meta = ERROR_CATEGORY_META[c];
      expect(meta.label.length).toBeGreaterThan(3);
      expect(meta.description.length).toBeGreaterThan(10);
      expect(meta.remedy.length).toBeGreaterThan(20);
      expect(meta.remedy).not.toMatch(/!/);
    }
  });
});

describe("recordError", () => {
  it("writes the record with a recurrence key of category and primary concept", async () => {
    const db = freshDb();
    const rec = await recordError(db, input("LOGIC_ERROR", "necessary-and-sufficient", { confidence: 0.8 }), NOW);
    expect(rec.recurrenceKey).toBe("LOGIC_ERROR:necessary-and-sufficient");
    expect(rec.createdAt).toBe(NOW.toISOString());
    expect(rec.confidence).toBe(0.8);
    const stored = await db.store("error_records").get(rec.id);
    expect(stored?.recurrenceKey).toBe(rec.recurrenceKey);
    expect(recurrenceKeyFor("MISREAD")).toBe("MISREAD:general");
    const bare = await recordError(db, input("MISREAD", "", { concepts: [] }), NOW);
    expect(bare.recurrenceKey).toBe("MISREAD:general");
  });
});

describe("recurringErrors", () => {
  it("detects three same-key errors across at least two days and phrases them as one sentence", async () => {
    const db = freshDb();
    await recordError(db, input("CONCEPTUAL_ERROR", "necessary-and-sufficient"), daysAgo(1));
    await recordError(db, input("CONCEPTUAL_ERROR", "necessary-and-sufficient"), daysAgo(1, 2));
    await recordError(db, input("CONCEPTUAL_ERROR", "necessary-and-sufficient"), daysAgo(0));
    const found = await recurringErrors(db, { now: NOW });
    expect(found).toHaveLength(1);
    const r = found[0]!;
    expect(r).toMatchObject({ key: "CONCEPTUAL_ERROR:necessary-and-sufficient", category: "CONCEPTUAL_ERROR", conceptId: "necessary-and-sufficient", skill: "logic", count: 3, days: 2 });
    expect(r.firstAt).toBe(daysAgo(1, 2).toISOString());
    expect(r.lastAt).toBe(daysAgo(0).toISOString());
    expect(r.message).toBe("You have misapplied necessary and sufficient conditions three times across two days.");
  });

  it("produces the contract sentence for four errors spread over three weeks", async () => {
    const db = freshDb();
    for (const d of [20, 14, 7, 0]) await recordError(db, input("CONCEPTUAL_ERROR", "necessary-and-sufficient"), daysAgo(d));
    const [r] = await recurringErrors(db, { now: NOW });
    expect(r?.message).toBe("You have misapplied necessary and sufficient conditions four times across three weeks.");
    expect(r?.message).toMatch(/^You have .+ (two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+) times across (\w+ days|\w+ weeks)\.$/);
  });

  it("ignores same-day clusters, records outside the window, remediated records and keys below the minimum", async () => {
    const db = freshDb();
    // Three on one day: not a recurrence.
    for (const h of [1, 2, 3]) await recordError(db, input("MISREAD", "validity-and-soundness"), daysAgo(0, h));
    // Two only.
    await recordError(db, input("LOGIC_ERROR", "quantifiers"), daysAgo(3));
    await recordError(db, input("LOGIC_ERROR", "quantifiers"), daysAgo(1));
    // Three, but one is outside the 21-day window.
    await recordError(db, input("ASSUMPTION", "contracts"), daysAgo(25));
    await recordError(db, input("ASSUMPTION", "contracts"), daysAgo(5));
    await recordError(db, input("ASSUMPTION", "contracts"), daysAgo(2));
    // Three, one already remediated.
    await recordError(db, input("CAUSAL_ERROR", "confounding", { remediatedAt: NOW.toISOString() }), daysAgo(4));
    await recordError(db, input("CAUSAL_ERROR", "confounding"), daysAgo(3));
    await recordError(db, input("CAUSAL_ERROR", "confounding"), daysAgo(2));
    expect(await recurringErrors(db, { now: NOW })).toEqual([]);
    expect((await recurringErrors(db, { now: NOW, windowDays: 30 })).map((r) => r.key)).toEqual(["ASSUMPTION:contracts"]);
    expect((await recurringErrors(db, { now: NOW, min: 2 })).map((r) => r.key).sort()).toEqual(["ASSUMPTION:contracts", "CAUSAL_ERROR:confounding", "LOGIC_ERROR:quantifiers"]);
  });

  it("orders by count, then recency, and reports the dominant skill", async () => {
    const db = freshDb();
    for (const d of [6, 5, 4, 3]) await recordError(db, input("BASE_RATE_NEGLECT", "base-rates", { skill: "probability" }), daysAgo(d));
    for (const d of [2, 1, 0]) await recordError(db, input("STATISTICAL_ERROR", "sampling", { skill: d === 0 ? "probability" : "statistics" }), daysAgo(d));
    for (const d of [9, 8, 7]) await recordError(db, input("ALGEBRA_ERROR", "linear-equations", { skill: "mathematics" }), daysAgo(d));
    const found = await recurringErrors(db, { now: NOW });
    expect(found.map((r) => r.key)).toEqual(["BASE_RATE_NEGLECT:base-rates", "STATISTICAL_ERROR:sampling", "ALGEBRA_ERROR:linear-equations"]);
    expect(found[1]!.skill).toBe("statistics");
    expect(found[0]!.message).toBe("You have neglected the base rate in base rates four times across four days.");
  });
});

describe("recurrenceMessage", () => {
  const span = { firstAt: daysAgo(3).toISOString(), lastAt: NOW.toISOString(), days: 3 };
  it("adapts the verb phrase to the category and titles the concept from the curriculum or the skeleton", () => {
    expect(conceptTitleFor("probability-rules")).toBe("The rules of probability");
    expect(conceptTitleFor("necessary-and-sufficient")).toBe("Necessary and sufficient conditions");
    expect(conceptTitleFor("some-unknown-id")).toBe("some unknown id");
    expect(recurrenceMessage({ category: "OVERCONFIDENCE", conceptId: "probability-rules", count: 5, ...span })).toBe("You have been confidently wrong about the rules of probability five times across four days.");
    expect(recurrenceMessage({ category: "KNOWLEDGE_GAP", count: 3, ...span })).toBe("You have been unable to recall a needed fact three times across four days.");
    expect(recurrenceMessage({ category: "TRANSFER_FAILURE", conceptId: "bayes-theorem", count: 13, ...span })).toBe("You have failed to recognise bayes' theorem in a new setting 13 times across four days.");
    for (const c of ERROR_CATEGORIES) expect(recurrenceMessage({ category: c, count: 3, ...span })).toMatch(/^You have .+ three times across four days\.$/);
  });
});

describe("remediationPlanItem", () => {
  it("opens a remediation session on the right skill with the concept and recurrence key", async () => {
    const db = freshDb();
    for (const d of [2, 1, 0]) await recordError(db, input("CONCEPTUAL_ERROR", "necessary-and-sufficient"), daysAgo(d));
    const [r] = await recurringErrors(db, { now: NOW });
    const item = remediationPlanItem(r!);
    expect(item).toMatchObject({ kind: "remediate", reason: "recurring_error", refId: r!.key, conceptIds: ["necessary-and-sufficient"], minutes: 15 });
    expect(item.title).toBe("Remediate: conceptual error in Necessary and sufficient conditions");
    expect(item.reasonText.startsWith(r!.message)).toBe(true);
    expect(item.reasonText).toContain(ERROR_CATEGORY_META.CONCEPTUAL_ERROR.remedy);
    const url = new URL(item.href, "https://example.invalid");
    expect(url.pathname).toBe("/train/logic/practice");
    expect(url.searchParams.get("concept")).toBe("necessary-and-sufficient");
    expect(url.searchParams.get("remediate")).toBe("CONCEPTUAL_ERROR:necessary-and-sufficient");
  });

  it("falls back to the record's skill or the category when the concept is unknown", () => {
    expect(remediationSkill({ conceptId: "probability-rules", skill: "knowledge", category: "MISREAD" })).toBe("probability");
    expect(remediationSkill({ conceptId: "no-such-concept", skill: "statistics", category: "MISREAD" })).toBe("statistics");
    expect(remediationSkill({ skill: "logic", category: "CAUSAL_ERROR" })).toBe("logic");
    const general = remediationPlanItem({ key: "MISREAD:general", category: "MISREAD", skill: "reading", count: 3, days: 2, firstAt: daysAgo(1).toISOString(), lastAt: NOW.toISOString(), message: "m" });
    expect(general.href).toBe("/train/reading/practice?remediate=MISREAD%3Ageneral");
    expect(general.conceptIds).toBeUndefined();
    expect(general.title).toBe("Remediate: misread the question");
  });
});

describe("markRemediated", () => {
  it("stamps every open record for the key and removes it from recurrence", async () => {
    const db = freshDb();
    for (const d of [2, 1, 0]) await recordError(db, input("LOGIC_ERROR", "quantifiers"), daysAgo(d));
    await recordError(db, input("LOGIC_ERROR", "other"), daysAgo(0));
    expect(await markRemediated(db, "LOGIC_ERROR:quantifiers", NOW)).toBe(3);
    expect(await markRemediated(db, "LOGIC_ERROR:quantifiers", NOW)).toBe(0);
    const rows = await db.store("error_records").list();
    expect(rows.filter((r) => r.remediatedAt === NOW.toISOString())).toHaveLength(3);
    expect(rows.filter((r) => !r.remediatedAt)).toHaveLength(1);
    expect(await recurringErrors(db, { now: NOW })).toEqual([]);
  });
});
