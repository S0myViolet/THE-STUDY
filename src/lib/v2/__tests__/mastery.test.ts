import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { LocalDatabase } from "@/lib/persistence/local";
import type { Difficulty, TransferLevel } from "@/lib/v2/content-types";
import { CONCEPT_STATES, EVIDENCE_KINDS, type ConceptEvidence, type ConceptMastery, type EvidenceKind } from "@/lib/v2/types";
import {
  DELAY_CAP_DAYS,
  EVIDENCE_WEIGHT,
  HISTORY_CAP,
  MASS_CAP,
  MAX_GAIN,
  PRIOR,
  PRIOR_MASS,
  STATE_META,
  delayDaysFor,
  deriveState,
  difficultyWeight,
  emptyMastery,
  evidenceConfidenceFor,
  evidenceWeight,
  foldEvidence,
  isSuccess,
  markExposed,
  masteryMap,
  rebuildMastery,
  recordConceptEvidence,
  recordConceptEvidenceMany,
  stateLabel,
} from "@/lib/v2/mastery";

const DAY_MS = 86_400_000;
const T0 = Date.UTC(2026, 0, 1);
const iso = (days: number) => new Date(T0 + days * DAY_MS).toISOString();

interface EvOpts {
  delayDays?: number;
  difficulty?: Difficulty;
  scaffolded?: boolean;
  hintsUsed?: number;
  transfer?: TransferLevel;
  at?: string;
}

let seq = 0;
function ev(kind: EvidenceKind, score: number, o: EvOpts = {}): ConceptEvidence {
  const difficulty = o.difficulty ?? 3;
  const scaffolded = o.scaffolded ?? false;
  const hintsUsed = o.hintsUsed ?? 0;
  const delayDays = o.delayDays ?? 0;
  const transfer = o.transfer ?? 0;
  const at = o.at ?? iso(0);
  return {
    id: `ce_${seq++}`,
    userId: "u",
    createdAt: at,
    updatedAt: at,
    conceptId: "bayes-theorem",
    kind,
    score,
    difficulty,
    scaffolded,
    hintsUsed,
    delayDays,
    transfer,
    weight: evidenceWeight({ kind, difficulty, scaffolded, hintsUsed, delayDays, transfer }),
    independent: !scaffolded && hintsUsed === 0,
    source: { kind: "practice", refId: "it-probability-01" },
  };
}

/**
 * A learner's timeline for one concept: each step advances the clock by `delayDays`
 * and folds one piece of evidence, exactly as `recordConceptEvidence` would.
 */
class Timeline {
  row: ConceptMastery;
  day = 0;
  constructor() {
    this.row = emptyMastery("u", "bayes-theorem", iso(0));
  }
  add(kind: EvidenceKind, score: number, o: Omit<EvOpts, "at"> = {}) {
    this.day += o.delayDays ?? 0;
    const e = ev(kind, score, { ...o, at: iso(this.day) });
    expect(delayDaysFor(this.row, e.createdAt)).toBe(o.delayDays ?? 0);
    this.row = foldEvidence(this.row, e, new Date(e.createdAt));
    this.row.state = deriveState(this.row, new Date(e.createdAt));
    return this.row;
  }
  stateAt(daysLater: number) {
    return deriveState(this.row, new Date(T0 + (this.day + daysLater) * DAY_MS));
  }
  /** A lesson checkpoint, three unaided solutions and an explanation: enough mass for confidence to leave "low". */
  learn() {
    this.add("checkpoint", 0.9);
    this.add("independent", 0.9);
    this.add("independent", 0.9);
    this.add("independent", 0.9);
    this.add("explain", 0.9);
    expect(this.row.state).toBe("practicing");
    return this;
  }
}

let counter = 0;
function freshDb(user = "user_m") {
  return new LocalDatabase(user, `the-study-mastery-${Date.now()}-${counter++}`);
}

/* ------------------------------------------------------------------ */

