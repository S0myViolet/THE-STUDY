import { describe, expect, it } from "vitest";
import { DOMAIN_IDS, type Concept, type CurriculumContent, type KnowledgePath, type Lesson } from "@/lib/v2/content-types";
import type { ConceptMastery, ConceptState, EvidenceKind } from "@/lib/v2/types";
import {
  STATE_RANK,
  blockingGaps,
  buildIndex,
  conceptById,
  curriculum,
  dependentsOf,
  domainProgress,
  goalDomains,
  interestDomains,
  isLearned,
  nextConcepts,
  pathProgress,
  prerequisiteMet,
  prerequisitesOf,
  stateOf,
  topologicalOrder,
  transitiveDependentsOf,
  validateCurriculum,
  type MasteryMap,
} from "@/lib/v2/curriculum";
import { emptyMastery } from "@/lib/v2/mastery";

/* ------------------------------------------------------------------ */
/* Fixture: two domains, six concepts, one acyclic dependency graph      */
/*                                                                      */
/*   a1 ─┬─ a2 ─┬─ a3 ─┐                                                */
/*       │      └─ a4  │                                                */
/*       └─ b1 ────────┴─ b2                                            */
/* ------------------------------------------------------------------ */

function concept(id: string, domainId: "logic" | "history", courseId: string, moduleId: string, dependsOn: string[], extra: Partial<Concept> = {}): Concept {
  return {
    id,
    domainId,
    courseId,
    moduleId,
    title: `Concept ${id}`,
    summary: `What ${id} is and why it matters to the rest of the fixture curriculum.`,
    keyPoints: [`${id} point one`, `${id} point two`, `${id} point three`],
    dependsOn,
    recallPrompts: [
      { prompt: `Define ${id}.`, answer: `${id} definition` },
      { prompt: `Give an example of ${id}.`, answer: `${id} example` },
    ],
    difficulty: 2,
    ...extra,
  };
}

function lesson(id: string, moduleId: string, conceptIds: string[]): Lesson {
  return {
    id,
    moduleId,
    conceptIds,
    title: `Lesson ${id}`,
    promise: "You will be able to use the concept on a fresh problem.",
    minutes: 20,
    difficulty: 2,
    steps: [{ id: `${id}-q`, kind: "question", prompt: "Why?", reveal: "Because." }],
    origin: "seeded",
  };
}

function fixture(): CurriculumContent {
  return {
    domains: [
      { id: "history", title: "History", summary: "The record of what happened.", courses: ["hist-course"], order: 2 },
      { id: "logic", title: "Logic", summary: "What follows from what.", courses: ["logic-course"], order: 1 },
    ],
    courses: [
      { id: "logic-course", domainId: "logic", title: "Logic course", summary: "The logic course.", modules: ["lg-m1", "lg-m2"], level: "basic" },
      { id: "hist-course", domainId: "history", title: "History course", summary: "The history course.", modules: ["hi-m1"], level: "basic" },
    ],
    modules: [
      { id: "lg-m1", courseId: "logic-course", title: "Module one", summary: "a1 and a2.", concepts: ["a1", "a2"], lessons: ["ls-lg-m1-1"] },
      { id: "lg-m2", courseId: "logic-course", title: "Module two", summary: "a3 and a4.", concepts: ["a3", "a4"], lessons: ["ls-lg-m2-1", "ls-lg-m2-2"] },
      { id: "hi-m1", courseId: "hist-course", title: "History module", summary: "b1 and b2.", concepts: ["b1", "b2"], lessons: [] },
    ],
    // Authoring order deliberately differs from hierarchy order to prove the index sorts.
    concepts: [
      concept("b2", "history", "hist-course", "hi-m1", ["b1", "a3"]),
      concept("a4", "logic", "logic-course", "lg-m2", ["a1", "a2"]),
      concept("a1", "logic", "logic-course", "lg-m1", [], { foundational: true, difficulty: 1 }),
      concept("a3", "logic", "logic-course", "lg-m2", ["a2"]),
      concept("b1", "history", "hist-course", "hi-m1", ["a1"]),
      concept("a2", "logic", "logic-course", "lg-m1", ["a1"], { foundational: true }),
    ],
    lessons: [lesson("ls-lg-m1-1", "lg-m1", ["a1", "a2"]), lesson("ls-lg-m2-1", "lg-m2", ["a3"]), lesson("ls-lg-m2-2", "lg-m2", ["a3", "a4"])],
  };
}

