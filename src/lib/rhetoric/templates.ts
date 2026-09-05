import type { ArchiveEntry, Interest, RhetoricMode, RhetoricPrompt } from "@/lib/domain/types";
import type { SubskillId } from "@/lib/domain/faculties";
import { ARCHIVE_ENTRIES } from "@/content/archive";
import { wordCount } from "@/lib/scoring/text";
import { MODE_META, defaultConstraints } from "./modes";

/**
 * Deterministic prompt generation. Each mode has at least three templates;
 * the topic comes from an Archive entry, whose facts supply the key points.
 * Used whenever no model is configured, and as the fallback when one fails.
 */

export interface Topic {
  id: string;
  title: string;
  summary: string;
  facts: string[];
  domain: ArchiveEntry["domain"];
  keyPoints: string[];
  tags: string[];
}

const NAME_STOP = new Set(["The", "A", "An", "In", "On", "By", "It", "Its", "This", "That", "These", "Those", "When", "What", "Why", "How", "Both", "Most", "Some", "One", "Two", "Three", "First", "Second", "There", "Their", "They", "His", "Her", "But", "And", "Or", "For", "With", "From", "After", "Before", "Between", "Within", "Under", "Over", "Not", "Nothing", "Everything", "Europe", "European", "Europeans"]);

