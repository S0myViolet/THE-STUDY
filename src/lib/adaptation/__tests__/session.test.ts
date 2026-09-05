import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { LocalDatabase } from "@/lib/persistence/local";
import { ensureProfile } from "@/lib/services/profile";
import { createMemoryItem } from "@/lib/services/memory";
import { recordEvidence } from "@/lib/services/evidence";
import { completeSessionItem, currentItem, LENGTH_MINUTES, planSession, sessionHref, startSession, todaysSession } from "@/lib/adaptation/session";

let counter = 0;
const fresh = () => new LocalDatabase("user_ss", `the-study-ss-${Date.now()}-${counter++}`);

describe("Daily session engine", () => {
  it("plans within the length budget and is deterministic for a date and length", async () => {
    const db = fresh();
    const { profile, prefs } = await ensureProfile(db);
    const a = await planSession(db, profile, prefs, { length: "standard", dateKey: "2026-09-05" });
    const b = await planSession(db, profile, prefs, { length: "standard", dateKey: "2026-09-05" });
    expect(a.items.length).toBeGreaterThan(1);
    const minutes = a.items.reduce((s, i) => s + i.minutes, 0);
    expect(minutes).toBeLessThanOrEqual(LENGTH_MINUTES.standard + 5);
    expect(a.items.map((i) => i.kind)).toEqual(b.items.map((i) => i.kind));
    expect(a.status).toBe("planned");
    expect(await todaysSession(db, "2026-09-05")).toBeTruthy();
  });

  it("a quick session is shorter than a deep one and every item has a route", async () => {
    const db = fresh();
    const { profile, prefs } = await ensureProfile(db);
    const quick = await planSession(db, profile, prefs, { length: "quick", dateKey: "2026-09-06" });
    const deep = await planSession(db, profile, prefs, { length: "deep", dateKey: "2026-09-06" });
    const sum = (s: typeof quick) => s.items.reduce((t, i) => t + i.minutes, 0);
    expect(sum(quick)).toBeLessThan(sum(deep));
    for (const item of [...quick.items, ...deep.items]) {
      expect(item.href.startsWith("/")).toBe(true);
      expect(item.reason).toBeTruthy();
      expect(sessionHref(item, deep.id)).toContain(`session=${deep.id}`);
      expect(sessionHref(item, deep.id)).toContain(`item=${item.id}`);
    }
  });

  it("includes retention work when memory items are due and targets the weakest subskill", async () => {
    const db = fresh();
    const { profile, prefs } = await ensureProfile(db);
    const past = new Date(Date.now() - 3 * 86400000).toISOString();
    for (let i = 0; i < 4; i++) {
      const item = await createMemoryItem(db, { kind: "fact", prompt: `Fact ${i}`, answer: `Answer ${i}` });
      await db.store("memory_items").update(item.id, { due: past });
    }
    for (let i = 0; i < 5; i++) {
      await recordEvidence(db, { subskill: "inference.base_rates", score: 0.1, difficulty: 3, format: "mcq", source: { kind: "inference", refId: `br-${i}` } });
      await recordEvidence(db, { subskill: "observation.detail", score: 0.9, difficulty: 3, format: "mcq", source: { kind: "observation", refId: `gl-${i}` } });
    }
    const s = await planSession(db, profile, prefs, { length: "deep", dateKey: "2026-09-07" });
    expect(s.items.some((i) => i.kind === "recall" && i.reason === "due")).toBe(true);
    expect(s.items.some((i) => i.reasonText.includes("base_rates") || i.reasonText.includes("base rates"))).toBe(true);
  });

  it("advances through items and completes when the last is done", async () => {
    const db = fresh();
    const { profile, prefs } = await ensureProfile(db);
    const planned = await planSession(db, profile, prefs, { length: "quick", dateKey: "2026-09-08" });
    const started = await startSession(db, planned);
    expect(started.status).toBe("active");
    let s = started;
    let guard = 0;
    while (currentItem(s) && guard++ < 20) {
      const item = currentItem(s)!;
      s = (await completeSessionItem(db, s.id, item.id, guard % 2 ? "done" : "skipped"))!;
    }
    expect(s.status).toBe("completed");
    expect(s.completedAt).toBeTruthy();
    expect(s.items.every((i) => i.status !== "pending")).toBe(true);
    expect((await db.store("daily_sessions").get(s.id))?.status).toBe("completed");
  });
});
