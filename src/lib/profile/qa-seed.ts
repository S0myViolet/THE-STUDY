/**
 * QA-ONLY SEEDING for the Profile room.
 *
 * Reached solely through `/profile?qa-seed=1`. Never surfaced in the interface.
 * Writes ~60 varied pieces of SkillEvidence (backdated across 30 days) through the
 * real evidence write path, 30 confidence entries, and a handful of observation
 * attempts, memory reviews, salon sessions, daily sessions, red threads and
 * milestones so every chart in /profile/evidence has something to draw.
 *
 * Idempotent: a second visit does nothing.
 */
import type { StudyDatabase } from "@/lib/persistence/store";
import { stamp } from "@/lib/persistence/store";
import type { DailySession, MemoryReview, ObservationAttempt, RedThread, SalonSession } from "@/lib/domain/types";
import { SUBSKILL_IDS, type Difficulty, type FacultyId, type SubskillId } from "@/lib/domain/faculties";
import type { EvidenceSourceKind, ResponseFormat } from "@/lib/domain/types";
import { recordConfidence, recordEvidence } from "@/lib/services/evidence";
import { reachMilestone } from "@/lib/services/notifications";

export const QA_SEED_REF = "qa-seed";

/** Deterministic generator so the seeded profile looks the same every time. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function at(daysAgo: number, hour: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 12, 0, 0);
  return d.toISOString();
}

const SOURCE_FOR: Partial<Record<FacultyId, { kind: EvidenceSourceKind; label: string }>> = {
  observation: { kind: "observation", label: "The Glance · Cafe" },
  inference: { kind: "inference", label: "Three Stories · The late train" },
  memory: { kind: "memory", label: "Review · Peace of Westphalia" },
  strategy: { kind: "strategy", label: "Counterparty · The lease" },
  social: { kind: "salon", label: "Salon · The gallery owner" },
  knowledge: { kind: "archive", label: "Archive · Bretton Woods" },
  rhetoric: { kind: "rhetoric", label: "Rhetoric · Say it in forty words" },
  quantitative: { kind: "inference", label: "Base rates · The clinic" },
  calibration: { kind: "inference", label: "How sure? · Series 3" },
  composure: { kind: "observation", label: "The Glance · Pressure" },
  synthesis: { kind: "archive", label: "Graph · Silk Road to containers" },
  curiosity: { kind: "cabinet", label: "Cabinet · Coffeehouses" },
};

/** Faculty tendencies: a baseline quality and a drift over the month, so trends differ. */
const PROFILE: Record<FacultyId, { base: number; drift: number; weight: number }> = {
  observation: { base: 0.62, drift: 0.18, weight: 3 },
  inference: { base: 0.7, drift: 0.05, weight: 3 },
  memory: { base: 0.66, drift: -0.12, weight: 2 },
  strategy: { base: 0.55, drift: 0.1, weight: 1.5 },
  social: { base: 0.58, drift: 0.02, weight: 1.5 },
  knowledge: { base: 0.74, drift: 0.04, weight: 2 },
  rhetoric: { base: 0.6, drift: 0.14, weight: 1.2 },
  quantitative: { base: 0.5, drift: 0.0, weight: 0.6 },
  calibration: { base: 0.7, drift: 0.05, weight: 0 }, // fed by confidence entries
  composure: { base: 0.48, drift: 0.08, weight: 0.6 },
  synthesis: { base: 0.6, drift: 0.05, weight: 0.4 },
  curiosity: { base: 0, drift: 0, weight: 0 }, // deliberately untested
};

const FORMATS: ResponseFormat[] = ["mcq", "free", "numeric", "free", "timed", "sort"];

export async function alreadySeeded(db: StudyDatabase): Promise<boolean> {
  const hits = await db.store("skill_evidence").list({ filter: (e) => e.source.refId.startsWith(QA_SEED_REF), limit: 1 });
  return hits.length > 0;
}

