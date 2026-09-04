/**
 * The faculty catalog: the twelve primary faculties THE STUDY trains,
 * their subskills, and the level vocabulary used everywhere in the interface.
 *
 * Numbers live underneath. Users mostly see levels, trends and evidence.
 */

export const FACULTIES = [
  "observation",
  "inference",
  "memory",
  "strategy",
  "social",
  "knowledge",
  "rhetoric",
  "quantitative",
  "calibration",
  "composure",
  "synthesis",
  "curiosity",
] as const;

export type FacultyId = (typeof FACULTIES)[number];

export interface FacultyMeta {
  id: FacultyId;
  label: string;
  question: string; // the human question this faculty answers
  description: string;
}

export const FACULTY_META: Record<FacultyId, FacultyMeta> = {
  observation: {
    id: "observation",
    label: "Observation",
    question: "Do I notice what is actually there?",
    description:
      "Detail, spatial arrangement, text, anomalies, chronology and the discipline of not inventing what was never seen.",
  },
  inference: {
    id: "inference",
    label: "Inference",
    question: "Do I reason carefully from incomplete evidence?",
    description:
      "Hypothesis generation, alternatives, causal reasoning, base rates, information value and updating.",
  },
  memory: {
    id: "memory",
    label: "Memory",
    question: "Does what I learn stay with me?",
    description:
      "Working recall, long retention, names and details, sequences, spatial memory and reconstruction.",
  },
  strategy: {
    id: "strategy",
    label: "Strategy",
    question: "Do I think further ahead than the first move?",
    description:
      "Incentives, second-order effects, planning, optionality, adversarial thinking and negotiation.",
  },
  social: {
    id: "social",
    label: "Social intelligence",
    question: "Do I understand what people know, want and avoid?",
    description:
      "Perspective taking, question quality, incentive recognition, ambiguity, rapport and listening.",
  },
  knowledge: {
    id: "knowledge",
    label: "Knowledge",
    question: "Do I know the world broadly enough to connect it?",
    description:
      "History, geography, economics, politics, science, art, literature and how they join together.",
  },
  rhetoric: {
    id: "rhetoric",
    label: "Rhetoric",
    question: "Can I say exactly what I mean, memorably?",
    description:
      "Clarity, concision, argument, explanation, storytelling, analogy and precision.",
  },
  quantitative: {
    id: "quantitative",
    label: "Quantitative reasoning",
    question: "Can I reason with numbers and probabilities?",
    description: "Probability, estimation, arithmetic under pressure and basic statistics.",
  },
  calibration: {
    id: "calibration",
    label: "Calibration",
    question: "Does my confidence match my accuracy?",
    description:
      "Forecasting, confidence accuracy and the willingness to say 'I don't know' when that is true.",
  },
  composure: {
    id: "composure",
    label: "Composure",
    question: "Do I stay precise when time and ambiguity press?",
    description:
      "Pausing, tolerating ambiguity, precision under pressure and revising when evidence changes.",
  },
  synthesis: {
    id: "synthesis",
    label: "Synthesis",
    question: "Do I connect what I know across domains?",
    description: "Cross-domain connection, knowledge transfer and integration.",
  },
  curiosity: {
    id: "curiosity",
    label: "Curiosity",
    question: "Do I keep asking?",
    description: "Exploration, questioning and the appetite for breadth.",
  },
};

