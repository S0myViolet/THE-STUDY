import { z } from "zod";
import { ERROR_CATEGORIES, ITEM_LEVELS, KNOWLEDGE_RELATIONS, SKILL_AREAS, WRITING_CRITERIA } from "@/lib/v2/content-types";
import type {
  CommonError,
  Difficulty,
  DomainId,
  ErrorCategory,
  ExamKind,
  ItemFormat,
  ItemLevel,
  KnowledgeNodeKind,
  KnowledgeRelation,
  LessonDepth,
  LessonStep,
  PracticeItem,
  QuestionCategory,
  RubricCriterion,
  SkillArea,
  SourceType,
  SpeakingMode,
  TransferLevel,
  WritingCriterion,
  WritingLevel,
} from "@/lib/v2/content-types";
import { TUTOR_MODES } from "@/lib/v2/types";
import type { ConceptState, DailyPlan, EvidenceProvenance, PlanItem, PlanItemKind, PlanMode, PracticeContext, TutorMode } from "@/lib/v2/types";

/**
 * Input/output contracts for every AI operation. Outputs with application-state
 * implications are validated before anything is persisted.
 *
 * Two families live here. The V1 schemas (cases, salon, strategy, archive, red
 * thread, V1 curator) are unchanged. The V2 schemas mirror the content types in
 * `src/lib/v2/content-types.ts` so that generated lessons and items can be
 * validated and persisted in `generated_v2` without a second mapping layer.
 *
 * Structured-output note: the provider converts each Zod schema to JSON Schema
 * and the SDK strips numeric bounds, enums and constants into descriptions, so
 * the bounds below are enforced at parse time, not by the model. Dynamic-key
 * records cannot be expressed (the SDK forces `additionalProperties: false`),
 * which is why rubric scores are arrays of `{ criterion, score }` pairs.
 */

const subskill = z.string();
const difficulty = z.number().int().min(1).max(8);

/* ------------------------------------------------------------------ */
/* V1 schemas (unchanged)                                               */
/* ------------------------------------------------------------------ */

export const CaseSchema = z.object({
  id: z.string(),
  number: z.string(),
  title: z.string(),
  setting: z.string(),
  summary: z.string(),
  difficulty,
  estimatedMinutes: z.number(),
  faculties: z.array(z.string()),
  subskills: z.array(subskill),
  stages: z.array(
    z.object({
      id: z.string(),
      kind: z.enum(["enter", "notice", "recall", "separate", "hypotheses", "question", "evidence", "update", "decision", "explain", "debrief"]),
      title: z.string(),
      narrative: z.string().optional(),
      setting: z.string().optional(),
      material: z
        .object({
          kind: z.enum(["scene", "document", "thread", "table", "schedule", "layout", "text"]),
          scene: z.object({ template: z.string(), seed: z.number() }).optional(),
          title: z.string().optional(),
          lines: z.array(z.string()).optional(),
          rows: z.array(z.array(z.string())).optional(),
          columns: z.array(z.string()).optional(),
          seconds: z.number(),
        })
        .optional(),
      questions: z
        .array(z.object({ id: z.string(), prompt: z.string(), kind: z.enum(["mcq", "short", "number"]), options: z.array(z.string()).optional(), answer: z.string(), accept: z.array(z.string()).optional(), subskill, points: z.number().optional() }))
        .optional(),
      statements: z.array(z.object({ id: z.string(), text: z.string(), truth: z.enum(["observation", "inference", "unknown"]), why: z.string() })).optional(),
      rubric: z.object({ plausible: z.array(z.object({ title: z.string(), keywords: z.array(z.string()), note: z.string() })), minimum: z.number() }).optional(),
      questionOptions: z.array(z.object({ id: z.string(), text: z.string(), informationValue: z.number(), rapportCost: z.number(), leading: z.boolean(), feedback: z.string() })).optional(),
      allowFreeQuestion: z.boolean().optional(),
      reveal: z.object({ title: z.string(), text: z.string(), supports: z.array(z.string()).optional(), undermines: z.array(z.string()).optional() }).optional(),
      updatePrompt: z.string().optional(),
      decisionOptions: z.array(z.object({ id: z.string(), text: z.string(), quality: z.number(), feedback: z.string(), errorType: z.string().optional() })).optional(),
      explainPrompt: z.string().optional(),
      expertReasoning: z.string().optional(),
      keyInsight: z.string().optional(),
      subskills: z.array(subskill).optional(),
      insufficientEvidenceIsCorrect: z.boolean().optional(),
    }),
  ),
  groundTruth: z.string(),
  conceptLinks: z.array(z.string()),
  safetyTags: z.array(z.string()),
  origin: z.literal("generated"),
});

export const ReasoningEvaluation = z.object({
  score: z.number().min(0).max(1),
  observations: z.array(z.string()).describe("Things the user correctly identified"),
  missed: z.array(z.string()),
  assumptions: z.array(z.string()),
  alternativesConsidered: z.number().int(),
  errorTypes: z.array(z.string()),
  feedback: z.string().describe("Two to four sentences. Specific. Not sycophantic."),
  oneThing: z.string().describe("The single most useful change next time"),
});

export const QuestionEvaluation = z.object({
  informationValue: z.number().min(0).max(1),
  ambiguityReduction: z.number().min(0).max(1),
  rapportCost: z.number().min(0).max(1),
  leading: z.boolean(),
  relevance: z.number().min(0).max(1),
  type: z.string(),
  feedback: z.string(),
  betterQuestion: z.string().optional(),
});

export const SalonTurn = z.object({
  reply: z.string(),
  revealed: z.array(z.string()).describe("ids of hidden facts the character has now disclosed"),
  rapportDelta: z.number().min(-0.3).max(0.3),
  userQuestionType: z.string().optional(),
  userWasLeading: z.boolean().optional(),
});

export const SalonReviewSchema = z.object({
  questionsAsked: z.number().int(),
  questionsForcingNewInfo: z.number().int(),
  leadingQuestions: z.number().int(),
  talkShare: z.number().min(0).max(1),
  objectivesMet: z.array(z.string()),
  keyImprovements: z.array(z.string()).max(2),
  strongestMove: z.string().optional(),
  score: z.number().min(0).max(1),
});