describe("weights", () => {
  it("fixes the kind weights and the difficulty range", () => {
    expect(EVIDENCE_WEIGHT).toEqual({ recognition: 0.4, checkpoint: 0.5, recall: 0.6, guided: 0.6, explain: 0.8, independent: 1.0, delayed: 1.3, application: 1.4, project: 1.4, transfer: 1.5, exam: 1.6 });
    expect(MASS_CAP).toBe(40);
    expect(PRIOR).toBe(0.35);
    expect(difficultyWeight(1)).toBeCloseTo(0.6, 10);
    expect(difficultyWeight(8)).toBeCloseTo(1.8, 10);
    expect(difficultyWeight(4)).toBeGreaterThan(difficultyWeight(3));
  });

  it("multiplies kind, difficulty, scaffolding, hints, delay and transfer", () => {
    expect(evidenceWeight({ kind: "independent", difficulty: 1, scaffolded: false, hintsUsed: 0, delayDays: 0, transfer: 0 })).toBeCloseTo(0.6, 3);
    expect(evidenceWeight({ kind: "independent", difficulty: 1, scaffolded: true, hintsUsed: 0, delayDays: 0, transfer: 0 })).toBeCloseTo(0.42, 3);
    expect(evidenceWeight({ kind: "independent", difficulty: 1, scaffolded: false, hintsUsed: 2, delayDays: 0, transfer: 0 })).toBeCloseTo(0.42, 3);
    // Hints floor at half weight.
    expect(evidenceWeight({ kind: "independent", difficulty: 1, scaffolded: false, hintsUsed: 9, delayDays: 0, transfer: 0 })).toBeCloseTo(0.3, 3);
    // Delay adds up to 50 % and saturates at thirty days.
    expect(evidenceWeight({ kind: "independent", difficulty: 1, scaffolded: false, hintsUsed: 0, delayDays: 15, transfer: 0 })).toBeCloseTo(0.75, 3);
    expect(evidenceWeight({ kind: "independent", difficulty: 1, scaffolded: false, hintsUsed: 0, delayDays: 30, transfer: 0 })).toBeCloseTo(0.9, 3);
    expect(evidenceWeight({ kind: "independent", difficulty: 1, scaffolded: false, hintsUsed: 0, delayDays: 300, transfer: 0 })).toBeCloseTo(0.9, 3);
    expect(DELAY_CAP_DAYS).toBe(30);
    // Transfer adds 20 % per level.
    expect(evidenceWeight({ kind: "independent", difficulty: 1, scaffolded: false, hintsUsed: 0, delayDays: 0, transfer: 3 })).toBeCloseTo(0.96, 3);
    // The heaviest possible piece of evidence.
    expect(evidenceWeight({ kind: "exam", difficulty: 8, scaffolded: false, hintsUsed: 0, delayDays: 30, transfer: 3 })).toBeCloseTo(6.912, 3);
    // The lightest.
    expect(evidenceWeight({ kind: "recognition", difficulty: 1, scaffolded: true, hintsUsed: 4, delayDays: 0, transfer: 0 })).toBeCloseTo(0.084, 3);
  });
});

