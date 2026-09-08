import { describe, expect, it } from "vitest";
import { CASES } from "@/content/cases";
import { ERROR_CATEGORIES, KNOWLEDGE_RELATIONS, type Concept, type LessonStepKind } from "@/lib/v2/content-types";
import {
  CURRICULUM,
  CURRICULUM_SKELETON,
  EXAM_BLUEPRINTS,
  FIRST_MONTH,
  ITEMS_READING,
  KNOWLEDGE_EDGE_SEEDS,
  KNOWLEDGE_NODE_SEEDS,
  KNOWLEDGE_PATHS,
  MEMORY_TECHNIQUES,
  PASSAGES,
  PRACTICE_ITEMS,
  PROJECT_TEMPLATES,
  QUESTIONING_EXERCISES,
  SKELETON_CONCEPT_IDS,
  SOURCE_SEEDS,
  SPEAKING_PROMPTS,
  STARTER_DOMAINS,
  TRANSFER_CHALLENGES,
  WRITING_PROMPTS,
  conceptNodeSeeds,
} from "@/content/v2";

/**
 * Content integrity for THE STUDY V2. Every id must resolve, every dependency graph must be
 * acyclic, and every authored piece must be complete enough to be used by the engines.
 * Sections are independent so that authors can make their own section pass.
 */

const conceptIds = new Set(CURRICULUM.concepts.map((c) => c.id));
const itemIds = new Set(PRACTICE_ITEMS.map((i) => i.id));
const moduleIds = new Set(CURRICULUM.modules.map((m) => m.id));
const lessonIds = new Set(CURRICULUM.lessons.map((l) => l.id));
const dupes = (xs: string[]) => xs.filter((x, i) => xs.indexOf(x) !== i);
const lorem = /lorem ipsum|TODO|TBD|placeholder/i;

describe("curriculum: skeleton coverage", () => {
  it("authors every skeleton concept exactly once, in the right module", () => {
    const missing = SKELETON_CONCEPT_IDS.filter((id) => !conceptIds.has(id));
    expect(missing, `missing concepts: ${missing.join(", ")}`).toEqual([]);
    expect(dupes(CURRICULUM.concepts.map((c) => c.id))).toEqual([]);
    for (const d of CURRICULUM_SKELETON)
      for (const co of d.courses)
        for (const m of co.modules)
          for (const x of m.concepts) {
            const c = CURRICULUM.concepts.find((y) => y.id === x.id);
            if (!c) continue;
            expect([c.domainId, c.courseId, c.moduleId], x.id).toEqual([d.id, co.id, m.id]);
          }
  });
  it("has no concepts outside the skeleton", () => {
    const extra = CURRICULUM.concepts.filter((c) => !SKELETON_CONCEPT_IDS.includes(c.id)).map((c) => c.id);
    expect(extra).toEqual([]);
  });
});

describe("curriculum: concepts", () => {
  it("are complete and reference real concepts", () => {
    const problems: string[] = [];
    for (const c of CURRICULUM.concepts) {
      if (c.summary.length < 40) problems.push(`${c.id}: summary too short`);
      if (c.keyPoints.length < 3) problems.push(`${c.id}: fewer than 3 key points`);
      if (c.recallPrompts.length < 2) problems.push(`${c.id}: fewer than 2 recall prompts`);
      for (const d of c.dependsOn) if (!conceptIds.has(d)) problems.push(`${c.id}: unknown dependency ${d}`);
      for (const r of c.related ?? []) if (!conceptIds.has(r)) problems.push(`${c.id}: unknown related ${r}`);
      if (c.dependsOn.includes(c.id)) problems.push(`${c.id}: depends on itself`);
      if (lorem.test(c.summary + c.keyPoints.join(" "))) problems.push(`${c.id}: placeholder text`);
    }
    expect(problems).toEqual([]);
  });
  it("has an acyclic dependency graph", () => {
    const map = new Map(CURRICULUM.concepts.map((c) => [c.id, c]));
    const state = new Map<string, 0 | 1 | 2>();
    const cycles: string[] = [];
    const visit = (id: string, path: string[]) => {
      const s = state.get(id);
      if (s === 1) {
        cycles.push([...path, id].join(" -> "));
        return;
      }
      if (s === 2) return;
      state.set(id, 1);
      for (const d of map.get(id)?.dependsOn ?? []) if (map.has(d)) visit(d, [...path, id]);
      state.set(id, 2);
    };
    for (const c of CURRICULUM.concepts) visit(c.id, []);
    expect(cycles).toEqual([]);
  });
  it("connects domains: at least 60 cross-domain dependencies or relations", () => {
    const map = new Map(CURRICULUM.concepts.map((c) => [c.id, c]));
    let cross = 0;
    for (const c of CURRICULUM.concepts) for (const d of [...c.dependsOn, ...(c.related ?? [])]) if (map.get(d) && map.get(d)!.domainId !== c.domainId) cross++;
    expect(cross).toBeGreaterThanOrEqual(60);
  });
});

