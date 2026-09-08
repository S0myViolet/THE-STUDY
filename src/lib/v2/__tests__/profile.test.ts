import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import type { MemoryItem, Preferences, UserProfile } from "@/lib/domain/types";
import { LocalDatabase } from "@/lib/persistence/local";
import { stamp } from "@/lib/persistence/store";
import { DEFAULT_PREFS, DEFAULT_READING_PACE, ensureProfile, paced, readingPaceOf } from "@/lib/services/profile";
import { completeV2Onboarding, dailyMinutesOf, firstMonthWeek, needsV2Onboarding, recommendedPlanMode } from "@/lib/v2/profile";
import { isEntrancePath, onboardingSatisfied } from "@/components/shell/StudyGate";

let counter = 0;
function freshDb(user = "user_p") {
  return new LocalDatabase(user, `the-study-profile-${Date.now()}-${counter++}`);
}

const base: UserProfile = { id: "profile_x", userId: "u", createdAt: "2026-09-01T00:00:00.000Z", updatedAt: "2026-09-01T00:00:00.000Z", displayName: "", goals: [], interests: [], onboardingComplete: false, baselineComplete: false, isDemo: false, enteredAt: "2026-09-01T00:00:00.000Z" };

describe("needsV2Onboarding", () => {
  it("is true until profile.v2.onboardingComplete is true, whatever the V1 flag says", () => {
    expect(needsV2Onboarding(undefined)).toBe(true);
    expect(needsV2Onboarding(null)).toBe(true);
    expect(needsV2Onboarding(base)).toBe(true);
    expect(needsV2Onboarding({ ...base, onboardingComplete: true })).toBe(true);
    expect(needsV2Onboarding({ ...base, v2: { goals: [], interests: [], dailyMinutes: 30, onboardingComplete: false, startedAt: base.createdAt } })).toBe(true);
    expect(needsV2Onboarding({ ...base, v2: { goals: [], interests: [], dailyMinutes: 30, onboardingComplete: true, startedAt: base.createdAt } })).toBe(false);
  });
});

describe("gate rules", () => {
  const v1Only = { ...base, onboardingComplete: true };
  const v2Done = { ...base, v2: { goals: [], interests: [], dailyMinutes: 30, onboardingComplete: true, startedAt: base.createdAt } };

  it("lets a V2-onboarded profile everywhere and a V1-only profile only into the archive", () => {
    expect(onboardingSatisfied(v2Done, "/today")).toBe(true);
    expect(onboardingSatisfied(v2Done, "/v1/desk")).toBe(true);
    expect(onboardingSatisfied(v1Only, "/today")).toBe(false);
    expect(onboardingSatisfied(v1Only, "/learn/concept/x")).toBe(false);
    expect(onboardingSatisfied(v1Only, "/v1/desk")).toBe(true);
    expect(onboardingSatisfied(v1Only, "/v1")).toBe(true);
    expect(onboardingSatisfied(base, "/v1/desk")).toBe(false);
    expect(onboardingSatisfied(v1Only, "/v10/x")).toBe(false);
  });

  it("recognises both entrances", () => {
    expect(isEntrancePath("/enter")).toBe(true);
    expect(isEntrancePath("/v1/enter")).toBe(true);
    expect(isEntrancePath("/enter/baseline")).toBe(true);
    expect(isEntrancePath("/entered")).toBe(false);
    expect(isEntrancePath("/today")).toBe(false);
    expect(isEntrancePath(null)).toBe(false);
  });
});

