/**
 * THE STUDY V2 — the curriculum graph.
 *
 * DOMAIN → COURSE → MODULE → CONCEPT, with explicit `dependsOn` edges between
 * concepts anywhere in the curriculum. Everything here is pure: the index is
 * built once from `src/content/v2` (memoised) or from a fixture passed by tests,
 * and every query takes a mastery map rather than reading the database.
 *
 * Contract: docs/V2.md §5 "curriculum.ts".
 */
import { CURRICULUM, SKELETON_CONCEPT_IDS } from "@/content/v2";
import { DEVELOP_GOALS, type ConceptMastery, type ConceptState, type DevelopGoal, type InterestId } from "./types";
import { DOMAIN_IDS, type Concept, type Course, type CurriculumContent, type Domain, type DomainId, type KnowledgePath, type Lesson, type Module } from "./content-types";

export type MasteryMap = Map<string, ConceptMastery>;

export interface CurriculumIndex {
  domains: Domain[];
  courses: Map<string, Course>;
  modules: Map<string, Module>;
  concepts: Map<string, Concept>;
  lessons: Map<string, Lesson>;
  lessonsByConcept: Map<string, Lesson[]>;
  conceptsByDomain: Map<DomainId, Concept[]>;
}

/* ------------------------------------------------------------------ */
/* Index                                                                */
/* ------------------------------------------------------------------ */

/**
 * Builds the index for any curriculum content. The real curriculum uses `curriculum()`;
 * tests pass a small fixture. Concepts are ordered by their place in the hierarchy
 * (domain order → course → module → concept); concepts that the hierarchy does not
 * reach keep their authoring order after the reachable ones.
 */
export function buildIndex(content: CurriculumContent): CurriculumIndex {
  const domains = [...content.domains].sort((a, b) => a.order - b.order);
  const courses = new Map(content.courses.map((c) => [c.id, c]));
  const modules = new Map(content.modules.map((m) => [m.id, m]));
  const byId = new Map(content.concepts.map((c) => [c.id, c]));
  const lessons = new Map(content.lessons.map((l) => [l.id, l]));

  // Curriculum order: walk the hierarchy, then append anything it did not reach.
  const ordered: Concept[] = [];
  const seen = new Set<string>();
  for (const d of domains)
    for (const courseId of d.courses)
      for (const moduleId of courses.get(courseId)?.modules ?? [])
        for (const conceptId of modules.get(moduleId)?.concepts ?? []) {
          const c = byId.get(conceptId);
          if (c && !seen.has(c.id)) {
            seen.add(c.id);
            ordered.push(c);
          }
        }
  for (const c of content.concepts)
    if (!seen.has(c.id)) {
      seen.add(c.id);
      ordered.push(c);
    }
  const concepts = new Map(ordered.map((c) => [c.id, c]));

  const lessonsByConcept = new Map<string, Lesson[]>();
  for (const l of content.lessons)
    for (const conceptId of l.conceptIds) {
      const list = lessonsByConcept.get(conceptId);
      if (list) list.push(l);
      else lessonsByConcept.set(conceptId, [l]);
    }

  const conceptsByDomain = new Map<DomainId, Concept[]>();
  for (const d of domains) conceptsByDomain.set(d.id, []);
  for (const c of ordered) {
    const list = conceptsByDomain.get(c.domainId);
    if (list) list.push(c);
    else conceptsByDomain.set(c.domainId, [c]);
  }

  return { domains, courses, modules, concepts, lessons, lessonsByConcept, conceptsByDomain };
}

let memo: CurriculumIndex | undefined;

/** The index over `src/content/v2`, built once. */
export function curriculum(): CurriculumIndex {
  if (!memo) memo = buildIndex(CURRICULUM);
  return memo;
}

/** Derived graph data per index: curriculum position, dependents and the full topological order. */
interface Derived {
  position: Map<string, number>;
  dependents: Map<string, string[]>;
  order: string[];
  /** Ids that take part in a dependency cycle (empty for a valid curriculum). */
  cyclic: Set<string>;
}

const derivedCache = new WeakMap<CurriculumIndex, Derived>();