const STEP_ORDER: LessonStepKind[] = ["question", "intuition", "model", "worked_example", "guided_practice", "independent_practice", "explain_back", "transfer"];

describe("curriculum: lessons", () => {
  it("starter domains each have at least five lessons", () => {
    for (const d of STARTER_DOMAINS) {
      const n = CURRICULUM.lessons.filter((l) => CURRICULUM.modules.find((m) => m.id === l.moduleId && CURRICULUM.courses.find((c) => c.id === m.courseId)?.domainId === d)).length;
      expect(n, `${d} lessons`).toBeGreaterThanOrEqual(5);
    }
  });
  it("follow the nine-step structure and reference real items and concepts", () => {
    const problems: string[] = [];
    expect(dupes(CURRICULUM.lessons.map((l) => l.id))).toEqual([]);
    for (const l of CURRICULUM.lessons) {
      if (!moduleIds.has(l.moduleId)) problems.push(`${l.id}: unknown module ${l.moduleId}`);
      const mod = CURRICULUM.modules.find((m) => m.id === l.moduleId);
      if (mod && !mod.lessons.includes(l.id)) problems.push(`${l.id}: module ${l.moduleId} does not list it`);
      for (const c of l.conceptIds) if (!conceptIds.has(c)) problems.push(`${l.id}: unknown concept ${c}`);
      if (mod) for (const c of l.conceptIds) if (!mod.concepts.includes(c)) problems.push(`${l.id}: concept ${c} is not in module ${l.moduleId}`);
      const kinds = l.steps.map((s) => s.kind);
      let cursor = 0;
      for (const k of STEP_ORDER) {
        const at = kinds.indexOf(k, cursor);
        if (at < 0) problems.push(`${l.id}: missing step ${k}`);
        else cursor = at;
      }
      for (const s of l.steps) {
        if (s.kind === "guided_practice" || s.kind === "independent_practice" || s.kind === "transfer") {
          if (!s.itemIds.length) problems.push(`${l.id}/${s.id}: no items`);
          for (const i of s.itemIds) if (!itemIds.has(i)) problems.push(`${l.id}/${s.id}: unknown item ${i}`);
        }
        if (s.kind === "explain_back" && s.keyPoints.length < 2) problems.push(`${l.id}/${s.id}: explain back needs key points`);
        if ((s.kind === "intuition" || s.kind === "model") && s.body.standard.length < 120) problems.push(`${l.id}/${s.id}: prose too short`);
        if (s.kind === "worked_example" && s.steps.length < 2) problems.push(`${l.id}/${s.id}: worked example needs steps`);
      }
      const ids = l.steps.map((s) => s.id);
      if (dupes(ids).length) problems.push(`${l.id}: duplicate step ids`);
    }
    expect(problems).toEqual([]);
  });
});

