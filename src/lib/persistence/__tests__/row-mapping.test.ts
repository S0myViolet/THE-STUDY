import "fake-indexeddb/auto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { CaseAttempt, Entity, MemoryItem, Preferences, RedThread, UserProfile } from "@/lib/domain/types";
import type {
  ApplicationRecord,
  AssistanceEvent,
  ConceptEvidence,
  ConceptMastery,
  DailyPlan,
  ErrorRecord,
  ExamAttempt,
  GeneratedV2,
  KnowledgeEdge,
  KnowledgeNode,
  LessonSession,
  LibrarySource,
  PracticeAttempt,
  Project,
  ReadingRecall,
  ReadingSession,
  RetrievalItem,
  RetrievalReview,
  SpeakingSession,
  StudyLog,
  TutorConversation,
  WritingEntry,
  WritingFeedback,
  WritingVersion,
} from "@/lib/v2/types";
import { COLLECTIONS, LOCAL_INDEXES, V2_COLLECTIONS, type CollectionName } from "@/lib/persistence/collections";
import { LocalDatabase } from "@/lib/persistence/local";
import { stamp } from "@/lib/persistence/store";
import { fromRow, toRow } from "@/lib/persistence/supabase";

/* ------------------------------------------------------------------ */
/* Samples: every field populated so column coverage is exhaustive      */
/* ------------------------------------------------------------------ */

const USER = "11111111-1111-4111-8111-111111111111";
const T0 = "2026-09-01T09:00:00.000Z";
const T1 = "2026-09-01T09:25:00.000Z";
const T2 = "2026-09-08T09:00:00.000Z";

/** Every field present, optional ones included, so a missing column cannot hide behind `undefined`. */
type Full<T> = Required<T>;

const caseAttempt: Full<CaseAttempt> = {
  id: "ca_sample01",
  userId: USER,
  createdAt: T0,
  updatedAt: T1,
  caseId: "case-the-quiet-ledger",
  status: "completed",
  currentStageIndex: 10,
  startedAt: T0,
  completedAt: T1,
  sessionId: "ds_20260901",
  summary: {
    recallCorrect: 7,
    recallTotal: 9,
    falseRecalls: 1,
    separationAccuracy: 0.8,
    hypothesesCount: 3,
    alternativesCount: 2,
    questionInformationValue: 0.6,
    confidenceBefore: 0.7,
    confidenceAfter: 0.45,
    decisionQuality: 0.75,
    overallScore: 0.68,
    reasoningPath: [
      { label: "Ledger gap noticed", kind: "evidence", note: "March entries missing" },
      { label: "Confidence in fraud", kind: "confidence", value: 0.7 },
    ],
    noticed: ["missing March entries"],
    missed: ["second signature"],
    assumptions: ["the clerk kept the books alone"],
    didWell: ["asked about the audit schedule"],
    turningPoint: "The audit letter",
    oneThing: "Check who else had access before naming a culprit.",
  },
};

const memoryItem: Full<MemoryItem> = {
  id: "mi_sample01",
  userId: USER,
  createdAt: T0,
  updatedAt: T1,
  kind: "person",
  prompt: "Who ran the Venetian mint in your case?",
  answer: "Marco Sanudo",
  accept: ["Sanudo"],
  hint: "Surname begins with S",
  person: { name: "Marco Sanudo", profession: "Mint master", detail: "Kept two ledgers", interest: "Coin weights", origin: "Venice" },
  sequence: ["arrive", "weigh", "record"],
  sourceRef: { kind: "case", refId: "case-the-quiet-ledger", label: "The Quiet Ledger" },
  palaceLocusId: "locus_hall_01",
  ease: 2.5,
  intervalDays: 3,
  due: "2026-09-04T09:00:00.000Z",
  reps: 2,
  lapses: 0,
  lastReviewedAt: T1,
  suspended: false,
  tags: ["venice", "people"],
};

const redThread: Full<RedThread> = {
  id: "rt_sample01",
  userId: USER,
  createdAt: T0,
  updatedAt: T1,
  patternType: "reasoning",
  patternKey: "PREMATURE_CLOSURE",
  title: "Settling early",
  description: "Three cases where the first plausible explanation was accepted before the evidence stage.",
  evidenceIds: ["ee_1", "ee_2", "ee_3"],
  counterEvidenceIds: ["se_9"],
  strength: 0.62,
  confidence: "moderate",
  status: "emerging",
  firstDetected: T0,
  lastReinforced: T1,
  nextTest: "A case whose correct conclusion is insufficient evidence.",
  targetSubskill: "inference.alternatives",
  sessionsObserved: ["ds_20260828", "ds_20260901"],
  resolvedAt: T1,
};

/* ---- V2 (migration 0002) ---- */

const profile: Full<UserProfile> = {
  id: "profile_sample01",
  userId: USER,
  createdAt: T0,
  updatedAt: T1,
  displayName: "Ada",
  goals: ["thinking", "knowledge"],
  interests: ["history", "economics"],
  onboardingComplete: true,
  baselineComplete: true,
  isDemo: false,
  enteredAt: T0,
  timezone: "Europe/London",
  v2: {
    goals: ["reasoning", "quantitative"],
    interests: ["history", "ai"],
    educationLevel: "bachelor",
    dailyMinutes: 60,
    onboardingComplete: true,
    baselineAttemptId: "ea_sample01",
    baselineSkipped: false,
    startedAt: T0,
    v1ImportedAt: T1,
  },
};

