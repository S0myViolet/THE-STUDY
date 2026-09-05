import type { RhetoricMode, RhetoricPrompt } from "@/lib/domain/types";
import type { SubskillId } from "@/lib/domain/faculties";

/**
 * The eleven Rhetoric modes: how each is introduced, how it is composed,
 * and which subskill it evidences when a prompt does not say otherwise.
 */
export interface ModeMeta {
  id: RhetoricMode;
  title: string;
  /** One line under the title on the index and mode page. */
  blurb: string;
  /** The instruction line above the response field. */
  instruction: string;
  /** Free writing, or prep-then-response against the clock. */
  timed: boolean;
  /** Serif response field (prose) or sans (working text). */
  serif: boolean;
  /** Rows for the response field. */
  rows: number;
  /** Default subskill when a generated prompt does not carry one. */
  subskill: SubskillId;
  minutes: number;
}

export const MODE_META: Record<RhetoricMode, ModeMeta> = {
  one_sentence: {
    id: "one_sentence",
    title: "One Sentence",
    blurb: "Explain a thing in a single sentence that someone could repeat back.",
    instruction: "One sentence. No semicolons, no jargon.",
    timed: false,
    serif: true,
    rows: 3,
    subskill: "rhetoric.concision",
    minutes: 3,
  },
  thirty_seconds: {
    id: "thirty_seconds",
    title: "Thirty Seconds",
    blurb: "A short time to think, thirty seconds to say it. The field locks when the clock stops.",
    instruction: "Speak or type. Finish on a complete sentence.",
    timed: true,
    serif: true,
    rows: 5,
    subskill: "rhetoric.concision",
    minutes: 3,
  },
  three_people: {
    id: "three_people",
    title: "Three People",
    blurb: "The same idea for a child, an expert and a sceptic. The content changes, not just the words.",
    instruction: "Three versions. Each fitted to what its listener knows and cares about.",
    timed: false,
    serif: true,
    rows: 4,
    subskill: "rhetoric.explanation",
    minutes: 8,
  },
  story: {
    id: "story",
    title: "Story",
    blurb: "Turn a fact into a scene with a person, a moment and an ending.",
    instruction: "One scene, not a summary. Keep it true.",
    timed: false,
    serif: true,
    rows: 9,
    subskill: "rhetoric.storytelling",
    minutes: 8,
  },
  anecdote: {
    id: "anecdote",
    title: "Anecdote",
    blurb: "A dinner-table version of an event: a turn, and a last line that lands.",
    instruction: "Short, true, with a turn. End on the line that lands.",
    timed: false,
    serif: true,
    rows: 8,
    subskill: "rhetoric.storytelling",
    minutes: 6,
  },
  analogy: {
    id: "analogy",
    title: "Analogy",
    blurb: "Find the thing it is like, map the parts, and say where the likeness breaks.",
    instruction: "Map the parts. Then name the point where the analogy stops working.",
    timed: false,
    serif: true,
    rows: 7,
    subskill: "rhetoric.analogy",
    minutes: 6,
  },
  argument: {
    id: "argument",
    title: "Argument",
    blurb: "A claim, reasons with evidence, the strongest objection, and an answer to it.",
    instruction: "Claim, reasons, objection, answer. A reader should be able to restate it in one breath.",
    timed: false,
    serif: true,
    rows: 10,
    subskill: "rhetoric.argument",
    minutes: 10,
  },
  steelman: {
    id: "steelman",
    title: "Steelman",
    blurb: "A weak version of a view you may not hold. Write the strongest version its defenders would sign.",
    instruction: "Drop the sneers, keep the strongest claims, add the arguments the original missed.",
    timed: false,
    serif: true,
    rows: 9,
    subskill: "rhetoric.argument",
    minutes: 10,
  },
  precision: {
    id: "precision",
    title: "Precision",
    blurb: "Cut a padded passage to its facts. Shorter, exact, no hedges, nothing lost.",
    instruction: "Every fact survives. Every hedge that adds nothing goes.",
    timed: false,
    serif: false,
    rows: 6,
    subskill: "rhetoric.precision",
    minutes: 6,
  },
  question: {
    id: "question",
    title: "Question",
    blurb: "The single best question to ask, and why it is worth the other person's time.",
    instruction: "Open, not leading. Aim at what a search engine could not tell you.",
    timed: false,
    serif: true,
    rows: 6,
    subskill: "rhetoric.precision",
    minutes: 5,
  },
  impromptu: {
    id: "impromptu",
    title: "Impromptu",
    blurb: "A question you did not choose. Brief preparation, then speak until the clock stops.",
    instruction: "Take a side early. Two reasons, the strongest objection, a deliberate close.",
    timed: true,
    serif: true,
    rows: 8,
    subskill: "rhetoric.argument",
    minutes: 4,
  },
};

export const MODES: RhetoricMode[] = [
  "one_sentence",
  "thirty_seconds",
  "three_people",
  "story",
  "anecdote",
  "analogy",
  "argument",
  "steelman",
  "precision",
  "question",
  "impromptu",
];

export function isMode(s: string | undefined): s is RhetoricMode {
  return !!s && (MODES as string[]).includes(s);
}

/** Labels for the three listeners in three_people prompts. Seeded prompts name specific people. */
const AUDIENCES: Record<string, [string, string, string]> = {
  "rh-three-people-inflation": ["The ten-year-old", "The bakery owner", "The retired economist"],
  "rh-three-people-falsifiability": ["The fourteen-year-old", "The nurse", "The sceptical lawyer"],
};

export function audiencesFor(prompt: RhetoricPrompt): [string, string, string] {
  return AUDIENCES[prompt.id] ?? ["The child", "The expert", "The sceptic"];
}

/** A short line describing the constraints of a prompt: "35 words · 1 sentence" */
export function constraintLine(prompt: RhetoricPrompt): string {
  const c = prompt.constraints ?? {};
  const parts: string[] = [];
  if (c.prepSeconds) parts.push(`${c.prepSeconds}s to think`);
  if (c.responseSeconds) parts.push(`${c.responseSeconds}s to answer`);
  if (c.maxWords) parts.push(`under ${c.maxWords} words`);
  if (c.maxSentences) parts.push(`${c.maxSentences} sentence${c.maxSentences === 1 ? "" : "s"}`);
  return parts.join(" · ");
}

/** Default constraints applied when a generated prompt leaves them out. */
export function defaultConstraints(mode: RhetoricMode): NonNullable<RhetoricPrompt["constraints"]> {
  switch (mode) {
    case "one_sentence":
      return { maxWords: 35, maxSentences: 1 };
    case "thirty_seconds":
      return { maxWords: 90, prepSeconds: 20, responseSeconds: 30 };
    case "three_people":
      return { maxWords: 180, maxSentences: 9 };
    case "story":
      return { maxWords: 150 };
    case "anecdote":
      return { maxWords: 120 };
    case "analogy":
      return { maxWords: 130 };
    case "argument":
      return { maxWords: 200 };
    case "steelman":
      return { maxWords: 180 };
    case "precision":
      return { maxWords: 60 };
    case "question":
      return { maxWords: 150, maxSentences: 9 };
    case "impromptu":
      return { maxWords: 230, prepSeconds: 20, responseSeconds: 60 };
  }
}