export const StrategyMoveResult = z.object({
  consequence: z.string(),
  counterpartyReply: z.string().optional(),
  quality: z.number().min(0).max(1),
  secondOrder: z.array(z.string()),
  errorType: z.string().optional(),
  nextSituation: z.string(),
  terminal: z.boolean(),
});

export const StrategyEvaluation = z.object({
  score: z.number().min(0).max(1),
  incentivesRecognised: z.array(z.string()),
  secondOrderMissed: z.array(z.string()),
  debrief: z.string(),
  oneThing: z.string(),
});

export const ArchiveEntrySchema = z.object({
  id: z.string(),
  kind: z.enum(["person", "place", "event", "concept", "work", "institution", "technology", "movement", "object"]),
  domain: z.enum(["history", "geography", "economics", "politics", "science", "psychology", "philosophy", "art", "literature", "music", "food", "business", "technology", "law"]),
  title: z.string(),
  subtitle: z.string().optional(),
  summary: z.string(),
  what: z.string(),
  why: z.string(),
  before: z.string(),
  after: z.string(),
  connects: z.string(),
  remember: z.array(z.string()).min(2).max(6),
  yearStart: z.number().optional(),
  yearEnd: z.number().optional(),
  location: z.object({ lat: z.number(), lon: z.number(), country: z.string().optional() }).optional(),
  tags: z.array(z.string()),
  recall: z.array(z.object({ prompt: z.string(), answer: z.string() })).min(2).max(5),
  readingMinutes: z.number(),
  origin: z.literal("generated"),
  connections: z.array(z.object({ to: z.string(), relation: z.string(), note: z.string().optional() })),
});

export const CuriositySchema = z.object({
  id: z.string(),
  title: z.string(),
  hook: z.string(),
  body: z.string(),
  connects: z.array(z.string()),
  domain: z.string(),
  origin: z.literal("generated"),
});

export const RecallQuestionSchema = z.object({ prompt: z.string(), answer: z.string(), accept: z.array(z.string()).optional() });

export const RecallEvaluation = z.object({
  score: z.number().min(0).max(1),
  correctPoints: z.array(z.string()),
  missingPoints: z.array(z.string()),
  errors: z.array(z.string()),
  feedback: z.string(),
});

export const RhetoricPromptSchema = z.object({
  id: z.string(),
  mode: z.string(),
  title: z.string(),
  prompt: z.string(),
  source: z.string().optional(),
  constraints: z.object({ maxWords: z.number().optional(), maxSentences: z.number().optional(), prepSeconds: z.number().optional(), responseSeconds: z.number().optional() }).optional(),
  rubric: z.array(z.object({ criterion: z.string(), weight: z.number() })),
  keyPoints: z.array(z.string()).optional(),
  difficulty,
  subskills: z.array(subskill),
  origin: z.literal("generated"),
});

export const RhetoricEvaluation = z.object({
  score: z.number().min(0).max(1),
  strengths: z.array(z.string()).max(3),
  improvements: z.array(z.string()).max(3),
  rewrite: z.string().optional().describe("A tighter version, when useful"),
});

export const RedThreadCandidates = z.object({
  candidates: z.array(
    z.object({
      patternKey: z.string(),
      patternType: z.enum(["observation", "reasoning", "memory", "confidence", "conversational", "strategic", "knowledge", "writing"]),
      title: z.string(),
      description: z.string().describe("Second person, specific, evidence-based, one or two sentences"),
      evidenceIds: z.array(z.string()),
      nextTest: z.string(),
      targetSubskill: z.string().optional(),
    }),
  ),
});

export const RedThreadValidation = z.object({ valid: z.boolean(), reason: z.string(), strength: z.number().min(0).max(1) });

export const DailySessionPlan = z.object({
  items: z.array(z.object({ kind: z.string(), title: z.string(), minutes: z.number(), reason: z.string(), reasonText: z.string(), refId: z.string().optional() })),
});

export const Recommendation = z.object({
  room: z.string(),
  href: z.string(),
  title: z.string(),
  why: z.string(),
});

export const CuratorReply = z.object({
  text: z.string(),
  thinkFirst: z.boolean().describe("true when the reply asks the user for their attempt before teaching"),
  isKnowledgeAnswer: z.boolean(),
  suggestedArchiveTitle: z.string().optional(),
});

/* ------------------------------------------------------------------ */
/* V2 primitives                                                        */
/* ------------------------------------------------------------------ */

/** Effort levels understood by the provider; an input may override an op's default. */
export type Effort = "low" | "medium" | "high" | "xhigh" | "max";

const unit = z.number().min(0).max(1);
const text = z.string().min(1);

export const ITEM_FORMATS = ["numeric", "mcq", "multi_select", "short", "true_false", "ordering", "free"] as const satisfies readonly ItemFormat[];
export const KNOWLEDGE_NODE_KINDS = ["concept", "person", "place", "event", "institution", "book", "theory", "technology", "movement"] as const satisfies readonly KnowledgeNodeKind[];
export const QUESTION_CATEGORIES = ["clarifying", "evidential", "causal", "counterfactual", "assumption", "discriminating", "strategic", "open", "closed", "falsifying"] as const satisfies readonly QuestionCategory[];
export const PROVENANCES = ["source_claim", "user_interpretation", "ai_suggestion"] as const satisfies readonly EvidenceProvenance[];
export const ARGUMENT_STRUCTURES = ["deductive", "inductive", "abductive", "analogical", "mixed", "unclear"] as const;

export const DifficultySchema = z.literal([1, 2, 3, 4, 5, 6, 7, 8]);
export const TransferLevelSchema = z.literal([0, 1, 2, 3]);
export const SkillAreaSchema = z.enum(SKILL_AREAS);
export const ItemLevelSchema = z.enum(ITEM_LEVELS);
export const ItemFormatSchema = z.enum(ITEM_FORMATS);
export const ErrorCategorySchema = z.enum(ERROR_CATEGORIES);
export const WritingCriterionSchema = z.enum(WRITING_CRITERIA);
export const KnowledgeRelationSchema = z.enum(KNOWLEDGE_RELATIONS);
export const KnowledgeNodeKindSchema = z.enum(KNOWLEDGE_NODE_KINDS);
export const QuestionCategorySchema = z.enum(QUESTION_CATEGORIES);
export const TutorModeSchema = z.enum(TUTOR_MODES);
export const ProvenanceSchema = z.enum(PROVENANCES);

