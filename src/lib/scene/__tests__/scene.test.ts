import { describe, expect, it } from "vitest";
import { buildScene, createRng, generateQuestions, listTemplates, mutateScene } from "@/lib/scene";

describe("scene engine", () => {
  it("is deterministic for template + seed", () => {
    for (const t of listTemplates()) {
      const a = buildScene(t.id, 777);
      const b = buildScene(t.id, 777);
      expect(a).toEqual(b);
      expect(a.objects.length).toBeGreaterThanOrEqual(8);
      expect(a.facts.length).toBeGreaterThan(0);
    }
  });
  it("generates valid questions", () => {
    for (const t of listTemplates()) {
      for (const seed of [11, 4021, 9000]) {
        const s = buildScene(t.id, seed);
        const qs = generateQuestions(s, createRng(seed + 1), 6);
        expect(qs.length, `${t.id}:${seed}`).toBeGreaterThanOrEqual(4);
        for (const q of qs) {
          if (q.format === "mcq") expect(q.options?.includes(q.answer), `${t.id} ${q.prompt}`).toBe(true);
          if (q.format === "number") expect(Number.isFinite(Number(q.answer)), q.prompt).toBe(true);
          expect(q.answer.length).toBeGreaterThan(0);
        }
        const kinds = new Set(qs.map((q) => q.kind));
        expect(kinds.size).toBeGreaterThanOrEqual(3);
      }
    }
  });
  it("mutates scenes with distinct visible changes", () => {
    for (const t of listTemplates()) {
      const s = buildScene(t.id, 4021);
      const { sceneB, mutations } = mutateScene(s, 3, 99);
      expect(mutations.length, t.id).toBe(3);
      expect(new Set(mutations.map((m) => m.objectId)).size).toBe(3);
      expect(sceneB.facts.length).toBeGreaterThan(0);
      expect(JSON.stringify(sceneB.objects)).not.toEqual(JSON.stringify(s.objects));
      for (const m of mutations) expect(m.keywords.length).toBeGreaterThan(2);
    }
  });
});