const preferences: Full<Preferences> = {
  id: "prefs_sample01",
  userId: USER,
  createdAt: T0,
  updatedAt: T1,
  sessionLength: "standard",
  preferredFaculties: ["inference"],
  thinkFirst: true,
  pressureDefault: "standard",
  fieldworkEnabled: true,
  curiositiesEnabled: true,
  newsEnabled: false,
  appearance: "system",
  curatorDepth: "standard",
  challengeStyle: "demanding",
  reducedMotion: false,
  soundEnabled: false,
  planMode: "custom",
  customMinutes: 60,
  lessonDepth: "deep",
  readingPace: 2,
};

const conceptMastery: Full<ConceptMastery> = {
  id: "cm_sample01",
  userId: USER,
  createdAt: T0,
  updatedAt: T2,
  conceptId: "probability.conditional_probability",
  state: "retained",
  estimate: 0.71,
  evidenceConfidence: "medium",
  evidenceMass: 9.4,
  evidenceCount: 6,
  counts: { guided: 2, independent: 3, delayed: 1 },
  successes: { guided: 2, independent: 2, delayed: 1 },
  firstExposedAt: T0,
  lastEvidenceAt: T2,
  lastSuccessAt: T2,
  lastDelayedSuccessAt: T2,
  longestSuccessfulDelayDays: 7,
  consecutiveFailures: 0,
  trend: "up",
  history: [
    { at: T0, estimate: 0.35 },
    { at: T1, estimate: 0.52 },
    { at: T2, estimate: 0.71 },
  ],
};

const practiceAttempt: Full<PracticeAttempt> = {
  id: "pa_sample01",
  userId: USER,
  createdAt: T1,
  updatedAt: T1,
  itemId: "it-probability-04",
  skill: "probability",
  subskill: "conditional_probability",
  concepts: ["probability.conditional_probability", "probability.base_rates"],
  level: "intermediate",
  difficulty: 4,
  format: "numeric",
  response: 0.083,
  correct: true,
  score: 1,
  confidence: 0.6,
  hintsUsed: 1,
  solutionRevealed: false,
  retries: 1,
  timeMs: 84_500,
  errorCategory: "UNDERCONFIDENCE",
  evaluation: { feedback: "Right value; the tree diagram was the fastest route.", strengths: ["set up the joint table"], improvements: ["state the reference class first"], covered: ["joint"], missed: [], aiEvaluated: false },
  context: "train",
  contextRef: "ls-probability-conditional-1",
  planItemId: "pi_01",
};

const examAttempt: Full<ExamAttempt> = {
  id: "ea_sample01",
  userId: USER,
  createdAt: T1,
  updatedAt: T2,
  blueprintId: "exam-weekly",
  kind: "weekly",
  title: "Weekly examination",
  status: "completed",
  startedAt: T1,
  completedAt: T2,
  timeLimitMinutes: 40,
  form: {
    sections: [
      { id: "quant", title: "Quantitative", weight: 0.5, itemIds: ["it-probability-04"] },
      { id: "writing", title: "Writing", weight: 0.3, itemIds: [], writingPromptId: "wp-1" },
      { id: "memory", title: "Memory", weight: 0.2, itemIds: ["it-history-02"], memoryStudy: { itemIds: ["it-history-02"], studySeconds: 90 } },
    ],
    items: {
      "it-probability-04": { id: "it-probability-04", skill: "probability", subskill: "conditional_probability", concepts: ["probability.conditional_probability"], level: "intermediate", difficulty: 4, format: "numeric", prompt: "A test is 90% sensitive...", answer: 0.083, tolerance: 0.005, solution: "Bayes: 0.09 / 1.08", passageId: "pas-screening" },
      "it-history-02": { id: "it-history-02", skill: "knowledge", subskill: "dates", concepts: ["history.westphalia"], level: "basic", difficulty: 2, format: "short", prompt: "Year of the Peace of Westphalia?", answer: "1648", accept: ["1648 CE"], keyPoints: ["1648"], solution: "1648." },
    },
    passages: { "pas-screening": { title: "Screening", text: "A screening test..." } },
    seed: 42,
  },
  responses: {
    "it-probability-04": { response: 0.083, confidence: 0.7, timeMs: 61_000, correct: true, score: 1 },
    "it-history-02": { response: "1648", confidence: 0.9, timeMs: 8_000, correct: true, score: 1 },
    "wp-1": { response: "Argument text.", timeMs: 900_000, score: 0.7 },
  },
  sectionIndex: 3,
  result: {
    total: 0.86,
    sections: [
      { id: "quant", title: "Quantitative", weight: 0.5, score: 1, correct: 1, count: 1 },
      { id: "writing", title: "Writing", weight: 0.3, score: 0.7, correct: 0, count: 1 },
      { id: "memory", title: "Memory", weight: 0.2, score: 1, correct: 1, count: 1 },
    ],
    bySkill: { probability: { score: 1, n: 1 }, knowledge: { score: 1, n: 1 } },
    byConcept: { "probability.conditional_probability": { score: 1, n: 1 } },
    calibration: { brier: 0.05, verdict: "well_calibrated", n: 2 },
    comparedTo: { attemptId: "ea_sample00", delta: 0.1, improved: ["probability"], flat: ["knowledge"], declined: [] },
    interventions: ["Write the counterargument before the conclusion."],
    writingOverall: 0.7,
  },
  planItemId: "pi_03",
};