export const RubricCriterionSchema = z.object({ criterion: text, weight: z.number().min(0), description: z.string().optional() });

export const CommonErrorSchema = z.object({
  description: text,
  category: ErrorCategorySchema,
  value: z.number().optional(),
  optionIndex: z.number().int().optional(),
  pattern: z.string().optional(),
});

/* ------------------------------------------------------------------ */
/* Voice guards                                                         */
/* ------------------------------------------------------------------ */

/** Praise with no content. Feedback names a passage or a step; it never says this. */
export const EMPTY_PRAISE = /\b(great|good|nice|excellent|fantastic|awesome|amazing|brilliant|wonderful|superb|terrific)\s+(work|job|effort|going|stuff)\b|\b(well done|keep it up|keep up the good work|way to go|kudos|bravo)\b/i;

/** Claims about the speaker rather than the speech; a transcript cannot support them. */
export const PERSONALITY_CLAIMS = /\b(charism\w*|personality|nervous\w*|shy|shyness|confiden(?:t|ce|tly)|passion\w*|energetic|charming|charm|likeable|likable|enthusias\w*|talent\w*|gifted|authentic\w*|extrovert\w*|introvert\w*|natural(?:ly)?\s+(?:speaker|gift|talent))\b/i;

export function isEmptyPraise(s: string): boolean {
  return EMPTY_PRAISE.test(s);
}

type Ctx = z.RefinementCtx;
type Path = (string | number)[];

function forbid(ctx: Ctx, entries: [Path, string | undefined][], pattern: RegExp, message: string) {
  for (const [path, value] of entries) {
    if (value && pattern.test(value)) ctx.addIssue({ code: "custom", path, message: `${message}: "${value.slice(0, 80)}"` });
  }
}

function praiseGuard(ctx: Ctx, entries: [Path, string | undefined][]) {
  forbid(ctx, entries, EMPTY_PRAISE, "feedback must name the passage or step, not praise it");
}

function listEntries(path: string, list: string[] | undefined): [Path, string][] {
  return (list ?? []).map((v, i) => [[path, i], v] as [Path, string]);
}

/* ------------------------------------------------------------------ */
/* Practice items (mirrors PracticeItem)                                */
/* ------------------------------------------------------------------ */

/** Format-specific consistency the deterministic grader relies on. Empty when the item is sound. */
export function itemFormatIssues(item: { format: ItemFormat; answer?: number | number[] | string; options?: string[]; tolerance?: number; relativeTolerance?: number; keyPoints?: string[]; rubric?: RubricCriterion[] }): string[] {
  const issues: string[] = [];
  const options = item.options ?? [];
  const inRange = (n: unknown) => Number.isInteger(n) && (n as number) >= 0 && (n as number) < options.length;
  switch (item.format) {
    case "numeric":
      if (typeof item.answer !== "number" || !Number.isFinite(item.answer)) issues.push("numeric items need a numeric answer");
      if (item.tolerance === undefined && item.relativeTolerance === undefined) issues.push("numeric items need a tolerance or relativeTolerance");
      break;
    case "mcq":
      if (options.length < 2) issues.push("mcq items need at least two options");
      if (!inRange(item.answer)) issues.push("mcq answer must be the index of an option");
      break;
    case "multi_select":
      if (options.length < 2) issues.push("multi_select items need at least two options");
      if (!Array.isArray(item.answer) || item.answer.length === 0 || !item.answer.every(inRange) || new Set(item.answer).size !== item.answer.length) issues.push("multi_select answer must be a non-empty list of distinct option indexes");
      break;
    case "true_false":
      if (item.answer !== "true" && item.answer !== "false") issues.push('true_false answer must be "true" or "false"');
      break;
    case "short":
      if (typeof item.answer !== "string" || !item.answer.trim()) issues.push("short items need a canonical text answer");
      break;
    case "ordering":
      if (options.length < 2) issues.push("ordering items need at least two options in the correct order");
      break;
    case "free":
      if (!(item.keyPoints?.length || item.rubric?.length)) issues.push("free items need keyPoints (offline grading) or a rubric");
      break;
  }
  return issues;
}

export const PracticeItemSchema = z
  .object({
    id: text,
    skill: SkillAreaSchema,
    subskill: text,
    concepts: z.array(text).min(1),
    level: ItemLevelSchema,
    difficulty: DifficultySchema,
    format: ItemFormatSchema,
    prompt: text,
    options: z.array(text).optional(),
    answer: z.union([z.number(), z.array(z.number().int()), z.string()]).optional(),
    tolerance: z.number().min(0).optional(),
    relativeTolerance: z.number().min(0).optional(),
    accept: z.array(z.string()).optional(),
    unit: z.string().optional(),
    solution: text,
    method: text,
    hints: z.array(text),
    commonErrors: z.array(CommonErrorSchema),
    transfer: TransferLevelSchema,
    keyPoints: z.array(text).optional(),
    rubric: z.array(RubricCriterionSchema).optional(),
    minutes: z.number().min(0.5),
    examEligible: z.boolean().optional(),
    examOnly: z.boolean().optional(),
    passageId: z.string().optional(),
    tags: z.array(z.string()).optional(),
    origin: z.literal("generated"),
  })
  .superRefine((item, ctx) => {
    for (const message of itemFormatIssues(item)) ctx.addIssue({ code: "custom", path: ["answer"], message });
  });
export type GeneratedPracticeItem = z.infer<typeof PracticeItemSchema>;

/* ------------------------------------------------------------------ */
/* Lessons (mirrors Lesson and LessonStep)                              */
/* ------------------------------------------------------------------ */

const DepthTextSchema = z.object({ standard: text, intuition: z.string().optional(), deep: z.string().optional(), technical: z.string().optional() });
const stepBase = { id: text, title: z.string().optional() };

export const LessonStepSchema = z.discriminatedUnion("kind", [
  z.object({ ...stepBase, kind: z.literal("question"), prompt: text, thinkSeconds: z.number().int().min(0).optional(), reveal: text }),
  z.object({ ...stepBase, kind: z.enum(["intuition", "model"]), body: DepthTextSchema, structure: z.array(z.object({ term: text, meaning: text })).optional() }),
  z.object({ ...stepBase, kind: z.literal("worked_example"), problem: text, steps: z.array(z.object({ text: text, note: z.string().optional() })).min(1), answer: text }),
  z.object({ ...stepBase, kind: z.enum(["guided_practice", "independent_practice"]), itemIds: z.array(text).min(1), scaffold: z.string().optional() }),
  z.object({ ...stepBase, kind: z.literal("explain_back"), prompt: text, keyPoints: z.array(text).min(1), minWords: z.number().int().min(0).optional() }),
  z.object({ ...stepBase, kind: z.literal("transfer"), itemIds: z.array(text).min(1), framing: z.string().optional() }),
]);

