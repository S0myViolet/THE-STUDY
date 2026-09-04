import type { ConfidenceEntry } from "@/lib/domain/types";

export interface CalibrationBucket {
  /** lower bound inclusive */
  lo: number;
  hi: number;
  label: string;
  n: number;
  meanConfidence: number;
  accuracy: number;
  /** only trust buckets with n >= MIN_BUCKET */
  sufficient: boolean;
}

export const MIN_BUCKET = 5;

const BUCKETS: [number, number, string][] = [
  [0, 0.55, "50%"],
  [0.55, 0.7, "60%"],
  [0.7, 0.8, "75%"],
  [0.8, 0.9, "85%"],
  [0.9, 1.01, "95%"],
];

export function brier(probability: number, outcome: boolean): number {
  const o = outcome ? 1 : 0;
  return Math.round((probability - o) ** 2 * 10000) / 10000;
}

export function meanBrier(entries: { probability: number; outcome: boolean }[]): number | null {
  if (!entries.length) return null;
  return entries.reduce((s, e) => s + brier(e.probability, e.outcome), 0) / entries.length;
}

export function calibrationBuckets(entries: Pick<ConfidenceEntry, "confidence" | "correct">[]): CalibrationBucket[] {
  return BUCKETS.map(([lo, hi, label]) => {
    const inB = entries.filter((e) => e.confidence >= lo && e.confidence < hi);
    const n = inB.length;
    const meanConfidence = n ? inB.reduce((s, e) => s + e.confidence, 0) / n : (lo + Math.min(hi, 1)) / 2;
    const accuracy = n ? inB.filter((e) => e.correct).length / n : 0;
    return { lo, hi, label, n, meanConfidence, accuracy, sufficient: n >= MIN_BUCKET };
  });
}

export type CalibrationVerdict = "overconfident" | "underconfident" | "well_calibrated" | "insufficient";

/** Overall calibration verdict from sufficient buckets only. */
export function calibrationVerdict(entries: Pick<ConfidenceEntry, "confidence" | "correct">[]): {
  verdict: CalibrationVerdict;
  gap: number; // mean(confidence - accuracy), positive = overconfident
  n: number;
} {
  const buckets = calibrationBuckets(entries).filter((b) => b.sufficient);
  const n = buckets.reduce((s, b) => s + b.n, 0);
  if (n < 10) return { verdict: "insufficient", gap: 0, n };
  const gap = buckets.reduce((s, b) => s + (b.meanConfidence - b.accuracy) * b.n, 0) / n;
  if (gap > 0.08) return { verdict: "overconfident", gap, n };
  if (gap < -0.08) return { verdict: "underconfident", gap, n };
  return { verdict: "well_calibrated", gap, n };
}

/** Score in [0,1] used as calibration evidence for one entry: rewards matching confidence to correctness. */
export function calibrationScore(confidence: number, correct: boolean): number {
  return 1 - brier(confidence, correct);
}
