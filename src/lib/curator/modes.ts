import type { CuratorMode } from "@/lib/domain/types";

export interface CuratorModeMeta {
  id: CuratorMode;
  label: string;
  /** One line, shown in the mode rail */
  description: string;
  /** Three suggested openers */
  openers: string[];
  /** What the Curator does in this mode; goes to the model as part of the context */
  stance: string;
}

export const CURATOR_MODES: CuratorModeMeta[] = [
  {
    id: "observe",
    label: "Observe",
    description: "Separate what you saw from what you concluded.",
    openers: ["Here is what I noticed in a meeting today. Tell me which parts are observation.", "How do I get better at noticing what is missing from a scene?", "What is the difference between a detail and a signal?"],
    stance: "Press the user to distinguish observation from interpretation. Ask what exactly was seen or heard before allowing any conclusion.",
  },
  {
    id: "reason",
    label: "Reason",
    description: "Test an inference against its alternatives.",
    openers: ["I have a hypothesis about why a colleague went quiet. Here is my evidence.", "What would change my mind about this: ", "Walk me through how a base rate should shape this judgement."],
    stance: "Work through hypotheses, alternatives, base rates and what evidence would discriminate. Never hand over the answer before the user has offered a read.",
  },
  {
    id: "question",
    label: "Question",
    description: "Find the question that would actually move you.",
    openers: ["I am meeting someone who is reluctant to tell me something. What should I ask?", "Which of these three questions has the most information value?", "Turn this leading question into an open one: "],
    stance: "Help the user find questions with high information value and low leading pressure. Contrast open, closed, discriminating and leading questions.",
  },
  {
    id: "teach",
    label: "Teach",
    description: "Learn something properly, then keep it.",
    openers: ["Explain the Printing Press and why it matters.", "What is Bayes' theorem, in plain terms?", "Why does the Bosporus matter?"],
    stance: "Explain clearly with what, why, before, after and connections. Offer to save the explanation to the Archive and to test it later.",
  },
  {
    id: "challenge",
    label: "Challenge",
    description: "Have a belief pushed on by someone unimpressed.",
    openers: ["I think remote work is obviously better for deep work. Push back.", "Here is a decision I am proud of. Find the weakness.", "What would a sceptic say about my plan?"],
    stance: "Find the weakest link in the user's argument and press on it. Respectful, unsentimental, specific.",
  },
  {
    id: "debate",
    label: "Debate",
    description: "Argue a position, then steelman the other side.",
    openers: ["Argue that central banks should not target inflation at all.", "Take the side that the Reformation was mainly economic, not theological.", "Steelman the case against containerisation."],
    stance: "Take the assigned side with the strongest honest arguments, then require the user to steelman the opposing view before concluding.",
  },
  {
    id: "strategize",
    label: "Strategize",
    description: "Think three moves ahead, not one.",
    openers: ["I am negotiating a salary. What are the counterparty's incentives?", "What is the second-order effect of this policy: ", "Run a premortem on a decision I am about to make."],
    stance: "Map actors, incentives, constraints and second-order effects. Ask what the other side does next.",
  },
  {
    id: "review",
    label: "Review",
    description: "Look at your record honestly.",
    openers: ["How am I doing?", "What patterns keep showing up in my mistakes?", "Debrief my last case with me."],
    stance: "Use the real record: faculties, threads, after-actions. Name one or two things, not ten. Never flatter.",
  },
  {
    id: "explore",
    label: "Explore",
    description: "Follow a thread you did not know you had.",
    openers: ["Tell me something interesting.", "What connects the Silk Road to fiat money?", "Where should my curiosity go next?"],
    stance: "Pull on connections across the Archive and the user's interests. Prefer the surprising, accurate and useful over the merely trivia-like.",
  },
  {
    id: "remember",
    label: "Remember",
    description: "Check what is due and what is slipping.",
    openers: ["What is due?", "Quiz me on something I saved last week.", "What have I read in the Archive that I have not retained?"],
    stance: "Attend to retention: what is due, what is at risk, what was read but never tested. Offer to schedule recall.",
  },
];

export const CURATOR_MODE_IDS = CURATOR_MODES.map((m) => m.id);

export function modeMeta(id: CuratorMode): CuratorModeMeta {
  return CURATOR_MODES.find((m) => m.id === id) ?? CURATOR_MODES[0];
}

export function isCuratorMode(x: string | null | undefined): x is CuratorMode {
  return !!x && CURATOR_MODE_IDS.includes(x as CuratorMode);
}
