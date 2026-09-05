import type { StudyDatabase } from "@/lib/persistence/store";
import { stamp } from "@/lib/persistence/store";
import type { DailySession, Preferences, SessionItem, SessionLength, SessionModuleKind, UserProfile } from "@/lib/domain/types";
import { FACULTIES, type FacultyId, type SubskillId, facultyOf } from "@/lib/domain/faculties";
import { aggregateFaculty } from "@/lib/scoring/estimates";
import { dueMemoryItems } from "@/lib/services/memory";
import { todayKey, seedFromString } from "@/lib/util/format";
import { createRng } from "@/lib/scene/rng";
import * as C from "@/content";

/**
 * The daily session engine. Composes an intellectual sequence rather than a workout list.
 * Weighting guidance (not rigid): 30% targeted development, 20% retention, 20% interests,
 * 15% transfer, 10% strength, 5% serendipity.
 */

export const LENGTH_MINUTES: Record<SessionLength, number> = { quick: 20, standard: 45, deep: 90, immersion: 130, variable: 45 };

interface Signals {
  weakest: { subskill: SubskillId; faculty: FacultyId; value: number }[];
  strongest: FacultyId | null;
  untested: FacultyId[];
  dueCount: number;
  threads: { patternKey: string; targetSubskill?: SubskillId; testHref: string; title: string }[];
  interests: string[];
  recentRefs: Set<string>;
  completedCases: Set<string>;
  activeCase?: string;
  readEntries: Set<string>;
  seenCuriosities: Set<string>;
}

async function gatherSignals(db: StudyDatabase, profile: UserProfile): Promise<Signals> {
  const [estimates, threads, sessions, attempts, progress, curios] = await Promise.all([
    db.store("skill_estimates").list(),
    db.store("red_threads").list({ filter: (t) => t.status === "emerging" || t.status === "established" || t.status === "improving" }),
    db.store("daily_sessions").list({ orderBy: "createdAt", desc: true, limit: 4 }),
    db.store("case_attempts").list(),
    db.store("archive_progress").list(),
    db.store("curiosity_views").list(),
  ]);
  const tested = estimates.filter((e) => e.evidenceCount >= 2).sort((a, b) => a.value - b.value);
  const weakest = tested.slice(0, 6).map((e) => ({ subskill: e.subskill, faculty: e.faculty, value: e.value }));
  const byFaculty = FACULTIES.map((f) => ({ f, agg: aggregateFaculty(estimates.filter((e) => e.faculty === f)) }));
  const strongest = byFaculty.filter((x) => x.agg.evidenceCount >= 5).sort((a, b) => b.agg.value - a.agg.value)[0]?.f ?? null;
  const untested = byFaculty.filter((x) => x.agg.evidenceCount < 3).map((x) => x.f);
  const { PATTERNS } = await import("./red-thread");
  const due = await dueMemoryItems(db);
  return {
    weakest,
    strongest,
    untested,
    dueCount: due.length,
    threads: threads.map((t) => ({ patternKey: t.patternKey, targetSubskill: t.targetSubskill, testHref: PATTERNS.find((p) => p.key === t.patternKey)?.testHref ?? "/inference", title: t.title })),
    interests: profile.interests,
    recentRefs: new Set(sessions.flatMap((s) => s.items.map((i) => i.refId ?? "")).filter(Boolean)),
    completedCases: new Set(attempts.filter((a) => a.status === "completed").map((a) => a.caseId)),
    activeCase: attempts.find((a) => a.status === "active")?.caseId,
    readEntries: new Set(progress.filter((p) => p.status !== "unread").map((p) => p.entryId)),
    seenCuriosities: new Set(curios.map((c) => c.curiosityId)),
  };
}

const DIFFICULTY_FOR = (value: number): number => (value < 0.45 ? 2 : value < 0.6 ? 3 : value < 0.72 ? 4 : value < 0.82 ? 5 : 6);

/** Choose today's case deterministically for the date, preferring weak faculties and unseen cases. */
export function pickCase(signals: Pick<Signals, "weakest" | "completedCases" | "activeCase" | "interests">, dateKey: string, level = 0.55) {
  if (signals.activeCase) {
    const active = C.CASES.find((c) => c.id === signals.activeCase);
    if (active) return active;
    // An active attempt on a case outside the seeded list (the entrance case) does not block today's file.
  }
  const unseen = C.CASES.filter((c) => !signals.completedCases.has(c.id));
  const pool = unseen.length ? unseen : C.CASES;
  if (!pool.length) return null;
  const target = DIFFICULTY_FOR(level);
  const weakFaculties = new Set(signals.weakest.map((w) => w.faculty));
  const scored = pool.map((c) => {
    let s = 0;
    s += c.faculties.filter((f) => weakFaculties.has(f)).length * 2;
    s -= Math.abs(c.difficulty - target);
    if (c.tags?.some((t) => signals.interests.includes(t))) s += 1;
    return { c, s };
  });
  scored.sort((a, b) => b.s - a.s);
  const top = scored.slice(0, 3);
  const rng = createRng(seedFromString(dateKey + ":case"));
  return top[rng.int(0, top.length - 1)].c;
}