function derived(index: CurriculumIndex): Derived {
  const hit = derivedCache.get(index);
  if (hit) return hit;

  const position = new Map<string, number>();
  let i = 0;
  for (const id of index.concepts.keys()) position.set(id, i++);

  const dependents = new Map<string, string[]>();
  for (const c of index.concepts.values())
    for (const dep of c.dependsOn) {
      if (!index.concepts.has(dep) || dep === c.id) continue;
      const list = dependents.get(dep);
      if (list) list.push(c.id);
      else dependents.set(dep, [c.id]);
    }
  for (const list of dependents.values()) list.sort((a, b) => position.get(a)! - position.get(b)!);

  // Kahn's algorithm; among ready nodes the earliest in curriculum order goes first,
  // so the result is deterministic and reads like the curriculum wherever dependencies allow.
  const indegree = new Map<string, number>();
  for (const c of index.concepts.values()) indegree.set(c.id, c.dependsOn.filter((d) => index.concepts.has(d) && d !== c.id).length);
  const ready = [...index.concepts.keys()].filter((id) => indegree.get(id) === 0);
  const order: string[] = [];
  const placed = new Set<string>();
  while (ready.length) {
    let best = 0;
    for (let k = 1; k < ready.length; k++) if (position.get(ready[k]!)! < position.get(ready[best]!)!) best = k;
    const [id] = ready.splice(best, 1);
    order.push(id!);
    placed.add(id!);
    for (const next of dependents.get(id!) ?? []) {
      const left = (indegree.get(next) ?? 0) - 1;
      indegree.set(next, left);
      if (left === 0) ready.push(next);
    }
  }
  const cyclic = new Set<string>();
  for (const id of index.concepts.keys())
    if (!placed.has(id)) {
      cyclic.add(id);
      order.push(id);
    }

  const out = { position, dependents, order, cyclic };
  derivedCache.set(index, out);
  return out;
}

/* ------------------------------------------------------------------ */
/* Lookups and graph queries                                            */
/* ------------------------------------------------------------------ */

export function conceptById(id: string, index: CurriculumIndex = curriculum()): Concept | undefined {
  return index.concepts.get(id);
}

/**
 * Prerequisite ids of a concept. Direct prerequisites keep their authored order;
 * transitive prerequisites come back in topological order (most upstream first),
 * without the concept itself. Unknown ids in `dependsOn` are ignored.
 */
export function prerequisitesOf(id: string, opts: { transitive?: boolean; index?: CurriculumIndex } = {}): string[] {
  const index = opts.index ?? curriculum();
  const concept = index.concepts.get(id);
  if (!concept) return [];
  const direct = concept.dependsOn.filter((d, k, arr) => d !== id && index.concepts.has(d) && arr.indexOf(d) === k);
  if (!opts.transitive) return direct;
  const found = new Set<string>();
  const stack = [...direct];
  while (stack.length) {
    const next = stack.pop()!;
    if (next === id || found.has(next)) continue;
    found.add(next);
    for (const d of index.concepts.get(next)?.dependsOn ?? []) if (index.concepts.has(d) && !found.has(d)) stack.push(d);
  }
  const rank = new Map(derived(index).order.map((x, k) => [x, k]));
  return [...found].sort((a, b) => rank.get(a)! - rank.get(b)!);
}

/** Concepts that list `id` as a direct prerequisite, in curriculum order. */
export function dependentsOf(id: string, index: CurriculumIndex = curriculum()): string[] {
  return [...(derived(index).dependents.get(id) ?? [])];
}

/** Every concept downstream of `id` (transitively), in topological order. */
export function transitiveDependentsOf(id: string, index: CurriculumIndex = curriculum()): string[] {
  const { dependents, order } = derived(index);
  const found = new Set<string>();
  const stack = [...(dependents.get(id) ?? [])];
  while (stack.length) {
    const next = stack.pop()!;
    if (next === id || found.has(next)) continue;
    found.add(next);
    for (const d of dependents.get(next) ?? []) if (!found.has(d)) stack.push(d);
  }
  return order.filter((x) => found.has(x));
}

