import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import type { MemoryItem, UserProfile } from "@/lib/domain/types";
import { LocalDatabase } from "@/lib/persistence/local";
import { stamp } from "@/lib/persistence/store";
import { ensureProfile, updateProfile } from "@/lib/services/profile";
import { hasV1Data, importV1, importedRetrievalId, retrievalItemFromV1, V1_DATA_COLLECTIONS } from "@/lib/v2/migrate-v1";

const T0 = "2026-08-01T09:00:00.000Z";
const T1 = "2026-08-20T09:00:00.000Z";

let counter = 0;
function freshDb(user = "user_v1") {
  return new LocalDatabase(user, `the-study-migrate-${Date.now()}-${counter++}`);
}

function memory(userId: string, body: Partial<MemoryItem> & Pick<MemoryItem, "kind" | "prompt" | "answer">): MemoryItem {
  return {
    ...stamp<MemoryItem>(userId, "mem", { ease: 2.5, intervalDays: 0, due: T0, reps: 0, lapses: 0, ...body }),
    createdAt: body.createdAt ?? T0,
  };
}

async function seedV1(db: LocalDatabase) {
  const items: MemoryItem[] = [
    memory(db.userId, { id: "mem_fact", kind: "fact", prompt: "Year of the Peace of Westphalia?", answer: "1648", accept: ["1648 CE"], ease: 2.7, intervalDays: 12, due: "2026-09-10T09:00:00.000Z", reps: 4, lapses: 1, lastReviewedAt: T1, tags: ["history"], sourceRef: { kind: "memory", refId: "starter-1", label: "Starter set" } }),
    memory(db.userId, { id: "mem_concept", kind: "concept", prompt: "What is a base rate?", answer: "The prior frequency of an outcome in its reference class", ease: 2.36, intervalDays: 4, due: "2026-08-24T09:00:00.000Z", reps: 2, lapses: 0 }),
    memory(db.userId, { id: "mem_archive", kind: "archive", prompt: "Who negotiated the 1815 settlement at Vienna for Austria?", answer: "Metternich", sourceRef: { kind: "archive", refId: "entry-vienna-1815", label: "Congress of Vienna" }, suspended: true, tags: ["history", "event"] }),
    memory(db.userId, { id: "mem_person", kind: "person", prompt: "Who runs the mint?", answer: "Marco Sanudo", person: { name: "Marco Sanudo", profession: "Mint master", detail: "Keeps two ledgers", interest: "Coin weights" } }),
    memory(db.userId, { id: "mem_sequence", kind: "sequence", prompt: "Order the steps", answer: "arrive, weigh, record", sequence: ["arrive", "weigh", "record"] }),
    memory(db.userId, { id: "mem_story", kind: "story", prompt: "Retell the chain", answer: "A story" }),
  ];
  await db.store("memory_items").putMany(items);
  return items;
}

describe("hasV1Data", () => {
  it("is false on an empty study and true once any V1 collection has a row", async () => {
    const db = freshDb();
    await ensureProfile(db);
    expect(await hasV1Data(db)).toBe(false);
    await db.store("memory_items").put(memory(db.userId, { kind: "fact", prompt: "q", answer: "a" }));
    expect(await hasV1Data(db)).toBe(true);
  });

  it("counts case attempts and skill evidence, not V2 collections", async () => {
    const db = freshDb();
    await db.store("retrieval_items").put(stamp(db.userId, "ri", { mode: "fact", prompt: "q", answer: "a", source: { kind: "lesson", refId: "ls-1" }, ease: 2.5, intervalDays: 0, due: T0, reps: 0, lapses: 0, stage: 0 }));
    expect(await hasV1Data(db)).toBe(false);
    await db.store("case_attempts").put(stamp(db.userId, "ca", { caseId: "case-1", status: "active", currentStageIndex: 0, startedAt: T0 }));
    expect(await hasV1Data(db)).toBe(true);
    expect(V1_DATA_COLLECTIONS).toContain("skill_evidence");
    expect(V1_DATA_COLLECTIONS).not.toContain("concept_mastery");
  });
});

describe("retrievalItemFromV1", () => {
  it("maps fact, concept and archive items and refuses the rest", () => {
    const fact = retrievalItemFromV1(memory("u", { id: "mem_a", kind: "fact", prompt: "q", answer: "a" }), "u", T1)!;
    expect(fact.mode).toBe("fact");
    expect(fact.id).toBe(importedRetrievalId("mem_a"));
    expect(fact.source).toEqual({ kind: "v1", refId: "mem_a" });
    expect(fact.stage).toBe(0);
    expect(fact.userId).toBe("u");
    expect(retrievalItemFromV1(memory("u", { kind: "concept", prompt: "q", answer: "a" }), "u")!.mode).toBe("concept");
    expect(retrievalItemFromV1(memory("u", { kind: "archive", prompt: "q", answer: "a" }), "u")!.mode).toBe("fact");
    for (const kind of ["person", "sequence", "story", "spatial", "reconstruction"] as const) {
      expect(retrievalItemFromV1(memory("u", { kind, prompt: "q", answer: "a" }), "u")).toBeUndefined();
    }
  });

  it("repairs broken scheduling values instead of copying them", () => {
    const item = retrievalItemFromV1(memory("u", { kind: "fact", prompt: "q", answer: "a", ease: Number.NaN, intervalDays: -3, reps: 2.9, lapses: -1, due: "" }), "u", T1)!;
    expect(item.ease).toBe(2.5);
    expect(item.intervalDays).toBe(0);
    expect(item.reps).toBe(2);
    expect(item.lapses).toBe(0);
    expect(item.due).toBe(T1);
  });
});

