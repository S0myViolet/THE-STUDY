import type { RhetoricFeedback, RhetoricMode, RhetoricPrompt } from "@/lib/domain/types";
import { FILLERS, HEDGES, countPhrases, isLeading, isQuestion, keyPointCoverage, sentenceCount, wordCount } from "@/lib/scoring/text";
import { clamp } from "@/lib/util/format";

/**
 * Deterministic review of a rhetoric exercise. Works with no model and is the
 * baseline every AI review is merged into. Everything here is a heuristic and
 * the copy says so; the point is a fair, repeatable first read.
 */

export interface TextMetrics {
  words: number;
  sentences: number;
  avgSentenceLength: number;
  fillerCount: number;
  hedgeCount: number;
}

export interface RhetoricResponse {
  /** The full text as persisted. For three_people this is the three parts joined with their labels. */
  text: string;
  /** three_people: the three versions in order. */
  parts?: string[];
  /** Timed modes: whether the field was locked by the clock. */
  timedOut?: boolean;
}

export interface StructureCheck {
  label: string;
  ok: boolean;
  /** What to say when it is missing */
  fix: string;
  /** What to say when it is present */
  praise: string;
}

export interface DeterministicReview extends RhetoricFeedback {
  coverage: { covered: string[]; missing: string[]; ratio: number };
  structure: StructureCheck[];
  constraint: { overWords: number; overSentences: number; maxWords?: number; maxSentences?: number };
  /** precision: source vs response */
  reduction?: { sourceWords: number; words: number; ratio: number; sourceHedges: number; hedges: number };
  /** three_people: pairwise vocabulary overlap 0..1 (lower is better) */
  overlap?: number;
}

export function textMetrics(text: string): TextMetrics {
  const words = wordCount(text);
  const sentences = words ? sentenceCount(text) : 0;
  return {
    words,
    sentences,
    avgSentenceLength: sentences ? Math.round((words / sentences) * 10) / 10 : 0,
    fillerCount: countPhrases(text, FILLERS),
    hedgeCount: countPhrases(text, HEDGES),
  };
}

