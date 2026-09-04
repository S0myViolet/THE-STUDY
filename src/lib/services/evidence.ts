import type { StudyDatabase } from "@/lib/persistence/store";
import { stamp } from "@/lib/persistence/store";
import type { ConfidenceEntry, ErrorEvent, EvidenceSourceKind, ResponseFormat, SkillEstimate, SkillEvidence } from "@/lib/domain/types";
import { facultyOf, type Difficulty, type SubskillId } from "@/lib/domain/faculties";
import type { ErrorType } from "@/lib/domain/errors";
import { applyEvidence, estimateConfidence, evidenceWeight, levelFor, trendFor } from "@/lib/scoring/estimates";
import { calibrationScore } from "@/lib/scoring/calibration";

export interface EvidenceInput {
  subskill: SubskillId;
  score: number; // 0..1
  difficulty: Difficulty;
  format?: ResponseFormat;
  transfer?: boolean;
  source: { kind: EvidenceSourceKind; refId: string; label?: string };
  latencyMs?: number;
  confidence?: number;
  correct?: boolean;
  sessionId?: string;
  note?: string;
  /** Override timestamp (used by demo seeding) */
  at?: string;
}

const HISTORY_LIMIT = 120;

/**
 * Record one piece of evidence and fold it into the subskill estimate.
 * This is the single write path used by every room.
 */
export async function recordEvidence(db: StudyDatabase, input: EvidenceInput): Promise<{ evidence: SkillEvidence; estimate: SkillEstimate }> {
  const faculty = facultyOf(input.subskill);
  const format = input.format ?? "free";
  const weight = evidenceWeight({ difficulty: input.difficulty, format, transfer: input.transfer });
  const evidence = stamp<SkillEvidence>(db.userId, "ev", {
    subskill: input.subskill,
    faculty,
    score: clamp01(input.score),
    difficulty: input.difficulty,
    weight,
    format,
    transfer: !!input.transfer,
    source: input.source,
    latencyMs: input.latencyMs,
    confidence: input.confidence,
    correct: input.correct,
    sessionId: input.sessionId,
    note: input.note,
  });
  if (input.at) {
    evidence.createdAt = input.at;
    evidence.updatedAt = input.at;
  }
  await db.store("skill_evidence").put(evidence);
  const estimate = await foldIntoEstimate(db, evidence);
  return { evidence, estimate };
}

export async function foldIntoEstimate(db: StudyDatabase, evidence: SkillEvidence): Promise<SkillEstimate> {
  const store = db.store("skill_estimates");
  const existing = (await store.list({ where: { subskill: evidence.subskill } as Partial<SkillEstimate> }))[0];
  const base: SkillEstimate =
    existing ??
    stamp<SkillEstimate>(db.userId, "est", {
      subskill: evidence.subskill,
      faculty: evidence.faculty,
      value: 0.5,
      evidenceCount: 0,
      evidenceMass: 0,
      estimateConfidence: 0,
      trend: "flat",
      level: "untested",
      history: [],
    });
  const next = applyEvidence(base, evidence.score, evidence.weight);
  const history = [...base.history, { at: evidence.createdAt, value: next.value }].slice(-HISTORY_LIMIT);
  const conf = estimateConfidence(next.evidenceMass, next.evidenceCount);
  const updated: SkillEstimate = {
    ...base,
    ...next,
    estimateConfidence: conf,
    trend: trendFor(history),
    level: levelFor(next.value, next.evidenceCount, conf),
    lastEvidenceAt: evidence.createdAt,
    history,
  };
  await store.put(updated);
  return updated;
}

