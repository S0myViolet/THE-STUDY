import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { LocalDatabase } from "@/lib/persistence/local";
import { rebuildEstimates, recordConfidence, recordError, recordEvidence } from "@/lib/services/evidence";
import { createMemoryItem, dueMemoryItems, reviewMemoryItem } from "@/lib/services/memory";

let counter = 0;
const fresh = () => new LocalDatabase("user_ev", `the-study-ev-${Date.now()}-${counter++}`);
const source = { kind: "observation" as const, refId: "gl-1", label: "The Glance" };

describe("Evidence pipeline", () => {
  it("records evidence and maintains one estimate per subskill", async () => {
    const db = fresh();
    const first = await recordEvidence(db, { subskill: "observation.detail", score: 1, difficulty: 3, format: "mcq", source });
    expect(first.estimate.faculty).toBe("observation");
    expect(first.estimate.evidenceCount).toBe(1);
    expect(first.estimate.value).toBeGreaterThan(0.5);
    const second = await recordEvidence(db, { subskill: "observation.detail", score: 0, difficulty: 3, format: "mcq", source });
    expect(second.estimate.id).toBe(first.estimate.id);
    expect(second.estimate.evidenceCount).toBe(2);
    expect(second.estimate.value).toBeLessThan(first.estimate.value);
    expect(await db.store("skill_estimates").count()).toBe(1);
    expect(await db.store("skill_evidence").count()).toBe(2);
  });

  it("rebuilds estimates from evidence to the same values", async () => {
    const db = fresh();
    for (let i = 0; i < 8; i++) await recordEvidence(db, { subskill: "memory.names", score: i % 3 === 0 ? 0.2 : 0.9, difficulty: (1 + (i % 5)) as 1 | 2 | 3 | 4 | 5, format: "delayed", source: { kind: "memory", refId: `m${i}` } });
    const before = await db.store("skill_estimates").list();
    await rebuildEstimates(db);
    const after = await db.store("skill_estimates").list();
    expect(after).toHaveLength(before.length);
    expect(after[0]!.value).toBeCloseTo(before[0]!.value, 3);
    expect(after[0]!.evidenceCount).toBe(8);
  });

  it("confidence entries become calibration evidence and over-confidence errors", async () => {
    const db = fresh();
    await recordConfidence(db, { confidence: 0.95, correct: false, domain: "inference", source: { kind: "inference", refId: "hs-1" } });
    await recordConfidence(db, { confidence: 0.6, correct: true, domain: "inference", source: { kind: "inference", refId: "hs-2" } });
    const est = await db.store("skill_estimates").list({ where: { subskill: "calibration.confidence" } });
    expect(est).toHaveLength(1);
    expect(est[0]!.evidenceCount).toBe(2);
    const errors = await db.store("error_events").list();
    expect(errors.some((e) => e.type === "OVERCONFIDENCE")).toBe(true);
  });

  it("error events carry a faculty derived from the subskill", async () => {
    const db = fresh();
    const e = await recordError(db, { type: "FALSE_OBSERVATION", subskill: "observation.precision", source, detail: "Reported a clock that was not there." });
    expect(e.faculty).toBe("observation");
  });
});

describe("Memory service", () => {
  it("schedules with spacing: correct reviews push the due date out, lapses pull it back", async () => {
    const db = fresh();
    const item = await createMemoryItem(db, { kind: "fact", prompt: "Year of Westphalia?", answer: "1648", dueInDays: 0 });
    expect((await dueMemoryItems(db)).map((i) => i.id)).toContain(item.id);
    const r1 = await reviewMemoryItem(db, { item, correct: true, latencyMs: 2000, confidence: 0.8 });
    expect(r1.item.intervalDays).toBeGreaterThan(0);
    const r2 = await reviewMemoryItem(db, { item: r1.item, correct: true, latencyMs: 1500, confidence: 0.9 });
    expect(r2.item.intervalDays).toBeGreaterThan(r1.item.intervalDays);
    const r3 = await reviewMemoryItem(db, { item: r2.item, correct: false, latencyMs: 4000, confidence: 0.7 });
    expect(r3.item.lapses).toBe(1);
    expect(r3.item.intervalDays).toBeLessThan(r2.item.intervalDays);
    expect(await db.store("memory_reviews").count()).toBe(3);
  });
});