/** Which hedges appear, for naming them in feedback. */
export function hedgesPresent(text: string): string[] {
  const t = " " + text.toLowerCase().replace(/[^a-z'\s]/g, " ").replace(/\s+/g, " ") + " ";
  return HEDGES.filter((h) => t.includes(" " + h + " "));
}

export function fillersPresent(text: string): string[] {
  const t = " " + text.toLowerCase().replace(/[^a-z'\s]/g, " ").replace(/\s+/g, " ") + " ";
  return FILLERS.filter((h) => t.includes(" " + h + " "));
}

function has(text: string, re: RegExp): boolean {
  return re.test(text);
}

function sentencesOf(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function vocabulary(text: string): Set<string> {
  const stop = new Set(["the", "a", "an", "and", "or", "of", "to", "in", "is", "it", "that", "this", "for", "on", "as", "with", "be", "are", "was", "were", "you", "your", "they", "their", "so", "but", "if", "at", "by", "from", "we", "our", "not", "more", "when", "which", "than", "then", "who", "what", "have", "has", "had", "do", "does", "can", "will", "would", "its"]);
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z'\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stop.has(w)),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size && !b.size) return 1;
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  const union = a.size + b.size - inter;
  return union ? inter / union : 0;
}

function endsCleanly(text: string): boolean {
  const t = text.trim();
  return /[.!?"'”’)]$/.test(t);
}

/* ------------------------------------------------------------------ */
/* Mode-specific structure                                              */
/* ------------------------------------------------------------------ */

const CLAIM = /\b(should|should not|shouldn't|must|ought|is not|isn't|would be|i argue|the case for|the case against|is better|is worse|i believe|my view|my position|i think we|we should|yes[,:]|no[,:])\b/i;
const REASON = /\b(because|since|first(ly)?|second(ly)?|for one|for example|for instance|evidence|the data|in \d{4}|\d{4}s|history shows|consider|the reason)\b/i;
const OBJECTION = /\b(but|however|one might say|one might object|some (will|would|might) say|you might say|critics|the objection|objection|admittedly|granted|it is true that|to be fair|the strongest case against|opponents|yet)\b/i;
const ANSWER = /\b(even so|nonetheless|nevertheless|still|that (argument|objection)|this (misses|ignores|overlooks)|the answer|in reply|but that|yet that|which is why|the reply|in response)\b/i;
const ANALOGY_MARKER = /\b(like|as if|imagine|think of|picture|is a kind of|resembles|just as|the way (a|an|that)|similar to|in the same way|compare|as a)\b/i;
const LIMIT_MARKER = /\b(breaks|break down|limit|limits|falls apart|falls down|stops working|stops being|does not capture|doesn't capture|unlike|where it fails|fails when|except that|the difference is|not quite|goes wrong|misleads|only goes so far)\b/i;
const TURN_MARKER = /\b(but|until|then|when|turned out|instead|suddenly|only|except|however|that night|by morning|at last)\b/i;
const PROTAGONIST = /\b(he|she|his|her|they|their|the (sailor|priest|notary|official|clerk|banker|merchant|brothers|soldier|lieutenant|captain|nurse|doctor|woman|man|boy|girl))\b/i;
const CONCRETE = /\b(\d{1,4}|october|november|december|january|february|march|april|may|june|july|august|september|dawn|night|morning|harbour|harbor|street|room|door|table|ship|galley|library|window|hands?|smell|cold|heat|rain|bell)\b/i;
const SUMMARY_WORDS = /\b(in summary|in conclusion|overall|to sum up|this shows that|it is important to note)\b/i;
const SNEER = /\b(stupid|idiot|idiots|dumb|ridiculous|absurd|obviously|nobody sane|just a way|only a fool|so-called|marble building|elites?)\b/i;
const CHARITY = /\b(the concern|the worry|the strongest|the real (point|issue|question)|because|the argument is|at its best|properly understood|the claim is|reasonably|legitimately|the case is)\b/i;

function structureFor(mode: RhetoricMode, r: RhetoricResponse, prompt: RhetoricPrompt, m: TextMetrics): StructureCheck[] {
  const t = r.text;
  const c = prompt.constraints ?? {};
  switch (mode) {
    case "one_sentence":
      return [
        { label: "One sentence", ok: m.sentences === 1, fix: `${m.sentences} sentences. The exercise is one.`, praise: "One sentence, as asked." },
        { label: "No semicolon", ok: !t.includes(";"), fix: "A semicolon is two sentences wearing a coat.", praise: "No semicolon smuggling." },
        { label: "Repeatable length", ok: m.words <= (c.maxWords ?? 35) && m.words >= 8, fix: m.words < 8 ? "Too short to carry the idea." : "Too long to repeat back.", praise: `${m.words} words: a shape one could repeat.` },
      ];
    case "thirty_seconds":
    case "impromptu": {
      const checks: StructureCheck[] = [
        { label: "Clean last sentence", ok: endsCleanly(t), fix: "Trails off. Land the last sentence before the clock.", praise: "Ends on a complete sentence." },
        { label: "No filler", ok: m.fillerCount === 0, fix: `${m.fillerCount} filler${m.fillerCount === 1 ? "" : "s"} (${fillersPresent(t).slice(0, 3).join(", ")}).`, praise: "No filler." },
      ];
      if (mode === "impromptu") {
        checks.unshift(
          { label: "A position", ok: has(t, CLAIM), fix: "No clear position. Take a side in the first sentence.", praise: "A position, stated early." },
          { label: "Reasons", ok: has(t, REASON), fix: "No reason markers. 'Because' and 'for example' are your friends.", praise: "Reasons a listener can follow." },
          { label: "An objection named", ok: has(t, OBJECTION), fix: "The strongest objection is missing. Name it, then answer it.", praise: "The objection is named." },
        );
      } else {
        checks.unshift({ label: "A concrete detail", ok: has(t, CONCRETE) || /\d/.test(t), fix: "No number, place or date. Scale needs a concrete anchor.", praise: "A concrete anchor for the listener." });
      }
      return checks;
    }
    case "three_people": {
      const parts = (r.parts ?? []).map((p) => p.trim());
      const filled = parts.filter(Boolean).length;
      const vocab = parts.map(vocabulary);
      const pairs = [jaccard(vocab[0] ?? new Set(), vocab[1] ?? new Set()), jaccard(vocab[1] ?? new Set(), vocab[2] ?? new Set()), jaccard(vocab[0] ?? new Set(), vocab[2] ?? new Set())];
      const overlap = pairs.reduce((a, b) => a + b, 0) / pairs.length;
      const lengths = parts.map(wordCount);
      const balanced = filled === 3 && Math.max(...lengths) <= Math.max(25, Math.min(...lengths) * 2.5);
      return [
        { label: "Three versions", ok: filled === 3, fix: `${filled} of three listeners answered.`, praise: "All three listeners answered." },
        { label: "Content changes", ok: filled === 3 && overlap < 0.3, fix: "The three versions share most of their vocabulary. Change what you say, not just how.", praise: "The three versions genuinely differ." },
        { label: "Balanced", ok: balanced, fix: "One version is padded while another is starved.", praise: "No version is padded." },
      ];
    }
    case "story":
      return [
        { label: "A person", ok: has(t, PROTAGONIST), fix: "No protagonist. Someone has to be standing in the scene.", praise: "A person with something at stake." },
        { label: "Concrete details", ok: has(t, CONCRETE), fix: "No concrete detail: a place, an hour, an object.", praise: "Concrete details anchor the scene." },
        { label: "A scene, not a summary", ok: !has(t, SUMMARY_WORDS) && m.sentences >= 3, fix: "Reads as a summary. Stay in one moment.", praise: "Stays in one moment rather than summarising." },
        { label: "An arc", ok: has(t, TURN_MARKER) && m.sentences >= 3, fix: "No turn. The reader should end somewhere else.", praise: "There is a turn." },
      ];
    case "anecdote": {
      const ss = sentencesOf(t);
      const last = ss[ss.length - 1] ?? "";
      return [
        { label: "A turn", ok: has(t, TURN_MARKER), fix: "No turn. An anecdote needs the moment where it changes.", praise: "The turn is there." },
        { label: "A scene", ok: has(t, CONCRETE) || has(t, PROTAGONIST), fix: "Told as a summary; give it an hour and a room.", praise: "Told with a scene." },
        { label: "A last line that lands", ok: ss.length >= 3 && wordCount(last) <= 16, fix: "The last line is long. Cut it until it lands.", praise: "The last line is short enough to land." },
      ];
    }
    case "analogy":
      return [
        { label: "An analogy", ok: has(t, ANALOGY_MARKER), fix: "No analogy marker. 'It is like...' then map the parts.", praise: "The analogy is explicit." },
        { label: "Parts mapped", ok: m.sentences >= 2 && (prompt.keyPoints ? keyPointCoverage(t, prompt.keyPoints).ratio >= 0.5 : true), fix: "The parts are not mapped. Which piece stands for which?", praise: "The parts are mapped." },
        { label: "Where it breaks", ok: has(t, LIMIT_MARKER), fix: "No stated limit. An analogy without one is a slogan.", praise: "The limit is named." },
      ];
    case "argument":
      return [
        { label: "A claim", ok: has(t, CLAIM), fix: "No claim sentence. Say what you are arguing.", praise: "A visible claim." },
        { label: "Reasons with evidence", ok: has(t, REASON) && (/\d/.test(t) || /\b(for example|for instance|evidence)\b/i.test(t)), fix: "Reasons without evidence: a period, a number, a mechanism.", praise: "Reasons carry evidence." },
        { label: "An objection", ok: has(t, OBJECTION), fix: "No objection is taken seriously.", praise: "An objection is taken seriously." },
        { label: "The objection answered", ok: has(t, OBJECTION) && has(t, ANSWER), fix: "The objection is named but not answered.", praise: "And answered." },
      ];
    case "steelman":
      return [
        { label: "Charitable", ok: !has(t, SNEER), fix: "Sneers survived the rewrite. Drop them; keep the claims.", praise: "The sneers are gone." },
        { label: "Reasons, not slogans", ok: has(t, CHARITY) || has(t, REASON), fix: "Slogans rather than reasons. Say why a thoughtful person holds this.", praise: "Argued with reasons." },
        { label: "Adds what was missed", ok: (prompt.keyPoints ? keyPointCoverage(t, prompt.keyPoints).ratio : 1) >= 0.5, fix: "The strongest arguments the original missed are still missing.", praise: "Adds arguments the original missed." },
      ];
    case "precision": {
      const src = prompt.source ?? "";
      const srcHedges = countPhrases(src, HEDGES) + countPhrases(src, ["generally", "essentially", "in essence", "a kind of", "very", "quite", "really", "just", "obviously", "currently", "at this moment in time", "as some of you may already be aware", "a number of"]);
      const hedgesNow = countPhrases(t, HEDGES) + countPhrases(t, ["generally", "essentially", "in essence", "a kind of", "very", "quite", "really", "just", "obviously", "currently"]);
      return [
        { label: "Under the limit", ok: m.words <= (c.maxWords ?? 60), fix: `${m.words} words against a limit of ${c.maxWords ?? 60}.`, praise: `${m.words} words, inside the limit.` },
        { label: "Hedges removed", ok: hedgesNow === 0 || hedgesNow < srcHedges / 3, fix: `${hedgesNow} hedge${hedgesNow === 1 ? "" : "s"} still standing.`, praise: "The hedging is gone." },
        { label: "Reads as prose", ok: m.sentences >= 2 && m.avgSentenceLength <= 30 && !/[•\-]\s/.test(t), fix: "Reads as a list of fragments. Two or three real sentences.", praise: "Reads as prose." },
      ];
    }
    case "question": {
      const ss = sentencesOf(t);
      const qs = ss.filter(isQuestion);
      const leading = qs.filter(isLeading);
      const open = qs.filter((q) => /^(what|how|why|tell me|walk me|describe|which)/i.test(q.trim()));
      const longest = Math.max(0, ...qs.map(wordCount));
      return [
        { label: "A question asked", ok: qs.length >= 1, fix: "No question mark, no question.", praise: `${qs.length} question${qs.length === 1 ? "" : "s"}, clearly asked.` },
        { label: "Open, not leading", ok: qs.length >= 1 && leading.length === 0 && open.length >= Math.ceil(qs.length / 2), fix: leading.length ? `Leading: "${leading[0].slice(0, 60)}"` : "Mostly closed questions. Start with what, how or why.", praise: "Open and non-leading." },
        { label: "Askable aloud", ok: qs.length >= 1 && longest <= 30, fix: "A question this long cannot be asked aloud.", praise: "Short enough to ask aloud." },
      ];
    }
  }
}

/* ------------------------------------------------------------------ */
/* Scoring                                                              */
/* ------------------------------------------------------------------ */

const WEIGHTS: Record<RhetoricMode, { structure: number; coverage: number; economy: number }> = {
  one_sentence: { structure: 0.45, coverage: 0.35, economy: 0.2 },
  thirty_seconds: { structure: 0.35, coverage: 0.4, economy: 0.25 },
  three_people: { structure: 0.5, coverage: 0.3, economy: 0.2 },
  story: { structure: 0.5, coverage: 0.3, economy: 0.2 },
  anecdote: { structure: 0.45, coverage: 0.35, economy: 0.2 },
  analogy: { structure: 0.5, coverage: 0.3, economy: 0.2 },
  argument: { structure: 0.5, coverage: 0.3, economy: 0.2 },
  steelman: { structure: 0.4, coverage: 0.4, economy: 0.2 },
  precision: { structure: 0.3, coverage: 0.5, economy: 0.2 },
  question: { structure: 0.55, coverage: 0.25, economy: 0.2 },
  impromptu: { structure: 0.5, coverage: 0.3, economy: 0.2 },
};

/** The deterministic read judges shape, not substance, so it stops short of 100. */
export const DETERMINISTIC_CEILING = 0.92;

export function evaluateDeterministic(prompt: RhetoricPrompt, response: RhetoricResponse): DeterministicReview {
  const mode = prompt.mode;
  const text = response.text;
  const m = textMetrics(text);
  const c = prompt.constraints ?? {};
  const keyPoints = prompt.keyPoints ?? [];
  const coverage = keyPointCoverage(text, keyPoints);
  const structure = structureFor(mode, response, prompt, m);

  const overWords = c.maxWords ? Math.max(0, m.words - c.maxWords) : 0;
  const overSentences = c.maxSentences ? Math.max(0, m.sentences - c.maxSentences) : 0;

  // Economy: inside the limits, without hedges and fillers.
  let economy = 1;
  if (c.maxWords && overWords > 0) economy -= clamp((overWords / c.maxWords) * 1.2, 0.15, 0.6);
  if (overSentences > 0) economy -= clamp(overSentences * 0.15, 0.15, 0.4);
  economy -= clamp(m.hedgeCount * 0.08, 0, 0.3);
  economy -= clamp(m.fillerCount * 0.06, 0, 0.25);
  if (m.words < 5) economy = 0;
  economy = clamp(economy, 0, 1);

  const structureScore = structure.length ? structure.filter((s) => s.ok).length / structure.length : 1;

  let reduction: DeterministicReview["reduction"];
  let overlap: number | undefined;
  let coverageScore = keyPoints.length ? coverage.ratio : structureScore;

  if (mode === "precision" && prompt.source) {
    const sourceWords = wordCount(prompt.source);
    const ratio = sourceWords ? m.words / sourceWords : 1;
    reduction = { sourceWords, words: m.words, ratio, sourceHedges: countPhrases(prompt.source, HEDGES), hedges: m.hedgeCount };
    // Facts must survive: a missing fact costs more here than anywhere else.
    coverageScore = coverage.ratio;
  }
  if (mode === "three_people") {
    const parts = (response.parts ?? []).map(vocabulary);
    if (parts.length === 3) {
      overlap = (jaccard(parts[0], parts[1]) + jaccard(parts[1], parts[2]) + jaccard(parts[0], parts[2])) / 3;
    }
  }

  const w = WEIGHTS[mode];
  let score = w.structure * structureScore + w.coverage * coverageScore + w.economy * economy;
  if (m.words < 5) score = Math.min(score, 0.1);
  if (response.timedOut && !endsCleanly(text)) score -= 0.05;
  // A heuristic cannot vouch for quality, only for shape; it never awards perfection.
  score = Math.round(clamp(score, 0, DETERMINISTIC_CEILING) * 100) / 100;

  const { strengths, improvements } = compose(prompt, text, m, coverage, structure, { overWords, overSentences }, reduction);
  if (!improvements.length) improvements.push(score >= 0.85 ? "Nothing structural to fix. The next test is a harder prompt, or the same one aloud." : "The shape is there; the read cannot judge the substance. Reread it as your harshest listener would.");

  return {
    score,
    strengths,
    improvements,
    metrics: m,
    aiEvaluated: false,
    coverage,
    structure,
    constraint: { overWords, overSentences, maxWords: c.maxWords, maxSentences: c.maxSentences },
    reduction,
    overlap,
  };
}

function firstAlternative(kp: string): string {
  return kp.split("|")[0].trim();
}

function compose(
  prompt: RhetoricPrompt,
  text: string,
  m: TextMetrics,
  coverage: { covered: string[]; missing: string[]; ratio: number },
  structure: StructureCheck[],
  over: { overWords: number; overSentences: number },
  reduction?: DeterministicReview["reduction"],
): { strengths: string[]; improvements: string[] } {
  const strengths: string[] = [];
  const improvements: string[] = [];
  const c = prompt.constraints ?? {};
  const hasPoints = (prompt.keyPoints?.length ?? 0) > 0;

  // Improvements, in order of cost.
  if (m.words < 5) improvements.push("Almost nothing on the page. The review needs a real attempt.");
  if (over.overWords > 0) improvements.push(`Over by ${over.overWords} word${over.overWords === 1 ? "" : "s"}. The limit is ${c.maxWords}; the cut is the exercise.`);
  if (over.overSentences > 0 && c.maxSentences) improvements.push(`${m.sentences} sentences where ${c.maxSentences === 1 ? "one" : c.maxSentences} ${c.maxSentences === 1 ? "was" : "were"} asked for.`);
  for (const s of structure) if (!s.ok) improvements.push(s.fix);
  if (hasPoints && coverage.missing.length) {
    const named = coverage.missing.slice(0, 2).map(firstAlternative);
    improvements.push(prompt.mode === "precision" ? `Facts lost in the cut: ${named.join(", ")}.` : `Not touched: ${named.join("; ")}. A strong answer usually reaches ${coverage.missing.length === 1 ? "it" : "these"}.`);
  }
  if (m.hedgeCount > 0) {
    const named = hedgesPresent(text).slice(0, 3);
    improvements.push(`${m.hedgeCount} hedge${m.hedgeCount === 1 ? "" : "s"}${named.length ? ` (${named.join(", ")})` : ""} soften${m.hedgeCount === 1 ? "s" : ""} the claim. Decide, then say it.`);
  }
  if (m.fillerCount > 0 && !structure.some((s) => s.label === "No filler")) improvements.push(`${m.fillerCount} filler word${m.fillerCount === 1 ? "" : "s"}. Each one is a pause you could have taken silently.`);
  if (m.avgSentenceLength > 32) improvements.push(`Sentences average ${m.avgSentenceLength} words. Break the longest in two.`);

  // Strengths.
  for (const s of structure) if (s.ok) strengths.push(s.praise);
  if (hasPoints && coverage.ratio >= 0.75) strengths.push(`Reaches ${coverage.covered.length} of ${(prompt.keyPoints ?? []).length} points a strong answer touches.`);
  else if (hasPoints && coverage.covered.length) strengths.push(`Touches ${coverage.covered.length} of ${(prompt.keyPoints ?? []).length} key points.`);
  if (c.maxWords && over.overWords === 0 && m.words > 0) strengths.push(`Inside the limit: ${m.words} of ${c.maxWords} words.`);
  if (m.hedgeCount === 0 && m.words >= 10) strengths.push("No hedges.");
  if (reduction && reduction.ratio <= 0.5 && coverage.ratio >= 0.8) strengths.push(`Cut to ${Math.round(reduction.ratio * 100)}% of the original with the facts intact.`);

  // Prefer the structure-specific lines; keep at most two of each.
  return { strengths: dedupe(strengths).slice(0, 2), improvements: dedupe(improvements).slice(0, 2) };
}

function dedupe(xs: string[]): string[] {
  return xs.filter((x, i) => xs.indexOf(x) === i && x.trim());
}

/* ------------------------------------------------------------------ */
/* Merging an AI review                                                 */
/* ------------------------------------------------------------------ */

export interface AIReview {
  score: number;
  strengths: string[];
  improvements: string[];
  rewrite?: string;
}

export type StoredFeedback = RhetoricFeedback & { rewrite?: string; coverage?: number };

/** AI strengths/improvements replace the deterministic ones; the score is averaged; the rewrite is kept. */
export function mergeReview(det: DeterministicReview, ai: AIReview | null): StoredFeedback {
  if (!ai) return { score: det.score, strengths: det.strengths, improvements: det.improvements, metrics: det.metrics, aiEvaluated: false, coverage: det.coverage.ratio };
  const score = Math.round(((det.score + clamp(ai.score, 0, 1)) / 2) * 100) / 100;
  return {
    score,
    strengths: (ai.strengths.length ? ai.strengths : det.strengths).slice(0, 2),
    improvements: (ai.improvements.length ? ai.improvements : det.improvements).slice(0, 2),
    metrics: det.metrics,
    aiEvaluated: true,
    rewrite: ai.rewrite?.trim() || undefined,
    coverage: det.coverage.ratio,
  };
}

/* ------------------------------------------------------------------ */
/* Voice metrics                                                        */
/* ------------------------------------------------------------------ */

export interface VoiceMetrics {
  words: number;
  fillerWords: number;
  /** Undefined when the recording is too short to judge pace (under five seconds). */
  wordsPerMinute?: number;
  hedges: number;
}

export const MIN_PACE_MS = 5000;

export function voiceMetrics(transcript: string, durationMs: number): VoiceMetrics {
  const words = wordCount(transcript);
  const reliable = durationMs >= MIN_PACE_MS;
  return { words, fillerWords: countPhrases(transcript, FILLERS), wordsPerMinute: reliable ? Math.round(words / (durationMs / 60000)) : undefined, hedges: countPhrases(transcript, HEDGES) };
}

/** 0..1 quality of a spoken passage: filler rate and, when the clock allows, a conversational pace band. */
export function voiceScore(m: VoiceMetrics): number {
  if (m.words < 10) return 0.1;
  const fillersPerHundred = (m.fillerWords / m.words) * 100;
  const fillerScore = clamp(1 - fillersPerHundred * 0.12, 0, 1);
  if (m.wordsPerMinute === undefined) return Math.round(clamp(fillerScore, 0, 1) * 100) / 100;
  const pace = m.wordsPerMinute;
  const paceScore = pace >= 120 && pace <= 170 ? 1 : pace >= 95 && pace <= 200 ? 0.7 : pace >= 70 ? 0.4 : 0.2;
  return Math.round(clamp(0.6 * fillerScore + 0.4 * paceScore, 0, 1) * 100) / 100;
}