describe("practice items", () => {
  it("are unique, complete and consistent with their format", () => {
    const problems: string[] = [];
    expect(dupes(PRACTICE_ITEMS.map((i) => i.id))).toEqual([]);
    for (const it of PRACTICE_ITEMS) {
      if (!it.concepts.length) problems.push(`${it.id}: no concepts`);
      for (const c of it.concepts) if (!conceptIds.has(c)) problems.push(`${it.id}: unknown concept ${c}`);
      if (!it.solution || it.solution.length < 20) problems.push(`${it.id}: solution missing`);
      if (!it.method) problems.push(`${it.id}: method missing`);
      if (!it.hints.length) problems.push(`${it.id}: no hints`);
      if (lorem.test(it.prompt + it.solution)) problems.push(`${it.id}: placeholder`);
      for (const e of it.commonErrors) if (!ERROR_CATEGORIES.includes(e.category)) problems.push(`${it.id}: bad error category ${e.category}`);
      switch (it.format) {
        case "numeric":
          if (typeof it.answer !== "number") problems.push(`${it.id}: numeric answer must be a number`);
          if (it.tolerance === undefined && it.relativeTolerance === undefined) problems.push(`${it.id}: numeric needs a tolerance`);
          break;
        case "mcq":
          if (!it.options || it.options.length < 3) problems.push(`${it.id}: mcq needs ≥3 options`);
          if (typeof it.answer !== "number" || (it.options && (it.answer < 0 || it.answer >= it.options.length))) problems.push(`${it.id}: mcq answer index out of range`);
          break;
        case "multi_select":
          if (!Array.isArray(it.answer) || !it.options) problems.push(`${it.id}: multi_select needs index array`);
          break;
        case "true_false":
          if (it.answer !== "true" && it.answer !== "false") problems.push(`${it.id}: true_false answer`);
          break;
        case "short":
          if (typeof it.answer !== "string" || !it.answer) problems.push(`${it.id}: short answer text`);
          break;
        case "ordering":
          if (!it.options || it.options.length < 3) problems.push(`${it.id}: ordering needs ≥3 options`);
          break;
        case "free":
          if (!(it.keyPoints && it.keyPoints.length >= 2) && !(it.rubric && it.rubric.length)) problems.push(`${it.id}: free item needs keyPoints or rubric`);
          break;
      }
      if (it.passageId && !PASSAGES.find((p) => p.id === it.passageId)) problems.push(`${it.id}: unknown passage`);
    }
    expect(problems).toEqual([]);
  });
  it("meets the seed volumes", () => {
    const by = (skill: string) => PRACTICE_ITEMS.filter((i) => i.skill === skill && !i.examOnly).length;
    expect(by("mathematics") + by("probability"), "math + probability").toBeGreaterThanOrEqual(40);
    expect(by("logic"), "logic").toBeGreaterThanOrEqual(20);
    expect(by("causal_reasoning") + by("statistics"), "causal + statistics").toBeGreaterThanOrEqual(15);
    expect(PRACTICE_ITEMS.filter((i) => i.examEligible || i.examOnly).length, "exam-eligible").toBeGreaterThanOrEqual(60);
    expect(ITEMS_READING.length, "reading items").toBeGreaterThanOrEqual(6);
  });
});

describe("writing, speaking, questioning, memory techniques", () => {
  it("writing prompts cover all seven levels with at least ten prompts", () => {
    expect(WRITING_PROMPTS.length).toBeGreaterThanOrEqual(10);
    for (const lv of [1, 2, 3, 4, 5, 6, 7]) expect(WRITING_PROMPTS.some((w) => w.level === lv), `level ${lv}`).toBe(true);
    for (const w of WRITING_PROMPTS) for (const c of w.concepts ?? []) expect(conceptIds.has(c), `${w.id} concept ${c}`).toBe(true);
    expect(dupes(WRITING_PROMPTS.map((w) => w.id))).toEqual([]);
  });
  it("speaking prompts cover the modes", () => {
    expect(SPEAKING_PROMPTS.length).toBeGreaterThanOrEqual(8);
    for (const m of ["explain_60", "explain_180", "impromptu", "debate", "story", "analogy", "argument", "questioning"]) expect(SPEAKING_PROMPTS.some((s) => s.mode === m), m).toBe(true);
    for (const s of SPEAKING_PROMPTS) expect(s.rubric.length, s.id).toBeGreaterThan(0);
  });
  it("questioning exercises and memory techniques are complete", () => {
    expect(QUESTIONING_EXERCISES.length).toBeGreaterThanOrEqual(8);
    for (const q of QUESTIONING_EXERCISES) {
      for (const c of q.concepts) expect(conceptIds.has(c), `${q.id} concept ${c}`).toBe(true);
      if (q.kind === "one_question" || q.kind === "discriminate") expect(q.options?.length ?? 0, q.id).toBeGreaterThanOrEqual(3);
      if (q.kind === "rewrite_leading") expect(q.leadingQuestion, q.id).toBeTruthy();
    }
    expect(MEMORY_TECHNIQUES.length).toBeGreaterThanOrEqual(5);
    for (const t of MEMORY_TECHNIQUES) expect(t.exercise.items.length, t.id).toBeGreaterThanOrEqual(6);
  });
});

describe("knowledge paths and graph", () => {
  it("paths reference real concepts and cross domains", () => {
    expect(KNOWLEDGE_PATHS.length).toBeGreaterThanOrEqual(12);
    for (const p of KNOWLEDGE_PATHS) {
      expect(p.steps.length, p.id).toBeGreaterThanOrEqual(4);
      for (const s of p.steps) expect(conceptIds.has(s.conceptId), `${p.id} step ${s.conceptId}`).toBe(true);
      const domains = new Set(p.steps.map((s) => CURRICULUM.concepts.find((c) => c.id === s.conceptId)?.domainId));
      expect(domains.size, `${p.id} should span domains`).toBeGreaterThanOrEqual(2);
    }
  });
  it("graph nodes are unique and edges resolve", () => {
    const all = [...conceptNodeSeeds(), ...KNOWLEDGE_NODE_SEEDS];
    const d = dupes(all.map((n) => n.id));
    expect(d, "duplicate node ids").toEqual([]);
    const ids = new Set(all.map((n) => n.id));
    const problems: string[] = [];
    for (const e of KNOWLEDGE_EDGE_SEEDS) {
      if (!ids.has(e.from)) problems.push(`edge from unknown ${e.from}`);
      if (!ids.has(e.to)) problems.push(`edge to unknown ${e.to}`);
      if (!KNOWLEDGE_RELATIONS.includes(e.relation)) problems.push(`bad relation ${e.relation}`);
    }
    expect(problems).toEqual([]);
    expect(KNOWLEDGE_NODE_SEEDS.length, "non-concept nodes").toBeGreaterThanOrEqual(40);
    expect(KNOWLEDGE_EDGE_SEEDS.length, "edges").toBeGreaterThanOrEqual(120);
  });
});

