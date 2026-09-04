import type { StudyDatabase } from "@/lib/persistence/store";
import { ROOMS } from "@/lib/nav";
import * as C from "@/content";

export interface SearchHit {
  id: string;
  kind: "room" | "command" | "case" | "archive" | "curiosity" | "book" | "decision" | "forecast" | "thread" | "note" | "investigation" | "person";
  title: string;
  subtitle?: string;
  href: string;
  keywords?: string;
}

export const COMMANDS: SearchHit[] = [
  { id: "cmd-case", kind: "command", title: "Begin today's case", href: "/desk?begin=case", keywords: "start case today" },
  { id: "cmd-glance", kind: "command", title: "Give me a Glance", href: "/observation/glance", keywords: "observation quick look" },
  { id: "cmd-palace", kind: "command", title: "Open Memory Palace", href: "/memory/palace", keywords: "loci" },
  { id: "cmd-curator", kind: "command", title: "Ask the Curator", href: "/curator", keywords: "mentor ai" },
  { id: "cmd-strange", kind: "command", title: "Give me something strange", href: "/cabinet?random=1", keywords: "curiosity cabinet" },
  { id: "cmd-observe", kind: "command", title: "Test my observation", href: "/observation", keywords: "notice" },
  { id: "cmd-salon", kind: "command", title: "Start a Salon", href: "/salon", keywords: "conversation" },
  { id: "cmd-reason", kind: "command", title: "Challenge my reasoning", href: "/inference", keywords: "inference" },
  { id: "cmd-book", kind: "command", title: "Open current book", href: "/archive/reading", keywords: "reading bookshelf" },
  { id: "cmd-thread", kind: "command", title: "Show my recurring blind spots", href: "/red-thread", keywords: "patterns mistakes" },
  { id: "cmd-session", kind: "command", title: "Start today's session", href: "/desk?session=1", keywords: "daily ritual" },
  { id: "cmd-forecast", kind: "command", title: "Make a forecast", href: "/forecasts?new=1", keywords: "predict" },
  { id: "cmd-decision", kind: "command", title: "Log a decision", href: "/decisions?new=1", keywords: "journal" },
  { id: "cmd-theme", kind: "command", title: "Toggle appearance", href: "#toggle-theme", keywords: "dark light mode" },
];

function norm(s: string) {
  return s.toLowerCase();
}

function score(hit: SearchHit, q: string): number {
  const t = norm(hit.title);
  const s = norm(hit.subtitle ?? "");
  const k = norm(hit.keywords ?? "");
  if (t.startsWith(q)) return 100;
  if (t.includes(q)) return 80;
  if (k.includes(q)) return 55;
  if (s.includes(q)) return 40;
  // token match
  const toks = q.split(/\s+/).filter(Boolean);
  if (toks.length > 1 && toks.every((tk) => (t + " " + s + " " + k).includes(tk))) return 35;
  return 0;
}

export function staticIndex(): SearchHit[] {
  const rooms: SearchHit[] = ROOMS.map((r) => ({ id: "room-" + r.id, kind: "room", title: r.label, subtitle: r.description, href: r.href }));
  const cases: SearchHit[] = C.CASES.map((c) => ({ id: "case-" + c.id, kind: "case", title: `Case ${c.number} · ${c.title}`, subtitle: c.setting, href: `/casebook/${c.id}`, keywords: c.faculties.join(" ") }));
  const archive: SearchHit[] = C.ARCHIVE_ENTRIES.map((a) => ({ id: "arc-" + a.id, kind: "archive", title: a.title, subtitle: a.subtitle ?? a.summary, href: `/archive/${a.id}`, keywords: `${a.kind} ${a.domain} ${a.tags.join(" ")}` }));
  const curios: SearchHit[] = C.CURIOSITIES.map((c) => ({ id: "cur-" + c.id, kind: "curiosity", title: c.title, subtitle: c.hook, href: `/cabinet/${c.id}`, keywords: c.domain }));
  const inv: SearchHit[] = C.INVESTIGATION_TEMPLATES.map((t) => ({ id: "inv-" + t.id, kind: "investigation", title: t.title, subtitle: t.question, href: `/investigations?template=${t.id}` }));
  const people: SearchHit[] = C.PEOPLE.map((p) => ({ id: "ppl-" + p.id, kind: "person", title: p.name, subtitle: `${p.profession} · ${p.origin}`, href: `/memory/people`, keywords: p.interest }));
  return [...COMMANDS, ...rooms, ...cases, ...archive, ...curios, ...inv, ...people];
}

export async function userIndex(db: StudyDatabase): Promise<SearchHit[]> {
  const [books, decisions, forecasts, threads, notes, investigations] = await Promise.all([
    db.store("reading_items").list(),
    db.store("decision_entries").list(),
    db.store("forecasts").list(),
    db.store("red_threads").list(),
    db.store("archive_notes").list(),
    db.store("investigations").list(),
  ]);
  return [
    ...books.map<SearchHit>((b) => ({ id: "book-" + b.id, kind: "book", title: b.title, subtitle: b.author ?? b.kind, href: `/archive/reading/${b.id}` })),
    ...decisions.map<SearchHit>((d) => ({ id: "dec-" + d.id, kind: "decision", title: d.title, subtitle: d.status === "open" ? "Open decision" : "Reviewed", href: `/decisions/${d.id}` })),
    ...forecasts.map<SearchHit>((f) => ({ id: "fc-" + f.id, kind: "forecast", title: f.question, subtitle: `${Math.round(f.probability * 100)}% · ${f.status}`, href: `/forecasts/${f.id}` })),
    ...threads.map<SearchHit>((t) => ({ id: "rt-" + t.id, kind: "thread", title: t.title, subtitle: t.status, href: `/red-thread/${t.id}` })),
    ...notes.map<SearchHit>((n) => ({ id: "note-" + n.id, kind: "note", title: n.text.slice(0, 80), subtitle: "Archive note", href: `/archive/${n.entryId}` })),
    ...investigations.map<SearchHit>((i) => ({ id: "inv-u-" + i.id, kind: "investigation", title: i.title, subtitle: i.question, href: `/investigations/${i.id}` })),
  ];
}

export function search(index: SearchHit[], query: string, limit = 12): SearchHit[] {
  const q = norm(query.trim());
  if (!q) return index.filter((h) => h.kind === "command").slice(0, 8);
  return index
    .map((h) => ({ h, s: score(h, q) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.h);
}
