/**
 * THE STUDY V2 — content schema.
 *
 * Everything here is authored seed content (or model-generated content validated
 * against the same shapes). Nothing here is user state; user state lives in
 * `src/lib/v2/types.ts`. Content is static TypeScript under `src/content/v2/`.
 *
 * The curriculum is a graph:  DOMAIN → COURSE → MODULE → CONCEPT, with explicit
 * `dependsOn` edges between concepts. Lessons teach concepts; practice items
 * evidence concepts and skills; exams sample the item bank; knowledge paths and
 * the knowledge graph connect concepts across domains.
 */

/* ------------------------------------------------------------------ */
/* Domains, courses, modules, concepts                                  */
/* ------------------------------------------------------------------ */

export const DOMAIN_IDS = [
  "mathematics",
  "probability",
  "statistics",
  "logic",
  "causal_reasoning",
  "decision_science",
  "economics",
  "history",
  "geography",
  "psychology",
  "philosophy",
  "science",
  "computer_science",
  "ai",
  "business",
  "finance",
  "politics",
  "law",
  "art",
  "literature",
  "culture",
  "communication",
] as const;
export type DomainId = (typeof DOMAIN_IDS)[number];

/** Difficulty of a concept, item or lesson: 1 (foundation) … 8 (research-level). */
export type Difficulty = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type ItemLevel = "foundation" | "basic" | "intermediate" | "advanced" | "transfer" | "synthesis";
export const ITEM_LEVELS: ItemLevel[] = ["foundation", "basic", "intermediate", "advanced", "transfer", "synthesis"];

/** 0 = same form as taught, 1 = varied surface, 2 = unfamiliar representation, 3 = cross-domain application. */
export type TransferLevel = 0 | 1 | 2 | 3;

export interface Domain {
  id: DomainId;
  title: string;
  /** One sentence: what literacy in this domain gives a person. */
  summary: string;
  /** Ordered course ids. */
  courses: string[];
  /** Display order in Learn. */
  order: number;
}

export interface Course {
  id: string;
  domainId: DomainId;
  title: string;
  summary: string;
  /** Ordered module ids. */
  modules: string[];
  level: ItemLevel;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  summary: string;
  /** Ordered concept ids. */
  concepts: string[];
  /** Ordered lesson ids (may be empty while lessons are being authored). */
  lessons: string[];
}

export interface RecallPrompt {
  prompt: string;
  answer: string;
  accept?: string[];
}

export interface Concept {
  id: string;
  domainId: DomainId;
  courseId: string;
  moduleId: string;
  title: string;
  /** One or two sentences a stranger could learn from. */
  summary: string;
  /** Three to six things worth retaining. */
  keyPoints: string[];
  /** Prerequisite concept ids anywhere in the curriculum. */
  dependsOn: string[];
  /** Non-prerequisite neighbours worth connecting (any domain). */
  related?: string[];
  /** At least two; they seed the retrieval schedule when the concept is learned. */
  recallPrompts: RecallPrompt[];
  /** Where the concept shows up outside the lesson. */
  applications?: string[];
  /** One misconception worth naming. */
  misconception?: string;
  difficulty: Difficulty;
  /** Foundational concepts are prioritised when they block progress. */
  foundational?: boolean;
  tags?: string[];
}

/* ------------------------------------------------------------------ */
/* Lessons                                                              */
/* ------------------------------------------------------------------ */

export type LessonDepth = "intuition" | "standard" | "deep" | "technical";
export const LESSON_DEPTHS: LessonDepth[] = ["intuition", "standard", "deep", "technical"];

/** Prose with optional variants by depth. `standard` is always present. */
export interface DepthText {
  standard: string;
  intuition?: string;
  deep?: string;
  technical?: string;
}

export type LessonStepKind =
  | "question"
  | "intuition"
  | "model"
  | "worked_example"
  | "guided_practice"
  | "independent_practice"
  | "explain_back"
  | "transfer";

export interface LessonStepBase {
  id: string;
  kind: LessonStepKind;
  title?: string;
}

/** 1. Start with a question. The learner thinks before being told. */
export interface QuestionStep extends LessonStepBase {
  kind: "question";
  prompt: string;
  /** Seconds of quiet thinking suggested before revealing the lesson. */
  thinkSeconds?: number;
  /** What a good first attempt notices; shown after the learner commits. */
  reveal: string;
}

/** 2 & 3. Prose steps. */
export interface ProseStep extends LessonStepBase {
  kind: "intuition" | "model";
  body: DepthText;
  /** Optional structure the model presents (definitions, formulae, distinctions). */
  structure?: { term: string; meaning: string }[];
}

