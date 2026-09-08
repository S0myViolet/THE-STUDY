/**
 * THE STUDY V2 — deterministic grading and error classification.
 *
 * `gradeItem` handles every item format without a model: numbers with thousands
 * separators, units, percent signs and fractions; multiple choice by index, letter
 * or option text; orderings by index or option arrays with Kendall-style partial
 * credit; short answers normalised for case, punctuation, articles and whitespace;
 * free answers by key-point coverage. `classifyError` follows the contract order.
 */
import type { CommonError, ErrorCategory, ItemFormat, PracticeItem, SkillArea, TransferLevel } from "./content-types";
import type { EvidenceKind, ExamItemSnapshot, PracticeContext } from "./types";

export type GradeableItem = PracticeItem | ExamItemSnapshot;

export interface GradeResult {
  /** False when the item cannot be graded offline (free items without key points). */
  gradeable: boolean;
  correct?: boolean;
  /** 0..1 */
  score: number;
  covered?: string[];
  missed?: string[];
}

/* ------------------------------------------------------------------ */
/* Text normalisation                                                   */
/* ------------------------------------------------------------------ */

const QUOTE_MAP: Record<string, string> = { "‘": "'", "’": "'", "“": '"', "”": '"', "−": "-", "–": "-", "—": "-" };

/**
 * Lower case, diacritics removed, typographic quotes and minus signs straightened,
 * punctuation replaced by spaces (a decimal point, a fraction slash or a leading minus
 * next to digits is kept), articles dropped, whitespace collapsed.
 */
export function normalizeText(s: string): string {
  let t = String(s ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[‘’“”−–—]/g, (ch) => QUOTE_MAP[ch] ?? ch);
  t = t.replace(/[^\p{L}\p{N}\s]/gu, (ch, offset: number, str: string) => {
    const prev = str[offset - 1] ?? "";
    const next = str[offset + 1] ?? "";
    if ((ch === "." || ch === "/") && /\d/.test(prev) && /\d/.test(next)) return ch;
    if (ch === "-" && /\d/.test(next) && !/[\p{L}\p{N}]/u.test(prev)) return ch;
    return " ";
  });
  t = t.replace(/\b(the|a|an)\b/g, " ");
  return t.replace(/\s+/g, " ").trim();
}

/** Normalised text with all spaces removed, for tolerant comparison of expressions such as "x + 3" and "x+3". */
function compact(s: string): string {
  return normalizeText(s).replace(/\s+/g, "");
}

/* ------------------------------------------------------------------ */
/* Numbers                                                              */
/* ------------------------------------------------------------------ */

const SUPERSCRIPTS: Record<string, string> = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "-" };

/**
 * Parses a learner's numeric response: "1,500", "£2.50", "25 %", "-2", "−2", "3/4",
 * "1 1/2", "0.75", "1.5e3", "3 × 10⁵", "≈ 40 km". Returns undefined when nothing numeric is there.
 */
