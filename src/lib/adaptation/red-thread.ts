import type { StudyDatabase } from "@/lib/persistence/store";
import { stamp } from "@/lib/persistence/store";
import type { ErrorEvent, RedThread, RedThreadConfidence, RedThreadStatus, RedThreadType, SkillEvidence } from "@/lib/domain/types";
import type { ErrorType } from "@/lib/domain/errors";
import type { SubskillId } from "@/lib/domain/faculties";
import { calibrationBuckets } from "@/lib/scoring/calibration";
import { notify } from "@/lib/services/notifications";

/**
 * The Red Thread engine. Conservative by design: a pattern needs at least three
 * relevant instances across at least two sessions inside a rolling window before
 * it is even a candidate. Threads improve and resolve when the behaviour changes;
 * the Study never keeps criticising a corrected habit.
 */

export interface PatternDef {
  key: string;
  type: RedThreadType;
  title: string;
  errorTypes: ErrorType[];
  describe: (ctx: { n: number; sessions: number; extra?: string }) => string;
  nextTest: string;
  targetSubskill: SubskillId;
  /** Module href that specifically tests the pattern */
  testHref: string;
}

export const PATTERNS: PatternDef[] = [
  {
    key: "PREMATURE_CLOSURE",
    type: "reasoning",
    title: "Premature closure",
    errorTypes: ["PREMATURE_CLOSURE", "ALTERNATIVE_NEGLECT"],
    describe: ({ n }) => `You often settle on a first explanation and stop generating alternatives afterward. Seen ${n} times in ambiguous material.`,
    nextTest: "A Three Stories challenge where the obvious explanation is wrong.",
    targetSubskill: "inference.alternatives",
    testHref: "/inference/three_stories",
  },
  {
    key: "CONFIRMATION_SEEKING",
    type: "reasoning",
    title: "Confirmation seeking",
    errorTypes: ["CONFIRMATION_BIAS"],
    describe: ({ n }) => `You tend to notice evidence that supports your current hypothesis and weigh contradicting evidence lightly (${n} instances).`,
    nextTest: "A Disconfirm Me exercise: name what would weaken your own theory.",
    targetSubskill: "inference.disconfirmation",
    testHref: "/inference/disconfirm",
  },
  {
    key: "INSUFFICIENT_UPDATE",
    type: "reasoning",
    title: "Barely updating",
    errorTypes: ["INSUFFICIENT_UPDATE"],
    describe: ({ n }) => `When new evidence contradicts your position you notice it but barely move your confidence (${n} cases).`,
    nextTest: "A case with a late contradiction; watch the confidence before and after.",
    targetSubskill: "inference.updating",
    testHref: "/casebook",
  },
  {
    key: "BASE_RATE_NEGLECT",
    type: "reasoning",
    title: "Base rate neglect",
    errorTypes: ["BASE_RATE_NEGLECT"],
    describe: ({ n }) => `Vivid specific evidence pulls you away from what is usually true (${n} instances).`,
    nextTest: "A base-rate problem where the specific evidence is compelling and misleading.",
    targetSubskill: "inference.base_rates",
    testHref: "/inference/base_rate",
  },
  {
    key: "CAUSAL_LEAP",
    type: "reasoning",
    title: "Causal leaps",
    errorTypes: ["CAUSAL_ERROR"],
    describe: ({ n }) => `You move from correlation or sequence to cause faster than the evidence allows (${n} instances).`,
    nextTest: "A Missing Variable exercise.",
    targetSubskill: "inference.causal",
    testHref: "/inference/missing_variable",
  },
  {
    key: "UNEXAMINED_ASSUMPTION",
    type: "reasoning",
    title: "Unexamined assumptions",
    errorTypes: ["ASSUMPTION"],
    describe: ({ n }) => `Beliefs enter your reasoning without being noticed as assumptions (${n} instances).`,
    nextTest: "An Inference Ladder with an explicit assumptions line.",
    targetSubskill: "inference.evidence_weighting",
    testHref: "/inference/ladder",
  },
  {
    key: "FALSE_OBSERVATION",
    type: "observation",
    title: "Invented details",
    errorTypes: ["FALSE_OBSERVATION"],
    describe: ({ n }) => `You report details that were not present. Your coverage is ahead of your precision (${n} invented details).`,
    nextTest: "A Room Scan scored on precision, with hedging rewarded.",
    targetSubskill: "observation.precision",
    testHref: "/observation/room_scan",
  },
  {
    key: "CHRONOLOGY_LOSS",
    type: "observation",
    title: "Chronology loss",
    errorTypes: ["CHRONOLOGY_LOSS", "TIMELINE_ERROR"],
    describe: ({ n }) => `You remember what was there but lose the order in which things happened (${n} instances).`,
    nextTest: "A chronology reconstruction with two plausible orders.",
    targetSubskill: "observation.chronology",
    testHref: "/observation/chronology",
  },
  {
    key: "NUMERIC_DETAIL_LOSS",
    type: "memory",
    title: "Numeric detail loss",
    errorTypes: ["NUMERIC_DETAIL_LOSS"],
    describe: ({ n }) => `You keep the meaning and lose the numbers: times, counts, prices, dates (${n} instances).`,
    nextTest: "A Document Scan with five numeric questions.",
    targetSubskill: "observation.text",
    testHref: "/observation/document",
  },
  {
    key: "SPATIAL_MISS",
    type: "observation",
    title: "Spatial misses",
    errorTypes: ["SPATIAL_MISS"],
    describe: ({ n }) => `You notice objects but misplace where they were (${n} instances).`,
    nextTest: "A Glance with position questions only.",
    targetSubskill: "observation.spatial",
    testHref: "/observation/glance",
  },
  {
    key: "OBSERVATION_MISS",
    type: "observation",
    title: "Missing the small things",
    errorTypes: ["OBSERVATION_MISS"],
    describe: ({ n }) => `Small, high-information details pass you by (${n} missed).`,
    nextTest: "A Signal vs Noise exercise.",
    targetSubskill: "observation.detail",
    testHref: "/observation/signal_noise",
  },
  {
    key: "OBSERVATION_BLUR",
    type: "observation",
    title: "Observation and interpretation blur",
    errorTypes: ["MISREAD"],
    describe: ({ n }) => `You describe what you inferred as though you saw it (${n} instances).`,
    nextTest: "Observation or Story? with hard cases.",
    targetSubskill: "observation.separation",
    testHref: "/observation/observation_or_story",
  },
  {
    key: "OVERCONFIDENCE",
    type: "confidence",
    title: "Overconfidence",
    errorTypes: ["OVERCONFIDENCE"],
    describe: ({ n, extra }) => `When you say 80% or more you are right less often than that${extra ? ` (${extra})` : ""}. ${n} confident misses.`,
    nextTest: "How Sure? items in an unfamiliar domain.",
    targetSubskill: "calibration.confidence",
    testHref: "/inference/how_sure",
  },
  {
    key: "UNDERCONFIDENCE",
    type: "confidence",
    title: "Underconfidence",
    errorTypes: ["UNDERCONFIDENCE"],
    describe: ({ n, extra }) => `You are right more often than you say${extra ? ` (${extra})` : ""}. ${n} hedged successes.`,
    nextTest: "How Sure? items where you must commit above 70%.",
    targetSubskill: "calibration.confidence",
    testHref: "/inference/how_sure",
  },
  {
    key: "LEADING_TOO_EARLY",
    type: "conversational",
    title: "Leading too early",
    errorTypes: ["LEADING_QUESTION"],
    describe: ({ n }) => `You ask leading questions before you have earned the information, and the conversation gives you less (${n} leading questions).`,
    nextTest: "A Salon objective that requires neutral information gathering.",
    targetSubskill: "social.question_quality",
    testHref: "/salon",
  },
  {
    key: "WEAK_QUESTIONS",
    type: "conversational",
    title: "Questions that confirm rather than discriminate",
    errorTypes: ["QUESTION_QUALITY", "INFORMATION_VALUE"],
    describe: ({ n }) => `Your questions tend to confirm what you already think rather than separate competing explanations (${n} low-value questions).`,
    nextTest: "An Information Value exercise with one question allowed.",
    targetSubskill: "inference.information_value",
    testHref: "/inference/information_value",
  },
  {
    key: "SHORTSIGHTED",
    type: "strategic",
    title: "Stopping at the first move",
    errorTypes: ["STRATEGIC_SHORTSIGHTEDNESS"],
    describe: ({ n }) => `You consider the first move and not what follows it (${n} instances).`,
    nextTest: "Three Moves Ahead with a counterparty who responds to incentives.",
    targetSubskill: "strategy.second_order",
    testHref: "/strategy",
  },
  {
    key: "TRANSFER_GAP",
    type: "knowledge",
    title: "Knowledge that stays where it was learned",
    errorTypes: ["TRANSFER_FAILURE"],
    describe: ({ n }) => `You know principles in the Archive that you do not apply when a case needs them (${n} instances).`,
    nextTest: "A case that quietly uses something you learned last week.",
    targetSubskill: "synthesis.transfer",
    testHref: "/casebook",
  },
  {
    key: "VERBOSITY",
    type: "writing",
    title: "More words than the idea needs",
    errorTypes: ["VERBOSITY"],
    describe: ({ n }) => `Your explanations run longer than they need to (${n} instances).`,
    nextTest: "A One Sentence and a Precision exercise back to back.",
    targetSubskill: "rhetoric.concision",
    testHref: "/rhetoric/precision",
  },
  {
    key: "MEMORY_DECAY",
    type: "memory",
    title: "Retention gaps",
    errorTypes: ["MEMORY_FAILURE"],
    describe: ({ n }) => `Items you learned do not survive their first long interval (${n} lapses).`,
    nextTest: "Reconstruction of an Archive entry from memory.",
    targetSubskill: "memory.retention",
    testHref: "/memory/review",
  },
];

