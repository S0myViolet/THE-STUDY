import { FACULTIES, FACULTY_META, LEVEL_ORDER, subskillsOf, type FacultyId, type Level, type SubskillId } from "@/lib/domain/faculties";
import type { EstimateHistoryPoint, SkillEstimate } from "@/lib/domain/types";
import { aggregateFaculty } from "@/lib/scoring/estimates";

/**
 * Pure derivations for the Profile room. Nothing here touches the database;
 * the room queries collections and hands the arrays to these helpers.
 */

export type Trend = "up" | "down" | "flat";

export interface FacultyView {
  id: FacultyId;
  label: string;
  question: string;
  value: number;
  evidenceCount: number;
  confidence: number;
  confidenceLabel: ConfidenceLabel;
  level: Level;
  trend: Trend;
  estimates: SkillEstimate[];
  lastEvidenceAt?: string;
}

export type ConfidenceLabel = "High" | "Moderate" | "Low" | "None";

/** Estimate confidence (0..1) rendered as words. Never a bare percentage. */
export function confidenceLabel(confidence: number, evidenceCount: number): ConfidenceLabel {
  if (evidenceCount === 0) return "None";
  if (confidence >= 0.75) return "High";
  if (confidence >= 0.45) return "Moderate";
  return "Low";
}

export function facultyViews(estimates: SkillEstimate[]): FacultyView[] {
  return FACULTIES.map((id) => {
    const own = estimates.filter((e) => e.faculty === id);
    const agg = aggregateFaculty(own);
    const last = own.map((e) => e.lastEvidenceAt).filter(Boolean).sort().at(-1);
    return {
      id,
      label: FACULTY_META[id].label,
      question: FACULTY_META[id].question,
      ...agg,
      confidenceLabel: confidenceLabel(agg.confidence, agg.evidenceCount),
      estimates: own,
      lastEvidenceAt: last,
    };
  });
}

/** Subskill rows for one faculty, including untested ones so the list is complete. */
export function subskillRows(faculty: FacultyId, estimates: SkillEstimate[]): { subskill: SubskillId; estimate?: SkillEstimate }[] {
  return subskillsOf(faculty).map((subskill) => ({ subskill, estimate: estimates.find((e) => e.subskill === subskill) }));
}

/**
 * A faculty's history as one line: at each moment any of its subskills was updated,
 * the faculty value is the mean of the latest known value of every subskill seen so far.
 */
export function facultyHistory(estimates: SkillEstimate[], since?: number): EstimateHistoryPoint[] {
  const points: { at: string; t: number; subskill: string; value: number }[] = [];
  for (const e of estimates) for (const h of e.history) points.push({ at: h.at, t: Date.parse(h.at), subskill: e.subskill, value: h.value });
  points.sort((a, b) => a.t - b.t);
  const latest = new Map<string, number>();
  const out: EstimateHistoryPoint[] = [];
  for (const p of points) {
    latest.set(p.subskill, p.value);
    let sum = 0;
    for (const v of latest.values()) sum += v;
    const value = sum / latest.size;
    if (since === undefined || p.t >= since) out.push({ at: p.at, value: Math.round(value * 1000) / 1000 });
  }
  return out;
}

export function isFacultyId(x: string): x is FacultyId {
  return (FACULTIES as readonly string[]).includes(x);
}

export function sortByLevel(views: FacultyView[]): FacultyView[] {
  return [...views].sort((a, b) => LEVEL_ORDER[b.level] - LEVEL_ORDER[a.level] || b.evidenceCount - a.evidenceCount);
}

/* ------------------------------------------------------------------ */
/* Time ranges for the Evidence section                                 */
/* ------------------------------------------------------------------ */

export type Range = "30d" | "90d" | "1y" | "all";

export const RANGE_OPTIONS: { value: Range; label: string }[] = [
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "1y", label: "1Y" },
  { value: "all", label: "ALL" },
];

export const RANGE_DAYS: Record<Range, number | undefined> = { "30d": 30, "90d": 90, "1y": 365, all: undefined };

export function rangeStart(range: Range, now = Date.now()): number | undefined {
  const d = RANGE_DAYS[range];
  return d === undefined ? undefined : now - d * 86400000;
}

export function inRange<T extends { createdAt: string }>(items: T[], since: number | undefined): T[] {
  if (since === undefined) return items;
  return items.filter((i) => Date.parse(i.createdAt) >= since);
}

/** Group by ISO week start (Monday) key YYYY-MM-DD. */
export function weekKey(iso: string): string {
  const d = new Date(iso);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

/** Every week key between two dates inclusive, so gaps render as zero. */
export function weekKeys(fromIso: string, toIso: string): string[] {
  const out: string[] = [];
  const start = new Date(weekKey(fromIso));
  const end = new Date(weekKey(toIso));
  for (let d = start; d.getTime() <= end.getTime(); d = new Date(d.getTime() + 7 * 86400000)) out.push(d.toISOString().slice(0, 10));
  return out;
}

/* ------------------------------------------------------------------ */
/* Retention buckets                                                    */
/* ------------------------------------------------------------------ */

export const RETENTION_BUCKETS: { key: string; label: string; lo: number; hi: number }[] = [
  { key: "d1", label: "< 1 day", lo: 0, hi: 1 },
  { key: "d3", label: "1–3 days", lo: 1, hi: 3 },
  { key: "d7", label: "3–7 days", lo: 3, hi: 7 },
  { key: "d30", label: "1–4 weeks", lo: 7, hi: 30 },
  { key: "d90", label: "1–3 months", lo: 30, hi: 90 },
  { key: "d365", label: "3 months +", lo: 90, hi: Infinity },
];

export function retentionByInterval(reviews: { intervalBefore: number; correct: boolean }[]): { key: string; label: string; n: number; rate: number }[] {
  return RETENTION_BUCKETS.map((b) => {
    const inB = reviews.filter((r) => r.intervalBefore >= b.lo && r.intervalBefore < b.hi);
    const n = inB.length;
    return { key: b.key, label: b.label, n, rate: n ? inB.filter((r) => r.correct).length / n : 0 };
  });
}
