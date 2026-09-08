import type { StudyDatabase } from "@/lib/persistence/store";
import { V1_ROOMS } from "@/lib/nav";
import * as C from "@/content";

/**
 * Search hits and the V1 archive index.
 *
 * The V2 palette composes `staticIndexV2` / `userIndexV2` from `src/lib/v2/search.ts`,
 * which include everything here. V1 entries keep working but point into the archive
 * (`/v1/…`) and are labelled "V1 · …" so they are never mistaken for the current Study.
 */

export type SearchKind =
  | "section"
  | "room"
  | "command"
  | "case"
  | "archive"
  | "curiosity"
  | "book"
  | "decision"
  | "forecast"
  | "thread"
  | "note"
  | "investigation"
  | "person"
  | "concept"
  | "course"
  | "lesson"
  | "path"
  | "source"
  | "project"
  | "exam"
  | "error"
  | "writing"
  | "speaking"
  | "technique"
  | "node"
  | "conversation";

export interface SearchHit {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle?: string;
  href: string;
  keywords?: string;
}

export const KIND_LABEL: Record<SearchKind, string> = {
  section: "Section",
  room: "Room",
  command: "Command",
  case: "Case",
  archive: "Archive",
  curiosity: "Cabinet",
  book: "Book",
  decision: "Decision",
  forecast: "Forecast",
  thread: "Red Thread",
  note: "Note",
  investigation: "Investigation",
  person: "Person",
  concept: "Concept",
  course: "Course",
  lesson: "Lesson",
  path: "Path",
  source: "Source",
  project: "Project",
  exam: "Exam",
  error: "Error",
  writing: "Writing",
  speaking: "Speaking",
  technique: "Technique",
  node: "Knowledge",
  conversation: "Curator",
};

export const V1_PREFIX = "V1 · ";

function v1(title: string): string {
  return title.startsWith(V1_PREFIX) ? title : V1_PREFIX + title;
}

/** V1 commands, archived: every href lives under /v1. */
export const COMMANDS: SearchHit[] = [
  { id: "cmd-case", kind: "command", title: v1("Begin today's case"), href: "/v1/desk?begin=case", keywords: "start case today v1 archive" },
  { id: "cmd-glance", kind: "command", title: v1("Give me a Glance"), href: "/v1/observation/glance", keywords: "observation quick look v1 archive" },
  { id: "cmd-palace", kind: "command", title: v1("Open Memory Palace"), href: "/v1/memory/palace", keywords: "loci v1 archive" },
  { id: "cmd-curator", kind: "command", title: v1("Ask the V1 Curator"), href: "/v1/curator", keywords: "mentor v1 archive" },
  { id: "cmd-strange", kind: "command", title: v1("Give me something strange"), href: "/v1/cabinet?random=1", keywords: "curiosity cabinet v1 archive" },
  { id: "cmd-observe", kind: "command", title: v1("Test my observation"), href: "/v1/observation", keywords: "notice v1 archive" },
  { id: "cmd-salon", kind: "command", title: v1("Start a Salon"), href: "/v1/salon", keywords: "conversation v1 archive" },
  { id: "cmd-reason", kind: "command", title: v1("Challenge my reasoning"), href: "/v1/inference", keywords: "inference v1 archive" },
  { id: "cmd-book", kind: "command", title: v1("Open the V1 bookshelf"), href: "/v1/archive/reading", keywords: "reading bookshelf v1 archive" },
  { id: "cmd-thread", kind: "command", title: v1("Show my recurring blind spots"), href: "/v1/red-thread", keywords: "patterns mistakes v1 archive" },
  { id: "cmd-session", kind: "command", title: v1("Start a V1 session"), href: "/v1/desk?session=1", keywords: "daily ritual v1 archive" },
];

function norm(s: string) {
  return s.toLowerCase();
}

export function isV1Hit(hit: SearchHit): boolean {
  return hit.href.startsWith("/v1/") || hit.href === "/v1";
}

