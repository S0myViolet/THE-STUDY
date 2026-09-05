/**
 * Deterministic review of a field report.
 *
 * Three heuristics, all cheap and explainable:
 *   completeness  – how many prompts were answered at length (25 words is "in full")
 *   specificity   – concrete markers: numbers, times, colours, quoted text, materials,
 *                   named objects and proper nouns
 *   separation    – whether the writing keeps "I saw" apart from "I think"
 *
 * Nothing here judges the content of what was seen. It cannot; it was not there.
 */
import type { FieldAssignment, FieldReport } from "@/lib/domain/types";
import type { SubskillId } from "@/lib/domain/faculties";
import type { AfterActionInput } from "@/lib/services/after-action";
import type { ErrorType } from "@/lib/domain/errors";
import { countPhrases, wordCount } from "@/lib/scoring/text";
import { clamp } from "@/lib/util/format";

export const FULL_ANSWER_WORDS = 25;
/** Two concrete markers per prompt is full marks for specificity. */
const MARKERS_PER_PROMPT = 2;
/** A single answer can contribute at most this many markers. */
const MARKER_CAP_PER_PROMPT = 6;

export const OBSERVATIONAL_PHRASES = [
  "i saw",
  "i noticed",
  "i heard",
  "i counted",
  "i could see",
  "i could hear",
  "i observed",
  "i read",
  "i watched",
  "i found",
  "i checked",
  "i measured",
  "i looked",
  "i spotted",
  "there was",
  "there were",
  "it said",
  "it read",
  "the sign said",
  "written on",
  "they said",
  "she said",
  "he said",
  "they told me",
  "she told me",
  "he told me",
];

export const INTERPRETIVE_PHRASES = [
  "i think",
  "i thought",
  "i guess",
  "my guess",
  "i assume",
  "i assumed",
  "i suspect",
  "i suppose",
  "i reckon",
  "i imagine",
  "i believe",
  "i'd say",
  "i would say",
  "probably",
  "presumably",
  "perhaps",
  "maybe",
  "likely",
  "seems",
  "seemed",
  "appears",
  "appeared",
  "must have",
  "must be",
  "looks like",
  "looked like",
];

const COLOURS = [
  "black", "white", "grey", "gray", "red", "blue", "green", "yellow", "brown", "orange", "purple", "pink", "beige", "cream", "ivory", "navy", "maroon",
  "crimson", "scarlet", "teal", "turquoise", "olive", "gold", "golden", "silver", "bronze", "copper", "brass", "rust", "ochre", "terracotta", "burgundy",
  "violet", "lilac", "mauve", "tan", "khaki", "charcoal", "amber", "magenta", "indigo",
];

const MATERIALS_AND_OBJECTS = [
  "brick", "bricks", "stone", "concrete", "glass", "steel", "iron", "wood", "wooden", "timber", "marble", "granite", "slate", "tile", "tiles", "plaster",
  "stucco", "sandstone", "limestone", "cornice", "gable", "lintel", "sill", "window", "windows", "door", "doors", "doorway", "shutter", "shutters", "sign",
  "signage", "plaque", "lamp", "lamps", "lamppost", "bench", "benches", "counter", "till", "register", "table", "tables", "chair", "chairs", "stool", "stools",
  "shelf", "shelves", "menu", "receipt", "bell", "clock", "mirror", "poster", "awning", "canopy", "railing", "railings", "fence", "gate", "kerb", "curb",
  "pavement", "drain", "manhole", "bollard", "bin", "scaffold", "scaffolding", "crane", "chimney", "roof", "balcony", "arch", "column", "pillar", "staircase",
  "stairs", "corridor", "aisle", "aisles", "exit", "entrance", "speaker", "speakers", "espresso", "kettle", "cup", "mug", "plate", "bottle", "jar", "tray",
  "cardboard", "plastic", "leather", "velvet", "wool", "cotton", "neon", "typeface", "font", "letters", "lettering", "coin", "coins", "banknote", "paperclip",
  "pallet", "lightbulb", "bulb", "cable", "pipe", "pipes", "gutter", "downpipe", "date", "dated", "foundation stone", "cast iron", "wrought iron",
  // sound sources and street furniture
  "traffic light", "traffic lights", "bus", "van", "lorry", "truck", "car", "cars", "taxi", "tram", "train", "bicycle", "bike", "scooter", "engine",
  "siren", "alarm", "drill", "generator", "fan", "compressor", "extractor", "grinder", "radio", "television", "pigeons", "gulls", "seagull", "crows",
  "bakery", "pharmacy", "library", "church", "school", "pub", "cafe", "café", "bank", "station", "bridge", "tower", "steeple", "spire", "dome",
  // more materials and finishes
  "metal", "metallic", "chrome", "aluminium", "aluminum", "zinc", "lead", "tin", "enamel", "ceramic", "porcelain", "linoleum", "carpet", "laminate",
  "formica", "vinyl", "rubber", "canvas", "paint", "painted", "varnish", "gilt", "gilded", "mosaic", "terrazzo", "parquet", "cobbles", "cobbled", "asphalt", "tarmac",
];