describe("foldEvidence", () => {
  it("starts from the prior and never mutates its input", () => {
    const start = emptyMastery("u", "bayes-theorem", iso(0));
    const frozen = JSON.stringify(start);
    const next = foldEvidence(start, ev("independent", 1));
    expect(JSON.stringify(start)).toBe(frozen);
    expect(next).not.toBe(start);
    expect(start.state).toBe("not_started");
    expect(start.estimate).toBe(PRIOR);
    expect(next.estimate).toBeGreaterThan(PRIOR);
    expect(next.evidenceCount).toBe(1);
    expect(next.firstExposedAt).toBe(iso(0));
    expect(next.lastEvidenceAt).toBe(iso(0));
    expect(next.lastSuccessAt).toBe(iso(0));
    expect(next.history).toEqual([{ at: iso(0), estimate: next.estimate }]);
  });

  it("uses shrinkage: gain = w / (prior mass + min(mass, cap) + w)", () => {
    const start = emptyMastery("u", "bayes-theorem", iso(0));
    const e = ev("independent", 1, { difficulty: 1 }); // weight 0.6
    const gain = 0.6 / (PRIOR_MASS + 0 + 0.6);
    expect(foldEvidence(start, e).estimate).toBeCloseTo(PRIOR + gain * (1 - PRIOR), 4);
    const second = foldEvidence(foldEvidence(start, e), ev("independent", 0, { difficulty: 1 }));
    const est1 = foldEvidence(start, e).estimate;
    const gain2 = 0.6 / (PRIOR_MASS + 0.6 + 0.6);
    expect(second.estimate).toBeCloseTo(est1 + gain2 * (0 - est1), 4);
  });

  it("lets one item move a fresh estimate by at most 0.35, for every kind of evidence", () => {
    const start = emptyMastery("u", "bayes-theorem", iso(0));
    let largest = 0;
    for (const kind of EVIDENCE_KINDS)
      for (const difficulty of [1, 4, 8] as Difficulty[])
        for (const scaffolded of [false, true])
          for (const hintsUsed of [0, 3])
            for (const delayDays of [0, 30, 90])
              for (const transfer of [0, 3] as TransferLevel[])
                for (const score of [0, 0.5, 1]) {
                  const next = foldEvidence(start, ev(kind, score, { difficulty, scaffolded, hintsUsed, delayDays, transfer }));
                  largest = Math.max(largest, Math.abs(next.estimate - PRIOR));
                }
    expect(largest).toBeLessThanOrEqual(0.35);
    // The heaviest item lands exactly on the gain cap.
    const heaviest = foldEvidence(start, ev("exam", 1, { difficulty: 8, delayDays: 30, transfer: 3 }));
    expect(heaviest.estimate).toBeCloseTo(PRIOR + MAX_GAIN * (1 - PRIOR), 4);
    expect(MAX_GAIN).toBeLessThanOrEqual(0.35 / (1 - PRIOR));
  });

  it("saturates: mass stops growing and the gain settles at w / (prior mass + cap + w)", () => {
    let row = emptyMastery("u", "bayes-theorem", iso(0));
    const e = ev("exam", 1, { difficulty: 8 }); // weight 2.88
    const moves: number[] = [];
    for (let k = 0; k < 60; k++) {
      const next = foldEvidence(row, e);
      moves.push(next.estimate - row.estimate);
      row = next;
    }
    expect(row.evidenceMass).toBeLessThanOrEqual(MASS_CAP + 10);
    expect(row.evidenceMass).toBeGreaterThanOrEqual(MASS_CAP);
    expect(row.evidenceCount).toBe(60);
    // Once the cap is reached the gain is constant: from any estimate, the same item moves it by the same share.
    const floor = e.weight / (PRIOR_MASS + MASS_CAP + e.weight);
    for (const start of [0.2, 0.5, 0.8]) {
      const probe = { ...row, estimate: start };
      expect(foldEvidence(probe, e).estimate - start).toBeCloseTo(floor * (1 - start), 3);
      expect(foldEvidence(probe, ev("exam", 0, { difficulty: 8 })).estimate - start).toBeCloseTo(-floor * start, 3);
    }
    // The first move is far bigger than the last: early evidence counts, late evidence nudges.
    expect(moves[0]!).toBeGreaterThan(moves.at(-1)! * 5);
    expect(row.estimate).toBeLessThan(1);
  });

  it("keeps counts, successes, failures, delayed bookkeeping and a capped history", () => {
    expect(isSuccess(0.7)).toBe(true);
    expect(isSuccess(0.69)).toBe(false);
    const t = new Timeline();
    t.add("guided", 0.5, { scaffolded: true });
    t.add("independent", 0.7);
    t.add("independent", 0.2);
    t.add("independent", 0.1);
    expect(t.row.counts).toEqual({ guided: 1, independent: 3 });
    expect(t.row.successes).toEqual({ independent: 1 });
    expect(t.row.consecutiveFailures).toBe(2);
    expect(t.row.lastSuccessAt).toBe(iso(0));
    expect(t.row.lastDelayedSuccessAt).toBeUndefined();
    t.add("delayed", 0.9, { delayDays: 3 });
    expect(t.row.consecutiveFailures).toBe(0);
    expect(t.row.lastDelayedSuccessAt).toBe(iso(3));
    expect(t.row.longestSuccessfulDelayDays).toBe(3);
    t.add("delayed", 0.3, { delayDays: 12 }); // a failed delayed attempt does not extend the record
    expect(t.row.longestSuccessfulDelayDays).toBe(3);
    expect(t.row.lastDelayedSuccessAt).toBe(iso(3));
    t.add("recall", 0.95, { delayDays: 0.5 }); // under a day is not delayed
    expect(t.row.lastDelayedSuccessAt).toBe(iso(3));
    for (let k = 0; k < HISTORY_CAP + 20; k++) t.add("recognition", 0.8);
    expect(t.row.history).toHaveLength(HISTORY_CAP);
    expect(t.row.evidenceCount).toBe(7 + HISTORY_CAP + 20);
  });

  it("reads the trend from the last ten points", () => {
    let row = emptyMastery("u", "bayes-theorem", iso(0));
    for (let k = 0; k < 5; k++) row = foldEvidence(row, ev("independent", 1));
    expect(row.trend).toBe("flat"); // fewer than six points
    for (let k = 0; k < 5; k++) row = foldEvidence(row, ev("independent", 1));
    expect(row.trend).toBe("up");
    for (let k = 0; k < 10; k++) row = foldEvidence(row, ev("independent", 0));
    expect(row.trend).toBe("down");
    for (let k = 0; k < 30; k++) row = foldEvidence(row, ev("independent", 0.5));
    expect(row.trend).toBe("flat");
  });

  it("clamps scores and ignores non-finite input", () => {
    const start = emptyMastery("u", "bayes-theorem", iso(0));
    expect(foldEvidence(start, ev("independent", 5)).estimate).toBe(foldEvidence(start, ev("independent", 1)).estimate);
    expect(foldEvidence(start, ev("independent", -3)).estimate).toBe(foldEvidence(start, ev("independent", 0)).estimate);
    const bad = { ...ev("independent", 1), weight: Number.NaN };
    expect(foldEvidence(start, bad).estimate).toBe(PRIOR);
  });
});