/** Structural requirements every lesson (seeded or generated) meets. Empty when sound. */
export function lessonStepIssues(steps: Pick<LessonStep, "id" | "kind">[]): string[] {
  const issues: string[] = [];
  const ids = new Set<string>();
  for (const s of steps) {
    if (ids.has(s.id)) issues.push(`duplicate step id "${s.id}"`);
    ids.add(s.id);
  }
  const kinds = new Set(steps.map((s) => s.kind));
  if (steps[0]?.kind !== "question") issues.push("the first step must be a question the learner thinks about before being told");
  if (!kinds.has("intuition") && !kinds.has("model")) issues.push("a lesson needs an intuition or model step");
  if (!kinds.has("worked_example")) issues.push("a lesson needs a worked example");
  if (!kinds.has("guided_practice") && !kinds.has("independent_practice")) issues.push("a lesson needs a practice step");
  if (!kinds.has("explain_back")) issues.push("a lesson needs an explain-back step");
  return issues;
}

export const LessonSchema = z
  .object({
    id: text,
    moduleId: text,
    conceptIds: z.array(text).min(1),
    title: text,
    promise: text,
    minutes: z.number().min(1),
    difficulty: DifficultySchema,
    steps: z.array(LessonStepSchema).min(1),
    origin: z.literal("generated"),
  })
  .superRefine((lesson, ctx) => {
    for (const message of lessonStepIssues(lesson.steps)) ctx.addIssue({ code: "custom", path: ["steps"], message });
  });

/** A generated lesson with its inline items; practice steps reference inline or existing item ids. */
export const GeneratedLessonSchema = z
  .object({ lesson: LessonSchema, items: z.array(PracticeItemSchema) })
  .superRefine((out, ctx) => {
    const seen = new Set<string>();
    out.items.forEach((item, i) => {
      if (seen.has(item.id)) ctx.addIssue({ code: "custom", path: ["items", i, "id"], message: `duplicate inline item id "${item.id}"` });
      seen.add(item.id);
    });
  });
export type GeneratedLesson = z.infer<typeof GeneratedLessonSchema>;

/** Item ids referenced by the lesson's practice and transfer steps that resolve to neither an inline item nor a known id. */
export function lessonItemProblems(out: GeneratedLesson, knownItemIds: Iterable<string>): string[] {
  const known = new Set<string>([...knownItemIds, ...out.items.map((i) => i.id)]);
  const problems: string[] = [];
  for (const step of out.lesson.steps) {
    if (step.kind !== "guided_practice" && step.kind !== "independent_practice" && step.kind !== "transfer") continue;
    for (const id of step.itemIds) if (!known.has(id)) problems.push(`step "${step.id}" references unknown item "${id}"`);
  }
  return problems;
}

/**
 * Drops item references that resolve nowhere and any practice/transfer step left empty,
 * then re-validates. Throws when the lesson cannot stand without the lost steps.
 */
export function repairLessonItemRefs(out: GeneratedLesson, knownItemIds: Iterable<string>): GeneratedLesson {
  if (lessonItemProblems(out, knownItemIds).length === 0) return out;
  const known = new Set<string>([...knownItemIds, ...out.items.map((i) => i.id)]);
  const steps = out.lesson.steps.flatMap((step) => {
    if (step.kind !== "guided_practice" && step.kind !== "independent_practice" && step.kind !== "transfer") return [step];
    const itemIds = step.itemIds.filter((id) => known.has(id));
    return itemIds.length ? [{ ...step, itemIds }] : [];
  });
  const result = GeneratedLessonSchema.safeParse({ lesson: { ...out.lesson, steps }, items: out.items });
  if (!result.success) throw new Error("The generated lesson references practice items that do not exist and cannot stand without them");
  return result.data;
}

/* ------------------------------------------------------------------ */
/* Evaluation outputs                                                   */
/* ------------------------------------------------------------------ */

export const SolutionEvaluationSchema = z
  .object({
    score: unit,
    feedback: text,
    strengths: z.array(text),
    improvements: z.array(text),
    covered: z.array(z.string()).optional(),
    missed: z.array(z.string()).optional(),
    errorCategory: ErrorCategorySchema.optional(),
    methodMatched: z.boolean(),
  })
  .superRefine((out, ctx) => praiseGuard(ctx, [[["feedback"], out.feedback], ...listEntries("strengths", out.strengths), ...listEntries("improvements", out.improvements)]));
export type SolutionEvaluation = z.infer<typeof SolutionEvaluationSchema>;

const WritingScoresSchema = z.object({
  clarity: unit,
  structure: unit,
  precision: unit,
  logic: unit,
  evidence: unit,
  counterargument: unit,
  depth: unit,
  synthesis: unit,
  originality: unit,
}) satisfies z.ZodType<Record<WritingCriterion, number>>;

export const WritingEvaluationSchema = z
  .object({
    scores: WritingScoresSchema,
    overall: unit,
    passages: z.array(z.object({ quote: text, note: text, criterion: WritingCriterionSchema })).min(1),
    strengths: z.array(text),
    improvements: z.array(text).min(1),
  })
  .superRefine((out, ctx) => praiseGuard(ctx, [...out.passages.map((p, i) => [["passages", i, "note"], p.note] as [Path, string]), ...listEntries("strengths", out.strengths), ...listEntries("improvements", out.improvements)]));
export type WritingEvaluation = z.infer<typeof WritingEvaluationSchema>;

export const ExplanationEvaluationSchema = z
  .object({ score: unit, covered: z.array(z.string()), missed: z.array(z.string()), feedback: text, misconceptions: z.array(z.string()) })
  .superRefine((out, ctx) => praiseGuard(ctx, [[["feedback"], out.feedback]]));
export type ExplanationEvaluation = z.infer<typeof ExplanationEvaluationSchema>;

