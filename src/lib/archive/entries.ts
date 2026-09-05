/**
 * Pure helpers for the Archive: merging seed and generated entries, eras,
 * kind/domain labels, progress lookups and connection utilities.
 */
import type { ArchiveConnection, ArchiveDomain, ArchiveEntry, ArchiveKind, ArchiveProgress, ArchiveRelation, GeneratedContent } from "@/lib/domain/types";
import type { SubskillId } from "@/lib/domain/faculties";
import { ARCHIVE_CONNECTIONS, ARCHIVE_ENTRIES } from "@/content";

/* ------------------------------------------------------------------ */
/* Labels                                                               */
/* ------------------------------------------------------------------ */

export const DOMAIN_LABEL: Record<ArchiveDomain, string> = {
  history: "History",
  geography: "Geography",
  economics: "Economics",
  politics: "Politics",
  science: "Science",
  psychology: "Psychology",
  philosophy: "Philosophy",
  art: "Art",
  literature: "Literature",
  music: "Music",
  food: "Food",
  business: "Business",
  technology: "Technology",
  law: "Law",
};

export const DOMAINS = Object.keys(DOMAIN_LABEL) as ArchiveDomain[];

export const KIND_LABEL: Record<ArchiveKind, string> = {
  person: "Person",
  place: "Place",
  event: "Event",
  concept: "Idea",
  work: "Work",
  institution: "Institution",
  technology: "Technology",
  movement: "Movement",
  object: "Object",
  path: "Path",
};

/** Editorial groupings for the index page, in reading order. */
export const KIND_GROUPS: { title: string; kinds: ArchiveKind[] }[] = [
  { title: "Objects", kinds: ["object"] },
  { title: "People", kinds: ["person"] },
  { title: "Places", kinds: ["place"] },
  { title: "Events", kinds: ["event"] },
  { title: "Ideas", kinds: ["concept"] },
  { title: "Works", kinds: ["work"] },
  { title: "Institutions", kinds: ["institution"] },
  { title: "Technologies & Movements", kinds: ["technology", "movement"] },
];

export const RELATION_LABEL: Record<ArchiveRelation, string> = {
  CAUSED: "caused",
  INFLUENCED: "influenced",
  PRECEDED: "preceded",
  CONTRASTS_WITH: "contrasts with",
  LOCATED_IN: "located in",
  CREATED_BY: "created by",
  DEPENDS_ON: "depends on",
  RESPONDED_TO: "responded to",
  EXAMPLE_OF: "example of",
  RELATED_TO: "related to",
};

/** Passive reading of a relation, used when the entry is the target. */
export const RELATION_INVERSE: Record<ArchiveRelation, string> = {
  CAUSED: "was caused by",
  INFLUENCED: "was influenced by",
  PRECEDED: "was preceded by",
  CONTRASTS_WITH: "contrasts with",
  LOCATED_IN: "is the setting of",
  CREATED_BY: "created",
  DEPENDS_ON: "underpins",
  RESPONDED_TO: "was answered by",
  EXAMPLE_OF: "is exemplified by",
  RELATED_TO: "related to",
};

export const RELATIONS = Object.keys(RELATION_LABEL) as ArchiveRelation[];

/** Knowledge subskill for a domain; every Archive domain has a matching subskill. */
export function knowledgeSubskill(domain: ArchiveDomain): SubskillId {
  return `knowledge.${domain}` as SubskillId;
}

/* ------------------------------------------------------------------ */
/* Years and eras                                                       */
/* ------------------------------------------------------------------ */

export function formatYear(y: number): string {
  if (y < 0) return `${-y} BCE`;
  if (y < 1000) return `${y} CE`;
  return String(y);
}

/** "1450–1500", "196 BCE – 1822", "from 1763", or "" when undated. */
export function eraLabel(e: Pick<ArchiveEntry, "yearStart" | "yearEnd">): string {
  if (e.yearStart === undefined) return "";
  if (e.yearEnd === undefined) return `from ${formatYear(e.yearStart)}`;
  if (e.yearEnd === e.yearStart) return formatYear(e.yearStart);
  const bceCross = e.yearStart < 0 && e.yearEnd >= 0;
  return bceCross ? `${formatYear(e.yearStart)} – ${formatYear(e.yearEnd)}` : `${formatYear(e.yearStart)}–${formatYear(e.yearEnd)}`;
}

