/**
 * Pure helpers for the Cabinet of Curiosities: merging seeded and generated
 * curiosities, the daily pick, drawers by domain, reading helpers and the
 * deterministic rubric for "Why does this matter?".
 */
import type { ArchiveDomain, ArchiveEntry, Curiosity, CuriosityView, GeneratedContent } from "@/lib/domain/types";
import { CURIOSITIES } from "@/content";
import { DOMAINS, DOMAIN_LABEL } from "@/lib/archive/entries";
import { seedFromString, todayKey } from "@/lib/util/format";

/* ------------------------------------------------------------------ */
/* Merging seeded and generated                                          */
/* ------------------------------------------------------------------ */

/** Shape the model returns (domain is a free string there). */
export interface RawCuriosity {
  id: string;
  title: string;
  hook: string;
  body: string;
  connects: string[];
  domain: string;
  origin: "generated";
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function coerceDomain(raw: string | undefined): ArchiveDomain {
  const t = (raw ?? "").trim().toLowerCase();
  if ((DOMAINS as string[]).includes(t)) return t as ArchiveDomain;
  const byLabel = DOMAINS.find((d) => DOMAIN_LABEL[d].toLowerCase() === t);
  if (byLabel) return byLabel;
  if (/econom|money|finance|trade/.test(t)) return "economics";
  if (/geo|place|map/.test(t)) return "geography";
  if (/politic|state|diplom/.test(t)) return "politics";
  if (/law|legal/.test(t)) return "law";
  if (/psych|mind|behav/.test(t)) return "psychology";
  if (/philos|logic/.test(t)) return "philosophy";
  if (/scien|physic|chem|biol|math/.test(t)) return "science";
  if (/tech|engineer|machine/.test(t)) return "technology";
  if (/busin|company|firm|commerce/.test(t)) return "business";
  if (/music|song|compos/.test(t)) return "music";
  if (/art|paint|architec|design/.test(t)) return "art";
  if (/liter|book|poem|novel|language|linguist/.test(t)) return "literature";
  if (/food|drink|cook|cuisine/.test(t)) return "food";
  return "history";
}

/** Normalise a generated curiosity so it can sit beside the seeded ones. */
export function coerceCuriosity(raw: RawCuriosity, taken: Set<string>): Curiosity {
  let id = slugify(raw.id || raw.title);
  if (!id) id = `cur-${Date.now().toString(36)}`;
  if (!id.startsWith("cur-")) id = `cur-${id}`;
  if (taken.has(id)) id = `${id}-${Date.now().toString(36)}`;
  const connects = [...new Set((raw.connects ?? []).map((c) => slugify(String(c))).filter(Boolean))];
  return {
    id,
    title: raw.title.trim(),
    hook: raw.hook.trim(),
    body: raw.body.trim(),
    connects,
    domain: coerceDomain(raw.domain),
    origin: "generated",
  };
}

function looksLikeCuriosity(p: unknown): p is Curiosity {
  if (!p || typeof p !== "object") return false;
  const c = p as Partial<Curiosity>;
  return typeof c.id === "string" && typeof c.title === "string" && typeof c.hook === "string" && typeof c.body === "string" && Array.isArray(c.connects);
}

/** Seeded curiosities plus generated ones (generated_content kind "curiosity"); seeded ids win. */
export function mergeCuriosities(generated: GeneratedContent[] | undefined): Curiosity[] {
  const seen = new Set(CURIOSITIES.map((c) => c.id));
  const extra: Curiosity[] = [];
  for (const g of generated ?? []) {
    if (g.kind !== "curiosity") continue;
    const p = g.payload;
    if (!looksLikeCuriosity(p) || seen.has(p.id)) continue;
    seen.add(p.id);
    extra.push({ ...p, domain: coerceDomain(p.domain), origin: "generated" });
  }
  return [...CURIOSITIES, ...extra];
}

/* ------------------------------------------------------------------ */
/* Views                                                                 */
/* ------------------------------------------------------------------ */

export function viewMap(rows: CuriosityView[] | undefined): Map<string, CuriosityView> {
  const m = new Map<string, CuriosityView>();
  for (const v of rows ?? []) {
    const prev = m.get(v.curiosityId);
    // If duplicates ever exist, keep the one touched most recently.
    if (!prev || prev.updatedAt < v.updatedAt) m.set(v.curiosityId, v);
  }
  return m;
}

export type SeenState = "unseen" | "seen" | "connected";

export function seenState(views: Map<string, CuriosityView>, id: string): SeenState {
  const v = views.get(id);
  if (!v) return "unseen";
  return v.connectedTo.length ? "connected" : "seen";
}

/* ------------------------------------------------------------------ */
/* Picks                                                                 */
/* ------------------------------------------------------------------ */

/** Local midnight of a `YYYY-MM-DD` key as an ISO string, for "seen before today". */
function dayStartIso(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1).toISOString();
}

/**
 * Today's curiosity: a deterministic pick by date among the items not seen
 * before today (so the pick does not change once you have read it), or among
 * everything once the whole cabinet has been seen.
 */
export function dailyPick(items: Curiosity[], views: Map<string, CuriosityView>, dateKey = todayKey()): Curiosity | undefined {
  if (!items.length) return undefined;
  const start = dayStartIso(dateKey);
  const fresh = items.filter((c) => {
    const v = views.get(c.id);
    return !v || v.createdAt >= start;
  });
  const pool = fresh.length ? fresh : items;
  const idx = seedFromString(`cabinet:${dateKey}`) % pool.length;
  return pool[idx];
}