export const ReconstructionEvaluationSchema = z
  .object({
    score: unit,
    feedback: text,
    extractedConcepts: z.array(z.object({ title: text, suggestedConceptId: z.string().optional(), note: z.string().optional() })),
    connections: z.array(z.string()),
    missed: z.array(z.string()).optional(),
  })
  .superRefine((out, ctx) => praiseGuard(ctx, [[["feedback"], out.feedback]]));
export type ReconstructionEvaluation = z.infer<typeof ReconstructionEvaluationSchema>;

export const SpeakingEvaluationSchema = z
  .object({
    rubricScores: z.array(z.object({ criterion: text, score: unit })).min(1),
    overall: unit,
    feedback: text,
    features: z.array(z.object({ feature: text, evidence: text, effect: text })),
    keyPointsCovered: z.array(z.string()),
    keyPointsMissed: z.array(z.string()),
  })
  .superRefine((out, ctx) => {
    const prose: [Path, string][] = [[["feedback"], out.feedback], ...out.features.flatMap((f, i) => [[["features", i, "feature"], f.feature], [["features", i, "effect"], f.effect]] as [Path, string][])];
    praiseGuard(ctx, prose);
    forbid(ctx, prose, PERSONALITY_CLAIMS, "describe the words, not the speaker");
  });
export type SpeakingEvaluation = z.infer<typeof SpeakingEvaluationSchema>;

export const ErrorClassificationSchema = z.object({ category: ErrorCategorySchema, confidence: unit, reason: text });
export type ErrorClassification = z.infer<typeof ErrorClassificationSchema>;

/* ------------------------------------------------------------------ */
/* Generation and analysis outputs                                      */
/* ------------------------------------------------------------------ */

export const TransferChallengeSchema = z
  .object({
    title: text,
    scenario: z.string().min(80),
    task: text,
    requiredConcepts: z.array(text).min(1),
    rubric: z.array(RubricCriterionSchema).min(1),
    keyPoints: z.array(text).min(1),
  })
  .superRefine((out, ctx) => {
    if (!out.rubric.some((r) => r.weight > 0)) ctx.addIssue({ code: "custom", path: ["rubric"], message: "at least one rubric criterion needs a positive weight" });
  });
export type TransferChallenge = z.infer<typeof TransferChallengeSchema>;

export const ExamItemsSchema = z.object({ items: z.array(PracticeItemSchema).min(1) });
export type ExamItems = z.infer<typeof ExamItemsSchema>;

export const ArgumentCritiqueSchema = z.object({
  mainClaim: text,
  premises: z.array(z.string()),
  structure: z.enum(ARGUMENT_STRUCTURES),
  weakestLink: z.object({ quote: text, problem: text }),
  fallacies: z.array(z.object({ name: text, quote: text, note: text })),
  unsupportedClaims: z.array(z.string()),
  hiddenAssumptions: z.array(z.string()),
  strength: unit,
  verdict: text,
  oneThing: text,
});
export type ArgumentCritique = z.infer<typeof ArgumentCritiqueSchema>;

export const CounterargumentSchema = z.object({
  position: text,
  argument: text,
  premises: z.array(text).min(1),
  strongestEvidence: z.array(z.string()),
  whatWouldSettleIt: text,
  weakness: text,
});
export type Counterargument = z.infer<typeof CounterargumentSchema>;

export const KnowledgeExtractionSchema = z
  .object({
    concepts: z.array(z.object({ title: text, summary: text, conceptId: z.string().optional(), nodeKind: KnowledgeNodeKindSchema, key: z.string().optional() })),
    edges: z.array(z.object({ from: text, to: text, relation: KnowledgeRelationSchema, note: z.string().optional() })),
  })
  .superRefine((out, ctx) => {
    const seen = new Set<string>();
    out.concepts.forEach((c, i) => {
      const k = c.title.toLowerCase();
      if (seen.has(k)) ctx.addIssue({ code: "custom", path: ["concepts", i, "title"], message: `duplicate concept "${c.title}"` });
      seen.add(k);
    });
  });
export type KnowledgeExtraction = z.infer<typeof KnowledgeExtractionSchema>;

export const ConceptLinksSchema = z.object({
  links: z.array(z.object({ to: text, relation: KnowledgeRelationSchema, note: text, confidence: unit })),
});
export type ConceptLinks = z.infer<typeof ConceptLinksSchema>;

export function sentenceCount(s: string): number {
  return s
    .split(/(?<=[.?!])\s+/)
    .map((x) => x.trim())
    .filter(Boolean).length;
}

export const PlanNarrativeSchema = z.object({ narrative: text }).superRefine((out, ctx) => {
  const n = sentenceCount(out.narrative);
  if (n < 1 || n > 3) ctx.addIssue({ code: "custom", path: ["narrative"], message: "the narrative is two plain sentences" });
  if (out.narrative.includes("!")) ctx.addIssue({ code: "custom", path: ["narrative"], message: "no exclamation marks" });
  if (out.narrative.split(/\s+/).length > 90) ctx.addIssue({ code: "custom", path: ["narrative"], message: "the narrative is short" });
});
export type PlanNarrative = z.infer<typeof PlanNarrativeSchema>;

export const WeaknessAnalysisSchema = z
  .object({
    observations: z.array(z.object({ text: text, evidence: text, severity: z.enum(["good", "attention", "info"]) })),
  })
  .superRefine((out, ctx) => praiseGuard(ctx, out.observations.map((o, i) => [["observations", i, "text"], o.text] as [Path, string])));
export type WeaknessAnalysis = z.infer<typeof WeaknessAnalysisSchema>;

export const ProjectQuestionsSchema = z.object({
  questions: z.array(z.object({ text: text, category: QuestionCategorySchema, why: text, informationValue: unit })).min(1),
});
export type ProjectQuestions = z.infer<typeof ProjectQuestionsSchema>;

export const TutorReplySchema = z.object({
  text: text,
  thinkFirst: z.boolean().describe("true when the reply asks the learner for their attempt before reasoning for them"),
  mode: TutorModeSchema,
  provenance: ProvenanceSchema.optional(),
  offers: z
    .object({
      saveToKnowledge: z.boolean().optional(),
      scheduleRetrieval: z.boolean().optional(),
      conceptId: z.string().optional(),
      title: z.string().optional(),
    })
    .optional(),
});
export type TutorReply = z.infer<typeof TutorReplySchema>;

