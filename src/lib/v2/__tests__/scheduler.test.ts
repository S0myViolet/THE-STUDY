import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { LocalDatabase } from "@/lib/persistence/local";
import { conceptContent } from "@/content/v2";
import type { RetrievalItem } from "@/lib/v2/types";
import {
  BASE_INTERVALS,
  createRetrievalForConcept,
  createRetrievalItem,
  dueRetrievals,
  gradeFrom,
  isDue,
  promptFor,
  retentionBucket,
  retentionRisk,
  retentionSummary,
  reviewRetrieval,
  scheduleReview,
  type ScheduleState,
} from "@/lib/v2/scheduler";

const DAY = 86_400_000;
const NOW = new Date("2026-09-08T09:00:00.000Z");
let counter = 0;
function freshDb() {
  return new LocalDatabase("user_s", `the-study-scheduler-${Date.now()}-${counter++}`);
}

const fresh: ScheduleState = { ease: 2.5, intervalDays: 1, reps: 0, lapses: 0, stage: 0 };

function itemAt(due: Date, extra: Partial<RetrievalItem> = {}): RetrievalItem {
  return {
    id: "ret_x",
    userId: "user_s",
    createdAt: NOW.toISOString(),
    updatedAt: NOW.toISOString(),
    mode: "fact",
    prompt: "What is the capital of Peru?",
    answer: "Lima",
    source: { kind: "lesson", refId: "ls-x" },
    ease: 2.5,
    intervalDays: 10,
    due: due.toISOString(),
    reps: 3,
    lapses: 0,
    stage: 1,
    ...extra,
  };
}

describe("gradeFrom", () => {
  it("maps correctness, confidence, latency and completeness onto 0..5", () => {
    expect(gradeFrom({ correct: false, confidence: 0.9 })).toBe(0);
    expect(gradeFrom({ correct: false, confidence: 0.8 })).toBe(0);
    expect(gradeFrom({ correct: false })).toBe(1);
    expect(gradeFrom({ correct: false, score: 0.5 })).toBe(2);
    expect(gradeFrom({ correct: true })).toBe(4);
    expect(gradeFrom({ correct: true, latencyMs: 2_000 })).toBe(5);
    expect(gradeFrom({ correct: true, latencyMs: 8_000 })).toBe(4);
    expect(gradeFrom({ correct: true, latencyMs: 20_000 })).toBe(3);
    expect(gradeFrom({ correct: true, latencyMs: 2_000, score: 0.7 })).toBe(3);
  });
});

describe("scheduleReview", () => {
  it("climbs the base ladder over five successes: intervals grow, reps count, stage advances every second success", () => {
    let state: ScheduleState = { ...fresh };
    let now = NOW;
    const intervals: number[] = [];
    const stages: number[] = [];
    for (let k = 0; k < 5; k++) {
      const next = scheduleReview(state, { grade: 4, confidence: 0.5 }, now);
      intervals.push(next.intervalDays);
      stages.push(next.stage);
      expect(new Date(next.due).getTime()).toBeCloseTo(now.getTime() + next.intervalDays * DAY, -2);
      now = new Date(next.due);
      state = next;
    }
    // ease stays at 2.5 for grade 4 and confidence 0.5 gives a factor of exactly 1, so the ladder is followed exactly.
    expect(intervals).toEqual(BASE_INTERVALS);
    for (let k = 1; k < intervals.length; k++) expect(intervals[k]!).toBeGreaterThan(intervals[k - 1]!);
    expect(stages).toEqual([0, 1, 1, 2, 2]);
    expect(state.reps).toBe(5);
    expect(state.lapses).toBe(0);
    expect(state.ease).toBe(2.5);
  });

  it("keeps growing past the ladder by ease and clamps at 365 days", () => {
    const beyond = scheduleReview({ ease: 2.5, intervalDays: 90, reps: 5, lapses: 0, stage: 4 }, { grade: 4 }, NOW);
    expect(beyond.intervalDays).toBe(225);
    expect(beyond.stage).toBe(4);
    const clamped = scheduleReview({ ease: 2.5, intervalDays: 300, reps: 9, lapses: 0, stage: 4 }, { grade: 5 }, NOW);
    expect(clamped.intervalDays).toBe(365);
  });

  it("stretches or shortens the interval by stated confidence", () => {
    const sure = scheduleReview({ ...fresh, reps: 1 }, { grade: 4, confidence: 1 }, NOW);
    const unsure = scheduleReview({ ...fresh, reps: 1 }, { grade: 4, confidence: 0 }, NOW);
    const silent = scheduleReview({ ...fresh, reps: 1 }, { grade: 4 }, NOW);
    expect(sure.intervalDays).toBeCloseTo(4 * 1.15, 1);
    expect(unsure.intervalDays).toBeCloseTo(4 * 0.85, 1);
    expect(silent.intervalDays).toBe(4);
  });

  it("raises ease on a fast recall and lowers it on a hard one, never below 1.3", () => {
    expect(scheduleReview(fresh, { grade: 5 }, NOW).ease).toBe(2.6);
    expect(scheduleReview(fresh, { grade: 3 }, NOW).ease).toBe(2.36);
    expect(scheduleReview({ ...fresh, ease: 1.3 }, { grade: 0 }, NOW).ease).toBe(1.3);
  });

  it("a lapse resets reps, shortens the interval, counts the lapse and drops one stage", () => {
    const mature: ScheduleState = { ease: 2.5, intervalDays: 30, reps: 4, lapses: 0, stage: 2 };
    const lapse = scheduleReview(mature, { grade: 1 }, NOW);
    expect(lapse).toMatchObject({ reps: 0, intervalDays: 1, lapses: 1, stage: 1 });
    expect(lapse.ease).toBeLessThan(2.5);
    const blackout = scheduleReview(mature, { grade: 0 }, NOW);
    expect(blackout).toMatchObject({ reps: 0, intervalDays: 0.5, lapses: 1, stage: 1 });
    expect(scheduleReview({ ...mature, stage: 0 }, { grade: 2 }, NOW).stage).toBe(0);
    // After a lapse the ladder restarts from the first rung, scaled by the reduced ease.
    const relearned = scheduleReview(lapse, { grade: 4, confidence: 0.5 }, NOW);
    expect(relearned.reps).toBe(1);
    expect(relearned.intervalDays).toBeCloseTo((BASE_INTERVALS[0]! * lapse.ease) / 2.5, 1);
    expect(relearned.intervalDays).toBeLessThan(BASE_INTERVALS[1]!);
  });
});

