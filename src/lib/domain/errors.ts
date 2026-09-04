/**
 * Error taxonomy. Stored quietly; surfaced through the Red Thread and After Action,
 * never as a wall of "mistakes".
 */
export const ERROR_TYPES = [
  "OBSERVATION_MISS",
  "FALSE_OBSERVATION",
  "PREMATURE_CLOSURE",
  "BASE_RATE_NEGLECT",
  "CONFIRMATION_BIAS",
  "CAUSAL_ERROR",
  "ASSUMPTION",
  "MEMORY_FAILURE",
  "CALCULATION",
  "TIMELINE_ERROR",
  "QUESTION_QUALITY",
  "INFORMATION_VALUE",
  "OVERCONFIDENCE",
  "UNDERCONFIDENCE",
  "STRATEGIC_SHORTSIGHTEDNESS",
  "MISREAD",
  "PRECISION",
  "TRANSFER_FAILURE",
  "NUMERIC_DETAIL_LOSS",
  "LEADING_QUESTION",
  "INSUFFICIENT_UPDATE",
  "OVER_UPDATE",
  "SPATIAL_MISS",
  "CHRONOLOGY_LOSS",
  "ALTERNATIVE_NEGLECT",
  "VERBOSITY",
] as const;

export type ErrorType = (typeof ERROR_TYPES)[number];

export const ERROR_META: Record<ErrorType, { label: string; description: string }> = {
  OBSERVATION_MISS: { label: "Missed detail", description: "Something present was not noticed." },
  FALSE_OBSERVATION: { label: "Invented detail", description: "Something reported was never there." },
  PREMATURE_CLOSURE: {
    label: "Premature closure",
    description: "Settled on an explanation before the evidence could carry it.",
  },
  BASE_RATE_NEGLECT: {
    label: "Base rate neglect",
    description: "Vivid evidence outweighed what is usually true.",
  },
  CONFIRMATION_BIAS: {
    label: "Confirmation seeking",
    description: "Sought or weighted evidence that supported the existing view.",
  },
  CAUSAL_ERROR: { label: "Causal error", description: "Mistook correlation, sequence or coincidence for cause." },
  ASSUMPTION: { label: "Unexamined assumption", description: "A belief entered the reasoning without being noticed." },
  MEMORY_FAILURE: { label: "Memory failure", description: "Could not retrieve something previously learned." },
  CALCULATION: { label: "Calculation", description: "Numerical or probabilistic slip." },
  TIMELINE_ERROR: { label: "Timeline error", description: "Ordering of events reconstructed incorrectly." },
  QUESTION_QUALITY: { label: "Weak question", description: "The question asked did not force new information." },
  INFORMATION_VALUE: {
    label: "Low information value",
    description: "Chose an action or question that reduced little uncertainty.",
  },
  OVERCONFIDENCE: { label: "Overconfidence", description: "Confidence exceeded accuracy." },
  UNDERCONFIDENCE: { label: "Underconfidence", description: "Accuracy exceeded confidence." },
  STRATEGIC_SHORTSIGHTEDNESS: {
    label: "Strategic shortsightedness",
    description: "Considered the first move but not what follows it.",
  },
  MISREAD: { label: "Misread", description: "Read something in the material that was not what it said." },
  PRECISION: { label: "Imprecision", description: "Correct in spirit, wrong in the particular." },
  TRANSFER_FAILURE: {
    label: "Transfer failure",
    description: "Knew the principle elsewhere but did not apply it here.",
  },
  NUMERIC_DETAIL_LOSS: { label: "Numeric detail loss", description: "Remembered meaning; lost exact numbers." },
  LEADING_QUESTION: { label: "Leading question", description: "A question that suggested its own answer." },
  INSUFFICIENT_UPDATE: {
    label: "Insufficient update",
    description: "Noticed contradictory evidence but barely moved.",
  },
  OVER_UPDATE: { label: "Over-update", description: "Swung too far on one piece of evidence." },
  SPATIAL_MISS: { label: "Spatial miss", description: "Misplaced where something was." },
  CHRONOLOGY_LOSS: { label: "Chronology loss", description: "Remembered the pieces, lost their order." },
  ALTERNATIVE_NEGLECT: {
    label: "Alternative neglect",
    description: "Generated one explanation where several were plausible.",
  },
  VERBOSITY: { label: "Verbosity", description: "More words than the idea required." },
};
