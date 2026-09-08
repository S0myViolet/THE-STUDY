/**
 * THE STUDY V2 — persisted user state.
 *
 * Every entity extends `Entity` from the V1 domain and lives in a named collection
 * (see `src/lib/persistence/collections.ts`). V1 entities remain in their own
 * collections untouched; V2 never writes V1 mastery ("skill_estimates") and V1
 * scores never contaminate V2 concept mastery.
 */
import type { Entity, ISODate } from "@/lib/domain/types";
import type {
  Difficulty,
  DomainId,
  ErrorCategory,
  ExamKind,
  ItemFormat,
  ItemLevel,
  KnowledgeNodeKind,
  KnowledgeRelation,
  LessonDepth,
  ProjectKind,
  SkillArea,
  SourceType,
  SpeakingMode,
  TransferLevel,
  WritingCriterion,
  WritingLevel,
} from "./content-types";

export type { Entity, ISODate };

/* ------------------------------------------------------------------ */
/* Profile extension and preferences                                    */
/* ------------------------------------------------------------------ */

export type DevelopGoal = "knowledge" | "reasoning" | "quantitative" | "communication" | "strategy" | "memory" | "complete";
export const DEVELOP_GOALS: { id: DevelopGoal; label: string; note: string }[] = [
  { id: "knowledge", label: "Knowledge", note: "Know a great deal about the world and connect it." },
  { id: "reasoning", label: "Reasoning", note: "Recognise weak arguments; reason about cause and evidence." },
  { id: "quantitative", label: "Quantitative ability", note: "Mathematics, probability and statistics you can use." },
  { id: "communication", label: "Communication", note: "Write and speak clearly; explain hard things simply." },
  { id: "strategy", label: "Strategy and judgment", note: "Decide well under uncertainty; think beyond the first move." },
  { id: "memory", label: "Memory", note: "Keep what you learn for months and years." },
  { id: "complete", label: "Complete development", note: "All of it, in proportion." },
];

export type InterestId = "history" | "economics" | "business" | "psychology" | "science" | "ai" | "technology" | "philosophy" | "art" | "literature" | "geopolitics" | "other";
export const INTEREST_IDS: InterestId[] = ["history", "economics", "business", "psychology", "science", "ai", "technology", "philosophy", "art", "literature", "geopolitics", "other"];

export type EducationLevel = "secondary" | "some_university" | "bachelor" | "postgraduate" | "self_taught";

export type PlanMode = "minimum" | "standard" | "deep" | "custom";
export const PLAN_MODE_MINUTES: Record<Exclude<PlanMode, "custom">, number> = { minimum: 30, standard: 90, deep: 150 };

/** Stored on `UserProfile.v2`. Optional on the V1 type so V1 rows still parse. */
export interface ProfileV2 {
  goals: DevelopGoal[];
  interests: InterestId[];
  educationLevel?: EducationLevel;
  dailyMinutes: number;
  onboardingComplete: boolean;
  baselineAttemptId?: string;
  baselineSkipped?: boolean;
  startedAt: ISODate;
  /** Set when V1 data was imported into V2 structures. */
  v1ImportedAt?: ISODate;
}

/* ------------------------------------------------------------------ */
/* Concept mastery and evidence                                         */
/* ------------------------------------------------------------------ */

export type ConceptState = "not_started" | "exposed" | "understood" | "practicing" | "retained" | "applied" | "durable" | "fragile";
export const CONCEPT_STATES: ConceptState[] = ["not_started", "exposed", "understood", "practicing", "retained", "applied", "durable", "fragile"];

/**
 * How the evidence was produced. Roughly in increasing strength:
 * recognition < checkpoint < recall < guided < explain < independent < delayed < application ≈ project < transfer < exam.
 */
export type EvidenceKind = "recognition" | "checkpoint" | "recall" | "guided" | "explain" | "independent" | "delayed" | "application" | "project" | "transfer" | "exam";
export const EVIDENCE_KINDS: EvidenceKind[] = ["recognition", "checkpoint", "recall", "guided", "explain", "independent", "delayed", "application", "project", "transfer", "exam"];

export type EvidenceConfidence = "low" | "medium" | "high";

export type SourceKind = "lesson" | "practice" | "retrieval" | "exam" | "baseline" | "transfer_case" | "project" | "reading" | "writing" | "speaking" | "application" | "curator" | "v1";

export interface SourceRef {
  kind: SourceKind;
  refId: string;
  label?: string;
}