function score(hit: SearchHit, q: string): number {
  const t = norm(hit.title.startsWith(V1_PREFIX) ? hit.title.slice(V1_PREFIX.length) : hit.title);
  const s = norm(hit.subtitle ?? "");
  const k = norm(hit.keywords ?? "");
  // Archive entries rank just below current entries on equal matches.
  const demote = isV1Hit(hit) ? 3 : 0;
  if (t.startsWith(q)) return 100 - demote;
  if (t.includes(q)) return 80 - demote;
  if (k.includes(q)) return 55 - demote;
  if (s.includes(q)) return 40 - demote;
  const toks = q.split(/\s+/).filter(Boolean);
  if (toks.length > 1 && toks.every((tk) => (t + " " + s + " " + k).includes(tk))) return 35 - demote;
  return 0;
}

/** The V1 archive: rooms, cases, archive entries, curiosities, investigation templates, people. */
export function staticIndex(): SearchHit[] {
  const rooms: SearchHit[] = V1_ROOMS.map((r) => ({ id: "room-" + r.id, kind: "room", title: v1(r.label), subtitle: r.description, href: r.href, keywords: "v1 archive" }));
  const cases: SearchHit[] = C.CASES.map((c) => ({ id: "case-" + c.id, kind: "case", title: v1(`Case ${c.number} · ${c.title}`), subtitle: c.setting, href: `/v1/casebook/${c.id}`, keywords: c.faculties.join(" ") }));
  const archive: SearchHit[] = C.ARCHIVE_ENTRIES.map((a) => ({ id: "arc-" + a.id, kind: "archive", title: v1(a.title), subtitle: a.subtitle ?? a.summary, href: `/v1/archive/${a.id}`, keywords: `${a.kind} ${a.domain} ${a.tags.join(" ")}` }));
  const curios: SearchHit[] = C.CURIOSITIES.map((c) => ({ id: "cur-" + c.id, kind: "curiosity", title: v1(c.title), subtitle: c.hook, href: `/v1/cabinet/${c.id}`, keywords: c.domain }));
  const inv: SearchHit[] = C.INVESTIGATION_TEMPLATES.map((t) => ({ id: "inv-" + t.id, kind: "investigation", title: v1(t.title), subtitle: t.question, href: `/v1/investigations?template=${t.id}` }));
  const people: SearchHit[] = C.PEOPLE.map((p) => ({ id: "ppl-" + p.id, kind: "person", title: v1(p.name), subtitle: `${p.profession} · ${p.origin}`, href: `/v1/memory/people`, keywords: p.interest }));
  return [...COMMANDS, ...rooms, ...cases, ...archive, ...curios, ...inv, ...people];
}

/** V1 user data that only lives in the archive: books, threads, archive notes, investigations. */
export async function userIndex(db: StudyDatabase): Promise<SearchHit[]> {
  const [books, threads, notes, investigations] = await Promise.all([
    db.store("reading_items").list(),
    db.store("red_threads").list(),
    db.store("archive_notes").list(),
    db.store("investigations").list(),
  ]);
  return [
    ...books.map<SearchHit>((b) => ({ id: "book-" + b.id, kind: "book", title: v1(b.title), subtitle: b.author ?? b.kind, href: `/v1/archive/reading/${b.id}` })),
    ...threads.map<SearchHit>((t) => ({ id: "rt-" + t.id, kind: "thread", title: v1(t.title), subtitle: t.status, href: `/v1/red-thread/${t.id}` })),
    ...notes.map<SearchHit>((n) => ({ id: "note-" + n.id, kind: "note", title: v1(n.text.slice(0, 80)), subtitle: "Archive note", href: `/v1/archive/${n.entryId}` })),
    ...investigations.map<SearchHit>((i) => ({ id: "inv-u-" + i.id, kind: "investigation", title: v1(i.title), subtitle: i.question, href: `/v1/investigations/${i.id}` })),
  ];
}

export function search(index: SearchHit[], query: string, limit = 12): SearchHit[] {
  const q = norm(query.trim());
  if (!q) return index.filter((h) => h.kind === "command").slice(0, 8);
  return index
    .map((h, i) => ({ h, s: score(h, q), i }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, limit)
    .map((x) => x.h);
}