/** 4. An expert solution shown in steps. */
export interface WorkedExampleStep extends LessonStepBase {
  kind: "worked_example";
  problem: string;
  steps: { text: string; note?: string }[];
  answer: string;
}

/** 5 & 6. Practice with fading assistance. Items are practice item ids or inline items. */
export interface PracticeStep extends LessonStepBase {
  kind: "guided_practice" | "independent_practice";
  itemIds: string[];
  /** Guided practice may show scaffolding text before the item. */
  scaffold?: string;
}

/** 7. The learner explains the concept back; graded by key-point coverage (offline) or model rubric. */
export interface ExplainBackStep extends LessonStepBase {
  kind: "explain_back";
  prompt: string;
  keyPoints: string[];
  minWords?: number;
}

/** 8. Apply the concept somewhere different. */
export interface TransferStep extends LessonStepBase {
  kind: "transfer";
  itemIds: string[];
  framing?: string;
}

export type LessonStep = QuestionStep | ProseStep | WorkedExampleStep | PracticeStep | ExplainBackStep | TransferStep;

export interface Lesson {
  id: string;
  moduleId: string;
  /** Concepts this lesson teaches; all receive exposure/understanding evidence. */
  conceptIds: string[];
  title: string;
  /** One sentence the learner reads before beginning. */
  promise: string;
  minutes: number;
  difficulty: Difficulty;
  steps: LessonStep[];
  origin: "seeded" | "generated";
}

/* ------------------------------------------------------------------ */
/* Practice items                                                       */
/* ------------------------------------------------------------------ */

export const SKILL_AREAS = [
  "mathematics",
  "probability",
  "statistics",
  "logic",
  "causal_reasoning",
  "decision_making",
  "argument_analysis",
  "writing",
  "speaking",
  "memory",
  "research",
  "programming",
  "questioning",
  "strategic_reasoning",
  "knowledge",
  "reading",
] as const;
export type SkillArea = (typeof SKILL_AREAS)[number];

export type ItemFormat = "numeric" | "mcq" | "multi_select" | "short" | "true_false" | "ordering" | "free";

export const ERROR_CATEGORIES = [
  "KNOWLEDGE_GAP",
  "CONCEPTUAL_ERROR",
  "ALGEBRA_ERROR",
  "LOGIC_ERROR",
  "CAUSAL_ERROR",
  "BASE_RATE_NEGLECT",
  "STATISTICAL_ERROR",
  "MISREAD",
  "ASSUMPTION",
  "OVERCONFIDENCE",
  "UNDERCONFIDENCE",
  "EVIDENCE_ERROR",
  "PRECISION_ERROR",
  "TRANSFER_FAILURE",
] as const;
export type ErrorCategory = (typeof ERROR_CATEGORIES)[number];

export interface RubricCriterion {
  criterion: string;
  weight: number;
  /** What full marks look like. */
  description?: string;
}

export interface CommonError {
  /** Human description of the mistake. */
  description: string;
  category: ErrorCategory;
  /** For numeric items: the wrong value this mistake produces (matched with the item tolerance). */
  value?: number;
  /** For mcq/multi_select: the option index this mistake selects. */
  optionIndex?: number;
  /** For short/free: a phrase that signals this mistake. */
  pattern?: string;
}

export interface PracticeItem {
  id: string;
  skill: SkillArea;
  /** Free text subskill, e.g. "conditional_probability", "contrapositive". */
  subskill: string;
  /** Concept ids evidenced by this item (first is primary). */
  concepts: string[];
  level: ItemLevel;
  difficulty: Difficulty;
  format: ItemFormat;
  prompt: string;
  /** For mcq / multi_select / ordering. Ordering: options in the CORRECT order; the player shuffles. */
  options?: string[];
  /**
   * numeric: the number; mcq: option index; multi_select: option indexes; true_false: "true"|"false";
   * short: canonical text; ordering: omitted (options are the answer); free: omitted (rubric + keyPoints).
   */
  answer?: number | number[] | string;
  /** numeric tolerance: absolute unless `relativeTolerance` is set. */
  tolerance?: number;
  relativeTolerance?: number;
  /** Alternative accepted short answers (case-insensitive, punctuation-insensitive). */
  accept?: string[];
  /** Units the learner may include or omit, e.g. "%". */
  unit?: string;
  /** Full worked solution, shown after submission. */
  solution: string;
  /** The method an expert would use; used for method feedback. */
  method: string;
  /** Progressive hints, weakest first. */
  hints: string[];
  commonErrors: CommonError[];
  transfer: TransferLevel;
  /** For free items: key points a good answer covers (offline grading) and a rubric (model grading). */
  keyPoints?: string[];
  rubric?: RubricCriterion[];
  /** Approximate minutes. */
  minutes: number;
  /** Eligible for exam forms; exam-only items never appear in Train. */
  examEligible?: boolean;
  examOnly?: boolean;
  /** Reading comprehension items reference a passage. */
  passageId?: string;
  tags?: string[];
  origin: "seeded" | "generated";
}

