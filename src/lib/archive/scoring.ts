/**
 * Deterministic scoring for "Explain it back" and reading reconstructions.
 * Each key point (a full sentence) is reduced to its distinctive terms and
 * checked with keyPointCoverage; a point counts as recovered when enough of
 * its terms appear in the user's text.
 */
import { keyPointCoverage } from "@/lib/scoring/text";

const STOP = new Set([
  "about", "after", "again", "against", "almost", "along", "also", "among", "another", "around", "because", "before", "began", "being", "between", "both", "called", "could", "did", "does", "during", "each", "either", "every", "first", "from", "have", "having", "however", "into", "itself", "later", "least", "made", "make", "many", "might", "more", "most", "much", "never", "often", "only", "other", "others", "over", "rather", "same", "should", "since", "some", "still", "such", "than", "that", "their", "them", "then", "there", "these", "they", "this", "those", "though", "three", "through", "under", "until", "very", "were", "what", "when", "where", "which", "while", "whose", "with", "within", "without", "would", "years", "which", "where", "whether", "second", "third", "half", "century", "centuries", "thing", "things", "people", "world", "roughly", "nearly", "usually", "always",
]);

export function distinctiveTerms(point: string, cap = 8): string[] {
  const words = point
    .toLowerCase()
    .replace(/[’']s\b/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const out: string[] = [];
  for (const w of words) {
    if (/^\d{3,4}$/.test(w)) {
      if (!out.includes(w)) out.push(w);
      continue;
    }
    if (w.length < 5 || STOP.has(w)) continue;
    const stem = w.length > 7 ? w.slice(0, 6) : w;
    if (!out.some((t) => t.startsWith(stem) || stem.startsWith(t))) out.push(stem);
  }
  return out.slice(0, cap);
}

export interface PointCoverage {
  point: string;
  terms: string[];
  hit: string[];
  ratio: number;
  covered: boolean;
}

export interface ExplainResult {
  points: PointCoverage[];
  covered: string[];
  missing: string[];
  /** 0..1 fraction of points recovered */
  ratio: number;
}

/** A point is recovered when at least 40% of its distinctive terms (min 1, or 2 when it has 4+) appear. */
export function explainCoverage(text: string, points: string[]): ExplainResult {
  const t = text.toLowerCase();
  const out: PointCoverage[] = points.map((point) => {
    const terms = distinctiveTerms(point);
    if (!terms.length) return { point, terms, hit: [], ratio: 0, covered: false };
    const cov = keyPointCoverage(t, terms);
    const need = terms.length >= 4 ? 2 : 1;
    const covered = cov.covered.length >= need && cov.ratio >= 0.4;
    return { point, terms, hit: cov.covered, ratio: cov.ratio, covered };
  });
  const covered = out.filter((p) => p.covered).map((p) => p.point);
  const missing = out.filter((p) => !p.covered).map((p) => p.point);
  return { points: out, covered, missing, ratio: points.length ? covered.length / points.length : 0 };
}

/** Blend a deterministic ratio with a model score when one is available. */
export function blendScore(deterministic: number, model?: number): number {
  if (model === undefined || Number.isNaN(model)) return deterministic;
  return Math.max(0, Math.min(1, (deterministic + model) / 2));
}