/* ------------------------------------------------------------------ */
/* Operations                                                           */
/* ------------------------------------------------------------------ */

export const OPS = {
  generateCase: { output: CaseSchema, effort: "high" as const },
  validateCase: { output: z.object({ valid: z.boolean(), problems: z.array(z.string()) }), effort: "medium" as const },
  evaluateReasoning: { output: ReasoningEvaluation, effort: "high" as const },
  evaluateQuestion: { output: QuestionEvaluation, effort: "medium" as const },
  generateSalonScenario: { output: z.any(), effort: "high" as const },
  continueSalonConversation: { output: SalonTurn, effort: "medium" as const },
  evaluateSalon: { output: SalonReviewSchema, effort: "high" as const },
  generateStrategyScenario: { output: z.any(), effort: "high" as const },
  simulateCounterpartyMove: { output: StrategyMoveResult, effort: "high" as const },
  evaluateStrategy: { output: StrategyEvaluation, effort: "high" as const },
  generateArchiveEntry: { output: ArchiveEntrySchema, effort: "high" as const },
  generateCuriosity: { output: CuriositySchema, effort: "medium" as const },
  generateRecallQuestion: { output: RecallQuestionSchema, effort: "low" as const },
  evaluateRecall: { output: RecallEvaluation, effort: "medium" as const },
  generateRhetoricPrompt: { output: RhetoricPromptSchema, effort: "medium" as const },
  evaluateRhetoric: { output: RhetoricEvaluation, effort: "medium" as const },
  generateRedThreadCandidates: { output: RedThreadCandidates, effort: "high" as const },
  validateRedThreadEvidence: { output: RedThreadValidation, effort: "medium" as const },
  generateDailySession: { output: DailySessionPlan, effort: "medium" as const },
  recommendNextChallenge: { output: Recommendation, effort: "medium" as const },
  curatorRespond: { output: CuratorReply, effort: "high" as const },
  classifyQuestion: { output: z.object({ type: z.string(), leading: z.boolean() }), effort: "low" as const },
  // V2
  generateLesson: { output: GeneratedLessonSchema, effort: "high" as const },
  generatePracticeItem: { output: PracticeItemSchema, effort: "medium" as const },
  evaluateSolution: { output: SolutionEvaluationSchema, effort: "medium" as const },
  evaluateWriting: { output: WritingEvaluationSchema, effort: "high" as const },
  evaluateExplanation: { output: ExplanationEvaluationSchema, effort: "medium" as const },
  evaluateReconstruction: { output: ReconstructionEvaluationSchema, effort: "medium" as const },
  generateTransferChallenge: { output: TransferChallengeSchema, effort: "high" as const },
  generateExamItems: { output: ExamItemsSchema, effort: "high" as const },
  critiqueArgument: { output: ArgumentCritiqueSchema, effort: "high" as const },
  generateCounterargument: { output: CounterargumentSchema, effort: "medium" as const },
  extractKnowledgeConcepts: { output: KnowledgeExtractionSchema, effort: "medium" as const },
  recommendConceptLinks: { output: ConceptLinksSchema, effort: "low" as const },
  createDailyPlanNarrative: { output: PlanNarrativeSchema, effort: "low" as const },
  analyzeLearningWeaknesses: { output: WeaknessAnalysisSchema, effort: "high" as const },
  generateProjectQuestions: { output: ProjectQuestionsSchema, effort: "medium" as const },
  tutorRespond: { output: TutorReplySchema, effort: "high" as const },
  evaluateSpeaking: { output: SpeakingEvaluationSchema, effort: "medium" as const },
  classifyErrorCategory: { output: ErrorClassificationSchema, effort: "low" as const },
} as const;

export type OpName = keyof typeof OPS;
export type OpOutput<K extends OpName> = z.infer<(typeof OPS)[K]["output"]>;

/** Ops that can also stream plain text (`ai.stream`). */
export const STREAM_OPS = ["curatorRespond", "continueSalonConversation", "tutorRespond"] as const;
export type StreamOpName = (typeof STREAM_OPS)[number];
export function isStreamOp(op: string): op is StreamOpName {
  return (STREAM_OPS as readonly string[]).includes(op);
}

/* ------------------------------------------------------------------ */
/* V2 inputs (TypeScript contracts; the browser sends them as JSON)     */
/* ------------------------------------------------------------------ */

export interface OpBase {
  /** Overrides the op's default effort. */
  effort?: Effort;
}

/** What the model needs to know about a curriculum concept. */
export interface ConceptBrief {
  id: string;
  title: string;
  summary: string;
  keyPoints: string[];
  misconception?: string;
  applications?: string[];
  difficulty?: Difficulty;
  domainId?: DomainId;
  dependsOn?: string[];
}

/** An item the model may evaluate against or reference; ExamItemSnapshot fits (method optional). */
export interface ItemBrief {
  id?: string;
  prompt: string;
  format: ItemFormat;
  solution: string;
  method?: string;
  answer?: number | number[] | string;
  options?: string[];
  keyPoints?: string[];
  rubric?: RubricCriterion[];
  commonErrors?: CommonError[];
  skill: SkillArea;
  subskill?: string;
  concepts: string[];
  level?: ItemLevel;
  difficulty?: Difficulty;
  transfer?: TransferLevel;
  /** Passage text for reading items. */
  passage?: string;
}

export interface ExistingItemBrief {
  id: string;
  prompt: string;
  format: ItemFormat;
  level: ItemLevel;
  difficulty: Difficulty;
  transfer?: TransferLevel;
}

export interface LearnerBrief {
  name?: string;
  educationLevel?: string;
  goals?: string[];
  interests?: string[];
}

export interface WritingPromptBrief {
  level: WritingLevel;
  title: string;
  prompt: string;
  source?: string;
  sources?: { title: string; text: string }[];
  constraints?: { minWords?: number; maxWords?: number; minutes?: number; requireCounterargument?: boolean };
  emphasis: WritingCriterion[];
  keyPoints?: string[];
}

export interface SpeakingPromptBrief {
  mode: SpeakingMode;
  title: string;
  prompt: string;
  seconds: number;
  material?: string;
  keyPoints?: string[];
  rubric: RubricCriterion[];
}

export interface NodeBrief {
  key: string;
  title: string;
  summary: string;
  kind: KnowledgeNodeKind;
}

