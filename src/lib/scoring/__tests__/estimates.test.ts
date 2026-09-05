import { describe, expect, it } from "vitest";
import { applyEvidence, estimateConfidence, evidenceWeight, levelFor, MASS_CAP, trendFor } from "@/lib/scoring/estimates";
import { brier, calibrationScore, calibrationVerdict, calibrationBuckets } from "@/lib/scoring/calibration";

describe("evidence weighting", () => {
  it("harder, freer and transferred evidence weighs more", () => {
    const easyMcq = evidenceWeight({ difficulty: 1, format: "mcq" });
    const hardFree = evidenceWeight({ difficulty: 6, format: "free" });
    const transfer = evidenceWeight({ difficulty: 6, format: "free", transfer: true });
    expect(hardFree).toBeGreaterThan(easyMcq);
    expect(transfer).toBeGreaterThan(hardFree);
  });
});

describe("applyEvidence (Bayesian shrinkage)", () => {
  const fresh = { value: 0.5, evidenceMass: 0, evidenceCount: 0 };

  it("moves from the prior toward the score, but not all the way", () => {
    const next = applyEvidence(fresh, 1, 1);
    expect(next.value).toBeGreaterThan(0.5);
    expect(next.value).toBeLessThan(1);
    expect(next.evidenceCount).toBe(1);
  });

  it("moves less as evidence mass accumulates", () => {
    let est = { ...fresh };
    for (let i = 0; i < 6; i++) est = applyEvidence(est, 1, 1);
    const early = applyEvidence(fresh, 0, 1).value - fresh.value;
    const late = applyEvidence(est, 0, 1).value - est.value;
    expect(Math.abs(late)).toBeLessThan(Math.abs(early));
  });

  it("caps evidence mass so estimates never freeze completely", () => {
    let est = { ...fresh };
    for (let i = 0; i < 200; i++) est = applyEvidence(est, 0.9, 2);
    expect(est.evidenceMass).toBeLessThanOrEqual(MASS_CAP + 10);
    const before = est.value;
    for (let i = 0; i < 20; i++) est = applyEvidence(est, 0.1, 2);
    expect(est.value).toBeLessThan(before - 0.1);
  });

  it("clamps scores to [0, 1]", () => {
    expect(applyEvidence(fresh, 5, 1).value).toBeLessThanOrEqual(1);
    expect(applyEvidence(fresh, -5, 1).value).toBeGreaterThanOrEqual(0);
  });

  it("smooths a single outlier", () => {
    let est = { ...fresh };
    for (let i = 0; i < 12; i++) est = applyEvidence(est, 0.85, 1);
    const steady = est.value;
    est = applyEvidence(est, 0, 1);
    expect(est.value).toBeGreaterThan(steady - 0.12);
  });
});

describe("levels", () => {
  it("is untested with fewer than three pieces of evidence, whatever the value", () => {
    expect(levelFor(0.95, 2, 0.9)).toBe("untested");
  });
  it("needs both value and evidence to rise", () => {
    expect(levelFor(0.9, 3, 0.3)).toBe("reliable");
    expect(levelFor(0.7, 10, 0.6)).toBe("sharp");
    expect(levelFor(0.8, 25, 0.8)).toBe("advanced");
    expect(levelFor(0.9, 45, 0.9)).toBe("exceptional");
    expect(levelFor(0.4, 30, 0.9)).toBe("emerging");
  });
  it("estimate confidence grows with mass and starts at zero", () => {
    expect(estimateConfidence(0, 0)).toBe(0);
    expect(estimateConfidence(4, 4)).toBeLessThan(estimateConfidence(16, 16));
  });
});

describe("trend", () => {
  const at = "2026-09-01T00:00:00.000Z";
  it("is flat with little history", () => {
    expect(trendFor([{ value: 0.4, at }, { value: 0.9, at }])).toBe("flat");
  });
  it("reads a sustained rise as up and a fall as down", () => {
    const up = [0.4, 0.42, 0.41, 0.43, 0.44, 0.6, 0.62, 0.61, 0.63, 0.65].map((value) => ({ value, at }));
    const down = [...up].reverse();
    expect(trendFor(up)).toBe("up");
    expect(trendFor(down)).toBe("down");
  });
});

describe("calibration", () => {
  it("brier punishes confident misses most", () => {
    expect(brier(0.95, false)).toBeGreaterThan(brier(0.6, false));
    expect(brier(0.95, true)).toBeLessThan(brier(0.6, true));
  });
  it("a confident miss scores zero as calibration evidence; a hedge scores in between", () => {
    expect(calibrationScore(0.95, false)).toBe(0);
    expect(calibrationScore(0.6, false)).toBeGreaterThan(0);
    expect(calibrationScore(0.6, false)).toBeLessThan(calibrationScore(0.6, true));
    expect(calibrationScore(0.99, true)).toBeGreaterThan(0.99);
  });
  it("calls overconfidence only with enough evidence", () => {
    const few = Array.from({ length: 6 }, () => ({ confidence: 0.9, correct: false }));
    expect(calibrationVerdict(few).verdict).toBe("insufficient");
    const many = Array.from({ length: 30 }, (_, i) => ({ confidence: 0.9, correct: i % 3 === 0 }));
    const v = calibrationVerdict(many);
    expect(v.verdict).toBe("overconfident");
    expect(v.gap).toBeGreaterThan(0.08);
  });
  it("buckets report accuracy against mean confidence", () => {
    const entries = Array.from({ length: 20 }, (_, i) => ({ confidence: 0.7, correct: i < 14 }));
    const b = calibrationBuckets(entries).find((x) => x.n === 20);
    expect(b).toBeTruthy();
    expect(b!.accuracy).toBeCloseTo(0.7, 5);
  });
});