export function parseNumber(value: unknown): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "boolean" || value === null || value === undefined) return undefined;
  if (Array.isArray(value)) return value.length === 1 ? parseNumber(value[0]) : undefined;
  if (typeof value !== "string") return undefined;
  let s = value
    .trim()
    .toLowerCase()
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/g, (ch) => SUPERSCRIPTS[ch] ?? ch)
    .replace(/[−–—]/g, "-")
    .replace(/[£$€¥≈~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!s) return undefined;
  // "about 3 x 10^5" / "3 × 10⁵" / "3e5"
  const sci = s.match(/^(?:about |approximately |roughly )?([-+]?\d+(?:[.,]\d+)?)\s*(?:×|x|\*)\s*10\s*\^?\s*([-+]?\d+)/);
  if (sci) return Number(sci[1]!.replace(",", ".")) * Math.pow(10, Number(sci[2]));
  // Thousands separators: commas followed by exactly three digits; a remaining comma is a decimal mark.
  s = s.replace(/,(?=\d{3}(?!\d))/g, "").replace(/(\d),(\d)/g, "$1.$2");
  // Mixed number "1 1/2"
  const mixed = s.match(/^([-+]?)(\d+) (\d+)\s*\/\s*(\d+)/);
  if (mixed) {
    const sign = mixed[1] === "-" ? -1 : 1;
    const den = Number(mixed[4]);
    if (den === 0) return undefined;
    return sign * (Number(mixed[2]) + Number(mixed[3]) / den);
  }
  const frac = s.match(/^([-+]?\d+(?:\.\d+)?)\s*\/\s*([-+]?\d+(?:\.\d+)?)/);
  if (frac) {
    const den = Number(frac[2]);
    if (den === 0) return undefined;
    return Number(frac[1]) / den;
  }
  const plain = s.match(/^(?:about |approximately |roughly )?([-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)/);
  if (plain) {
    const n = Number(plain[1]);
    return Number.isFinite(n) ? n : undefined;
  }
  // "≈ 40 km" handled above; a leading unit ("km 40") is not a number.
  return undefined;
}

function numericTolerance(item: GradeableItem): number {
  const answer = typeof item.answer === "number" ? item.answer : 0;
  if (item.relativeTolerance !== undefined && item.relativeTolerance > 0) return Math.abs(answer) * item.relativeTolerance;
  if (item.tolerance !== undefined && item.tolerance >= 0) return item.tolerance;
  return Math.abs(answer) * 1e-6;
}

function within(value: number, target: number, tolerance: number): boolean {
  return Math.abs(value - target) <= tolerance + 1e-9;
}

/* ------------------------------------------------------------------ */
/* Choice helpers                                                       */
/* ------------------------------------------------------------------ */

/** Resolves an index, a letter ("B"), a "2" string or an option's text to an option index. */
function optionIndex(response: unknown, options: string[]): number | undefined {
  if (typeof response === "number") return Number.isInteger(response) && response >= 0 && response < options.length ? response : undefined;
  if (typeof response === "boolean") return undefined;
  if (Array.isArray(response)) return response.length === 1 ? optionIndex(response[0], options) : undefined;
  if (typeof response !== "string") return undefined;
  const raw = response.trim();
  if (!raw) return undefined;
  const norm = normalizeText(raw);
  const byText = options.findIndex((o) => normalizeText(o) === norm);
  if (byText >= 0) return byText;
  const byCompact = options.findIndex((o) => compact(o) === compact(raw));
  if (byCompact >= 0) return byCompact;
  if (/^\d+$/.test(raw)) {
    const n = Number(raw);
    return n >= 0 && n < options.length ? n : undefined;
  }
  if (/^[a-z]$/i.test(raw)) {
    const n = raw.toLowerCase().charCodeAt(0) - 97;
    return n >= 0 && n < options.length ? n : undefined;
  }
  return undefined;
}

/** Resolves a set response (indexes, option texts, or a delimited string) to a set of option indexes. */
function optionIndexSet(response: unknown, options: string[]): Set<number> | undefined {
  if (response === null || response === undefined) return undefined;
  let parts: unknown[];
  if (Array.isArray(response)) parts = response;
  else if (typeof response === "number") parts = [response];
  else if (typeof response === "string") {
    const raw = response.trim();
    if (!raw) return undefined;
    const direct = optionIndex(raw, options);
    parts = direct !== undefined ? [direct] : raw.split(/[,;\n]+/).map((p) => p.trim()).filter(Boolean);
  } else return undefined;
  const out = new Set<number>();
  for (const p of parts) {
    const idx = optionIndex(p, options);
    if (idx === undefined) return undefined;
    out.add(idx);
  }
  return out;
}

/** Resolves an ordering response to a permutation of 0..n−1, or undefined when invalid. */
function orderingIndexes(response: unknown, options: string[]): number[] | undefined {
  if (!Array.isArray(response) || response.length !== options.length) return undefined;
  const out: number[] = [];
  const seen = new Set<number>();
  for (const p of response) {
    const idx = optionIndex(p, options);
    if (idx === undefined || seen.has(idx)) return undefined;
    seen.add(idx);
    out.push(idx);
  }
  return out;
}

/** Share of concordant pairs (Kendall-style): 1 for the exact order, 0 for the reverse. */
export function orderingScore(order: number[]): number {
  const n = order.length;
  if (n < 2) return 1;
  let concordant = 0;
  let total = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      total += 1;
      if (order[i]! < order[j]!) concordant += 1;
    }
  }
  return concordant / total;
}

