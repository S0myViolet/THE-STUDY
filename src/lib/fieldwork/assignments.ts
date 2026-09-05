import type { FieldAssignment } from "@/lib/domain/types";
import { seedFromString } from "@/lib/util/format";

export type FieldKind = FieldAssignment["kind"];

export const KIND_ORDER: FieldKind[] = ["observation", "recall", "conversation", "memory", "curiosity", "city", "news", "decision"];

export const KIND_META: Record<FieldKind, { label: string; note: string }> = {
  observation: { label: "Observation", note: "Look at what is actually there." },
  recall: { label: "Recall", note: "Leave first, then remember." },
  conversation: { label: "Conversation", note: "Ask one real question." },
  memory: { label: "Memory", note: "Keep a name and one detail." },
  curiosity: { label: "Curiosity", note: "Ask why, then why again." },
  city: { label: "The city", note: "Read one page of it." },
  news: { label: "The news", note: "Take a claim apart." },
  decision: { label: "Decision", note: "Write it down before you choose." },
};

export function kindLabel(kind: FieldKind): string {
  return KIND_META[kind]?.label ?? kind;
}

/** ISO 8601 week number and week-based year. */
export function isoWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - yearStart) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

/**
 * This week's assignment: deterministic for the ISO week, drawn from the
 * assignments that have not yet been completed. Undefined when everything has been filed.
 */
export function weeklyPick(assignments: FieldAssignment[], completedIds: Set<string>, now = new Date()): FieldAssignment | undefined {
  const pool = assignments.filter((a) => !completedIds.has(a.id));
  if (!pool.length) return undefined;
  const { year, week } = isoWeek(now);
  const h = seedFromString(`fieldwork:${year}-W${String(week).padStart(2, "0")}`);
  return pool[h % pool.length];
}

/** First one or two sentences of a brief, for lists. */
export function briefExcerpt(brief: string, maxSentences = 1): string {
  const parts = brief.split(/(?<=[.!?])\s+/).filter(Boolean);
  return parts.slice(0, maxSentences).join(" ");
}