describe("evidenceConfidenceFor", () => {
  it("is low with little mass or few items, high only with mass, breadth and a strong success", () => {
    const t = new Timeline();
    expect(evidenceConfidenceFor(t.row)).toBe("low");
    t.add("exam", 1, { difficulty: 8 });
    t.add("exam", 1, { difficulty: 8 }); // mass 5.76 — enough count soon, not yet enough mass
    expect(evidenceConfidenceFor(t.row)).toBe("low");
    t.add("exam", 1, { difficulty: 8 }); // mass 8.64, count 3
    expect(evidenceConfidenceFor(t.row)).toBe("medium");
    for (let k = 0; k < 5; k++) t.add("exam", 1, { difficulty: 8 }); // one kind only: mass 23, count 8
    expect(evidenceConfidenceFor(t.row)).toBe("medium");
    t.add("recognition", 0.2); // second kind, but the strong success rule is already met by exams
    expect(evidenceConfidenceFor(t.row)).toBe("high");
  });

  it("needs a delayed, transfer, exam or project success — practice alone stays medium", () => {
    const t = new Timeline();
    for (let k = 0; k < 12; k++) t.add("independent", 1, { difficulty: 8 });
    for (let k = 0; k < 4; k++) t.add("guided", 1, { difficulty: 8 });
    expect(t.row.evidenceMass).toBeGreaterThanOrEqual(20);
    expect(t.row.evidenceCount).toBeGreaterThanOrEqual(8);
    expect(evidenceConfidenceFor(t.row)).toBe("medium");
    t.add("transfer", 0.5, { transfer: 2 }); // a failed transfer does not count
    expect(evidenceConfidenceFor(t.row)).toBe("medium");
    t.add("transfer", 0.8, { transfer: 2 });
    expect(evidenceConfidenceFor(t.row)).toBe("high");
  });
});

