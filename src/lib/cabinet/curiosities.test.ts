import { describe, expect, it } from "vitest";
import { CURIOSITIES, ARCHIVE_ENTRIES } from "@/content";
import type { CuriosityView } from "@/lib/domain/types";
import { coerceCuriosity, dailyPick, drawers, firstSentence, hookAsQuestion, leastRecentlySeen, mergeCuriosities, neighbours, paragraphs, randomUnseen, viewMap, whyScore } from "./curiosities";

function view(curiosityId: string, createdAt: string, updatedAt = createdAt, connectedTo: string[] = []): CuriosityView {
  return { id: `v-${curiosityId}`, userId: "u", createdAt, updatedAt, curiosityId, connectedTo };
}

describe("content", () => {
  it("every seeded curiosity connects to known archive ids and has paragraphs", () => {
    const known = new Set(ARCHIVE_ENTRIES.map((e) => e.id));
    for (const c of CURIOSITIES) {
      expect(c.connects.length).toBeGreaterThan(0);
      for (const id of c.connects) expect(known.has(id), `${c.id} → ${id}`).toBe(true);
      expect(paragraphs(c.body).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("first sentences are whole sentences of a sensible length", () => {
    for (const c of CURIOSITIES) {
      const s = firstSentence(c.body);
      expect(s.length).toBeGreaterThan(40);
      expect(s.length).toBeLessThan(400);
      expect(/[.!?]["”’)]?$/.test(s), `${c.id}: ${s}`).toBe(true);
    }
  });

  it("does not split on abbreviations", () => {
    expect(firstSentence("The Hereford map of c. 1300 is the largest survivor. It hangs in the cathedral.")).toBe("The Hereford map of c. 1300 is the largest survivor.");
    expect(firstSentence('The committee answered with a single word, "no." Then it adjourned for the summer.')).toBe('The committee answered with a single word, "no."');
    // A very short opening is joined to the sentence that follows.
    expect(firstSentence("In 1900. France had a few thousand motor cars and the brothers made tyres for them.")).toBe("In 1900. France had a few thousand motor cars and the brothers made tyres for them.");
  });

  it("turns a hook into a recall prompt", () => {
    expect(hookAsQuestion("The Michelin stars exist because two brothers needed the French to drive more.")).toBe("The Michelin stars exist because two brothers needed the French to drive more. How so?");
    expect(hookAsQuestion("Why is the sea salty?")).toBe("Why is the sea salty?");
  });
});

describe("picks", () => {
  const items = CURIOSITIES;
  it("daily pick is deterministic for a date and prefers items not seen before today", () => {
    const a = dailyPick(items, new Map(), "2026-09-05");
    const b = dailyPick(items, new Map(), "2026-09-05");
    expect(a?.id).toBe(b?.id);
    // seen yesterday → excluded; seen today → still eligible, so the pick is stable across the day
    const yesterday = viewMap([view(a!.id, "2026-09-04T10:00:00.000Z")]);
    expect(dailyPick(items, yesterday, "2026-09-05")?.id).not.toBe(a!.id);
    const today = viewMap([view(a!.id, new Date(2026, 8, 5, 9).toISOString())]);
    expect(dailyPick(items, today, "2026-09-05")?.id).toBe(a!.id);
  });

  it("falls back to everything once all have been seen", () => {
    const all = viewMap(items.map((c) => view(c.id, "2020-01-01T00:00:00.000Z")));
    expect(dailyPick(items, all, "2026-09-05")).toBeDefined();
  });

  it("random unseen never returns a seen item while unseen ones remain", () => {
    const seen = viewMap(items.slice(0, 15).map((c) => view(c.id, "2026-01-01T00:00:00.000Z")));
    for (let i = 0; i < 20; i++) {
      const pick = randomUnseen(items, seen, () => i / 20);
      expect(seen.has(pick!.id)).toBe(false);
    }
  });

  it("least recently seen uses updatedAt", () => {
    const views = viewMap([view(items[0].id, "2026-01-01T00:00:00.000Z", "2026-03-01T00:00:00.000Z"), view(items[1].id, "2026-02-01T00:00:00.000Z", "2026-02-02T00:00:00.000Z")]);
    expect(leastRecentlySeen(items, views)?.id).toBe(items[1].id);
    expect(leastRecentlySeen(items, new Map())).toBeUndefined();
  });

  it("drawers cover every item once and neighbours stay within the domain", () => {
    const d = drawers(items);
    expect(d.reduce((n, x) => n + x.items.length, 0)).toBe(items.length);
    const history = items.filter((c) => c.domain === "history");
    const n = neighbours(items, history[1]);
    expect(n.prev?.id).toBe(history[0].id);
    expect(n.next?.id).toBe(history[2].id);
    expect(n.total).toBe(history.length);
  });
});

describe("why rubric", () => {
  const connected = [
    { id: "michelin-guide", title: "The Michelin Guide" },
    { id: "coffeehouses", title: "Coffeehouses" },
  ];
  it("scores 0.7 when a connected entry is named, 0.55 otherwise", () => {
    expect(whyScore("Because the guide made restaurants a reason to travel.", connected)).toEqual({ score: 0.7, mentioned: ["The Michelin Guide"] });
    expect(whyScore("It shows how incentives shape institutions.", connected).score).toBe(0.55);
    expect(whyScore("Like the coffeehouse, it sold a reason to go somewhere.", connected).mentioned).toEqual(["Coffeehouses"]);
  });
});

describe("generated", () => {
  it("coerces a model result and merges it after the seeded items", () => {
    const raw = coerceCuriosity({ id: "Why Bells Are Tuned Flat", title: "Why bells are tuned flat", hook: "A bell's note is not one note.", body: "Para one.\n\nPara two.", connects: ["Johann-Sebastian-Bach", "nonsense id"], domain: "Music & sound", origin: "generated" }, new Set());
    expect(raw.id).toBe("cur-why-bells-are-tuned-flat");
    expect(raw.domain).toBe("music");
    expect(raw.connects).toEqual(["johann-sebastian-bach", "nonsense-id"]);
    const merged = mergeCuriosities([{ id: "g1", userId: "u", createdAt: "", updatedAt: "", kind: "curiosity", refId: raw.id, payload: raw }]);
    expect(merged.length).toBe(CURIOSITIES.length + 1);
    expect(merged.at(-1)?.origin).toBe("generated");
  });
});
