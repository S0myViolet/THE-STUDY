/**
 * THE STUDY domain model.
 *
 * Every persisted entity extends `Entity` and lives in a named collection
 * (see `lib/persistence/collections.ts`). Content definitions (cases, scenarios,
 * archive entries) are shipped as seed data and may also be persisted when generated.
 */
import type { Difficulty, FacultyId, Level, SubskillId } from "./faculties";
import type { ErrorType } from "./errors";

export type ISODate = string;

export interface Entity {
  id: string;
  userId: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

/* ------------------------------------------------------------------ */
/* Users, preferences                                                   */
/* ------------------------------------------------------------------ */

export type Goal =
  | "seeing"
  | "thinking"
  | "people"
  | "strategy"
  | "memory"
  | "knowledge"
  | "expression"
  | "everything";

export type Interest =
  | "history"
  | "economics"
  | "psychology"
  | "art"
  | "science"
  | "technology"
  | "business"
  | "geopolitics"
  | "literature"
  | "architecture"
  | "food"
  | "travel"
  | "philosophy"
  | "music"
  | "other";

export type SessionLength = "quick" | "standard" | "deep" | "immersion" | "variable";
export type ChallengeStyle = "supportive" | "neutral" | "demanding";
export type CuratorDepth = "concise" | "standard" | "deep";
export type PressureMode = "none" | "standard" | "pressure";
export type Appearance = "light" | "dark" | "system";

export interface UserProfile extends Entity {
  displayName: string;
  goals: Goal[];
  interests: Interest[];
  onboardingComplete: boolean;
  baselineComplete: boolean;
  isDemo: boolean;
  enteredAt: ISODate;
  timezone?: string;
  /** V2 academy profile (goals, interests, time, baseline). Absent on V1-only profiles. */
  v2?: import("@/lib/v2/types").ProfileV2;
}

export interface Preferences extends Entity {
  sessionLength: SessionLength;
  preferredFaculties: FacultyId[];
  thinkFirst: boolean;
  pressureDefault: PressureMode;
  fieldworkEnabled: boolean;
  curiositiesEnabled: boolean;
  newsEnabled: boolean;
  appearance: Appearance;
  curatorDepth: CuratorDepth;
  challengeStyle: ChallengeStyle;
  reducedMotion: boolean;
  soundEnabled: boolean;
  /* ---- V2 ---- */
  /** Default Today length. */
  planMode?: import("@/lib/v2/types").PlanMode;
  /** Minutes when planMode is "custom". */
  customMinutes?: number;
  /** Default lesson depth. */
  lessonDepth?: import("@/lib/v2/content-types").LessonDepth;
  /** Multiplier on every timed exposure to material (baseline memory study, transfer cases). Default 2. */
  readingPace?: number;
}

/* ------------------------------------------------------------------ */
/* Evidence, estimates, errors                                          */
/* ------------------------------------------------------------------ */

export type EvidenceSourceKind =
  | "case"
  | "observation"
  | "inference"
  | "salon"
  | "strategy"
  | "memory"
  | "archive"
  | "rhetoric"
  | "forecast"
  | "decision"
  | "fieldwork"
  | "baseline"
  | "curator"
  | "investigation"
  | "cabinet"
  | "reading";

export type ResponseFormat = "mcq" | "free" | "numeric" | "sort" | "timed" | "delayed";

export interface SkillEvidence extends Entity {
  subskill: SubskillId;
  faculty: FacultyId;
  /** 0..1 quality of performance on this item */
  score: number;
  difficulty: Difficulty;
  /** Evidence weight after difficulty/format/transfer adjustments */
  weight: number;
  format: ResponseFormat;
  transfer: boolean;
  source: { kind: EvidenceSourceKind; refId: string; label?: string };
  latencyMs?: number;
  /** Stated confidence (0..1) when the task asked for one */
  confidence?: number;
  correct?: boolean;
  sessionId?: string;
  note?: string;
}

export interface EstimateHistoryPoint {
  at: ISODate;
  value: number;
}

export interface SkillEstimate extends Entity {
  subskill: SubskillId;
  faculty: FacultyId;
  /** latent estimate 0..1 */
  value: number;
  evidenceCount: number;
  evidenceMass: number;
  /** 0..1 confidence in the estimate itself */
  estimateConfidence: number;
  trend: "up" | "down" | "flat";
  level: Level;
  lastEvidenceAt?: ISODate;
  history: EstimateHistoryPoint[];
}

export interface ErrorEvent extends Entity {
  type: ErrorType;
  faculty: FacultyId;
  subskill?: SubskillId;
  source: { kind: EvidenceSourceKind; refId: string; label?: string };
  detail: string;
  sessionId?: string;
}

export interface ConfidenceEntry extends Entity {
  /** 0..1 */
  confidence: number;
  correct: boolean;
  domain: FacultyId;
  source: { kind: EvidenceSourceKind; refId: string; label?: string };
  latencyMs?: number;
  sessionId?: string;
}

/* ------------------------------------------------------------------ */
/* Cases                                                                */
/* ------------------------------------------------------------------ */

export type CaseStageKind =
  | "enter"
  | "notice"
  | "recall"
  | "separate"
  | "hypotheses"
  | "question"
  | "evidence"
  | "update"
  | "decision"
  | "explain"
  | "debrief";

export interface NoticeMaterial {
  /** How the material is shown */
  kind: "scene" | "document" | "thread" | "table" | "schedule" | "layout" | "text";
  /** For procedural scenes: template + seed. */
  scene?: { template: string; seed: number };
  /** For documents and threads: lines/rows rendered by the case player. */
  title?: string;
  lines?: string[];
  rows?: string[][];
  columns?: string[];
  /** Exposure in seconds */
  seconds: number;
}

export interface RecallQuestion {
  id: string;
  prompt: string;
  kind: "mcq" | "short" | "number";
  options?: string[];
  answer: string; // canonical answer (option text or short answer)
  accept?: string[]; // alternative accepted answers (short)
  subskill: SubskillId;
  points?: number;
}

export interface SeparateStatement {
  id: string;
  text: string;
  truth: "observation" | "inference" | "unknown";
  why: string;
}

export interface HypothesisRubric {
  /** Explanations an expert would consider plausible. Used for feedback and deterministic overlap scoring. */
  plausible: { title: string; keywords: string[]; note: string }[];
  /** Minimum count required */
  minimum: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  /** 0..1 expected information gain */
  informationValue: number;
  rapportCost: number; // 0..1
  leading: boolean;
  feedback: string;
}

export interface EvidenceReveal {
  title: string;
  text: string;
  /** Which hypothesis this supports/undermines (free text keys matching rubric titles) */
  supports?: string[];
  undermines?: string[];
}

export interface DecisionOption {
  id: string;
  text: string;
  quality: number; // 0..1
  feedback: string;
  errorType?: ErrorType;
}

export interface CaseStage {
  id: string;
  kind: CaseStageKind;
  title: string;
  /** Narrative text shown at the top of the stage */
  narrative?: string;
  /** enter */
  setting?: string;
  /** notice */
  material?: NoticeMaterial;
  /** recall */
  questions?: RecallQuestion[];
  /** separate */
  statements?: SeparateStatement[];
  /** hypotheses */
  rubric?: HypothesisRubric;
  /** question */
  questionOptions?: QuestionOption[];
  allowFreeQuestion?: boolean;
  /** evidence */
  reveal?: EvidenceReveal;
  /** update: asks confidence in the primary hypothesis before/after */
  updatePrompt?: string;
  /** decision */
  decisionOptions?: DecisionOption[];
  /** explain */
  explainPrompt?: string;
  /** debrief */
  expertReasoning?: string;
  keyInsight?: string;
  /** Which subskills this stage evidences */
  subskills?: SubskillId[];
  /** When true, the case may end with "insufficient evidence" as the correct conclusion */
  insufficientEvidenceIsCorrect?: boolean;
}

export interface CaseDefinition {
  id: string;
  number: string; // e.g. "0147"
  title: string;
  setting: string;
  summary: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  faculties: FacultyId[];
  subskills: SubskillId[];
  stages: CaseStage[];
  groundTruth: string;
  /** Concept ids in the Archive this case draws on */
  conceptLinks: string[];
  safetyTags: string[];
  origin: "seeded" | "generated";
  tags?: string[];
}

export interface CaseAttempt extends Entity {
  caseId: string;
  status: "active" | "completed" | "abandoned";
  currentStageIndex: number;
  startedAt: ISODate;
  completedAt?: ISODate;
  sessionId?: string;
  /** Aggregate summary written on completion */
  summary?: CaseAttemptSummary;
}

export interface CaseAttemptSummary {
  recallCorrect: number;
  recallTotal: number;
  falseRecalls: number;
  separationAccuracy: number;
  hypothesesCount: number;
  alternativesCount: number;
  questionInformationValue?: number;
  confidenceBefore?: number;
  confidenceAfter?: number;
  decisionQuality?: number;
  overallScore: number;
  reasoningPath: ReasoningPathPoint[];
  noticed: string[];
  missed: string[];
  assumptions: string[];
  didWell: string[];
  turningPoint?: string;
  oneThing?: string;
}

export interface ReasoningPathPoint {
  label: string;
  kind: "evidence" | "hypothesis" | "confidence" | "question" | "decision";
  value?: number;
  note?: string;
}

export interface CaseStageAttempt extends Entity {
  attemptId: string;
  caseId: string;
  stageId: string;
  stageKind: CaseStageKind;
  /** Free-form response payload; shape depends on stage kind */
  response: Record<string, unknown>;
  score?: number;
  latencyMs?: number;
  evaluation?: Record<string, unknown>;
}

/* ------------------------------------------------------------------ */
/* Observation                                                          */
/* ------------------------------------------------------------------ */

export type ObservationMode =
  | "glance"
  | "room_scan"
  | "change"
  | "chronology"
  | "document"
  | "signal_noise"
  | "missing"
  | "observation_or_story";

export interface ObservationAttempt extends Entity {
  mode: ObservationMode;
  exerciseId: string; // template:seed or seeded exercise id
  exposureSeconds?: number;
  pressure: PressureMode;
  coverage?: number; // 0..1
  precision?: number; // 0..1
  correct: number;
  total: number;
  falseClaims: number;
  latencyMs?: number;
  details: Record<string, unknown>;
  sessionId?: string;
}

/* ------------------------------------------------------------------ */
/* Inference                                                            */
/* ------------------------------------------------------------------ */

export type InferenceMode =
  | "three_stories"
  | "best_explanation"
  | "missing_variable"
  | "base_rate"
  | "counterfactual"
  | "disconfirm"
  | "anomaly"
  | "how_sure"
  | "information_value"
  | "ladder"
  | "fast_slow";

export interface InferenceAttempt extends Entity {
  mode: InferenceMode;
  challengeId: string;
  response: Record<string, unknown>;
  score?: number;
  confidence?: number;
  correct?: boolean;
  latencyMs?: number;
  evaluation?: Record<string, unknown>;
  sessionId?: string;
}

/* ------------------------------------------------------------------ */
/* Salon (conversation)                                                 */
/* ------------------------------------------------------------------ */

export interface SalonCharacter {
  name: string;
  role: string;
  goal: string;
  knowledge: string[];
  privateMotivations: string[];
  style: string;
  constraints: string[];
  misconceptions: string[];
}

export interface SalonObjective {
  id: string;
  text: string;
  /** Deterministic: which hidden facts must be surfaced to satisfy it */
  requiresFacts?: string[];
}

export interface SalonHiddenFact {
  id: string;
  fact: string;
  /** Keywords in a user question that unlock this fact in seeded mode */
  triggers: string[];
  /** If true, the character resists revealing until rapport is adequate */
  guarded?: boolean;
}

export interface SalonScriptedLine {
  /** Keywords in user input to match */
  match: string[];
  reply: string;
  reveals?: string[]; // hidden fact ids
  rapportDelta?: number;
}

export interface SalonScenario {
  id: string;
  title: string;
  setting: string;
  character: SalonCharacter;
  objectives: SalonObjective[];
  hiddenFacts: SalonHiddenFact[];
  opening: string;
  /** Seeded responses used when no AI provider is configured */
  script: SalonScriptedLine[];
  fallbackReplies: string[];
  difficulty: Difficulty;
  subskills: SubskillId[];
  estimatedMinutes: number;
  origin: "seeded" | "generated";
}

export interface ConversationTurn {
  role: "user" | "character" | "system";
  text: string;
  at: ISODate;
  /** Classification of the user's turn */
  questionType?: QuestionType | "statement";
  leading?: boolean;
  revealed?: string[];
}

export type QuestionType =
  | "open"
  | "closed"
  | "clarifying"
  | "discriminating"
  | "counterfactual"
  | "motive"
  | "timeline"
  | "evidence"
  | "assumption"
  | "information_value";

export interface SalonSession extends Entity {
  scenarioId: string;
  status: "active" | "completed";
  turns: ConversationTurn[];
  rapport: number; // 0..1
  revealedFacts: string[];
  objectivesMet: string[];
  review?: SalonReview;
  sessionId?: string;
  completedAt?: ISODate;
}

export interface SalonReview {
  questionsAsked: number;
  questionsForcingNewInfo: number;
  leadingQuestions: number;
  talkShare: number; // 0..1 user's share of words
  objectivesMet: number;
  objectivesTotal: number;
  keyImprovements: string[];
  strongestMove?: string;
  score: number;
}

/* ------------------------------------------------------------------ */
/* Strategy                                                             */
/* ------------------------------------------------------------------ */

export type StrategyMode =
  | "three_moves"
  | "counterparty"
  | "incentive_map"
  | "option_value"
  | "red_team"
  | "premortem"
  | "second_order"
  | "negotiation"
  | "story";

export interface StrategyActor {
  name: string;
  goals: string[];
  constraints: string[];
  leverage: string[];
  fears: string[];
  alternatives: string[];
}

export interface StrategyMove {
  id: string;
  text: string;
  /** 0..1 */
  quality: number;
  consequence: string; // what the world does next
  counterpartyReply?: string;
  nextNodeId?: string;
  errorType?: ErrorType;
  reveals?: string;
}

export interface StrategyNode {
  id: string;
  situation: string;
  moves: StrategyMove[];
  terminal?: boolean;
  debrief?: string;
}

export interface StrategyScenario {
  id: string;
  title: string;
  mode: StrategyMode;
  setting: string;
  summary: string;
  actors: StrategyActor[];
  rootNodeId: string;
  nodes: StrategyNode[];
  difficulty: Difficulty;
  subskills: SubskillId[];
  estimatedMinutes: number;
  conceptLinks: string[];
  origin: "seeded" | "generated";
}

export interface StrategyRun extends Entity {
  scenarioId: string;
  status: "active" | "completed";
  path: { nodeId: string; moveId: string; at: ISODate; rationale?: string }[];
  currentNodeId: string;
  score?: number;
  debrief?: string;
  sessionId?: string;
  completedAt?: ISODate;
}

/* ------------------------------------------------------------------ */
/* Memory                                                               */
/* ------------------------------------------------------------------ */

export type MemoryKind =
  | "fact"
  | "concept"
  | "person"
  | "sequence"
  | "story"
  | "spatial"
  | "reconstruction"
  | "archive";

export interface MemoryItem extends Entity {
  kind: MemoryKind;
  prompt: string;
  answer: string;
  /** Extra acceptable answers */
  accept?: string[];
  hint?: string;
  /** For person items: structured card */
  person?: { name: string; profession: string; detail: string; interest: string; origin?: string };
  /** For sequence items */
  sequence?: string[];
  sourceRef?: { kind: EvidenceSourceKind; refId: string; label?: string };
  palaceLocusId?: string;
  /** Scheduling */
  ease: number; // SM-2 style, starts 2.5
  intervalDays: number;
  due: ISODate;
  reps: number;
  lapses: number;
  lastReviewedAt?: ISODate;
  suspended?: boolean;
  tags?: string[];
}

export interface MemoryReview extends Entity {
  itemId: string;
  grade: 0 | 1 | 2 | 3 | 4 | 5;
  correct: boolean;
  confidence?: number;
  latencyMs?: number;
  intervalBefore: number;
  intervalAfter: number;
  sessionId?: string;
}

export interface MemoryPalace extends Entity {
  name: string;
  description?: string;
  loci: MemoryLocus[];
}

export interface MemoryLocus {
  id: string;
  name: string;
  order: number;
  x: number; // 0..100 position on the room map
  y: number;
  image?: string; // the mnemonic image
}

/* ------------------------------------------------------------------ */
/* Archive                                                              */
/* ------------------------------------------------------------------ */

export type ArchiveKind =
  | "person"
  | "place"
  | "event"
  | "concept"
  | "work"
  | "institution"
  | "technology"
  | "movement"
  | "object"
  | "path";

export type ArchiveDomain =
  | "history"
  | "geography"
  | "economics"
  | "politics"
  | "science"
  | "psychology"
  | "philosophy"
  | "art"
  | "literature"
  | "music"
  | "food"
  | "business"
  | "technology"
  | "law";

export interface ArchiveEntry {
  id: string;
  kind: ArchiveKind;
  domain: ArchiveDomain;
  title: string;
  subtitle?: string;
  summary: string;
  what: string;
  why: string;
  before: string;
  after: string;
  connects: string;
  remember: string[];
  /** Approximate year (negative for BCE) for the timeline */
  yearStart?: number;
  yearEnd?: number;
  /** For places: approximate lon/lat for the world map */
  location?: { lat: number; lon: number; country?: string };
  tags: string[];
  /** Recall prompts generated into Memory Palace on save */
  recall: { prompt: string; answer: string }[];
  readingMinutes: number;
  origin: "seeded" | "generated";
  /** For paths: ordered entry ids */
  pathEntries?: string[];
}

export type ArchiveRelation =
  | "CAUSED"
  | "INFLUENCED"
  | "PRECEDED"
  | "CONTRASTS_WITH"
  | "LOCATED_IN"
  | "CREATED_BY"
  | "DEPENDS_ON"
  | "RESPONDED_TO"
  | "EXAMPLE_OF"
  | "RELATED_TO";

export interface ArchiveConnection {
  id: string;
  from: string;
  to: string;
  relation: ArchiveRelation;
  note?: string;
  /** user-made connections are stored in the DB with userId */
  userId?: string;
  createdAt?: ISODate;
}

export interface ArchiveProgress extends Entity {
  entryId: string;
  status: "unread" | "read" | "understood" | "retained";
  readAt?: ISODate;
  explainedAt?: ISODate;
  explanation?: string;
  explanationScore?: number;
  memoryItemIds: string[];
  timesUsed: number;
}

export interface ArchiveNote extends Entity {
  entryId: string;
  text: string;
}

export interface Curiosity {
  id: string;
  title: string;
  hook: string;
  body: string;
  connects: string[]; // archive entry ids
  domain: ArchiveDomain;
  origin: "seeded" | "generated";
}

export interface CuriosityView extends Entity {
  curiosityId: string;
  connectedTo: string[];
  note?: string;
}

/* ------------------------------------------------------------------ */
/* Reading                                                              */
/* ------------------------------------------------------------------ */

export type ReadingKind = "book" | "article" | "paper" | "essay" | "report";
export type ReadingStatus = "reading" | "up_next" | "finished" | "reference";

export interface ReadingItem extends Entity {
  kind: ReadingKind;
  title: string;
  author?: string;
  status: ReadingStatus;
  why?: string;
  question?: string;
  keyIdea?: string;
  argument?: string;
  evidence?: string;
  surprise?: string;
  disagreement?: string;
  connections: string[]; // archive entry ids
  unresolved?: string;
  reconstruction?: string;
  reconstructionAt?: ISODate;
  finishedAt?: ISODate;
}

/* ------------------------------------------------------------------ */
/* Rhetoric                                                             */
/* ------------------------------------------------------------------ */

export type RhetoricMode =
  | "one_sentence"
  | "thirty_seconds"
  | "three_people"
  | "story"
  | "anecdote"
  | "analogy"
  | "argument"
  | "steelman"
  | "precision"
  | "question"
  | "impromptu";

export interface RhetoricPrompt {
  id: string;
  mode: RhetoricMode;
  title: string;
  prompt: string;
  /** Source text for precision/steelman modes */
  source?: string;
  constraints?: { maxWords?: number; maxSentences?: number; prepSeconds?: number; responseSeconds?: number };
  rubric: { criterion: string; weight: number }[];
  /** Keywords an ideal answer likely touches, for deterministic feedback */
  keyPoints?: string[];
  difficulty: Difficulty;
  subskills: SubskillId[];
  origin: "seeded" | "generated";
}

export interface RhetoricEntry extends Entity {
  promptId: string;
  mode: RhetoricMode;
  text: string;
  wordCount: number;
  latencyMs?: number;
  feedback?: RhetoricFeedback;
  audioNote?: string;
  sessionId?: string;
}

export interface RhetoricFeedback {
  score: number;
  strengths: string[];
  improvements: string[];
  metrics: { words: number; sentences: number; avgSentenceLength: number; fillerCount: number; hedgeCount: number };
  aiEvaluated: boolean;
}

export interface VoiceSession extends Entity {
  promptId?: string;
  durationMs: number;
  transcript?: string;
  metrics?: { fillerWords: number; wordsPerMinute?: number; words?: number };
  /** audio is not persisted unless explicitly configured */
}

/* ------------------------------------------------------------------ */
/* Decisions, forecasts                                                 */
/* ------------------------------------------------------------------ */

export interface DecisionEntry extends Entity {
  title: string;
  options: string[];
  chosen?: string;
  currentBelief: string;
  expectedOutcome: string;
  confidence: number; // 0..1
  assumptions: string[];
  changeMind: string;
  risks: string[];
  reviewDate: ISODate;
  status: "open" | "reviewed";
  review?: DecisionReview;
}

export interface DecisionReview {
  reviewedAt: ISODate;
  whatHappened: string;
  luck: string;
  skill: string;
  missed: string;
  outcomeQuality: number; // 0..1
  decisionQuality: number; // 0..1
}

export type ForecastCategory = "personal" | "economics" | "technology" | "politics" | "sports" | "business" | "other";

export interface Forecast extends Entity {
  question: string;
  probability: number; // 0..1
  reasoning: string;
  evidence: string;
  changeMind: string;
  resolutionDate: ISODate;
  category: ForecastCategory;
  status: "open" | "resolved";
  resolvedAt?: ISODate;
  outcome?: boolean;
  brier?: number;
  history: { at: ISODate; probability: number; note?: string }[];
}

/* ------------------------------------------------------------------ */
/* Fieldwork, investigations                                            */
/* ------------------------------------------------------------------ */

export interface FieldAssignment {
  id: string;
  title: string;
  kind: "observation" | "recall" | "conversation" | "memory" | "curiosity" | "city" | "news" | "decision";
  brief: string;
  steps: string[];
  ethics: string[];
  reportPrompts: string[];
  subskills: SubskillId[];
  estimatedMinutes: number;
}

export interface FieldReport extends Entity {
  assignmentId: string;
  status: "assigned" | "completed" | "skipped";
  assignedAt: ISODate;
  completedAt?: ISODate;
  responses: Record<string, string>;
  reflection?: string;
}

export interface Investigation extends Entity {
  title: string;
  question: string;
  whyItMatters: string;
  threads: { id: string; title: string; note: string }[];
  sources: { id: string; title: string; note?: string; url?: string }[];
  claims: { id: string; text: string; support: "strong" | "moderate" | "weak" | "contested" }[];
  counterclaims: { id: string; text: string; against?: string }[];
  notes: { id: string; text: string; at: ISODate }[];
  archiveConnections: string[];
  openQuestions: string[];
  position?: string;
  synthesis?: string;
  status: "open" | "synthesised" | "archived";
  templateId?: string;
}

/* ------------------------------------------------------------------ */
/* Red thread, after action                                              */
/* ------------------------------------------------------------------ */

export type RedThreadType =
  | "observation"
  | "reasoning"
  | "memory"
  | "confidence"
  | "conversational"
  | "strategic"
  | "knowledge"
  | "writing";

export type RedThreadStatus = "candidate" | "emerging" | "established" | "improving" | "resolved";
export type RedThreadConfidence = "low" | "emerging" | "moderate" | "strong";

export interface RedThread extends Entity {
  patternType: RedThreadType;
  patternKey: string; // e.g. PREMATURE_CLOSURE
  title: string;
  description: string;
  evidenceIds: string[]; // ErrorEvent ids
  counterEvidenceIds: string[]; // SkillEvidence ids showing improvement
  strength: number; // 0..1
  confidence: RedThreadConfidence;
  status: RedThreadStatus;
  firstDetected: ISODate;
  lastReinforced: ISODate;
  nextTest: string;
  targetSubskill?: SubskillId;
  sessionsObserved: string[];
  resolvedAt?: ISODate;
}

export interface AfterAction extends Entity {
  source: { kind: EvidenceSourceKind; refId: string; label?: string };
  title: string;
  saw: string[];
  missed: string[];
  assumed: string[];
  didWell: string[];
  turningPoint?: string;
  oneThing: string;
  reasoningPath?: ReasoningPathPoint[];
  score?: number;
  sessionId?: string;
}

/* ------------------------------------------------------------------ */
/* Sessions                                                             */
/* ------------------------------------------------------------------ */

export type SessionModuleKind =
  | "arrival"
  | "glance"
  | "question"
  | "case"
  | "archive"
  | "recall"
  | "salon"
  | "strategy"
  | "rhetoric"
  | "inference"
  | "cabinet"
  | "fieldwork"
  | "forecast"
  | "after_action";

export interface SessionItem {
  id: string;
  kind: SessionModuleKind;
  title: string;
  minutes: number;
  /** Why the engine chose this item */
  reason: "due" | "thread" | "current" | "serendipity" | "strength" | "foundation" | "ritual" | "transfer";
  reasonText: string;
  href: string;
  refId?: string;
  status: "pending" | "active" | "done" | "skipped";
  completedAt?: ISODate;
}

export interface DailySession extends Entity {
  date: string; // YYYY-MM-DD
  length: SessionLength;
  items: SessionItem[];
  status: "planned" | "active" | "completed";
  startedAt?: ISODate;
  completedAt?: ISODate;
  currentIndex: number;
}

/* ------------------------------------------------------------------ */
/* Curator                                                              */
/* ------------------------------------------------------------------ */

export type CuratorMode =
  | "observe"
  | "reason"
  | "question"
  | "teach"
  | "challenge"
  | "debate"
  | "strategize"
  | "review"
  | "explore"
  | "remember";

export interface CuratorMessage {
  role: "user" | "curator";
  text: string;
  at: ISODate;
  mode?: CuratorMode;
  /** For knowledge answers: offer to save/test */
  offers?: { saveToArchive?: boolean; testLater?: boolean; saved?: boolean; scheduled?: boolean };
}

export interface CuratorConversation extends Entity {
  title: string;
  mode: CuratorMode;
  messages: CuratorMessage[];
  contextRef?: { kind: EvidenceSourceKind; refId: string };
  independentAttempts: number;
}

/* ------------------------------------------------------------------ */
/* Notifications, misc                                                  */
/* ------------------------------------------------------------------ */

export type NotificationKind =
  | "memory_due"
  | "forecast_resolvable"
  | "decision_review"
  | "thread_detected"
  | "thread_improved"
  | "connection_discovered"
  | "investigation_reminder"
  | "milestone";

export interface Notification extends Entity {
  kind: NotificationKind;
  title: string;
  body: string;
  href?: string;
  read: boolean;
}

export interface Milestone extends Entity {
  key: string;
  title: string;
  description: string;
  reachedAt: ISODate;
}

export interface GeneratedContent extends Entity {
  kind: "case" | "salon" | "strategy" | "archive" | "curiosity" | "rhetoric";
  refId: string;
  payload: unknown;
  model?: string;
}