describe("deriveState", () => {
  it("walks exposed → understood → practicing → retained → applied → durable on evidence alone", () => {
    const t = new Timeline();
    expect(deriveState(t.row)).toBe("exposed"); // a row with no evidence
    t.add("recognition", 0.3);
    expect(t.row.state).toBe("exposed");
    t.add("checkpoint", 0.8);
    expect(t.row.state).toBe("understood");
    t.add("independent", 0.9);
    expect(t.row.state).toBe("understood"); // one practice attempt is not yet practising
    t.add("independent", 0.9);
    expect(t.row.state).toBe("practicing");
    expect(t.row.estimate).toBeGreaterThanOrEqual(0.5);
    t.add("delayed", 0.9, { delayDays: 2 });
    expect(t.row.state).toBe("retained");
    expect(t.row.estimate).toBeGreaterThanOrEqual(0.6);
    t.add("transfer", 0.85, { transfer: 2 });
    expect(t.row.state).toBe("applied");
    t.add("delayed", 0.9, { delayDays: 8 });
    expect(t.row.state).toBe("applied"); // two delayed successes but only one of a week or more... and confidence
    t.add("delayed", 0.95, { delayDays: 10 });
    expect(t.row.longestSuccessfulDelayDays).toBe(10);
    expect(t.row.successes.delayed).toBe(3);
    expect(t.row.estimate).toBeGreaterThanOrEqual(0.75);
    expect(evidenceConfidenceFor(t.row)).not.toBe("low");
    expect(t.row.state).toBe("durable");
  });

  it("reaches understood by estimate with two pieces of evidence, and practicing needs a success", () => {
    const byEstimate = new Timeline();
    byEstimate.add("recognition", 1);
    expect(byEstimate.row.state).toBe("exposed");
    byEstimate.add("recognition", 1);
    expect(byEstimate.row.estimate).toBeGreaterThanOrEqual(0.5);
    expect(byEstimate.row.state).toBe("understood");

    const noSuccess = new Timeline();
    noSuccess.add("explain", 0.75);
    noSuccess.add("guided", 0.6, { scaffolded: true });
    noSuccess.add("guided", 0.6, { scaffolded: true });
    expect(noSuccess.row.state).toBe("understood");
    noSuccess.add("guided", 0.7, { scaffolded: true });
    expect(noSuccess.row.state).toBe("practicing");
  });

  it("goes applied on a project, application or exam success once the estimate allows it", () => {
    for (const kind of ["project", "application", "exam"] as const) {
      const t = new Timeline();
      t.add(kind, 0.9);
      expect(t.row.estimate).toBeLessThan(0.6); // one item cannot carry a fresh row to applied
      expect(t.row.state, kind).toBe("exposed");
      t.add(kind, 0.9);
      expect(t.row.estimate).toBeGreaterThanOrEqual(0.6);
      expect(t.row.state, kind).toBe("applied");
    }
    const failed = new Timeline();
    failed.add("checkpoint", 0.9);
    failed.add("independent", 0.9);
    failed.add("independent", 0.9);
    failed.add("exam", 0.4);
    expect(failed.row.state).toBe("practicing");
  });

  it("does not grant durable without a week-long delay, a strong estimate, and non-low confidence", () => {
    const shortDelays = new Timeline();
    shortDelays.add("checkpoint", 0.9);
    shortDelays.add("independent", 0.9);
    shortDelays.add("independent", 0.9);
    shortDelays.add("delayed", 0.9, { delayDays: 3 });
    shortDelays.add("delayed", 0.9, { delayDays: 4 });
    shortDelays.add("delayed", 0.9, { delayDays: 5 });
    expect(shortDelays.row.successes.delayed).toBe(3);
    expect(shortDelays.row.estimate).toBeGreaterThanOrEqual(0.75);
    expect(shortDelays.row.state).toBe("retained");

    const lowConfidence = new Timeline();
    lowConfidence.add("explain", 1, { difficulty: 8 });
    lowConfidence.add("delayed", 1, { delayDays: 7, difficulty: 2 });
    lowConfidence.add("delayed", 1, { delayDays: 7, difficulty: 2 });
    expect(lowConfidence.row.successes.delayed).toBe(2);
    expect(lowConfidence.row.longestSuccessfulDelayDays).toBe(7);
    expect(lowConfidence.row.estimate).toBeGreaterThanOrEqual(0.75);
    expect(lowConfidence.row.evidenceMass).toBeLessThan(6);
    expect(evidenceConfidenceFor(lowConfidence.row)).toBe("low");
    expect(lowConfidence.row.state).toBe("retained");
  });

  it("turns fragile when a delayed retrieval fails, and durable again after new delayed successes", () => {
    const t = new Timeline().learn();
    t.add("delayed", 0.9, { delayDays: 8 });
    expect(t.row.state).toBe("retained");
    t.add("delayed", 0.95, { delayDays: 10 });
    expect(t.row.estimate).toBeGreaterThanOrEqual(0.75);
    expect(evidenceConfidenceFor(t.row)).toBe("medium");
    expect(t.row.state).toBe("durable");

    t.add("delayed", 0.2, { delayDays: 5 });
    expect(t.row.state).toBe("fragile");
    expect(t.row.estimate).toBeGreaterThanOrEqual(0.6); // fragile is about the failure, not the estimate
    // Same-session repair is not a delayed success; the concept stays fragile.
    t.add("recall", 1, { delayDays: 0 });
    expect(t.row.state).toBe("fragile");
    // Practice a day later that fails keeps it fragile.
    t.add("independent", 0.4, { delayDays: 1 });
    expect(t.row.state).toBe("fragile");

    t.add("delayed", 1, { delayDays: 6 });
    expect(t.row.state).toBe("retained"); // the failure is behind it; the estimate has yet to recover
    t.add("delayed", 1, { delayDays: 9 });
    t.add("delayed", 1, { delayDays: 12 });
    expect(t.row.estimate).toBeGreaterThanOrEqual(0.75);
    expect(t.row.state).toBe("durable");
  });

  it("turns fragile by decay when nothing is heard for longer than max(21, 2 × longest delay) days", () => {
    const t = new Timeline().learn();
    t.add("delayed", 0.9, { delayDays: 8 });
    t.add("delayed", 0.95, { delayDays: 10 });
    expect(t.row.state).toBe("durable");
    expect(t.stateAt(20)).toBe("durable");
    expect(t.stateAt(21)).toBe("durable");
    expect(t.stateAt(21.5)).toBe("fragile");
    expect(t.stateAt(60)).toBe("fragile");

    const longDelay = new Timeline().learn();
    longDelay.add("delayed", 0.9, { delayDays: 8 });
    longDelay.add("delayed", 0.95, { delayDays: 20 });
    expect(longDelay.row.state).toBe("durable");
    expect(longDelay.stateAt(39)).toBe("durable"); // window is 2 × 20 = 40 days
    expect(longDelay.stateAt(41)).toBe("fragile");

    // Retained concepts decay too; a concept that was never retained cannot become fragile.
    const retained = new Timeline().learn();
    retained.add("delayed", 0.9, { delayDays: 3 });
    expect(retained.row.state).toBe("retained");
    expect(retained.stateAt(22)).toBe("fragile");
    const neverRetained = new Timeline();
    neverRetained.add("checkpoint", 0.9);
    expect(neverRetained.stateAt(400)).toBe("understood");
  });

  it("returns to durable when a delayed success arrives after decay", () => {
    const t = new Timeline().learn();
    t.add("delayed", 0.9, { delayDays: 8 });
    t.add("delayed", 0.95, { delayDays: 10 });
    expect(t.stateAt(30)).toBe("fragile");
    t.add("delayed", 0.9, { delayDays: 30 });
    expect(t.row.state).toBe("durable");
    expect(t.row.longestSuccessfulDelayDays).toBe(30);
    expect(t.stateAt(59)).toBe("durable");
    expect(t.stateAt(61)).toBe("fragile");
  });
});