const FIXTURE_IDS = ["a1", "a2", "a3", "a4", "b1", "b2"];

/** A mastery row shaped by hand for graph queries; `stateOf` and the gates read only these fields. */
function row(conceptId: string, state: ConceptState, estimate: number, successes: Partial<Record<EvidenceKind, number>> = {}): ConceptMastery {
  const m = emptyMastery("u", conceptId, "2026-01-01T00:00:00.000Z");
  m.state = state;
  m.estimate = estimate;
  m.successes = successes;
  m.counts = Object.fromEntries(Object.entries(successes).map(([k, n]) => [k, n])) as Partial<Record<EvidenceKind, number>>;
  m.evidenceCount = Object.values(successes).reduce((s, n) => s + (n ?? 0), 0);
  return m;
}

function mastery(rows: ConceptMastery[]): MasteryMap {
  return new Map(rows.map((r) => [r.conceptId, r]));
}

const index = buildIndex(fixture());

/* ------------------------------------------------------------------ */

describe("buildIndex", () => {
  it("orders concepts by the hierarchy, not by authoring order", () => {
    expect([...index.concepts.keys()]).toEqual(FIXTURE_IDS);
    expect(index.domains.map((d) => d.id)).toEqual(["logic", "history"]);
  });

  it("indexes lessons by concept and concepts by domain", () => {
    expect(index.lessonsByConcept.get("a3")?.map((l) => l.id)).toEqual(["ls-lg-m2-1", "ls-lg-m2-2"]);
    expect(index.lessonsByConcept.get("a1")?.map((l) => l.id)).toEqual(["ls-lg-m1-1"]);
    expect(index.lessonsByConcept.get("b1")).toBeUndefined();
    expect(index.conceptsByDomain.get("logic")?.map((c) => c.id)).toEqual(["a1", "a2", "a3", "a4"]);
    expect(index.conceptsByDomain.get("history")?.map((c) => c.id)).toEqual(["b1", "b2"]);
    expect(index.courses.get("logic-course")?.modules).toEqual(["lg-m1", "lg-m2"]);
    expect(index.modules.get("hi-m1")?.concepts).toEqual(["b1", "b2"]);
  });

  it("keeps concepts the hierarchy does not reach, after the reachable ones", () => {
    const content = fixture();
    content.concepts.push(concept("orphan", "logic", "logic-course", "lg-m1", []));
    const idx = buildIndex(content);
    expect([...idx.concepts.keys()]).toEqual([...FIXTURE_IDS, "orphan"]);
  });

  it("looks concepts up by id", () => {
    expect(conceptById("a2", index)?.title).toBe("Concept a2");
    expect(conceptById("nope", index)).toBeUndefined();
  });
});

describe("prerequisitesOf and dependentsOf", () => {
  it("returns direct prerequisites in authored order and ignores unknown ids", () => {
    expect(prerequisitesOf("b2", { index })).toEqual(["b1", "a3"]);
    expect(prerequisitesOf("a1", { index })).toEqual([]);
    expect(prerequisitesOf("missing", { index })).toEqual([]);
    const content = fixture();
    content.concepts.find((c) => c.id === "a3")!.dependsOn = ["a2", "not-authored-yet", "a3"];
    expect(prerequisitesOf("a3", { index: buildIndex(content) })).toEqual(["a2"]);
  });

  it("returns transitive prerequisites most-upstream first, without the concept itself", () => {
    expect(prerequisitesOf("b2", { transitive: true, index })).toEqual(["a1", "a2", "a3", "b1"]);
    expect(prerequisitesOf("a4", { transitive: true, index })).toEqual(["a1", "a2"]);
  });

  it("lists direct dependents in curriculum order and transitive dependents in topological order", () => {
    expect(dependentsOf("a1", index)).toEqual(["a2", "a4", "b1"]);
    expect(dependentsOf("a2", index)).toEqual(["a3", "a4"]);
    expect(dependentsOf("b2", index)).toEqual([]);
    expect(transitiveDependentsOf("a1", index)).toEqual(["a2", "a3", "a4", "b1", "b2"]);
    expect(transitiveDependentsOf("a2", index)).toEqual(["a3", "a4", "b2"]);
  });
});

