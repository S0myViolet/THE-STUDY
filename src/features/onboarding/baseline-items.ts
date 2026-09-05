import type { SubskillId } from "@/lib/domain/faculties";
import type { PersonCard } from "@/lib/domain/content";

/**
 * The baseline: eight short challenges after the first case. Each is
 * self-contained so the entrance never depends on the seeded rooms.
 * Values are 0..1 quality, not right/wrong; "insufficient evidence" can be the best answer.
 */

export interface ScoredOption {
  id: string;
  label: string;
  value: number;
  note: string;
}

/* ---------------- Inference ---------------- */

export const BASELINE_INFERENCE = {
  id: "bl-inference",
  subskill: "inference.alternatives" as SubskillId,
  followSubskill: "inference.information_value" as SubskillId,
  difficulty: 3,
  situation:
    "A colleague who is usually the first to arrive is not at her desk at 09:40. Her coat is on the chair, her laptop is open and unlocked, and a half-finished coffee is beside it. Her phone is not on the desk.",
  prompt: "Which explanation is most likely, given only this?",
  options: [
    { id: "meeting", label: "She has stepped into a meeting or a call nearby and took her phone with her.", value: 1, note: "Fits every detail with the most ordinary cause: coat and laptop stay, phone goes." },
    { id: "ill", label: "She felt unwell and went home.", value: 0.3, note: "Possible, but she would usually take her coat and lock the laptop." },
    { id: "fired", label: "Something serious has happened; she left in a hurry.", value: 0.15, note: "Dramatic explanations need evidence the scene does not provide." },
    { id: "unknown", label: "Cannot say; the evidence supports several stories about equally.", value: 0.55, note: "Defensible, though one story fits noticeably better than the others." },
  ] as ScoredOption[],
  followPrompt: "You may check one thing. Which would most narrow the possibilities?",
  followOptions: [
    { id: "calendar", label: "Her shared calendar for the next hour.", value: 1, note: "Directly separates the ordinary explanation from the rest." },
    { id: "coffee", label: "Whether the coffee is still warm.", value: 0.5, note: "Tells you how long she has been gone, not where." },
    { id: "ask", label: "Ask the person at the next desk whether she seemed upset.", value: 0.35, note: "An interpretation from someone else, and a leading question." },
    { id: "wait", label: "Wait ten minutes and see.", value: 0.45, note: "Cheap, but it gathers no information you can act on." },
  ] as ScoredOption[],
};

/* ---------------- Questioning ---------------- */

export const BASELINE_QUESTION = {
  id: "bl-question",
  subskill: "social.question_quality" as SubskillId,
  difficulty: 3,
  situation:
    "A supplier's account manager says the delayed shipment 'should be with you by the end of next week'. You have one question before the call ends.",
  prompt: "Which question is most useful?",
  options: [
    { id: "date", label: "What specifically has to happen before it ships, and which of those steps is not yet done?", value: 1, note: "Turns a vague promise into checkable facts and exposes the real bottleneck." },
    { id: "promise", label: "Can you promise it will arrive by Friday?", value: 0.3, note: "Invites a reassurance, not information." },
    { id: "why", label: "Why is it late?", value: 0.6, note: "Reasonable, but backward-looking; the story will be polished." },
    { id: "blame", label: "Is this your fault or the carrier's?", value: 0.15, note: "Adversarial and low value; it costs rapport for an answer you cannot verify." },
    { id: "alt", label: "If it slips again, what is the earliest you would know?", value: 0.75, note: "Good second question: it buys warning time." },
  ] as ScoredOption[],
};

/* ---------------- Memory ---------------- */

export const BASELINE_PEOPLE: PersonCard[] = [
  { id: "bl-ppl-1", name: "Leila Haddad", profession: "Marine biologist", origin: "Beirut", interest: "Restoring old radios", detail: "Wears a diving watch on the right wrist." },
  { id: "bl-ppl-2", name: "Oskar Lindqvist", profession: "Pastry chef", origin: "Gothenburg", interest: "Chess by post", detail: "Always carries a green notebook." },
  { id: "bl-ppl-3", name: "Priya Raman", profession: "Patent lawyer", origin: "Chennai", interest: "Long-distance cycling", detail: "Drinks tea with no milk, two sugars." },
  { id: "bl-ppl-4", name: "Daniel Okoro", profession: "Sound engineer", origin: "Lagos", interest: "Birdwatching", detail: "Left-handed; writes with a fountain pen." },
];

export const BASELINE_MEMORY = {
  id: "bl-memory",
  subskill: "memory.names" as SubskillId,
  detailSubskill: "memory.recall" as SubskillId,
  difficulty: 3,
  studySeconds: 45,
};

/* ---------------- Strategy ---------------- */