const UNITS = [
  "percent", "per cent", "metres", "meters", "metre", "meter", "feet", "foot", "inches", "inch", "cm", "mm", "km", "miles", "mile", "minutes", "minute",
  "seconds", "hours", "hour", "years", "year", "kilos", "kg", "grams", "litres", "liters", "ml", "pounds", "euros", "dollars", "pence", "cents", "storeys",
  "stories", "floors", "o'clock", "noon", "midday", "midnight",
];

const CALENDAR = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "january", "february", "march", "april", "june", "july", "august",
  "september", "october", "november", "december",
];

const NUMBER_WORDS = [
  "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen",
  "eighteen", "nineteen", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety", "hundred", "thousand", "dozen", "twice", "half a",
];

/** Capitalised words that are not proper nouns in ordinary prose. */
const CAPITAL_STOP = new Set(["I", "The", "A", "An", "It", "My", "We", "They", "He", "She", "You", "This", "That", "There", "Then", "When", "What", "Which", "Not", "No", "Yes", "But", "And", "Or", "So", "If", "In", "On", "At", "Of", "For", "With", "One", "Certain", "Guess", "Think", "Archive", "Study", "Memory", "Palace", "Decisions"]);

export type Concreteness = "concrete" | "thin" | "abstract" | "blank";
export type SeparationVerdict = "kept apart" | "observation only" | "interpretation only" | "unmarked";

export interface PromptAnalysis {
  index: number;
  prompt: string;
  /** Short handle for the prompt, e.g. "Quote the sign" */
  label: string;
  text: string;
  words: number;
  answered: boolean;
  /** At least FULL_ANSWER_WORDS words */
  full: boolean;
  /** Concrete markers found (capped) */
  markers: string[];
  concreteness: Concreteness;
  observational: number;
  interpretive: number;
}

export interface SeparationAnalysis {
  score: number;
  observational: number;
  interpretive: number;
  verdict: SeparationVerdict;
  /** Interpretive phrasing outnumbers observational phrasing heavily */
  dominated: boolean;
}

export interface ReportAnalysis {
  prompts: PromptAnalysis[];
  promptCount: number;
  answered: number;
  full: number;
  /** 0..1 mean of per-prompt credit min(1, words / 25) */
  completeness: number;
  /** 0..1 */
  specificity: number;
  markerCount: number;
  /** A few representative markers, for the debrief */
  sampleMarkers: string[];
  separation: SeparationAnalysis;
  reflectionWords: number;
  /** 0..1 overall */
  score: number;
}

export function responseKey(index: number): string {
  return `p${index}`;
}

export function responseFor(responses: Record<string, string> | undefined, index: number): string {
  if (!responses) return "";
  return responses[responseKey(index)] ?? responses[String(index)] ?? "";
}

/** A short handle for a prompt: its first clause, trimmed. */
export function promptLabel(prompt: string): string {
  const first = prompt.split(/[.?!:;]/)[0]?.trim() ?? prompt;
  let label = first.length > 44 ? first.split(",")[0].trim() : first;
  if (label.length > 44) {
    const cut = label.slice(0, 44);
    label = cut.slice(0, cut.lastIndexOf(" ") > 20 ? cut.lastIndexOf(" ") : 44).trim();
  }
  return label.replace(/^(list|describe|quote|sketch|write|name)\s+/i, (m) => m.toLowerCase()).replace(/^./, (c) => c.toUpperCase());
}

