import type { StudyDatabase } from "@/lib/persistence/store";
import type { ArchiveEntry, CuratorMode, Curiosity } from "@/lib/domain/types";
import { FACULTIES, FACULTY_META, LEVEL_LABEL, LEVEL_ORDER } from "@/lib/domain/faculties";
import { aggregateFaculty } from "@/lib/scoring/estimates";
import { isDue } from "@/lib/scoring/spaced";
import { recommendNext } from "@/lib/adaptation/recommend";
import { ARCHIVE_ENTRIES } from "@/content/archive";
import { CURIOSITIES } from "@/content/cabinet";
import { plural } from "@/lib/util/format";

/**
 * The offline Curator. Reads the real record and answers a handful of intents
 * in prose. Links are written as [label](/href) and rendered as real links.
 */
export type OfflineIntent = "recommend" | "progress" | "threads" | "due" | "knowledge" | "curiosity" | "debrief" | "unknown";

export interface KnowledgeRef {
  entryId?: string;
  title: string;
  question: string;
  /** Short answer used as the recall answer when the user asks to be tested later */
  answer: string;
}

export interface OfflineReply {
  intent: OfflineIntent;
  text: string;
  knowledge?: KnowledgeRef;
}

export function detectIntent(text: string): OfflineIntent {
  const t = text.trim().toLowerCase();
  if (/\b(what should i (work|focus) on|what next|what's next|recommend|where should i (start|spend)|what do i need to work on)\b/.test(t)) return "recommend";
  if (/\b(how am i doing|progress|my levels?|how('s| is) my|where do i stand|am i improving)\b/.test(t)) return "progress";
  if (/\b(patterns?|blind ?spots?|threads?|red thread|my mistakes|weaknesses|what keeps (going wrong|happening))\b/.test(t)) return "threads";
  if (/\b(due|what('s| is) due|memory|review queue|recall|overdue)\b/.test(t)) return "due";
  if (/\b(something interesting|curiosit|surprise me|tell me something|interesting fact)\b/.test(t)) return "curiosity";
  if (/\b(debrief|last case|after[- ]action|my last (salon|session|run|attempt))\b/.test(t)) return "debrief";
  if (matchArchive(text)) return "knowledge";
  return "unknown";
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Match a message against Archive titles (and ids). Longest title wins. */
export function matchArchive(text: string): ArchiveEntry | undefined {
  const t = " " + norm(text) + " ";
  let best: ArchiveEntry | undefined;
  let bestLen = 0;
  for (const e of ARCHIVE_ENTRIES) {
    if (e.kind === "path") continue;
    const candidates = [e.title, e.title.replace(/^the /i, ""), e.id.replace(/-/g, " ")].map(norm).filter((c) => c.length >= 4);
    for (const c of candidates) {
      if (t.includes(" " + c + " ") && c.length > bestLen) {
        best = e;
        bestLen = c.length;
      }
    }
  }
  return best;
}

export function firstSentence(s: string): string {
  const m = s.match(/^[^.!?]+[.!?]/);
  return (m ? m[0] : s).trim();
}

export async function offlineReply(db: StudyDatabase, text: string, mode: CuratorMode, opts?: { afterAttempt?: boolean }): Promise<OfflineReply> {
  if (opts?.afterAttempt) return { intent: "unknown", text: attemptProse(text) };
  const intent = detectIntent(text);
  switch (intent) {
    case "recommend":
      return { intent, text: await recommendProse(db) };
    case "progress":
      return { intent, text: await progressProse(db) };
    case "threads":
      return { intent, text: await threadsProse(db) };
    case "due":
      return { intent, text: await dueProse(db) };
    case "knowledge": {
      const e = matchArchive(text)!;
      return { intent, text: knowledgeProse(e), knowledge: { entryId: e.id, title: e.title, question: `What is ${e.title}, and why does it matter?`, answer: firstSentence(e.what) } };
    }
    case "curiosity":
      return { intent, text: curiosityProse(text) };
    case "debrief":
      return { intent, text: await debriefProse(db) };
    default:
      return { intent, text: unknownProse(mode) };
  }
}

async function recommendProse(db: StudyDatabase): Promise<string> {
  const r = await recommendNext(db);
  const lines = [`${r.title}.`, r.why, `[Go there](${r.href})`];
  return lines.join("\n\n");
}

async function progressProse(db: StudyDatabase): Promise<string> {
  const estimates = await db.store("skill_estimates").list();
  const rows = FACULTIES.map((f) => ({ f, agg: aggregateFaculty(estimates.filter((e) => e.faculty === f)) }));
  const tested = rows.filter((r) => r.agg.evidenceCount > 0).sort((a, b) => LEVEL_ORDER[b.agg.level] - LEVEL_ORDER[a.agg.level] || b.agg.value - a.agg.value);
  if (!tested.length) {
    return ["The record is empty, which is the honest starting point. No faculty has evidence yet, so there is nothing to flatter or worry about.", "Start with a case; it touches several faculties at once.", "[Open the Casebook](/casebook)"].join("\n\n");
  }
  const untested = rows.length - tested.length;
  const lines = tested.map((r) => `${FACULTY_META[r.f].label}: ${LEVEL_LABEL[r.agg.level]}${r.agg.trend === "up" ? ", rising" : r.agg.trend === "down" ? ", falling" : ""} (n = ${r.agg.evidenceCount})`);
  const top = tested[0];
  const low = tested[tested.length - 1];
  const parts = [lines.join("\n")];
  if (tested.length >= 2 && top.f !== low.f) parts.push(`${FACULTY_META[top.f].label} carries the most weight right now; ${FACULTY_META[low.f].label} the least. Levels move with evidence, not effort, so the number in brackets matters as much as the word.`);
  else parts.push("One faculty has evidence. Everything else is unknown, and the Study says so rather than guessing.");
  if (untested) parts.push(`${plural(untested, "faculty is", "faculties are")} still untested.`);
  parts.push("[See the full map](/profile)");
  return parts.join("\n\n");
}

async function threadsProse(db: StudyDatabase): Promise<string> {
  const threads = await db.store("red_threads").list();
  const active = threads.filter((t) => t.status !== "resolved" && t.status !== "candidate").sort((a, b) => b.strength - a.strength);
  const candidates = threads.filter((t) => t.status === "candidate");
  if (!active.length) {
    const errs = await db.store("error_events").count();
    if (!errs) return ["No pattern yet. A pattern needs mistakes, and a mistake needs an attempt; the Red Thread only speaks after it has seen the same thing at least three times across separate sittings.", "[The Red Thread](/red-thread)"].join("\n\n");
    return [`There are ${plural(errs, "recorded error")} but no established pattern${candidates.length ? `, though ${plural(candidates.length, "candidate is", "candidates are")} forming` : ""}. That is either good news or not enough data. Keep working; the Study will tell you when a thread holds.`, "[The Red Thread](/red-thread)"].join("\n\n");
  }
  const shown = active.slice(0, 3);
  const lines = shown.map((t) => `${t.title} (${t.status}). ${t.description} Next test: ${t.nextTest}`);
  const parts = [lines.join("\n\n")];
  if (active.length > shown.length) parts.push(`${plural(active.length - shown.length, "more thread")} in the record.`);
  parts.push("[The Red Thread](/red-thread)");
  return parts.join("\n\n");
}

async function dueProse(db: StudyDatabase): Promise<string> {
  const items = await db.store("memory_items").list();
  const live = items.filter((m) => !m.suspended);
  const now = new Date();
  const due = live.filter((m) => isDue(m, now));
  const soon = live.filter((m) => !isDue(m, now) && new Date(m.due).getTime() - now.getTime() < 2 * 86400000).length;
  if (!live.length) return ["Nothing is stored, so nothing is due. Memory here is retrieval, not rereading; save something from the Archive or ask me to test you on an explanation and the schedule begins.", "[The Memory Palace](/memory)"].join("\n\n");
  if (!due.length) return [`Nothing due. ${plural(live.length, "item")} in the palace${soon ? `, ${soon} coming due within two days` : ""}. Come back tomorrow, or reconstruct something instead.`, "[The Memory Palace](/memory)"].join("\n\n");
  const oldest = due[0];
  const kinds = new Map<string, number>();
  for (const d of due) kinds.set(d.kind, (kinds.get(d.kind) ?? 0) + 1);
  const kindLine = [...kinds.entries()].map(([k, n]) => `${n} ${k}`).join(", ");
  return [`${plural(due.length, "item is", "items are")} due (${kindLine}). Retrieval a little late is still retrieval; much later is relearning.${oldest.lastReviewedAt ? "" : " Some have never been reviewed."}`, `[Recall ${due.length} now](/memory/review)`].join("\n\n");
}

function knowledgeProse(e: ArchiveEntry): string {
  const parts = [e.what, e.why];
  if (e.connects) parts.push(`Connections: ${e.connects}`);
  parts.push(`[Read the full entry](/archive/${e.id})`);
  return parts.join("\n\n");
}

function curiosityProse(text: string): string {
  const pool: Curiosity[] = CURIOSITIES;
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  h = (h + Math.floor(Date.now() / 86400000)) >>> 0;
  if (pool.length) {
    const c = pool[h % pool.length];
    return [c.hook, c.body, `[In the Cabinet](/cabinet)`].join("\n\n");
  }
  const entries = ARCHIVE_ENTRIES.filter((e) => e.kind !== "path");
  const e = entries[h % entries.length];
  return [`${e.title}: ${e.subtitle ?? e.summary}`, e.why, `[Read it in the Archive](/archive/${e.id})`].join("\n\n");
}

async function debriefProse(db: StudyDatabase): Promise<string> {
  const a = (await db.store("after_actions").list({ orderBy: "createdAt", desc: true, limit: 1 }))[0];
  if (!a) return ["There is no debrief yet. After Actions are written when you finish a case, a salon, a strategy run or a full session.", "[Open the Casebook](/casebook)"].join("\n\n");
  const parts = [`${a.title}, ${a.createdAt.slice(0, 10)}.`];
  if (a.saw.length) parts.push(`You saw: ${a.saw.slice(0, 3).join("; ")}.`);
  if (a.missed.length) parts.push(`You missed: ${a.missed.slice(0, 3).join("; ")}.`);
  if (a.assumed.length) parts.push(`You assumed: ${a.assumed.slice(0, 2).join("; ")}.`);
  parts.push(`The one thing: ${a.oneThing}`);
  parts.push(`[The full debrief](/after-action)`);
  return parts.join("\n\n");
}

/** After a Think First prompt, the user offered a read. Without a model the Curator can only note its shape. */
function attemptProse(text: string): string {
  const t = text.toLowerCase();
  const hasEvidence = /\b(because|since|noticed|saw|heard|said|matched|specific|timeline|calendar|evidence)\b/.test(t);
  const hasAlternative = /\b(alternatively|or (it|he|she|they)|unless|another explanation|could also|might instead|the other)\b/.test(t);
  const hasDoubt = /\b(not sure|uncertain|might be wrong|could be wrong|maybe|possibly|i'?m not certain|would change my mind)\b/.test(t);
  const parts = ["That is a read I can work with, and it is on the record as an attempt made before the answer."];
  const notes: string[] = [];
  if (hasEvidence) notes.push("you cited evidence rather than impressions");
  else notes.push("it names a conclusion but not the observations behind it");
  if (hasAlternative) notes.push("you considered an alternative");
  else notes.push("no rival explanation appears yet");
  if (hasDoubt) notes.push("you left room to be wrong");
  parts.push(`Its shape: ${notes.join("; ")}.`);
  parts.push("Without a model I cannot weigh it for you. Take it into the Inference room and test it against a base rate, or connect a model in Settings and I will argue with it here.");
  parts.push("[Inference](/inference) · [Settings](/settings)");
  return parts.join("\n\n");
}

function unknownProse(mode: CuratorMode): string {
  const byMode: Partial<Record<CuratorMode, string>> = {
    teach: "Ask me to explain any Archive entry by name, for instance \"explain the Printing Press\" or \"why does the Bosporus matter\".",
    review: "Try \"how am I doing\", \"what patterns keep showing up\" or \"debrief my last case\".",
    remember: "Try \"what is due\" or ask me to explain an entry and then test you on it later.",
    explore: "Try \"tell me something interesting\" or name an Archive entry.",
  };
  return [
    "No model is connected, so I can only read the record, not reason with you. Connect one in Settings for the full consultation.",
    byMode[mode] ?? "Offline I can still answer three things well: \"what should I work on\", \"how am I doing\", and \"explain <an Archive entry>\". \"What is due\" and \"debrief my last case\" also work.",
    "[Settings](/settings)",
  ].join("\n\n");
}

/** Recognises knowledge questions, used to decide when a model reply is worth saving. */
export function looksLikeKnowledgeQuestion(text: string): boolean {
  const t = text.trim().toLowerCase();
  return /^(explain|define|describe|tell me about|what is|what was|what are|who was|who is|why does .+ matter|how did .+ (work|start|begin))\b/.test(t) || !!matchArchive(text);
}

export function suggestedTitleFrom(text: string): string {
  const m = matchArchive(text);
  if (m) return m.title;
  const cleaned = text
    .trim()
    .replace(/^(explain|define|describe|tell me about|what is|what was|what are|who was|who is)\s+/i, "")
    .replace(/\?+$/, "")
    .replace(/^why does\s+/i, "")
    .replace(/\s+matter$/i, "");
  const t = cleaned.slice(0, 60).trim();
  return t ? t[0].toUpperCase() + t.slice(1) : "Untitled";
}