export function centuryLabel(startYear: number): string {
  if (startYear < 0) {
    const n = Math.round(-startYear / 100);
    return `${ordinal(n)} century BCE`;
  }
  return `${ordinal(Math.floor(startYear / 100) + 1)} century`;
}

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

/* ------------------------------------------------------------------ */
/* Merging seed and generated content                                    */
/* ------------------------------------------------------------------ */

function looksLikeEntry(p: unknown): p is ArchiveEntry {
  if (!p || typeof p !== "object") return false;
  const e = p as Partial<ArchiveEntry>;
  return typeof e.id === "string" && typeof e.title === "string" && typeof e.kind === "string" && typeof e.domain === "string" && Array.isArray(e.remember) && Array.isArray(e.recall);
}

/** Seed entries plus generated ones (generated_content kind "archive"); seed ids win. */
export function mergeEntries(generated: GeneratedContent[] | undefined): ArchiveEntry[] {
  const seen = new Set(ARCHIVE_ENTRIES.map((e) => e.id));
  const extra: ArchiveEntry[] = [];
  for (const g of generated ?? []) {
    if (g.kind !== "archive") continue;
    const p = g.payload;
    if (!looksLikeEntry(p) || seen.has(p.id)) continue;
    seen.add(p.id);
    extra.push({ ...p, tags: p.tags ?? [], readingMinutes: p.readingMinutes ?? 4, origin: "generated" });
  }
  return [...ARCHIVE_ENTRIES, ...extra];
}

export function progressMap(rows: ArchiveProgress[] | undefined): Map<string, ArchiveProgress> {
  const m = new Map<string, ArchiveProgress>();
  for (const p of rows ?? []) m.set(p.entryId, p);
  return m;
}

export type Status = ArchiveProgress["status"];

export const STATUS_ORDER: Status[] = ["unread", "read", "understood", "retained"];

export function statusOf(map: Map<string, ArchiveProgress>, id: string): Status {
  return map.get(id)?.status ?? "unread";
}

export function statusRank(s: Status): number {
  return STATUS_ORDER.indexOf(s);
}

/* ------------------------------------------------------------------ */
/* Connections                                                           */
/* ------------------------------------------------------------------ */

export type Edge = ArchiveConnection & { user?: boolean };

/** Seed connections plus user-made ones, dropping edges whose ends are unknown. */
export function allEdges(userRows: ArchiveConnection[] | undefined, known: Set<string>): Edge[] {
  const seed: Edge[] = ARCHIVE_CONNECTIONS.filter((c) => known.has(c.from) && known.has(c.to));
  const user: Edge[] = (userRows ?? []).filter((c) => known.has(c.from) && known.has(c.to)).map((c) => ({ ...c, user: true }));
  return [...seed, ...user];
}

export function edgesOf(edges: Edge[], id: string): Edge[] {
  return edges.filter((e) => e.from === id || e.to === id);
}

export function neighbourIds(edges: Edge[], id: string): string[] {
  const s = new Set<string>();
  for (const e of edges) {
    if (e.from === id) s.add(e.to);
    else if (e.to === id) s.add(e.from);
  }
  return [...s];
}

/** Text search over title, subtitle, summary, tags. */
export function matchesQuery(e: ArchiveEntry, q: string): boolean {
  const t = q.trim().toLowerCase();
  if (!t) return true;
  const hay = `${e.title} ${e.subtitle ?? ""} ${e.summary} ${e.tags.join(" ")} ${e.domain} ${e.kind}`.toLowerCase();
  return t.split(/\s+/).every((w) => hay.includes(w));
}

/** Deterministic-but-varied pick: uses the clock minute so repeated clicks still vary. */
export function pickRandom<T>(items: T[], salt = Date.now()): T | undefined {
  if (!items.length) return undefined;
  let h = 2166136261 ^ Math.floor(salt);
  h = Math.imul(h ^ (h >>> 13), 16777619);
  return items[Math.abs(h) % items.length];
}

/** Path progress: read entries / path entries. */
export function pathProgress(path: ArchiveEntry, map: Map<string, ArchiveProgress>): { done: number; total: number } {
  const ids = path.pathEntries ?? [];
  const done = ids.filter((id) => statusRank(statusOf(map, id)) >= 1).length;
  return { done, total: ids.length };
}
