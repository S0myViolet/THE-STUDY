import { describe, expect, it } from "vitest";
import { ALL_ROOMS, CHORDS, ROOMS, SECTIONS, V1_MOVED_ROOMS, V1_ROOMS, chordTarget, isV1Path, roomFor, sectionFor, v1Href } from "@/lib/nav";

describe("V2 navigation model", () => {
  it("has the six sections in order with Today first", () => {
    expect(SECTIONS.map((s) => s.id)).toEqual(["today", "learn", "train", "build", "prove", "review"]);
    expect(SECTIONS.every((s) => s.eyebrow && s.title && s.lede)).toBe(true);
  });

  it("lists the secondary rooms and keeps every href unique", () => {
    expect(ROOMS.map((r) => r.id)).toEqual(["library", "knowledge", "memory", "writing", "speaking", "forecasts", "decisions", "curator", "settings"]);
    const hrefs = ALL_ROOMS.map((r) => r.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    const ids = ALL_ROOMS.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps every V1 room under /v1 and out of the primary lists", () => {
    expect(V1_ROOMS.length).toBeGreaterThanOrEqual(16);
    expect(V1_ROOMS.every((r) => r.href.startsWith("/v1/"))).toBe(true);
    expect(V1_ROOMS.every((r) => !r.key)).toBe(true);
    for (const id of ["desk", "casebook", "observation", "inference", "salon", "strategy", "memory", "archive", "rhetoric", "cabinet", "investigations", "fieldwork", "red-thread", "after-action", "profile", "curator", "enter"]) {
      expect(V1_ROOMS.find((r) => r.href === `/v1/${id}`), id).toBeDefined();
    }
  });

  it("binds the specified chords and nothing conflicts", () => {
    const expected: Record<string, string> = { t: "/today", l: "/learn", r: "/train", b: "/build", p: "/prove", v: "/review", y: "/library", k: "/knowledge", m: "/memory", w: "/writing", c: "/curator" };
    for (const [key, href] of Object.entries(expected)) expect(chordTarget(key), key).toBe(href);
    const keys = CHORDS.map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(chordTarget("z")).toBeUndefined();
  });

  it("resolves the owning room for a pathname, preferring the most specific href", () => {
    expect(roomFor("/today")?.id).toBe("today");
    expect(roomFor("/learn/concept/base-rates")?.id).toBe("learn");
    expect(roomFor("/memory/review")?.id).toBe("memory");
    expect(roomFor("/v1/memory/review")?.id).toBe("v1-memory");
    expect(roomFor("/v1/casebook/case-1?session=1")?.id).toBe("v1-casebook");
    expect(roomFor("/v1/enter")?.id).toBe("v1-enter");
    expect(roomFor("/nowhere")).toBeUndefined();
    expect(sectionFor("/train/probability/practice")?.id).toBe("train");
    expect(sectionFor("/library")).toBeUndefined();
  });

  it("recognises archive paths", () => {
    expect(isV1Path("/v1/desk")).toBe(true);
    expect(isV1Path("/v1")).toBe(true);
    expect(isV1Path("/v10")).toBe(false);
    expect(isV1Path("/today")).toBe(false);
  });

  it("builds archive addresses for the rooms that moved, keeping segments and query", () => {
    expect(v1Href("casebook")).toBe("/v1/casebook");
    expect(v1Href("casebook", ["case-1"], { stage: "2" })).toBe("/v1/casebook/case-1?stage=2");
    expect(v1Href("archive", ["reading", "rd_1"])).toBe("/v1/archive/reading/rd_1");
    expect(v1Href("inference", ["base_rate"], { session: "s1", item: ["a", "b"], missing: undefined })).toBe("/v1/inference/base_rate?session=s1&item=a&item=b");
    expect(v1Href("profile", ["a b"])).toBe("/v1/profile/a%20b");
    expect(v1Href("desk", undefined, { begin: "case" })).toBe("/v1/desk?begin=case");
    for (const room of V1_MOVED_ROOMS) expect(V1_ROOMS.some((r) => r.href === v1Href(room)), room).toBe(true);
  });
});