describe("topologicalOrder", () => {
  it("places every prerequisite before its dependents, ties by curriculum order", () => {
    const order = topologicalOrder(undefined, index);
    expect(order).toEqual(["a1", "a2", "a3", "a4", "b1", "b2"]);
    for (const c of index.concepts.values()) for (const d of c.dependsOn) expect(order.indexOf(d)).toBeLessThan(order.indexOf(c.id));
  });

  it("orders a subset while respecting dependencies that run through concepts outside it", () => {
    expect(topologicalOrder(["b2", "a3", "a1"], index)).toEqual(["a1", "a3", "b2"]);
    expect(topologicalOrder(["b2", "a1", "unknown"], index)).toEqual(["a1", "b2"]);
    expect(topologicalOrder([], index)).toEqual([]);
  });

  it("does not throw on a cycle: the cyclic concepts are appended in curriculum order", () => {
    const content = fixture();
    content.concepts.find((c) => c.id === "a2")!.dependsOn = ["a1", "a4"]; // a2 -> a4 -> a2
    const order = topologicalOrder(undefined, buildIndex(content));
    expect(order).toHaveLength(6);
    expect(order.slice(0, 2)).toEqual(["a1", "b1"]);
    expect(new Set(order)).toEqual(new Set(FIXTURE_IDS));
  });
});

describe("validateCurriculum", () => {
  it("accepts the fixture when the skeleton is covered", () => {
    expect(validateCurriculum({ content: fixture(), skeletonConceptIds: FIXTURE_IDS })).toEqual([]);
  });

  it("detects dependency cycles once each, along the closing path", () => {
    const content = fixture();
    content.concepts.find((c) => c.id === "a1")!.dependsOn = ["a3"]; // a1 -> a3 -> a2 -> a1
    const problems = validateCurriculum({ content, skeletonConceptIds: FIXTURE_IDS });
    const cycles = problems.filter((p) => p.startsWith("dependency cycle"));
    expect(cycles).toHaveLength(1);
    expect(cycles[0]).toMatch(/a1 -> a3 -> a2 -> a1|a3 -> a2 -> a1 -> a3|a2 -> a1 -> a3 -> a2/);
  });

  it("reports self-dependencies, unknown references and duplicate ids", () => {
    const content = fixture();
    content.concepts.find((c) => c.id === "a4")!.dependsOn = ["a4", "ghost"];
    content.concepts.find((c) => c.id === "b1")!.related = ["phantom"];
    content.concepts.push(concept("a1", "logic", "logic-course", "lg-m1", []));
    const problems = validateCurriculum({ content, skeletonConceptIds: FIXTURE_IDS });
    expect(problems).toContain("concept a4: depends on itself");
    expect(problems).toContain("concept a4: unknown dependency ghost");
    expect(problems).toContain("concept b1: unknown related concept phantom");
    expect(problems).toContain("duplicate concept id a1");
  });

  it("requires every module to list its lessons and its lessons' concepts, in both directions", () => {
    const content = fixture();
    content.lessons.push(lesson("ls-hi-m1-1", "hi-m1", ["b1", "a1"]));
    const problems = validateCurriculum({ content, skeletonConceptIds: FIXTURE_IDS });
    expect(problems).toContain("lesson ls-hi-m1-1: module hi-m1 does not list it");
    expect(problems).toContain("lesson ls-hi-m1-1: module hi-m1 does not list concept a1");
    const stray = fixture();
    stray.modules.find((m) => m.id === "hi-m1")!.lessons = ["ls-nowhere"];
    expect(validateCurriculum({ content: stray, skeletonConceptIds: FIXTURE_IDS })).toContain("module hi-m1: unknown lesson ls-nowhere");
  });

  it("reports hierarchy disagreements and unauthored skeleton concepts", () => {
    const content = fixture();
    content.concepts.find((c) => c.id === "b2")!.moduleId = "lg-m1";
    const problems = validateCurriculum({ content, skeletonConceptIds: [...FIXTURE_IDS, "c9"] });
    expect(problems).toContain("concept b2: moduleId lg-m1 but listed under hi-m1");
    expect(problems).toContain("concept b2: module lg-m1 belongs to course logic-course, not hist-course");
    expect(problems).toContain("skeleton concepts not authored: c9");
  });

  it("requires at least two recall prompts per concept", () => {
    const content = fixture();
    content.concepts.find((c) => c.id === "a3")!.recallPrompts = [{ prompt: "One?", answer: "one" }];
    expect(validateCurriculum({ content, skeletonConceptIds: FIXTURE_IDS })).toEqual(["concept a3: fewer than two recall prompts"]);
  });
});