export interface ProjectBrief {
  kind: string;
  title: string;
  question: string;
  whyItMatters: string;
  whatIThinkNow?: string;
  requiredConcepts: string[];
  claims?: { text: string; support: string }[];
  openQuestions?: string[];
  sources?: { title: string; note?: string }[];
}

/** Aggregates from Review. The model receives nothing else and must not compute new figures. */
export interface LearningAggregates {
  windowDays: number;
  skills: { skill: SkillArea; independentAccuracy: number | null; n: number; delayed: "strong" | "developing" | "weak" | "insufficient"; transfer: "strong" | "developing" | "weak" | "insufficient"; trend: "up" | "down" | "flat" }[];
  domains: { domainId: DomainId; durable: number; fragile: number; learning: number; total: number }[];
  errors: { category: ErrorCategory; conceptId?: string; count: number; days: number }[];
  retention: { total: number; durable: number; fragile: number; decaying: number; due: number; failedDelayed7d?: number };
  calibration?: { brier: number; verdict: "overconfident" | "underconfident" | "well_calibrated" | "insufficient"; n: number };
  independence?: { rate: number | null; attempts: number; hints: number; reveals: number };
  exams?: { kind: ExamKind; total: number; delta?: number; at: string }[];
  time?: { minutes: number; byKind: Record<string, number> };
}

export interface TutorContext {
  learner?: LearnerBrief;
  /** Concepts in focus, with their real mastery state. */
  focusConcepts?: { id: string; title: string; summary?: string; keyPoints?: string[]; state?: ConceptState; estimate?: number }[];
  currentItem?: ItemBrief;
  currentLesson?: { id: string; title: string; stepKind?: string };
  source?: { title: string; author?: string; currentQuestion?: string; type?: SourceType };
  project?: ProjectBrief;
  recentErrors?: { category: ErrorCategory; conceptId?: string; count: number }[];
  plan?: { title: string; kind: PlanItemKind; status: string; reasonText?: string }[];
  retention?: { due: number; fragile: number };
  independence?: { rate: number | null };
  /** The only ids `offers.conceptId` may take. */
  candidateConcepts?: { id: string; title: string }[];
  /** Extra stance text the feature adds to the mode's default. */
  stance?: string;
}

export interface TutorInput extends OpBase {
  mode: TutorMode;
  thinkFirst: boolean;
  /** From the deterministic gate (`src/lib/curator/think-first.ts`): lookup questions are answered directly. */
  requestKind: "lookup" | "reasoning" | "unknown";
  attemptOffered: boolean;
  depth?: LessonDepth;
  context: TutorContext;
  messages: { role: "user" | "curator"; text: string }[];
}

export interface V2OpInputs {
  generateLesson: OpBase & { lessonId: string; moduleId: string; concepts: ConceptBrief[]; depth: LessonDepth; skill: SkillArea; existingItems: ExistingItemBrief[]; itemIdPrefix: string; minutes?: number; learner?: LearnerBrief };
  generatePracticeItem: OpBase & {
    itemId: string;
    concept: ConceptBrief;
    relatedConcepts?: ConceptBrief[];
    skill: SkillArea;
    subskill?: string;
    level: ItemLevel;
    difficulty: Difficulty;
    format: ItemFormat;
    transfer: TransferLevel;
    avoidPrompts?: string[];
    /** Set when the item targets a recurring error. */
    remediate?: { category: ErrorCategory; description: string; question?: string; response?: string };
    passage?: string;
    learner?: LearnerBrief;
  };
  evaluateSolution: OpBase & { item: ItemBrief; response: string; confidence?: number; hintsUsed?: number; context?: PracticeContext };
  evaluateWriting: OpBase & { prompt: WritingPromptBrief; text: string; metrics?: { words: number; sentences: number; avgSentenceLength: number; hedges: number; passiveHints: number; paragraphs: number }; previousImprovements?: string[]; version?: number };
  evaluateExplanation: OpBase & { concept: ConceptBrief; prompt: string; keyPoints: string[]; text: string; minWords?: number };
  evaluateReconstruction: OpBase & {
    source: { title: string; author?: string; type?: SourceType; unit?: string };
    keyIdeas: string[];
    recall: { centralIdeas: string; argument: string; evidence: string; unclear?: string; disagree?: string; connections?: string };
    candidateConcepts: { id: string; title: string }[];
  };
  generateTransferChallenge: OpBase & { concepts: ConceptBrief[]; difficulty: Difficulty; interests?: string[]; domainHint?: string; avoidScenarios?: string[]; minutes?: number };
  generateExamItems: OpBase & { idPrefix: string; count: number; concepts: ConceptBrief[]; skill: SkillArea; levels: ItemLevel[]; formats: ItemFormat[]; band: [Difficulty, Difficulty]; avoidPrompts?: string[]; passage?: { id: string; title: string; text: string } };
  critiqueArgument: OpBase & { text: string; claim?: string; context?: string; concepts?: string[] };
  generateCounterargument: OpBase & { claim: string; argument?: string; context?: string };
  extractKnowledgeConcepts: OpBase & { text: string; source?: { title: string; author?: string }; candidateConcepts: { id: string; title: string }[]; existingNodes?: { key: string; title: string }[]; maxConcepts?: number };
  recommendConceptLinks: OpBase & { node: NodeBrief; candidates: NodeBrief[]; existingEdges?: { to: string; relation: KnowledgeRelation }[]; limit?: number };
  createDailyPlanNarrative: OpBase & { date: string; mode: PlanMode; minutes: number; items: Pick<PlanItem, "kind" | "title" | "minutes" | "reason" | "reasonText">[]; signals: DailyPlan["signals"]; name?: string };
  analyzeLearningWeaknesses: OpBase & { aggregates: LearningAggregates; minN?: number };
  generateProjectQuestions: OpBase & { project: ProjectBrief; count?: number };
  tutorRespond: TutorInput;
  evaluateSpeaking: OpBase & { prompt: SpeakingPromptBrief; transcript: string; durationMs: number; metrics?: { words: number; wordsPerMinute?: number; fillers: number; repetitions: number; sentences: number; avgSentenceLength: number }; transcriptSource?: "typed" | "browser" | "model" };
  classifyErrorCategory: OpBase & { item: ItemBrief; response: string; correct: boolean; confidence?: number; deterministic?: ErrorCategory };
}

