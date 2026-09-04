/**
 * Observation scoring: coverage (how much of what mattered was noticed)
 * and precision (how much of what was reported was real).
 *
 * A user who recalls 15 details but invents 6 should not outperform someone
 * who accurately recalls 10.
 */

export interface ObservationFact {
  id: string;
  /** canonical text */
  text: string;
  /** alternative phrasings / keywords, lower-case */
  keywords: string[];
  category: "object" | "person" | "position" | "relationship" | "text" | "anomaly" | "count" | "color" | "time";
  importance: 1 | 2 | 3; // 3 = high-information
}

export interface ClaimMatch {
  claim: string;
  factId?: string;
  matched: boolean;
  /** claim was hedged ("maybe", "I think") */
  hedged: boolean;
}

const HEDGES = ["maybe", "i think", "possibly", "not sure", "perhaps", "might", "probably", "i believe", "?"];

const STOP = new Set([
  "the", "a", "an", "was", "were", "is", "are", "there", "on", "in", "of", "and", "to", "at", "it", "with", "near",
  "by", "some", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "i", "saw", "noticed",
  "next", "had", "has", "left", "right",
]);

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokens(s: string): string[] {
  return normalize(s)
    .split(" ")
    .filter((t) => t && !STOP.has(t));
}

/** Does the claim mention this fact? Requires the fact's distinguishing keywords. */
export function claimMatchesFact(claim: string, fact: ObservationFact): boolean {
  const c = normalize(claim);
  const ctoks = new Set(tokens(claim));
  // each keyword group may be multi-word; a fact matches when any keyword phrase appears
  // and, if the fact has a "required" style keyword list, at least 2 tokens overlap.
  for (const kw of fact.keywords) {
    const k = normalize(kw);
    if (!k) continue;
    if (k.includes(" ")) {
      if (c.includes(k)) return true;
      const parts = k.split(" ").filter((p) => !STOP.has(p));
      if (parts.length >= 2 && parts.every((p) => ctoks.has(p))) return true;
    } else if (ctoks.has(k)) {
      return true;
    }
  }
  return false;
}

export function splitClaims(text: string): string[] {
  return text
    .split(/\n|;|\.\s|,\s(?=[a-z])/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
}

export function scoreObservationClaims(
  claims: string[],
  facts: ObservationFact[],
  /** phrases that describe things NOT in the scene (distractors) — count as false claims when matched */
  distractors: { text: string; keywords: string[] }[] = [],
): {
  matches: ClaimMatch[];
  coverage: number;
  precision: number;
  weightedCoverage: number;
  matchedFactIds: string[];
  missedFacts: ObservationFact[];
  falseClaims: string[];
  hedgedFalse: number;
} {
  const matchedFactIds = new Set<string>();
  const matches: ClaimMatch[] = [];
  const falseClaims: string[] = [];
  let hedgedFalse = 0;

  for (const claim of claims) {
    const hedged = HEDGES.some((h) => claim.toLowerCase().includes(h));
    const fact = facts.find((f) => claimMatchesFact(claim, f));
    if (fact) {
      matchedFactIds.add(fact.id);
      matches.push({ claim, factId: fact.id, matched: true, hedged });
      continue;
    }
    const isDistractor = distractors.some((d) => claimMatchesFact(claim, { ...d, id: "d", category: "object", importance: 1 }));
    // Claims that name concrete things absent from the scene are false observations.
    // Vague claims (no content tokens) are ignored rather than punished.
    const concrete = tokens(claim).length >= 1;
    if (isDistractor || concrete) {
      falseClaims.push(claim);
      if (hedged) hedgedFalse++;
    }
    matches.push({ claim, matched: false, hedged });
  }

  const totalImportance = facts.reduce((s, f) => s + f.importance, 0) || 1;
  const matchedImportance = facts.filter((f) => matchedFactIds.has(f.id)).reduce((s, f) => s + f.importance, 0);
  const coverage = facts.length ? matchedFactIds.size / facts.length : 0;
  const weightedCoverage = matchedImportance / totalImportance;
  const reported = matchedFactIds.size + falseClaims.length;
  // Hedged false claims cost half: acknowledging uncertainty is the behaviour we want.
  const precision = reported ? (matchedFactIds.size + hedgedFalse * 0.5) / reported : 1;

  return {
    matches,
    coverage: round(coverage),
    precision: round(precision),
    weightedCoverage: round(weightedCoverage),
    matchedFactIds: [...matchedFactIds],
    missedFacts: facts.filter((f) => !matchedFactIds.has(f.id)),
    falseClaims,
    hedgedFalse,
  };
}

function round(x: number) {
  return Math.round(x * 1000) / 1000;
}

/** Combine coverage and precision into a single evidence score (precision weighted heavily). */
export function observationScore(coverage: number, precision: number): number {
  return round(0.45 * coverage + 0.55 * precision);
}

/** Answer checking for short answers: tolerant to case, articles, punctuation and numerals. */
export function shortAnswerCorrect(answer: string, canonical: string, accept: string[] = []): boolean {
  const norm = (s: string) => normalize(s).replace(/\b(the|a|an)\b/g, "").replace(/\s+/g, " ").trim();
  const a = norm(answer);
  if (!a) return false;
  const cands = [canonical, ...accept].map(norm);
  if (cands.includes(a)) return true;
  // number words
  const words: Record<string, string> = { one: "1", two: "2", three: "3", four: "4", five: "5", six: "6", seven: "7", eight: "8", nine: "9", ten: "10", eleven: "11", twelve: "12" };
  const a2 = a.split(" ").map((t) => words[t] ?? t).join(" ");
  const cands2 = cands.map((c) => c.split(" ").map((t) => words[t] ?? t).join(" "));
  if (cands2.includes(a2)) return true;
  // containment for multiword canonical (e.g. "burgundy notebook" accepts "the notebook was burgundy")
  return cands2.some((c) => {
    const parts = c.split(" ").filter(Boolean);
    return parts.length >= 1 && parts.every((p) => a2.split(" ").includes(p));
  });
}
