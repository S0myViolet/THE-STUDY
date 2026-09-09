/**
 * THE STUDY V2 — the independence rate.
 *
 * How much of the learner's practice is attempted without help. The rate is the share
 * of practice attempts (outside exams) that were submitted with no hint and no revealed
 * solution, taken from `assistance_events` and `practice_attempts` over a window. A
 * previous window of the same length gives the trend. The message names the numbers and
 * says what an unaided attempt does for learning; it never scolds.
 *
 * Contract: docs/V2.md §5 "independence.ts".
 */
import type { StudyDatabase } from "@/lib/persistence/store";
import type { AssistanceEvent, PracticeAttempt, PracticeContext } from "./types";

const DAY_MS = 86_400_000;

/** Fewer attempts than this in the window and the rate is not reported. */
export const MIN_ATTEMPTS = 5;

/** Contexts where help is available and the rate is meaningful (exams and the baseline allow none). */
const PRACTICE_CONTEXTS: ReadonlySet<PracticeContext> = new Set(["train", "lesson", "remediation", "transfer", "retrieval"]);

export interface IndependenceRate {
  /** Share of attempts made with no hint and no revealed solution; null below `MIN_ATTEMPTS`. */
  rate: number | null;
  attempts: number;
  hints: number;
  reveals: number;
  directAnswers: number;
  /** The same rate over the window before this one; null below `MIN_ATTEMPTS`. */
  previousRate: number | null;
  message?: string;
}

interface WindowCounts {
  attempts: number;
  independent: number;
  hints: number;
  reveals: number;
  directAnswers: number;
}

function inWindow(at: string, from: number, to: number): boolean {
  const t = new Date(at).getTime();
  return Number.isFinite(t) && t >= from && t < to;
}

function countWindow(attempts: PracticeAttempt[], events: AssistanceEvent[], from: number, to: number): WindowCounts {
  const out: WindowCounts = { attempts: 0, independent: 0, hints: 0, reveals: 0, directAnswers: 0 };
  for (const a of attempts) {
    if (!PRACTICE_CONTEXTS.has(a.context) || !inWindow(a.createdAt, from, to)) continue;
    out.attempts += 1;
    if (a.hintsUsed === 0 && !a.solutionRevealed) out.independent += 1;
  }
  for (const e of events) {
    if (!inWindow(e.createdAt, from, to)) continue;
    if (e.kind === "hint") out.hints += 1;
    else if (e.kind === "solution_reveal") out.reveals += 1;
    else if (e.kind === "direct_answer") out.directAnswers += 1;
  }
  return out;
}

function rateOf(w: WindowCounts): number | null {
  if (w.attempts < MIN_ATTEMPTS) return null;
  return Math.round((w.independent / w.attempts) * 1000) / 1000;
}

function pct(x: number): string {
  return `${Math.round(x * 100)} %`;
}

function windowLabel(days: number): string {
  if (days === 7) return "the last week";
  if (days === 14) return "the last two weeks";
  if (days === 30) return "the last month";
  return `the last ${days} days`;
}

/**
 * The message rule. Always states the numbers. Below the minimum it says so; a high rate is
 * acknowledged plainly; a middling or low rate is paired with what an unaided attempt does,
 * and a trend is named when there is one. Never a reproach.
 */
export function independenceMessage(current: WindowCounts, rate: number | null, previousRate: number | null, windowDays: number): string {
  const span = windowLabel(windowDays);
  if (rate === null) {
    return current.attempts === 0 ? `No practice attempts in ${span}; the rate needs at least ${MIN_ATTEMPTS}.` : `${current.attempts} practice ${current.attempts === 1 ? "attempt" : "attempts"} in ${span}; the rate needs at least ${MIN_ATTEMPTS} to mean anything.`;
  }
  const base = `You attempted ${current.independent} of ${current.attempts} problems without a hint or a solution in ${span} (${pct(rate)}).`;
  let trend = "";
  if (previousRate !== null) {
    const delta = rate - previousRate;
    if (delta >= 0.1) trend = ` That is up from ${pct(previousRate)} in the window before.`;
    else if (delta <= -0.1) trend = ` That is down from ${pct(previousRate)} in the window before.`;
    else trend = ` The window before was ${pct(previousRate)}.`;
  }
  let note = "";
  if (rate < 0.5) note = " A few minutes of unaided effort before the first hint is where most of the learning happens; the hints will still be there afterwards.";
  else if (rate < 0.7) note = " Where the method is familiar, try holding off the first hint a little longer; where it is new, hints are the right call.";
  let direct = "";
  if (current.directAnswers > 0) direct = ` You asked for a direct answer ${current.directAnswers === 1 ? "once" : `${current.directAnswers} times`}; Think First exists so that the attempt comes before the answer.`;
  return base + trend + note + direct;
}

/**
 * Independence over the last `windowDays` (default 14) and the window before it.
 * Attempts are practice attempts outside exams; hints, reveals and direct answers come
 * from `assistance_events`. Below `MIN_ATTEMPTS` attempts the rate is null and the
 * message says so.
 */
export async function independentWorkRate(db: StudyDatabase, windowDays = 14, now: Date = new Date()): Promise<IndependenceRate> {
  const days = Math.max(1, Math.floor(windowDays));
  const to = now.getTime() + 1;
  const from = now.getTime() - days * DAY_MS;
  const previousFrom = from - days * DAY_MS;
  const attempts = await db.store("practice_attempts").list({ filter: (a) => inWindow(a.createdAt, previousFrom, to) });
  const events = await db.store("assistance_events").list({ filter: (e) => inWindow(e.createdAt, previousFrom, to) });
  const current = countWindow(attempts, events, from, to);
  const previous = countWindow(attempts, events, previousFrom, from);
  const rate = rateOf(current);
  const previousRate = rateOf(previous);
  return {
    rate,
    attempts: current.attempts,
    hints: current.hints,
    reveals: current.reveals,
    directAnswers: current.directAnswers,
    previousRate,
    message: independenceMessage(current, rate, previousRate, days),
  };
}