describe("recommendedPlanMode", () => {
  it("picks the nearest preset within fifteen minutes, otherwise custom", () => {
    expect(recommendedPlanMode(30)).toBe("minimum");
    expect(recommendedPlanMode(45)).toBe("minimum");
    expect(recommendedPlanMode(20)).toBe("minimum");
    expect(recommendedPlanMode(60)).toBe("custom");
    expect(recommendedPlanMode(75)).toBe("standard");
    expect(recommendedPlanMode(90)).toBe("standard");
    expect(recommendedPlanMode(105)).toBe("standard");
    expect(recommendedPlanMode(120)).toBe("custom");
    expect(recommendedPlanMode(150)).toBe("deep");
    expect(recommendedPlanMode(165)).toBe("deep");
    expect(recommendedPlanMode(240)).toBe("custom");
  });

  it("treats a missing or nonsensical budget as the standard day", () => {
    expect(recommendedPlanMode(0)).toBe("standard");
    expect(recommendedPlanMode(-10)).toBe("standard");
    expect(recommendedPlanMode(Number.NaN)).toBe("standard");
  });
});

describe("dailyMinutesOf", () => {
  const withV2 = { ...base, v2: { goals: [], interests: [], dailyMinutes: 45, onboardingComplete: true, startedAt: base.createdAt } };
  it("prefers the preference, then the profile, then the standard day", () => {
    expect(dailyMinutesOf(withV2, { planMode: "custom", customMinutes: 70 })).toBe(70);
    expect(dailyMinutesOf(withV2, { planMode: "deep" })).toBe(150);
    expect(dailyMinutesOf(withV2, undefined)).toBe(45);
    expect(dailyMinutesOf(base, undefined)).toBe(90);
    expect(dailyMinutesOf(withV2, { planMode: "custom", customMinutes: 0 })).toBe(45);
  });
});

describe("firstMonthWeek", () => {
  const started = "2026-09-01T09:00:00.000Z";
  const profile = { ...base, v2: { goals: [], interests: [], dailyMinutes: 60, onboardingComplete: true, startedAt: started } };
  it("counts weeks from startedAt and stops after day 28", () => {
    expect(firstMonthWeek(profile, new Date("2026-09-01T10:00:00.000Z"))).toBe(1);
    expect(firstMonthWeek(profile, new Date("2026-09-07T23:00:00.000Z"))).toBe(1);
    expect(firstMonthWeek(profile, new Date("2026-09-08T09:00:00.000Z"))).toBe(2);
    expect(firstMonthWeek(profile, new Date("2026-09-15T09:00:00.000Z"))).toBe(3);
    expect(firstMonthWeek(profile, new Date("2026-09-22T09:00:00.000Z"))).toBe(4);
    expect(firstMonthWeek(profile, new Date("2026-09-28T09:00:00.000Z"))).toBe(4);
    expect(firstMonthWeek(profile, new Date("2026-09-29T09:00:00.000Z"))).toBeUndefined();
    expect(firstMonthWeek(profile, new Date("2026-08-20T09:00:00.000Z"))).toBe(1);
  });
  it("is undefined before the entrance or with a broken date", () => {
    expect(firstMonthWeek(base)).toBeUndefined();
    expect(firstMonthWeek(undefined)).toBeUndefined();
    expect(firstMonthWeek({ ...profile, v2: { ...profile.v2, startedAt: "not a date" } })).toBeUndefined();
  });
});

describe("reading pace", () => {
  it("defaults to 2 and doubles every timed exposure", () => {
    expect(DEFAULT_READING_PACE).toBe(2);
    expect(DEFAULT_PREFS.readingPace).toBe(2);
    expect(readingPaceOf(undefined)).toBe(2);
    expect(readingPaceOf({ readingPace: undefined })).toBe(2);
    expect(readingPaceOf({ readingPace: 0 })).toBe(2);
    expect(readingPaceOf({ readingPace: Number.NaN })).toBe(2);
    expect(readingPaceOf({ readingPace: 1.5 })).toBe(1.5);
    expect(paced(45)).toBe(90);
    expect(paced(45, 1)).toBe(45);
    expect(paced(45, 1.5)).toBe(68);
    expect(paced(30, 0)).toBe(60);
    expect(paced(-5, 2)).toBe(0);
    expect(paced(Number.NaN, 2)).toBe(0);
  });
});

