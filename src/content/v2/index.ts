/**
 * THE STUDY V2 content index. Everything authored under src/content/v2 is aggregated here.
 */
import type { Concept, CurriculumContent, KnowledgeNodeSeed, Lesson, PracticeItem } from "@/lib/v2/content-types";
import type { DomainContent } from "./curriculum/_helpers";
import { MATHEMATICS } from "./curriculum/mathematics";
import { PROBABILITY } from "./curriculum/probability";
import { STATISTICS } from "./curriculum/statistics";
import { LOGIC } from "./curriculum/logic";
import { CAUSAL_REASONING } from "./curriculum/causal_reasoning";
import { DECISION_SCIENCE } from "./curriculum/decision_science";
import { ECONOMICS } from "./curriculum/economics";
import { HISTORY } from "./curriculum/history";
import { GEOGRAPHY } from "./curriculum/geography";
import { PSYCHOLOGY } from "./curriculum/psychology";
import { PHILOSOPHY } from "./curriculum/philosophy";
import { SCIENCE } from "./curriculum/science";
import { COMPUTER_SCIENCE } from "./curriculum/computer_science";
import { AI } from "./curriculum/ai";
import { BUSINESS } from "./curriculum/business";
import { FINANCE } from "./curriculum/finance";
import { POLITICS } from "./curriculum/politics";
import { LAW } from "./curriculum/law";
import { ART } from "./curriculum/art";
import { LITERATURE } from "./curriculum/literature";
import { CULTURE } from "./curriculum/culture";
import { COMMUNICATION } from "./curriculum/communication";
import { ITEMS_MATHEMATICS } from "./items/mathematics";
import { ITEMS_PROBABILITY } from "./items/probability";
import { ITEMS_STATISTICS } from "./items/statistics";
import { ITEMS_LOGIC } from "./items/logic";
import { ITEMS_CAUSAL_REASONING } from "./items/causal_reasoning";
import { ITEMS_DECISION_SCIENCE } from "./items/decision_science";
import { ITEMS_ECONOMICS } from "./items/economics";
import { ITEMS_HISTORY } from "./items/history";
import { ITEMS_GEOGRAPHY } from "./items/geography";
import { ITEMS_PSYCHOLOGY } from "./items/psychology";
import { ITEMS_PHILOSOPHY } from "./items/philosophy";
import { ITEMS_SCIENCE } from "./items/science";
import { ITEMS_COMPUTER_SCIENCE } from "./items/computer_science";
import { ITEMS_AI } from "./items/ai";
import { ITEMS_BUSINESS } from "./items/business";
import { ITEMS_FINANCE } from "./items/finance";
import { ITEMS_POLITICS } from "./items/politics";
import { ITEMS_LAW } from "./items/law";
import { ITEMS_ART } from "./items/art";
import { ITEMS_LITERATURE } from "./items/literature";
import { ITEMS_CULTURE } from "./items/culture";
import { ITEMS_COMMUNICATION } from "./items/communication";
export { PASSAGES, ITEMS_READING } from "./passages";
export { WRITING_PROMPTS } from "./writing";
export { SPEAKING_PROMPTS } from "./speaking";
export { QUESTIONING_EXERCISES } from "./questioning";
export { MEMORY_TECHNIQUES } from "./memory-techniques";
export { KNOWLEDGE_PATHS } from "./paths";
export { KNOWLEDGE_NODE_SEEDS, KNOWLEDGE_EDGE_SEEDS } from "./knowledge";
export { SOURCE_SEEDS } from "./library";
export { PROJECT_TEMPLATES } from "./projects";
export { EXAM_BLUEPRINTS } from "./exams";
export { FIRST_MONTH } from "./first-month";
export { TRANSFER_CHALLENGES } from "./transfer";
export { CURRICULUM_SKELETON, SKELETON_CONCEPT_IDS, STARTER_DOMAINS, skeletonConcept } from "./skeleton";
import { ITEMS_READING } from "./passages";

export const DOMAIN_CONTENT: DomainContent[] = [MATHEMATICS, PROBABILITY, STATISTICS, LOGIC, CAUSAL_REASONING, DECISION_SCIENCE, ECONOMICS, HISTORY, GEOGRAPHY, PSYCHOLOGY, PHILOSOPHY, SCIENCE, COMPUTER_SCIENCE, AI, BUSINESS, FINANCE, POLITICS, LAW, ART, LITERATURE, CULTURE, COMMUNICATION];

export const CURRICULUM: CurriculumContent = {
  domains: DOMAIN_CONTENT.map((d) => d.domain).sort((a, b) => a.order - b.order),
  courses: DOMAIN_CONTENT.flatMap((d) => d.courses),
  modules: DOMAIN_CONTENT.flatMap((d) => d.modules),
  concepts: DOMAIN_CONTENT.flatMap((d) => d.concepts),
  lessons: DOMAIN_CONTENT.flatMap((d) => d.lessons),
};

/** Every seeded practice item (Train, lessons and exams draw from this bank). */
export const PRACTICE_ITEMS: PracticeItem[] = [...ITEMS_MATHEMATICS, ...ITEMS_PROBABILITY, ...ITEMS_STATISTICS, ...ITEMS_LOGIC, ...ITEMS_CAUSAL_REASONING, ...ITEMS_DECISION_SCIENCE, ...ITEMS_ECONOMICS, ...ITEMS_HISTORY, ...ITEMS_GEOGRAPHY, ...ITEMS_PSYCHOLOGY, ...ITEMS_PHILOSOPHY, ...ITEMS_SCIENCE, ...ITEMS_COMPUTER_SCIENCE, ...ITEMS_AI, ...ITEMS_BUSINESS, ...ITEMS_FINANCE, ...ITEMS_POLITICS, ...ITEMS_LAW, ...ITEMS_ART, ...ITEMS_LITERATURE, ...ITEMS_CULTURE, ...ITEMS_COMMUNICATION, ...ITEMS_READING];

const conceptIndex = new Map<string, Concept>(CURRICULUM.concepts.map((c) => [c.id, c]));
const lessonIndex = new Map<string, Lesson>(CURRICULUM.lessons.map((l) => [l.id, l]));
const itemIndex = new Map<string, PracticeItem>(PRACTICE_ITEMS.map((i) => [i.id, i]));

export function conceptContent(id: string): Concept | undefined {
  return conceptIndex.get(id);
}
export function lessonContent(id: string): Lesson | undefined {
  return lessonIndex.get(id);
}
export function practiceItem(id: string): PracticeItem | undefined {
  return itemIndex.get(id);
}

/** Concept nodes for the knowledge graph, derived from the curriculum. */
export function conceptNodeSeeds(): KnowledgeNodeSeed[] {
  return CURRICULUM.concepts.map((c) => ({ id: c.id, kind: "concept", title: c.title, domainId: c.domainId, summary: c.summary, conceptId: c.id, tags: c.tags }));
}