describe("library, projects, exams, passages, first month, transfer", () => {
  it("sources and project templates reference real concepts", () => {
    expect(SOURCE_SEEDS.length).toBeGreaterThanOrEqual(6);
    for (const s of SOURCE_SEEDS) for (const c of s.concepts) expect(conceptIds.has(c), `${s.id} concept ${c}`).toBe(true);
    expect(PROJECT_TEMPLATES.length).toBeGreaterThanOrEqual(8);
    for (const p of PROJECT_TEMPLATES) {
      for (const c of p.requiredConcepts) expect(conceptIds.has(c), `${p.id} concept ${c}`).toBe(true);
      expect(p.milestones.length, p.id).toBeGreaterThanOrEqual(3);
    }
  });
  it("exam blueprints are well formed and fillable from the bank", () => {
    for (const k of ["weekly", "monthly", "quarterly", "baseline"]) expect(EXAM_BLUEPRINTS.some((b) => b.kind === k), k).toBe(true);
    const bank = PRACTICE_ITEMS.filter((i) => i.examEligible || i.examOnly);
    const problems: string[] = [];
    for (const b of EXAM_BLUEPRINTS) {
      const w = b.sections.reduce((s, x) => s + x.weight, 0);
      if (Math.abs(w - 1) > 0.01) problems.push(`${b.id}: weights sum to ${w}`);
      for (const s of b.sections) {
        if (s.writingPromptLevel) {
          if (!WRITING_PROMPTS.some((p) => p.level === s.writingPromptLevel)) problems.push(`${b.id}/${s.id}: no writing prompt at level ${s.writingPromptLevel}`);
          continue;
        }
        if (s.memoryStudy) for (const i of s.memoryStudy.itemIds) if (!itemIds.has(i)) problems.push(`${b.id}/${s.id}: unknown memory item ${i}`);
        const f = s.filter;
        const pool = bank.filter(
          (i) =>
            (!f.skills || f.skills.includes(i.skill)) &&
            (!f.concepts || i.concepts.some((c) => f.concepts!.includes(c))) &&
            (!f.domains || i.concepts.some((c) => f.domains!.includes(CURRICULUM.concepts.find((x) => x.id === c)?.domainId as never))) &&
            (!f.levels || f.levels.includes(i.level)) &&
            (!f.formats || f.formats.includes(i.format)) &&
            (!f.tags || (i.tags ?? []).some((t) => f.tags!.includes(t))) &&
            (f.passage === undefined || !!i.passageId === f.passage) &&
            i.difficulty >= s.band[0] &&
            i.difficulty <= s.band[1],
        );
        if (pool.length < s.itemCount * 2) problems.push(`${b.id}/${s.id}: pool ${pool.length} < 2× ${s.itemCount} (forms must not repeat items)`);
      }
    }
    expect(problems).toEqual([]);
  });
  it("passages, first month and transfer challenges resolve", () => {
    expect(PASSAGES.length).toBeGreaterThanOrEqual(3);
    for (const p of PASSAGES) for (const i of p.itemIds) expect(itemIds.has(i), `${p.id} item ${i}`).toBe(true);
    expect(FIRST_MONTH.length).toBe(4);
    for (const w of FIRST_MONTH) for (const c of w.conceptIds) expect(conceptIds.has(c), `week ${w.week} concept ${c}`).toBe(true);
    expect(TRANSFER_CHALLENGES.length).toBeGreaterThanOrEqual(6);
    for (const t of TRANSFER_CHALLENGES) {
      expect(CASES.some((c) => c.id === t.caseId), `case ${t.caseId}`).toBe(true);
      for (const c of [...t.requiredConcepts, ...t.gate]) expect(conceptIds.has(c), `${t.caseId} concept ${c}`).toBe(true);
    }
  });
});

// Keep the type import used so authors see the shape expected.
export type { Concept };