describe("ensureProfile", () => {
  it("creates preferences with the V2 defaults", async () => {
    const db = freshDb();
    const { profile, prefs } = await ensureProfile(db);
    expect(profile.onboardingComplete).toBe(false);
    expect(profile.v2).toBeUndefined();
    expect(prefs.planMode).toBe("standard");
    expect(prefs.customMinutes).toBe(60);
    expect(prefs.lessonDepth).toBe("standard");
    expect(prefs.readingPace).toBe(2);
    expect(prefs.thinkFirst).toBe(true);
  });

  it("back-fills missing preference keys on an existing V1 row and persists them", async () => {
    const db = freshDb();
    const v1Prefs = stamp<Preferences>(db.userId, "prefs", {
      sessionLength: "quick",
      preferredFaculties: ["memory"],
      thinkFirst: false,
      pressureDefault: "none",
      fieldworkEnabled: false,
      curiositiesEnabled: true,
      newsEnabled: false,
      appearance: "dark",
      curatorDepth: "concise",
      challengeStyle: "supportive",
      reducedMotion: true,
      soundEnabled: false,
    });
    await db.store("preferences").put(v1Prefs);
    const { prefs } = await ensureProfile(db);
    expect(prefs.id).toBe(v1Prefs.id);
    expect(prefs.appearance).toBe("dark");
    expect(prefs.thinkFirst).toBe(false);
    expect(prefs.planMode).toBe("standard");
    expect(prefs.customMinutes).toBe(60);
    expect(prefs.lessonDepth).toBe("standard");
    expect(prefs.readingPace).toBe(2);
    const stored = (await db.store("preferences").get(v1Prefs.id))!;
    expect(stored.readingPace).toBe(2);
    expect(stored.planMode).toBe("standard");
    expect(await db.store("preferences").count()).toBe(1);
  });

  it("keeps the defaults in memory when the back-fill cannot be written", async () => {
    const db = freshDb();
    const v1Prefs = stamp<Preferences>(db.userId, "prefs", { ...DEFAULT_PREFS, planMode: undefined, customMinutes: undefined, lessonDepth: undefined, readingPace: undefined } as unknown as Omit<Preferences, "id" | "userId" | "createdAt" | "updatedAt">);
    await db.store("preferences").put(v1Prefs);
    const store = db.store("preferences");
    const realUpdate = store.update.bind(store);
    store.update = async () => {
      throw new Error("column reading_pace does not exist");
    };
    const { prefs } = await ensureProfile(db);
    expect(prefs.readingPace).toBe(2);
    expect(prefs.planMode).toBe("standard");
    store.update = realUpdate;
    const stored = (await store.get(v1Prefs.id))!;
    expect(stored.readingPace).toBeUndefined();
  });

  it("falls back to the V1 shape when a fresh preferences row cannot be written with V2 columns", async () => {
    const db = freshDb();
    const store = db.store("preferences");
    const realPut = store.put.bind(store);
    let calls = 0;
    store.put = async (item: Preferences) => {
      calls += 1;
      if ("readingPace" in item) throw new Error("column reading_pace does not exist");
      return realPut(item);
    };
    const { prefs } = await ensureProfile(db);
    expect(calls).toBe(2);
    expect(prefs.readingPace).toBe(2);
    expect(prefs.planMode).toBe("standard");
    store.put = realPut;
    const stored = (await store.list())[0]!;
    expect(stored.readingPace).toBeUndefined();
    expect(stored.appearance).toBe("system");
  });
});

