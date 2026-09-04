/**
 * Content types for seeded and generated exercises that are not full entities.
 * Rooms consume these; the adaptive engine schedules them.
 */
import type { Difficulty, FacultyId, SubskillId } from "./faculties";
import type { ErrorType } from "./errors";
import type { ObservationFact } from "@/lib/scoring/observation";
import type { ArchiveDomain } from "./types";

/* ---------------- Observation ---------------- */

export interface SceneRef {
  template: string; // scene template id
  seed: number;
}

export interface GlanceExercise {
  id: string;
  title: string;
  scene: SceneRef;
  /** default exposure seconds; the room may offer 5/10/20/30/60 */
  seconds: number;
  /** number of generated questions to ask */
  questionCount: number;
  difficulty: Difficulty;
}

export interface ChangeExercise {
  id: string;
  title: string;
  scene: SceneRef;
  /** number of mutations to apply between A and B */
  changes: number;
  seconds: number;
  difficulty: Difficulty;
}

export interface DocumentExercise {
  id: string;
  title: string;
  kind: "receipt" | "calendar" | "email" | "menu" | "ticket" | "schedule" | "map" | "memo";
  /** Rendered as a document: lines or rows */
  lines?: string[];
  columns?: string[];
  rows?: string[][];
  seconds: number;
  questions: { id: string; prompt: string; answer: string; accept?: string[]; subskill: SubskillId }[];
  difficulty: Difficulty;
}

export interface ChronologyExercise {
  id: string;
  title: string;
  context: string;
  /** Items in correct order */
  ordered: string[];
  explanation: string;
  difficulty: Difficulty;
}

export interface SignalNoiseExercise {
  id: string;
  title: string;
  context: string;
  details: { id: string; text: string; signal: boolean; why: string }[];
  /** how many the user should pick */
  pick: number;
  difficulty: Difficulty;
}

export interface MissingExercise {
  id: string;
  title: string;
  scene: string; // prose description of the scene
  /** what a careful observer would expect and does not find */
  missing: { text: string; keywords: string[]; why: string }[];
  /** plausible red herrings the user might claim are missing */
  distractors: { text: string; keywords: string[] }[];
  difficulty: Difficulty;
}

export interface ObservationOrStoryExercise {
  id: string;
  title: string;
  situation: string;
  statements: { id: string; text: string; truth: "observation" | "inference" | "unknown"; why: string }[];
  difficulty: Difficulty;
}

export interface RoomScanExercise {
  id: string;
  title: string;
  scene: SceneRef;
  seconds: number;
  difficulty: Difficulty;
}

/* ---------------- Inference ---------------- */

export interface ThreeStoriesChallenge {
  id: string;
  title: string;
  evidence: string[];
  /** plausible explanations an expert would list */
  plausible: { title: string; keywords: string[]; note: string }[];
  /** the trap: the story most people jump to */
  obvious: string;
  debrief: string;
  difficulty: Difficulty;
}

export interface BestExplanationChallenge {
  id: string;
  title: string;
  evidence: string[];
  hypotheses: { id: string; text: string; evidenceExplained: number; assumptions: number; contradictions: number; plausibility: number; note: string }[];
  /** id of the hypothesis an expert would rank first, or null when insufficient */
  best: string | null;
  debrief: string;
  difficulty: Difficulty;
}

export interface MissingVariableChallenge {
  id: string;
  title: string;
  correlation: string;
  /** confounders / third factors */
  candidates: { text: string; keywords: string[]; strength: "strong" | "moderate" | "weak" }[];
  debrief: string;
  difficulty: Difficulty;
}

export interface BaseRateChallenge {
  id: string;
  title: string;
  setup: string;
  /** the vivid evidence */
  evidence: string;
  baseRateNote: string;
  options: { id: string; text: string; correct: boolean; why: string }[];
  /** numeric answer if there is one (probability 0..1) */
  numeric?: { answer: number; tolerance: number; unit: "probability" | "count" };
  difficulty: Difficulty;
}

export interface CounterfactualChallenge {
  id: string;
  title: string;
  theory: string;
  context: string;
  /** what one would expect to observe if the theory were false */
  expected: { text: string; keywords: string[] }[];
  debrief: string;
  difficulty: Difficulty;
}

export interface AnomalyChallenge {
  id: string;
  title: string;
  evidence: string[];
  dominantExplanation: string;
  anomalyIndex: number; // index into evidence
  significance: { text: string; keywords: string[] }[];
  debrief: string;
  difficulty: Difficulty;
}

export interface HowSureChallenge {
  id: string;
  title: string;
  question: string;
  options: { id: string; text: string }[];
  correct: string; // option id
  domain: FacultyId;
  explanation: string;
  difficulty: Difficulty;
}

export interface InformationValueChallenge {
  id: string;
  title: string;
  scenario: string;
  unknowns: string[];
  questions: { id: string; text: string; informationValue: number; rapportCost: number; leading: boolean; feedback: string }[];
  debrief: string;
  difficulty: Difficulty;
}

export interface LadderChallenge {
  id: string;
  title: string;
  situation: string;
  /** key observations a careful reader extracts */
  observations: { text: string; keywords: string[] }[];
  /** reasonable inferences */
  inferences: { text: string; keywords: string[] }[];
  /** alternatives that should appear */
  alternatives: { text: string; keywords: string[] }[];
  debrief: string;
  difficulty: Difficulty;
}

export interface CausalChallenge {
  id: string;
  title: string;
  claim: string;
  context: string;
  options: { id: string; text: string; correct: boolean; why: string; errorType?: ErrorType }[];
  debrief: string;
  difficulty: Difficulty;
}

export interface FastSlowChallenge {
  id: string;
  title: string;
  question: string;
  options: { id: string; text: string }[];
  correct: string;
  fastSeconds: number;
  explanation: string;
  domain: FacultyId;
  difficulty: Difficulty;
}

/* ---------------- Knowledge (baseline & archive quizzes) ---------------- */

export interface KnowledgeQuestion {
  id: string;
  domain: ArchiveDomain;
  prompt: string;
  options: string[];
  answer: number; // index
  explanation: string;
  archiveRef?: string;
  difficulty: Difficulty;
}

/* ---------------- Memory seeds ---------------- */

export interface PersonCard {
  id: string;
  name: string;
  profession: string;
  origin: string;
  interest: string;
  detail: string;
}

export interface MemorySeed {
  id: string;
  kind: "fact" | "concept" | "sequence" | "story" | "person";
  prompt: string;
  answer: string;
  accept?: string[];
  hint?: string;
  sequence?: string[];
  person?: PersonCard;
  archiveRef?: string;
  tags?: string[];
}

/* ---------------- Investigations ---------------- */

export interface InvestigationTemplate {
  id: string;
  title: string;
  question: string;
  whyItMatters: string;
  threads: { id: string; title: string; note: string }[];
  startingClaims: { id: string; text: string; support: "strong" | "moderate" | "weak" | "contested" }[];
  startingCounterclaims: { id: string; text: string; against?: string }[];
  archiveConnections: string[];
  openQuestions: string[];
  sources: { id: string; title: string; note?: string }[];
}

/* ---------------- Scene facts helper ---------------- */
export type { ObservationFact };