function href(kind: SessionModuleKind, refId?: string, mode?: string): string {
  switch (kind) {
    case "glance":
      return `/observation/glance${refId ? `?exercise=${refId}` : ""}`;
    case "case":
      return `/casebook/${refId}`;
    case "archive":
      return `/archive/${refId}`;
    case "recall":
      return "/memory/review";
    case "salon":
      return `/salon/${refId}`;
    case "strategy":
      return `/strategy/${refId}`;
    case "rhetoric":
      return `/rhetoric/${refId}`;
    case "inference":
      return `/inference/${mode}${refId ? `/${refId}` : ""}`;
    case "question":
      return `/inference/${mode}${refId ? `/${refId}` : ""}`;
    case "cabinet":
      return `/cabinet/${refId}`;
    case "fieldwork":
      return "/fieldwork";
    case "forecast":
      return "/forecasts?new=1";
    case "arrival":
      return "/desk?arrival=1";
    case "after_action":
      return "/desk?debrief=1";
  }
}

export interface PlanInput {
  length: SessionLength;
  dateKey?: string;
}

export async function planSession(db: StudyDatabase, profile: UserProfile, prefs: Preferences, input: PlanInput): Promise<DailySession> {
  const dateKey = input.dateKey ?? todayKey();
  const rng = createRng(seedFromString(dateKey + ":session:" + input.length));
  const signals = await gatherSignals(db, profile);
  const budget = LENGTH_MINUTES[input.length];
  const items: SessionItem[] = [];
  let used = 0;
  const add = (item: Omit<SessionItem, "id" | "status">) => {
    if (used + item.minutes > budget + 5) return false;
    items.push({ id: `si_${items.length}_${item.kind}`, status: "pending", ...item });
    used += item.minutes;
    return true;
  };
  const pickUnseen = <T extends { id: string }>(xs: T[], seen: Set<string>) => {
    const fresh = xs.filter((x) => !seen.has(x.id) && !signals.recentRefs.has(x.id));
    const pool = fresh.length ? fresh : xs;
    return pool.length ? rng.pick(pool) : null;
  };

  // 1. Arrival
  add({ kind: "arrival", title: "Arrival", minutes: 1, reason: "ritual", reasonText: "Sixty seconds of attention before the work.", href: href("arrival") });

  // 2. The Glance — always; difficulty from observation estimate
  const obsWeak = signals.weakest.find((w) => w.faculty === "observation");
  const glance = pickUnseen(C.GLANCE_EXERCISES, new Set());
  if (glance) add({ kind: "glance", title: `The Glance · ${glance.title}`, minutes: 4, reason: obsWeak ? "foundation" : "ritual", reasonText: obsWeak ? `Observation is where evidence is thinnest right now (${obsWeak.subskill.split(".")[1]}).` : "Look before you think.", href: href("glance", glance.id), refId: glance.id });

  // 3. The Question — one reasoning problem, targeted at a thread or weak subskill
  const thread = signals.threads.length ? rng.pick(signals.threads) : null;
  const weakInf = signals.weakest.find((w) => w.faculty === "inference" || w.faculty === "quantitative" || w.faculty === "calibration");
  const modeFor = (s?: SubskillId): { mode: string; pool: { id: string; title: string }[] } => {
    switch (s) {
      case "inference.alternatives":
        return { mode: "three_stories", pool: C.THREE_STORIES };
      case "inference.base_rates":
        return { mode: "base_rate", pool: C.BASE_RATE };
      case "inference.causal":
        return { mode: "missing_variable", pool: C.MISSING_VARIABLE };
      case "inference.information_value":
      case "social.question_quality":
        return { mode: "information_value", pool: C.INFORMATION_VALUE };
      case "inference.disconfirmation":
        return { mode: "counterfactual", pool: C.COUNTERFACTUAL };
      case "calibration.confidence":
        return { mode: "how_sure", pool: C.HOW_SURE };
      case "inference.evidence_weighting":
        return { mode: "best_explanation", pool: C.BEST_EXPLANATION };
      default: {
        const options = [
          { mode: "how_sure", pool: C.HOW_SURE },
          { mode: "causal", pool: C.CAUSAL },
          { mode: "base_rate", pool: C.BASE_RATE },
          { mode: "anomaly", pool: C.ANOMALY },
        ].filter((o) => o.pool.length);
        return options.length ? rng.pick(options) : { mode: "how_sure", pool: [] };
      }
    }
  };
  const q = modeFor(thread?.targetSubskill ?? weakInf?.subskill);
  const qItem = pickUnseen(q.pool, new Set());
  if (qItem) add({ kind: "question", title: `The Question · ${qItem.title}`, minutes: 5, reason: thread ? "thread" : weakInf ? "foundation" : "ritual", reasonText: thread ? `Tests the thread "${thread.title}".` : weakInf ? `Targets ${weakInf.subskill.replace(".", " · ")}.` : "One deceptively difficult problem.", href: href("question", qItem.id, q.mode), refId: qItem.id });

  // 4. The Case — standard and up
  if (input.length !== "quick") {
    const kase = pickCase(signals, dateKey, signals.weakest[0]?.value ?? 0.55);
    if (kase) add({ kind: "case", title: `Case ${kase.number} · ${kase.title}`, minutes: Math.min(kase.estimatedMinutes, budget > 60 ? 35 : 22), reason: signals.activeCase ? "current" : "foundation", reasonText: signals.activeCase ? "You left this case open." : `Combines ${kase.faculties.slice(0, 3).join(", ")}.`, href: href("case", kase.id), refId: kase.id });
  }

  // 5. Archive — an entry in an interest domain, unread
  const interestDomains = signals.interests.filter((i) => ["history", "economics", "psychology", "art", "science", "technology", "business", "literature", "philosophy", "music", "food"].includes(i));
  const archivePool = C.ARCHIVE_ENTRIES.filter((e) => e.kind !== "path" && (!interestDomains.length || interestDomains.includes(e.domain)));
  const entry = pickUnseen(archivePool.length ? archivePool : C.ARCHIVE_ENTRIES.filter((e) => e.kind !== "path"), signals.readEntries);
  if (entry) add({ kind: "archive", title: `The Archive · ${entry.title}`, minutes: Math.max(4, entry.readingMinutes), reason: "current", reasonText: interestDomains.includes(entry.domain) ? `In ${entry.domain}, one of your interests.` : "Breadth, deliberately.", href: href("archive", entry.id), refId: entry.id });

  // 6. Recall — when anything is due
  if (signals.dueCount > 0) add({ kind: "recall", title: `Recall · ${signals.dueCount} due`, minutes: Math.min(10, 2 + Math.ceil(signals.dueCount / 3)), reason: "due", reasonText: `${signals.dueCount} items are at risk of fading.`, href: href("recall") });

  // 7. Salon — standard and up
  if (input.length !== "quick") {
    const salon = pickUnseen(C.SALON_SCENARIOS, new Set());
    if (salon) add({ kind: "salon", title: `The Salon · ${salon.title}`, minutes: Math.min(salon.estimatedMinutes, 12), reason: signals.threads.some((t) => t.patternKey === "LEADING_TOO_EARLY" || t.patternKey === "WEAK_QUESTIONS") ? "thread" : "foundation", reasonText: "Let the other person reveal information.", href: href("salon", salon.id), refId: salon.id });
  }

  // 8. Deep and up: Strategy, Inference, Rhetoric, Cabinet
  if (input.length === "deep" || input.length === "immersion") {
    const strat = pickUnseen(C.STRATEGY_SCENARIOS, new Set());
    if (strat) add({ kind: "strategy", title: `Strategy Table · ${strat.title}`, minutes: Math.min(strat.estimatedMinutes, 15), reason: signals.strongest === "strategy" ? "strength" : "foundation", reasonText: signals.strongest === "strategy" ? "A hard use of a strong faculty." : "Think further ahead than the first move.", href: href("strategy", strat.id), refId: strat.id });
    const rh = pickUnseen(C.RHETORIC_PROMPTS, new Set());
    if (rh) add({ kind: "rhetoric", title: `Rhetoric · ${rh.title}`, minutes: 6, reason: "foundation", reasonText: "Say exactly what you mean.", href: href("rhetoric", rh.id), refId: rh.id });
    const ladder = pickUnseen(C.LADDER, new Set());
    if (ladder) add({ kind: "inference", title: `Inference Ladder · ${ladder.title}`, minutes: 8, reason: "transfer", reasonText: "Observed, inferred, because, alternatives, confidence.", href: href("inference", ladder.id, "ladder"), refId: ladder.id });
  }

  // 9. Serendipity — a curiosity, always if there's room
  const cur = pickUnseen(C.CURIOSITIES, signals.seenCuriosities);
  if (cur && used + 3 <= budget + 5) add({ kind: "cabinet", title: `The Cabinet · ${cur.title}`, minutes: 3, reason: "serendipity", reasonText: "Something you did not ask for.", href: href("cabinet", cur.id), refId: cur.id });

  // 10. Immersion: fieldwork assignment and a forecast
  if (input.length === "immersion") {
    if (prefs.fieldworkEnabled) add({ kind: "fieldwork", title: "Fieldwork", minutes: 5, reason: "transfer", reasonText: "Take it outside.", href: href("fieldwork") });
    add({ kind: "forecast", title: "A forecast", minutes: 4, reason: "foundation", reasonText: "Calibration needs predictions that meet reality.", href: href("forecast") });
  }

  // 11. After Action
  items.push({ id: `si_${items.length}_after_action`, status: "pending", kind: "after_action", title: "After Action", minutes: 3, reason: "ritual", reasonText: "What you saw, what you missed, one thing to change.", href: href("after_action") });

  const session = stamp<DailySession>(db.userId, "ses", { date: dateKey, length: input.length, items, status: "planned", currentIndex: 0 });
  await db.store("daily_sessions").put(session);
  return session;
}