function truthValue(response: unknown): boolean | undefined {
  if (typeof response === "boolean") return response;
  if (typeof response === "number") return response === 1 ? true : response === 0 ? false : undefined;
  if (Array.isArray(response)) return response.length === 1 ? truthValue(response[0]) : undefined;
  if (typeof response !== "string") return undefined;
  const t = normalizeText(response);
  if (["true", "t", "yes", "y", "correct", "1"].includes(t)) return true;
  if (["false", "f", "no", "n", "incorrect", "0"].includes(t)) return false;
  return undefined;
}

/* ------------------------------------------------------------------ */
/* Key points                                                           */
/* ------------------------------------------------------------------ */

/**
 * Coverage of key points in a text. A key point may list alternatives separated by "|";
 * matching is on normalised text, so case, punctuation and articles do not matter.
 */
export function keyPointCoverage(text: string, keyPoints: string[]): { covered: string[]; missed: string[]; ratio: number } {
  const raw = String(text ?? "").toLowerCase();
  const norm = normalizeText(raw);
  const covered: string[] = [];
  const missed: string[] = [];
  for (const kp of keyPoints) {
    const alts = kp
      .split("|")
      .map((a) => a.trim())
      .filter(Boolean);
    const hit = alts.some((a) => {
      const n = normalizeText(a);
      return (n && norm.includes(n)) || raw.includes(a.toLowerCase());
    });
    (hit ? covered : missed).push(kp);
  }
  return { covered, missed, ratio: keyPoints.length ? covered.length / keyPoints.length : 1 };
}

/* ------------------------------------------------------------------ */
/* Grading                                                              */
/* ------------------------------------------------------------------ */

function responseText(response: unknown): string {
  if (typeof response === "string") return response;
  if (typeof response === "number" || typeof response === "boolean") return String(response);
  if (Array.isArray(response)) return response.map(responseText).join(" ");
  if (response && typeof response === "object" && "text" in response && typeof (response as { text: unknown }).text === "string") return (response as { text: string }).text;
  return "";
}

