import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { LocalDatabase } from "@/lib/persistence/local";
import { seedDemo } from "@/lib/demo/seed";
import { facultyViews } from "@/lib/profile/derive";

describe("Demonstration profile", () => {
  it("seeds thirty days of evidence, reviews, forecasts, decisions and at least one named pattern", async () => {
    const db = new LocalDatabase("user_demo", `the-study-demo-${Date.now()}`);
    await seedDemo(db);
    const profile = (await db.store("profiles").list())[0]!;
    expect(profile.isDemo).toBe(true);
    expect(profile.onboardingComplete).toBe(true);

    const evidence = await db.store("skill_evidence").count();
    expect(evidence).toBeGreaterThan(300);
    const days = new Set((await db.store("skill_evidence").list()).map((e) => e.createdAt.slice(0, 10)));
    expect(days.size).toBeGreaterThanOrEqual(20);

    expect(await db.store("memory_items").count()).toBeGreaterThan(10);
    expect(await db.store("memory_reviews").count()).toBeGreaterThan(20);
    expect(await db.store("forecasts").count()).toBe(10);
    expect(await db.store("decision_entries").count()).toBe(5);
    expect(await db.store("daily_sessions").count()).toBeGreaterThan(10);
    expect(await db.store("after_actions").count()).toBeGreaterThan(5);

    const views = facultyViews(await db.store("skill_estimates").list());
    expect(views.filter((v) => v.level !== "untested").length).toBeGreaterThanOrEqual(8);

    const threads = await db.store("red_threads").list();
    expect(threads.length).toBeGreaterThanOrEqual(1);
    expect(threads.some((t) => t.status === "established" || t.status === "emerging")).toBe(true);
  }, 120_000);
});