export interface Passage {
  id: string;
  title: string;
  source?: string;
  /** Plain text, paragraphs separated by blank lines. */
  text: string;
  wordCount: number;
  /** Ids of items that test it. */
  itemIds: string[];
}

/* ------------------------------------------------------------------ */
/* Writing, speaking, questioning, memory technique                     */
/* ------------------------------------------------------------------ */

export type WritingLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export const WRITING_LEVEL_TITLES: Record<WritingLevel, string> = {
  1: "Explain clearly",
  2: "Summarise accurately",
  3: "Construct an argument",
  4: "Compare positions",
  5: "Analyse evidence",
  6: "Synthesise sources",
  7: "Develop an original thesis",
};

export const WRITING_CRITERIA = ["clarity", "structure", "precision", "logic", "evidence", "counterargument", "depth", "synthesis", "originality"] as const;
export type WritingCriterion = (typeof WRITING_CRITERIA)[number];

export interface WritingPrompt {
  id: string;
  level: WritingLevel;
  title: string;
  prompt: string;
  /** Source text for summary/analysis levels. */
  source?: string;
  /** Multiple sources for synthesis levels. */
  sources?: { title: string; text: string }[];
  constraints?: { minWords?: number; maxWords?: number; minutes?: number; requireCounterargument?: boolean };
  /** Criteria that matter most at this level (all nine are always scored). */
  emphasis: WritingCriterion[];
  keyPoints?: string[];
  concepts?: string[];
  origin: "seeded" | "generated";
}

export type SpeakingMode = "explain_60" | "explain_180" | "impromptu" | "debate" | "story" | "analogy" | "argument" | "questioning";

export interface SpeakingPrompt {
  id: string;
  mode: SpeakingMode;
  title: string;
  prompt: string;
  prepSeconds: number;
  seconds: number;
  /** For story mode: the material the story must be faithful to. */
  material?: string;
  keyPoints?: string[];
  concepts?: string[];
  rubric: RubricCriterion[];
  origin: "seeded" | "generated";
}

export type QuestionCategory = "clarifying" | "evidential" | "causal" | "counterfactual" | "assumption" | "discriminating" | "strategic" | "open" | "closed" | "falsifying";

export interface QuestioningExercise {
  id: string;
  kind: "one_question" | "rewrite_leading" | "discriminate" | "classify";
  title: string;
  scenario: string;
  /** one_question / discriminate: candidate questions with information value 0..1. */
  options?: { id: string; text: string; informationValue: number; category: QuestionCategory; leading?: boolean; note: string }[];
  /** rewrite_leading: the leading question to neutralise. */
  leadingQuestion?: string;
  /** rewrite_leading: what a neutral rewrite must not do; classify: the correct category. */
  answerKey: string;
  /** For discriminate: the competing explanations. */
  explanations?: string[];
  keyPoints?: string[];
  concepts: string[];
  difficulty: Difficulty;
}

export interface MemoryTechnique {
  id: string;
  title: string;
  /** chunking, organisation, association, elaboration, visualisation, story, loci, semantic grouping, self-explanation */
  strategy: string;
  summary: string;
  steps: string[];
  /** A comparison exercise: the same kind of material, once unaided and once with the technique. */
  exercise: { instruction: string; items: string[]; recallPrompt: string };
}

/* ------------------------------------------------------------------ */
/* Knowledge paths and graph                                            */
/* ------------------------------------------------------------------ */

export interface KnowledgePath {
  id: string;
  title: string;
  /** The question the path answers, e.g. "How does money work?" */
  question: string;
  summary: string;
  /** Ordered steps; each points at a concept and explains its place in the answer. */
  steps: { conceptId: string; title: string; note: string }[];
  domains: DomainId[];
}

export type KnowledgeNodeKind = "concept" | "person" | "place" | "event" | "institution" | "book" | "theory" | "technology" | "movement";

