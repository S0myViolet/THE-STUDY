import { z } from "zod";

/**
 * Input/output contracts for every AI operation. Outputs with application-state
 * implications are validated before anything is persisted.
 */

const subskill = z.string();
const difficulty = z.number().int().min(1).max(8);

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
} as const;

export type OpName = keyof typeof OPS;
export type OpOutput<K extends OpName> = z.infer<(typeof OPS)[K]["output"]>;