export const BASELINE_STRATEGY = {
  id: "bl-strategy",
  subskill: "strategy.incentives" as SubskillId,
  secondSubskill: "strategy.second_order" as SubskillId,
  difficulty: 3,
  situation:
    "You run a small cafe. A larger chain opens across the road and prices its coffee twenty percent below yours. Your regulars are loyal but not infinitely so. The chain's manager is under pressure to show growth in the first quarter.",
  prompt: "What is your first move?",
  options: [
    { id: "match", label: "Match the price cut immediately.", value: 0.25, note: "A price war favours the side with deeper pockets, and the chain has them." },
    { id: "wait", label: "Hold price, sharpen what they cannot copy (speed, names, the room), and watch their first quarter.", value: 1, note: "Their incentive is a launch number; yours is the year. Time is on your side if regulars stay." },
    { id: "loyalty", label: "Launch a stamp-card scheme for regulars.", value: 0.6, note: "Sensible and cheap, but it is a copyable move and does not read their incentives." },
    { id: "complain", label: "Write to the landlord and the local paper about unfair competition.", value: 0.2, note: "Costs attention, changes nothing about the customer's morning." },
  ] as ScoredOption[],
  secondPrompt: "If you match the price cut, what is the most likely second-order effect?",
  secondOptions: [
    { id: "margin", label: "Your margin falls and the chain's launch number improves anyway, because they measure footfall not your profit.", value: 1, note: "Second-order: your move feeds their metric without protecting yours." },
    { id: "win", label: "The chain retreats.", value: 0.15, note: "Unlikely; a chain's first quarter is not decided by one cafe's price." },
    { id: "regulars", label: "Regulars appreciate the loyalty and spend more.", value: 0.3, note: "Cheaper coffee rarely raises spend per visit." },
    { id: "nothing", label: "Nothing much changes either way.", value: 0.35, note: "Margins are a change, even when the queue looks the same." },
  ] as ScoredOption[],
};

/* ---------------- Explanation ---------------- */

export const BASELINE_EXPLANATION = {
  id: "bl-explanation",
  subskill: "rhetoric.explanation" as SubskillId,
  claritySubskill: "rhetoric.clarity" as SubskillId,
  difficulty: 3,
  prompt: "Explain opportunity cost to a fifteen-year-old in no more than three sentences.",
  maxSentences: 3,
  keyPoints: ["give up|forgo|forego|lose|miss|instead", "choice|choose|decide|pick|spend", "next best|best alternative|other option|could have|would have|otherwise", "cost|price|worth|value"],
  example:
    "Every choice quietly costs you the best thing you did not choose. If you spend Saturday at the match, the opportunity cost is not the ticket but the afternoon with friends you gave up. Good decisions count that hidden price, not just the visible one.",
};

/* ---------------- Calibration ---------------- */

export interface CalibrationClaim {
  id: string;
  claim: string;
  truth: boolean;
  note: string;
}

export const BASELINE_CALIBRATION: { id: string; difficulty: number; claims: CalibrationClaim[] } = {
  id: "bl-calibration",
  difficulty: 3,
  claims: [
    { id: "c1", claim: "The Suez Canal opened before the first transcontinental railway in the United States was completed.", truth: false, note: "The railway was joined in May 1869; the canal opened in November 1869." },
    { id: "c2", claim: "Istanbul is the capital of Turkey.", truth: false, note: "Ankara has been the capital since 1923." },
    { id: "c3", claim: "A standard shipping container is about twelve metres long in its larger common size.", truth: true, note: "The forty-foot container is about 12.2 metres." },
    { id: "c4", claim: "Johann Sebastian Bach and George Frideric Handel were born in the same year.", truth: true, note: "Both in 1685, about 130 kilometres apart; they never met." },
    { id: "c5", claim: "The Black Death reached Europe in the 1240s.", truth: false, note: "It arrived in 1347." },
    { id: "c6", claim: "Under the classical gold standard a country's currency was convertible to a fixed weight of gold.", truth: true, note: "That fixed convertibility is what defined the system." },
  ],
};

/* ---------------- Knowledge ---------------- */

export const BASELINE_KNOWLEDGE = {
  id: "bl-knowledge",
  count: 6,
  startDifficulty: 3,
};

/* ---------------- Glance ---------------- */

export const BASELINE_GLANCE = {
  id: "bl-glance",
  template: "cafe",
  seed: 2210,
  seconds: 12,
  questionCount: 5,
  difficulty: 3,
};

/** Order of the short challenges. The memory recall is deferred so a delay separates study from test. */
export const BASELINE_STEPS = ["glance", "inference", "question", "memory-study", "strategy", "knowledge", "memory-recall", "explanation", "calibration"] as const;
export type BaselineStep = (typeof BASELINE_STEPS)[number];

export const BASELINE_STEP_LABEL: Record<BaselineStep, string> = {
  glance: "A glance",
  inference: "An explanation",
  question: "A question",
  "memory-study": "Four people",
  strategy: "A move",
  knowledge: "Six questions",
  "memory-recall": "Four people, again",
  explanation: "An explanation of yours",
  calibration: "How sure",
};
