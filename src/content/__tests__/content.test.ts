import { describe, expect, it } from "vitest";
import * as C from "@/content";
import { SUBSKILL_IDS } from "@/lib/domain/faculties";
import { ERROR_TYPES } from "@/lib/domain/errors";
import { CANONICAL_ARCHIVE_IDS } from "@/content/archive-ids";

const subskills = new Set<string>(SUBSKILL_IDS);
const errorTypes = new Set<string>(ERROR_TYPES);
const archiveIds = new Set(C.ARCHIVE_ENTRIES.map((e) => e.id));
const canonical = new Set<string>(CANONICAL_ARCHIVE_IDS);

function uniqueIds(items: { id: string }[], label: string) {
  const seen = new Set<string>();
  for (const it of items) {
    expect(seen.has(it.id), `${label}: duplicate id ${it.id}`).toBe(false);
    seen.add(it.id);
  }
}

describe("cases", () => {
  it("are complete eleven-stage cases with valid references", () => {
    uniqueIds(C.CASES, "cases");
    for (const c of C.CASES) {
      const kinds = c.stages.map((s) => s.kind);
      expect(kinds, c.id).toEqual(["enter", "notice", "recall", "separate", "hypotheses", "question", "evidence", "update", "decision", "explain", "debrief"]);
      for (const s of c.subskills) expect(subskills.has(s), `${c.id} subskill ${s}`).toBe(true);
      const notice = c.stages[1];
      expect(notice.material, c.id).toBeTruthy();
      const recall = c.stages[2];
      if (notice.material?.kind !== "scene") {
        expect(recall.questions?.length ?? 0, `${c.id} recall`).toBeGreaterThanOrEqual(4);
        for (const q of recall.questions ?? []) {
          expect(subskills.has(q.subskill), `${c.id} ${q.id} subskill`).toBe(true);
          if (q.kind === "mcq") expect(q.options?.includes(q.answer), `${c.id} ${q.id} answer in options`).toBe(true);
        }
      }
      expect(c.stages[3].statements?.length ?? 0, `${c.id} separate`).toBeGreaterThanOrEqual(5);
      expect(c.stages[4].rubric?.plausible.length ?? 0, `${c.id} rubric`).toBeGreaterThanOrEqual(3);
      expect(c.stages[5].questionOptions?.length ?? 0, `${c.id} question options`).toBeGreaterThanOrEqual(3);
      expect(c.stages[6].reveal, `${c.id} reveal`).toBeTruthy();
      expect(c.stages[8].decisionOptions?.length ?? 0, `${c.id} decision`).toBeGreaterThanOrEqual(3);
      for (const d of c.stages[8].decisionOptions ?? []) if (d.errorType) expect(errorTypes.has(d.errorType), `${c.id} errorType ${d.errorType}`).toBe(true);
      expect(c.stages[10].expertReasoning, `${c.id} expert reasoning`).toBeTruthy();
      for (const link of c.conceptLinks) expect(canonical.has(link), `${c.id} conceptLink ${link}`).toBe(true);
    }
  });
});

describe("archive", () => {
  it("entries are complete and connections resolve", () => {
    uniqueIds(C.ARCHIVE_ENTRIES, "archive");
    for (const e of C.ARCHIVE_ENTRIES) {
      expect(e.what.length, e.id).toBeGreaterThan(100);
      expect(e.remember.length, e.id).toBeGreaterThanOrEqual(2);
      if (e.kind === "path") for (const p of e.pathEntries ?? []) expect(archiveIds.has(p), `${e.id} path entry ${p}`).toBe(true);
    }
    for (const c of C.ARCHIVE_CONNECTIONS) {
      expect(canonical.has(c.from), `connection from ${c.from}`).toBe(true);
      expect(canonical.has(c.to), `connection to ${c.to}`).toBe(true);
    }
    for (const e of C.ARCHIVE_ENTRIES) expect(canonical.has(e.id), `archive id ${e.id} is canonical`).toBe(true);
  });
});

describe("strategy", () => {
  it("decision trees are connected", () => {
    uniqueIds(C.STRATEGY_SCENARIOS, "strategy");
    for (const s of C.STRATEGY_SCENARIOS) {
      const ids = new Set(s.nodes.map((n) => n.id));
      expect(ids.has(s.rootNodeId), `${s.id} root`).toBe(true);
      for (const n of s.nodes) {
        if (!n.terminal) expect(n.moves.length, `${s.id}/${n.id} moves`).toBeGreaterThanOrEqual(2);
        for (const m of n.moves) {
          if (m.nextNodeId) expect(ids.has(m.nextNodeId), `${s.id}/${n.id}/${m.id} next`).toBe(true);
          if (m.errorType) expect(errorTypes.has(m.errorType), `${s.id} errorType ${m.errorType}`).toBe(true);
        }
      }
      for (const sub of s.subskills) expect(subskills.has(sub), `${s.id} subskill ${sub}`).toBe(true);
    }
  });
});

describe("salon", () => {
  it("scenarios reference their own hidden facts", () => {
    uniqueIds(C.SALON_SCENARIOS, "salon");
    for (const s of C.SALON_SCENARIOS) {
      const facts = new Set(s.hiddenFacts.map((f) => f.id));
      for (const o of s.objectives) for (const f of o.requiresFacts ?? []) expect(facts.has(f), `${s.id} objective fact ${f}`).toBe(true);
      for (const line of s.script) for (const f of line.reveals ?? []) expect(facts.has(f), `${s.id} script fact ${f}`).toBe(true);
      expect(s.fallbackReplies.length, s.id).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("memory and people", () => {
  it("seeds are consistent", () => {
    uniqueIds(C.MEMORY_SEEDS, "memory");
    uniqueIds(C.PEOPLE, "people");
    for (const m of C.MEMORY_SEEDS) {
      expect(m.prompt.length, m.id).toBeGreaterThan(5);
      expect(m.answer.length, m.id).toBeGreaterThan(0);
      if (m.kind === "person") expect(m.person, m.id).toBeTruthy();
      if (m.kind === "sequence") expect(m.sequence?.length ?? 0, m.id).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("inference and observation", () => {
  it("challenges have valid answers", () => {
    for (const h of C.HOW_SURE) expect(h.options.some((o) => o.id === h.correct), h.id).toBe(true);
    for (const f of C.FAST_SLOW) expect(f.options.some((o) => o.id === f.correct), f.id).toBe(true);
    for (const b of C.BASE_RATE) expect(b.options.filter((o) => o.correct).length, b.id).toBe(1);
    for (const c of C.CAUSAL) expect(c.options.filter((o) => o.correct).length, c.id).toBe(1);
    for (const a of C.ANOMALY) expect(a.anomalyIndex, a.id).toBeLessThan(a.evidence.length);
    for (const b of C.BEST_EXPLANATION) if (b.best) expect(b.hypotheses.some((h) => h.id === b.best), b.id).toBe(true);
    for (const s of C.SIGNAL_EXERCISES) expect(s.details.filter((d) => d.signal).length, s.id).toBe(s.pick);
    for (const d of C.DOCUMENT_EXERCISES) {
      expect(d.questions.length, d.id).toBeGreaterThanOrEqual(4);
      for (const q of d.questions) expect(subskills.has(q.subskill), `${d.id} ${q.id}`).toBe(true);
    }
    for (const k of C.KNOWLEDGE_QUESTIONS) expect(k.answer, k.id).toBeLessThan(k.options.length);
    for (const r of C.RHETORIC_PROMPTS) for (const s of r.subskills) expect(subskills.has(s), `${r.id} ${s}`).toBe(true);
  });
});