export interface ConceptEvidence extends Entity {
  conceptId: string;
  kind: EvidenceKind;
  /** 0..1 quality of performance. */
  score: number;
  correct?: boolean;
  difficulty: Difficulty;
  /** Hints, scaffolds or worked solutions were available before the answer. */
  scaffolded: boolean;
  hintsUsed: number;
  /** Days since the concept was last studied or evidenced (0 for same-session). */
  delayDays: number;
  transfer: TransferLevel;
  /** Stated confidence 0..1 when asked. */
  confidence?: number;
  /** Computed weight after kind, difficulty, scaffolding, delay and transfer adjustments. */
  weight: number;
  independent: boolean;
  latencyMs?: number;
  source: SourceRef;
  planItemId?: string;
}

export interface ConceptMastery extends Entity {
  conceptId: string;
  state: ConceptState;
  /** Smoothed 0..1 estimate. One item never moves it far. */
  estimate: number;
  evidenceConfidence: EvidenceConfidence;
  evidenceMass: number;
  evidenceCount: number;
  /** Count of evidence per kind, and successes (score >= 0.7) per kind. */
  counts: Partial<Record<EvidenceKind, number>>;
  successes: Partial<Record<EvidenceKind, number>>;
  firstExposedAt?: ISODate;
  lastEvidenceAt?: ISODate;
  lastSuccessAt?: ISODate;
  /** Most recent successful retrieval after at least one day. */
  lastDelayedSuccessAt?: ISODate;
  longestSuccessfulDelayDays: number;
  consecutiveFailures: number;
  trend: "up" | "down" | "flat";
  history: { at: ISODate; estimate: number }[];
}

/* ------------------------------------------------------------------ */
/* Lessons                                                              */
/* ------------------------------------------------------------------ */

export interface LessonSession extends Entity {
  lessonId: string;
  conceptIds: string[];
  depth: LessonDepth;
  stepIndex: number;
  status: "active" | "completed" | "abandoned";
  /** Keyed by step id; shape depends on the step kind. */
  responses: Record<string, unknown>;
  checkpointScore?: number;
  explainBack?: { text: string; score: number; feedback: string; aiEvaluated: boolean };
  transferScore?: number;
  startedAt: ISODate;
  completedAt?: ISODate;
  minutes: number;
  planItemId?: string;
}

/* ------------------------------------------------------------------ */
/* Practice                                                             */
/* ------------------------------------------------------------------ */

export type PracticeContext = "train" | "lesson" | "exam" | "baseline" | "remediation" | "transfer" | "retrieval";

export interface PracticeEvaluation {
  feedback: string;
  strengths?: string[];
  improvements?: string[];
  /** Which key points were covered (free items). */
  covered?: string[];
  missed?: string[];
  aiEvaluated: boolean;
}

export interface PracticeAttempt extends Entity {
  itemId: string;
  skill: SkillArea;
  subskill: string;
  concepts: string[];
  level: ItemLevel;
  difficulty: Difficulty;
  format: ItemFormat;
  /** The learner's response (number, index(es), text, ordering). */
  response: unknown;
  correct?: boolean;
  /** 0..1 */
  score: number;
  /** 0..1 stated before submitting. */
  confidence?: number;
  hintsUsed: number;
  solutionRevealed: boolean;
  /** Number of retries before this final submission. */
  retries: number;
  timeMs: number;
  errorCategory?: ErrorCategory;
  evaluation?: PracticeEvaluation;
  context: PracticeContext;
  /** Exam attempt, lesson session, transfer case, etc. */
  contextRef?: string;
  planItemId?: string;
}

/* ------------------------------------------------------------------ */
/* Errors                                                               */
/* ------------------------------------------------------------------ */

export interface ErrorRecord extends Entity {
  category: ErrorCategory;
  skill: SkillArea;
  concepts: string[];
  question: string;
  response: string;
  correctReasoning: string;
  confidence?: number;
  source: SourceRef;
  /** `${category}:${primaryConcept}` for recurrence detection. */
  recurrenceKey: string;
  /** Set when the error was studied in a remediation session. */
  remediatedAt?: ISODate;
}

/* ------------------------------------------------------------------ */
/* Retrieval (memory)                                                   */
/* ------------------------------------------------------------------ */