/**
 * A dependency-respecting order over the given ids (or the whole curriculum). Ties
 * follow curriculum order; dependencies that run through concepts outside `ids` are
 * still respected. Concepts caught in a cycle are appended in curriculum order rather
 * than thrown on — `validateCurriculum` is where cycles are reported.
 */
export function topologicalOrder(ids?: string[], index: CurriculumIndex = curriculum()): string[] {
  const { order } = derived(index);
  if (!ids) return [...order];
  const wanted = new Set(ids.filter((id) => index.concepts.has(id)));
  return order.filter((id) => wanted.has(id));
}

/* ------------------------------------------------------------------ */
/* Mastery-aware queries                                                */
/* ------------------------------------------------------------------ */

/** Position of each state on the learning loop; `fragile` sits with `retained` (it is a retained concept in decay). */
export const STATE_RANK: Record<ConceptState, number> = {
  not_started: 0,
  exposed: 1,
  understood: 2,
  practicing: 3,
  retained: 4,
  fragile: 4,
  applied: 5,
  durable: 6,
};

export function stateOf(m: MasteryMap, conceptId: string): ConceptState {
  return m.get(conceptId)?.state ?? "not_started";
}

function successCount(m: ConceptMastery): number {
  let n = 0;
  for (const v of Object.values(m.successes)) n += v ?? 0;
  return n;
}

/**
 * A prerequisite counts as in place when the learner has reached "practicing" on it in
 * evidence terms: an estimate of at least 0.5 and at least one success. A concept with
 * only exposure, or a poor estimate, blocks whatever depends on it.
 */
export function prerequisiteMet(m: ConceptMastery | undefined): boolean {
  if (!m || m.state === "not_started") return false;
  return m.estimate >= 0.5 && successCount(m) > 0;
}

/** A path step is done once the concept has been learned (understood or beyond, including fragile). */
export function isLearned(state: ConceptState): boolean {
  return STATE_RANK[state] >= STATE_RANK.understood;
}

/**
 * Prerequisites (transitive) of `targets` that are not yet in place, each with the
 * targets it blocks. Most-blocking first; ties go to the most upstream concept, so
 * repairing the list top-down never hits a gap whose own prerequisite is still open.
 */
export function blockingGaps(m: MasteryMap, targets: string[], index: CurriculumIndex = curriculum()): { conceptId: string; blocks: string[] }[] {
  const blocks = new Map<string, string[]>();
  const uniqueTargets = targets.filter((t, k, arr) => index.concepts.has(t) && arr.indexOf(t) === k);
  for (const target of uniqueTargets)
    for (const pre of prerequisitesOf(target, { transitive: true, index })) {
      if (prerequisiteMet(m.get(pre))) continue;
      const list = blocks.get(pre);
      if (list) list.push(target);
      else blocks.set(pre, [target]);
    }
  const rank = new Map(derived(index).order.map((x, k) => [x, k]));
  return [...blocks.entries()]
    .map(([conceptId, blocked]) => ({ conceptId, blocks: blocked }))
    .sort((a, b) => b.blocks.length - a.blocks.length || rank.get(a.conceptId)! - rank.get(b.conceptId)!);
}

const GOAL_DOMAINS: Record<DevelopGoal, DomainId[]> = {
  knowledge: ["history", "geography", "culture", "art", "literature", "science", "politics", "law"],
  reasoning: ["logic", "causal_reasoning", "statistics", "philosophy"],
  quantitative: ["mathematics", "probability", "statistics"],
  communication: ["communication"],
  strategy: ["decision_science", "economics", "business", "finance", "politics"],
  memory: ["psychology"],
  complete: [...DOMAIN_IDS],
};

const INTEREST_DOMAINS: Record<InterestId, DomainId[]> = {
  history: ["history"],
  economics: ["economics", "finance"],
  business: ["business", "finance"],
  psychology: ["psychology"],
  science: ["science"],
  ai: ["ai", "computer_science"],
  technology: ["computer_science", "ai"],
  philosophy: ["philosophy"],
  art: ["art"],
  literature: ["literature"],
  geopolitics: ["politics", "geography", "history"],
  other: [],
};