describe("isDue and retentionRisk", () => {
  it("is due at or after the due time and never when suspended", () => {
    expect(isDue(itemAt(NOW), NOW)).toBe(true);
    expect(isDue(itemAt(new Date(NOW.getTime() - 1)), NOW)).toBe(true);
    expect(isDue(itemAt(new Date(NOW.getTime() + 1)), NOW)).toBe(false);
    expect(isDue(itemAt(NOW, { suspended: true }), NOW)).toBe(false);
  });

  it("risk lies in 0..1, rises when overdue and with lapses", () => {
    const early = retentionRisk(itemAt(new Date(NOW.getTime() + 9 * DAY)), NOW);
    const soon = retentionRisk(itemAt(new Date(NOW.getTime() + 1 * DAY)), NOW);
    const late = retentionRisk(itemAt(new Date(NOW.getTime() - 2 * DAY)), NOW);
    const lapsed = retentionRisk(itemAt(new Date(NOW.getTime() - 2 * DAY), { lapses: 3 }), NOW);
    expect(early).toBeGreaterThanOrEqual(0);
    expect(early).toBeLessThan(soon);
    expect(soon).toBeLessThan(late);
    expect(late).toBeLessThan(lapsed);
    expect(retentionRisk(itemAt(new Date(NOW.getTime() - 100 * DAY), { lapses: 5 }), NOW)).toBe(1);
  });
});

describe("retentionBucket", () => {
  it("due: at or past the due time", () => {
    expect(retentionBucket(itemAt(NOW), NOW)).toBe("due");
    expect(retentionBucket(itemAt(new Date(NOW.getTime() - DAY), { lapses: 3 }), NOW)).toBe("due");
  });

  it("fragile: two lapses, or the last review failed", () => {
    const later = new Date(NOW.getTime() + 25 * DAY);
    expect(retentionBucket(itemAt(later, { intervalDays: 30, lapses: 2 }), NOW)).toBe("fragile");
    expect(retentionBucket(itemAt(new Date(NOW.getTime() + DAY), { intervalDays: 1, reps: 0, lapses: 1 }), NOW)).toBe("fragile");
  });

  it("decaying: inside the last 20 % of the interval", () => {
    const interval = 10;
    const inside = new Date(NOW.getTime() + 0.2 * interval * DAY);
    const outside = new Date(NOW.getTime() + 0.21 * interval * DAY);
    expect(retentionBucket(itemAt(inside, { intervalDays: interval }), NOW)).toBe("decaying");
    // Outside the window with a short interval the item is neither durable nor at risk, so it is still decaying.
    expect(retentionBucket(itemAt(outside, { intervalDays: interval }), NOW)).toBe("decaying");
  });

  it("durable: interval of three weeks or more with fewer than two lapses", () => {
    const later = new Date(NOW.getTime() + 15 * DAY);
    expect(retentionBucket(itemAt(later, { intervalDays: 21, lapses: 1 }), NOW)).toBe("durable");
    expect(retentionBucket(itemAt(later, { intervalDays: 20.9, lapses: 0 }), NOW)).toBe("decaying");
  });
});

