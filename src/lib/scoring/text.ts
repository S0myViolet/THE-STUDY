/** Deterministic text metrics used across Rhetoric, Salon and Curator reviews. */

export const FILLERS = ["um", "uh", "like", "you know", "basically", "actually", "literally", "sort of", "kind of", "i mean", "right"];
export const HEDGES = ["maybe", "perhaps", "i think", "i guess", "probably", "somewhat", "a bit", "sort of", "kind of", "it seems"];
export const LEADING_PATTERNS = [/^(isn'?t|wasn'?t|don'?t you|wouldn'?t you|surely|so you|you must|you admit)/i, /\bright\?$/i, /\bdidn'?t you\b/i, /\bwouldn'?t you agree\b/i];

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function sentenceCount(text: string): number {
  return Math.max(1, text.split(/[.!?]+\s|\n/).filter((s) => s.trim()).length);
}

export function countPhrases(text: string, phrases: string[]): number {
  const t = " " + text.toLowerCase().replace(/[^a-z'\s]/g, " ").replace(/\s+/g, " ") + " ";
  return phrases.reduce((n, p) => n + (t.split(" " + p + " ").length - 1), 0);
}

export function isQuestion(text: string): boolean {
  const t = text.trim();
  return t.endsWith("?") || /^(what|why|how|when|where|who|which|could|would|did|do|does|is|are|can|was|were|tell me|walk me)/i.test(t);
}

export function isLeading(text: string): boolean {
  return LEADING_PATTERNS.some((p) => p.test(text.trim()));
}

export type QuestionKind =
  | "open"
  | "closed"
  | "clarifying"
  | "discriminating"
  | "counterfactual"
  | "motive"
  | "timeline"
  | "evidence"
  | "assumption"
  | "information_value";

/** Rough classification of a question by its opening and content. */
export function classifyQuestion(text: string): QuestionKind {
  const t = text.trim().toLowerCase();
  if (/what if|had .* not|would .* have|suppose|imagine/.test(t)) return "counterfactual";
  if (/^why|motive|what did .* want|what were you hoping|what was .* trying/.test(t)) return "motive";
  if (/^when|what time|before or after|how long|sequence|first|earlier|later|order/.test(t)) return "timeline";
  if (/how do you know|what evidence|what makes you|based on what|how sure|proof|show me/.test(t)) return "evidence";
  if (/assum|taking for granted|are you certain|is it possible that/.test(t)) return "assumption";
  if (/what do you mean|clarify|by .* do you mean|which .* exactly|specifically/.test(t)) return "clarifying";
  if (/which (one|of)|either|or\b.*\?/.test(t) && /or/.test(t)) return "discriminating";
  if (/^(is|are|was|were|did|do|does|can|could|will|would|have|has|had)\b/.test(t)) return "closed";
  return "open";
}

/** Keyword coverage: fraction of key points present in the text. */
export function keyPointCoverage(text: string, keyPoints: string[]): { covered: string[]; missing: string[]; ratio: number } {
  const t = text.toLowerCase();
  const covered: string[] = [];
  const missing: string[] = [];
  for (const kp of keyPoints) {
    const alts = kp.split("|").map((s) => s.trim().toLowerCase());
    if (alts.some((a) => a && t.includes(a))) covered.push(kp);
    else missing.push(kp);
  }
  return { covered, missing, ratio: keyPoints.length ? covered.length / keyPoints.length : 1 };
}
