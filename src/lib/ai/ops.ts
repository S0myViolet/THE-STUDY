import "server-only";
import { z } from "zod";
import { OPS, type OpName } from "./schemas";
import { completeStructured, streamText, type Effort } from "./provider";

/**
 * Prompt construction for every operation. Deterministic work never reaches here;
 * this file exists for free-form reasoning evaluation, generation, conversation and synthesis.
 */

export const STUDY_VOICE = `You are the intelligence of THE STUDY, a private intellectual training environment.
Voice: calm, precise, curious, slightly challenging, occasionally dry. Never sycophantic, never theatrical, never pseudo-mysterious. No spy fiction. Do not call the user "agent". Do not imitate television characters.
Principles you enforce everywhere:
- Separate OBSERVATION from INTERPRETATION. Praise the distinction when the user makes it; name it when they blur it.
- Multiple explanations before conclusions. Reward alternatives. Name premature closure.
- Base rates, context, alternative explanations, questions, evidence updating, calibration.
- Never claim body language, eye movement or a single expression proves lying or intent. Never infer protected or sensitive personal characteristics from appearance.
- "Insufficient evidence" is a legitimate, sometimes correct, conclusion. "I don't know yet" can be the best answer.
- Feedback is specific and short. One or two key improvements beat a list of ten.
Write in clean prose. No emoji. No bullet spam. British or American spelling is fine; be consistent.`;