export async function seedProfileQA(db: StudyDatabase): Promise<void> {
  if (await alreadySeeded(db)) return;
  const r = rng(4021);
  const userId = db.userId;

  // --- 1. ~60 evidence items, chronological so estimate histories are ordered
  const plan: { daysAgo: number; hour: number; subskill: SubskillId; faculty: FacultyId; score: number; difficulty: Difficulty; format: ResponseFormat; transfer: boolean; latencyMs: number }[] = [];
  const faculties = Object.keys(PROFILE) as FacultyId[];
  const totalWeight = faculties.reduce((s, f) => s + PROFILE[f].weight, 0);
  for (let i = 0; i < 60; i++) {
    // pick a faculty proportional to weight
    let pick = r() * totalWeight;
    let faculty: FacultyId = "observation";
    for (const f of faculties) {
      pick -= PROFILE[f].weight;
      if (pick <= 0) {
        faculty = f;
        break;
      }
    }
    const subs = SUBSKILL_IDS.filter((s) => s.startsWith(faculty + "."));
    const subskill = subs[Math.floor(r() * Math.min(subs.length, 4))];
    const daysAgo = Math.floor(r() * 30);
    const progress = 1 - daysAgo / 30;
    const p = PROFILE[faculty];
    const noise = (r() - 0.5) * 0.35;
    const score = Math.max(0, Math.min(1, p.base + p.drift * progress + noise));
    const difficulty = (1 + Math.floor(r() * 6)) as Difficulty;
    plan.push({ daysAgo, hour: 8 + Math.floor(r() * 12), subskill, faculty, score: Math.round(score * 100) / 100, difficulty, format: FORMATS[Math.floor(r() * FORMATS.length)], transfer: r() < 0.12, latencyMs: 2000 + Math.floor(r() * 20000) });
  }
  plan.sort((a, b) => b.daysAgo - a.daysAgo || a.hour - b.hour);
  for (const item of plan) {
    const src = SOURCE_FOR[item.faculty] ?? { kind: "case" as const, label: "Case · Seeded" };
    await recordEvidence(db, {
      subskill: item.subskill,
      score: item.score,
      difficulty: item.difficulty,
      format: item.format,
      transfer: item.transfer,
      source: { kind: src.kind, refId: `${QA_SEED_REF}-${item.subskill}-${item.daysAgo}`, label: src.label },
      latencyMs: item.latencyMs,
      correct: item.score >= 0.6,
      at: at(item.daysAgo, item.hour),
    });
  }

  // --- 2. 30 confidence entries: a mildly overconfident profile, improving late in the month
  const domains: FacultyId[] = ["inference", "observation", "knowledge", "memory"];
  for (let i = 0; i < 30; i++) {
    const daysAgo = 29 - Math.floor((i / 30) * 30);
    const confidence = [0.5, 0.6, 0.7, 0.75, 0.85, 0.9, 0.95][Math.floor(r() * 7)];
    const late = daysAgo < 10;
    // accuracy runs below stated confidence early, near it late
    const pCorrect = late ? confidence - 0.03 : confidence - 0.15;
    const correct = r() < pCorrect;
    await recordConfidence(db, {
      confidence,
      correct,
      domain: domains[i % domains.length],
      difficulty: (2 + (i % 4)) as Difficulty,
      source: { kind: "inference", refId: `${QA_SEED_REF}-conf-${i}`, label: "How sure? · Series 3" },
      at: at(daysAgo, 9 + (i % 9)),
    });
  }

  // --- 3. Observation attempts: coverage climbs, precision holds
  const obs: ObservationAttempt[] = [];
  for (let i = 0; i < 12; i++) {
    const daysAgo = 28 - i * 2;
    const coverage = Math.max(0.2, Math.min(1, 0.42 + i * 0.035 + (r() - 0.5) * 0.12));
    const precision = Math.max(0.3, Math.min(1, 0.8 + (r() - 0.5) * 0.16));
    const total = 6 + Math.floor(r() * 4);
    const correct = Math.round(coverage * total);
    const o = stamp<ObservationAttempt>(userId, "obs", {
      mode: (["glance", "room_scan", "change", "document"] as const)[i % 4],
      exerciseId: `${QA_SEED_REF}-cafe:${4021 + i}`,
      exposureSeconds: 8,
      pressure: i % 3 === 0 ? "pressure" : "standard",
      coverage: Math.round(coverage * 100) / 100,
      precision: Math.round(precision * 100) / 100,
      correct,
      total,
      falseClaims: Math.round((1 - precision) * correct),
      details: { qa: true },
    });
    o.createdAt = o.updatedAt = at(daysAgo, 10);
    obs.push(o);
  }
  await db.store("observation_attempts").putMany(obs);

  // --- 4. Memory reviews across interval buckets
  const reviews: MemoryReview[] = [];
  const intervals = [0.5, 1, 1, 3, 3, 6, 7, 10, 14, 21, 28, 0.5, 2, 5, 12, 25, 1, 3, 8, 30];
  for (let i = 0; i < intervals.length; i++) {
    const interval = intervals[i];
    const pCorrect = interval < 1 ? 0.95 : interval < 3 ? 0.85 : interval < 7 ? 0.75 : interval < 30 ? 0.6 : 0.5;
    const correct = r() < pCorrect;
    const grade = (correct ? (r() < 0.5 ? 5 : 4) : r() < 0.4 ? 0 : 1) as MemoryReview["grade"];
    const rev = stamp<MemoryReview>(userId, "rev", {
      itemId: `${QA_SEED_REF}-item-${i % 7}`,
      grade,
      correct,
      intervalBefore: interval,
      intervalAfter: correct ? interval * 2.2 : 1,
      latencyMs: 2500 + Math.floor(r() * 9000),
    });
    rev.createdAt = rev.updatedAt = at(Math.floor(r() * 29), 18);
    reviews.push(rev);
  }
  await db.store("memory_reviews").putMany(reviews);

  // --- 5. Salon sessions with reviews: question quality improving
  const salons: SalonSession[] = [];
  for (let i = 0; i < 6; i++) {
    const asked = 8 + Math.floor(r() * 6);
    const forcing = Math.round(asked * Math.min(0.9, 0.3 + i * 0.09 + (r() - 0.5) * 0.1));
    const s = stamp<SalonSession>(userId, "sal", {
      scenarioId: `${QA_SEED_REF}-salon-${i}`,
      status: "completed",
      turns: [],
      rapport: 0.5 + r() * 0.4,
      revealedFacts: [],
      objectivesMet: [],
      review: { questionsAsked: asked, questionsForcingNewInfo: forcing, leadingQuestions: Math.floor(r() * 3), talkShare: 0.4 + r() * 0.2, objectivesMet: 2, objectivesTotal: 3, keyImprovements: [], score: forcing / asked },
      completedAt: at(27 - i * 5, 19),
    });
    s.createdAt = s.updatedAt = at(27 - i * 5, 19);
    salons.push(s);
  }
  await db.store("salon_sessions").putMany(salons);

  // --- 6. Daily sessions: most days, a few missed
  const sessions: DailySession[] = [];
  for (let d = 29; d >= 0; d--) {
    if (r() < 0.3) continue;
    const day = new Date();
    day.setDate(day.getDate() - d);
    const s = stamp<DailySession>(userId, "ds", {
      date: day.toISOString().slice(0, 10),
      length: (["quick", "standard", "standard", "deep"] as const)[Math.floor(r() * 4)],
      items: [],
      status: d === 0 && r() < 0.5 ? "active" : "completed",
      startedAt: at(d, 8),
      completedAt: at(d, 9),
      currentIndex: 0,
    });
    s.createdAt = s.updatedAt = at(d, 8);
    sessions.push(s);
  }
  await db.store("daily_sessions").putMany(sessions);

  // --- 7. Red threads in several states
  const threads: Omit<RedThread, keyof import("@/lib/domain/types").Entity>[] = [
    { patternType: "reasoning", patternKey: "PREMATURE_CLOSURE", title: "Premature closure", description: "You often settle on a first explanation and stop generating alternatives afterward.", evidenceIds: [], counterEvidenceIds: [], strength: 0.62, confidence: "moderate", status: "established", firstDetected: at(24, 9), lastReinforced: at(3, 9), nextTest: "A Three Stories challenge where the obvious explanation is wrong.", targetSubskill: "inference.alternatives", sessionsObserved: ["a", "b", "c"] },
    { patternType: "observational", patternKey: "FALSE_OBSERVATION", title: "Inventing details", description: "Details reported that were never shown.", evidenceIds: [], counterEvidenceIds: [], strength: 0.35, confidence: "emerging", status: "improving", firstDetected: at(20, 9), lastReinforced: at(12, 9), nextTest: "A room scan with an explicit 'not sure' option.", targetSubskill: "observation.precision", sessionsObserved: ["a", "b"] },
    { patternType: "calibration", patternKey: "OVERCONFIDENCE", title: "Overconfidence", description: "Stated confidence runs ahead of accuracy above 80%.", evidenceIds: [], counterEvidenceIds: [], strength: 0.5, confidence: "moderate", status: "emerging", firstDetected: at(9, 9), lastReinforced: at(1, 9), nextTest: "A How sure? series with harder items.", targetSubskill: "calibration.confidence", sessionsObserved: ["b", "c"] },
    { patternType: "conversational", patternKey: "LEADING_QUESTIONS", title: "Leading questions", description: "Questions that suggested their own answer.", evidenceIds: [], counterEvidenceIds: [], strength: 0.1, confidence: "low", status: "resolved", firstDetected: at(28, 9), lastReinforced: at(17, 9), nextTest: "A Salon where the character resists suggestion.", targetSubskill: "social.question_quality", sessionsObserved: ["a", "b", "c"], resolvedAt: at(6, 9) },
  ] as never;
  const threadRows = threads.map((t, i) => {
    const row = stamp<RedThread>(userId, "thr", t);
    row.createdAt = row.updatedAt = t.firstDetected;
    row.id = `thr_${QA_SEED_REF}_${i}`;
    return row;
  });
  await db.store("red_threads").putMany(threadRows);

  // --- 8. Milestones
  await reachMilestone(db, "first_case");
  await reachMilestone(db, "first_forecast");
  await reachMilestone(db, "thread_resolved");
}