export async function todaysSession(db: StudyDatabase, dateKey = todayKey()): Promise<DailySession | undefined> {
  const list = await db.store("daily_sessions").list({ where: { date: dateKey } as Partial<DailySession>, orderBy: "createdAt", desc: true, limit: 1 });
  return list[0];
}

export async function startSession(db: StudyDatabase, session: DailySession): Promise<DailySession> {
  const next: DailySession = { ...session, status: "active", startedAt: session.startedAt ?? new Date().toISOString() };
  await db.store("daily_sessions").put(next);
  return next;
}

export async function completeSessionItem(db: StudyDatabase, sessionId: string, itemId: string, status: "done" | "skipped" = "done"): Promise<DailySession | undefined> {
  const s = await db.store("daily_sessions").get(sessionId);
  if (!s) return undefined;
  const items = s.items.map((i) => (i.id === itemId ? { ...i, status, completedAt: new Date().toISOString() } : i));
  const nextIndex = items.findIndex((i) => i.status === "pending");
  const allDone = nextIndex === -1;
  const next: DailySession = { ...s, items, currentIndex: allDone ? items.length : nextIndex, status: allDone ? "completed" : "active", completedAt: allDone ? new Date().toISOString() : undefined };
  await db.store("daily_sessions").put(next);
  return next;
}