describe("state helpers", () => {
  it("reads not_started for missing rows and ranks fragile with retained", () => {
    const m = mastery([row("a1", "understood", 0.6, { checkpoint: 1 })]);
    expect(stateOf(m, "a1")).toBe("understood");
    expect(stateOf(m, "a2")).toBe("not_started");
    expect(STATE_RANK.fragile).toBe(STATE_RANK.retained);
    expect(STATE_RANK.durable).toBeGreaterThan(STATE_RANK.applied);
    expect(isLearned("exposed")).toBe(false);
    expect(isLearned("understood")).toBe(true);
    expect(isLearned("fragile")).toBe(true);
  });

  it("treats a prerequisite as met only with estimate ≥ 0.5 and at least one success", () => {
    expect(prerequisiteMet(undefined)).toBe(false);
    expect(prerequisiteMet(row("a1", "exposed", 0.35))).toBe(false);
    expect(prerequisiteMet(row("a1", "understood", 0.6))).toBe(false); // estimate without a success
    expect(prerequisiteMet(row("a1", "understood", 0.45, { checkpoint: 1 }))).toBe(false); // success without the estimate
    expect(prerequisiteMet(row("a1", "understood", 0.5, { checkpoint: 1 }))).toBe(true);
    expect(prerequisiteMet(row("a1", "practicing", 0.7, { independent: 2 }))).toBe(true);
  });
});

describe("blockingGaps", () => {
  it("lists unmet prerequisites of the targets, most-blocking first, then most upstream", () => {
    const m = mastery([row("a1", "practicing", 0.7, { independent: 2 })]);
    expect(blockingGaps(m, ["a3", "a4", "b2"], index)).toEqual([
      { conceptId: "a2", blocks: ["a3", "a4", "b2"] },
      { conceptId: "a3", blocks: ["b2"] },
      { conceptId: "b1", blocks: ["b2"] },
    ]);
  });

  it("ignores met prerequisites, unknown and duplicate targets, and returns [] when nothing blocks", () => {
    const met = mastery([row("a1", "practicing", 0.7, { independent: 2 }), row("a2", "understood", 0.55, { checkpoint: 1 })]);
    expect(blockingGaps(met, ["a3", "a3", "nope"], index)).toEqual([]);
    const weak = mastery([row("a1", "practicing", 0.7, { independent: 2 }), row("a2", "exposed", 0.42, { recognition: 1 })]);
    expect(blockingGaps(weak, ["a4"], index)).toEqual([{ conceptId: "a2", blocks: ["a4"] }]);
    expect(blockingGaps(new Map(), [], index)).toEqual([]);
  });

  it("does not list the target itself, only what stands before it", () => {
    expect(blockingGaps(new Map(), ["a2"], index)).toEqual([{ conceptId: "a1", blocks: ["a2"] }]);
  });
});