/** Rebuild every estimate from raw evidence (used after imports or demo seeding). */
export async function rebuildEstimates(db: StudyDatabase): Promise<void> {
  const all = await db.store("skill_evidence").list({ orderBy: "createdAt" });
  await db.store("skill_estimates").clear();
  const map = new Map<string, SkillEstimate>();
  for (const ev of all) {
    const base =
      map.get(ev.subskill) ??
      stamp<SkillEstimate>(db.userId, "est", {
        subskill: ev.subskill,
        faculty: ev.faculty,
        value: 0.5,
        evidenceCount: 0,
        evidenceMass: 0,
        estimateConfidence: 0,
        trend: "flat",
        level: "untested",
        history: [],
      });
    const next = applyEvidence(base, ev.score, ev.weight);
    const history = [...base.history, { at: ev.createdAt, value: next.value }].slice(-HISTORY_LIMIT);
    const conf = estimateConfidence(next.evidenceMass, next.evidenceCount);
    map.set(ev.subskill, {
      ...base,
      ...next,
      estimateConfidence: conf,
      trend: trendFor(history),
      level: levelFor(next.value, next.evidenceCount, conf),
      lastEvidenceAt: ev.createdAt,
      history,
    });
  }
  await db.store("skill_estimates").putMany([...map.values()]);
}

export interface ErrorInput {
  type: ErrorType;
  subskill?: SubskillId;
  faculty?: import("@/lib/domain/faculties").FacultyId;
  source: { kind: EvidenceSourceKind; refId: string; label?: string };
  detail: string;
  sessionId?: string;
  at?: string;
}

export async function recordError(db: StudyDatabase, input: ErrorInput): Promise<ErrorEvent> {
  const faculty = input.faculty ?? (input.subskill ? facultyOf(input.subskill) : "inference");
  const ev = stamp<ErrorEvent>(db.userId, "err", {
    type: input.type,
    faculty,
    subskill: input.subskill,
    source: input.source,
    detail: input.detail,
    sessionId: input.sessionId,
  });
  if (input.at) {
    ev.createdAt = input.at;
    ev.updatedAt = input.at;
  }
  await db.store("error_events").put(ev);
  return ev;
}

export interface ConfidenceInput {
  confidence: number; // 0..1
  correct: boolean;
  domain: import("@/lib/domain/faculties").FacultyId;
  source: { kind: EvidenceSourceKind; refId: string; label?: string };
  latencyMs?: number;
  sessionId?: string;
  at?: string;
  /** Also fold into the calibration faculty estimate (default true) */
  asEvidence?: boolean;
  difficulty?: Difficulty;
}

/** Record a confidence judgement; feeds calibration charts and the calibration faculty. */
export async function recordConfidence(db: StudyDatabase, input: ConfidenceInput): Promise<ConfidenceEntry> {
  const entry = stamp<ConfidenceEntry>(db.userId, "conf", {
    confidence: clamp01(input.confidence),
    correct: input.correct,
    domain: input.domain,
    source: input.source,
    latencyMs: input.latencyMs,
    sessionId: input.sessionId,
  });
  if (input.at) {
    entry.createdAt = input.at;
    entry.updatedAt = input.at;
  }
  await db.store("confidence_entries").put(entry);
  if (input.asEvidence !== false) {
    await recordEvidence(db, {
      subskill: "calibration.confidence",
      score: calibrationScore(entry.confidence, entry.correct),
      difficulty: input.difficulty ?? 3,
      format: "numeric",
      source: input.source,
      confidence: entry.confidence,
      correct: entry.correct,
      sessionId: input.sessionId,
      at: input.at,
    });
    // Over/under-confidence error events for pattern detection
    if (entry.confidence >= 0.8 && !entry.correct) {
      await recordError(db, { type: "OVERCONFIDENCE", faculty: input.domain, source: input.source, detail: `Stated ${Math.round(entry.confidence * 100)}% and was wrong.`, sessionId: input.sessionId, at: input.at });
    } else if (entry.confidence <= 0.55 && entry.correct) {
      await recordError(db, { type: "UNDERCONFIDENCE", faculty: input.domain, source: input.source, detail: `Stated ${Math.round(entry.confidence * 100)}% and was right.`, sessionId: input.sessionId, at: input.at });
    }
  }
  return entry;
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}
