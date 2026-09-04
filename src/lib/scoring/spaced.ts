import type { MemoryItem } from "@/lib/domain/types";

/**
 * Spaced retrieval. SM-2 lineage with adjustments for latency, confidence and difficulty.
 * grade: 0 blackout, 1 wrong-but-familiar, 2 wrong-easy-recall-after, 3 correct-hard, 4 correct, 5 correct-fast
 */
export interface ReviewInput {
  grade: 0 | 1 | 2 | 3 | 4 | 5;
  latencyMs?: number;
  confidence?: number; // 0..1
}

export function gradeFrom(correct: boolean, latencyMs?: number, confidence?: number): 0 | 1 | 2 | 3 | 4 | 5 {
  if (!correct) {
    if (confidence !== undefined && confidence >= 0.8) return 0; // confidently wrong — hardest lapse
    return 1;
  }
  if (latencyMs !== undefined) {
    if (latencyMs < 4000) return 5;
    if (latencyMs < 12000) return 4;
    return 3;
  }
  return 4;
}

export function schedule(item: Pick<MemoryItem, "ease" | "intervalDays" | "reps" | "lapses">, input: ReviewInput, now = new Date()) {
  let { ease, intervalDays, reps, lapses } = item;
  const g = input.grade;
  if (g < 3) {
    reps = 0;
    lapses += 1;
    intervalDays = g === 0 ? 0.5 : 1;
  } else {
    if (reps === 0) intervalDays = 1;
    else if (reps === 1) intervalDays = 3;
    else intervalDays = Math.round(intervalDays * ease * 10) / 10;
    reps += 1;
  }
  ease = Math.max(1.3, ease + (0.1 - (5 - g) * (0.08 + (5 - g) * 0.02)));
  // Confident-and-correct grows a little faster; hesitant-correct a little slower.
  if (g >= 3 && input.confidence !== undefined) {
    intervalDays = intervalDays * (0.85 + input.confidence * 0.3);
  }
  intervalDays = Math.max(0.5, Math.min(365, Math.round(intervalDays * 10) / 10));
  const due = new Date(now.getTime() + intervalDays * 86400000).toISOString();
  return { ease: Math.round(ease * 100) / 100, intervalDays, reps, lapses, due };
}

export function isDue(item: Pick<MemoryItem, "due" | "suspended">, now = new Date()): boolean {
  return !item.suspended && new Date(item.due).getTime() <= now.getTime();
}

/** Retention risk 0..1 — how likely the item is to be forgotten right now. */
export function retentionRisk(item: Pick<MemoryItem, "due" | "intervalDays" | "lapses">, now = new Date()): number {
  const overdueDays = (now.getTime() - new Date(item.due).getTime()) / 86400000;
  const base = overdueDays <= 0 ? Math.max(0, 0.3 + overdueDays / Math.max(1, item.intervalDays)) : Math.min(1, 0.5 + overdueDays / Math.max(1, item.intervalDays));
  return Math.min(1, base + item.lapses * 0.05);
}