export function currentItem(s: DailySession): SessionItem | undefined {
  return s.items.find((i) => i.status === "pending" || i.status === "active");
}

/** Append `session`/`item` params so a room can report completion. */
export function sessionHref(item: SessionItem, sessionId: string): string {
  const sep = item.href.includes("?") ? "&" : "?";
  return `${item.href}${sep}session=${sessionId}&item=${item.id}`;
}

export function facultyForModule(kind: SessionModuleKind): FacultyId | null {
  switch (kind) {
    case "glance":
      return "observation";
    case "question":
    case "inference":
      return "inference";
    case "salon":
      return "social";
    case "strategy":
      return "strategy";
    case "recall":
      return "memory";
    case "archive":
    case "cabinet":
      return "knowledge";
    case "rhetoric":
      return "rhetoric";
    default:
      return null;
  }
}

export { facultyOf };

/** Today's file: the one case waiting on the desk. */
export async function todaysCase(db: StudyDatabase, profile: UserProfile, dateKey = todayKey()) {
  const [estimates, attempts] = await Promise.all([db.store("skill_estimates").list(), db.store("case_attempts").list()]);
  const tested = estimates.filter((e) => e.evidenceCount >= 2).sort((a, b) => a.value - b.value);
  const weakest = tested.slice(0, 6).map((e) => ({ subskill: e.subskill, faculty: e.faculty, value: e.value }));
  const level = tested.length ? tested.reduce((s, e) => s + e.value, 0) / tested.length : 0.55;
  return pickCase(
    {
      weakest,
      completedCases: new Set(attempts.filter((a) => a.status === "completed").map((a) => a.caseId)),
      activeCase: attempts.find((a) => a.status === "active")?.caseId,
      interests: profile.interests,
    },
    dateKey,
    level,
  );
}