const OP_PROMPTS: Record<OpName, (input: Record<string, unknown>) => string> = {
  generateCase: (i) => `Author a new multi-stage case for THE STUDY.
Constraints: difficulty ${i.difficulty}, about ${i.minutes} minutes, faculties ${JSON.stringify(i.faculties)}, user interests ${JSON.stringify(i.interests)}, avoid these recent settings: ${JSON.stringify(i.avoidSettings ?? [])}.
Not a murder mystery. Prefer everyday, professional, historical, scientific, travel or social situations with genuine ambiguity. The case may legitimately conclude "insufficient evidence".
Use these stage kinds in order: enter, notice, recall, separate, hypotheses, question, evidence, update, decision, explain, debrief. For "notice" use material.kind "document" or "thread" with 8–14 concrete lines that contain the details later stages test. Recall questions must be answerable from that material only. "separate" needs 6–8 statements with a balanced mix of observation/inference/unknown. Question options (4–5) need calibrated informationValue. Decision options (3–4) need quality values. Provide expertReasoning and keyInsight in debrief. Subskill ids must come from: ${i.subskillIds}.
Return the case JSON only.`,
  validateCase: (i) => `Validate this case for internal consistency: every recall answer must be derivable from the notice material; statements labelled observation must be literally present; the ground truth must be consistent with the revealed evidence; no stage should be empty. Case: ${JSON.stringify(i.case)}`,
  evaluateReasoning: (i) => `Evaluate the user's reasoning.
Task: ${i.task}
Ground truth / expert view: ${i.groundTruth}
User response: """${i.response}"""
${i.context ? `Context: ${i.context}` : ""}
Score 0–1 on reasoning quality (not merely on reaching the right answer). Identify what they correctly observed, what they missed, unexamined assumptions, and count alternatives considered. Error types from: OBSERVATION_MISS, FALSE_OBSERVATION, PREMATURE_CLOSURE, BASE_RATE_NEGLECT, CONFIRMATION_BIAS, CAUSAL_ERROR, ASSUMPTION, TIMELINE_ERROR, QUESTION_QUALITY, INFORMATION_VALUE, OVERCONFIDENCE, UNDERCONFIDENCE, STRATEGIC_SHORTSIGHTEDNESS, MISREAD, PRECISION, ALTERNATIVE_NEGLECT, INSUFFICIENT_UPDATE, OVER_UPDATE.`,
  evaluateQuestion: (i) => `The user may ask exactly one question in this scenario.
Scenario: ${i.scenario}
Unknowns: ${JSON.stringify(i.unknowns)}
Their question: "${i.question}"
Score expected information gain, ambiguity reduction, rapport cost, whether it is leading, and relevance. Classify its type (open, closed, clarifying, discriminating, counterfactual, motive, timeline, evidence, assumption, information_value). Suggest a better question only if theirs is clearly weaker than an available alternative.`,
  generateSalonScenario: (i) => `Create a fictional Salon conversation scenario as JSON matching this TypeScript type: ${i.typeHint}. Objective theme: ${i.theme}. Difficulty ${i.difficulty}. The character must have private motivations and hidden facts that are only revealed by good questions. Include 5–8 hidden facts with trigger keywords and a script of 8–12 keyword-matched lines for offline play. Nothing about protected characteristics.`,
  continueSalonConversation: (i) => `You are playing a fictional character in a conversation exercise.
Character: ${JSON.stringify(i.character)}
Hidden facts (reveal only when a question genuinely earns them; guarded facts require rapport >= 0.5): ${JSON.stringify(i.hiddenFacts)}
Already revealed: ${JSON.stringify(i.revealed)}
Current rapport: ${i.rapport}
Conversation so far: ${JSON.stringify(i.turns)}
User's latest message: "${i.message}"
Reply in character, naturally, 1–4 sentences. Do not volunteer everything. Leading or accusatory questions reduce rapport and produce defensive, less informative replies. Genuinely curious, open, well-timed questions earn information. Return the reply, the ids of newly revealed facts, the rapport delta, the classification of the user's message and whether it was leading.`,
  evaluateSalon: (i) => `Review this Salon conversation.
Scenario objectives: ${JSON.stringify(i.objectives)}
Hidden facts: ${JSON.stringify(i.hiddenFacts)}
Revealed facts: ${JSON.stringify(i.revealed)}
Turns: ${JSON.stringify(i.turns)}
Count questions asked, questions that forced genuinely new information, leading questions, and the user's share of words. Decide which objectives were met. Give at most two key improvements and name the single strongest move if there was one. Score 0–1.`,
  generateStrategyScenario: (i) => `Create a strategy scenario as JSON matching this TypeScript type: ${i.typeHint}. Mode: ${i.mode}. Theme: ${i.theme}. Difficulty ${i.difficulty}. Build a decision tree of 6–10 nodes with 3–4 moves each; some moves should be information-gathering (option value) and be the best move; some should be irreversible and tempting. No crime or wrongdoing. Include actors with goals, constraints, leverage, fears, alternatives.`,
  simulateCounterpartyMove: (i) => `Strategic simulation.
Scenario: ${i.scenario}
Actors: ${JSON.stringify(i.actors)}
History: ${JSON.stringify(i.history)}
Current situation: ${i.situation}
User's move: "${i.move}" with rationale "${i.rationale ?? ""}"
Simulate what happens next as the world and counterparties respond to incentives, not to what the user hopes. Include second-order effects. Judge quality 0–1 (information-gathering before irreversible action is often high quality). Mark terminal when the scenario has reached a natural resolution.`,
  evaluateStrategy: (i) => `Debrief this strategy run. Scenario: ${i.scenario}. Path: ${JSON.stringify(i.path)}. Identify incentives the user recognised, second-order effects they missed, and one thing to change. Score 0–1.`,
  generateArchiveEntry: (i) => `Write an Archive entry for "${i.title}" (${i.kind ?? "concept"}, domain ${i.domain ?? "history"}).
Answer: WHAT IS IT, WHY DOES IT MATTER, WHAT CAME BEFORE, WHAT CAME AFTER, WHAT DOES IT CONNECT TO, WHAT SHOULD YOU REMEMBER (2–6 crisp points). Add 2–5 recall prompts with short answers. Suggest connections to these existing entries where genuinely relevant: ${JSON.stringify(i.existing ?? [])}. Be accurate; if a date or figure is contested, say so. ${i.question ? `The user's question was: "${i.question}"` : ""} id: kebab-case of title.`,
  generateCuriosity: (i) => `Write one Cabinet curiosity: short enough to enjoy (150–260 words), deep enough to matter, connected to broader knowledge. Domain preference: ${i.domain ?? "any"}. Avoid: ${JSON.stringify(i.avoid ?? [])}. Connect to these existing Archive ids where relevant: ${JSON.stringify(i.existing ?? [])}.`,
  generateRecallQuestion: (i) => `Write one retrieval prompt with a short answer for this material: ${i.material}`,
  evaluateRecall: (i) => `The user closed the source and reconstructed it from memory.
Source key points: ${JSON.stringify(i.keyPoints)}
Their reconstruction: """${i.reconstruction}"""
Score 0–1, list correct points, missing points, and errors (things they stated that the source did not).`,
  generateRhetoricPrompt: (i) => `Create a Rhetoric prompt for mode ${i.mode} at difficulty ${i.difficulty}, interests ${JSON.stringify(i.interests ?? [])}. Include a rubric and 3–6 key points a strong answer touches.`,
  evaluateRhetoric: (i) => `Evaluate this rhetoric exercise.
Mode: ${i.mode}. Prompt: ${i.prompt}. Rubric: ${JSON.stringify(i.rubric)}. Constraints: ${JSON.stringify(i.constraints ?? {})}.
User text: """${i.text}"""
Score 0–1. Up to three strengths and three improvements, specific to the text. Provide a tighter rewrite only if the text is over-long or unclear.`,
  generateRedThreadCandidates: (i) => `Analyse this user's recent error events and evidence for recurring patterns.
Errors (id, type, faculty, subskill, detail, session, date): ${JSON.stringify(i.errors)}
Subskill estimates: ${JSON.stringify(i.estimates)}
Existing threads: ${JSON.stringify(i.existing)}
A candidate requires at least 3 relevant instances across at least 2 sessions. Write descriptions in second person, specific and non-judgemental, e.g. "You often notice evidence that supports your first hypothesis but stop generating alternatives afterward." Propose a concrete next test.`,
  validateRedThreadEvidence: (i) => `Does this evidence genuinely support the pattern "${i.title}: ${i.description}"? Evidence: ${JSON.stringify(i.evidence)}. Be conservative.`,
  generateDailySession: (i) => `Plan a ${i.minutes}-minute session from these available modules: ${JSON.stringify(i.modules)}. Weakest subskills: ${JSON.stringify(i.weak)}. Due memory items: ${i.due}. Active threads: ${JSON.stringify(i.threads)}. Interests: ${JSON.stringify(i.interests)}. Recent modules to avoid repeating: ${JSON.stringify(i.recent)}. Mix targeted development, retention, interest, transfer, one strength and one serendipity.`,
  recommendNextChallenge: (i) => `Given this profile summary ${JSON.stringify(i.summary)}, recommend the single best next thing to work on and why, in two sentences.`,
  curatorRespond: (i) => `Mode: ${i.mode}. Think First is ${i.thinkFirst ? "ON" : "OFF"}. Depth: ${i.depth}. Challenge style: ${i.style}.
User context (structured, derived from real data): ${JSON.stringify(i.context)}
Conversation: ${JSON.stringify(i.messages)}
Respond as the Curator. If Think First is on and the user asks a reasoning question (who is lying, solve this, what do you think) without offering their own attempt, ask for their attempt first in one or two sentences, separating observation from inference. Simple factual questions get a direct answer. When the user asks "what should I work on", inspect the context and be specific about faculties, subskills and threads. Mark isKnowledgeAnswer true when your reply is a factual explanation worth saving to the Archive, and suggest an Archive title.`,
  classifyQuestion: (i) => `Classify the question "${i.question}" as one of open, closed, clarifying, discriminating, counterfactual, motive, timeline, evidence, assumption, information_value, or "statement" if it is not a question. Say whether it is leading.`,
};

