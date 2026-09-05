import type { Investigation } from "@/lib/domain/types";
import type { InvestigationTemplate } from "@/lib/domain/content";
import { stamp } from "@/lib/persistence/store";

/** Deterministic devil's advocate: questions that attack the strongest claim from different angles. */
const CHALLENGES = [
  (c: string) => `What would you expect to see if "${c}" were false, and have you looked for it?`,
  (c: string) => `Who benefits from "${c}" being widely believed, and did any of your sources come from them?`,
  (c: string) => `Which single source is doing most of the work behind "${c}", and how do you know it is independent of the others?`,
  (c: string) => `If "${c}" is true, what else must be true, and is there evidence for that too?`,
  (c: string) => `Is "${c}" a claim about causes or about correlations, and would a reader be able to tell?`,
  (c: string) => `What is the strongest version of the case against "${c}", stated so its defenders would recognise it?`,
  (c: string) => `How would "${c}" have looked to someone writing fifty years ago, and why did they see it differently?`,
  (c: string) => `Which piece of evidence for "${c}" would you drop first if you had to, and does the claim survive without it?`,
];

const SUPPORT_RANK = { strong: 3, moderate: 2, weak: 1, contested: 0 } as const;

export function strongestClaim(inv: Investigation) {
  return [...inv.claims].sort((a, b) => SUPPORT_RANK[b.support] - SUPPORT_RANK[a.support])[0];
}

/** Two challenges for the strongest claim, chosen by how many have already been asked. */
export function devilsAdvocate(inv: Investigation): string[] {
  const target = strongestClaim(inv);
  if (!target) return ["Write down one claim you believe about this question. The devil needs something to argue with."];
  const asked = inv.openQuestions.length + inv.notes.length;
  const short = target.text.length > 90 ? target.text.slice(0, 87).trimEnd() + "…" : target.text.replace(/\.$/, "");
  const a = CHALLENGES[asked % CHALLENGES.length]!(short);
  const b = CHALLENGES[(asked + 3) % CHALLENGES.length]!(short);
  return [a, b];
}

/** Share of weight on claims versus counterclaims, 0..1 (0.5 is balanced). */
export function balance(inv: Investigation): number {
  const claims = inv.claims.reduce((s, c) => s + 1 + SUPPORT_RANK[c.support] / 3, 0);
  const counters = inv.counterclaims.length * 1.5;
  const total = claims + counters;
  return total ? claims / total : 0.5;
}

export function parseConfidence(position?: string): number | null {
  const m = position?.match(/\(confidence (\d{1,3})%\)\s*$/);
  return m ? Math.min(99, Math.max(1, Number(m[1]))) / 100 : null;
}

export function stripConfidence(position?: string): string {
  return (position ?? "").replace(/\s*\(confidence \d{1,3}%\)\s*$/, "");
}

export function withConfidence(text: string, confidence: number | null): string {
  const base = stripConfidence(text).trimEnd();
  return confidence === null ? base : `${base} (confidence ${Math.round(confidence * 100)}%)`;
}

export function fromTemplate(userId: string, t: InvestigationTemplate): Investigation {
  return stamp<Investigation>(userId, "inv", {
    title: t.title,
    question: t.question,
    whyItMatters: t.whyItMatters,
    threads: t.threads.map((x) => ({ ...x })),
    sources: t.sources.map((x) => ({ ...x })),
    claims: t.startingClaims.map((x) => ({ ...x })),
    counterclaims: t.startingCounterclaims.map((x) => ({ ...x })),
    notes: [],
    archiveConnections: [...t.archiveConnections],
    openQuestions: [...t.openQuestions],
    status: "open",
    templateId: t.id,
  });
}

export function blank(userId: string, input: { title: string; question: string; whyItMatters: string }): Investigation {
  return stamp<Investigation>(userId, "inv", {
    ...input,
    threads: [],
    sources: [],
    claims: [],
    counterclaims: [],
    notes: [],
    archiveConnections: [],
    openQuestions: [],
    status: "open",
  });
}

export function daysOpen(inv: Investigation): number {
  return Math.max(0, Math.floor((Date.now() - new Date(inv.createdAt).getTime()) / 86400000));
}

export function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Synthesis quality from structure: sections present, contested claims acknowledged, a change-my-mind condition. */
export function synthesisScore(inv: Investigation, s: { supports: string; contested: string; position: string; changeMind: string }): { score: number; notes: string[] } {
  const words = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;
  const notes: string[] = [];
  let score = 0;
  if (words(s.supports) >= 30) score += 0.25;
  else notes.push("The evidence section is thin; name the two or three findings that carry the weight.");
  if (words(s.contested) >= 20) score += 0.25;
  else notes.push("Say what remains contested. A synthesis that settles everything is usually hiding something.");
  if (words(s.position) >= 15) score += 0.2;
  else notes.push("State your position in a sentence a stranger could disagree with.");
  if (words(s.changeMind) >= 10) score += 0.2;
  else notes.push("Name what would change your mind. Without it the position is a mood.");
  if (inv.counterclaims.length && /(however|but|although|against|counter|objection)/i.test(s.supports + " " + s.contested)) score += 0.1;
  else if (inv.counterclaims.length) notes.push("You recorded counterclaims; the synthesis should meet at least one of them.");
  return { score: Math.min(1, score), notes };
}
