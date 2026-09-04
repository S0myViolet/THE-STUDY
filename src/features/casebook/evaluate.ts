import type { CaseDefinition, CaseStage, DecisionOption, EvidenceReveal, HypothesisRubric, QuestionOption, RecallQuestion, ReasoningPathPoint, SeparateStatement } from "@/lib/domain/types";
import type { ErrorType } from "@/lib/domain/errors";
import { shortAnswerCorrect, normalize } from "@/lib/scoring/observation";
import { classifyQuestion, isLeading, keyPointCoverage, wordCount } from "@/lib/scoring/text";

/* ------------------------------------------------------------------ */
/* Recall                                                              */
/* ------------------------------------------------------------------ */

export interface RecallResult {
  perQuestion: { id: string; correct: boolean; given: string; answer: string; falseRecall: boolean; numeric: boolean; unknown: boolean }[];
  correct: number;
  total: number;
  falseRecalls: number;
  score: number;
}

const UNKNOWN = ["i don't know", "dont know", "don't know", "not sure", "no idea", "unsure", "?", "i do not know", "can't remember", "cannot remember"];

export function isUnknownAnswer(s: string): boolean {
  const n = normalize(s);
  return !n || UNKNOWN.some((u) => n.includes(normalize(u)));
}

export function evalRecall(questions: RecallQuestion[], answers: Record<string, string>): RecallResult {
  const perQuestion = questions.map((q) => {
    const given = (answers[q.id] ?? "").trim();
    const unknown = isUnknownAnswer(given);
    const correct = q.kind === "mcq" ? normalize(given) === normalize(q.answer) : !unknown && shortAnswerCorrect(given, q.answer, q.accept ?? []);
    const numeric = q.kind === "number" || /\d/.test(q.answer);
    // A false recall is a confident wrong claim, not an admission of not knowing.
    const falseRecall = !correct && !unknown && q.kind !== "mcq";
    return { id: q.id, correct, given, answer: q.answer, falseRecall, numeric, unknown };
  });
  const correct = perQuestion.filter((p) => p.correct).length;
  const falseRecalls = perQuestion.filter((p) => p.falseRecall).length;
  const total = questions.length || 1;
  // precision-aware: invented answers cost more than admitted gaps
  const score = Math.max(0, (correct - falseRecalls * 0.5) / total);
  return { perQuestion, correct, total: questions.length, falseRecalls, score: round(score) };
}

/* ------------------------------------------------------------------ */
/* Separate                                                            */
/* ------------------------------------------------------------------ */

export interface SeparateResult {
  per: { id: string; given: string; truth: SeparateStatement["truth"]; correct: boolean; blurred: boolean }[];
  accuracy: number;
  blurred: number; // inference/unknown labelled as observation
}

export function evalSeparate(statements: SeparateStatement[], labels: Record<string, SeparateStatement["truth"] | undefined>): SeparateResult {
  const per = statements.map((s) => {
    const given = labels[s.id] ?? "";
    const correct = given === s.truth;
    const blurred = given === "observation" && s.truth !== "observation";
    return { id: s.id, given, truth: s.truth, correct, blurred };
  });
  const accuracy = statements.length ? per.filter((p) => p.correct).length / statements.length : 0;
  return { per, accuracy: round(accuracy), blurred: per.filter((p) => p.blurred).length };
}

/* ------------------------------------------------------------------ */
/* Hypotheses                                                          */
/* ------------------------------------------------------------------ */

export interface HypothesisMatch {
  field: "primary" | "alternative" | "unlikely";
  text: string;
  matchedTitle?: string;
  overlap: number;
}

export interface HypothesesResult {
  matches: HypothesisMatch[];
  distinctPlausible: number;
  primaryPlausible: boolean;
  duplicates: number;
  hypothesisScore: number;
  alternativesScore: number;
  empty: number;
}

export function matchHypothesis(text: string, rubric: HypothesisRubric): { title?: string; overlap: number } {
  let best: { title?: string; overlap: number } = { overlap: 0 };
  for (const p of rubric.plausible) {
    const { ratio } = keyPointCoverage(text, p.keywords);
    if (ratio > best.overlap) best = { title: p.title, overlap: ratio };
  }
  return best.overlap >= 0.25 ? best : { overlap: best.overlap };
}

function similar(a: string, b: string): boolean {
  const ta = new Set(normalize(a).split(" ").filter((t) => t.length > 3));
  const tb = new Set(normalize(b).split(" ").filter((t) => t.length > 3));
  if (!ta.size || !tb.size) return false;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / Math.min(ta.size, tb.size) >= 0.6;
}