describe("labels", () => {
  it("names every state for the UI with a tone from the palette", () => {
    for (const s of CONCEPT_STATES) {
      expect(STATE_META[s].label.length).toBeGreaterThan(0);
      expect(STATE_META[s].description.length).toBeGreaterThan(10);
      expect(["neutral", "brass", "forest", "wine"]).toContain(STATE_META[s].tone);
      expect(stateLabel(s)).toBe(STATE_META[s].label);
    }
    expect(STATE_META.fragile.tone).toBe("wine");
    expect(STATE_META.durable.tone).toBe("forest");
  });
});

/* ------------------------------------------------------------------ */
/* Database wrappers                                                    */
/* ------------------------------------------------------------------ */

describe("recordConceptEvidence", () => {
  it("writes the evidence and a mastery row whose state is derived after the fold", async () => {
    const db = freshDb();
    const { evidence, mastery } = await recordConceptEvidence(db, {
      conceptId: "bayes-theorem",
      kind: "checkpoint",
      score: 0.85,
      correct: true,
      difficulty: 3,
      confidence: 0.7,
      latencyMs: 4200,
      source: { kind: "lesson", refId: "ls-pr-conditional-1" },
      planItemId: "pi_1",
      at: iso(0),
    });
    expect(evidence.delayDays).toBe(0);
    expect(evidence.independent).toBe(true);
    expect(evidence.scaffolded).toBe(false);
    expect(evidence.hintsUsed).toBe(0);
    expect(evidence.transfer).toBe(0);
    expect(evidence.weight).toBeCloseTo(evidenceWeight({ kind: "checkpoint", difficulty: 3, scaffolded: false, hintsUsed: 0, delayDays: 0, transfer: 0 }), 6);
    expect(evidence.confidence).toBe(0.7);
    expect(evidence.latencyMs).toBe(4200);
    expect(evidence.planItemId).toBe("pi_1");
    expect(evidence.createdAt).toBe(iso(0));

    expect(mastery.conceptId).toBe("bayes-theorem");
    expect(mastery.userId).toBe("user_m");
    expect(mastery.state).toBe("understood");
    expect(mastery.state).toBe(deriveState(mastery, new Date(iso(0))));
    expect(mastery.evidenceCount).toBe(1);
    expect(mastery.lastEvidenceAt).toBe(iso(0));

    expect(await db.store("concept_evidence").count()).toBe(1);
    const rows = await db.store("concept_mastery").list();
    expect(rows).toHaveLength(1);
    expect(rows[0]!.id).toBe(mastery.id);
    expect(rows[0]!.estimate).toBe(mastery.estimate);
  });

  it("computes delayDays from the row's lastEvidenceAt and keeps one row per concept", async () => {
    const db = freshDb();
    const source = { kind: "practice" as const, refId: "it-probability-02" };
    const first = await recordConceptEvidence(db, { conceptId: "bayes-theorem", kind: "independent", score: 0.9, difficulty: 3, source, at: iso(0) });
    const second = await recordConceptEvidence(db, { conceptId: "bayes-theorem", kind: "independent", score: 0.9, difficulty: 3, hintsUsed: 1, source, at: iso(3) });
    expect(second.evidence.delayDays).toBe(3);
    expect(second.evidence.independent).toBe(false);
    expect(second.evidence.weight).toBeCloseTo(evidenceWeight({ kind: "independent", difficulty: 3, scaffolded: false, hintsUsed: 1, delayDays: 3, transfer: 0 }), 6);
    expect(second.mastery.id).toBe(first.mastery.id);
    expect(second.mastery.evidenceCount).toBe(2);
    expect(second.mastery.lastDelayedSuccessAt).toBe(iso(3));
    expect(second.mastery.longestSuccessfulDelayDays).toBe(3);
    expect(second.mastery.state).toBe("retained");
    expect(await db.store("concept_mastery").count()).toBe(1);
    expect(await db.store("concept_evidence").count()).toBe(2);

    // A same-session follow-up has no delay; a clock that runs backwards never yields a negative delay.
    const third = await recordConceptEvidence(db, { conceptId: "bayes-theorem", kind: "recall", score: 1, difficulty: 3, source, at: iso(3.2) });
    expect(third.evidence.delayDays).toBeCloseTo(0.2, 2);
    const fourth = await recordConceptEvidence(db, { conceptId: "bayes-theorem", kind: "recall", score: 1, difficulty: 3, source, at: iso(1) });
    expect(fourth.evidence.delayDays).toBe(0);
  });

  it("clamps the score and floors hints", async () => {
    const db = freshDb();
    const { evidence } = await recordConceptEvidence(db, { conceptId: "base-rates", kind: "guided", score: 1.7, difficulty: 2, scaffolded: true, hintsUsed: -2, source: { kind: "practice", refId: "x" } });
    expect(evidence.score).toBe(1);
    expect(evidence.hintsUsed).toBe(0);
    expect(evidence.independent).toBe(false);
  });

  it("promotes an exposed row through evidence without duplicating it", async () => {
    const db = freshDb();
    await markExposed(db, ["bayes-theorem"], { kind: "lesson", refId: "ls-pr-conditional-1" });
    const before = (await db.store("concept_mastery").list())[0]!;
    expect(before.state).toBe("exposed");
    const { mastery } = await recordConceptEvidence(db, { conceptId: "bayes-theorem", kind: "checkpoint", score: 0.9, difficulty: 3, source: { kind: "lesson", refId: "ls-pr-conditional-1" } });
    expect(mastery.id).toBe(before.id);
    expect(mastery.state).toBe("understood");
    expect(mastery.firstExposedAt).toBe(before.firstExposedAt);
    expect(await db.store("concept_mastery").count()).toBe(1);
  });

  it("records many in order and returns the final row per concept, first seen first", async () => {
    const db = freshDb();
    const source = { kind: "exam" as const, refId: "ea_1" };
    const rows = await recordConceptEvidenceMany(db, [
      { conceptId: "bayes-theorem", kind: "exam", score: 1, difficulty: 4, source, at: iso(0) },
      { conceptId: "base-rates", kind: "exam", score: 0.2, difficulty: 4, source, at: iso(0) },
      { conceptId: "bayes-theorem", kind: "exam", score: 1, difficulty: 4, source, at: iso(0.01) },
    ]);
    expect(rows.map((r) => r.conceptId)).toEqual(["bayes-theorem", "base-rates"]);
    expect(rows[0]!.evidenceCount).toBe(2);
    expect(rows[0]!.state).toBe("applied");
    expect(rows[1]!.evidenceCount).toBe(1);
    expect(rows[1]!.state).toBe("exposed");
    expect(await db.store("concept_evidence").count()).toBe(3);
  });
});