describe("nextConcepts", () => {
  const goals: Parameters<typeof nextConcepts>[1] = { goals: [], interests: [], limit: 10, index };

  it("starts at the roots when nothing is known", () => {
    expect(nextConcepts(new Map(), goals).map((x) => x.conceptId)).toEqual(["a1"]);
  });

  it("only offers concepts whose direct prerequisites are in place (exposure is not enough)", () => {
    const exposedOnly = mastery([row("a1", "exposed", 0.6)]);
    expect(nextConcepts(exposedOnly, goals).map((x) => x.conceptId)).toEqual(["a1"]);
    const a1Done = mastery([row("a1", "practicing", 0.7, { independent: 2 })]);
    expect(nextConcepts(a1Done, goals).map((x) => x.conceptId)).toEqual(["a2", "b1"]);
  });

  it("ranks prefer > foundational > goal domains > interest domains > curriculum order", () => {
    const a1Done = mastery([row("a1", "practicing", 0.7, { independent: 2 })]);
    // a2 is foundational; b1 sits in the goal domain. Foundational wins.
    expect(nextConcepts(a1Done, { ...goals, goals: ["knowledge"] }).map((x) => x.conceptId)).toEqual(["a2", "b1"]);
    // A path preference beats everything.
    expect(nextConcepts(a1Done, { ...goals, goals: ["knowledge"], prefer: ["b1"] }).map((x) => x.conceptId)).toEqual(["b1", "a2"]);
    // With a2 and a1 known: a3, a4 (logic) and b1 (history) are open; goal/interest reorder the non-foundational ones.
    const a2Done = mastery([row("a1", "practicing", 0.7, { independent: 2 }), row("a2", "practicing", 0.7, { independent: 2 })]);
    expect(nextConcepts(a2Done, goals).map((x) => x.conceptId)).toEqual(["a3", "a4", "b1"]);
    expect(nextConcepts(a2Done, { ...goals, goals: ["knowledge"] }).map((x) => x.conceptId)).toEqual(["b1", "a3", "a4"]);
    expect(nextConcepts(a2Done, { ...goals, interests: ["history"] }).map((x) => x.conceptId)).toEqual(["b1", "a3", "a4"]);
    expect(nextConcepts(a2Done, { ...goals, goals: ["reasoning"], interests: ["history"] }).map((x) => x.conceptId)).toEqual(["a3", "a4", "b1"]);
  });

  it("honours exclude and limit", () => {
    const a2Done = mastery([row("a1", "practicing", 0.7, { independent: 2 }), row("a2", "practicing", 0.7, { independent: 2 })]);
    expect(nextConcepts(a2Done, { ...goals, exclude: ["a3"] }).map((x) => x.conceptId)).toEqual(["a4", "b1"]);
    expect(nextConcepts(a2Done, { ...goals, limit: 1 }).map((x) => x.conceptId)).toEqual(["a3"]);
    expect(nextConcepts(a2Done, { ...goals, limit: 0 })).toEqual([]);
  });

  it("explains each suggestion in one line that names the prerequisites in place", () => {
    const a1Done = mastery([row("a1", "practicing", 0.7, { independent: 2 })]);
    const out = nextConcepts(a1Done, { ...goals, goals: ["knowledge"], prefer: ["b1"] });
    expect(out[0]).toEqual({ conceptId: "b1", why: "The next step on the path you are following. Its prerequisite (Concept a1) is in place." });
    expect(out[1]?.why).toBe("Foundational: 3 later concepts depend on it. Its prerequisite (Concept a1) is in place.");
    const root = nextConcepts(new Map(), goals);
    expect(root[0]?.why).toBe("Foundational: 5 later concepts depend on it.");
    const byGoal = nextConcepts(mastery([row("a1", "practicing", 0.7, { independent: 2 }), row("a2", "practicing", 0.7, { independent: 2 })]), { ...goals, goals: ["knowledge"] });
    expect(byGoal[0]?.why).toBe("Serves your goal of knowledge (History). Its prerequisite (Concept a1) is in place.");
    expect(byGoal[2]?.why).toBe("Next in Logic by curriculum order. Its prerequisites (Concept a1 and Concept a2) are in place.");
  });
});

describe("pathProgress and domainProgress", () => {
  const path: KnowledgePath = {
    id: "path-fixture",
    title: "Fixture path",
    question: "How do the pieces fit?",
    summary: "a1, then a2, then b2.",
    steps: [
      { conceptId: "a1", title: "Start", note: "" },
      { conceptId: "a2", title: "Middle", note: "" },
      { conceptId: "b2", title: "End", note: "" },
    ],
    domains: ["logic", "history"],
  };

  it("counts learned steps and points at the first step not yet learned", () => {
    expect(pathProgress(path, new Map())).toEqual({ done: 0, total: 3, nextConceptId: "a1" });
    expect(pathProgress(path, mastery([row("a1", "understood", 0.55, { checkpoint: 1 })]))).toEqual({ done: 1, total: 3, nextConceptId: "a2" });
    expect(pathProgress(path, mastery([row("a1", "exposed", 0.35)]))).toEqual({ done: 0, total: 3, nextConceptId: "a1" });
    // A later step learned out of order still counts; the next step is the first gap.
    expect(pathProgress(path, mastery([row("a1", "durable", 0.9, { delayed: 3 }), row("b2", "fragile", 0.7, { delayed: 1 })]))).toEqual({ done: 2, total: 3, nextConceptId: "a2" });
  });

  it("omits nextConceptId when the path is complete", () => {
    const all = mastery(["a1", "a2", "b2"].map((id) => row(id, "retained", 0.8, { delayed: 1 })));
    expect(pathProgress(path, all)).toEqual({ done: 3, total: 3 });
  });

  it("counts a domain's concepts by state", () => {
    const m = mastery([row("a1", "durable", 0.9, { delayed: 3 }), row("a2", "fragile", 0.7, { delayed: 1 }), row("a3", "exposed", 0.35)]);
    expect(domainProgress("logic", m, index)).toEqual({
      total: 4,
      byState: { not_started: 1, exposed: 1, understood: 0, practicing: 0, retained: 0, applied: 0, durable: 1, fragile: 1 },
    });
    expect(domainProgress("history", m, index).byState.not_started).toBe(2);
    expect(domainProgress("art", m, index).total).toBe(0);
  });
});

