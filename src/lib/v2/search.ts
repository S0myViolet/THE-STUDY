import type { StudyDatabase } from "@/lib/persistence/store";
import { ROOMS, SECTIONS } from "@/lib/nav";
import * as C2 from "@/content/v2";
import { search, staticIndex as staticIndexV1, userIndex as userIndexV1, type SearchHit } from "@/lib/search";

export { search };
export type { SearchHit };

/**
 * The V2 palette index.
 *
 * Static: commands, sections, rooms, the curriculum (concepts, courses, lessons, paths),
 * source seeds, project templates, exam blueprints, memory techniques, knowledge seeds,
 * writing and speaking prompts, and the whole V1 archive (labelled, under /v1).
 * User: projects, library sources, writing entries, recent error records, exam attempts,
 * forecasts, decisions, knowledge nodes, Curator conversations, and V1 user entries.
 */

export const COMMANDS_V2: SearchHit[] = [
  { id: "cmd2-today", kind: "command", title: "Continue today's work", href: "/today", keywords: "plan agenda continue resume" },
  { id: "cmd2-review-due", kind: "command", title: "Review due concepts", href: "/memory/review", keywords: "retrieval recall memory due spaced" },
  { id: "cmd2-train", kind: "command", title: "Start practice", href: "/train", keywords: "practice problems deliberate train" },
  { id: "cmd2-book", kind: "command", title: "Open current book", href: "/library?open=current", keywords: "reading library source continue" },
  { id: "cmd2-exam", kind: "command", title: "Begin exam", href: "/prove/exams", keywords: "prove test weekly monthly quarterly" },
  { id: "cmd2-curator", kind: "command", title: "Ask Curator", href: "/curator", keywords: "tutor ask question think first" },
  { id: "cmd2-knowledge", kind: "command", title: "Search Knowledge", href: "/knowledge", keywords: "graph nodes people places events" },
  { id: "cmd2-build", kind: "command", title: "Create Investigation", href: "/build/new", keywords: "project build studio question" },
  { id: "cmd2-write", kind: "command", title: "Write", href: "/writing/new", keywords: "essay explain argue draft" },
  { id: "cmd2-forecast", kind: "command", title: "Make prediction", href: "/forecasts/new", keywords: "forecast predict probability" },
  { id: "cmd-theme", kind: "command", title: "Toggle appearance", href: "#toggle-theme", keywords: "dark light mode theme" },
];

const domainTitle = new Map<string, string>(C2.CURRICULUM_SKELETON.map((d) => [d.id, d.title]));

interface SkeletonPlace {
  domainId: string;
  domainTitle: string;
  courseId: string;
  courseTitle: string;
  moduleTitle: string;
  title: string;
}

/** Every skeleton concept with where it sits, so concepts are searchable before their content is authored. */
function skeletonPlaces(): Map<string, SkeletonPlace> {
  const out = new Map<string, SkeletonPlace>();
  for (const d of C2.CURRICULUM_SKELETON) {
    for (const c of d.courses) {
      for (const m of c.modules) {
        for (const k of m.concepts) {
          out.set(k.id, { domainId: d.id, domainTitle: d.title, courseId: c.id, courseTitle: c.title, moduleTitle: m.title, title: k.title });
        }
      }
    }
  }
  return out;
}

let staticCache: SearchHit[] | null = null;