export function gradeItem(item: GradeableItem, response: unknown): GradeResult {
  const format: ItemFormat = item.format;
  switch (format) {
    case "numeric": {
      if (typeof item.answer !== "number") return { gradeable: false, score: 0 };
      const value = parseNumber(response);
      if (value === undefined) return { gradeable: true, correct: false, score: 0 };
      const tol = numericTolerance(item);
      const correct = within(value, item.answer, tol);
      // A near miss (within three tolerances, when a tolerance exists) earns half credit.
      const near = !correct && tol > 0 && within(value, item.answer, 3 * tol);
      return { gradeable: true, correct, score: correct ? 1 : near ? 0.5 : 0 };
    }
    case "mcq": {
      const options = item.options ?? [];
      if (typeof item.answer !== "number" || !options.length) return { gradeable: false, score: 0 };
      const idx = optionIndex(response, options);
      const correct = idx !== undefined && idx === item.answer;
      return { gradeable: true, correct, score: correct ? 1 : 0 };
    }
    case "multi_select": {
      const options = item.options ?? [];
      if (!Array.isArray(item.answer) || !options.length) return { gradeable: false, score: 0 };
      const expected = new Set(item.answer);
      const chosen = optionIndexSet(response, options);
      if (!chosen || chosen.size === 0) return { gradeable: true, correct: false, score: 0 };
      let inter = 0;
      for (const i of chosen) if (expected.has(i)) inter += 1;
      const union = expected.size + chosen.size - inter;
      const jaccard = union ? inter / union : 1;
      const correct = inter === expected.size && chosen.size === expected.size;
      return { gradeable: true, correct, score: correct ? 1 : Math.round(jaccard * 1000) / 1000 };
    }
    case "true_false": {
      const expected = truthValue(item.answer);
      if (expected === undefined) return { gradeable: false, score: 0 };
      const given = truthValue(response);
      const correct = given !== undefined && given === expected;
      return { gradeable: true, correct, score: correct ? 1 : 0 };
    }
    case "short": {
      if (typeof item.answer !== "string") return { gradeable: false, score: 0 };
      const text = responseText(response);
      if (!text.trim()) return { gradeable: true, correct: false, score: 0 };
      const accepted = [item.answer, ...(item.accept ?? [])];
      const norm = normalizeText(text);
      const comp = compact(text);
      let correct = accepted.some((a) => normalizeText(a) === norm || compact(a) === comp);
      if (!correct) {
        const expectedNumber = parseNumber(item.answer);
        const givenNumber = parseNumber(text);
        if (expectedNumber !== undefined && givenNumber !== undefined && /^[-+]?[\d.,/ %]+$/.test(item.answer.trim())) {
          correct = within(givenNumber, expectedNumber, Math.abs(expectedNumber) * 1e-6);
        }
      }
      return { gradeable: true, correct, score: correct ? 1 : 0 };
    }
    case "ordering": {
      const options = item.options ?? [];
      if (options.length < 2) return { gradeable: false, score: 0 };
      const order = orderingIndexes(response, options);
      if (!order) return { gradeable: true, correct: false, score: 0 };
      const score = orderingScore(order);
      const correct = order.every((v, i) => v === i);
      return { gradeable: true, correct, score: correct ? 1 : Math.round(score * 1000) / 1000 };
    }
    case "free": {
      const keyPoints = item.keyPoints ?? [];
      if (!keyPoints.length) return { gradeable: false, score: 0 };
      const text = responseText(response);
      const { covered, missed, ratio } = keyPointCoverage(text, keyPoints);
      const score = Math.round(ratio * 1000) / 1000;
      return { gradeable: true, correct: ratio >= 0.6, score, covered, missed };
    }
    default:
      return { gradeable: false, score: 0 };
  }
}

/* ------------------------------------------------------------------ */
/* Error classification                                                 */
/* ------------------------------------------------------------------ */

function commonErrorsOf(item: GradeableItem): CommonError[] {
  return "commonErrors" in item && Array.isArray(item.commonErrors) ? item.commonErrors : [];
}

function matchCommonError(item: GradeableItem, response: unknown): ErrorCategory | undefined {
  const errors = commonErrorsOf(item);
  if (!errors.length) return undefined;
  const options = item.options ?? [];
  switch (item.format) {
    case "numeric": {
      const value = parseNumber(response);
      if (value === undefined) return undefined;
      const tol = numericTolerance(item);
      return errors.find((e) => e.value !== undefined && within(value, e.value, tol))?.category;
    }
    case "mcq": {
      const idx = optionIndex(response, options);
      if (idx === undefined) return undefined;
      return errors.find((e) => e.optionIndex === idx)?.category;
    }
    case "multi_select": {
      const chosen = optionIndexSet(response, options);
      if (!chosen) return undefined;
      const expected = new Set(Array.isArray(item.answer) ? item.answer : []);
      return errors.find((e) => e.optionIndex !== undefined && chosen.has(e.optionIndex) && !expected.has(e.optionIndex))?.category;
    }
    case "short":
    case "free": {
      const text = responseText(response);
      if (!text.trim()) return undefined;
      const norm = normalizeText(text);
      const comp = compact(text);
      return errors.find((e) => {
        if (!e.pattern) return false;
        const p = normalizeText(e.pattern);
        const c = compact(e.pattern);
        return (p.length > 0 && norm.includes(p)) || (c.length > 0 && comp.includes(c));
      })?.category;
    }
    default:
      return undefined;
  }
}