export const SUBSKILLS = {
  // Observation
  "observation.detail": { faculty: "observation", label: "Detail recall" },
  "observation.spatial": { faculty: "observation", label: "Spatial recall" },
  "observation.text": { faculty: "observation", label: "Text recall" },
  "observation.anomaly": { faculty: "observation", label: "Anomaly detection" },
  "observation.chronology": { faculty: "observation", label: "Chronology" },
  "observation.precision": { faculty: "observation", label: "Precision" },
  "observation.change": { faculty: "observation", label: "Change detection" },
  "observation.separation": { faculty: "observation", label: "Observation vs. interpretation" },
  // Inference
  "inference.hypothesis": { faculty: "inference", label: "Hypothesis generation" },
  "inference.alternatives": { faculty: "inference", label: "Alternative generation" },
  "inference.causal": { faculty: "inference", label: "Causal reasoning" },
  "inference.evidence_weighting": { faculty: "inference", label: "Evidence weighting" },
  "inference.information_value": { faculty: "inference", label: "Information value" },
  "inference.updating": { faculty: "inference", label: "Belief updating" },
  "inference.base_rates": { faculty: "inference", label: "Base rates" },
  "inference.disconfirmation": { faculty: "inference", label: "Disconfirmation" },
  // Memory
  "memory.recall": { faculty: "memory", label: "Quick recall" },
  "memory.retention": { faculty: "memory", label: "Long retention" },
  "memory.names": { faculty: "memory", label: "Names & details" },
  "memory.sequences": { faculty: "memory", label: "Sequences" },
  "memory.spatial": { faculty: "memory", label: "Spatial memory" },
  "memory.reconstruction": { faculty: "memory", label: "Reconstruction" },
  // Strategy
  "strategy.second_order": { faculty: "strategy", label: "Second-order effects" },
  "strategy.incentives": { faculty: "strategy", label: "Incentives" },
  "strategy.planning": { faculty: "strategy", label: "Planning" },
  "strategy.optionality": { faculty: "strategy", label: "Optionality" },
  "strategy.adversarial": { faculty: "strategy", label: "Adversarial thinking" },
  "strategy.negotiation": { faculty: "strategy", label: "Negotiation" },
  // Social
  "social.perspective": { faculty: "social", label: "Perspective taking" },
  "social.question_quality": { faculty: "social", label: "Question quality" },
  "social.incentive_recognition": { faculty: "social", label: "Incentive recognition" },
  "social.ambiguity": { faculty: "social", label: "Ambiguity detection" },
  "social.rapport": { faculty: "social", label: "Rapport" },
  "social.listening": { faculty: "social", label: "Listening" },
  // Knowledge
  "knowledge.history": { faculty: "knowledge", label: "History" },
  "knowledge.geography": { faculty: "knowledge", label: "Geography" },
  "knowledge.economics": { faculty: "knowledge", label: "Economics" },
  "knowledge.politics": { faculty: "knowledge", label: "Politics & institutions" },
  "knowledge.science": { faculty: "knowledge", label: "Science" },
  "knowledge.psychology": { faculty: "knowledge", label: "Psychology" },
  "knowledge.philosophy": { faculty: "knowledge", label: "Philosophy" },
  "knowledge.art": { faculty: "knowledge", label: "Art & architecture" },
  "knowledge.literature": { faculty: "knowledge", label: "Literature" },
  "knowledge.music": { faculty: "knowledge", label: "Music" },
  "knowledge.food": { faculty: "knowledge", label: "Food & drink culture" },
  "knowledge.business": { faculty: "knowledge", label: "Business" },
  "knowledge.technology": { faculty: "knowledge", label: "Technology" },
  "knowledge.law": { faculty: "knowledge", label: "Law & institutions" },
  "knowledge.connections": { faculty: "knowledge", label: "Connected knowledge" },
  // Rhetoric
  "rhetoric.clarity": { faculty: "rhetoric", label: "Clarity" },
  "rhetoric.concision": { faculty: "rhetoric", label: "Concision" },
  "rhetoric.argument": { faculty: "rhetoric", label: "Argument" },
  "rhetoric.explanation": { faculty: "rhetoric", label: "Explanation" },
  "rhetoric.storytelling": { faculty: "rhetoric", label: "Storytelling" },
  "rhetoric.analogy": { faculty: "rhetoric", label: "Analogy" },
  "rhetoric.precision": { faculty: "rhetoric", label: "Verbal precision" },
  // Quantitative
  "quantitative.probability": { faculty: "quantitative", label: "Probability" },
  "quantitative.estimation": { faculty: "quantitative", label: "Estimation" },
  "quantitative.arithmetic": { faculty: "quantitative", label: "Arithmetic" },
  "quantitative.statistics": { faculty: "quantitative", label: "Statistics" },
  // Calibration
  "calibration.forecasts": { faculty: "calibration", label: "Forecasting" },
  "calibration.confidence": { faculty: "calibration", label: "Confidence accuracy" },
  "calibration.uncertainty": { faculty: "calibration", label: "Recognising uncertainty" },
  // Composure
  "composure.pausing": { faculty: "composure", label: "Pausing" },
  "composure.ambiguity": { faculty: "composure", label: "Ambiguity tolerance" },
  "composure.pressure": { faculty: "composure", label: "Precision under pressure" },
  "composure.revision": { faculty: "composure", label: "Revision" },
  // Synthesis
  "synthesis.cross_domain": { faculty: "synthesis", label: "Cross-domain connection" },
  "synthesis.transfer": { faculty: "synthesis", label: "Transfer" },
  "synthesis.integration": { faculty: "synthesis", label: "Integration" },
  // Curiosity
  "curiosity.exploration": { faculty: "curiosity", label: "Exploration" },
  "curiosity.questioning": { faculty: "curiosity", label: "Questioning" },
  "curiosity.breadth": { faculty: "curiosity", label: "Breadth" },
} as const satisfies Record<string, { faculty: FacultyId; label: string }>;

export type SubskillId = keyof typeof SUBSKILLS;

export const SUBSKILL_IDS = Object.keys(SUBSKILLS) as SubskillId[];

export function subskillsOf(faculty: FacultyId): SubskillId[] {
  return SUBSKILL_IDS.filter((s) => SUBSKILLS[s].faculty === faculty);
}

export function facultyOf(subskill: SubskillId): FacultyId {
  return SUBSKILLS[subskill].faculty;
}

export function subskillLabel(subskill: SubskillId): string {
  return SUBSKILLS[subskill]?.label ?? subskill;
}

export function facultyLabel(faculty: FacultyId): string {
  return FACULTY_META[faculty]?.label ?? faculty;
}

/** Level vocabulary. "Exceptional" is deliberately hard to reach. */
export const LEVELS = ["untested", "emerging", "reliable", "sharp", "advanced", "exceptional"] as const;
export type Level = (typeof LEVELS)[number];

export const LEVEL_LABEL: Record<Level, string> = {
  untested: "Untested",
  emerging: "Emerging",
  reliable: "Reliable",
  sharp: "Sharp",
  advanced: "Advanced",
  exceptional: "Exceptional",
};

export const LEVEL_ORDER: Record<Level, number> = {
  untested: 0,
  emerging: 1,
  reliable: 2,
  sharp: 3,
  advanced: 4,
  exceptional: 5,
};

/** Difficulty scale 1–8. */
export const DIFFICULTY_LABEL: Record<number, string> = {
  1: "Introductory",
  2: "Focused",
  3: "Multi-step",
  4: "Ambiguous",
  5: "Complex",
  6: "Adversarial",
  7: "Transfer",
  8: "Synthesis",
};

export type Difficulty = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