export async function runOp<K extends OpName>(op: K, input: Record<string, unknown>): Promise<z.infer<(typeof OPS)[K]["output"]>> {
  const spec = OPS[op];
  const effort: Effort = (input.effort as Effort) ?? spec.effort;
  const prompt = OP_PROMPTS[op](input);
  const schema = spec.output;
  if (schema instanceof z.ZodAny) {
    // generateSalonScenario / generateStrategyScenario: free JSON
    const text = await collect(streamText({ system: STUDY_VOICE, messages: [{ role: "user", content: prompt + "\nReturn JSON only." }], effort }));
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    return JSON.parse(text.slice(start, end + 1));
  }
  return (await completeStructured({ system: STUDY_VOICE, messages: [{ role: "user", content: prompt }], schema, effort })) as z.infer<(typeof OPS)[K]["output"]>;
}

export function streamOp(op: "curatorRespond" | "continueSalonConversation", input: Record<string, unknown>): AsyncGenerator<string> {
  const spec = OPS[op];
  const effort: Effort = (input.effort as Effort) ?? spec.effort;
  const prompt = OP_PROMPTS[op](input) + "\nReply with the message text only.";
  return streamText({ system: STUDY_VOICE, messages: [{ role: "user", content: prompt }], effort });
}

async function collect(gen: AsyncGenerator<string>): Promise<string> {
  let out = "";
  for await (const chunk of gen) out += chunk;
  return out;
}