describe("markExposed", () => {
  it("creates exposed rows at the prior without evidence, and leaves existing rows alone", async () => {
    const db = freshDb();
    await recordConceptEvidence(db, { conceptId: "conditional-probability", kind: "independent", score: 1, difficulty: 2, source: { kind: "practice", refId: "x" } });
    const known = (await db.store("concept_mastery").list())[0]!;

    await markExposed(db, ["bayes-theorem", "base-rates", "bayes-theorem", "conditional-probability"], { kind: "lesson", refId: "ls-pr-conditional-1" });
    const rows = await db.store("concept_mastery").list({ orderBy: "conceptId" });
    expect(rows.map((r) => r.conceptId)).toEqual(["base-rates", "bayes-theorem", "conditional-probability"]);
    for (const r of rows.filter((x) => x.conceptId !== "conditional-probability")) {
      expect(r.state).toBe("exposed");
      expect(r.estimate).toBe(PRIOR);
      expect(r.evidenceCount).toBe(0);
      expect(r.evidenceMass).toBe(0);
      expect(r.firstExposedAt).toBeDefined();
      expect(r.lastEvidenceAt).toBeUndefined();
    }
    const untouched = rows.find((x) => x.conceptId === "conditional-probability")!;
    expect(untouched.estimate).toBe(known.estimate);
    expect(untouched.state).toBe(known.state);
    expect(await db.store("concept_evidence").count()).toBe(1);

    await markExposed(db, ["bayes-theorem"], { kind: "reading", refId: "src-x" });
    expect(await db.store("concept_mastery").count()).toBe(3);
    await markExposed(db, [], { kind: "reading", refId: "src-x" });
    expect(await db.store("concept_mastery").count()).toBe(3);
  });

  it("refuses a source without a kind and a reference", async () => {
    const db = freshDb();
    await expect(markExposed(db, ["bayes-theorem"], { kind: "lesson", refId: "" })).rejects.toThrow();
    expect(await db.store("concept_mastery").count()).toBe(0);
  });
});

/** The same record as `Timeline.learn()` plus two week-long delayed successes: durable on day 18. */
const DURABLE_STEPS: { kind: EvidenceKind; score: number; day: number }[] = [
  { kind: "checkpoint", score: 0.9, day: 0 },
  { kind: "independent", score: 0.9, day: 0.001 },
  { kind: "independent", score: 0.9, day: 0.002 },
  { kind: "independent", score: 0.9, day: 0.003 },
  { kind: "explain", score: 0.9, day: 0.004 },
  { kind: "delayed", score: 0.9, day: 8 },
  { kind: "delayed", score: 0.95, day: 18 },
];

