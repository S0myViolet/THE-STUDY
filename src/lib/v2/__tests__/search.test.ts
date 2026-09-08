import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { LocalDatabase } from "@/lib/persistence/local";
import { stamp } from "@/lib/persistence/store";
import { COMMANDS, V1_PREFIX, isV1Hit, staticIndex, userIndex } from "@/lib/search";
import { COMMANDS_V2, search, staticIndexV2, userIndexV2 } from "@/lib/v2/search";
import { SKELETON_CONCEPT_IDS } from "@/content/v2";
import type { DecisionEntry, Forecast, ReadingItem } from "@/lib/domain/types";
import type { ErrorRecord, LibrarySource, Project, WritingEntry } from "@/lib/v2/types";

const EXPECTED_COMMANDS: [string, string][] = [
  ["Continue today's work", "/today"],
  ["Review due concepts", "/memory/review"],
  ["Start practice", "/train"],
  ["Open current book", "/library?open=current"],
  ["Begin exam", "/prove/exams"],
  ["Ask Curator", "/curator"],
  ["Search Knowledge", "/knowledge"],
  ["Create Investigation", "/build/new"],
  ["Write", "/writing/new"],
  ["Make prediction", "/forecasts/new"],
];

describe("V1 archive index", () => {
  it("prefixes every archived href with /v1 and labels the title", () => {
    const hits = staticIndex();
    expect(hits.length).toBeGreaterThan(COMMANDS.length);
    for (const h of hits) {
      expect(h.href.startsWith("/v1/"), h.id).toBe(true);
      expect(h.title.startsWith(V1_PREFIX), h.id).toBe(true);
      expect(isV1Hit(h)).toBe(true);
    }
    expect(hits.find((h) => h.id === "cmd-case")?.href).toBe("/v1/desk?begin=case");
  });

  it("keeps the V1 cases and archive entries searchable", () => {
    const hits = staticIndex();
    expect(hits.some((h) => h.kind === "case" && h.href.startsWith("/v1/casebook/"))).toBe(true);
    expect(hits.some((h) => h.kind === "archive" && h.href.startsWith("/v1/archive/"))).toBe(true);
  });
});

