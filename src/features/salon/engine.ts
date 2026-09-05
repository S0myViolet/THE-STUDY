import type { SalonReview, SalonScenario, SalonSession, ConversationTurn, QuestionType } from "@/lib/domain/types";
import { classifyQuestion, isLeading, isQuestion, keyPointCoverage, wordCount } from "@/lib/scoring/text";

/**
 * Deterministic Salon engine: the fallback character when no model is configured,
 * plus the review used in both modes.
 */

const ACCUSATORY = /\b(you're lying|you are lying|liar|admit it|stop pretending|come on|be honest|just tell me the truth|you knew|you must have|obviously you)\b/i;
const WARM = /\b(thank you|thanks|appreciate|interesting|fascinating|that makes sense|i see|tell me more|i'd love to|curious)\b/i;

export interface TurnResult {
  reply: string;
  revealed: string[];
  rapportDelta: number;
  questionType: QuestionType | "statement";
  leading: boolean;
}

export function classifyUserTurn(text: string): { questionType: QuestionType | "statement"; leading: boolean; accusatory: boolean; warm: boolean } {
  const q = isQuestion(text);
  return { questionType: q ? classifyQuestion(text) : "statement", leading: isLeading(text) || ACCUSATORY.test(text), accusatory: ACCUSATORY.test(text), warm: WARM.test(text) };
}

export function scriptedTurn(scenario: SalonScenario, session: Pick<SalonSession, "turns" | "rapport" | "revealedFacts">, text: string): TurnResult {
  const cls = classifyUserTurn(text);
  const lower = text.toLowerCase();
  let rapportDelta = 0;
  if (cls.accusatory) rapportDelta -= 0.15;
  else if (cls.leading) rapportDelta -= 0.1;
  else if (cls.questionType === "open" || cls.questionType === "clarifying" || cls.questionType === "motive") rapportDelta += 0.05;
  else if (cls.questionType === "statement") rapportDelta += 0.02;
  if (cls.warm) rapportDelta += 0.04;
  const rapport = Math.max(0, Math.min(1, session.rapport + rapportDelta));

  // Which hidden facts does this question earn?
  const candidates = scenario.hiddenFacts.filter((f) => !session.revealedFacts.includes(f.id));
  const earned = candidates.filter((f) => f.triggers.some((t) => lower.includes(t.toLowerCase())));
  const unlocked = earned.filter((f) => !f.guarded || rapport >= 0.5);
  const withheld = earned.filter((f) => f.guarded && rapport < 0.5);

  // Best script line by keyword overlap.
  let best: { line: SalonScenario["script"][number]; score: number } | null = null;
  for (const line of scenario.script) {
    const hits = line.match.filter((m) => lower.includes(m.toLowerCase())).length;
    if (hits > 0 && (!best || hits > best.score)) best = { line, score: hits };
  }

  const revealed = new Set<string>();
  const parts: string[] = [];
  if (cls.leading || cls.accusatory) {
    // Defensive: a leading question earns a deflection even if it happened to contain triggers.
    const defensive = scenario.script.filter((l) => l.rapportDelta !== undefined && l.rapportDelta < 0);
    const line = defensive.length ? defensive[session.turns.length % defensive.length] : null;
    parts.push(line ? line.reply : pickFallback(scenario, session.turns.length));
    return { reply: parts.join(" "), revealed: [], rapportDelta, questionType: cls.questionType, leading: true };
  }
  if (best) {
    parts.push(best.line.reply);
    for (const id of best.line.reveals ?? []) if (!session.revealedFacts.includes(id)) revealed.add(id);
    if (best.line.rapportDelta) rapportDelta += best.line.rapportDelta;
  }
  for (const f of unlocked.slice(0, 2)) {
    if (!revealed.has(f.id)) {
      revealed.add(f.id);
      if (!best) parts.push(f.fact);
      else if (!(best.line.reveals ?? []).includes(f.id)) parts.push(f.fact);
    }
  }
  if (!parts.length) {
    if (withheld.length) parts.push(guardedDeflection(scenario, session.turns.length));
    else parts.push(pickFallback(scenario, session.turns.length));
  } else if (withheld.length && !unlocked.length) {
    parts.push(guardedDeflection(scenario, session.turns.length));
  }
  return { reply: parts.join(" "), revealed: [...revealed], rapportDelta: Math.round(rapportDelta * 100) / 100, questionType: cls.questionType, leading: false };
}

function pickFallback(s: SalonScenario, n: number): string {
  return s.fallbackReplies[n % s.fallbackReplies.length];
}

function guardedDeflection(s: SalonScenario, n: number): string {
  const options = ["I'd rather not get into that just yet.", "That's a longer conversation than we've had so far.", "Ask me that again when we know each other a little better.", "I'll come to that. Let me answer the easier part first."];
  return options[(n + s.id.length) % options.length];
}

/** Objectives satisfied by revealed facts. Objectives without required facts are self-assessed. */
export function objectivesMet(scenario: SalonScenario, revealed: string[], selfAssessed: string[] = []): string[] {
  return scenario.objectives.filter((o) => (o.requiresFacts?.length ? o.requiresFacts.every((f) => revealed.includes(f)) : selfAssessed.includes(o.id))).map((o) => o.id);
}

export function reviewConversation(scenario: SalonScenario, session: Pick<SalonSession, "turns" | "rapport" | "revealedFacts" | "objectivesMet">): SalonReview {
  const user = session.turns.filter((t) => t.role === "user");
  const questions = user.filter((t) => t.questionType && t.questionType !== "statement");
  const forcing = user.filter((t) => (t.revealed?.length ?? 0) > 0);
  const leading = user.filter((t) => t.leading);
  const userWords = user.reduce((s, t) => s + wordCount(t.text), 0);
  const charWords = session.turns.filter((t) => t.role === "character").reduce((s, t) => s + wordCount(t.text), 0);
  const talkShare = userWords + charWords ? userWords / (userWords + charWords) : 0.5;
  const met = session.objectivesMet;
  const improvements: string[] = [];
  if (questions.length && forcing.length / questions.length < 0.4) improvements.push(`You asked ${questions.length} question${questions.length === 1 ? "" : "s"}, but only ${forcing.length} forced the other person to supply new information.`);
  if (leading.length) improvements.push(`${leading.length} question${leading.length === 1 ? " was" : "s were"} leading or accusatory. Each one cost rapport and produced a defensive answer.`);
  if (talkShare > 0.6) improvements.push(`You spoke ${Math.round(talkShare * 100)}% of the words. The person across the table had more to give than they were asked for.`);
  const types = new Set(questions.map((t) => t.questionType));
  if (questions.length >= 4 && types.size <= 2) improvements.push("Your questions were all of one or two types. A timeline question, or a counterfactual, would have opened a different door.");
  if (!improvements.length && met.length < scenario.objectives.length) improvements.push(`The objective you did not reach needed a fact the character only gives to a precise question. Look at the facts that stayed hidden.`);
  if (!improvements.length) improvements.push("Keep the balance: you listened, asked for specifics, and let the other person reveal the shape of the thing.");

  let strongestMove: string | undefined;
  const bestTurn = [...user].sort((a, b) => (b.revealed?.length ?? 0) - (a.revealed?.length ?? 0))[0];
  if (bestTurn && (bestTurn.revealed?.length ?? 0) > 0) strongestMove = `"${bestTurn.text.slice(0, 90)}${bestTurn.text.length > 90 ? "…" : ""}" — that question produced ${bestTurn.revealed!.length} new fact${bestTurn.revealed!.length === 1 ? "" : "s"}.`;

  const score = Math.max(0, Math.min(1, 0.35 * (scenario.objectives.length ? met.length / scenario.objectives.length : 0) + 0.25 * (questions.length ? forcing.length / questions.length : 0) + 0.2 * session.rapport + 0.2 * (1 - Math.min(1, leading.length / Math.max(1, questions.length))) - (talkShare > 0.65 ? 0.1 : 0)));

  return {
    questionsAsked: questions.length,
    questionsForcingNewInfo: forcing.length,
    leadingQuestions: leading.length,
    talkShare: Math.round(talkShare * 100) / 100,
    objectivesMet: met.length,
    objectivesTotal: scenario.objectives.length,
    keyImprovements: improvements.slice(0, 2),
    strongestMove,
    score: Math.round(score * 100) / 100,
  };
}

export function coverageHint(text: string, keys: string[]): number {
  return keyPointCoverage(text, keys).ratio;
}

export type { ConversationTurn };