const project: Full<Project> = {
  id: "pj_sample01",
  userId: USER,
  createdAt: T0,
  updatedAt: T2,
  kind: "investigation",
  title: "Why did Venice decline?",
  question: "Was the decline of Venetian trade after 1500 caused by the Cape route?",
  whyItMatters: "It tests whether a single cause can carry a century of change.",
  whatIThinkNow: "Mostly the Cape route, but the Ottoman wars mattered.",
  requiredConcepts: ["history.venice", "causal_reasoning.confounding"],
  appliedConcepts: ["causal_reasoning.confounding"],
  sources: [{ id: "s1", title: "Braudel, The Mediterranean", note: "Vol. 1, ch. 3", url: "https://example.org/braudel", sourceId: "ls_sample01" }],
  notes: [{ id: "n1", text: "Pepper prices fell in Venice after 1503.", at: T1 }],
  claims: [{ id: "c1", text: "The Cape route cut Venetian spice income.", support: "moderate" }],
  evidence: [{ id: "e1", text: "Lisbon pepper undercut Venice by a third.", claimId: "c1", sourceRef: "s1", provenance: "source_claim" }],
  counterarguments: [{ id: "x1", text: "Venetian spice trade recovered by 1560.", against: "c1" }],
  openQuestions: ["How large was the Ottoman effect?"],
  milestones: [{ id: "m1", title: "Read Braudel ch. 3", done: true, doneAt: T1 }],
  finalOutput: "A two-page argument.",
  retrospective: { text: "I settled on one cause too early.", at: T2 },
  status: "completed",
  templateId: "pt-venice",
  startedAt: T0,
  completedAt: T2,
};

const retrievalItem: Full<RetrievalItem> = {
  id: "ri_sample01",
  userId: USER,
  createdAt: T0,
  updatedAt: T2,
  mode: "concept",
  prompt: "What does conditioning on an event do to the sample space?",
  answer: "It restricts it to the outcomes where the event occurred and renormalises.",
  accept: ["restricts and renormalises"],
  keyPoints: ["restriction", "renormalisation"],
  conceptId: "probability.conditional_probability",
  nodeId: "conditional-probability",
  source: { kind: "lesson", refId: "ls-probability-conditional-1", label: "Conditional probability" },
  ease: 2.6,
  intervalDays: 12,
  due: "2026-09-20T09:00:00.000Z",
  reps: 3,
  lapses: 0,
  stage: 2,
  lastReviewedAt: T2,
  suspended: false,
  encoding: "elaboration",
  tags: ["probability"],
};

const dailyPlan: Full<DailyPlan> = {
  id: "dp_sample01",
  userId: USER,
  createdAt: T2,
  updatedAt: T2,
  date: "2026-09-08",
  mode: "standard",
  minutes: 90,
  items: [
    { id: "pi_01", kind: "recall", title: "Six retrievals due", minutes: 10, href: "/memory/review", reason: "retrieval_due", reasonText: "Six items are due today.", priority: 2, status: "done", completedAt: T2 },
    { id: "pi_02", kind: "learn", title: "Conditional probability", minutes: 30, href: "/learn/lesson/ls-probability-conditional-1", refId: "ls-probability-conditional-1", conceptIds: ["probability.conditional_probability"], reason: "curriculum", reasonText: "Next on the quantitative path.", priority: 4, optional: false, status: "active" },
  ],
  narrative: "Retrievals first, then the lesson.",
  signals: { dueRetrievals: 6, foundationGaps: ["mathematics.fractions"], recurringErrors: ["BASE_RATE_NEGLECT:probability.base_rates"], activeBook: "ls_sample01", activeProject: "pj_sample01", examDue: "weekly", weakestSkills: ["statistics"] },
  status: "active",
  startedAt: T2,
  completedAt: T2,
};

const conceptEvidence: Full<ConceptEvidence> = {
  id: "ce_sample01",
  userId: USER,
  createdAt: T1,
  updatedAt: T1,
  conceptId: "probability.conditional_probability",
  kind: "independent",
  score: 1,
  correct: true,
  difficulty: 4,
  scaffolded: false,
  hintsUsed: 0,
  delayDays: 0,
  transfer: 1,
  confidence: 0.6,
  weight: 1.15,
  independent: true,
  latencyMs: 84_500,
  source: { kind: "practice", refId: "pa_sample01", label: "Train" },
  planItemId: "pi_01",
};

const lessonSession: Full<LessonSession> = {
  id: "lsn_sample01",
  userId: USER,
  createdAt: T0,
  updatedAt: T1,
  lessonId: "ls-probability-conditional-1",
  conceptIds: ["probability.conditional_probability"],
  depth: "standard",
  stepIndex: 7,
  status: "completed",
  responses: { q1: "The second test", checkpoint: [1, 0, 1] },
  checkpointScore: 0.67,
  explainBack: { text: "Conditioning restricts the sample space to the event.", score: 0.8, feedback: "Named the restriction; missed renormalisation.", aiEvaluated: false },
  transferScore: 0.5,
  startedAt: T0,
  completedAt: T1,
  minutes: 24,
  planItemId: "pi_02",
};

const errorRecord: Full<ErrorRecord> = {
  id: "er_sample01",
  userId: USER,
  createdAt: T1,
  updatedAt: T2,
  category: "BASE_RATE_NEGLECT",
  skill: "probability",
  concepts: ["probability.base_rates", "probability.conditional_probability"],
  question: "A test is 90% sensitive and 95% specific; prevalence is 1%. P(disease | positive)?",
  response: "0.9",
  correctReasoning: "Weight the sensitivity by the prevalence before comparing it with the false positives from the healthy majority.",
  confidence: 0.85,
  source: { kind: "practice", refId: "pa_sample02" },
  recurrenceKey: "BASE_RATE_NEGLECT:probability.base_rates",
  remediatedAt: T2,
};