export function evalHypotheses(rubric: HypothesisRubric, h: { primary: string; alternative: string; unlikely: string }): HypothesesResult {
  const fields: HypothesisMatch["field"][] = ["primary", "alternative", "unlikely"];
  const matches = fields.map((f) => {
    const m = matchHypothesis(h[f], rubric);
    return { field: f, text: h[f], matchedTitle: m.title, overlap: m.overlap };
  });
  const titles = new Set(matches.map((m) => m.matchedTitle).filter(Boolean));
  const texts = fields.map((f) => h[f]).filter((t) => t.trim().length > 0);
  let duplicates = 0;
  for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) if (similar(texts[i], texts[j])) duplicates++;
  const empty = fields.filter((f) => wordCount(h[f]) < 3).length;
  const primaryPlausible = !!matches[0].matchedTitle;
  const distinct = titles.size;
  // Alternatives score: distinct plausible explanations beyond the primary, penalise duplicates and empties.
  const alternativesScore = Math.max(0, Math.min(1, (distinct - (primaryPlausible ? 1 : 0)) / Math.max(1, rubric.minimum) - duplicates * 0.25 - empty * 0.2 + (texts.length === 3 && duplicates === 0 ? 0.2 : 0)));
  const hypothesisScore = primaryPlausible ? Math.min(1, 0.6 + matches[0].overlap * 0.4) : wordCount(h.primary) >= 6 ? 0.35 : 0.1;
  return { matches, distinctPlausible: distinct, primaryPlausible, duplicates, hypothesisScore: round(hypothesisScore), alternativesScore: round(alternativesScore), empty };
}

/* ------------------------------------------------------------------ */
/* Question                                                            */
/* ------------------------------------------------------------------ */

export interface QuestionResult {
  text: string;
  informationValue: number;
  rapportCost: number;
  leading: boolean;
  type: string;
  feedback: string;
  fromOption: boolean;
}

export function evalQuestionOption(o: QuestionOption): QuestionResult {
  return { text: o.text, informationValue: o.informationValue, rapportCost: o.rapportCost, leading: o.leading, type: classifyQuestion(o.text), feedback: o.feedback, fromOption: true };
}

/** Deterministic heuristic for a free-text question when no model is configured. */
export function evalFreeQuestion(text: string, rubric?: HypothesisRubric, options?: QuestionOption[]): QuestionResult {
  const leading = isLeading(text);
  const type = classifyQuestion(text);
  const base: Record<string, number> = { discriminating: 0.72, evidence: 0.68, timeline: 0.66, counterfactual: 0.62, open: 0.58, motive: 0.55, assumption: 0.55, clarifying: 0.5, information_value: 0.6, closed: 0.35 };
  let iv = base[type] ?? 0.45;
  if (leading) iv = Math.min(iv, 0.22);
  // Touching a rubric explanation's vocabulary suggests the question discriminates between explanations.
  if (rubric) {
    const touched = rubric.plausible.filter((p) => keyPointCoverage(text, p.keywords).ratio >= 0.34).length;
    if (touched >= 2) iv = Math.min(1, iv + 0.15);
    else if (touched === 1) iv = Math.min(1, iv + 0.05);
  }
  // Similar to an authored option? borrow its value.
  const alike = options?.find((o) => similar(o.text, text));
  if (alike) iv = (iv + alike.informationValue) / 2;
  const feedback = leading
    ? "That question suggests its own answer. It will produce agreement or defensiveness, not information."
    : type === "closed"
      ? "A yes/no question can be answered without giving anything away. Ask for the thing itself."
      : iv >= 0.65
        ? "A question that separates explanations rather than confirming one. Good."
        : "Reasonable, but it does not force the other side to supply something new.";
  return { text, informationValue: round(iv), rapportCost: leading ? 0.5 : 0.15, leading, type, feedback, fromOption: false };
}

/* ------------------------------------------------------------------ */
/* Update                                                              */
/* ------------------------------------------------------------------ */

export interface UpdateResult {
  before: number;
  after: number;
  delta: number;
  undermined: boolean;
  supported: boolean;
  verdict: "appropriate" | "insufficient" | "over" | "wrong_direction" | "neutral";
  score: number;
  note: string;
}