export function sentences(text: string): string[] {
  // Split after sentence punctuation, but not after an initial such as "J." or "St."
  return text
    .split(/(?<!\b[A-Z]\.)(?<!\b(?:St|Mr|Mrs|Ms|Dr|No|Est|Tel|vs|etc)\.)(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Find concrete markers in one answer. Each region of text is counted once. */
export function concreteMarkers(text: string): string[] {
  const found: string[] = [];
  let work = " " + text.replace(/\s+/g, " ") + " ";
  const take = (re: RegExp) => {
    work = work.replace(re, (m) => {
      const t = m.trim();
      if (t) found.push(t);
      return " ".repeat(m.length);
    });
  };
  // Quoted text: the words on a sign, a menu line, what somebody said.
  take(/"[^"\n]{2,80}"|“[^”\n]{2,80}”|‘[^’\n]{2,80}’/g);
  // Times, prices, percentages, plain numbers.
  take(/\b\d{1,2}[:.]\d{2}\s?(?:am|pm|a\.m\.|p\.m\.)?\b/gi);
  take(/\b\d{1,2}\s?(?:am|pm|a\.m\.|p\.m\.)\b/gi);
  take(/[£$€]\s?\d+(?:[.,]\d+)?/g);
  take(/\b\d+(?:[.,]\d+)?\s?(?:%|percent|per cent)/gi);
  take(/\b\d+(?:[.,]\d+)?\b/g);
  const wordList = (words: string[]) => new RegExp(`(?<![a-z])(?:${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/'/g, "['’]")).join("|")})(?![a-z])`, "gi");
  take(wordList(NUMBER_WORDS));
  take(wordList(CALENDAR));
  take(wordList(UNITS));
  take(wordList(COLOURS));
  take(wordList(MATERIALS_AND_OBJECTS));
  // Proper nouns: capitalised words not at the start of a sentence.
  let proper = 0;
  for (const s of sentences(work)) {
    const words = s.split(/\s+/).filter(Boolean);
    for (let i = 1; i < words.length && proper < 3; i++) {
      const w = words[i].replace(/[^A-Za-z'’-]/g, "");
      if (/^[A-Z][a-z’'-]{2,}$/.test(w) && !CAPITAL_STOP.has(w)) {
        found.push(w);
        proper++;
      }
    }
  }
  return found;
}

function concretenessFor(markers: number, answered: boolean): Concreteness {
  if (!answered) return "blank";
  if (markers >= 2) return "concrete";
  if (markers === 1) return "thin";
  return "abstract";
}

export function analyseSeparation(text: string): SeparationAnalysis {
  const observational = countPhrases(text, OBSERVATIONAL_PHRASES);
  const interpretive = countPhrases(text, INTERPRETIVE_PHRASES);
  let score: number;
  let verdict: SeparationVerdict;
  if (observational >= 1 && interpretive >= 1) {
    score = observational >= 2 ? 1 : 0.85;
    verdict = "kept apart";
  } else if (observational >= 1) {
    score = 0.65;
    verdict = "observation only";
  } else if (interpretive >= 1) {
    score = interpretive >= 2 ? 0.2 : 0.4;
    verdict = "interpretation only";
  } else {
    score = 0.5;
    verdict = "unmarked";
  }
  const dominated = interpretive >= 3 && interpretive >= 2 * Math.max(1, observational);
  if (dominated) score = Math.max(0.1, score - 0.3);
  return { score, observational, interpretive, verdict, dominated };
}

export function analyseReport(assignment: Pick<FieldAssignment, "reportPrompts">, report: Pick<FieldReport, "responses" | "reflection">): ReportAnalysis {
  const prompts: PromptAnalysis[] = assignment.reportPrompts.map((prompt, index) => {
    const text = responseFor(report.responses, index).trim();
    const words = wordCount(text);
    const answered = words > 0;
    const markers = concreteMarkers(text).slice(0, MARKER_CAP_PER_PROMPT);
    return {
      index,
      prompt,
      label: promptLabel(prompt),
      text,
      words,
      answered,
      full: words >= FULL_ANSWER_WORDS,
      markers,
      concreteness: concretenessFor(markers.length, answered),
      observational: countPhrases(text, OBSERVATIONAL_PHRASES),
      interpretive: countPhrases(text, INTERPRETIVE_PHRASES),
    };
  });
  const promptCount = prompts.length || 1;
  const completeness = prompts.reduce((s, p) => s + Math.min(1, p.words / FULL_ANSWER_WORDS), 0) / promptCount;
  const markerCount = prompts.reduce((s, p) => s + p.markers.length, 0);
  const specificity = clamp(markerCount / (MARKERS_PER_PROMPT * promptCount), 0, 1);
  const allText = [...prompts.map((p) => p.text), report.reflection ?? ""].join("\n");
  const separation = analyseSeparation(allText);
  const sampleMarkers = uniq(prompts.flatMap((p) => p.markers)).slice(0, 5);
  const score = clamp(0.45 * completeness + 0.35 * specificity + 0.2 * separation.score, 0, 1);
  return {
    prompts,
    promptCount: prompts.length,
    answered: prompts.filter((p) => p.answered).length,
    full: prompts.filter((p) => p.full).length,
    completeness,
    specificity,
    markerCount,
    sampleMarkers,
    separation,
    reflectionWords: wordCount(report.reflection ?? ""),
    score,
  };
}

/* ------------------------------------------------------------------ */
/* Words                                                                */
/* ------------------------------------------------------------------ */

const SMALL = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

export function countWord(n: number): string {
  return n >= 0 && n < SMALL.length ? SMALL[n] : String(n);
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function quoteLabels(ps: PromptAnalysis[], max = 2): string {
  const labels = ps.slice(0, max).map((p) => `‘${p.label}’`);
  const rest = ps.length - labels.length;
  return rest > 0 ? `${labels.join(", ")} and ${countWord(rest)} more` : labels.join(" and ");
}

export const SEPARATION_LABEL: Record<SeparationVerdict, string> = {
  "kept apart": "Kept apart",
  "observation only": "Observation only",
  "interpretation only": "Interpretation only",
  unmarked: "Unmarked",
};

/* ------------------------------------------------------------------ */
/* Debrief: two observations about the report                          */
/* ------------------------------------------------------------------ */

interface Remark {
  text: string;
  /** Positive remarks are strengths; negative ones are the thing to work on */
  tone: "good" | "work";
  /** Higher = more worth saying */
  salience: number;
}

function remarks(a: ReportAnalysis): Remark[] {
  const out: Remark[] = [];
  const n = a.promptCount;
  const thin = a.prompts.filter((p) => p.answered && !p.full);
  const blank = a.prompts.filter((p) => !p.answered);

  // Completeness
  if (blank.length === 0 && thin.length === 0) {
    out.push({ tone: "good", salience: 0.6, text: n === 1 ? "The prompt was answered in full." : `All ${countWord(n)} prompts were answered in full.` });
  } else if (blank.length) {
    out.push({ tone: "work", salience: 0.9 + blank.length / n, text: `${cap(countWord(blank.length))} of ${countWord(n)} prompts ${blank.length === 1 ? "was" : "were"} left blank: ${quoteLabels(blank)}. A blank is fine when you have nothing; say so in a sentence.` });
  } else {
    out.push({ tone: "work", salience: 0.5 + thin.length / n, text: `${cap(countWord(thin.length))} of ${countWord(n)} prompts ran under ${FULL_ANSWER_WORDS} words: ${quoteLabels(thin)}. Short is fine if it is specific; these were short and general.` });
  }

  // Specificity
  const concrete = a.prompts.filter((p) => p.concreteness === "concrete");
  const abstract = a.prompts.filter((p) => p.answered && p.concreteness === "abstract");
  if (concrete.length === n) {
    out.push({ tone: "good", salience: 0.9, text: `Every answer carried concrete detail${a.sampleMarkers.length ? ` (${a.sampleMarkers.slice(0, 3).join(", ")})` : ""}. Someone else could go and check it.` });
  } else if (concrete.length >= Math.ceil(n / 2)) {
    out.push({
      tone: "good",
      salience: 0.7,
      text: abstract.length
        ? `${cap(countWord(concrete.length))} of ${countWord(n)} prompts had concrete detail; ${quoteLabels(abstract, 1)} stayed abstract.`
        : `${cap(countWord(concrete.length))} of ${countWord(n)} prompts had concrete detail; the rest had a single anchor each.`,
    });
  } else if (a.markerCount === 0) {
    out.push({ tone: "work", salience: 1.0, text: "No countable or quotable thing appeared anywhere: no number, time, colour, material or quoted sign. The report reads as impressions." });
  } else {
    out.push({ tone: "work", salience: 0.85, text: `Concrete markers were scarce: ${countWord(a.markerCount)} across the report${abstract.length ? `, none in ${quoteLabels(abstract, 2)}` : ""}. A count, a time or a colour would anchor each answer.` });
  }

  // Separation
  const s = a.separation;
  if (s.dominated) {
    out.push({ tone: "work", salience: 1.05, text: `Interpretive verbs (probably, seems, I think) appeared ${countWord(s.interpretive)} times against ${countWord(s.observational)} observational ${s.observational === 1 ? "one" : "ones"}. Say what you saw before saying what it meant.` });
  } else if (s.verdict === "kept apart") {
    out.push({ tone: "good", salience: 0.8, text: `You kept observation and interpretation apart: ‘I saw’ or ‘I noticed’ ${countWord(s.observational)} ${s.observational === 1 ? "time" : "times"}, ‘I think’ or ‘probably’ ${countWord(s.interpretive)}.` });
  } else if (s.verdict === "interpretation only") {
    out.push({ tone: "work", salience: 0.8, text: "Every marked statement was an interpretation; nothing was flagged as directly seen or heard. The distinction is the exercise." });
  } else if (s.verdict === "observation only") {
    out.push({ tone: "good", salience: 0.4, text: "The report stays with what was seen and never marks a guess. Fine if you had none; the prompts usually invite one." });
  } else {
    out.push({ tone: "work", salience: 0.45, text: "Nothing in the writing marks which sentences are observation and which are inference. ‘I saw’ and ‘I think’ are cheap words; use them." });
  }

  // Reflection
  if (a.reflectionWords === 0) out.push({ tone: "work", salience: 0.3, text: "The reflection was left empty. It is the part that carries over to next month." });
  else if (a.reflectionWords >= 20) out.push({ tone: "good", salience: 0.35, text: "The reflection names a change in what you notice, which is the only progress this room can measure." });

  return out;
}

/** Two observations about the report: one strength and one thing to work on where both exist. */
export function debriefFor(a: ReportAnalysis): [string, string] {
  const rs = remarks(a);
  const good = rs.filter((r) => r.tone === "good").sort((x, y) => y.salience - x.salience);
  const work = rs.filter((r) => r.tone === "work").sort((x, y) => y.salience - x.salience);
  if (good.length && work.length) return [good[0].text, work[0].text];
  const pool = [...good, ...work].sort((x, y) => y.salience - x.salience);
  return [pool[0]?.text ?? "The report was filed.", pool[1]?.text ?? "Nothing else to add."];
}

/* ------------------------------------------------------------------ */
/* After Action                                                         */
/* ------------------------------------------------------------------ */

function excerpt(s: string, max = 140): string {
  const t = s.trim();
  return t.length > max ? t.slice(0, max - 1).trimEnd() + "…" : t;
}

function sentencesWith(a: ReportAnalysis, phrases: string[], max: number): string[] {
  const out: string[] = [];
  for (const p of a.prompts) {
    for (const s of sentences(p.text)) {
      if (out.length >= max) return out;
      if (countPhrases(s, phrases) > 0) out.push(excerpt(s));
    }
  }
  return out;
}

export function oneThingFor(a: ReportAnalysis): string {
  const weakest = [
    { k: "completeness", v: a.completeness },
    { k: "specificity", v: a.specificity },
    { k: "separation", v: a.separation.score },
  ].sort((x, y) => x.v - y.v)[0];
  if (weakest.v >= 0.75) return "Next time you pass, check one item you marked ‘certain’ against the place itself.";
  if (weakest.k === "completeness") {
    const thin = a.prompts.filter((p) => !p.full);
    return `Answer every prompt in a few full sentences; ${quoteLabels(thin, 2)} got less than that.`;
  }
  if (weakest.k === "specificity") return "Anchor each answer with one countable or quotable thing: a number, a time, a colour, the words on the sign.";
  return "Write what you saw before what you think it means: ‘I noticed’ first, ‘probably’ second, in separate sentences.";
}

export function afterActionFor(assignment: Pick<FieldAssignment, "title">, a: ReportAnalysis): Omit<AfterActionInput, "source" | "sessionId" | "at"> {
  const n = a.promptCount;
  const thin = a.prompts.filter((p) => p.answered && !p.full);
  const blank = a.prompts.filter((p) => !p.answered);
  const abstract = a.prompts.filter((p) => p.answered && p.concreteness === "abstract");
  const concrete = a.prompts.filter((p) => p.concreteness === "concrete");

  const saw = sentencesWith(a, OBSERVATIONAL_PHRASES, 3);
  if (!saw.length && a.sampleMarkers.length) saw.push(`Concrete markers recorded: ${a.sampleMarkers.join(", ")}.`);
  if (!saw.length) saw.push("No sentence was marked as a direct observation.");

  const missed: string[] = [];
  if (blank.length) missed.push(`${cap(countWord(blank.length))} ${blank.length === 1 ? "prompt" : "prompts"} left blank: ${quoteLabels(blank, 3)}.`);
  if (thin.length) missed.push(`${cap(countWord(thin.length))} ${thin.length === 1 ? "answer" : "answers"} under ${FULL_ANSWER_WORDS} words: ${quoteLabels(thin, 3)}.`);
  if (abstract.length) missed.push(`No concrete marker in ${quoteLabels(abstract, 3)}.`);
  if (a.separation.verdict === "unmarked") missed.push("Nothing in the writing separates observation from interpretation.");
  if (a.reflectionWords === 0) missed.push("The reflection was not written.");

  const assumed = sentencesWith(a, INTERPRETIVE_PHRASES, 3);
  if (a.separation.dominated) assumed.push("Interpretation outweighed observation across the report.");

  const didWell: string[] = [];
  if (!blank.length && !thin.length) didWell.push(`All ${countWord(n)} prompts answered in full.`);
  else if (a.full >= Math.ceil(n / 2)) didWell.push(`${cap(countWord(a.full))} of ${countWord(n)} prompts answered in full.`);
  if (concrete.length === n) didWell.push("Concrete detail in every answer.");
  else if (concrete.length) didWell.push(`Concrete detail in ${countWord(concrete.length)} of ${countWord(n)} answers.`);
  if (a.separation.verdict === "kept apart" && !a.separation.dominated) didWell.push("Observation and interpretation marked apart.");
  if (a.reflectionWords >= 20) didWell.push("A reflection that names a change in noticing.");
  if (!didWell.length) didWell.push("The assignment was carried out and reported, which is the hard part.");

  return {
    title: `Fieldwork · ${assignment.title}`,
    saw,
    missed,
    assumed,
    didWell,
    oneThing: oneThingFor(a),
    score: a.score,
  };
}

/* ------------------------------------------------------------------ */
/* Evidence                                                             */
/* ------------------------------------------------------------------ */

/** Per-subskill score: separation and detail subskills use their own dimension, blended with the whole. */
export function evidenceScoreFor(subskill: SubskillId, a: ReportAnalysis): number {
  if (subskill === "observation.separation") return clamp(0.6 * a.separation.score + 0.4 * a.score, 0, 1);
  if (subskill === "observation.detail" || subskill === "observation.precision" || subskill === "observation.text" || subskill === "memory.recall")
    return clamp(0.5 * a.specificity + 0.5 * a.score, 0, 1);
  if (subskill.startsWith("calibration.") || subskill === "curiosity.questioning" || subskill === "social.question_quality") return clamp(0.5 * a.completeness + 0.5 * a.score, 0, 1);
  return a.score;
}

export function errorsFor(a: ReportAnalysis): { type: ErrorType; subskill: SubskillId; detail: string }[] {
  const out: { type: ErrorType; subskill: SubskillId; detail: string }[] = [];
  if (a.separation.dominated || (a.separation.verdict === "interpretation only" && a.separation.interpretive >= 2)) {
    out.push({ type: "ASSUMPTION", subskill: "observation.separation", detail: `Field report: ${countWord(a.separation.interpretive)} interpretive phrasings against ${countWord(a.separation.observational)} observational.` });
  }
  if (a.answered >= 2 && a.completeness >= 0.5 && a.specificity < 0.25) {
    out.push({ type: "PRECISION", subskill: "observation.detail", detail: `Field report answered at length with ${countWord(a.markerCount)} concrete markers.` });
  }
  return out;
}

function uniq(xs: string[]): string[] {
  const seen = new Set<string>();
  return xs.filter((x) => {
    const k = x.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