const retrievalReview: Full<RetrievalReview> = {
  id: "rr_sample01",
  userId: USER,
  createdAt: T2,
  updatedAt: T2,
  itemId: "ri_sample01",
  conceptId: "probability.conditional_probability",
  grade: 4,
  correct: true,
  score: 0.9,
  confidence: 0.7,
  latencyMs: 6_200,
  mode: "concept",
  intervalBefore: 4,
  intervalAfter: 12,
  delayDays: 4,
  response: "It restricts the space to the event and renormalises.",
  planItemId: "pi_01",
};

const librarySource: Full<LibrarySource> = {
  id: "ls_sample01",
  userId: USER,
  createdAt: T0,
  updatedAt: T2,
  type: "book",
  title: "The Mediterranean and the Mediterranean World in the Age of Philip II",
  author: "Fernand Braudel",
  year: 1949,
  status: "reading",
  why: "To see whether geography explains more than politics.",
  currentQuestion: "What did the Cape route change first?",
  concepts: ["history.venice"],
  projectIds: ["pj_sample01"],
  seedId: "src-braudel-mediterranean",
  unitLabel: "chapter",
  totalUnits: 12,
  progressUnit: 3,
  comprehension: 0.7,
  retention: 0.6,
  connectionsCount: 2,
  startedAt: T0,
  completedAt: T2,
  notes: "Volume one only.",
};

const readingSession: Full<ReadingSession> = {
  id: "rs_sample01",
  userId: USER,
  createdAt: T1,
  updatedAt: T2,
  sourceId: "ls_sample01",
  question: "What did the Cape route change first?",
  fromUnit: 3,
  toUnit: 3,
  minutes: 35,
  startedAt: T1,
  endedAt: T2,
  status: "closed",
  recallId: "rc_sample01",
  planItemId: "pi_04",
};

const readingRecall: Full<ReadingRecall> = {
  id: "rc_sample01",
  userId: USER,
  createdAt: T2,
  updatedAt: T2,
  sourceId: "ls_sample01",
  sessionId: "rs_sample01",
  centralIdeas: "Pepper prices in Venice fell after 1503, before volumes did.",
  argument: "Trade routes shift slowly; prices move first.",
  evidence: "Lisbon undercut Venice by about a third.",
  unclear: "How the Ottoman wars interact with the route change.",
  disagree: "The recovery by 1560 is underplayed.",
  connections: "Links to elasticity of supply.",
  extracted: [{ title: "Price signals precede volume", conceptId: "economics.price_signals", nodeId: "price-signal", note: "Chapter 3" }],
  score: 0.72,
  feedback: "Four of five ideas recalled; the recovery was missed.",
  aiEvaluated: false,
  retrievalItemIds: ["ri_sample02"],
};

const knowledgeNode: Full<KnowledgeNode> = {
  id: "kn_sample01",
  userId: USER,
  createdAt: T1,
  updatedAt: T1,
  key: "congress-of-vienna",
  kind: "event",
  title: "Congress of Vienna",
  domainId: "history",
  summary: "The 1814 to 1815 settlement that reorganised Europe after Napoleon.",
  conceptId: "history.balance_of_power",
  source: { kind: "reading", refId: "ls_sample01" },
  year: 1815,
  tags: ["diplomacy"],
};

const knowledgeEdge: Full<KnowledgeEdge> = {
  id: "ke_sample01",
  userId: USER,
  createdAt: T1,
  updatedAt: T1,
  from: "congress-of-vienna",
  to: "balance-of-power",
  relation: "EXAMPLE_OF",
  note: "The settlement was designed around it.",
  origin: "user",
};

const writingEntry: Full<WritingEntry> = {
  id: "we_sample01",
  userId: USER,
  createdAt: T1,
  updatedAt: T2,
  promptId: "wp-3",
  level: 3,
  title: "Should Venice have fought for the spice trade?",
  prompt: "Construct an argument for or against, answering the strongest objection.",
  status: "reviewed",
  currentVersion: 2,
  concepts: ["history.venice"],
  wordCount: 640,
  latestFeedbackId: "wf_sample01",
  contextRef: { kind: "exam", refId: "ea_sample01" },
  timeMs: 1_800_000,
  planItemId: "pi_05",
};

const writingVersion: Full<WritingVersion> = {
  id: "wv_sample01",
  userId: USER,
  createdAt: T2,
  updatedAt: T2,
  entryId: "we_sample01",
  version: 2,
  text: "Venice could not have held the spice trade by force; the route, not the fleet, had changed.",
  wordCount: 640,
};

const writingFeedback: Full<WritingFeedback> = {
  id: "wf_sample01",
  userId: USER,
  createdAt: T2,
  updatedAt: T2,
  entryId: "we_sample01",
  version: 2,
  scores: { clarity: 0.8, structure: 0.7, precision: 0.6, logic: 0.7, evidence: 0.5, counterargument: 0.4, depth: 0.6, synthesis: 0.5, originality: 0.5 },
  overall: 0.6,
  passages: [{ quote: "Venice could not have held the spice trade by force", note: "State the mechanism before the verdict.", criterion: "logic" }],
  strengths: ["A clear thesis in the first sentence."],
  improvements: ["Answer the strongest objection rather than the easiest."],
  metrics: { words: 640, sentences: 31, avgSentenceLength: 20.6, hedges: 4, passiveHints: 3, paragraphs: 6 },
  aiEvaluated: false,
};

