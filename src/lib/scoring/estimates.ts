import { LEVELS, type Difficulty, type Level, type ResponseFormatWeightKey } from "./types";
import type { SkillEstimate, SkillEvidence } from "@/lib/domain/types";

/**
 * Faculty estimation.
 *
 * Each subskill keeps a latent estimate in [0,1]. New evidence pulls the estimate
 * toward the observed score with a gain that shrinks as evidence mass accumulates,
 * so one task never causes a giant move. Harder tasks, transfer tasks, delayed recall
 * and free responses carry more weight than easy, repeated multiple-choice items.
 */

export const MASS_CAP = 40; // beyond this, the estimate becomes slow to move
const PRIOR = 0.5;

export function difficultyWeight(d: Difficulty): number {
  // 1 → 0.6, 8 → 1.8
  return 0.6 + ((d - 1) / 7) * 1.2;
}

export const FORMAT_WEIGHT: Record<ResponseFormatWeightKey, number> = {
  mcq: 0.8,
  free: 1.2,
  numeric: 1.0,
  sort: 1.0,
  timed: 1.0,
  delayed: 1.3,
};

export function evidenceWeight(input: {
  difficulty: Difficulty;
  format: ResponseFormatWeightKey;
  transfer?: boolean;
}): number {
  const w = difficultyWeight(input.difficulty) * FORMAT_WEIGHT[input.format] * (input.transfer ? 1.5 : 1);
  return Math.round(w * 100) / 100;
}

/** Bayesian-style shrinkage update. */
export function applyEvidence(
  estimate: Pick<SkillEstimate, "value" | "evidenceMass" | "evidenceCount">,
  score: number,
  weight: number,
): { value: number; evidenceMass: number; evidenceCount: number } {
  const clamped = Math.max(0, Math.min(1, score));
  const mass = estimate.evidenceCount === 0 ? 2 : Math.min(estimate.evidenceMass, MASS_CAP); // prior mass of 2
  const gain = weight / (mass + weight);
  const base = estimate.evidenceCount === 0 ? PRIOR : estimate.value;
  const value = base + gain * (clamped - base);
  return {
    value: Math.round(value * 10000) / 10000,
    evidenceMass: Math.min(mass + weight, MASS_CAP + 10),
    evidenceCount: estimate.evidenceCount + 1,
  };
}

export function estimateConfidence(evidenceMass: number, evidenceCount: number): number {
  if (evidenceCount === 0) return 0;
  return Math.round((1 - Math.exp(-evidenceMass / 8)) * 100) / 100;
}

/**
 * Level from value + evidence. Higher levels require more evidence; "exceptional"
 * needs both a very high estimate and a lot of it.
 */
export function levelFor(value: number, evidenceCount: number, confidence: number): Level {
  if (evidenceCount < 3) return "untested";
  if (value >= 0.88 && evidenceCount >= 40 && confidence >= 0.85) return "exceptional";
  if (value >= 0.78 && evidenceCount >= 20) return "advanced";
  if (value >= 0.66 && evidenceCount >= 8) return "sharp";
  if (value >= 0.52) return "reliable";
  return "emerging";
}

export function trendFor(history: { value: number; at: string }[]): "up" | "down" | "flat" {
  if (history.length < 6) return "flat";
  const recent = history.slice(-5);
  const prior = history.slice(-10, -5);
  const avg = (xs: { value: number }[]) => xs.reduce((s, x) => s + x.value, 0) / xs.length;
  const delta = avg(recent) - avg(prior.length ? prior : history.slice(0, 5));
  if (delta > 0.03) return "up";
  if (delta < -0.03) return "down";
  return "flat";
}

export function levelIndex(level: Level): number {
  return LEVELS.indexOf(level);
}

/** Aggregate subskill estimates into a faculty view. */
export function aggregateFaculty(estimates: SkillEstimate[]): {
  value: number;
  evidenceCount: number;
  confidence: number;
  level: Level;
  trend: "up" | "down" | "flat";
} {
  const tested = estimates.filter((e) => e.evidenceCount > 0);
  if (!tested.length) return { value: 0, evidenceCount: 0, confidence: 0, level: "untested", trend: "flat" };
  const mass = tested.reduce((s, e) => s + e.evidenceMass, 0);
  const value = tested.reduce((s, e) => s + e.value * e.evidenceMass, 0) / (mass || 1);
  const evidenceCount = tested.reduce((s, e) => s + e.evidenceCount, 0);
  const confidence = estimateConfidence(mass / Math.max(1, Math.sqrt(tested.length)), evidenceCount);
  const ups = tested.filter((e) => e.trend === "up").length;
  const downs = tested.filter((e) => e.trend === "down").length;
  const trend = ups > downs ? "up" : downs > ups ? "down" : "flat";
  return { value, evidenceCount, confidence, level: levelFor(value, evidenceCount, confidence), trend };
}

export function summarizeEvidence(evidence: SkillEvidence[]): { mean: number; n: number } {
  if (!evidence.length) return { mean: 0, n: 0 };
  return { mean: evidence.reduce((s, e) => s + e.score, 0) / evidence.length, n: evidence.length };
}
