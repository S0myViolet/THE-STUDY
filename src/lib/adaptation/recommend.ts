import type { StudyDatabase } from "@/lib/persistence/store";
import { FACULTIES, FACULTY_META, type FacultyId, subskillLabel } from "@/lib/domain/faculties";
import { aggregateFaculty } from "@/lib/scoring/estimates";
import { ROOMS } from "@/lib/nav";

export interface Recommendation {
  title: string;
  why: string;
  href: string;
  faculty?: FacultyId;
}

const ROOM_FOR: Partial<Record<FacultyId, string>> = {
  observation: "/observation",
  inference: "/inference",
  memory: "/memory",
  strategy: "/strategy",
  social: "/salon",
  knowledge: "/archive",
  rhetoric: "/rhetoric",
  quantitative: "/inference/base_rate",
  calibration: "/inference/how_sure",
  composure: "/observation/glance?pressure=1",
  synthesis: "/archive/graph",
  curiosity: "/cabinet",
};

/** Deterministic "what should I work on" from actual performance. */
export async function recommendNext(db: StudyDatabase): Promise<Recommendation> {
  const [estimates, threads, due] = await Promise.all([db.store("skill_estimates").list(), db.store("red_threads").list(), db.store("memory_items").list()]);
  const dueNow = due.filter((m) => !m.suspended && new Date(m.due).getTime() <= Date.now()).length;
  const active = threads.filter((t) => t.status === "emerging" || t.status === "established");
  if (active.length) {
    const t = active.sort((a, b) => b.strength - a.strength)[0];
    const { PATTERNS } = await import("./red-thread");
    const def = PATTERNS.find((p) => p.key === t.patternKey);
    return { title: t.title, why: `${t.description} ${t.nextTest}`, href: def?.testHref ?? "/red-thread" };
  }
  if (dueNow >= 8) return { title: `${dueNow} memory items are due`, why: "Retention decays fastest right after learning. Ten minutes now protects weeks of work.", href: "/memory/review", faculty: "memory" };
  const byFaculty = FACULTIES.map((f) => ({ f, agg: aggregateFaculty(estimates.filter((e) => e.faculty === f)) }));
  const tested = byFaculty.filter((x) => x.agg.evidenceCount >= 3).sort((a, b) => a.agg.value - b.agg.value);
  const untested = byFaculty.filter((x) => x.agg.evidenceCount < 3);
  if (tested.length) {
    const weakest = tested[0];
    const strongest = tested[tested.length - 1];
    const sub = estimates.filter((e) => e.faculty === weakest.f && e.evidenceCount >= 2).sort((a, b) => a.value - b.value)[0];
    const why = strongest.f !== weakest.f ? `${FACULTY_META[strongest.f].label} isn't your bottleneck right now. ${FACULTY_META[weakest.f].label} is where the evidence is weakest${sub ? `, specifically ${subskillLabel(sub.subskill).toLowerCase()}` : ""}.` : `${FACULTY_META[weakest.f].label} has the thinnest evidence.`;
    return { title: `Spend today in ${ROOMS.find((r) => r.href === ROOM_FOR[weakest.f])?.label ?? FACULTY_META[weakest.f].label}`, why, href: ROOM_FOR[weakest.f] ?? "/desk", faculty: weakest.f };
  }
  if (untested.length) {
    const f = untested[0].f;
    return { title: `Test ${FACULTY_META[f].label.toLowerCase()}`, why: "The Study has almost no evidence here yet. Estimates start honest by starting empty.", href: ROOM_FOR[f] ?? "/desk", faculty: f };
  }
  return { title: "Begin with a case", why: "Cases exercise several faculties at once and give the Study its first evidence.", href: "/casebook" };
}