const speakingSession: Full<SpeakingSession> = {
  id: "ss_sample01",
  userId: USER,
  createdAt: T2,
  updatedAt: T2,
  promptId: "sp-2",
  mode: "explain_60",
  durationMs: 58_000,
  transcript: "Conditional probability is the chance of one thing given that another has happened.",
  transcriptSource: "typed",
  metrics: { words: 140, wordsPerMinute: 145, fillers: 3, repetitions: 1, sentences: 9, avgSentenceLength: 15.6 },
  rubricScores: { clarity: 0.7, accuracy: 0.8 },
  overall: 0.75,
  feedback: "Named the restriction; the example came late.",
  aiEvaluated: false,
  recorded: false,
  concepts: ["probability.conditional_probability"],
  planItemId: "pi_06",
};

const studyLog: Full<StudyLog> = {
  id: "sl_sample01",
  userId: USER,
  createdAt: T2,
  updatedAt: T2,
  date: "2026-09-08",
  kind: "learn",
  refId: "ls-probability-conditional-1",
  minutes: 30,
  planItemId: "pi_02",
};

const tutorConversation: Full<TutorConversation> = {
  id: "tc_sample01",
  userId: USER,
  createdAt: T1,
  updatedAt: T1,
  title: "Why does conditioning renormalise?",
  mode: "socratic",
  messages: [
    { role: "user", text: "Why divide by P(B)?", at: T1 },
    { role: "curator", text: "What must the probabilities inside B add up to?", at: T1, mode: "socratic", thinkFirst: true, provenance: "ai_suggestion", offers: { saveToKnowledge: true, scheduleRetrieval: true, saved: false, scheduled: false, conceptId: "probability.conditional_probability" } },
  ],
  contextRef: { kind: "lesson", refId: "ls-probability-conditional-1" },
  conceptIds: ["probability.conditional_probability"],
  independentAttempts: 1,
  directAnswerRequests: 0,
};

const assistanceEvent: Full<AssistanceEvent> = {
  id: "ae_sample01",
  userId: USER,
  createdAt: T1,
  updatedAt: T1,
  kind: "hint",
  source: { kind: "practice", refId: "pa_sample01" },
  conceptIds: ["probability.conditional_probability"],
};

const application: Full<ApplicationRecord> = {
  id: "ap_sample01",
  userId: USER,
  createdAt: T2,
  updatedAt: T2,
  kind: "explained_to_someone",
  title: "Explained base rates to a colleague",
  description: "Used the screening example over lunch.",
  conceptIds: ["probability.base_rates"],
  reflection: "The tree diagram landed; the formula did not.",
  selfRating: 0.7,
};

const generatedV2: Full<GeneratedV2> = {
  id: "gv_sample01",
  userId: USER,
  createdAt: T2,
  updatedAt: T2,
  kind: "item",
  refId: "it-generated-01",
  payload: { prompt: "A generated practice item.", format: "short", answer: "renormalise" },
  model: "default",
  conceptIds: ["probability.base_rates"],
};

/** Table -> fully populated entity. Every V2 collection has one; V1 keeps a representative few. */
const SAMPLES: [CollectionName, Entity][] = [
  ["case_attempts", caseAttempt],
  ["memory_items", memoryItem],
  ["red_threads", redThread],
  ["profiles", profile],
  ["preferences", preferences],
  ["concept_mastery", conceptMastery],
  ["concept_evidence", conceptEvidence],
  ["lesson_sessions", lessonSession],
  ["practice_attempts", practiceAttempt],
  ["error_records", errorRecord],
  ["retrieval_items", retrievalItem],
  ["retrieval_reviews", retrievalReview],
  ["library_sources", librarySource],
  ["reading_sessions", readingSession],
  ["reading_recalls", readingRecall],
  ["knowledge_nodes", knowledgeNode],
  ["knowledge_edges", knowledgeEdge],
  ["writing_entries", writingEntry],
  ["writing_versions", writingVersion],
  ["writing_feedback", writingFeedback],
  ["speaking_sessions", speakingSession],
  ["projects", project],
  ["exam_attempts", examAttempt],
  ["daily_plans", dailyPlan],
  ["study_logs", studyLog],
  ["tutor_conversations", tutorConversation],
  ["assistance_events", assistanceEvent],
  ["applications", application],
  ["generated_v2", generatedV2],
];

const camelToSnake = (s: string) => s.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase());

/* ------------------------------------------------------------------ */
/* toRow / fromRow                                                       */
/* ------------------------------------------------------------------ */

describe("toRow / fromRow", () => {
  it.each(SAMPLES)("round-trips a %s row", (_table, entity) => {
    const row = toRow(entity as unknown as Record<string, unknown>);
    for (const key of Object.keys(row)) expect(key).toMatch(/^[a-z][a-z0-9_]*$/);
    expect(row.user_id).toBe(USER);
    expect(row.created_at).toBe(entity.createdAt);
    const back = fromRow<Entity>(row);
    expect(back).toEqual(entity);
  });

  it("maps undefined to null on the way out and drops null on the way back", () => {
    const row = toRow({ id: "x", userId: USER, createdAt: T0, updatedAt: T0, completedAt: undefined, sessionId: "s" });
    expect(row.completed_at).toBeNull();
    expect(row.session_id).toBe("s");
    const back = fromRow<Record<string, unknown>>(row);
    expect("completedAt" in back).toBe(false);
    expect(back.sessionId).toBe("s");
  });

  it("keeps nested objects untouched (jsonb columns are stored as-is)", () => {
    const row = toRow(caseAttempt as unknown as Record<string, unknown>);
    expect(row.summary).toBe(caseAttempt.summary);
    expect(Object.keys(row.summary as object)).toContain("recallCorrect");
    const exam = toRow(examAttempt as unknown as Record<string, unknown>);
    expect(exam.form).toBe(examAttempt.form);
    expect(Object.keys((exam.form as ExamAttempt["form"]).items)).toContain("it-probability-04");
    const prof = toRow(profile as unknown as Record<string, unknown>);
    expect(prof.v2).toBe(profile.v2);
    expect(Object.keys(prof.v2 as object)).toContain("onboardingComplete");
  });
});