describe("completeV2Onboarding", () => {
  it("writes profile.v2, both onboarding flags, V1 goal/interest echoes and the plan mode", async () => {
    const db = freshDb();
    const { profile } = await ensureProfile(db);
    const before = Date.now();
    const { profile: done, imported } = await completeV2Onboarding(db, profile, {
      displayName: "  Ada  ",
      goals: ["reasoning", "quantitative", "reasoning"],
      interests: ["history", "ai", "economics"],
      educationLevel: "bachelor",
      dailyMinutes: 45,
      baselineSkipped: true,
    });
    expect(imported).toBeUndefined();
    expect(done.displayName).toBe("Ada");
    expect(done.onboardingComplete).toBe(true);
    expect(needsV2Onboarding(done)).toBe(false);
    expect(done.v2).toMatchObject({ goals: ["reasoning", "quantitative"], interests: ["history", "ai", "economics"], educationLevel: "bachelor", dailyMinutes: 45, onboardingComplete: true, baselineSkipped: true });
    expect(done.v2?.baselineAttemptId).toBeUndefined();
    expect(new Date(done.v2!.startedAt).getTime()).toBeGreaterThanOrEqual(before - 1000);
    expect(done.goals).toEqual(["thinking"]);
    expect(done.interests).toEqual(["history", "economics"]);
    expect(done.baselineComplete).toBe(false);

    const prefs = (await db.store("preferences").list())[0]!;
    expect(prefs.planMode).toBe("minimum");
    expect(prefs.customMinutes).toBe(60);
    expect(firstMonthWeek(done)).toBe(1);
  });

  it("keeps startedAt and existing V1 goals across a second pass, stores a custom budget, marks the baseline", async () => {
    const db = freshDb();
    await ensureProfile(db);
    let profile = (await db.store("profiles").list())[0]!;
    profile = (await db.store("profiles").update(profile.id, { goals: ["people"], interests: ["music"] }))!;
    const first = await completeV2Onboarding(db, profile, { goals: ["memory"], interests: ["art"], dailyMinutes: 30 });
    const startedAt = first.profile.v2!.startedAt;
    expect(first.profile.goals).toEqual(["people"]);
    expect(first.profile.interests).toEqual(["music"]);

    const second = await completeV2Onboarding(db, first.profile, { goals: ["complete"], interests: ["philosophy"], dailyMinutes: 120, baselineAttemptId: "exam_baseline_1" });
    expect(second.profile.v2?.startedAt).toBe(startedAt);
    expect(second.profile.v2?.goals).toEqual(["complete"]);
    expect(second.profile.v2?.baselineAttemptId).toBe("exam_baseline_1");
    expect(second.profile.baselineComplete).toBe(true);
    const prefs = (await db.store("preferences").list())[0]!;
    expect(prefs.planMode).toBe("custom");
    expect(prefs.customMinutes).toBe(120);
  });

  it("imports V1 memory items when V1 data exists and records the import on the profile", async () => {
    const db = freshDb();
    const { profile } = await ensureProfile(db);
    await db.store("memory_items").putMany([
      stamp<MemoryItem>(db.userId, "mem", { kind: "fact", prompt: "Capital of Australia?", answer: "Canberra", ease: 2.5, intervalDays: 1, due: "2026-09-02T00:00:00.000Z", reps: 1, lapses: 0 }),
      stamp<MemoryItem>(db.userId, "mem", { kind: "person", prompt: "Who?", answer: "Someone", ease: 2.5, intervalDays: 0, due: "2026-09-02T00:00:00.000Z", reps: 0, lapses: 0 }),
    ]);
    const { profile: done, imported } = await completeV2Onboarding(db, profile, { goals: ["knowledge"], interests: ["science"], dailyMinutes: 90 });
    expect(imported).toEqual({ retrievalItems: 1 });
    expect(done.v2?.v1ImportedAt).toBeDefined();
    expect(done.v2?.onboardingComplete).toBe(true);
    const items = await db.store("retrieval_items").list();
    expect(items).toHaveLength(1);
    expect(items[0].prompt).toBe("Capital of Australia?");
    expect(items[0].source.kind).toBe("v1");
  });
});
