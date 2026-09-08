/**
 * THE STUDY V2 — the error library.
 *
 * Every wrong answer that reaches a write path becomes an `ErrorRecord` with a
 * recurrence key (`category:primaryConcept`). `recurringErrors` finds keys that
 * repeat across days and phrases them as one plain sentence; `remediationPlanItem`
 * turns a recurrence into a Today plan item that opens a remediation session.
 */
import type { DomainId, ErrorCategory, SkillArea } from "./content-types";
import type { Entity, ErrorRecord, PlanItem } from "./types";
import type { StudyDatabase } from "@/lib/persistence/store";
import { stamp } from "@/lib/persistence/store";
import { conceptContent } from "@/content/v2";

const DAY_MS = 86_400_000;

export const ERROR_CATEGORY_META: Record<ErrorCategory, { label: string; description: string; remedy: string }> = {
  KNOWLEDGE_GAP: {
    label: "Knowledge gap",
    description: "A fact, definition or result that was needed was not there to recall.",
    remedy: "Read the concept summary, then schedule the missing fact for retrieval so it is tested again after a delay.",
  },
  CONCEPTUAL_ERROR: {
    label: "Conceptual error",
    description: "The idea was applied in a way it does not work: the wrong rule, or the right rule in the wrong place.",
    remedy: "Rework the worked example, state the rule in your own words, and attempt two varied items before moving on.",
  },
  ALGEBRA_ERROR: {
    label: "Algebra or arithmetic slip",
    description: "The method was right but a sign, a power of ten or a manipulation went wrong.",
    remedy: "Check the answer against a rough estimate before submitting, and write each rearrangement on its own line.",
  },
  LOGIC_ERROR: {
    label: "Logic error",
    description: "An inference did not follow: a conditional read backwards, a quantifier shifted, a fallacy accepted.",
    remedy: "Write the argument as premises and conclusion, then test the form with a counterexample.",
  },
  CAUSAL_ERROR: {
    label: "Causal error",
    description: "Correlation, sequence or association was read as cause without ruling out the alternatives.",
    remedy: "For each claim, name the confounder, reverse causation and selection story that would also produce the data.",
  },
  BASE_RATE_NEGLECT: {
    label: "Base-rate neglect",
    description: "The prior probability was ignored in favour of the vivid evidence.",
    remedy: "Start from a population of 1,000, apply the base rate first, then the test accuracy, and count.",
  },
  STATISTICAL_ERROR: {
    label: "Statistical error",
    description: "A sample, a variance, a significance threshold or a regression effect was misread.",
    remedy: "Ask what the sampling distribution looks like and how large the sample is before trusting a figure.",
  },
  MISREAD: {
    label: "Misread the question",
    description: "The answer addressed a different question from the one asked.",
    remedy: "Restate the question in one line, including what quantity and what units are wanted, before working.",
  },
  ASSUMPTION: {
    label: "Unstated assumption",
    description: "The answer relied on something the problem did not give.",
    remedy: "List every assumption you are making and check each against the wording.",
  },
  OVERCONFIDENCE: {
    label: "Overconfidence",
    description: "Wrong, and sure of it.",
    remedy: "Before committing, name one way the answer could be wrong; lower stated confidence when you cannot rule it out.",
  },
  UNDERCONFIDENCE: {
    label: "Underconfidence",
    description: "Right, but unsure.",
    remedy: "Notice which cues made you hesitate; where the method is sound, commit at the confidence the method warrants.",
  },
  EVIDENCE_ERROR: {
    label: "Evidence error",
    description: "The weight, relevance or provenance of evidence was misjudged.",
    remedy: "Grade each piece of evidence for source, independence and diagnosticity before combining them.",
  },
  PRECISION_ERROR: {
    label: "Precision error",
    description: "Units, percentages versus fractions, rounding or significant figures went astray.",
    remedy: "Carry the unit through every line and state the answer in the form the question asked for.",
  },
  TRANSFER_FAILURE: {
    label: "Transfer failure",
    description: "The concept is known in its taught form but was not recognised in a new setting.",
    remedy: "Describe the structure of the problem without its surface details, then ask which known concept has that structure.",
  },
};

export type NewErrorRecord = Omit<ErrorRecord, keyof Entity | "recurrenceKey">;

export function recurrenceKeyFor(category: ErrorCategory, primaryConcept?: string): string {
  return `${category}:${primaryConcept ?? "general"}`;
}

