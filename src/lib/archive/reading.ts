/**
 * Pure helpers for the Bookshelf: labels, spine geometry, and the key points
 * a reconstruction is scored against.
 */
import type { ReadingItem, ReadingKind, ReadingStatus } from "@/lib/domain/types";
import { seedFromString } from "@/lib/util/format";

export const READING_STATUSES: ReadingStatus[] = ["reading", "up_next", "finished", "reference"];

export const READING_STATUS_LABEL: Record<ReadingStatus, string> = {
  reading: "Reading",
  up_next: "Up next",
  finished: "Finished",
  reference: "Reference",
};

export const READING_STATUS_BLURB: Record<ReadingStatus, string> = {
  reading: "Open on the desk.",
  up_next: "Chosen, not started.",
  finished: "Closed. The notes are what remain.",
  reference: "Kept to be consulted, not read through.",
};

export const READING_KINDS: ReadingKind[] = ["book", "article", "paper", "essay", "report"];

export const READING_KIND_LABEL: Record<ReadingKind, string> = {
  book: "Book",
  article: "Article",
  paper: "Paper",
  essay: "Essay",
  report: "Report",
};

export type NoteField = "keyIdea" | "argument" | "evidence" | "surprise" | "disagreement" | "unresolved";

export const NOTE_FIELDS: { key: NoteField; label: string; prompt: string }[] = [
  { key: "keyIdea", label: "Key idea", prompt: "The one thing the author wants you to leave with. One or two sentences." },
  { key: "argument", label: "Argument", prompt: "How they get there: the premises, the steps, the move that does the work." },
  { key: "evidence", label: "Evidence", prompt: "What they show rather than what they say. Data, cases, examples, and how good they are." },
  { key: "surprise", label: "Surprise", prompt: "What you did not expect, or expected to be otherwise." },
  { key: "disagreement", label: "Disagreement", prompt: "Where you think they are wrong, and what would settle it." },
  { key: "unresolved", label: "Unresolved", prompt: "What you still cannot decide after reading." },
];

/* ------------------------------------------------------------------ */
/* Spines                                                               */
/* ------------------------------------------------------------------ */

export interface Spine {
  width: number;
  height: number;
  /** index into SPINE_TONES */
  tone: number;
  /** a decorative band near the top or bottom, or none */
  band: "top" | "bottom" | "none";
}

/** Colours derived from tokens only, so dark mode follows. */
export const SPINE_TONES = [
  "color-mix(in oklab, var(--wine) 24%, var(--paper-3))",
  "color-mix(in oklab, var(--forest) 24%, var(--paper-3))",
  "color-mix(in oklab, var(--brass) 30%, var(--paper-3))",
  "color-mix(in oklab, var(--ink) 12%, var(--paper-3))",
  "color-mix(in oklab, var(--wine) 42%, var(--paper-4))",
  "color-mix(in oklab, var(--forest) 40%, var(--paper-4))",
  "color-mix(in oklab, var(--brass) 48%, var(--paper-4))",
];

const KIND_HEIGHT: Record<ReadingKind, [number, number]> = {
  book: [150, 200],
  report: [140, 176],
  paper: [124, 150],
  essay: [118, 146],
  article: [110, 138],
};

/** Deterministic spine geometry from the title, so a shelf never reshuffles. */
export function spineFor(item: Pick<ReadingItem, "title" | "kind" | "author">): Spine {
  const seed = seedFromString(`${item.title}|${item.author ?? ""}`);
  const [lo, hi] = KIND_HEIGHT[item.kind] ?? KIND_HEIGHT.book;
  const len = item.title.length;
  const height = Math.round(lo + ((seed % 1000) / 1000) * (hi - lo) + Math.min(24, len * 0.6));
  const width = Math.round(Math.max(26, Math.min(46, 22 + len * 0.55 + ((seed >> 4) % 7))));
  const tone = (seed >> 8) % SPINE_TONES.length;
  const b = (seed >> 12) % 3;
  return { width, height, tone, band: b === 0 ? "top" : b === 1 ? "bottom" : "none" };
}

/* ------------------------------------------------------------------ */
/* Reconstruction                                                       */
/* ------------------------------------------------------------------ */

/** Sentences of at least twenty characters, in order, without duplicates. */
export function splitSentences(text: string | undefined): string[] {
  if (!text) return [];
  const out: string[] = [];
  for (const raw of text.split(/(?<=[.!?])\s+|\n+/)) {
    const s = raw.trim();
    if (s.length < 20) continue;
    if (!out.includes(s)) out.push(s);
  }
  return out;
}

/** Key points a reconstruction is compared against: the saved key idea, argument and evidence, sentence by sentence. */
export function reconstructionPoints(item: Pick<ReadingItem, "keyIdea" | "argument" | "evidence">, cap = 10): string[] {
  return [...splitSentences(item.keyIdea), ...splitSentences(item.argument), ...splitSentences(item.evidence)].slice(0, cap);
}

export function canReconstruct(item: Pick<ReadingItem, "keyIdea" | "argument" | "evidence">): boolean {
  return reconstructionPoints(item).length >= 2;
}

/** Sort key for the shelf: status order, then most recently touched first. */
export function shelfOrder(a: ReadingItem, b: ReadingItem): number {
  const sa = READING_STATUSES.indexOf(a.status);
  const sb = READING_STATUSES.indexOf(b.status);
  if (sa !== sb) return sa - sb;
  return b.updatedAt.localeCompare(a.updatedAt);
}