describe("goalDomains and interestDomains", () => {
  it("maps every develop goal to its domains", () => {
    expect(goalDomains("knowledge")).toEqual(["history", "geography", "culture", "art", "literature", "science", "politics", "law"]);
    expect(goalDomains("reasoning")).toEqual(["logic", "causal_reasoning", "statistics", "philosophy"]);
    expect(goalDomains("quantitative")).toEqual(["mathematics", "probability", "statistics"]);
    expect(goalDomains("communication")).toEqual(["communication"]);
    expect(goalDomains("strategy")).toEqual(["decision_science", "economics", "business", "finance", "politics"]);
    expect(goalDomains("memory")).toEqual(["psychology"]);
    expect(goalDomains("complete")).toEqual([...DOMAIN_IDS]);
  });

  it("maps every interest to its domains", () => {
    expect(interestDomains("history")).toEqual(["history"]);
    expect(interestDomains("economics")).toEqual(["economics", "finance"]);
    expect(interestDomains("business")).toEqual(["business", "finance"]);
    expect(interestDomains("psychology")).toEqual(["psychology"]);
    expect(interestDomains("science")).toEqual(["science"]);
    expect(interestDomains("ai")).toEqual(["ai", "computer_science"]);
    expect(interestDomains("technology")).toEqual(["computer_science", "ai"]);
    expect(interestDomains("philosophy")).toEqual(["philosophy"]);
    expect(interestDomains("art")).toEqual(["art"]);
    expect(interestDomains("literature")).toEqual(["literature"]);
    expect(interestDomains("geopolitics")).toEqual(["politics", "geography", "history"]);
    expect(interestDomains("other")).toEqual([]);
  });

  it("returns copies, so callers cannot corrupt the mapping", () => {
    goalDomains("memory").push("art");
    expect(goalDomains("memory")).toEqual(["psychology"]);
    interestDomains("art").pop();
    expect(interestDomains("art")).toEqual(["art"]);
  });
});

describe("the real curriculum", () => {
  it("builds one memoised index over every domain", () => {
    const idx = curriculum();
    expect(curriculum()).toBe(idx);
    expect(idx.domains.map((d) => d.id)).toEqual([...DOMAIN_IDS]);
    expect(idx.domains.map((d) => d.order)).toEqual(DOMAIN_IDS.map((_, k) => k + 1));
    for (const c of idx.concepts.values()) expect(idx.conceptsByDomain.get(c.domainId)).toContain(c);
  });

  it("has an acyclic dependency graph over the authored concepts and a complete topological order", () => {
    const idx = curriculum();
    const order = topologicalOrder();
    expect(order).toHaveLength(idx.concepts.size);
    expect(new Set(order)).toEqual(new Set(idx.concepts.keys()));
    for (const c of idx.concepts.values()) for (const d of c.dependsOn) if (idx.concepts.has(d)) expect(order.indexOf(d), `${d} before ${c.id}`).toBeLessThan(order.indexOf(c.id));
    expect(validateCurriculum().filter((p) => p.startsWith("dependency cycle") || p.includes("depends on itself"))).toEqual([]);
  });

  it("offers a frontier from nothing, and every suggestion is a root with a reason", () => {
    const out = nextConcepts(new Map(), { goals: ["complete"], interests: [], limit: 5 });
    expect(out.length).toBeGreaterThan(0);
    for (const s of out) {
      expect(prerequisitesOf(s.conceptId)).toEqual([]);
      expect(s.why.length).toBeGreaterThan(10);
    }
  });
});