export async function recordError(db: StudyDatabase, input: NewErrorRecord, now: Date = new Date()): Promise<ErrorRecord> {
  const record = stamp<ErrorRecord>(db.userId, "err", { ...input, recurrenceKey: recurrenceKeyFor(input.category, input.concepts[0]) });
  record.createdAt = now.toISOString();
  record.updatedAt = record.createdAt;
  await db.store("error_records").put(record);
  return record;
}

export interface Recurrence {
  key: string;
  category: ErrorCategory;
  conceptId?: string;
  /** The skill most of the records belong to. */
  skill: SkillArea;
  count: number;
  /** Distinct calendar days on which the error occurred. */
  days: number;
  firstAt: string;
  lastAt: string;
  /** "You have confused necessary and sufficient conditions four times across three weeks." */
  message: string;
}

const COUNT_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

function countWord(n: number): string {
  return COUNT_WORDS[n] ?? String(n);
}

function spanPhrase(firstAt: string, lastAt: string, distinctDays: number): string {
  const diff = Math.max(0, new Date(lastAt).getTime() - new Date(firstAt).getTime());
  const spanDays = Math.max(distinctDays, Math.round(diff / DAY_MS) + 1);
  if (spanDays >= 14) {
    const weeks = Math.max(2, Math.round(spanDays / 7));
    return `${countWord(weeks)} weeks`;
  }
  return `${countWord(spanDays)} days`;
}

function humanise(id: string): string {
  return id.replace(/[-_]+/g, " ").trim();
}

function conceptTitle(conceptId?: string): string | undefined {
  if (!conceptId) return undefined;
  const title = conceptContent(conceptId)?.title ?? humanise(conceptId);
  return title.charAt(0).toLowerCase() + title.slice(1);
}

/** The verb phrase for a category, with the concept woven in when there is one. */
function deed(category: ErrorCategory, concept?: string): string {
  const on = concept ? ` ${concept}` : "";
  const inTopic = concept ? ` in ${concept}` : "";
  switch (category) {
    case "KNOWLEDGE_GAP":
      return concept ? `been unable to recall a fact about ${concept}` : "been unable to recall a needed fact";
    case "CONCEPTUAL_ERROR":
      return concept ? `misapplied ${concept}` : "misapplied a concept";
    case "ALGEBRA_ERROR":
      return `slipped in the algebra${inTopic}`;
    case "LOGIC_ERROR":
      return `drawn an inference that does not follow${inTopic}`;
    case "CAUSAL_ERROR":
      return `read correlation as cause${inTopic}`;
    case "BASE_RATE_NEGLECT":
      return `neglected the base rate${inTopic}`;
    case "STATISTICAL_ERROR":
      return `misread the statistics${inTopic}`;
    case "MISREAD":
      return `answered a different question from the one asked${inTopic}`;
    case "ASSUMPTION":
      return `relied on an unstated assumption${inTopic}`;
    case "OVERCONFIDENCE":
      return concept ? `been confidently wrong about ${concept}` : "been confidently wrong";
    case "UNDERCONFIDENCE":
      return concept ? `been right but unsure about ${concept}` : "been right but unsure";
    case "EVIDENCE_ERROR":
      return `misjudged the weight of evidence${inTopic}`;
    case "PRECISION_ERROR":
      return `lost precision in units, percentages or rounding${inTopic}`;
    case "TRANSFER_FAILURE":
      return concept ? `failed to recognise ${concept} in a new setting` : `failed to carry a concept into a new setting${on}`;
  }
}

export function recurrenceMessage(r: Pick<Recurrence, "category" | "conceptId" | "count" | "days" | "firstAt" | "lastAt">): string {
  return `You have ${deed(r.category, conceptTitle(r.conceptId))} ${countWord(r.count)} times across ${spanPhrase(r.firstAt, r.lastAt, r.days)}.`;
}

function dominantSkill(records: ErrorRecord[]): SkillArea {
  const counts = new Map<SkillArea, number>();
  for (const r of records) counts.set(r.skill, (counts.get(r.skill) ?? 0) + 1);
  let best: SkillArea = records[0]!.skill;
  let bestCount = 0;
  for (const [skill, n] of counts) {
    if (n > bestCount) {
      best = skill;
      bestCount = n;
    }
  }
  return best;
}