describe("masteryMap and rebuildMastery", () => {
  it("keys rows by concept and re-derives decay for the moment asked about", async () => {
    const db = freshDb();
    const source = { kind: "retrieval" as const, refId: "ri_1" };
    for (const s of DURABLE_STEPS) await recordConceptEvidence(db, { conceptId: "bayes-theorem", kind: s.kind, score: s.score, difficulty: 3, source, at: iso(s.day) });
    await markExposed(db, ["base-rates"], { kind: "lesson", refId: "ls-x" });

    const soon = await masteryMap(db, new Date(iso(20)));
    expect([...soon.keys()].sort()).toEqual(["base-rates", "bayes-theorem"]);
    expect(soon.get("bayes-theorem")!.state).toBe("durable");
    expect(soon.get("base-rates")!.state).toBe("exposed");

    const later = await masteryMap(db, new Date(iso(60)));
    expect(later.get("bayes-theorem")!.state).toBe("fragile");
    expect(later.get("base-rates")!.state).toBe("exposed");
    // Re-deriving is read-only: the stored row keeps the state written at the last evidence.
    expect((await db.store("concept_mastery").list({ where: { conceptId: "bayes-theorem" } }))[0]!.state).toBe("durable");
  });

  it("replays the evidence log into identical rows, keeping ids and exposure-only rows", async () => {
    const db = freshDb();
    const source = { kind: "practice" as const, refId: "it-1" };
    const plan: { conceptId: string; kind: EvidenceKind; score: number; day: number; transfer?: TransferLevel }[] = [
      { conceptId: "bayes-theorem", kind: "checkpoint", score: 0.8, day: 0 },
      { conceptId: "base-rates", kind: "independent", score: 0.3, day: 0 },
      { conceptId: "bayes-theorem", kind: "independent", score: 0.9, day: 1 },
      { conceptId: "bayes-theorem", kind: "independent", score: 1, day: 1.001 },
      { conceptId: "base-rates", kind: "independent", score: 0.9, day: 2 },
      { conceptId: "base-rates", kind: "explain", score: 1, day: 2.001 },
      { conceptId: "bayes-theorem", kind: "delayed", score: 0.9, day: 9 },
      { conceptId: "bayes-theorem", kind: "transfer", score: 0.8, day: 9.001, transfer: 2 },
      { conceptId: "base-rates", kind: "delayed", score: 0.9, day: 12 },
      { conceptId: "bayes-theorem", kind: "delayed", score: 0.9, day: 20 },
    ];
    for (const p of plan) await recordConceptEvidence(db, { conceptId: p.conceptId, kind: p.kind, score: p.score, difficulty: 3, transfer: p.transfer, source, at: iso(p.day) });
    await markExposed(db, ["conditional-probability"], { kind: "lesson", refId: "ls-x" });

    const before = await db.store("concept_mastery").list({ orderBy: "conceptId" });
    // The store stamps `updatedAt` on every write, so it is the one field a replay cannot reproduce.
    const strip = (r: ConceptMastery): ConceptMastery => ({ ...r, updatedAt: "" });

    // Corrupt every row, add a stray duplicate, then rebuild.
    for (const r of before) await db.store("concept_mastery").put({ ...r, estimate: 0.01, state: "exposed", counts: {}, successes: {}, evidenceCount: 0, evidenceMass: 0, history: [], longestSuccessfulDelayDays: 0, trend: "flat" });
    const stray = { ...emptyMastery("user_m", "bayes-theorem", iso(30)), id: "cm_stray" };
    await db.store("concept_mastery").put(stray);
    expect(await db.store("concept_mastery").count()).toBe(4);

    await rebuildMastery(db, new Date(iso(21)));

    const after = await db.store("concept_mastery").list({ orderBy: "conceptId" });
    expect(after).toHaveLength(3);
    expect(after.map(strip)).toEqual(before.map(strip));
    expect(after.find((r) => r.conceptId === "bayes-theorem")!.state).toBe("durable");
    expect(after.find((r) => r.conceptId === "base-rates")!.state).toBe("retained");
    expect(after.find((r) => r.conceptId === "conditional-probability")!.state).toBe("exposed");
    expect(await db.store("concept_evidence").count()).toBe(plan.length);
  });

  it("creates rows for evidence that has none, and derives state for the rebuild moment", async () => {
    const db = freshDb();
    const source = { kind: "practice" as const, refId: "it-1" };
    for (const s of DURABLE_STEPS) await recordConceptEvidence(db, { conceptId: "bayes-theorem", kind: s.kind, score: s.score, difficulty: 3, source, at: iso(s.day) });
    const row = (await db.store("concept_mastery").list())[0]!;
    expect(row.state).toBe("durable");
    await db.store("concept_mastery").delete(row.id);
    expect(await db.store("concept_mastery").count()).toBe(0);

    await rebuildMastery(db, new Date(iso(60)));
    const rebuilt = (await db.store("concept_mastery").list())[0]!;
    expect(rebuilt.conceptId).toBe("bayes-theorem");
    expect(rebuilt.createdAt).toBe(iso(0));
    expect(rebuilt.evidenceCount).toBe(DURABLE_STEPS.length);
    expect(rebuilt.estimate).toBe(row.estimate);
    expect(rebuilt.state).toBe("fragile"); // 42 days of silence at the rebuild moment
  });
});