/** Key points for deterministic coverage: years, proper nouns and tags from the entry itself. */
export function topicKeyPoints(e: ArchiveEntry): string[] {
  const text = [e.summary, ...e.remember].join(" ");
  const years = Array.from(new Set(text.match(/\b(1\d{3}|20\d{2})\b/g) ?? [])).slice(0, 6);
  const sentences = text.split(/(?<=[.!?])\s+/);
  const names = new Set<string>();
  for (const s of sentences) {
    const words = s.split(/\s+/);
    for (let i = 1; i < words.length; i++) {
      const w = words[i].replace(/[^A-Za-zÀ-ÿ'-]/g, "");
      if (w.length > 3 && /^[A-Z]/.test(w) && !NAME_STOP.has(w) && !e.title.includes(w)) names.add(w.toLowerCase());
    }
  }
  const points: string[] = [];
  if (years.length) points.push(years.join("|"));
  for (const n of Array.from(names).slice(0, 3)) points.push(n);
  const tags = e.tags.filter((t) => t !== e.domain && t.length > 3).slice(0, 4);
  if (tags.length) points.push(tags.join("|"));
  return points.slice(0, 5);
}

export function topics(): Topic[] {
  return ARCHIVE_ENTRIES.filter((e) => e.kind !== "path").map((e) => ({
    id: e.id,
    title: e.title,
    summary: e.summary,
    facts: e.remember,
    domain: e.domain,
    keyPoints: topicKeyPoints(e),
    tags: e.tags,
  }));
}

const DOMAIN_SUBSKILL: Record<ArchiveEntry["domain"], SubskillId> = {
  history: "knowledge.history",
  geography: "knowledge.geography",
  economics: "knowledge.economics",
  politics: "knowledge.politics",
  science: "knowledge.science",
  psychology: "knowledge.psychology",
  philosophy: "knowledge.philosophy",
  art: "knowledge.art",
  literature: "knowledge.literature",
  music: "knowledge.music",
  food: "knowledge.food",
  business: "knowledge.business",
  technology: "knowledge.technology",
  law: "knowledge.law",
};

const INTEREST_DOMAINS: Partial<Record<Interest, ArchiveEntry["domain"][]>> = {
  history: ["history"],
  economics: ["economics", "business"],
  psychology: ["psychology"],
  art: ["art"],
  science: ["science"],
  technology: ["technology"],
  business: ["business", "economics"],
  geopolitics: ["politics", "geography", "history"],
  literature: ["literature"],
  architecture: ["art", "geography"],
  food: ["food"],
  travel: ["geography"],
  philosophy: ["philosophy"],
  music: ["music"],
};

const PROFESSIONAL: Record<ArchiveEntry["domain"], string> = {
  history: "a museum curator",
  geography: "a ship's pilot",
  economics: "the owner of a small bakery",
  politics: "a city councillor",
  science: "a working nurse",
  psychology: "a school counsellor",
  philosophy: "a trial lawyer",
  art: "a gallery technician",
  literature: "a secondary-school teacher",
  music: "a piano tuner",
  food: "a restaurant manager",
  business: "a logistics dispatcher",
  technology: "a factory engineer",
  law: "a police sergeant",
};

const LOWERABLE = new Set(["The", "A", "An", "It", "Its", "This", "That", "These", "In", "On", "By", "For", "From", "At", "Most", "Some", "Two", "Three", "Between", "After", "Before", "When", "What", "Why", "How", "Printing", "Money", "Inflation", "Central", "Game", "Double-entry", "Under", "Over", "Within"]);

/** Lower-case the first word only when it is a function word; proper nouns keep their capital. */
function lowerFirst(s: string): string {
  const first = s.split(/\s+/)[0] ?? "";
  if (!LOWERABLE.has(first)) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

const PAD_OPEN = [
  "It is generally agreed by most people who have looked into the matter that",
  "As some of you may already be aware, it is often said that",
  "In essence, and broadly speaking, it would probably be fair to say that",
];
const PAD_JOIN = [
  "It is also worth noting, in this connection, that",
  "Furthermore, and perhaps somewhat importantly,",
  "In addition to this, it is sometimes pointed out that",
  "At the same time, it should probably be mentioned that",
];
const PAD_CLOSE = ["which is, in a sense, a fairly significant point.", "as a number of commentators have observed over the years.", "at least according to most of the available accounts."];

/** A padded passage built from the entry's own facts; the exercise is to cut it back. */
function padded(t: Topic, seed: number): { source: string; target: number } {
  const facts = t.facts.slice(0, 3);
  const pieces = [`${PAD_OPEN[seed % PAD_OPEN.length]} ${lowerFirst(t.summary)}`];
  facts.forEach((f, i) => pieces.push(`${PAD_JOIN[(seed + i) % PAD_JOIN.length]} ${lowerFirst(f.replace(/\.$/, ""))}, ${PAD_CLOSE[(seed + i) % PAD_CLOSE.length]}`));
  const source = pieces.join(" ");
  const original = wordCount(t.summary + " " + facts.join(" "));
  const target = Math.max(40, Math.ceil((original * 0.6) / 5) * 5);
  return { source, target };
}

interface Built {
  title: string;
  prompt: string;
  source?: string;
  constraints?: RhetoricPrompt["constraints"];
  rubric: { criterion: string; weight: number }[];
  keyPoints?: string[];
  difficulty: number;
  extraSubskills?: SubskillId[];
}

type Template = (t: Topic, seed: number) => Built;

const STEELMAN_POINTS = ["would have happened anyway|inevitable|without it|counterfactual|sooner or later", "many causes|other causes|contributing|overdetermined|one of several", "hindsight|remembered because|famous|good story|narrative", "evidence|the record|sources|what we know"];

const TEMPLATES: Record<RhetoricMode, Template[]> = {
  one_sentence: [
    (t) => ({
      title: `${t.title}, in one sentence`,
      prompt: `Explain what ${t.title} was and why it mattered, in one sentence a sharp sixteen-year-old could repeat back. No jargon, no semicolon.`,
      rubric: [
        { criterion: "Accurate: the mechanism, not just the name", weight: 0.35 },
        { criterion: "One sentence that does not cheat with semicolons", weight: 0.25 },
        { criterion: "Clear to a non-specialist", weight: 0.25 },
        { criterion: "Memorable: a shape one could repeat", weight: 0.15 },
      ],
      difficulty: 3,
    }),
    (t) => ({
      title: `Why ${t.title} still matters`,
      prompt: `In one sentence, say why ${t.title} is still worth knowing about today. Not what it was; what it changed. Under thirty words.`,
      constraints: { maxWords: 30, maxSentences: 1 },
      rubric: [
        { criterion: "Says why it mattered, not merely what it was", weight: 0.4 },
        { criterion: "One sentence under thirty words", weight: 0.3 },
        { criterion: "Plain language", weight: 0.3 },
      ],
      difficulty: 4,
    }),
    (t) => ({
      title: `${t.title} for a stranger`,
      prompt: `A stranger on a train has never heard of ${t.title}. One sentence, then the train stops. Make it the sentence they repeat at dinner.`,
      constraints: { maxWords: 28, maxSentences: 1 },
      rubric: [
        { criterion: "Accurate", weight: 0.35 },
        { criterion: "One sentence", weight: 0.25 },
        { criterion: "Memorable and plain", weight: 0.4 },
      ],
      difficulty: 3,
    }),
  ],
  thirty_seconds: [
    (t) => ({
      title: `Why ${t.title} matters, in thirty seconds`,
      prompt: `You have thirty seconds to tell an intelligent friend why ${t.title} matters. Twenty seconds to think. Speak or type; the clock runs either way.`,
      rubric: [
        { criterion: "The facts are right", weight: 0.3 },
        { criterion: "Gives a sense of scale or consequence, not just 'it is important'", weight: 0.3 },
        { criterion: "Fits the time: a clean last sentence", weight: 0.25 },
        { criterion: "No filler or hedging", weight: 0.15 },
      ],
      difficulty: 3,
    }),
    (t) => ({
      title: `${t.title}: the one thing to know`,
      prompt: `In thirty seconds, give the one thing about ${t.title} that most people get wrong or do not know, and why it matters. Twenty seconds to prepare.`,
      rubric: [
        { criterion: "Picks one thing and stays on it", weight: 0.35 },
        { criterion: "Accurate and specific", weight: 0.3 },
        { criterion: "Finishes inside the time with a complete thought", weight: 0.2 },
        { criterion: "No filler", weight: 0.15 },
      ],
      difficulty: 4,
    }),
    (t) => ({
      title: `${t.title}, before the lift arrives`,
      prompt: `Someone asks what ${t.title} was while you wait for a lift. Thirty seconds, no notes, one concrete number or date in it. Twenty seconds to think.`,
      rubric: [
        { criterion: "A concrete anchor: a number, a date, a place", weight: 0.35 },
        { criterion: "Accurate", weight: 0.3 },
        { criterion: "Ends deliberately", weight: 0.2 },
        { criterion: "No filler", weight: 0.15 },
      ],
      difficulty: 3,
    }),
  ],
  three_people: [
    (t) => ({
      title: `${t.title} for three listeners`,
      prompt: `Explain ${t.title} three times: to a ten-year-old, to ${PROFESSIONAL[t.domain]}, and to a sceptic who suspects it is overrated. Two or three sentences each. The content should change, not just the vocabulary.`,
      rubric: [
        { criterion: "Each version is fitted to what that listener knows and cares about", weight: 0.4 },
        { criterion: "All three are accurate; the sceptic's version concedes something real", weight: 0.3 },
        { criterion: "Economy: no version is padded", weight: 0.3 },
      ],
      difficulty: 4,
      extraSubskills: ["social.perspective"],
    }),
    (t) => ({
      title: `Why ${t.title} matters, to three people`,
      prompt: `Say why ${t.title} matters to a curious fourteen-year-old, to ${PROFESSIONAL[t.domain]}, and to a specialist who will notice if you are vague. Each version needs its own example.`,
      rubric: [
        { criterion: "Each version has an example that listener would recognise", weight: 0.4 },
        { criterion: "The core idea survives all three", weight: 0.35 },
        { criterion: "Economy", weight: 0.25 },
      ],
      difficulty: 4,
      extraSubskills: ["social.perspective"],
    }),
    (t) => ({
      title: `${t.title}: child, expert, sceptic`,
      prompt: `Three versions of ${t.title}: one a child could retell, one an expert would not correct, one a sceptic could not wave away. Two sentences each.`,
      constraints: { maxWords: 150, maxSentences: 6 },
      rubric: [
        { criterion: "Fitted to each listener", weight: 0.4 },
        { criterion: "Accurate throughout", weight: 0.3 },
        { criterion: "Two sentences each, no padding", weight: 0.3 },
      ],
      difficulty: 5,
      extraSubskills: ["social.perspective"],
    }),
  ],
  story: [
    (t) => ({
      title: `${t.title}, as a scene`,
      prompt: `Tell one moment from the history of ${t.title} as a scene with a single protagonist: someone whose day it changed. One scene, not a summary, at most 150 words. Keep it true. The facts you may use: ${t.facts.slice(0, 3).join(" ")}`,
      rubric: [
        { criterion: "A scene: one moment, concrete details, a person with something at stake", weight: 0.3 },
        { criterion: "Accurate; nothing invented that contradicts the record", weight: 0.3 },
        { criterion: "An arc, however small", weight: 0.25 },
        { criterion: "Economy", weight: 0.15 },
      ],
      difficulty: 4,
    }),
    (t) => ({
      title: `The day ${t.title} arrived`,
      prompt: `Write the moment someone first encountered ${t.title}: a clerk, a sailor, a customer, a rival. Under 150 words, told from inside the room. The facts: ${t.facts.slice(0, 2).join(" ")}`,
      rubric: [
        { criterion: "Told from inside one moment", weight: 0.35 },
        { criterion: "The reader understands what changed", weight: 0.3 },
        { criterion: "Accurate to the facts given", weight: 0.2 },
        { criterion: "Economy", weight: 0.15 },
      ],
      difficulty: 4,
    }),
    (t) => ({
      title: `${t.title}, from the losing side`,
      prompt: `Tell ${t.title} as a scene from the point of view of someone it cost something: a trade, a habit, a certainty. At most 150 words. Stay true to the record: ${t.facts.slice(0, 2).join(" ")}`,
      rubric: [
        { criterion: "A person with something at stake", weight: 0.35 },
        { criterion: "The mechanism is visible through the story", weight: 0.3 },
        { criterion: "Accurate", weight: 0.2 },
        { criterion: "Economy", weight: 0.15 },
      ],
      difficulty: 5,
    }),
  ],
  anecdote: [
    (t) => ({
      title: `${t.title}, at a dinner table`,
      prompt: `Retell one episode from ${t.title} as a dinner-table anecdote, under 120 words. It needs a turn and a last line that lands. Facts to draw on: ${t.facts.slice(0, 3).join(" ")}`,
      rubric: [
        { criterion: "The turn is clear", weight: 0.35 },
        { criterion: "Accurate on the facts given", weight: 0.3 },
        { criterion: "A last line that lands", weight: 0.2 },
        { criterion: "Under 120 words", weight: 0.15 },
      ],
      difficulty: 3,
    }),
    (t) => ({
      title: `The thing about ${t.title}`,
      prompt: `Someone at dinner mentions ${t.title}. You have one anecdote, under 120 words, that makes the table understand why it mattered. Facts: ${t.facts.slice(0, 2).join(" ")}`,
      rubric: [
        { criterion: "The point survives the telling", weight: 0.35 },
        { criterion: "Accurate", weight: 0.3 },
        { criterion: "Told with a scene rather than a summary", weight: 0.2 },
        { criterion: "Under 120 words", weight: 0.15 },
      ],
      difficulty: 4,
    }),
    (t) => ({
      title: `${t.title}, the short version`,
      prompt: `A colleague asks about ${t.title} in the two minutes before a meeting. One anecdote, under 100 words, one number in it, and a last line they will repeat. Facts: ${t.facts.slice(0, 2).join(" ")}`,
      constraints: { maxWords: 100 },
      rubric: [
        { criterion: "A number or date that does real work", weight: 0.3 },
        { criterion: "A turn and a last line", weight: 0.35 },
        { criterion: "Accurate", weight: 0.2 },
        { criterion: "Under 100 words", weight: 0.15 },
      ],
      difficulty: 3,
    }),
  ],
  analogy: [
    (t) => ({
      title: `An analogy for ${t.title}`,
      prompt: `Give one analogy from a different domain that explains ${t.title}: ${lowerFirst(t.summary)} Map the parts, then say in one sentence where the analogy breaks. An analogy without a stated limit is a slogan.`,
      rubric: [
        { criterion: "The analogue shares the mechanism, not just the mood", weight: 0.4 },
        { criterion: "The breaking point is named honestly", weight: 0.25 },
        { criterion: "Clear enough for a dinner table", weight: 0.35 },
      ],
      difficulty: 4,
      extraSubskills: ["synthesis.cross_domain"],
    }),
    (t) => ({
      title: `What ${t.title} is like`,
      prompt: `Complete the sentence "${t.title} is like..." with something from everyday life, then explain the mapping in three or four sentences and say where it stops working.`,
      rubric: [
        { criterion: "The parts map", weight: 0.4 },
        { criterion: "The limit is specific to this pairing", weight: 0.25 },
        { criterion: "Economy and clarity", weight: 0.35 },
      ],
      difficulty: 4,
      extraSubskills: ["synthesis.cross_domain"],
    }),
    (t) => ({
      title: `${t.title}, explained through a kitchen`,
      prompt: `Explain ${t.title} using only things found in a kitchen or a household. Map at least three parts. Then name the point at which the household version misleads.`,
      rubric: [
        { criterion: "Three parts mapped", weight: 0.4 },
        { criterion: "The point where it misleads is named", weight: 0.3 },
        { criterion: "Clarity", weight: 0.3 },
      ],
      difficulty: 5,
      extraSubskills: ["synthesis.cross_domain"],
    }),
  ],
  argument: [
    (t) => ({
      title: `${t.title} is under-rated`,
      prompt: `Argue, in under 200 words, that ${t.title} matters more than most people think. Structure: a claim, two reasons each with a piece of evidence, one objection you take seriously and answer. You may believe the opposite; argue this side anyway.`,
      rubric: [
        { criterion: "Structure is visible: claim, reasons, objection, answer", weight: 0.3 },
        { criterion: "Each reason carries real evidence", weight: 0.3 },
        { criterion: "The objection is the strongest available and is answered", weight: 0.25 },
        { criterion: "A reader can restate it in one breath", weight: 0.15 },
      ],
      difficulty: 5,
    }),
    (t) => ({
      title: `${t.title} was not inevitable`,
      prompt: `Argue in under 200 words that ${t.title} could easily have gone otherwise. Claim, two reasons with evidence, the strongest objection (that it was bound to happen), and your answer to it.`,
      rubric: [
        { criterion: "Claim, reasons, objection, answer", weight: 0.3 },
        { criterion: "Evidence, not assertion", weight: 0.3 },
        { criterion: "The inevitability objection is answered, not dodged", weight: 0.25 },
        { criterion: "Clarity", weight: 0.15 },
      ],
      difficulty: 5,
      extraSubskills: ["inference.alternatives"],
    }),
    (t) => ({
      title: `Teach ${t.title} first`,
      prompt: `A school can add one topic to its curriculum. Argue in under 180 words that it should be ${t.title}. Claim, two reasons with evidence, one serious objection answered.`,
      constraints: { maxWords: 180 },
      rubric: [
        { criterion: "Structure", weight: 0.3 },
        { criterion: "Evidence", weight: 0.3 },
        { criterion: "Objection answered", weight: 0.25 },
        { criterion: "Clarity", weight: 0.15 },
      ],
      difficulty: 4,
    }),
  ],
  steelman: [
    (t) => ({
      title: `Steelman: ${t.title} is overrated`,
      prompt: `Below is a weak version of the argument that ${t.title} is overrated. Rewrite it as the strongest version: the one a historian of the subject could not wave away. Under 180 words. Do not argue the other side.`,
      source: `Everyone goes on about ${t.title}. Honestly it is overrated. People only talk about it because it is famous and makes a good story. It changed nothing that would not have happened anyway, and the so-called experts just like having something to write books about.`,
      rubric: [
        { criterion: "Charitable: drops the sneers, keeps the strongest claims", weight: 0.3 },
        { criterion: "Adds the best arguments the original missed (counterfactuals, other causes, hindsight)", weight: 0.35 },
        { criterion: "A defender would recognise it as fair", weight: 0.2 },
        { criterion: "Clear and under length", weight: 0.15 },
      ],
      keyPoints: STEELMAN_POINTS,
      difficulty: 5,
      extraSubskills: ["social.perspective", "inference.alternatives"],
    }),
    (t) => ({
      title: `Steelman: stop teaching ${t.title}`,
      prompt: `Below is a weak case for dropping ${t.title} from what educated people are expected to know. Write the strongest version of it, under 180 words, without arguing against it.`,
      source: `Nobody needs to know about ${t.title} any more. It is old news and has nothing to do with real life. Schools only keep it because teachers are stuck in the past. Kids should learn useful things instead of memorising dates about ${t.title}.`,
      rubric: [
        { criterion: "Charitable", weight: 0.3 },
        { criterion: "Adds real arguments: opportunity cost, transfer, what actually gets retained", weight: 0.35 },
        { criterion: "Fair enough that a defender would sign it", weight: 0.2 },
        { criterion: "Clear and under length", weight: 0.15 },
      ],
      keyPoints: ["opportunity cost|time|instead|crowds out", "transfer|apply|use it|relevant", "retain|remember|forget|retention", "priorities|what matters|useful"],
      difficulty: 5,
      extraSubskills: ["social.perspective", "inference.alternatives"],
    }),
    (t) => ({
      title: `Steelman: ${t.title} was mostly luck`,
      prompt: `Below is a lazy version of the claim that ${t.title} owed more to luck than to design. Rewrite it as the strongest version, under 180 words. Name the contingencies a careful historian would name.`,
      source: `${t.title} was just luck. Right place, right time. Anyone could have done it. People who say it was clever are just impressed by success. If things had been slightly different nobody would remember it at all.`,
      rubric: [
        { criterion: "Charitable", weight: 0.3 },
        { criterion: "Names real contingencies rather than 'right place, right time'", weight: 0.35 },
        { criterion: "Fair", weight: 0.2 },
        { criterion: "Clear and under length", weight: 0.15 },
      ],
      keyPoints: ["contingent|contingency|chance|accident|timing", "survivorship|selection|the ones we remember|failures", "conditions|circumstances|context|rivals", ...t.keyPoints.slice(0, 1)],
      difficulty: 5,
      extraSubskills: ["social.perspective", "inference.alternatives"],
    }),
  ],
  precision: [
    (t, seed) => {
      const p = padded(t, seed);
      return {
        title: `Tighten: ${t.title}`,
        prompt: `Cut the passage below to ${p.target} words or fewer without losing a single fact. Every date, place and number must survive. Every hedge that adds nothing must go.`,
        source: p.source,
        constraints: { maxWords: p.target },
        rubric: [
          { criterion: "Every fact survives", weight: 0.4 },
          { criterion: `${p.target} words or fewer`, weight: 0.3 },
          { criterion: "Reads as prose, not a list of fragments", weight: 0.3 },
        ],
        difficulty: 3,
      };
    },
    (t, seed) => {
      const p = padded(t, seed + 1);
      return {
        title: `Tighten for a busy reader: ${t.title}`,
        prompt: `Rewrite the passage below in ${p.target} words or fewer so that a busy reader knows what ${t.title} was and why it mattered. Keep every fact. Lose every apology.`,
        source: p.source,
        constraints: { maxWords: p.target },
        rubric: [
          { criterion: "All facts survive", weight: 0.4 },
          { criterion: `${p.target} words or fewer`, weight: 0.3 },
          { criterion: "The point comes first", weight: 0.3 },
        ],
        difficulty: 3,
      };
    },
    (t, seed) => {
      const p = padded(t, seed + 2);
      const target = Math.max(30, p.target - 15);
      return {
        title: `Tighten, hard: ${t.title}`,
        prompt: `The passage below is padded. Cut it to ${target} words or fewer. Nothing that carries information may go; everything else must.`,
        source: p.source,
        constraints: { maxWords: target },
        rubric: [
          { criterion: "Every fact survives", weight: 0.45 },
          { criterion: `${target} words or fewer`, weight: 0.35 },
          { criterion: "Reads as prose", weight: 0.2 },
        ],
        difficulty: 4,
      };
    },
  ],
  question: [
    (t) => ({
      title: `One question about ${t.title}`,
      prompt: `You have five minutes with someone who has spent a career on ${t.title}. Write the single best question you would ask, and one sentence on why it is worth their time. Open, not leading, and not something a search engine could answer.`,
      constraints: { maxWords: 80, maxSentences: 4 },
      rubric: [
        { criterion: "Information value: the answer could change what you think", weight: 0.4 },
        { criterion: "Open and non-leading", weight: 0.25 },
        { criterion: "Aims at what only they could tell you", weight: 0.2 },
        { criterion: "Brief enough to ask aloud", weight: 0.15 },
      ],
      keyPoints: ["what|how|why", "surprised|changed your mind|wrong about|misunderstand|puzzles", "evidence|how do you know|what would|convince", ...t.keyPoints.slice(0, 1)],
      difficulty: 4,
      extraSubskills: ["social.question_quality", "curiosity.questioning"],
    }),
    (t) => ({
      title: `Three questions on ${t.title}`,
      prompt: `Twenty minutes with the leading specialist on ${t.title}. Write three questions, in order, with one sentence each on why. Build context before the hardest one.`,
      constraints: { maxWords: 150, maxSentences: 9 },
      rubric: [
        { criterion: "Each question could produce an answer that changes what you think", weight: 0.4 },
        { criterion: "Open, non-leading", weight: 0.25 },
        { criterion: "The order makes sense", weight: 0.2 },
        { criterion: "Brevity", weight: 0.15 },
      ],
      keyPoints: ["what|how|why", "surprised|changed your mind|wrong about|misunderstand", "evidence|sources|how do you know", "disagree|debate|contested|argue"],
      difficulty: 4,
      extraSubskills: ["social.question_quality", "curiosity.questioning"],
    }),
    (t) => ({
      title: `The question a sceptic would ask about ${t.title}`,
      prompt: `You doubt the standard account of ${t.title}. Write the one question that would most efficiently test it, and say what answer would change your mind. Under 70 words.`,
      constraints: { maxWords: 70, maxSentences: 4 },
      rubric: [
        { criterion: "The question discriminates between accounts", weight: 0.4 },
        { criterion: "States what answer would change your mind", weight: 0.3 },
        { criterion: "Open, not leading", weight: 0.3 },
      ],
      keyPoints: ["what|how|why|which", "change my mind|would convince|evidence|expect to see", "if|unless|otherwise|instead"],
      difficulty: 5,
      extraSubskills: ["social.question_quality", "inference.disconfirmation"],
    }),
  ],
  impromptu: [
    (t) => ({
      title: `Impromptu: was ${t.title} inevitable?`,
      prompt: `Was ${t.title} bound to happen, or could it easily have gone otherwise? Twenty seconds to think, sixty to speak. Take a side, give two reasons, name the strongest objection, and finish on time.`,
      rubric: [
        { criterion: "A clear position stated early and held", weight: 0.3 },
        { criterion: "Structure a listener can follow", weight: 0.3 },
        { criterion: "At least one concrete example or mechanism", weight: 0.25 },
        { criterion: "Composure: minimal filler, ends deliberately", weight: 0.15 },
      ],
      difficulty: 4,
    }),
    (t) => ({
      title: `Impromptu: should everyone know about ${t.title}?`,
      prompt: `Should ${t.title} be something every educated person knows? Twenty seconds to think, sixty to speak. A position, two reasons, the strongest objection, a deliberate close.`,
      rubric: [
        { criterion: "Commits to a position", weight: 0.3 },
        { criterion: "Structure", weight: 0.3 },
        { criterion: "An example that does real work", weight: 0.25 },
        { criterion: "Composure and timing", weight: 0.15 },
      ],
      difficulty: 3,
    }),
    (t) => ({
      title: `Impromptu: ${t.title}, overrated or underrated?`,
      prompt: `Is ${t.title} overrated or underrated? 'Both' is allowed only if you say by whom, and then commit. Twenty seconds to think, sixty to speak.`,
      rubric: [
        { criterion: "Commits, or names a precise condition and then commits", weight: 0.3 },
        { criterion: "Structure", weight: 0.3 },
        { criterion: "A concrete example", weight: 0.25 },
        { criterion: "Composure and timing", weight: 0.15 },
      ],
      difficulty: 4,
    }),
  ],
};

/* ------------------------------------------------------------------ */
/* Building a prompt                                                     */
/* ------------------------------------------------------------------ */

export interface BuildOptions {
  /** Any integer; varies topic and template. Defaults to the clock. */
  seed?: number;
  interests?: Interest[];
  /** Topic ids already used recently (prefer others). */
  avoidTopics?: string[];
}

function pickTopic(all: Topic[], seed: number, interests: Interest[] = [], avoid: string[] = []): Topic {
  const wanted = new Set(interests.flatMap((i) => INTEREST_DOMAINS[i] ?? []));
  let pool = all.filter((t) => !avoid.includes(t.id));
  if (!pool.length) pool = all;
  if (wanted.size) {
    const preferred = pool.filter((t) => wanted.has(t.domain));
    // Mostly follow interests, but not always: breadth is the point.
    if (preferred.length && seed % 4 !== 0) pool = preferred;
  }
  return pool[seed % pool.length];
}

/** Build a complete RhetoricPrompt from the template bank. Never fails and never needs a model. */
export function buildTemplatePrompt(mode: RhetoricMode, opts: BuildOptions = {}): RhetoricPrompt {
  const seed = Math.abs(Math.floor(opts.seed ?? Date.now() / 1000));
  const all = topics();
  const topic = pickTopic(all, seed, opts.interests, opts.avoidTopics);
  const bank = TEMPLATES[mode];
  const tpl = bank[Math.floor(seed / 7) % bank.length];
  const built = tpl(topic, seed);
  const meta = MODE_META[mode];
  const subskills = Array.from(new Set<SubskillId>([meta.subskill, ...(built.extraSubskills ?? []), DOMAIN_SUBSKILL[topic.domain]])).slice(0, 3);
  const keyPoints = built.keyPoints ?? topic.keyPoints;
  return {
    id: `rh-gen-${mode.replace(/_/g, "-")}-${topic.id}-${seed.toString(36)}`,
    mode,
    title: built.title,
    prompt: built.prompt,
    source: built.source,
    constraints: { ...defaultConstraints(mode), ...(built.constraints ?? {}) },
    rubric: built.rubric,
    keyPoints: keyPoints.length ? keyPoints : undefined,
    difficulty: Math.max(1, Math.min(8, built.difficulty)) as RhetoricPrompt["difficulty"],
    subskills,
    origin: "generated",
  };
}

export function templateCount(mode: RhetoricMode): number {
  return TEMPLATES[mode].length;
}