export function evalUpdate(before: number, after: number, reveal: EvidenceReveal | undefined, primaryTitle?: string): UpdateResult {
  const delta = after - before;
  const undermined = !!(primaryTitle && reveal?.undermines?.some((t) => normalize(t) === normalize(primaryTitle)));
  const supported = !!(primaryTitle && reveal?.supports?.some((t) => normalize(t) === normalize(primaryTitle)));
  let verdict: UpdateResult["verdict"] = "neutral";
  let score = 0.7;
  let note = "The evidence did not bear directly on your primary explanation; a small move either way is reasonable.";
  if (undermined) {
    if (delta <= -0.12 && delta >= -0.55) {
      verdict = "appropriate";
      score = 0.95;
      note = "The new evidence cut against your explanation and you moved. That is what updating looks like.";
    } else if (delta > -0.12) {
      verdict = delta >= 0 ? "wrong_direction" : "insufficient";
      score = delta >= 0 ? 0.15 : 0.35;
      note = delta >= 0 ? "The evidence contradicted your explanation and your confidence rose. Look at that again." : "You noticed the contradiction but barely updated.";
    } else {
      verdict = "over";
      score = 0.5;
      note = "One clue moved you a long way. Ask whether it deserved that much weight.";
    }
  } else if (supported) {
    if (delta >= 0.05 && delta <= 0.3) {
      verdict = "appropriate";
      score = 0.9;
      note = "Supporting evidence, modest increase. Proportionate.";
    } else if (delta > 0.3) {
      verdict = "over";
      score = 0.55;
      note = "Confirming evidence is easy to over-weight. One clue rarely deserves a jump that large.";
    } else if (delta < -0.05) {
      verdict = "wrong_direction";
      score = 0.3;
      note = "The evidence supported your explanation and you moved away from it.";
    } else {
      verdict = "insufficient";
      score = 0.6;
      note = "Supporting evidence should nudge you upward, a little.";
    }
  }
  return { before, after, delta: round(delta), undermined, supported, verdict, score, note };
}

/* ------------------------------------------------------------------ */
/* Decision & explanation                                              */
/* ------------------------------------------------------------------ */

export function evalDecision(o: DecisionOption, stage: CaseStage): { quality: number; feedback: string; errorType?: ErrorType; chosenInsufficient: boolean } {
  const best = Math.max(...(stage.decisionOptions ?? []).map((d) => d.quality));
  const chosenInsufficient = !!stage.insufficientEvidenceIsCorrect && o.quality >= best - 0.001;
  return { quality: o.quality, feedback: o.feedback, errorType: o.errorType, chosenInsufficient };
}

export interface ExplainResult {
  score: number;
  coverage: number;
  mentionsAlternatives: boolean;
  separatesObservation: boolean;
  words: number;
  feedback: string;
}

export function evalExplain(text: string, kase: CaseDefinition, rubric?: HypothesisRubric): ExplainResult {
  const words = wordCount(text);
  const keys = [...(rubric?.plausible.flatMap((p) => p.keywords.slice(0, 3)) ?? [])];
  const truthTokens = normalize(kase.groundTruth)
    .split(" ")
    .filter((t) => t.length > 5)
    .slice(0, 12);
  const cov = keyPointCoverage(text, [...new Set([...keys, ...truthTokens])]);
  const mentionsAlternatives = /\b(alternatively|another explanation|could also|might instead|however|on the other hand|unless|or it could|the alternative)\b/i.test(text);
  const separatesObservation = /\b(observed|noticed|saw|the (document|thread|table|receipt|statement) (shows|says|lists)|i infer|inference|assum)/i.test(text);
  let score = Math.min(1, 0.3 + cov.ratio * 0.5 + (mentionsAlternatives ? 0.1 : 0) + (separatesObservation ? 0.1 : 0));
  if (words < 25) score = Math.min(score, 0.4);
  if (words > 260) score -= 0.1;
  const feedback =
    words < 25
      ? "Too brief to show reasoning. Say what you observed, what you inferred from it, and what would change your mind."
      : !mentionsAlternatives
        ? "You explained one route to the conclusion. Name the alternative you rejected and why."
        : !separatesObservation
          ? "Good structure. Make the seam visible: which parts were observed and which were inferred?"
          : "A reasoned explanation: observation, inference and the rejected alternative are all visible.";
  return { score: round(Math.max(0, score)), coverage: round(cov.ratio), mentionsAlternatives, separatesObservation, words, feedback };
}

/* ------------------------------------------------------------------ */
/* Summary                                                             */
/* ------------------------------------------------------------------ */

export interface StageOutcomes {
  recall?: RecallResult & { questions: RecallQuestion[] };
  separate?: SeparateResult & { statements: SeparateStatement[] };
  hypotheses?: HypothesesResult & { confidenceBefore?: number };
  question?: QuestionResult;
  update?: UpdateResult;
  decision?: ReturnType<typeof evalDecision> & { text: string };
  explain?: ExplainResult;
  reveal?: EvidenceReveal;
}