export const KNOWLEDGE_RELATIONS = ["CAUSES", "INFLUENCED", "PRECEDED", "DEPENDS_ON", "CONTRASTS_WITH", "LOCATED_IN", "PART_OF", "EXAMPLE_OF", "RESPONDED_TO", "CREATED_BY", "RELATED_TO"] as const;
export type KnowledgeRelation = (typeof KNOWLEDGE_RELATIONS)[number];

export interface KnowledgeNodeSeed {
  id: string;
  kind: KnowledgeNodeKind;
  title: string;
  domainId?: DomainId;
  summary: string;
  /** For concept nodes: the curriculum concept id (usually equal to `id`). */
  conceptId?: string;
  /** Approximate year (negative for BCE). */
  year?: number;
  yearEnd?: number;
  location?: { lat: number; lon: number; country?: string };
  /** V1 Archive entry id when this node was converted from one. */
  archiveRef?: string;
  tags?: string[];
}

export interface KnowledgeEdgeSeed {
  from: string;
  to: string;
  relation: KnowledgeRelation;
  note?: string;
}

/* ------------------------------------------------------------------ */
/* Library, projects                                                    */
/* ------------------------------------------------------------------ */

export type SourceType = "book" | "paper" | "article" | "report" | "lecture" | "reference";

export interface SourceSeed {
  id: string;
  type: SourceType;
  title: string;
  author: string;
  year?: number;
  summary: string;
  /** Why an intelligent adult would read it. */
  whyRead: string;
  /** Questions worth holding while reading. */
  questions: string[];
  concepts: string[];
  /** Chapters or sections, with the concepts each touches. */
  units?: { title: string; concepts?: string[] }[];
  unitLabel: "chapter" | "section" | "page";
  totalUnits?: number;
}

export type ProjectKind = "investigation" | "model" | "essay" | "software" | "explanation" | "analysis" | "presentation";

export interface ProjectTemplate {
  id: string;
  kind: ProjectKind;
  title: string;
  question: string;
  whyItMatters: string;
  requiredConcepts: string[];
  milestones: string[];
  startingSources: { title: string; note?: string; sourceId?: string }[];
  suggestedQuestions: string[];
  /** What the final output must contain to count as complete. */
  outputSpec: string;
  estimatedHours: number;
}

/* ------------------------------------------------------------------ */
/* Exams and baseline                                                   */
/* ------------------------------------------------------------------ */

export type ExamKind = "weekly" | "monthly" | "quarterly" | "baseline" | "transfer";

export interface ExamSectionBlueprint {
  id: string;
  title: string;
  /** Share of the total (sections should sum to 1). */
  weight: number;
  itemCount: number;
  /** Item filter; all listed constraints must hold. */
  filter: {
    skills?: SkillArea[];
    concepts?: string[];
    domains?: DomainId[];
    levels?: ItemLevel[];
    formats?: ItemFormat[];
    tags?: string[];
    passage?: boolean;
  };
  /** Difficulty band sampled from the bank (inclusive). */
  band: [Difficulty, Difficulty];
  /** Writing sections use a writing prompt instead of items. */
  writingPromptLevel?: WritingLevel;
  /** Memory sections show study material at the start and test it later in the exam. */
  memoryStudy?: { itemIds: string[]; studySeconds: number };
}

export interface ExamBlueprint {
  id: string;
  kind: ExamKind;
  title: string;
  minutes: number;
  summary: string;
  sections: ExamSectionBlueprint[];
  /** Ask for confidence on every gradeable item (calibration evidence). */
  askConfidence: boolean;
}

export interface FirstMonthWeek {
  week: 1 | 2 | 3 | 4;
  title: string;
  focus: string[];
  /** Concept ids, lesson ids or path ids to prioritise. */
  conceptIds: string[];
}

/* ------------------------------------------------------------------ */
/* Transfer challenges (V1 cases repositioned under PROVE)              */
/* ------------------------------------------------------------------ */

export interface TransferChallengeMeta {
  caseId: string;
  /** Concepts a competent solver applies, whether or not the case names them. */
  requiredConcepts: string[];
  skills: SkillArea[];
  /** Concepts whose mastery must be at least `practicing` before the case is offered. */
  gate: string[];
}

/* ------------------------------------------------------------------ */
/* Index shape exported by src/content/v2                               */
/* ------------------------------------------------------------------ */

export interface CurriculumContent {
  domains: Domain[];
  courses: Course[];
  modules: Module[];
  concepts: Concept[];
  lessons: Lesson[];
}