/* ------------------------------------------------------------------ */
/* Schema coverage: entity keys -> columns across every migration file   */
/* ------------------------------------------------------------------ */

interface TableDef {
  columns: string[];
}

const RESERVED_TOKENS = ["constraint", "check", "unique", "foreign", "primary"];

/** `create table` statements: one entry per table, columns in declaration order. */
function parseCreateTables(sql: string, tables: Record<string, TableDef>) {
  const re = /create table (?:if not exists )?(?:public\.)?([a-z_][a-z0-9_]*)\s*\(([\s\S]*?)\n\);/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql))) {
    const name = m[1];
    const body = m[2];
    const columns: string[] = [];
    for (const raw of body.split("\n")) {
      const line = raw.trim();
      if (!line || line.startsWith("--")) continue;
      const first = /^("?[a-z_][a-z0-9_]*"?)\s+/i.exec(line);
      if (!first) continue;
      const token = first[1].replace(/"/g, "").toLowerCase();
      if (RESERVED_TOKENS.includes(token)) continue;
      // continuation lines of a multi-line check() start with "check" and are skipped above
      columns.push(token);
    }
    if (tables[name]) throw new Error(`table ${name} is created twice across the migrations`);
    tables[name] = { columns };
  }
}

/** `alter table … add column [if not exists] …` statements: appends to an existing table (one or many columns per statement). */
function parseAlterAddColumns(sql: string, tables: Record<string, TableDef>) {
  const stmt = /alter table (?:if exists )?(?:only )?(?:public\.)?([a-z_][a-z0-9_]*)\s+([\s\S]*?);/gi;
  let m: RegExpExecArray | null;
  while ((m = stmt.exec(sql))) {
    const name = m[1];
    const body = m[2];
    const add = /add column (?:if not exists )?("?[a-z_][a-z0-9_]*"?)/gi;
    let c: RegExpExecArray | null;
    while ((c = add.exec(body))) {
      const col = c[1].replace(/"/g, "").toLowerCase();
      if (!tables[name]) throw new Error(`alter table ${name} before it was created`);
      if (!tables[name].columns.includes(col)) tables[name].columns.push(col);
    }
  }
}

const migrationsDir = path.resolve(__dirname, "../../../../supabase/migrations");
const migrationFiles = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();
const migrations = migrationFiles.map((file) => ({ file, sql: readFileSync(path.join(migrationsDir, file), "utf8") }));
const sqlText = migrations.map((m) => m.sql).join("\n");

const TABLES: Record<string, TableDef> = {};
for (const { sql } of migrations) {
  parseCreateTables(sql, TABLES);
  parseAlterAddColumns(sql, TABLES);
}

const V1_COLLECTIONS = COLLECTIONS.filter((c) => !V2_COLLECTIONS.includes(c));

describe("supabase/migrations", () => {
  it("applies in order: 0001 (V1) then 0002 (V2)", () => {
    expect(migrationFiles[0]).toBe("0001_init.sql");
    expect(migrationFiles[1]).toBe("0002_v2.sql");
    for (const { file, sql } of migrations) {
      expect(sql, `${file} is transactional`).toMatch(/^\s*(--.*\n)*\s*begin;/m);
      expect(sql.trimEnd().endsWith("commit;"), `${file} commits`).toBe(true);
    }
  });

  it("defines exactly one table per collection across all files", () => {
    for (const c of COLLECTIONS) expect(TABLES[c], `table ${c}`).toBeDefined();
    expect(Object.keys(TABLES).sort()).toEqual([...COLLECTIONS].sort());
  });

  it("puts V1 tables in 0001 and V2 tables in 0002", () => {
    const first: Record<string, TableDef> = {};
    parseCreateTables(migrations[0].sql, first);
    const second: Record<string, TableDef> = {};
    parseCreateTables(migrations[1].sql, second);
    expect(Object.keys(first).sort()).toEqual([...V1_COLLECTIONS].sort());
    expect(Object.keys(second).sort()).toEqual([...V2_COLLECTIONS].sort());
  });

  it("gives every table the base entity columns", () => {
    for (const c of COLLECTIONS) {
      for (const col of ["id", "user_id", "created_at", "updated_at"]) {
        expect(TABLES[c].columns, `${c}.${col}`).toContain(col);
      }
    }
  });

  it("names every column in snake_case with no duplicates", () => {
    for (const [table, def] of Object.entries(TABLES)) {
      for (const col of def.columns) expect(col, `${table}.${col}`).toMatch(/^[a-z][a-z0-9_]*$/);
      expect(new Set(def.columns).size, `${table} duplicate columns`).toBe(def.columns.length);
    }
  });

  it("carries a fully populated sample for every V2 collection", () => {
    const sampled = SAMPLES.map(([table]) => table);
    expect(new Set(sampled).size).toBe(sampled.length);
    for (const c of V2_COLLECTIONS) expect(sampled, `sample for ${c}`).toContain(c);
  });

  it.each(SAMPLES)("has a column for every field of the %s sample", (table, entity) => {
    const cols = TABLES[table].columns;
    for (const key of Object.keys(entity)) {
      expect(cols, `${table}.${camelToSnake(key)}`).toContain(camelToSnake(key));
    }
  });

  it("parses identifiers that contain digits (generated_v2, profiles.v2)", () => {
    expect(TABLES.generated_v2?.columns).toEqual(expect.arrayContaining(["id", "user_id", "kind", "ref_id", "payload", "model", "concept_ids"]));
    expect(TABLES.profiles.columns).toContain("v2");
  });

  it("adds the V2 profile and preference columns in 0002", () => {
    const second = migrations[1].sql;
    expect(second).toMatch(/alter table public\.profiles add column if not exists v2 jsonb;/);
    expect(second).toMatch(/alter table public\.preferences add column if not exists plan_mode text/);
    expect(second).toMatch(/alter table public\.preferences add column if not exists custom_minutes integer/);
    expect(second).toMatch(/alter table public\.preferences add column if not exists lesson_depth text/);
    expect(second).toMatch(/alter table public\.preferences add column if not exists reading_pace double precision not null default 2/);
    expect(TABLES.profiles.columns).toContain("v2");
    for (const col of ["plan_mode", "custom_minutes", "lesson_depth", "reading_pace"]) expect(TABLES.preferences.columns).toContain(col);
  });

  it("indexes every LOCAL_INDEXES column and (user_id, created_at) for every table", () => {
    for (const [table, fields] of Object.entries(LOCAL_INDEXES)) {
      for (const f of fields ?? []) {
        const col = camelToSnake(f);
        const quoted = `"${col}"`;
        const re = new RegExp(`create index if not exists \\w+ on public\\.${table} \\(user_id, (${col}|${quoted})\\)`);
        expect(sqlText, `${table} index on ${col}`).toMatch(re);
      }
    }
    expect(sqlText).toContain("(user_id, created_at)");
    for (const c of COLLECTIONS) expect(sqlText).toContain(`'${c}'`);
  });

  it("enables row level security with owner-only policies and an updated_at trigger in every file", () => {
    for (const { file, sql } of migrations) {
      expect(sql, file).toMatch(/enable row level security/);
      for (const op of ["select", "insert", "update", "delete"]) expect(sql, `${file} ${op}`).toContain(`for ${op} to authenticated`);
      expect(sql, file).toContain("auth.uid() = user_id");
      expect(sql, file).toMatch(/create trigger set_updated_at before insert or update/);
      expect(sql, file).toMatch(/create or replace function public\.set_updated_at\(\)/);
    }
    // Every V2 table is in 0002's loop, every V1 table in 0001's.
    const loopOf = (sql: string) => /tables text\[\] := array\[([\s\S]*?)\];/.exec(sql)?.[1] ?? "";
    for (const c of V1_COLLECTIONS) expect(loopOf(migrations[0].sql)).toContain(`'${c}'`);
    for (const c of V2_COLLECTIONS) expect(loopOf(migrations[1].sql)).toContain(`'${c}'`);
  });

  it("references parents with foreign keys where entities point at other entities", () => {
    expect(sqlText).toMatch(/foreign key \(attempt_id, user_id\) references public\.case_attempts \(id, user_id\) on delete cascade/);
    expect(sqlText).toMatch(/foreign key \(item_id, user_id\) references public\.memory_items \(id, user_id\) on delete cascade/);
    expect(sqlText).toMatch(/foreign key \(item_id, user_id\) references public\.retrieval_items \(id, user_id\) on delete cascade/);
    expect(sqlText).toMatch(/foreign key \(entry_id, user_id\) references public\.writing_entries \(id, user_id\) on delete cascade/);
    expect(sqlText).toMatch(/foreign key \(source_id, user_id\) references public\.library_sources \(id, user_id\) on delete cascade/);
    expect(TABLES.red_threads.columns).toContain("evidence_ids");
    expect(TABLES.knowledge_edges.columns).toEqual(expect.arrayContaining(["from", "to"]));
  });

  it("is idempotent: every table and column is guarded and V2 tables are only created once", () => {
    const second = migrations[1].sql;
    expect(second.match(/create table (?!if not exists)/g)).toBeNull();
    expect(second.match(/add column (?!if not exists)/g)).toBeNull();
    expect(second.match(/create index (?!if not exists)/g)).toBeNull();
  });
});

/* ------------------------------------------------------------------ */
/* LocalDatabase (Dexie over fake-indexeddb)                            */
/* ------------------------------------------------------------------ */

let dbCounter = 0;
function freshDbName() {
  return `the-study-test-${Date.now()}-${dbCounter++}`;
}

describe("LocalDatabase", () => {
  it("put / get / list / update / delete", async () => {
    const db = new LocalDatabase("user_a", freshDbName());
    const store = db.store("memory_items");

    const item = stamp<MemoryItem>("user_a", "mi", {
      kind: "fact",
      prompt: "Year of the Peace of Westphalia?",
      answer: "1648",
      ease: 2.5,
      intervalDays: 0,
      due: T0,
      reps: 0,
      lapses: 0,
    });
    const saved = await store.put(item);
    expect(saved.id).toBe(item.id);
    expect(saved.userId).toBe("user_a");

    const got = await store.get(item.id);
    expect(got?.answer).toBe("1648");

    const second = stamp<MemoryItem>("user_a", "mi", {
      kind: "concept",
      prompt: "What is a base rate?",
      answer: "The prior frequency of an outcome in the reference class",
      ease: 2.5,
      intervalDays: 0,
      due: T1,
      reps: 0,
      lapses: 0,
    });
    await store.put(second);

    const facts = await store.list({ where: { kind: "fact" } });
    expect(facts.map((i) => i.id)).toEqual([item.id]);

    const byDueDesc = await store.list({ orderBy: "due", desc: true });
    expect(byDueDesc.map((i) => i.id)).toEqual([second.id, item.id]);

    const limited = await store.list({ orderBy: "due", limit: 1 });
    expect(limited).toHaveLength(1);
    expect(limited[0].id).toBe(item.id);

    expect(await store.count()).toBe(2);
    expect(await store.count({ kind: "concept" })).toBe(1);

    const updated = await store.update(item.id, { reps: 3, intervalDays: 6 });
    expect(updated?.reps).toBe(3);
    expect(updated?.intervalDays).toBe(6);
    expect(updated?.prompt).toBe(item.prompt);
    expect((updated?.updatedAt ?? "") >= item.updatedAt).toBe(true);
    expect(await store.update("mi_missing", { reps: 1 })).toBeUndefined();

    await store.delete(item.id);
    expect(await store.get(item.id)).toBeUndefined();
    expect(await store.count()).toBe(1);
  });

  it("stores and lists V2 entities through the same interface", async () => {
    const db = new LocalDatabase(USER, freshDbName());
    await db.store("concept_mastery").put(conceptMastery);
    await db.store("retrieval_items").put(retrievalItem);
    await db.store("daily_plans").put(dailyPlan);
    await db.store("exam_attempts").put(examAttempt);
    expect((await db.store("concept_mastery").list({ where: { state: "retained" } })).map((m) => m.conceptId)).toEqual([conceptMastery.conceptId]);
    expect((await db.store("retrieval_items").list({ where: { conceptId: conceptMastery.conceptId } }))[0]?.id).toBe(retrievalItem.id);
    expect((await db.store("daily_plans").list({ where: { date: "2026-09-08" } }))[0]?.items).toHaveLength(2);
    const exam = await db.store("exam_attempts").get(examAttempt.id);
    expect(exam?.form.items["it-probability-04"]?.answer).toBe(0.083);
    expect(exam?.result?.total).toBe(0.86);
  });

  it("isolates ownership between two userIds sharing one IndexedDB", async () => {
    const name = freshDbName();
    const dbA = new LocalDatabase("user_a", name);
    const dbB = new LocalDatabase("user_b", name);

    const a1 = stamp<CaseAttempt>("user_a", "ca", { caseId: "case-1", status: "active", currentStageIndex: 0, startedAt: T0 });
    const a2 = stamp<CaseAttempt>("user_a", "ca", { caseId: "case-2", status: "completed", currentStageIndex: 9, startedAt: T0 });
    const b1 = stamp<CaseAttempt>("user_b", "ca", { caseId: "case-1", status: "active", currentStageIndex: 2, startedAt: T0 });
    await dbA.store("case_attempts").putMany([a1, a2]);
    await dbB.store("case_attempts").put(b1);

    // Each user lists only their own rows.
    expect((await dbA.store("case_attempts").list()).map((r) => r.id).sort()).toEqual([a1.id, a2.id].sort());
    expect((await dbB.store("case_attempts").list()).map((r) => r.id)).toEqual([b1.id]);
    expect(await dbA.store("case_attempts").count()).toBe(2);
    expect(await dbB.store("case_attempts").count()).toBe(1);

    // Cross-user reads, updates and deletes are refused (no-ops).
    expect(await dbB.store("case_attempts").get(a1.id)).toBeUndefined();
    expect(await dbB.store("case_attempts").update(a1.id, { status: "abandoned" })).toBeUndefined();
    await dbB.store("case_attempts").delete(a1.id);
    expect((await dbA.store("case_attempts").get(a1.id))?.status).toBe("active");

    // A put through user B's store is stamped with B's userId, whatever the entity claimed.
    const smuggled = { ...a2, id: "ca_smuggled" };
    await dbB.store("case_attempts").put(smuggled);
    expect((await dbB.store("case_attempts").get("ca_smuggled"))?.userId).toBe("user_b");
    expect(await dbA.store("case_attempts").get("ca_smuggled")).toBeUndefined();

    // Clearing one user's collection leaves the other's rows alone.
    await dbB.store("case_attempts").clear();
    expect(await dbB.store("case_attempts").count()).toBe(0);
    expect(await dbA.store("case_attempts").count()).toBe(2);
  });

  it("exports and re-imports the user's data", async () => {
    const name = freshDbName();
    const db = new LocalDatabase("user_a", name);
    await db.store("milestones").put(stamp("user_a", "ms", { key: "first-case", title: "First case", description: "", reachedAt: T0 }));
    const dump = await db.exportAll();
    expect(Object.keys(dump).sort()).toEqual([...COLLECTIONS].sort());
    expect(dump.milestones).toHaveLength(1);

    const other = new LocalDatabase("user_a", freshDbName());
    await other.importAll(dump);
    expect(await other.store("milestones").count({ key: "first-case" })).toBe(1);

    await other.wipe();
    expect(await other.store("milestones").count()).toBe(0);
  });
});