export const WINDOW_DAYS = 60;
export const MIN_INSTANCES = 3;
export const MIN_SESSIONS = 2;

function sessionKey(e: ErrorEvent): string {
  return e.sessionId ?? e.createdAt.slice(0, 10);
}

export function strengthFor(n: number, sessions: number, recentDays: number): number {
  const base = Math.min(1, (n - 2) / 8);
  const spread = Math.min(1, sessions / 5);
  const recency = recentDays <= 7 ? 1 : recentDays <= 21 ? 0.85 : 0.6;
  return Math.round(Math.min(1, (0.6 * base + 0.4 * spread) * recency) * 100) / 100;
}

export function confidenceFor(n: number, sessions: number): RedThreadConfidence {
  if (n >= 10 && sessions >= 5) return "strong";
  if (n >= 6 && sessions >= 3) return "moderate";
  if (n >= 4) return "emerging";
  return "low";
}

export function statusFromEvidence(n: number, sessions: number): RedThreadStatus {
  if (n >= 8 && sessions >= 4) return "established";
  if (n >= 5 && sessions >= 3) return "emerging";
  return "candidate";
}

export interface DetectionResult {
  created: RedThread[];
  updated: RedThread[];
  improved: RedThread[];
  resolved: RedThread[];
}

/** Run detection over recent errors and evidence. Safe to call after any exercise. */
export async function detectRedThreads(db: StudyDatabase, now = new Date()): Promise<DetectionResult> {
  const since = new Date(now.getTime() - WINDOW_DAYS * 86400000).toISOString();
  const [errors, evidence, existing, confidences] = await Promise.all([
    db.store("error_events").list({ filter: (e) => e.createdAt >= since }),
    db.store("skill_evidence").list({ filter: (e) => e.createdAt >= since }),
    db.store("red_threads").list(),
    db.store("confidence_entries").list(),
  ]);
  const result: DetectionResult = { created: [], updated: [], improved: [], resolved: [] };
  const store = db.store("red_threads");

  for (const def of PATTERNS) {
    const relevant = errors.filter((e) => def.errorTypes.includes(e.type)).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const sessions = new Set(relevant.map(sessionKey));
    const current = existing.find((t) => t.patternKey === def.key);
    const n = relevant.length;
    const last = relevant[relevant.length - 1];
    const recentDays = last ? (now.getTime() - new Date(last.createdAt).getTime()) / 86400000 : 999;

    // Counter-evidence: strong recent performance on the target subskill after the last reinforcement.
    const counter = current
      ? evidence.filter((ev) => ev.subskill === def.targetSubskill && ev.score >= 0.75 && ev.createdAt > current.lastReinforced)
      : [];
    const counterSessions = new Set(counter.map((ev) => ev.sessionId ?? ev.createdAt.slice(0, 10)));

    let extra: string | undefined;
    if (def.key === "OVERCONFIDENCE" || def.key === "UNDERCONFIDENCE") {
      const b = calibrationBuckets(confidences).filter((x) => x.sufficient);
      const hi = b.filter((x) => x.lo >= 0.8);
      if (hi.length) {
        const nn = hi.reduce((s, x) => s + x.n, 0);
        const acc = hi.reduce((s, x) => s + x.accuracy * x.n, 0) / nn;
        extra = `${Math.round(acc * 100)}% right at 80%+, n = ${nn}`;
      }
    }

    if (!current) {
      if (n >= MIN_INSTANCES && sessions.size >= MIN_SESSIONS) {
        const thread = stamp<RedThread>(db.userId, "rt", {
          patternType: def.type,
          patternKey: def.key,
          title: def.title,
          description: def.describe({ n, sessions: sessions.size, extra }),
          evidenceIds: relevant.map((e) => e.id),
          counterEvidenceIds: [],
          strength: strengthFor(n, sessions.size, recentDays),
          confidence: confidenceFor(n, sessions.size),
          status: statusFromEvidence(n, sessions.size),
          firstDetected: relevant[0].createdAt,
          lastReinforced: last.createdAt,
          nextTest: def.nextTest,
          targetSubskill: def.targetSubskill,
          sessionsObserved: [...sessions],
        });
        await store.put(thread);
        result.created.push(thread);
        await notify(db, { kind: "thread_detected", title: `A pattern is forming: ${def.title}`, body: thread.description, href: `/red-thread/${thread.id}`, dedupeKey: def.key });
      }
      continue;
    }

    if (current.status === "resolved") {
      // Re-open only with fresh evidence after resolution.
      const fresh = relevant.filter((e) => e.createdAt > (current.resolvedAt ?? current.updatedAt));
      if (fresh.length >= MIN_INSTANCES) {
        const updated: RedThread = { ...current, status: "candidate", evidenceIds: fresh.map((e) => e.id), counterEvidenceIds: [], strength: strengthFor(fresh.length, new Set(fresh.map(sessionKey)).size, recentDays), confidence: confidenceFor(fresh.length, new Set(fresh.map(sessionKey)).size), lastReinforced: fresh[fresh.length - 1].createdAt, resolvedAt: undefined, description: def.describe({ n: fresh.length, sessions: new Set(fresh.map(sessionKey)).size, extra }) };
        await store.put(updated);
        result.updated.push(updated);
      }
      continue;
    }

    const newEvidence = relevant.filter((e) => !current.evidenceIds.includes(e.id));
    let next: RedThread = { ...current };
    let changed = false;

    if (newEvidence.length) {
      next.evidenceIds = [...new Set([...current.evidenceIds, ...newEvidence.map((e) => e.id)])];
      next.lastReinforced = last.createdAt;
      next.sessionsObserved = [...new Set([...current.sessionsObserved, ...sessions])];
      const total = next.evidenceIds.length;
      next.strength = strengthFor(total, next.sessionsObserved.length, recentDays);
      next.confidence = confidenceFor(total, next.sessionsObserved.length);
      next.description = def.describe({ n: total, sessions: next.sessionsObserved.length, extra });
      if (current.status === "improving") {
        // regression: back to established/emerging
        next.status = statusFromEvidence(total, next.sessionsObserved.length);
      } else {
        next.status = statusFromEvidence(total, next.sessionsObserved.length);
      }
      changed = true;
    }

    // Improvement: at least 3 strong performances across 2+ sessions with no reinforcement since.
    if (counter.length >= 3 && counterSessions.size >= 2 && !newEvidence.length && (current.status === "emerging" || current.status === "established")) {
      next.status = "improving";
      next.counterEvidenceIds = counter.map((ev) => ev.id);
      changed = true;
      result.improved.push(next);
      await notify(db, { kind: "thread_improved", title: `${def.title} is improving`, body: "Recent performance on the targeted skill has been strong with no recurrence.", href: `/red-thread/${current.id}`, dedupeKey: def.key + ":improving" });
    } else if (current.status === "improving") {
      const sinceImproving = counter.length;
      const daysQuiet = (now.getTime() - new Date(current.lastReinforced).getTime()) / 86400000;
      if (sinceImproving >= 6 && counterSessions.size >= 3 && daysQuiet >= 14) {
        next.status = "resolved";
        next.resolvedAt = now.toISOString();
        next.counterEvidenceIds = counter.map((ev) => ev.id);
        changed = true;
        result.resolved.push(next);
        const { reachMilestone } = await import("@/lib/services/notifications");
        await reachMilestone(db, "thread_resolved");
      } else if (counter.length !== current.counterEvidenceIds.length) {
        next.counterEvidenceIds = counter.map((ev) => ev.id);
        changed = true;
      }
    }

    if (changed) {
      next = { ...next };
      await store.put(next);
      if (!result.improved.includes(next) && !result.resolved.includes(next)) result.updated.push(next);
    }
  }
  return result;
}

export function patternFor(key: string): PatternDef | undefined {
  return PATTERNS.find((p) => p.key === key);
}

export function relevantEvidence(thread: RedThread, evidence: SkillEvidence[]): SkillEvidence[] {
  return evidence.filter((e) => thread.counterEvidenceIds.includes(e.id));
}