export function composeSummary(kase: CaseDefinition, o: StageOutcomes, baseline?: { alternativesMean?: number }) {
  const noticed: string[] = [];
  const missed: string[] = [];
  const assumptions: string[] = [];
  const didWell: string[] = [];
  const path: ReasoningPathPoint[] = [];

  if (o.recall) {
    for (const p of o.recall.perQuestion) {
      const q = o.recall.questions.find((q) => q.id === p.id)!;
      if (p.correct) noticed.push(q.prompt.replace(/\?$/, "") + ` — ${q.answer}`);
      else missed.push(q.prompt.replace(/\?$/, "") + ` — ${q.answer}${p.falseRecall ? ` (you said "${p.given}")` : ""}`);
    }
    path.push({ kind: "evidence", label: `Noticed ${o.recall.correct} of ${o.recall.total} details`, note: o.recall.falseRecalls ? `${o.recall.falseRecalls} invented` : "none invented" });
    if (o.recall.falseRecalls === 0 && o.recall.correct >= Math.ceil(o.recall.total * 0.6)) didWell.push(`Remembered ${o.recall.correct} of ${o.recall.total} relevant details and invented none.`);
  }
  if (o.separate) {
    for (const p of o.separate.per) {
      if (p.blurred) {
        const s = o.separate.statements.find((s) => s.id === p.id)!;
        assumptions.push(`Treated as observed: "${s.text}"`);
      }
    }
    if (o.separate.accuracy >= 0.8) didWell.push("Kept observation and interpretation apart.");
  }
  if (o.hypotheses) {
    path.push({ kind: "hypothesis", label: o.hypotheses.matches[0].matchedTitle ? `Primary: ${o.hypotheses.matches[0].matchedTitle}` : "Primary explanation", value: o.hypotheses.confidenceBefore, note: `${o.hypotheses.distinctPlausible} distinct plausible explanations` });
    if (o.hypotheses.distinctPlausible >= 3) didWell.push("Generated three genuinely different explanations.");
    else if (baseline?.alternativesMean !== undefined && o.hypotheses.alternativesScore < baseline.alternativesMean - 0.1) assumptions.push("Once you had a first explanation, you generated fewer alternatives than your recent baseline.");
  }
  if (o.question) {
    path.push({ kind: "question", label: o.question.text.length > 70 ? o.question.text.slice(0, 68) + "…" : o.question.text, value: o.question.informationValue, note: o.question.leading ? "leading" : o.question.type });
    if (o.question.informationValue >= 0.65) didWell.push("Your chosen question had high information value.");
  }
  if (o.reveal) path.push({ kind: "evidence", label: o.reveal.title });
  if (o.update) {
    path.push({ kind: "confidence", label: `Confidence ${Math.round(o.update.before * 100)}% → ${Math.round(o.update.after * 100)}%`, value: o.update.after, note: o.update.note });
    if (o.update.verdict === "appropriate") didWell.push("Updated appropriately when new evidence appeared.");
  }
  if (o.decision) {
    path.push({ kind: "decision", label: o.decision.text, value: o.decision.quality });
    if (o.decision.chosenInsufficient) didWell.push("Declined to conclude when the evidence could not carry a conclusion.");
  }

  const turningPoint = o.reveal ? `${o.reveal.title}: ${o.update ? o.update.note : "the evidence arrived."}` : undefined;
  const oneThing =
    o.update?.verdict === "insufficient"
      ? "When evidence contradicts you, move your number before you defend it."
      : o.hypotheses && o.hypotheses.distinctPlausible < 2
        ? "Before you commit, write two explanations you would be embarrassed to have missed."
        : o.recall && o.recall.falseRecalls > 0
          ? "Say 'I don't know' rather than filling a gap. Precision is the skill."
          : o.question && o.question.informationValue < 0.5
            ? "Choose the question that would change your mind, not the one that confirms it."
            : o.separate && o.separate.blurred > 0
              ? "Ask of every statement: did I see that, or did I conclude it?"
              : "Keep the sequence. Look, separate, alternatives, then commit.";

  const parts = [o.recall?.score, o.separate?.accuracy, o.hypotheses?.hypothesisScore, o.hypotheses?.alternativesScore, o.question?.informationValue, o.update?.score, o.decision?.quality, o.explain?.score].filter((x): x is number => typeof x === "number");
  const overall = parts.length ? parts.reduce((s, x) => s + x, 0) / parts.length : 0;

  return {
    recallCorrect: o.recall?.correct ?? 0,
    recallTotal: o.recall?.total ?? 0,
    falseRecalls: o.recall?.falseRecalls ?? 0,
    separationAccuracy: o.separate?.accuracy ?? 0,
    hypothesesCount: o.hypotheses ? 3 - o.hypotheses.empty : 0,
    alternativesCount: o.hypotheses?.distinctPlausible ?? 0,
    questionInformationValue: o.question?.informationValue,
    confidenceBefore: o.update?.before ?? o.hypotheses?.confidenceBefore,
    confidenceAfter: o.update?.after,
    decisionQuality: o.decision?.quality,
    overallScore: round(overall),
    reasoningPath: path,
    noticed,
    missed,
    assumptions,
    didWell,
    turningPoint,
    oneThing,
  };
}

function round(x: number) {
  return Math.round(x * 1000) / 1000;
}