export type RetrievalMode = "fact" | "concept" | "free_recall" | "process" | "compare" | "application" | "explanation" | "connection";
export const RETRIEVAL_MODES: RetrievalMode[] = ["fact", "concept", "free_recall", "process", "compare", "application", "explanation", "connection"];

export interface RetrievalItem extends Entity {
  mode: RetrievalMode;
  prompt: string;
  /** Canonical answer (fact/concept) or model answer (free modes). */
  answer: string;
  accept?: string[];
  /** For free modes: what a complete answer covers. */
  keyPoints?: string[];
  conceptId?: string;
  nodeId?: string;
  source: SourceRef;
  /** Scheduling. */
  ease: number;
  intervalDays: number;
  due: ISODate;
  reps: number;
  lapses: number;
  /** 0 recall → 1 recall → 2 application → 3 reconstruction → 4 transfer; drives the prompt mode offered. */
  stage: number;
  lastReviewedAt?: ISODate;
  suspended?: boolean;
  /** Encoding technique the learner recorded using, if any. */
  encoding?: string;
  tags?: string[];
}

export interface RetrievalReview extends Entity {
  itemId: string;
  conceptId?: string;
  grade: 0 | 1 | 2 | 3 | 4 | 5;
  correct: boolean;
  /** 0..1 */
  score: number;
  confidence?: number;
  latencyMs?: number;
  mode: RetrievalMode;
  intervalBefore: number;
  intervalAfter: number;
  /** Days since the previous review (or creation). */
  delayDays: number;
  response?: string;
  planItemId?: string;
}

/* ------------------------------------------------------------------ */
/* Library and reading                                                  */
/* ------------------------------------------------------------------ */

export type SourceStatus = "queue" | "reading" | "completed" | "reference";

export interface LibrarySource extends Entity {
  type: SourceType;
  title: string;
  author?: string;
  year?: number;
  status: SourceStatus;
  /** Why am I reading this? */
  why?: string;
  /** The current question held while reading. */
  currentQuestion?: string;
  concepts: string[];
  projectIds: string[];
  seedId?: string;
  unitLabel: "chapter" | "section" | "page";
  totalUnits?: number;
  /** Last unit finished. */
  progressUnit?: number;
  /** Rolling 0..1 from close-book recalls. */
  comprehension?: number;
  /** Rolling 0..1 from later retrieval of extracted concepts. */
  retention?: number;
  connectionsCount: number;
  startedAt?: ISODate;
  completedAt?: ISODate;
  notes?: string;
}

export interface ReadingSession extends Entity {
  sourceId: string;
  question?: string;
  fromUnit?: number;
  toUnit?: number;
  minutes: number;
  startedAt: ISODate;
  endedAt?: ISODate;
  status: "open" | "closed";
  recallId?: string;
  planItemId?: string;
}

export interface ReadingRecall extends Entity {
  sourceId: string;
  sessionId: string;
  centralIdeas: string;
  argument: string;
  evidence: string;
  unclear: string;
  disagree: string;
  connections: string;
  /** Concepts the learner (or the model) extracted; each may map to a curriculum concept or a knowledge node. */
  extracted: { title: string; conceptId?: string; nodeId?: string; note?: string }[];
  /** 0..1 completeness, deterministic (length/coverage) or model-rated. */
  score?: number;
  feedback?: string;
  aiEvaluated: boolean;
  retrievalItemIds: string[];
}

/* ------------------------------------------------------------------ */
/* Knowledge graph (user additions; the seed lives in content)          */
/* ------------------------------------------------------------------ */

export interface KnowledgeNode extends Entity {
  /** Stable slug; unique per user. Seed node ids share the same namespace. */
  key: string;
  kind: KnowledgeNodeKind;
  title: string;
  domainId?: DomainId;
  summary: string;
  conceptId?: string;
  source?: SourceRef;
  year?: number;
  tags?: string[];
}

export interface KnowledgeEdge extends Entity {
  /** Node keys (seed or user). */
  from: string;
  to: string;
  relation: KnowledgeRelation;
  note?: string;
  origin: "user" | "ai" | "reading" | "project";
}

/* ------------------------------------------------------------------ */
/* Writing and speaking                                                 */
/* ------------------------------------------------------------------ */

export interface WritingEntry extends Entity {
  promptId?: string;
  level: WritingLevel;
  title: string;
  prompt: string;
  status: "draft" | "submitted" | "reviewed";
  currentVersion: number;
  concepts: string[];
  wordCount: number;
  latestFeedbackId?: string;
  /** Exam or project this piece belongs to. */
  contextRef?: SourceRef;
  timeMs: number;
  planItemId?: string;
}