describe("importV1", () => {
  it("imports fact, concept and archive memory items as retrieval items with scheduling copied", async () => {
    const db = freshDb();
    const { profile } = await ensureProfile(db);
    await seedV1(db);

    const result = await importV1(db, profile);
    expect(result.retrievalItems).toBe(3);

    const items = await db.store("retrieval_items").list({ orderBy: "createdAt" });
    expect(items).toHaveLength(3);
    for (const r of items) {
      expect(r.source.kind).toBe("v1");
      expect(r.stage).toBe(0);
      expect(r.conceptId).toBeUndefined();
      expect(r.userId).toBe(db.userId);
    }

    const fact = items.find((r) => r.source.refId === "mem_fact")!;
    expect(fact.id).toBe("ri_v1_mem_fact");
    expect(fact.mode).toBe("fact");
    expect(fact.prompt).toBe("Year of the Peace of Westphalia?");
    expect(fact.answer).toBe("1648");
    expect(fact.accept).toEqual(["1648 CE"]);
    expect(fact.ease).toBe(2.7);
    expect(fact.intervalDays).toBe(12);
    expect(fact.due).toBe("2026-09-10T09:00:00.000Z");
    expect(fact.reps).toBe(4);
    expect(fact.lapses).toBe(1);
    expect(fact.lastReviewedAt).toBe(T1);
    expect(fact.tags).toEqual(["history"]);
    expect(fact.source.label).toBe("Starter set");
    expect(fact.createdAt).toBe(T0);
    expect(fact.suspended).toBeUndefined();

    const concept = items.find((r) => r.source.refId === "mem_concept")!;
    expect(concept.mode).toBe("concept");
    expect(concept.source.label).toBeUndefined();
    expect(concept.accept).toBeUndefined();

    const archive = items.find((r) => r.source.refId === "mem_archive")!;
    expect(archive.mode).toBe("fact");
    expect(archive.suspended).toBe(true);
    expect(archive.source.label).toBe("Congress of Vienna");

    // Nothing else was touched: V1 items remain, no mastery was written.
    expect(await db.store("memory_items").count()).toBe(6);
    expect(await db.store("concept_mastery").count()).toBe(0);
    expect(await db.store("concept_evidence").count()).toBe(0);
  });

  it("is idempotent and only imports items added since the last run", async () => {
    const db = freshDb();
    const { profile } = await ensureProfile(db);
    await seedV1(db);
    expect((await importV1(db, profile)).retrievalItems).toBe(3);
    expect((await importV1(db, profile)).retrievalItems).toBe(0);
    expect(await db.store("retrieval_items").count()).toBe(3);

    // A review recorded on an imported item survives a re-run untouched.
    const imported = (await db.store("retrieval_items").get("ri_v1_mem_fact"))!;
    await db.store("retrieval_items").update(imported.id, { reps: 9, stage: 2 });
    await db.store("memory_items").put(memory(db.userId, { id: "mem_later", kind: "fact", prompt: "Later", answer: "yes" }));
    expect((await importV1(db, profile)).retrievalItems).toBe(1);
    expect(await db.store("retrieval_items").count()).toBe(4);
    const after = (await db.store("retrieval_items").get("ri_v1_mem_fact"))!;
    expect(after.reps).toBe(9);
    expect(after.stage).toBe(2);
  });

  it("stamps profile.v2.v1ImportedAt when the profile has a V2 section, and leaves a V1-only profile alone", async () => {
    const db = freshDb();
    const { profile: v1Only } = await ensureProfile(db);
    await seedV1(db);
    await importV1(db, v1Only);
    expect((await db.store("profiles").get(v1Only.id))!.v2).toBeUndefined();

    const withV2: UserProfile = await updateProfile(db, { v2: { goals: ["memory"], interests: ["history"], dailyMinutes: 60, onboardingComplete: true, startedAt: T1 } });
    const before = Date.now();
    await importV1(db, withV2);
    const stored = (await db.store("profiles").get(withV2.id))!;
    expect(stored.v2?.v1ImportedAt).toBeDefined();
    expect(new Date(stored.v2!.v1ImportedAt!).getTime()).toBeGreaterThanOrEqual(before - 1000);
    expect(stored.v2?.goals).toEqual(["memory"]);
    expect(stored.v2?.onboardingComplete).toBe(true);
  });

  it("keeps users apart: one user's import never sees another user's items", async () => {
    const name = `the-study-migrate-shared-${Date.now()}`;
    const a = new LocalDatabase("user_a", name);
    const b = new LocalDatabase("user_b", name);
    await ensureProfile(a);
    const { profile: pb } = await ensureProfile(b);
    await seedV1(a);
    expect(await hasV1Data(b)).toBe(false);
    expect((await importV1(b, pb)).retrievalItems).toBe(0);
    expect(await b.store("retrieval_items").count()).toBe(0);
  });
});