export function goalDomains(goal: DevelopGoal): DomainId[] {
  return [...GOAL_DOMAINS[goal]];
}

export function interestDomains(interest: InterestId): DomainId[] {
  return [...INTEREST_DOMAINS[interest]];
}

function goalLabel(goal: DevelopGoal): string {
  return DEVELOP_GOALS.find((g) => g.id === goal)?.label.toLowerCase() ?? goal;
}

function joinTitles(titles: string[]): string {
  if (titles.length <= 1) return titles.join("");
  return `${titles.slice(0, -1).join(", ")} and ${titles[titles.length - 1]}`;
}

/**
 * The learning frontier: concepts not yet started (or only exposed) whose direct
 * prerequisites are all in place, ranked prefer > foundational > goal domains >
 * interest domains > curriculum order. Each suggestion carries a one-line reason.
 */
export function nextConcepts(
  m: MasteryMap,
  o: { goals: DevelopGoal[]; interests: InterestId[]; limit: number; exclude?: string[]; prefer?: string[]; index?: CurriculumIndex },
): { conceptId: string; why: string }[] {
  const index = o.index ?? curriculum();
  const { position } = derived(index);
  const exclude = new Set(o.exclude ?? []);
  const prefer = new Map((o.prefer ?? []).map((id, k) => [id, k]));
  const goalDomainOf = new Map<DomainId, DevelopGoal>();
  for (const g of o.goals) for (const d of goalDomains(g)) if (!goalDomainOf.has(d)) goalDomainOf.set(d, g);
  const interestDomainSet = new Set<DomainId>();
  for (const i of o.interests) for (const d of interestDomains(i)) interestDomainSet.add(d);

  const candidates: { concept: Concept; key: number[] }[] = [];
  for (const concept of index.concepts.values()) {
    if (exclude.has(concept.id)) continue;
    const state = stateOf(m, concept.id);
    if (state !== "not_started" && state !== "exposed") continue;
    const prerequisites = prerequisitesOf(concept.id, { index });
    if (!prerequisites.every((p) => prerequisiteMet(m.get(p)))) continue;
    const key = [
      prefer.has(concept.id) ? prefer.get(concept.id)! : Number.MAX_SAFE_INTEGER,
      concept.foundational ? 0 : 1,
      goalDomainOf.has(concept.domainId) ? 0 : 1,
      interestDomainSet.has(concept.domainId) ? 0 : 1,
      position.get(concept.id)!,
    ];
    candidates.push({ concept, key });
  }
  candidates.sort((a, b) => {
    for (let k = 0; k < a.key.length; k++) if (a.key[k] !== b.key[k]) return a.key[k]! - b.key[k]!;
    return 0;
  });

  return candidates.slice(0, Math.max(0, o.limit)).map(({ concept }) => {
    const domainTitle = index.domains.find((d) => d.id === concept.domainId)?.title ?? concept.domainId;
    const unlocks = transitiveDependentsOf(concept.id, index).length;
    let why: string;
    if (prefer.has(concept.id)) why = "The next step on the path you are following.";
    else if (concept.foundational) why = unlocks > 0 ? `Foundational: ${unlocks} later ${unlocks === 1 ? "concept depends" : "concepts depend"} on it.` : "Foundational in its domain.";
    else if (goalDomainOf.has(concept.domainId)) why = `Serves your goal of ${goalLabel(goalDomainOf.get(concept.domainId)!)} (${domainTitle}).`;
    else if (interestDomainSet.has(concept.domainId)) why = `In ${domainTitle}, an area you chose.`;
    else why = `Next in ${domainTitle} by curriculum order.`;
    const prerequisites = prerequisitesOf(concept.id, { index });
    if (prerequisites.length) {
      const titles = prerequisites.map((p) => index.concepts.get(p)?.title ?? p);
      why += ` ${titles.length === 1 ? "Its prerequisite" : "Its prerequisites"} (${joinTitles(titles)}) ${titles.length === 1 ? "is" : "are"} in place.`;
    }
    return { conceptId: concept.id, why };
  });
}