describe("promptFor", () => {
  const base = itemAt(NOW, { conceptId: "probability-rules", mode: "concept", prompt: "When does P(A and B) = P(A) × P(B)?" });
  it("offers the item's own prompt through stage 1, then application, reconstruction and connection", () => {
    expect(promptFor({ ...base, stage: 0 })).toEqual({ mode: "concept", prompt: base.prompt, expectsFree: false });
    expect(promptFor({ ...base, stage: 1 }).mode).toBe("concept");
    const apply = promptFor({ ...base, stage: 2 });
    expect(apply.mode).toBe("application");
    expect(apply.expectsFree).toBe(true);
    expect(apply.prompt).toMatch(/^Apply The rules of probability to a situation of your own/);
    const rebuild = promptFor({ ...base, stage: 3 });
    expect(rebuild.mode).toBe("explanation");
    expect(rebuild.prompt).toMatch(/^Reconstruct The rules of probability from memory/);
    expect(promptFor({ ...base, stage: 3, mode: "process" }).mode).toBe("process");
    const connect = promptFor({ ...base, stage: 4 });
    expect(connect.mode).toBe("connection");
    expect(connect.prompt).toMatch(/^Connect The rules of probability to another concept you know/);
  });

  it("free-recall items expect free text from the start and items without a concept quote their prompt", () => {
    expect(promptFor({ ...base, mode: "free_recall", stage: 0 }).expectsFree).toBe(true);
    const bare = promptFor({ ...base, conceptId: undefined, stage: 2 });
    expect(bare.prompt).toContain("what this asks");
    expect(bare.prompt).toContain("When does P(A and B) = P(A) × P(B)");
  });
});