function numericHeuristic(item: GradeableItem, response: unknown): ErrorCategory | undefined {
  if (item.format !== "numeric" || typeof item.answer !== "number") return undefined;
  const value = parseNumber(response);
  if (value === undefined) return undefined;
  const answer = item.answer;
  const tol = Math.max(numericTolerance(item), Math.abs(answer) * 1e-6);
  const percentItem = ("unit" in item && item.unit === "%") || /\bpercent|%/.test(item.prompt);
  const ratioOf = (k: number) => within(value, answer * k, tol * Math.max(1, Math.abs(k)));
  if (answer !== 0 && within(value, -answer, tol)) return "ALGEBRA_ERROR";
  if (percentItem && answer !== 0 && (ratioOf(0.01) || ratioOf(100))) return "PRECISION_ERROR";
  if (answer !== 0) {
    for (const k of [10, 100, 1000, 0.1, 0.01, 0.001]) if (ratioOf(k)) return "ALGEBRA_ERROR";
  }
  return undefined;
}

const SKILL_DEFAULT: Partial<Record<SkillArea, ErrorCategory>> = {
  logic: "LOGIC_ERROR",
  argument_analysis: "LOGIC_ERROR",
  causal_reasoning: "CAUSAL_ERROR",
  statistics: "STATISTICAL_ERROR",
  knowledge: "KNOWLEDGE_GAP",
  reading: "MISREAD",
};

function bySkill(item: GradeableItem): ErrorCategory {
  const sub = `${item.subskill} ${"tags" in item ? (item.tags ?? []).join(" ") : ""}`.toLowerCase();
  if (item.skill === "probability" && /base[_ -]?rate|bayes/.test(sub)) return "BASE_RATE_NEGLECT";
  return SKILL_DEFAULT[item.skill] ?? "CONCEPTUAL_ERROR";
}

/**
 * Order: the item's own common errors; numeric sign or power-of-ten slips (ALGEBRA_ERROR);
 * percent-versus-fraction (PRECISION_ERROR); confidently wrong (OVERCONFIDENCE); right but
 * unsure (UNDERCONFIDENCE); wrong on a transfer item (TRANSFER_FAILURE); otherwise by skill.
 * Returns undefined when the item is correct without underconfidence, or ungraded.
 */
export function classifyError(item: GradeableItem, response: unknown, result: { correct?: boolean }, confidence?: number, transfer?: TransferLevel): ErrorCategory | undefined {
  if (result.correct === undefined) return undefined;
  if (result.correct) return confidence !== undefined && confidence <= 0.4 ? "UNDERCONFIDENCE" : undefined;
  const common = matchCommonError(item, response);
  if (common) return common;
  const numeric = numericHeuristic(item, response);
  if (numeric) return numeric;
  if (confidence !== undefined && confidence >= 0.8) return "OVERCONFIDENCE";
  const level = transfer ?? ("transfer" in item ? item.transfer : 0);
  if (level >= 2) return "TRANSFER_FAILURE";
  return bySkill(item);
}

/** exam/baseline → exam; transfer context or transfer ≥ 2 → transfer; hints or scaffolding → guided; else independent. */
export function evidenceKindFor(context: PracticeContext, hintsUsed: number, scaffolded: boolean, transfer: TransferLevel): EvidenceKind {
  if (context === "exam" || context === "baseline") return "exam";
  if (context === "transfer" || transfer >= 2) return "transfer";
  if (hintsUsed > 0 || scaffolded) return "guided";
  return "independent";
}