/**
 * Recurrence keys with at least `min` records inside the window, spread over at least two
 * calendar days. Records already remediated are ignored. Most frequent first, then most recent.
 */
export async function recurringErrors(db: StudyDatabase, o: { windowDays?: number; min?: number; now?: Date } = {}): Promise<Recurrence[]> {
  const windowDays = o.windowDays ?? 21;
  const min = Math.max(1, o.min ?? 3);
  const now = o.now ?? new Date();
  const since = now.getTime() - windowDays * DAY_MS;
  const records = await db.store("error_records").list({
    filter: (r) => {
      const t = new Date(r.createdAt).getTime();
      return t >= since && t <= now.getTime() && !r.remediatedAt;
    },
  });
  const groups = new Map<string, ErrorRecord[]>();
  for (const r of records) {
    const list = groups.get(r.recurrenceKey) ?? [];
    list.push(r);
    groups.set(r.recurrenceKey, list);
  }
  const out: Recurrence[] = [];
  for (const [key, list] of groups) {
    if (list.length < min) continue;
    const sorted = [...list].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const days = new Set(sorted.map((r) => r.createdAt.slice(0, 10))).size;
    if (days < 2) continue;
    const first = sorted[0]!;
    const last = sorted[sorted.length - 1]!;
    const conceptId = first.concepts[0];
    const partial = { key, category: first.category, conceptId, count: sorted.length, days, firstAt: first.createdAt, lastAt: last.createdAt };
    out.push({ ...partial, skill: dominantSkill(sorted), message: recurrenceMessage(partial) });
  }
  return out.sort((a, b) => b.count - a.count || b.lastAt.localeCompare(a.lastAt) || a.key.localeCompare(b.key));
}

const DOMAIN_SKILL: Partial<Record<DomainId, SkillArea>> = {
  mathematics: "mathematics",
  probability: "probability",
  statistics: "statistics",
  logic: "logic",
  causal_reasoning: "causal_reasoning",
  decision_science: "decision_making",
  communication: "writing",
  computer_science: "programming",
};

/** The Train skill a remediation session should open for a recurrence. */
export function remediationSkill(r: Pick<Recurrence, "conceptId" | "skill" | "category">): SkillArea {
  const domain = r.conceptId ? conceptContent(r.conceptId)?.domainId : undefined;
  if (domain && DOMAIN_SKILL[domain]) return DOMAIN_SKILL[domain]!;
  if (r.skill) return r.skill;
  switch (r.category) {
    case "LOGIC_ERROR":
      return "logic";
    case "CAUSAL_ERROR":
      return "causal_reasoning";
    case "BASE_RATE_NEGLECT":
      return "probability";
    case "STATISTICAL_ERROR":
      return "statistics";
    case "ALGEBRA_ERROR":
    case "PRECISION_ERROR":
      return "mathematics";
    default:
      return "knowledge";
  }
}

/** → /train/<skill>/practice?concept=<id>&remediate=<key> */
export function remediationPlanItem(r: Recurrence): Omit<PlanItem, "id" | "status"> {
  const skill = remediationSkill(r);
  const meta = ERROR_CATEGORY_META[r.category];
  const params = new URLSearchParams();
  if (r.conceptId) params.set("concept", r.conceptId);
  params.set("remediate", r.key);
  const concept = r.conceptId ? conceptContent(r.conceptId)?.title ?? humanise(r.conceptId) : undefined;
  return {
    kind: "remediate",
    title: concept ? `Remediate: ${meta.label.toLowerCase()} in ${concept}` : `Remediate: ${meta.label.toLowerCase()}`,
    minutes: 15,
    href: `/train/${skill}/practice?${params.toString()}`,
    refId: r.key,
    conceptIds: r.conceptId ? [r.conceptId] : undefined,
    reason: "recurring_error",
    reasonText: `${r.message} ${meta.remedy}`,
    priority: 3,
  };
}

/** Marks every record with the recurrence key as studied. Returns the number updated. */
export async function markRemediated(db: StudyDatabase, key: string, now: Date = new Date()): Promise<number> {
  const store = db.store("error_records");
  const records = await store.list({ filter: (r) => r.recurrenceKey === key && !r.remediatedAt });
  const at = now.toISOString();
  for (const r of records) await store.update(r.id, { remediatedAt: at });
  return records.length;
}
