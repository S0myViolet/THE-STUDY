import type { StudyDatabase } from "@/lib/persistence/store";
import { stamp } from "@/lib/persistence/store";
import type { AfterAction, CaseAttempt, DailySession, DecisionEntry, Forecast, InferenceAttempt, MemoryItem, MemoryReview, ObservationAttempt, SalonSession, StrategyRun } from "@/lib/domain/types";
import type { SubskillId, Difficulty } from "@/lib/domain/faculties";
import { recordConfidence, recordError, recordEvidence, rebuildEstimates } from "@/lib/services/evidence";
import { detectRedThreads } from "@/lib/adaptation/red-thread";
import { updatePrefs, updateProfile } from "@/lib/services/profile";
import { brier } from "@/lib/scoring/calibration";
import { createRng } from "@/lib/scene/rng";
import * as C from "@/content";

/**
 * A fictional demonstration profile: roughly thirty days of use, clearly labelled.
 * Target levels: Observation sharp, Inference reliable, Memory reliable, Strategy emerging,
 * Knowledge sharp, Rhetoric reliable, Calibration emerging.
 * Red Threads: NUMERIC_DETAIL_LOSS established, PREMATURE_CLOSURE emerging, WEAK_QUESTIONS improving.
 */

const DAYS = 30;
const rng = createRng(20260904);

function at(daysAgo: number, hour = 19): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, rng.int(0, 59), rng.int(0, 59), 0);
  return d.toISOString();
}

function jitter(mean: number, spread = 0.12): number {
  return Math.max(0.05, Math.min(1, mean + (rng.next() - 0.5) * 2 * spread));
}

/** Target mean scores per subskill group (drive the level). */
const TARGET: Partial<Record<SubskillId, number>> = {
  "observation.detail": 0.78, "observation.spatial": 0.8, "observation.text": 0.58, "observation.anomaly": 0.76, "observation.chronology": 0.55, "observation.precision": 0.86, "observation.change": 0.74, "observation.separation": 0.72,
  "inference.hypothesis": 0.7, "inference.alternatives": 0.48, "inference.causal": 0.62, "inference.evidence_weighting": 0.64, "inference.information_value": 0.6, "inference.updating": 0.57, "inference.base_rates": 0.6, "inference.disconfirmation": 0.55,
  "memory.recall": 0.7, "memory.retention": 0.62, "memory.names": 0.6, "memory.sequences": 0.66, "memory.spatial": 0.68, "memory.reconstruction": 0.58,
  "strategy.second_order": 0.45, "strategy.incentives": 0.5, "strategy.planning": 0.48, "strategy.optionality": 0.44, "strategy.adversarial": 0.42, "strategy.negotiation": 0.47,
  "social.perspective": 0.62, "social.question_quality": 0.52, "social.incentive_recognition": 0.58, "social.ambiguity": 0.6, "social.rapport": 0.64, "social.listening": 0.6,
  "knowledge.history": 0.8, "knowledge.geography": 0.76, "knowledge.economics": 0.72, "knowledge.politics": 0.7, "knowledge.science": 0.68, "knowledge.psychology": 0.74, "knowledge.art": 0.66, "knowledge.connections": 0.7, "knowledge.literature": 0.7, "knowledge.business": 0.66,
  "rhetoric.clarity": 0.66, "rhetoric.concision": 0.58, "rhetoric.argument": 0.62, "rhetoric.explanation": 0.64, "rhetoric.storytelling": 0.6, "rhetoric.analogy": 0.6, "rhetoric.precision": 0.6,
  "quantitative.probability": 0.6, "quantitative.estimation": 0.58,
  "calibration.confidence": 0.5, "calibration.forecasts": 0.52,
  "composure.pausing": 0.6, "composure.ambiguity": 0.55, "composure.pressure": 0.58,
  "synthesis.cross_domain": 0.55, "synthesis.transfer": 0.5, "curiosity.exploration": 0.7, "curiosity.questioning": 0.62,
};