describe("retrieval items on a local database", () => {
  it("createRetrievalForConcept seeds one item per recall prompt plus a free recall, idempotently", async () => {
    const db = freshDb();
    const concept = conceptContent("probability-rules")!;
    const first = await createRetrievalForConcept(db, concept, { kind: "lesson", refId: "ls-pr-rules-1" }, NOW);
    expect(first).toHaveLength(concept.recallPrompts.length + 1);
    const free = first.find((i) => i.mode === "free_recall")!;
    expect(free.keyPoints).toEqual(concept.keyPoints);
    expect(free.conceptId).toBe("probability-rules");
    expect(first.filter((i) => i.mode === "fact" || i.mode === "concept")).toHaveLength(concept.recallPrompts.length);
    for (const item of first) {
      expect(item).toMatchObject({ ease: 2.5, intervalDays: 1, reps: 0, lapses: 0, stage: 0 });
      expect(new Date(item.due).getTime()).toBe(NOW.getTime() + DAY);
    }
    const again = await createRetrievalForConcept(db, concept, { kind: "lesson", refId: "ls-pr-rules-1" }, NOW);
    expect(again.map((i) => i.id).sort()).toEqual(first.map((i) => i.id).sort());
    expect(await db.store("retrieval_items").count()).toBe(first.length);
  });

  it("dueRetrievals returns only due, unsuspended items ordered by due date, honouring the limit", async () => {
    const db = freshDb();
    const source = { kind: "reading", refId: "src-x" } as const;
    const late = await createRetrievalItem(db, { mode: "fact", prompt: "Late", answer: "a", source, due: new Date(NOW.getTime() - 2 * DAY).toISOString() });
    const later = await createRetrievalItem(db, { mode: "fact", prompt: "Later", answer: "b", source, due: new Date(NOW.getTime() - DAY).toISOString() });
    await createRetrievalItem(db, { mode: "fact", prompt: "Future", answer: "c", source, due: new Date(NOW.getTime() + DAY).toISOString() });
    await createRetrievalItem(db, { mode: "fact", prompt: "Paused", answer: "d", source, suspended: true, due: new Date(NOW.getTime() - 3 * DAY).toISOString() });
    const due = await dueRetrievals(db, NOW);
    expect(due.map((i) => i.id)).toEqual([late.id, later.id]);
    expect((await dueRetrievals(db, NOW, 1)).map((i) => i.id)).toEqual([late.id]);
  });

  it("reviewRetrieval writes the review, reschedules and records recall evidence on the same day, delayed after a day", async () => {
    const db = freshDb();
    const concept = conceptContent("probability-rules")!;
    const [item] = await createRetrievalForConcept(db, concept, { kind: "lesson", refId: "ls-pr-rules-1" }, NOW);
    const sameDay = new Date(NOW.getTime() + 2 * 3_600_000);
    const first = await reviewRetrieval(db, { item: item!, correct: true, score: 1, confidence: 0.6, latencyMs: 3_000 }, sameDay);
    expect(first.review).toMatchObject({ itemId: item!.id, conceptId: "probability-rules", grade: 5, correct: true, score: 1, intervalBefore: 1, delayDays: 0, mode: item!.mode });
    expect(first.item.reps).toBe(1);
    expect(first.item.lastReviewedAt).toBe(sameDay.toISOString());
    expect(first.review.intervalAfter).toBe(first.item.intervalDays);
    const stored = await db.store("retrieval_items").get(item!.id);
    expect(stored?.reps).toBe(1);

    const evidence = await db.store("concept_evidence").list();
    expect(evidence).toHaveLength(1);
    expect(evidence[0]).toMatchObject({ conceptId: "probability-rules", kind: "recall", score: 1, hintsUsed: 0, scaffolded: false });
    expect(evidence[0]!.source).toMatchObject({ kind: "retrieval", refId: item!.id });

    const later = new Date(sameDay.getTime() + 5 * DAY);
    const second = await reviewRetrieval(db, { item: first.item, correct: false, score: 0.2, confidence: 0.9 }, later);
    expect(second.review).toMatchObject({ grade: 0, correct: false, delayDays: 5 });
    expect(second.item).toMatchObject({ reps: 0, lapses: 1, intervalDays: 0.5 });
    const all = (await db.store("concept_evidence").list()).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    expect(all).toHaveLength(2);
    expect(all[1]).toMatchObject({ kind: "delayed", score: 0.2, correct: false });
    expect(all[1]!.delayDays).toBeCloseTo(5, 1);
    expect(await db.store("retrieval_reviews").count()).toBe(2);
    const mastery = await db.store("concept_mastery").list();
    expect(mastery).toHaveLength(1);
    expect(mastery[0]!.evidenceCount).toBe(2);
  });

  it("reviewRetrieval on an item without a concept writes no evidence", async () => {
    const db = freshDb();
    const item = await createRetrievalItem(db, { mode: "fact", prompt: "Q", answer: "A", source: { kind: "v1", refId: "mem_1" } }, NOW);
    await reviewRetrieval(db, { item, correct: true, score: 1 }, new Date(NOW.getTime() + DAY));
    expect(await db.store("retrieval_reviews").count()).toBe(1);
    expect(await db.store("concept_evidence").count()).toBe(0);
  });

  it("retentionSummary buckets every unsuspended item, keeps the worst bucket per concept and counts failed delayed reviews", async () => {
    const db = freshDb();
    const source = { kind: "lesson", refId: "ls-x" } as const;
    const items = db.store("retrieval_items");
    const mk = (extra: Partial<RetrievalItem>) => ({ ...itemAt(new Date(NOW.getTime() + 15 * DAY)), id: `ret_${counter++}`, ...extra, source });
    await items.putMany([
      mk({ conceptId: "c1", intervalDays: 30, lapses: 0 }), // durable
      mk({ conceptId: "c1", due: new Date(NOW.getTime() - DAY).toISOString() }), // due
      mk({ conceptId: "c2", lapses: 2 }), // fragile
      mk({ conceptId: "c3", intervalDays: 10, due: new Date(NOW.getTime() + DAY).toISOString() }), // decaying
      mk({ conceptId: "c4", suspended: true }),
    ]);
    const reviews = db.store("retrieval_reviews");
    const rev = (delayDays: number, correct: boolean, daysAgo: number) => ({
      id: `rrv_${counter++}`,
      userId: "user_s",
      createdAt: new Date(NOW.getTime() - daysAgo * DAY).toISOString(),
      updatedAt: new Date(NOW.getTime() - daysAgo * DAY).toISOString(),
      itemId: "ret_x",
      grade: (correct ? 4 : 1) as 1 | 4,
      correct,
      score: correct ? 1 : 0,
      mode: "fact" as const,
      intervalBefore: 1,
      intervalAfter: 1,
      delayDays,
    });
    await reviews.putMany([rev(3, false, 2), rev(0, false, 1), rev(4, true, 3), rev(6, false, 10)]);
    const summary = await retentionSummary(db, NOW);
    expect(summary).toMatchObject({ total: 4, durable: 1, due: 1, fragile: 1, decaying: 1, failedDelayed7d: 1 });
    expect(summary.byConcept.get("c1")).toBe("due");
    expect(summary.byConcept.get("c2")).toBe("fragile");
    expect(summary.byConcept.get("c3")).toBe("decaying");
    expect(summary.byConcept.has("c4")).toBe(false);
  });
});