export type V2OpName = keyof V2OpInputs;
/** V2 ops have typed inputs; V1 ops keep their loose records. */
export type OpInput<K extends OpName> = K extends V2OpName ? V2OpInputs[K] : Record<string, unknown>;

/* ------------------------------------------------------------------ */
/* Post-validation against the input (pure; applied server-side)       */
/* ------------------------------------------------------------------ */

function normalise(s: string): string {
  return s
    .replace(/[‘’‚]/g, "'")
    .replace(/[“”„]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/^[\s.…]+|[\s.…]+$/g, "")
    .replace(/\s+/g, " ");
}

/** Is `quote` a verbatim passage of `text` (whitespace, quote marks and dashes normalised)? */
export function quoteFound(text: string, quote: string): boolean {
  const q = normalise(quote);
  return q.length > 0 && normalise(text).includes(q);
}

/** Drops passages that do not quote the text. Throws when none survive: feedback that quotes nothing is not feedback. */
export function verifyWritingPassages(out: WritingEvaluation, text: string): WritingEvaluation {
  const passages = out.passages.filter((p) => quoteFound(text, p.quote));
  if (!passages.length) throw new Error("The evaluation did not quote the text");
  return { ...out, passages };
}

/** Every number in a value tree, plus the percent form of unit-interval values. */
export function numbersIn(value: unknown, into = new Set<number>()): Set<number> {
  if (typeof value === "number" && Number.isFinite(value)) {
    into.add(value);
    if (value >= 0 && value <= 1) into.add(value * 100);
  } else if (typeof value === "string") {
    for (const m of value.match(/-?\d+(?:\.\d+)?/g) ?? []) into.add(Number(m));
  } else if (Array.isArray(value)) value.forEach((v) => numbersIn(v, into));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => numbersIn(v, into));
  return into;
}

/** Numerals written in prose, with the number of decimals used, thousands separators removed. */
export function numeralsIn(text: string): { value: number; decimals: number }[] {
  return (text.replace(/(\d),(?=\d{3}\b)/g, "$1").match(/-?\d+(?:\.\d+)?/g) ?? []).map((m) => ({ value: Number(m), decimals: (m.split(".")[1] ?? "").length }));
}

/** Does `t` (as written, with `decimals` places) round from some number in the pool? */
export function numberSupported(t: number, decimals: number, pool: Iterable<number>): boolean {
  const slack = 0.5 * Math.pow(10, -decimals) + 1e-9;
  for (const a of pool) if (Math.abs(a - t) <= slack) return true;
  return false;
}

/** Drops observations whose numerals are not present in the aggregates. Never fabricated numbers, at the cost of recall. */
export function verifyObservations(out: WeaknessAnalysis, aggregates: unknown, extra: number[] = []): WeaknessAnalysis {
  const pool = numbersIn(aggregates);
  extra.forEach((n) => pool.add(n));
  const observations = out.observations.filter((o) => numeralsIn(`${o.text} ${o.evidence}`).every((n) => numberSupported(n.value, n.decimals, pool)));
  return { observations };
}

type PostProcessor<K extends OpName> = (out: OpOutput<K>, input: OpInput<K>) => OpOutput<K>;

/** Input-aware checks the schema alone cannot express. Applied by `runOp` after parsing. */
export const OP_POST: { [K in OpName]?: PostProcessor<K> } = {
  generateLesson: (out, input) =>
    repairLessonItemRefs(
      out,
      input.existingItems.map((e) => e.id),
    ),
  generatePracticeItem: (out, input) => ({ ...out, id: input.itemId, examEligible: false, examOnly: false, origin: "generated" }),
  generateExamItems: (out, input) => ({
    items: out.items.slice(0, Math.max(1, input.count)).map((item, n) => ({ ...item, id: `${input.idPrefix}-${n + 1}`, examEligible: true, origin: "generated", ...(input.passage ? { passageId: input.passage.id } : {}) })),
  }),
  evaluateWriting: (out, input) => verifyWritingPassages(out, input.text),
  evaluateReconstruction: (out, input) => {
    const ids = new Set(input.candidateConcepts.map((c) => c.id));
    return { ...out, extractedConcepts: out.extractedConcepts.map((c) => (c.suggestedConceptId && ids.has(c.suggestedConceptId) ? c : { ...c, suggestedConceptId: undefined })) };
  },
  generateTransferChallenge: (out, input) => {
    const ids = input.concepts.map((c) => c.id);
    const known = out.requiredConcepts.filter((id) => ids.includes(id));
    return { ...out, requiredConcepts: known.length ? known : ids };
  },
  critiqueArgument: (out, input) => ({ ...out, fallacies: out.fallacies.filter((f) => quoteFound(input.text, f.quote)) }),
  extractKnowledgeConcepts: (out, input) => {
    const candidates = new Set(input.candidateConcepts.map((c) => c.id));
    const concepts = out.concepts.slice(0, input.maxConcepts ?? out.concepts.length).map((c) => (c.conceptId && candidates.has(c.conceptId) ? c : { ...c, conceptId: undefined }));
    const keys = new Set<string>([...(input.existingNodes ?? []).map((n) => n.key), ...concepts.flatMap((c) => [c.title, c.key ?? "", c.conceptId ?? ""].filter(Boolean))]);
    return { concepts, edges: out.edges.filter((e) => keys.has(e.from) && keys.has(e.to) && e.from !== e.to) };
  },
  recommendConceptLinks: (out, input) => {
    const keys = new Set(input.candidates.map((c) => c.key));
    const existing = new Set((input.existingEdges ?? []).map((e) => `${e.to}:${e.relation}`));
    return { links: out.links.filter((l) => keys.has(l.to) && l.to !== input.node.key && !existing.has(`${l.to}:${l.relation}`)).slice(0, input.limit ?? out.links.length) };
  },
  analyzeLearningWeaknesses: (out, input) => verifyObservations(out, input.aggregates, [input.minN ?? 0]),
  tutorRespond: (out, input) => {
    const ids = new Set((input.context.candidateConcepts ?? []).map((c) => c.id));
    if (out.offers?.conceptId && !ids.has(out.offers.conceptId)) return { ...out, offers: { ...out.offers, conceptId: undefined } };
    return out;
  },
};

/** The only place a persisted PracticeItem should come from when generated. */
export function toPracticeItem(item: GeneratedPracticeItem): PracticeItem {
  return item;
}