/** A random curiosity never opened; any curiosity once all have been. */
export function randomUnseen(items: Curiosity[], views: Map<string, CuriosityView>, rnd: () => number = Math.random, excludeId?: string): Curiosity | undefined {
  if (!items.length) return undefined;
  const unseen = items.filter((c) => !views.has(c.id) && c.id !== excludeId);
  const pool = unseen.length ? unseen : items.filter((c) => c.id !== excludeId);
  const list = pool.length ? pool : items;
  return list[Math.min(list.length - 1, Math.floor(rnd() * list.length))];
}

/** The seen curiosity whose view was touched longest ago; undefined when nothing has been seen. */
export function leastRecentlySeen(items: Curiosity[], views: Map<string, CuriosityView>): Curiosity | undefined {
  let best: Curiosity | undefined;
  let bestAt = "";
  for (const c of items) {
    const v = views.get(c.id);
    if (!v) continue;
    if (!best || v.updatedAt < bestAt) {
      best = c;
      bestAt = v.updatedAt;
    }
  }
  return best;
}

/* ------------------------------------------------------------------ */
/* Drawers and neighbours                                                */
/* ------------------------------------------------------------------ */

export interface Drawer {
  domain: ArchiveDomain;
  label: string;
  items: Curiosity[];
}

/** One drawer per domain that has at least one curiosity, in the Archive's domain order. */
export function drawers(items: Curiosity[]): Drawer[] {
  return DOMAINS.map((domain) => ({ domain, label: DOMAIN_LABEL[domain], items: items.filter((c) => c.domain === domain) })).filter((d) => d.items.length);
}

/** Previous and next curiosity in the same domain, in cabinet order. */
export function neighbours(items: Curiosity[], c: Curiosity): { prev?: Curiosity; next?: Curiosity; index: number; total: number } {
  const same = items.filter((i) => i.domain === c.domain);
  const index = same.findIndex((i) => i.id === c.id);
  return { prev: index > 0 ? same[index - 1] : undefined, next: index >= 0 && index < same.length - 1 ? same[index + 1] : undefined, index, total: same.length };
}

/* ------------------------------------------------------------------ */
/* Reading helpers                                                       */
/* ------------------------------------------------------------------ */

export function paragraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

export function readingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

const ABBREVIATIONS = new Set(["c", "ca", "st", "mr", "mrs", "ms", "dr", "no", "nos", "vs", "al", "etc", "fig", "approx", "mt", "ft", "col", "gen", "lt", "capt", "prof", "rev", "hon", "jr", "sr", "inc", "ltd", "co"]);

/** The first sentence of a text, tolerant of common abbreviations and closing quotes. */
export function firstSentence(text: string): string {
  const t = text.replace(/\s+/g, " ").trim();
  const re = /[.!?]["”’)]?(?=\s+["“(]?[A-Z0-9])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(t))) {
    const before = t.slice(0, m.index);
    const token = before.split(/\s+/).pop() ?? "";
    // A bare short word from the list ("c", "St") is an abbreviation; a quoted "no" is not.
    if (/^[A-Za-z]{1,6}$/.test(token) && ABBREVIATIONS.has(token.toLowerCase())) continue;
    const candidate = t.slice(0, m.index + m[0].length);
    // A very short opening ("In 1900.") reads better with the sentence that follows.
    if (candidate.length < 40 && m.index + m[0].length < t.length) continue;
    return candidate;
  }
  return t;
}

/** The hook, turned into a recall prompt: the claim, then the question of mechanism. */
export function hookAsQuestion(hook: string): string {
  const h = hook.replace(/\s+/g, " ").trim();
  if (/\?$/.test(h)) return h;
  return `${h.replace(/[.!]+$/, "")}. How so?`;
}

/* ------------------------------------------------------------------ */
/* "Why does this matter?" rubric                                        */
/* ------------------------------------------------------------------ */

const STOP = new Set(["the", "a", "an", "of", "and", "in", "on", "at", "to", "for", "from", "with", "by", "is", "was", "were", "that", "this", "its", "it", "as", "or", "how", "why", "what", "where", "when", "who", "into", "about", "over"]);

/** Lower-case content words of an Archive title, four letters or longer. */
export function titleKeywords(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[’']s\b/g, "")
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 4 && !STOP.has(w));
}

export const WHY_MIN_WORDS = 3;

export function whyWordCount(answer: string): number {
  const t = answer.trim();
  return t ? t.split(/\s+/).length : 0;
}

/**
 * 0.7 when the answer names one of the connected Archive entries (by a title
 * keyword or the entry id), 0.55 otherwise. Returns the entries it recognised.
 */
export function whyScore(answer: string, connected: Pick<ArchiveEntry, "id" | "title">[]): { score: number; mentioned: string[] } {
  const a = answer.toLowerCase();
  const mentioned: string[] = [];
  for (const e of connected) {
    const idPhrase = e.id.replace(/-/g, " ");
    // Match on the stem so "coffeehouse" finds "Coffeehouses" and "bank" finds "Central Banks".
    const stems = titleKeywords(e.title).map((k) => (k.length > 4 && k.endsWith("s") ? k.slice(0, -1) : k));
    const hit = a.includes(idPhrase) || stems.some((k) => new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(a));
    if (hit) mentioned.push(e.title);
  }
  return { score: mentioned.length ? 0.7 : 0.55, mentioned };
}

/** Feedback that names one or two things, never ten. */
export function whyFeedback(mentioned: string[]): string {
  if (!mentioned.length) return "Recorded. It would be sharper tied to one of the entries it connects to.";
  if (mentioned.length === 1) return `Recorded. You tied it to ${mentioned[0]}.`;
  return `Recorded. You tied it to ${mentioned[0]} and ${mentioned[1]}.`;
}