/** Progress along a knowledge path: steps whose concept has been learned, and the first that has not. */
export function pathProgress(path: KnowledgePath, m: MasteryMap): { done: number; total: number; nextConceptId?: string } {
  let done = 0;
  let nextConceptId: string | undefined;
  for (const step of path.steps) {
    if (isLearned(stateOf(m, step.conceptId))) done++;
    else if (nextConceptId === undefined) nextConceptId = step.conceptId;
  }
  const out: { done: number; total: number; nextConceptId?: string } = { done, total: path.steps.length };
  if (nextConceptId !== undefined) out.nextConceptId = nextConceptId;
  return out;
}

export function domainProgress(domainId: DomainId, m: MasteryMap, index: CurriculumIndex = curriculum()): { total: number; byState: Record<ConceptState, number> } {
  const byState: Record<ConceptState, number> = { not_started: 0, exposed: 0, understood: 0, practicing: 0, retained: 0, applied: 0, durable: 0, fragile: 0 };
  const concepts = index.conceptsByDomain.get(domainId) ?? [];
  for (const c of concepts) byState[stateOf(m, c.id)]++;
  return { total: concepts.length, byState };
}

/* ------------------------------------------------------------------ */
/* Validation                                                           */
/* ------------------------------------------------------------------ */

function duplicates(ids: string[]): string[] {
  const seen = new Set<string>();
  const out = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) out.add(id);
    seen.add(id);
  }
  return [...out];
}

/**
 * Checks the curriculum content and returns a list of problems ([] when valid):
 * unique ids, every reference resolves (and the hierarchy agrees in both directions),
 * no dependency cycles, every skeleton concept authored, and every module lists its
 * lessons and its lessons' concepts. Defaults to the real curriculum and skeleton;
 * tests pass a fixture and the ids that fixture is expected to cover.
 */