describe("V2 static index", () => {
  it("carries the V2 commands with their targets, first", () => {
    const hits = staticIndexV2();
    for (const [title, href] of EXPECTED_COMMANDS) {
      const hit = hits.find((h) => h.kind === "command" && h.title === title);
      expect(hit, title).toBeDefined();
      expect(hit!.href).toBe(href);
    }
    expect(hits.slice(0, COMMANDS_V2.length).every((h) => h.kind === "command" && !isV1Hit(h))).toBe(true);
    expect(search(hits, "").every((h) => !isV1Hit(h))).toBe(true);
  });

  it("indexes every skeleton concept under /learn/concept even before its content is authored", () => {
    const hits = staticIndexV2();
    for (const id of SKELETON_CONCEPT_IDS) {
      const hit = hits.find((h) => h.id === "concept-" + id);
      expect(hit, id).toBeDefined();
      expect(hit!.href).toBe(`/learn/concept/${id}`);
      expect(hit!.subtitle).toBeTruthy();
    }
    expect(hits.some((h) => h.kind === "course" && h.href.startsWith("/learn/course/"))).toBe(true);
  });

  it("includes sections, rooms and the whole V1 archive with unique ids", () => {
    const hits = staticIndexV2();
    expect(hits.filter((h) => h.kind === "section").map((h) => h.href)).toEqual(["/today", "/learn", "/train", "/build", "/prove", "/review"]);
    expect(hits.some((h) => h.kind === "room" && h.href === "/library")).toBe(true);
    expect(hits.some((h) => h.kind === "room" && h.href === "/v1/desk")).toBe(true);
    const ids = hits.map((h) => h.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("ranks a current entry above an archived one on an equal match", () => {
    const hits = staticIndexV2();
    const results = search(hits, "memory");
    const firstV1 = results.findIndex(isV1Hit);
    const firstV2 = results.findIndex((h) => !isV1Hit(h));
    expect(firstV2).toBeGreaterThanOrEqual(0);
    if (firstV1 >= 0) expect(firstV2).toBeLessThan(firstV1);
    expect(search(hits, "base rates")[0]?.kind).toBe("concept");
  });
});

describe("V2 user index", () => {
  it("lists projects, sources, writing, recent errors, forecasts, decisions and V1 user entries", async () => {
    const db = new LocalDatabase("user_search", `the-study-search-${Date.now()}`);
    const u = db.userId;
    await db.store("projects").put(
      stamp<Project>(u, "proj", {
        kind: "investigation",
        title: "Why did the printing press spread so fast?",
        question: "What made adoption rapid?",
        whyItMatters: "",
        whatIThinkNow: "",
        requiredConcepts: [],
        appliedConcepts: [],
        sources: [],
        notes: [],
        claims: [],
        evidence: [],
        counterarguments: [],
        openQuestions: [],
        milestones: [],
        status: "open",
        startedAt: new Date().toISOString(),
      }),
    );
    await db.store("library_sources").put(stamp<LibrarySource>(u, "src", { type: "book", title: "The Wealth of Nations", author: "Adam Smith", status: "reading", concepts: [], projectIds: [], unitLabel: "chapter", connectionsCount: 0 }));
    await db.store("writing_entries").put(stamp<WritingEntry>(u, "wr", { level: 3, title: "On tariffs", prompt: "Argue for or against tariffs.", status: "draft", currentVersion: 1, concepts: [], wordCount: 120, timeMs: 0 }));
    await db.store("error_records").put(stamp<ErrorRecord>(u, "err", { category: "BASE_RATE_NEGLECT", skill: "probability", concepts: ["base-rates"], question: "A test is 99% accurate…", response: "0.99", correctReasoning: "Weigh the prior.", source: { kind: "practice", refId: "it-probability-01" }, recurrenceKey: "BASE_RATE_NEGLECT:base-rates" }));
    await db.store("forecasts").put(stamp<Forecast>(u, "fc", { question: "Will it rain on Friday?", probability: 0.6, reasoning: "", evidence: "", changeMind: "", resolutionDate: new Date().toISOString(), category: "other" as Forecast["category"], status: "open", history: [] }));
    await db.store("decision_entries").put(stamp<DecisionEntry>(u, "dec", { title: "Take the job", options: ["yes", "no"], currentBelief: "", expectedOutcome: "", confidence: 0.7, assumptions: [], changeMind: "", status: "open" } as unknown as Omit<DecisionEntry, "id" | "userId" | "createdAt" | "updatedAt">));
    await db.store("reading_items").put(stamp<ReadingItem>(u, "rd", { kind: "book", title: "Old shelf book", status: "reading" } as unknown as Omit<ReadingItem, "id" | "userId" | "createdAt" | "updatedAt">));

    const hits = await userIndexV2(db);
    const byKind = (k: string) => hits.filter((h) => h.kind === k);
    expect(byKind("project")[0]?.href).toMatch(/^\/build\/proj_/);
    expect(byKind("source")[0]?.href).toMatch(/^\/library\/src_/);
    expect(byKind("writing")[0]?.href).toMatch(/^\/writing\/wr_/);
    expect(byKind("error")[0]?.href).toBe("/train/probability/practice?concept=base-rates&remediate=BASE_RATE_NEGLECT%3Abase-rates");
    expect(byKind("forecast")[0]?.href).toMatch(/^\/forecasts\/fc_/);
    expect(byKind("decision")[0]?.href).toMatch(/^\/decisions\/dec_/);
    const book = byKind("book")[0];
    expect(book?.href).toMatch(/^\/v1\/archive\/reading\//);
    expect(book?.title.startsWith(V1_PREFIX)).toBe(true);

    const v1Only = await userIndex(db);
    expect(v1Only.every(isV1Hit)).toBe(true);
    expect(search([...staticIndexV2(), ...hits], "wealth of nations")[0]?.kind).toBe("source");
  });
});