export interface WritingVersion extends Entity {
  entryId: string;
  version: number;
  text: string;
  wordCount: number;
}

export interface WritingFeedback extends Entity {
  entryId: string;
  version: number;
  scores: Record<WritingCriterion, number>;
  overall: number;
  /** Feedback anchored to exact passages. */
  passages: { quote: string; note: string; criterion: WritingCriterion }[];
  strengths: string[];
  improvements: string[];
  metrics: { words: number; sentences: number; avgSentenceLength: number; hedges: number; passiveHints: number; paragraphs: number };
  aiEvaluated: boolean;
}

export interface SpeakingSession extends Entity {
  promptId: string;
  mode: SpeakingMode;
  durationMs: number;
  transcript?: string;
  transcriptSource?: "typed" | "browser" | "model";
  metrics: { words: number; wordsPerMinute?: number; fillers: number; repetitions: number; sentences: number; avgSentenceLength: number };
  rubricScores?: Record<string, number>;
  overall?: number;
  feedback?: string;
  aiEvaluated: boolean;
  recorded: boolean;
  concepts: string[];
  planItemId?: string;
}

/* ------------------------------------------------------------------ */
/* Build: projects                                                      */
/* ------------------------------------------------------------------ */

export type EvidenceProvenance = "source_claim" | "user_interpretation" | "ai_suggestion";

export interface Project extends Entity {
  kind: ProjectKind;
  title: string;
  question: string;
  whyItMatters: string;
  whatIThinkNow: string;
  requiredConcepts: string[];
  /** Concepts the learner marked as applied in the final output. */
  appliedConcepts: string[];
  sources: { id: string; title: string; note?: string; url?: string; sourceId?: string }[];
  notes: { id: string; text: string; at: ISODate }[];
  claims: { id: string; text: string; support: "strong" | "moderate" | "weak" | "contested" }[];
  evidence: { id: string; text: string; claimId?: string; sourceRef?: string; provenance: EvidenceProvenance }[];
  counterarguments: { id: string; text: string; against?: string }[];
  openQuestions: string[];
  milestones: { id: string; title: string; done: boolean; doneAt?: ISODate }[];
  finalOutput?: string;
  retrospective?: { text: string; at: ISODate };
  status: "open" | "completed" | "archived";
  templateId?: string;
  startedAt: ISODate;
  completedAt?: ISODate;
}

/* ------------------------------------------------------------------ */
/* Prove: exams (items are frozen before the learner answers)           */
/* ------------------------------------------------------------------ */

export interface ExamItemSnapshot {
  id: string;
  skill: SkillArea;
  subskill: string;
  concepts: string[];
  level: ItemLevel;
  difficulty: Difficulty;
  format: ItemFormat;
  prompt: string;
  options?: string[];
  answer?: number | number[] | string;
  tolerance?: number;
  relativeTolerance?: number;
  accept?: string[];
  keyPoints?: string[];
  solution: string;
  passageId?: string;
}

export interface ExamForm {
  sections: { id: string; title: string; weight: number; itemIds: string[]; writingPromptId?: string; memoryStudy?: { itemIds: string[]; studySeconds: number } }[];
  items: Record<string, ExamItemSnapshot>;
  /** Passages referenced by items, frozen. */
  passages: Record<string, { title: string; text: string }>;
  seed: number;
}

export interface ExamResponse {
  response: unknown;
  confidence?: number;
  timeMs: number;
  /** Deterministic grade when available; free items graded by key points or model afterwards. */
  correct?: boolean;
  score?: number;
}

export interface ExamSectionResult {
  id: string;
  title: string;
  weight: number;
  score: number;
  correct: number;
  count: number;
}

export interface ExamResult {
  /** 0..1 weighted total. */
  total: number;
  sections: ExamSectionResult[];
  bySkill: Record<string, { score: number; n: number }>;
  byConcept: Record<string, { score: number; n: number }>;
  calibration?: { brier: number; verdict: "overconfident" | "underconfident" | "well_calibrated" | "insufficient"; n: number };
  comparedTo?: { attemptId: string; delta: number; improved: string[]; flat: string[]; declined: string[] };
  interventions: string[];
  writingOverall?: number;
}