export function staticIndexV2(): SearchHit[] {
  if (staticCache) return staticCache;
  const sections: SearchHit[] = SECTIONS.map((s) => ({ id: "sec-" + s.id, kind: "section", title: s.label, subtitle: s.description, href: s.href }));
  const rooms: SearchHit[] = ROOMS.map((r) => ({ id: "room2-" + r.id, kind: "room", title: r.label, subtitle: r.description, href: r.href }));

  const places = skeletonPlaces();
  const authored = new Map(C2.CURRICULUM.concepts.map((c) => [c.id, c]));
  const concepts: SearchHit[] = [];
  for (const [id, p] of places) {
    const c = authored.get(id);
    concepts.push({
      id: "concept-" + id,
      kind: "concept",
      title: c?.title ?? p.title,
      subtitle: `${p.domainTitle} · ${p.moduleTitle}`,
      href: `/learn/concept/${id}`,
      keywords: [p.courseTitle, c?.summary ?? "", ...(c?.tags ?? [])].join(" "),
    });
  }
  for (const c of C2.CURRICULUM.concepts) {
    if (places.has(c.id)) continue;
    concepts.push({ id: "concept-" + c.id, kind: "concept", title: c.title, subtitle: `${domainTitle.get(c.domainId) ?? c.domainId}`, href: `/learn/concept/${c.id}`, keywords: [c.summary, ...(c.tags ?? [])].join(" ") });
  }

  const courses: SearchHit[] = C2.CURRICULUM.courses.map((c) => ({ id: "course-" + c.id, kind: "course", title: c.title, subtitle: `${domainTitle.get(c.domainId) ?? c.domainId} · ${c.level}`, href: `/learn/course/${c.id}`, keywords: c.summary }));
  const lessons: SearchHit[] = C2.CURRICULUM.lessons.map((l) => ({ id: "lesson-" + l.id, kind: "lesson", title: l.title, subtitle: l.promise, href: `/learn/lesson/${l.id}`, keywords: l.conceptIds.join(" ") }));
  const paths: SearchHit[] = C2.KNOWLEDGE_PATHS.map((p) => ({ id: "path-" + p.id, kind: "path", title: p.title, subtitle: p.question, href: `/learn/paths/${p.id}`, keywords: [p.summary, ...p.domains].join(" ") }));
  const sources: SearchHit[] = C2.SOURCE_SEEDS.map((s) => ({ id: "seed-" + s.id, kind: "source", title: s.title, subtitle: `${s.author}${s.year ? ` · ${s.year}` : ""}`, href: `/library/new?seed=${s.id}`, keywords: [s.type, s.summary, ...s.concepts].join(" ") }));
  const templates: SearchHit[] = C2.PROJECT_TEMPLATES.map((t) => ({ id: "pt-" + t.id, kind: "project", title: t.title, subtitle: t.question, href: `/build/new?template=${t.id}`, keywords: [t.kind, ...t.requiredConcepts].join(" ") }));
  const exams: SearchHit[] = C2.EXAM_BLUEPRINTS.map((b) => ({ id: "bp-" + b.id, kind: "exam", title: b.title, subtitle: `${b.kind} · ${b.minutes} minutes`, href: `/prove/exams?blueprint=${b.id}`, keywords: b.summary }));
  const techniques: SearchHit[] = C2.MEMORY_TECHNIQUES.map((t) => ({ id: "mt-" + t.id, kind: "technique", title: t.title, subtitle: t.strategy, href: `/memory/techniques/${t.id}`, keywords: t.summary }));
  const nodes: SearchHit[] = C2.KNOWLEDGE_NODE_SEEDS.filter((n) => n.kind !== "concept").map((n) => ({ id: "node-" + n.id, kind: "node", title: n.title, subtitle: `${n.kind}${n.domainId ? ` · ${domainTitle.get(n.domainId) ?? n.domainId}` : ""}`, href: `/knowledge/${n.id}`, keywords: [n.summary, ...(n.tags ?? [])].join(" ") }));
  const writing: SearchHit[] = C2.WRITING_PROMPTS.map((w) => ({ id: "wp-" + w.id, kind: "writing", title: w.title, subtitle: `Level ${w.level}`, href: `/writing/new?prompt=${w.id}`, keywords: w.prompt }));
  const speaking: SearchHit[] = C2.SPEAKING_PROMPTS.map((s) => ({ id: "sp-" + s.id, kind: "speaking", title: s.title, subtitle: s.mode.replace(/_/g, " "), href: `/speaking/${s.id}`, keywords: s.prompt }));

  staticCache = [...COMMANDS_V2, ...sections, ...rooms, ...concepts, ...courses, ...lessons, ...paths, ...sources, ...templates, ...exams, ...techniques, ...nodes, ...writing, ...speaking, ...staticIndexV1()];
  return staticCache;
}

const ERROR_RECENT = 30;

export async function userIndexV2(db: StudyDatabase): Promise<SearchHit[]> {
  const [projects, sources, writing, errors, exams, forecasts, decisions, nodes, conversations, v1] = await Promise.all([
    db.store("projects").list(),
    db.store("library_sources").list(),
    db.store("writing_entries").list(),
    db.store("error_records").list({ orderBy: "createdAt", desc: true, limit: ERROR_RECENT }),
    db.store("exam_attempts").list({ orderBy: "createdAt", desc: true }),
    db.store("forecasts").list(),
    db.store("decision_entries").list(),
    db.store("knowledge_nodes").list(),
    db.store("tutor_conversations").list({ orderBy: "updatedAt", desc: true, limit: 50 }),
    userIndexV1(db),
  ]);
  return [
    ...projects.map<SearchHit>((p) => ({ id: "proj-" + p.id, kind: "project", title: p.title, subtitle: `${p.kind} · ${p.status}`, href: `/build/${p.id}`, keywords: p.question })),
    ...sources.map<SearchHit>((s) => ({ id: "src-" + s.id, kind: "source", title: s.title, subtitle: `${s.author ?? s.type} · ${s.status}`, href: `/library/${s.id}`, keywords: s.why })),
    ...writing.map<SearchHit>((w) => ({ id: "wr-" + w.id, kind: "writing", title: w.title, subtitle: `Level ${w.level} · ${w.status}`, href: `/writing/${w.id}`, keywords: w.prompt })),
    ...errors.map<SearchHit>((e) => ({
      id: "err-" + e.id,
      kind: "error",
      title: e.category.replace(/_/g, " ").toLowerCase(),
      subtitle: e.question.slice(0, 90),
      href: e.concepts[0] ? `/train/${e.skill}/practice?concept=${e.concepts[0]}&remediate=${encodeURIComponent(e.recurrenceKey)}` : "/review/errors",
      keywords: [e.skill, ...e.concepts].join(" "),
    })),
    ...exams.map<SearchHit>((x) => ({ id: "exam-" + x.id, kind: "exam", title: x.title, subtitle: `${x.kind} · ${x.status.replace("_", " ")} · ${x.startedAt.slice(0, 10)}`, href: `/prove/exam/${x.id}` })),
    ...forecasts.map<SearchHit>((f) => ({ id: "fc-" + f.id, kind: "forecast", title: f.question, subtitle: `${Math.round(f.probability * 100)}% · ${f.status}`, href: `/forecasts/${f.id}` })),
    ...decisions.map<SearchHit>((d) => ({ id: "dec-" + d.id, kind: "decision", title: d.title, subtitle: d.status === "open" ? "Open decision" : "Reviewed", href: `/decisions/${d.id}` })),
    ...nodes.map<SearchHit>((n) => ({ id: "kn-" + n.id, kind: "node", title: n.title, subtitle: n.kind, href: `/knowledge/${n.key}`, keywords: n.summary })),
    ...conversations.map<SearchHit>((c) => ({ id: "conv-" + c.id, kind: "conversation", title: c.title, subtitle: c.mode, href: `/curator/${c.id}` })),
    ...v1,
  ];
}