export function validateCurriculum(opts: { content?: CurriculumContent; skeletonConceptIds?: string[] } = {}): string[] {
  const content = opts.content ?? CURRICULUM;
  const skeletonIds = opts.skeletonConceptIds ?? (opts.content ? [] : SKELETON_CONCEPT_IDS);
  const problems: string[] = [];

  for (const id of duplicates(content.domains.map((d) => d.id))) problems.push(`duplicate domain id ${id}`);
  for (const id of duplicates(content.courses.map((c) => c.id))) problems.push(`duplicate course id ${id}`);
  for (const id of duplicates(content.modules.map((m) => m.id))) problems.push(`duplicate module id ${id}`);
  for (const id of duplicates(content.concepts.map((c) => c.id))) problems.push(`duplicate concept id ${id}`);
  for (const id of duplicates(content.lessons.map((l) => l.id))) problems.push(`duplicate lesson id ${id}`);

  const domains = new Map(content.domains.map((d) => [d.id, d]));
  const courses = new Map(content.courses.map((c) => [c.id, c]));
  const modules = new Map(content.modules.map((m) => [m.id, m]));
  const concepts = new Map(content.concepts.map((c) => [c.id, c]));
  const lessons = new Map(content.lessons.map((l) => [l.id, l]));

  for (const d of content.domains)
    for (const courseId of d.courses) {
      const course = courses.get(courseId);
      if (!course) problems.push(`domain ${d.id}: unknown course ${courseId}`);
      else if (course.domainId !== d.id) problems.push(`course ${courseId}: domainId ${course.domainId} but listed under ${d.id}`);
    }
  for (const c of content.courses) {
    const domain = domains.get(c.domainId);
    if (!domain) problems.push(`course ${c.id}: unknown domain ${c.domainId}`);
    else if (!domain.courses.includes(c.id)) problems.push(`course ${c.id}: domain ${c.domainId} does not list it`);
    for (const moduleId of c.modules) {
      const mod = modules.get(moduleId);
      if (!mod) problems.push(`course ${c.id}: unknown module ${moduleId}`);
      else if (mod.courseId !== c.id) problems.push(`module ${moduleId}: courseId ${mod.courseId} but listed under ${c.id}`);
    }
  }
  for (const mod of content.modules) {
    const course = courses.get(mod.courseId);
    if (!course) problems.push(`module ${mod.id}: unknown course ${mod.courseId}`);
    else if (!course.modules.includes(mod.id)) problems.push(`module ${mod.id}: course ${mod.courseId} does not list it`);
    for (const conceptId of mod.concepts) {
      const concept = concepts.get(conceptId);
      if (!concept) problems.push(`module ${mod.id}: unknown concept ${conceptId}`);
      else if (concept.moduleId !== mod.id) problems.push(`concept ${conceptId}: moduleId ${concept.moduleId} but listed under ${mod.id}`);
    }
    for (const lessonId of mod.lessons) {
      const lesson = lessons.get(lessonId);
      if (!lesson) problems.push(`module ${mod.id}: unknown lesson ${lessonId}`);
      else if (lesson.moduleId !== mod.id) problems.push(`lesson ${lessonId}: moduleId ${lesson.moduleId} but listed under ${mod.id}`);
    }
  }
  for (const c of content.concepts) {
    if (!domains.has(c.domainId)) problems.push(`concept ${c.id}: unknown domain ${c.domainId}`);
    const course = courses.get(c.courseId);
    if (!course) problems.push(`concept ${c.id}: unknown course ${c.courseId}`);
    else if (course.domainId !== c.domainId) problems.push(`concept ${c.id}: course ${c.courseId} belongs to ${course.domainId}, not ${c.domainId}`);
    const mod = modules.get(c.moduleId);
    if (!mod) problems.push(`concept ${c.id}: unknown module ${c.moduleId}`);
    else {
      if (mod.courseId !== c.courseId) problems.push(`concept ${c.id}: module ${c.moduleId} belongs to course ${mod.courseId}, not ${c.courseId}`);
      if (!mod.concepts.includes(c.id)) problems.push(`concept ${c.id}: module ${c.moduleId} does not list it`);
    }
    for (const dep of c.dependsOn) {
      if (dep === c.id) problems.push(`concept ${c.id}: depends on itself`);
      else if (!concepts.has(dep)) problems.push(`concept ${c.id}: unknown dependency ${dep}`);
    }
    for (const rel of c.related ?? []) if (!concepts.has(rel)) problems.push(`concept ${c.id}: unknown related concept ${rel}`);
    if (c.recallPrompts.length < 2) problems.push(`concept ${c.id}: fewer than two recall prompts`);
  }
  for (const l of content.lessons) {
    const mod = modules.get(l.moduleId);
    if (!mod) problems.push(`lesson ${l.id}: unknown module ${l.moduleId}`);
    else if (!mod.lessons.includes(l.id)) problems.push(`lesson ${l.id}: module ${l.moduleId} does not list it`);
    if (!l.conceptIds.length) problems.push(`lesson ${l.id}: teaches no concepts`);
    for (const conceptId of l.conceptIds) {
      if (!concepts.has(conceptId)) problems.push(`lesson ${l.id}: unknown concept ${conceptId}`);
      else if (mod && !mod.concepts.includes(conceptId)) problems.push(`lesson ${l.id}: module ${l.moduleId} does not list concept ${conceptId}`);
    }
  }

  // Cycles: report each one once, along the path that closes it.
  const colour = new Map<string, 1 | 2>();
  const reported = new Set<string>();
  const visit = (id: string, path: string[]) => {
    const state = colour.get(id);
    if (state === 2) return;
    if (state === 1) {
      const cycle = [...path.slice(path.indexOf(id)), id];
      const key = [...cycle.slice(0, -1)].sort().join("|");
      if (!reported.has(key)) {
        reported.add(key);
        problems.push(`dependency cycle: ${cycle.join(" -> ")}`);
      }
      return;
    }
    colour.set(id, 1);
    for (const dep of concepts.get(id)?.dependsOn ?? []) if (concepts.has(dep) && dep !== id) visit(dep, [...path, id]);
    colour.set(id, 2);
  };
  for (const c of content.concepts) visit(c.id, []);

  const missing = skeletonIds.filter((id) => !concepts.has(id));
  if (missing.length) problems.push(`skeleton concepts not authored: ${missing.join(", ")}`);

  return problems;
}
