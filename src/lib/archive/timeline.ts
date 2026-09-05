/**
 * Pure helpers for the Archive timeline: a piecewise-linear year scale so
 * antiquity does not squash the modern era, greedy lane packing, era bands
 * and "what was happening at the same time" lookups.
 */
import type { ArchiveEntry } from "@/lib/domain/types";
import { formatYear } from "./entries";

export const CURRENT_YEAR = new Date().getFullYear();

export interface Band {
  id: string;
  from: number;
  to: number;
  /** share of the axis length, sums to 1 */
  share: number;
  label: string;
  caption: string;
  /** spacing of year ticks inside the band */
  tickEvery: number;
}

/** Four bands: everything before 1000 shares 16% of the axis; the twentieth century onward gets 30%. */
export function bandsFor(minYear: number, now = CURRENT_YEAR): Band[] {
  const start = Math.min(-200, Math.floor(minYear / 200) * 200);
  const end = Math.max(now, 2000);
  return [
    { id: "ancient", from: start, to: 1000, share: 0.16, label: "Antiquity and the early Middle Ages", caption: `${formatYear(start)} to 1000`, tickEvery: 200 },
    { id: "medieval", from: 1000, to: 1600, share: 0.24, label: "High Middle Ages and Renaissance", caption: "1000 to 1600", tickEvery: 100 },
    { id: "early-modern", from: 1600, to: 1900, share: 0.3, label: "Early modern", caption: "1600 to 1900", tickEvery: 50 },
    { id: "modern", from: 1900, to: end, share: 0.3, label: "Modern", caption: `1900 to now`, tickEvery: 25 },
  ];
}

/** 0..1 position of a year on the piecewise scale. */
export function scaleYear(year: number, bands: Band[]): number {
  let acc = 0;
  for (const b of bands) {
    if (year <= b.to) {
      const y = Math.max(year, b.from);
      return acc + ((y - b.from) / (b.to - b.from)) * b.share;
    }
    acc += b.share;
  }
  return 1;
}

export function bandOf(year: number, bands: Band[]): Band {
  return bands.find((b) => year < b.to) ?? bands[bands.length - 1];
}

export interface YearTick {
  year: number;
  t: number;
  major: boolean;
}

/** Year ticks at each band's spacing; band boundaries are major. */
export function yearTicks(bands: Band[]): YearTick[] {
  const out: YearTick[] = [];
  const seen = new Set<number>();
  for (const b of bands) {
    const first = Math.ceil(b.from / b.tickEvery) * b.tickEvery;
    for (let y = first; y < b.to; y += b.tickEvery) {
      if (seen.has(y)) continue;
      seen.add(y);
      out.push({ year: y, t: scaleYear(y, bands), major: y === b.from });
    }
  }
  const last = bands[bands.length - 1];
  if (!seen.has(last.to)) out.push({ year: last.to, t: 1, major: true });
  return out;
}

export interface Dated {
  entry: ArchiveEntry;
  start: number;
  end: number;
}

/** Entries with a start year, oldest first; undated entries and paths are left out. */
export function datedEntries(entries: ArchiveEntry[]): Dated[] {
  return entries
    .filter((e): e is ArchiveEntry & { yearStart: number } => e.kind !== "path" && typeof e.yearStart === "number")
    .map((e) => ({ entry: e, start: e.yearStart, end: e.yearEnd ?? e.yearStart }))
    .sort((a, b) => a.start - b.start || a.end - b.end || a.entry.title.localeCompare(b.entry.title));
}

export interface Placed extends Dated {
  /** pixel x of the start and end of the span */
  x0: number;
  x1: number;
  /** pixel extent actually occupied, including the label */
  right: number;
  lane: number;
}

/** Greedy packing into lanes: an item goes to the first lane whose last occupant ends before it starts. */
export function packLanes(items: Dated[], bands: Band[], width: number, labelWidth: (d: Dated) => number, gap = 16): { placed: Placed[]; lanes: number } {
  const ends: number[] = [];
  const placed: Placed[] = [];
  for (const d of items) {
    const x0 = scaleYear(d.start, bands) * width;
    const x1 = scaleYear(d.end, bands) * width;
    const right = Math.max(x1, x0 + labelWidth(d));
    let lane = ends.findIndex((e) => e + gap <= x0);
    if (lane === -1) {
      lane = ends.length;
      ends.push(right);
    } else ends[lane] = right;
    placed.push({ ...d, x0, x1, right, lane });
  }
  return { placed, lanes: ends.length };
}

/**
 * What was happening when this began: entries that started within ±window
 * years of the selected start, or already existed then and were still going.
 */
export function contemporaries(sel: Dated, all: Dated[], window = 50): Dated[] {
  return all
    .filter((d) => d.entry.id !== sel.entry.id)
    .filter((d) => Math.abs(d.start - sel.start) <= window || (d.start - window <= sel.start && d.end + window >= sel.start))
    .sort((a, b) => Math.abs(a.start - sel.start) - Math.abs(b.start - sel.start));
}

/** Approximate serif label width in px at the given font size. */
export function estimateLabelWidth(text: string, fontSize = 12): number {
  return text.length * fontSize * 0.5 + 18;
}