export interface ExamAttempt extends Entity {
  blueprintId: string;
  kind: ExamKind;
  title: string;
  status: "in_progress" | "completed" | "abandoned";
  startedAt: ISODate;
  completedAt?: ISODate;
  timeLimitMinutes: number;
  form: ExamForm;
  /** Keyed by item id. Writing responses are keyed by the writing prompt id. */
  responses: Record<string, ExamResponse>;
  /** Section index the learner is on. */
  sectionIndex: number;
  result?: ExamResult;
  planItemId?: string;
}

/* ------------------------------------------------------------------ */
/* Today: plans and time                                                */
/* ------------------------------------------------------------------ */

export type PlanItemKind = "learn" | "train" | "recall" | "read" | "create" | "project" | "prove" | "remediate" | "transfer" | "explore" | "write" | "speak";
export type PlanReason = "foundation_gap" | "retrieval_due" | "recurring_error" | "curriculum" | "project" | "transfer" | "curiosity" | "book" | "strength" | "exam" | "first_month";

export interface PlanItem {
  id: string;
  kind: PlanItemKind;
  title: string;
  minutes: number;
  href: string;
  refId?: string;
  conceptIds?: string[];
  reason: PlanReason;
  /** One sentence the learner can inspect under "Why this plan?". */
  reasonText: string;
  priority: number;
  optional?: boolean;
  status: "pending" | "active" | "done" | "skipped";
  completedAt?: ISODate;
}

export interface DailyPlan extends Entity {
  date: string; // YYYY-MM-DD
  mode: PlanMode;
  minutes: number;
  items: PlanItem[];
  /** Optional model-written narrative; the plan itself is deterministic. */
  narrative?: string;
  /** Snapshot of the signals the planner used, for "Why this plan?". */
  signals: { dueRetrievals: number; foundationGaps: string[]; recurringErrors: string[]; activeBook?: string; activeProject?: string; examDue?: string; weakestSkills: string[] };
  status: "planned" | "active" | "completed";
  startedAt?: ISODate;
  completedAt?: ISODate;
}

export interface StudyLog extends Entity {
  date: string;
  kind: PlanItemKind | "other";
  refId?: string;
  minutes: number;
  planItemId?: string;
}

/* ------------------------------------------------------------------ */
/* Curator (tutor) and assistance                                       */
/* ------------------------------------------------------------------ */

export type TutorMode = "teach" | "socratic" | "practice" | "critique" | "debate" | "research" | "review" | "plan" | "explain";
export const TUTOR_MODES: TutorMode[] = ["teach", "socratic", "practice", "critique", "debate", "research", "review", "plan", "explain"];

export interface TutorMessage {
  role: "user" | "curator";
  text: string;
  at: ISODate;
  mode?: TutorMode;
  /** The reply asked for the learner's attempt first. */
  thinkFirst?: boolean;
  /** Provenance marking for research mode. */
  provenance?: EvidenceProvenance;
  offers?: { saveToKnowledge?: boolean; scheduleRetrieval?: boolean; saved?: boolean; scheduled?: boolean; conceptId?: string };
}

export interface TutorConversation extends Entity {
  title: string;
  mode: TutorMode;
  messages: TutorMessage[];
  contextRef?: SourceRef;
  conceptIds: string[];
  independentAttempts: number;
  directAnswerRequests: number;
}

export type AssistanceKind = "independent_attempt" | "hint" | "solution_reveal" | "direct_answer" | "revision";

export interface AssistanceEvent extends Entity {
  kind: AssistanceKind;
  source: SourceRef;
  conceptIds?: string[];
}

/* ------------------------------------------------------------------ */
/* Real-world application                                               */
/* ------------------------------------------------------------------ */

export type ApplicationKind = "explained_to_someone" | "real_prediction" | "analysed_article" | "wrote_analysis" | "researched_history" | "used_in_project" | "recognised_mechanism" | "other";

export interface ApplicationRecord extends Entity {
  kind: ApplicationKind;
  title: string;
  description: string;
  conceptIds: string[];
  reflection?: string;
  /** Self-rated 0..1 how well it went; weighted lightly. */
  selfRating?: number;
}

/* ------------------------------------------------------------------ */
/* Generated content (model output validated and persisted)             */
/* ------------------------------------------------------------------ */

export interface GeneratedV2 extends Entity {
  kind: "lesson" | "item" | "exam_item" | "transfer" | "writing_prompt" | "speaking_prompt";
  refId: string;
  payload: unknown;
  model?: string;
  conceptIds: string[];
}