export async function seedDemo(db: StudyDatabase): Promise<void> {
  await db.wipe();
  await updateProfile(db, { displayName: "Demonstration", goals: ["thinking", "seeing", "knowledge"], interests: ["history", "economics", "psychology", "geopolitics"], onboardingComplete: true, baselineComplete: true, isDemo: true, enteredAt: at(DAYS) });
  await updatePrefs(db, { sessionLength: "standard", thinkFirst: true });

  const sessions: string[] = [];
  for (let d = DAYS; d >= 0; d--) {
    if (rng.chance(0.3) && d !== 0) continue; // not every day
    const sid = `demo-session-${d}`;
    sessions.push(sid);
    const day = at(d, 18);
    // Case every other active day
    if (sessions.length % 2 === 0) {
      const kase = C.CASES[sessions.length % Math.max(1, C.CASES.length)];
      if (kase) {
        const recallTotal = 6;
        const recallCorrect = rng.int(3, 6);
        const falseRecalls = rng.chance(0.25) ? 1 : 0;
        const alts = rng.chance(0.45) ? 1 : rng.int(2, 3);
        const before = jitter(0.72, 0.1);
        const after = jitter(before - 0.15, 0.1);
        const attempt = stamp<CaseAttempt>(db.userId, "att", { caseId: kase.id, status: "completed", currentStageIndex: 10, startedAt: day, completedAt: at(d, 19), sessionId: sid, summary: { recallCorrect, recallTotal, falseRecalls, separationAccuracy: jitter(0.75), hypothesesCount: 3, alternativesCount: alts, questionInformationValue: jitter(0.62), confidenceBefore: before, confidenceAfter: after, decisionQuality: jitter(0.6), overallScore: jitter(0.64), reasoningPath: [{ kind: "evidence", label: `Noticed ${recallCorrect} of ${recallTotal} details` }, { kind: "hypothesis", label: "Primary explanation", value: before }, { kind: "evidence" as const, label: (kase.stages[6].reveal?.title ?? "New evidence") as string }, { kind: "confidence", label: `Confidence ${Math.round(before * 100)}% → ${Math.round(after * 100)}%`, value: after }], noticed: [], missed: [], assumptions: alts < 2 ? ["Once you had a first explanation, you generated fewer alternatives than your recent baseline."] : [], didWell: falseRecalls === 0 ? ["Invented nothing."] : [], oneThing: alts < 2 ? "Before you commit, write two explanations you would be embarrassed to have missed." : "Keep the sequence." } });
        attempt.createdAt = day;
        attempt.updatedAt = day;
        await db.store("case_attempts").put(attempt);
        const source = { kind: "case" as const, refId: kase.id, label: `Case ${kase.number} · ${kase.title}` };
        for (const s of ["observation.detail", "observation.text", "observation.spatial", "observation.separation", "inference.hypothesis", "inference.alternatives", "inference.information_value", "inference.updating", "inference.evidence_weighting", "rhetoric.explanation", "inference.causal"] as SubskillId[]) {
          await recordEvidence(db, { subskill: s, score: jitter(TARGET[s] ?? 0.6), difficulty: kase.difficulty, format: s.startsWith("observation") ? "mcq" : "free", source, sessionId: sid, at: day });
        }
        await recordConfidence(db, { confidence: after, correct: rng.chance(0.55), domain: "inference", source, sessionId: sid, at: day, difficulty: kase.difficulty });
        if (alts < 2) await recordError(db, { type: rng.chance(0.5) ? "PREMATURE_CLOSURE" : "ALTERNATIVE_NEGLECT", subskill: "inference.alternatives", source, detail: `${kase.title}: settled on one explanation.`, sessionId: sid, at: day });
        if (falseRecalls) await recordError(db, { type: "FALSE_OBSERVATION", subskill: "observation.precision", source, detail: `${kase.title}: reported a detail that was not in the material.`, sessionId: sid, at: day });
        if (rng.chance(0.7)) await recordError(db, { type: "NUMERIC_DETAIL_LOSS", subskill: "observation.text", source, detail: `${kase.title}: remembered the event, lost the time.`, sessionId: sid, at: day });
        const aa = stamp<AfterAction>(db.userId, "aa", { source, title: `Case ${kase.number} · ${kase.title}`, saw: [`${recallCorrect} of ${recallTotal} relevant details`], missed: falseRecalls ? ["One detail invented"] : [], assumed: attempt.summary!.assumptions, didWell: attempt.summary!.didWell, turningPoint: attempt.summary!.reasoningPath[2]?.label, oneThing: attempt.summary!.oneThing ?? "Keep the sequence.", reasoningPath: attempt.summary!.reasoningPath, score: attempt.summary!.overallScore, sessionId: sid });
        aa.createdAt = at(d, 19);
        aa.updatedAt = aa.createdAt;
        await db.store("after_actions").put(aa);
      }
    }
    // Observation most days
    {
      const mode = rng.pick(["glance", "room_scan", "change", "document", "chronology"] as const);
      const coverage = jitter(mode === "document" ? 0.6 : 0.74);
      const precision = jitter(0.88, 0.08);
      const obs = stamp<ObservationAttempt>(db.userId, "obs", { mode, exerciseId: `demo-${mode}-${d}`, exposureSeconds: 20, pressure: "standard", coverage, precision, correct: Math.round(coverage * 6), total: 6, falseClaims: precision < 0.85 ? 1 : 0, details: {}, sessionId: sid });
      obs.createdAt = day;
      obs.updatedAt = day;
      await db.store("observation_attempts").put(obs);
      const source = { kind: "observation" as const, refId: obs.id, label: `${mode.replace("_", " ")} · demonstration` };
      const subs: SubskillId[] = mode === "document" ? ["observation.text", "observation.detail"] : mode === "change" ? ["observation.change", "observation.spatial"] : mode === "chronology" ? ["observation.chronology"] : ["observation.detail", "observation.spatial", "observation.anomaly"];
      for (const s of subs) await recordEvidence(db, { subskill: s, score: jitter(TARGET[s] ?? 0.7), difficulty: 3, format: "mcq", source, sessionId: sid, at: day });
      await recordEvidence(db, { subskill: "observation.precision", score: precision, difficulty: 3, format: "free", source, sessionId: sid, at: day });
      if (mode === "document" && rng.chance(0.75)) await recordError(db, { type: "NUMERIC_DETAIL_LOSS", subskill: "observation.text", source, detail: "Remembered the items, lost the totals.", sessionId: sid, at: day });
      if (mode === "chronology" && rng.chance(0.5)) await recordError(db, { type: "CHRONOLOGY_LOSS", subskill: "observation.chronology", source, detail: "Reversed two events.", sessionId: sid, at: day });
    }
    // Inference / calibration
    for (let k = 0; k < 2; k++) {
      const mode = rng.pick(["how_sure", "base_rate", "three_stories", "causal", "information_value"] as const);
      const correct = rng.chance(0.62);
      const conf = rng.pick([0.6, 0.7, 0.8, 0.8, 0.9]);
      const inf = stamp<InferenceAttempt>(db.userId, "inf", { mode: mode === "causal" ? "best_explanation" : mode, challengeId: `demo-${mode}-${d}-${k}`, response: {}, score: correct ? 1 : 0.2, confidence: conf, correct, sessionId: sid });
      inf.createdAt = at(d, 20);
      inf.updatedAt = inf.createdAt;
      await db.store("inference_attempts").put(inf);
      const source = { kind: "inference" as const, refId: inf.id, label: `${mode.replace("_", " ")} · demonstration` };
      const sub: SubskillId = mode === "how_sure" ? "knowledge.history" : mode === "base_rate" ? "inference.base_rates" : mode === "three_stories" ? "inference.alternatives" : mode === "causal" ? "inference.causal" : "inference.information_value";
      await recordEvidence(db, { subskill: sub, score: mode === "three_stories" ? jitter(0.48) : correct ? 1 : 0, difficulty: 3, format: mode === "three_stories" ? "free" : "mcq", source, correct, sessionId: sid, at: inf.createdAt, latencyMs: rng.int(6000, 40000) });
      if (mode !== "three_stories") await recordConfidence(db, { confidence: conf, correct, domain: mode === "how_sure" ? "knowledge" : "inference", source, sessionId: sid, at: inf.createdAt, difficulty: 3 });
      if (mode === "three_stories" && rng.chance(0.5)) await recordError(db, { type: "PREMATURE_CLOSURE", subskill: "inference.alternatives", source, detail: "Two stories, both variations on the first.", sessionId: sid, at: inf.createdAt });
    }
    // Quantitative, composure and curiosity, lightly
    if (sessions.length % 2 === 1) {
      const src = { kind: "inference" as const, refId: `demo-fs-${d}`, label: "Fast, then Slow" };
      const ok = rng.chance(0.6);
      await recordEvidence(db, { subskill: "quantitative.probability", score: ok ? 1 : 0, difficulty: 3, format: "mcq", source: src, correct: ok, sessionId: sid, at: day, latencyMs: rng.int(4000, 30000) });
      await recordEvidence(db, { subskill: "composure.pausing", score: jitter(0.6), difficulty: 3, format: "timed", source: src, sessionId: sid, at: day });
      await recordEvidence(db, { subskill: "curiosity.exploration", score: jitter(0.7), difficulty: 2, format: "free", source: { kind: "cabinet", refId: `demo-cur-${d}`, label: "The Cabinet" }, sessionId: sid, at: day });
      if (sessions.length % 4 === 1) await recordEvidence(db, { subskill: "synthesis.cross_domain", score: jitter(0.55), difficulty: 4, format: "free", source: { kind: "cabinet", refId: `demo-cur-${d}`, label: "The Cabinet" }, sessionId: sid, at: day });
    }
    // Salon on some days: question quality errors early, strong evidence late
    if (sessions.length % 3 === 0 && C.SALON_SCENARIOS.length) {
      const sc = C.SALON_SCENARIOS[sessions.length % C.SALON_SCENARIOS.length];
      const early = d > 12;
      const forcing = early ? 1 : 3;
      const asked = early ? 6 : 5;
      const sal = stamp<SalonSession>(db.userId, "salon", { scenarioId: sc.id, status: "completed", turns: [{ role: "character", text: sc.opening, at: day }], rapport: jitter(early ? 0.45 : 0.65), revealedFacts: sc.hiddenFacts.slice(0, early ? 2 : 4).map((f) => f.id), objectivesMet: sc.objectives.slice(0, early ? 1 : 2).map((o) => o.id), completedAt: at(d, 21), sessionId: sid, review: { questionsAsked: asked, questionsForcingNewInfo: forcing, leadingQuestions: early ? 2 : 0, talkShare: jitter(early ? 0.58 : 0.42, 0.05), objectivesMet: early ? 1 : 2, objectivesTotal: sc.objectives.length, keyImprovements: early ? [`You asked ${asked} questions, but only ${forcing} forced the other person to supply new information.`] : ["Keep the balance: you listened and asked for specifics."], strongestMove: early ? undefined : "The follow-up after the contradiction produced two facts.", score: jitter(early ? 0.45 : 0.72) } });
      sal.createdAt = day;
      sal.updatedAt = day;
      await db.store("salon_sessions").put(sal);
      const source = { kind: "salon" as const, refId: sal.id, label: `Salon · ${sc.title}` };
      await recordEvidence(db, { subskill: "social.question_quality", score: early ? jitter(0.32) : jitter(0.82, 0.06), difficulty: sc.difficulty, format: "free", source, sessionId: sid, at: at(d, 21) });
      await recordEvidence(db, { subskill: "social.listening", score: jitter(early ? 0.5 : 0.75), difficulty: sc.difficulty, format: "free", source, sessionId: sid, at: at(d, 21) });
      await recordEvidence(db, { subskill: "social.rapport", score: sal.rapport, difficulty: sc.difficulty, format: "free", source, sessionId: sid, at: at(d, 21) });
      if (early) {
        await recordError(db, { type: "QUESTION_QUALITY", subskill: "social.question_quality", source, detail: `${forcing} of ${asked} questions forced new information.`, sessionId: sid, at: at(d, 21) });
        await recordError(db, { type: "LEADING_QUESTION", subskill: "social.question_quality", source, detail: "Leading: 'You must have known about the churn?'", sessionId: sid, at: at(d, 21) });
      }
    }
    // Strategy occasionally
    if (sessions.length % 4 === 0 && C.STRATEGY_SCENARIOS.length) {
      const sc = C.STRATEGY_SCENARIOS[sessions.length % C.STRATEGY_SCENARIOS.length];
      const run = stamp<StrategyRun>(db.userId, "srun", { scenarioId: sc.id, status: "completed", path: sc.nodes.slice(0, 2).map((n) => ({ nodeId: n.id, moveId: n.moves[0]?.id ?? "m1", at: day })), currentNodeId: sc.nodes[sc.nodes.length - 1].id, score: jitter(0.46), completedAt: at(d, 21), sessionId: sid });
      run.createdAt = day;
      run.updatedAt = day;
      await db.store("strategy_runs").put(run);
      const source = { kind: "strategy" as const, refId: run.id, label: `Strategy · ${sc.title}` };
      for (const s of ["strategy.second_order", "strategy.incentives", "strategy.optionality"] as SubskillId[]) await recordEvidence(db, { subskill: s, score: jitter(TARGET[s] ?? 0.45), difficulty: sc.difficulty, format: "mcq", source, sessionId: sid, at: day });
      if (rng.chance(0.6)) await recordError(db, { type: "STRATEGIC_SHORTSIGHTEDNESS", subskill: "strategy.second_order", source, detail: `${sc.title}: matched the rival's move without asking what follows.`, sessionId: sid, at: day });
    }
    // Rhetoric on some days
    if (sessions.length % 3 === 1) {
      const source = { kind: "rhetoric" as const, refId: `demo-rh-${d}`, label: "Rhetoric · One Sentence" };
      await recordEvidence(db, { subskill: "rhetoric.clarity", score: jitter(0.66), difficulty: 3, format: "free", source, sessionId: sid, at: day });
      await recordEvidence(db, { subskill: "rhetoric.concision", score: jitter(0.58), difficulty: 3, format: "free", source, sessionId: sid, at: day });
    }
    // Knowledge reading
    if (C.ARCHIVE_ENTRIES.length) {
      const entry = C.ARCHIVE_ENTRIES.filter((e) => e.kind !== "path")[sessions.length % C.ARCHIVE_ENTRIES.filter((e) => e.kind !== "path").length];
      const prog = stamp(db.userId, "ap", { entryId: entry.id, status: rng.chance(0.6) ? "understood" : "read", readAt: day, explainedAt: undefined, memoryItemIds: [], timesUsed: rng.int(0, 2) } as never);
      (prog as { createdAt: string }).createdAt = day;
      await db.store("archive_progress").put(prog as never);
      const sub = (`knowledge.${entry.domain}` in TARGET ? `knowledge.${entry.domain}` : "knowledge.connections") as SubskillId;
      await recordEvidence(db, { subskill: sub, score: jitter(TARGET[sub] ?? 0.7), difficulty: 3, format: "free", source: { kind: "archive", refId: entry.id, label: entry.title }, sessionId: sid, at: day });
    }
    // Daily session record
    const ds = stamp<DailySession>(db.userId, "ses", { date: day.slice(0, 10), length: "standard", items: [{ id: "a", kind: "arrival", title: "Arrival", minutes: 1, reason: "ritual", reasonText: "", href: "/desk", status: "done" }, { id: "b", kind: "glance", title: "The Glance", minutes: 4, reason: "foundation", reasonText: "", href: "/observation/glance", status: "done" }, { id: "c", kind: "case", title: "Case", minutes: 22, reason: "foundation", reasonText: "", href: "/casebook", status: sessions.length % 2 === 0 ? "done" : "skipped" }, { id: "d", kind: "after_action", title: "After Action", minutes: 3, reason: "ritual", reasonText: "", href: "/desk", status: "done" }], status: "completed", startedAt: day, completedAt: at(d, 20), currentIndex: 4 });
    ds.createdAt = day;
    ds.updatedAt = day;
    await db.store("daily_sessions").put(ds);
  }

  // Memory items with review history
  const seeds = C.MEMORY_SEEDS.slice(0, 30);
  for (let i = 0; i < seeds.length; i++) {
    const s = seeds[i];
    const reps = rng.int(1, 5);
    const lapses = rng.chance(0.25) ? 1 : 0;
    const interval = [1, 3, 7, 14, 30][Math.min(4, reps)] ;
    const due = rng.chance(0.35) ? at(rng.int(0, 2)) : new Date(Date.now() + rng.int(1, 20) * 86400000).toISOString();
    const item = stamp<MemoryItem>(db.userId, "mem", { kind: s.kind, prompt: s.prompt, answer: s.answer, accept: s.accept, hint: s.hint, sequence: s.sequence, person: s.person ? { name: s.person.name, profession: s.person.profession, detail: s.person.detail, interest: s.person.interest, origin: s.person.origin } : undefined, sourceRef: { kind: "memory", refId: s.id, label: "Starter set" }, tags: s.tags, ease: 2.5 - lapses * 0.2, intervalDays: interval, due, reps, lapses, lastReviewedAt: at(rng.int(1, 10)) });
    item.createdAt = at(DAYS - 2);
    item.updatedAt = item.createdAt;
    await db.store("memory_items").put(item);
    for (let r = 0; r < reps; r++) {
      const correct = r < reps - lapses || rng.chance(0.7);
      const before = [0.5, 1, 3, 7, 14][r] ?? 14;
      const rev = stamp<MemoryReview>(db.userId, "rev", { itemId: item.id, grade: correct ? (rng.chance(0.5) ? 4 : 5) : 1, correct, confidence: rng.pick([0.4, 0.7, 0.95]), latencyMs: rng.int(2000, 15000), intervalBefore: before, intervalAfter: correct ? before * 2.2 : 1 });
      rev.createdAt = at(Math.max(0, DAYS - 3 - r * 5));
      rev.updatedAt = rev.createdAt;
      await db.store("memory_reviews").put(rev);
      await recordEvidence(db, { subskill: s.kind === "story" ? "memory.retention" : s.kind === "person" ? "memory.names" : s.kind === "sequence" ? "memory.sequences" : before >= 3 ? "memory.retention" : "memory.recall", score: correct ? (s.kind === "story" ? 0.82 : 0.66) : 0.1, difficulty: 3, format: before >= 3 ? "delayed" : "free", source: { kind: "memory", refId: item.id, label: s.prompt.slice(0, 50) }, correct, at: rev.createdAt });
    }
  }

  // Decisions: 5, 2 reviewed
  const decisions: Omit<DecisionEntry, keyof import("@/lib/domain/types").Entity>[] = [
    { title: "Whether to take the Lisbon role", options: ["Take it", "Stay and renegotiate", "Decline and keep looking"], chosen: "Stay and renegotiate", currentBelief: "The current team will grow in the spring.", expectedOutcome: "A promotion within six months and a raise of at least ten percent.", confidence: 0.65, assumptions: ["The spring budget is approved", "My manager stays"], changeMind: "If the budget slips a second time.", risks: ["The Lisbon offer does not recur"], reviewDate: at(-40), status: "open" },
    { title: "Buy the flat on Rowan Street", options: ["Buy", "Rent another year", "Buy elsewhere"], chosen: "Rent another year", currentBelief: "Prices in the area are flat for the year.", expectedOutcome: "Similar prices next spring with more choice.", confidence: 0.55, assumptions: ["Interest rates stay within a point"], changeMind: "A rate cut of more than a point.", risks: ["Prices rise", "Rent rises"], reviewDate: at(-120), status: "open" },
    { title: "Sponsor the society dinner from reserves", options: ["Sponsor", "Cancel", "Scale down"], chosen: "Scale down", currentBelief: "Attendance will hold at 100.", expectedOutcome: "A small surplus and no complaints.", confidence: 0.7, assumptions: ["The venue reduces the minimum spend"], changeMind: "Fewer than eighty tickets sold by the deadline.", risks: ["Reputational cost of a smaller event"], reviewDate: at(6), status: "reviewed", review: { reviewedAt: at(5), whatHappened: "Ninety-one tickets; a surplus of 340; two complaints about the smaller room.", luck: "The venue's cancellation the same week made them flexible.", skill: "Asking the venue before deciding.", missed: "That the smaller room would be the thing people remembered.", outcomeQuality: 0.7, decisionQuality: 0.75 } },
    { title: "Switch the team to weekly planning", options: ["Weekly", "Fortnightly", "Keep monthly"], chosen: "Weekly", currentBelief: "Monthly planning is why priorities drift.", expectedOutcome: "Fewer mid-month surprises and a shorter backlog.", confidence: 0.8, assumptions: ["The team will tolerate more meetings"], changeMind: "If meeting time rises without a visible drop in surprises.", risks: ["Meeting fatigue"], reviewDate: at(2), status: "reviewed", review: { reviewedAt: at(1), whatHappened: "Surprises fell; meeting time rose by three hours a week; two people asked to go fortnightly.", luck: "A quiet month with no incidents.", skill: "Naming the metric in advance.", missed: "The meeting cost was predictable and I did not price it.", outcomeQuality: 0.55, decisionQuality: 0.5 } },
    { title: "Learn Turkish before the Istanbul trip", options: ["Three months of lessons", "A phrasebook", "Nothing"], chosen: "Three months of lessons", currentBelief: "Basic Turkish will change the trip.", expectedOutcome: "Ordering, directions and one real conversation.", confidence: 0.6, assumptions: ["Forty minutes a day is sustainable"], changeMind: "Missing more than a week of practice.", risks: ["The trip is postponed"], reviewDate: at(-60), status: "open" },
  ];
  for (let i = 0; i < decisions.length; i++) {
    const d = stamp<DecisionEntry>(db.userId, "dec", decisions[i]);
    d.createdAt = at(DAYS - i * 5);
    d.updatedAt = d.createdAt;
    await db.store("decision_entries").put(d);
    if (d.review) await recordConfidence(db, { confidence: d.confidence, correct: d.review.outcomeQuality >= 0.5, domain: "strategy", source: { kind: "decision", refId: d.id, label: d.title }, at: d.review.reviewedAt, difficulty: 4 });
  }

  // Forecasts: 10, 6 resolved
  const questions: [string, number, Forecast["category"], boolean | null][] = [
    ["Will the central bank hold rates at its next meeting?", 0.7, "economics", true],
    ["Will the new bridge open before the end of the quarter?", 0.35, "politics", false],
    ["Will I finish the Ottoman history book by the 15th?", 0.8, "personal", false],
    ["Will the home side win the derby?", 0.55, "sports", true],
    ["Will the supplier deliver the March order on time?", 0.6, "business", false],
    ["Will the software migration slip past its date?", 0.75, "technology", true],
    ["Will the cafe opposite still be open in six months?", 0.6, "business", null],
    ["Will I keep the weekly planning after three months?", 0.5, "personal", null],
    ["Will inflation print below three percent next release?", 0.4, "economics", null],
    ["Will the museum loan go ahead as announced?", 0.65, "other", null],
  ];
  for (let i = 0; i < questions.length; i++) {
    const [q, p, cat, outcome] = questions[i];
    const created = at(DAYS - i * 2);
    const f = stamp<Forecast>(db.userId, "fc", { question: q, probability: p, reasoning: "Base rate and the last three instances point this way.", evidence: "Two prior cases; one contrary signal.", changeMind: "A public statement to the contrary.", resolutionDate: outcome === null ? new Date(Date.now() + (i + 3) * 5 * 86400000).toISOString() : at(rng.int(1, 8)), category: cat, status: outcome === null ? "open" : "resolved", history: [{ at: created, probability: p }], outcome: outcome ?? undefined, brier: outcome === null ? undefined : brier(p, outcome), resolvedAt: outcome === null ? undefined : at(rng.int(0, 6)) });
    f.createdAt = created;
    f.updatedAt = created;
    await db.store("forecasts").put(f);
    if (outcome !== null) {
      const conf = p >= 0.5 ? p : 1 - p;
      const correct = p >= 0.5 ? outcome : !outcome;
      await recordConfidence(db, { confidence: conf, correct, domain: "calibration", source: { kind: "forecast", refId: f.id, label: q.slice(0, 50) }, asEvidence: false, at: f.resolvedAt });
      await recordEvidence(db, { subskill: "calibration.forecasts", score: 1 - brier(p, outcome), difficulty: 4, format: "numeric", source: { kind: "forecast", refId: f.id, label: q.slice(0, 50) }, at: f.resolvedAt });
    }
  }

  await rebuildEstimates(db);
  await detectRedThreads(db);
  // Second pass so improvement can register for question quality (counter-evidence recorded after the last error).
  await detectRedThreads(db);
}
