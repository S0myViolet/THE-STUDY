import type { StudyDatabase } from "@/lib/persistence/store";
import type { CuratorMode, Preferences, RedThreadStatus } from "@/lib/domain/types";
import { FACULTIES, FACULTY_META, type FacultyId, type Level, subskillLabel } from "@/lib/domain/faculties";
import { aggregateFaculty } from "@/lib/scoring/estimates";
import { isDue } from "@/lib/scoring/spaced";
import { archiveEntry } from "@/content/archive";

/**
 * Compact, structured context the Curator reasons over.
 * Built from real data only; nothing here is invented.
 */
export interface CuratorContext {
  faculties: { id: FacultyId; label: string; level: Level; trend: "up" | "down" | "flat"; n: number }[];
  weakest: { subskill: string; label: string; faculty: FacultyId; level: Level; value: number; n: number }[];
  threads: { title: string; status: RedThreadStatus; nextTest: string }[];
  dueMemory: number;
  memoryTotal: number;
  afterActions: { title: string; oneThing: string; at: string }[];
  openForecasts: number;
  investigation?: string;
  recentArchive: string[];
  preferences: { depth: Preferences["curatorDepth"]; style: Preferences["challengeStyle"]; thinkFirst: boolean; sessionLength: Preferences["sessionLength"]; preferredFaculties: FacultyId[] };
}

export async function buildCuratorContext(db: StudyDatabase, prefs: Preferences): Promise<CuratorContext> {
  const [estimates, threads, memory, afterActions, forecasts, investigations, progress] = await Promise.all([
    db.store("skill_estimates").list(),
    db.store("red_threads").list(),
    db.store("memory_items").list(),
    db.store("after_actions").list({ orderBy: "createdAt", desc: true, limit: 3 }),
    db.store("forecasts").count({ status: "open" }),
    db.store("investigations").list({ where: { status: "open" }, orderBy: "updatedAt", desc: true, limit: 1 }),
    db.store("archive_progress").list({ orderBy: "updatedAt", desc: true, limit: 5 }),
  ]);

  const faculties = FACULTIES.map((f) => {
    const agg = aggregateFaculty(estimates.filter((e) => e.faculty === f));
    return { id: f, label: FACULTY_META[f].label, level: agg.level, trend: agg.trend, n: agg.evidenceCount };
  });

  const weakest = estimates
    .filter((e) => e.evidenceCount >= 2)
    .sort((a, b) => a.value - b.value)
    .slice(0, 5)
    .map((e) => ({ subskill: e.subskill, label: subskillLabel(e.subskill), faculty: e.faculty, level: e.level, value: Math.round(e.value * 100) / 100, n: e.evidenceCount }));

  const activeThreads = threads
    .filter((t) => t.status === "emerging" || t.status === "established" || t.status === "improving")
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 4)
    .map((t) => ({ title: t.title, status: t.status, nextTest: t.nextTest }));

  const now = new Date();
  const live = memory.filter((m) => !m.suspended);
  const dueMemory = live.filter((m) => isDue(m, now)).length;

  return {
    faculties,
    weakest,
    threads: activeThreads,
    dueMemory,
    memoryTotal: live.length,
    afterActions: afterActions.map((a) => ({ title: a.title, oneThing: a.oneThing, at: a.createdAt.slice(0, 10) })),
    openForecasts: forecasts,
    investigation: investigations[0]?.title,
    recentArchive: progress.map((p) => archiveEntry(p.entryId)?.title ?? p.entryId),
    preferences: { depth: prefs.curatorDepth, style: prefs.challengeStyle, thinkFirst: prefs.thinkFirst, sessionLength: prefs.sessionLength, preferredFaculties: prefs.preferredFaculties },
  };
}

const FACULTY_FOCUS: Partial<Record<CuratorMode, FacultyId[]>> = {
  observe: ["observation", "composure"],
  reason: ["inference", "quantitative", "calibration"],
  question: ["social", "inference"],
  teach: ["knowledge", "memory", "synthesis"],
  challenge: ["inference", "calibration", "rhetoric"],
  debate: ["rhetoric", "synthesis"],
  strategize: ["strategy", "calibration"],
  explore: ["curiosity", "knowledge", "synthesis"],
  remember: ["memory", "knowledge"],
};

/** Keep only the parts of the context a given mode needs; the model gets less noise, the prompt stays short. */
export function sliceContext(ctx: CuratorContext, mode: CuratorMode): Partial<CuratorContext> {
  const focus = FACULTY_FOCUS[mode];
  const faculties = focus ? ctx.faculties.filter((f) => focus.includes(f.id)) : ctx.faculties;
  const weakest = focus ? ctx.weakest.filter((w) => focus.includes(w.faculty)) : ctx.weakest;
  switch (mode) {
    case "review":
      return { faculties: ctx.faculties, weakest: ctx.weakest, threads: ctx.threads, afterActions: ctx.afterActions, dueMemory: ctx.dueMemory, openForecasts: ctx.openForecasts, preferences: ctx.preferences };
    case "remember":
      return { faculties, dueMemory: ctx.dueMemory, memoryTotal: ctx.memoryTotal, recentArchive: ctx.recentArchive, preferences: ctx.preferences };
    case "teach":
    case "explore":
      return { faculties, recentArchive: ctx.recentArchive, investigation: ctx.investigation, preferences: ctx.preferences };
    case "strategize":
      return { faculties, weakest, openForecasts: ctx.openForecasts, threads: ctx.threads.filter((t) => /strateg|second|incentive/i.test(t.title)), preferences: ctx.preferences };
    default:
      return { faculties, weakest, threads: ctx.threads, preferences: ctx.preferences };
  }
}
