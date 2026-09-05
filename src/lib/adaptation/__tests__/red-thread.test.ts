import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { LocalDatabase } from "@/lib/persistence/local";
import { recordError, recordEvidence } from "@/lib/services/evidence";
import { detectRedThreads, MIN_INSTANCES, MIN_SESSIONS, PATTERNS, patternFor } from "@/lib/adaptation/red-thread";

let counter = 0;
const fresh = () => new LocalDatabase("user_rt", `the-study-rt-${Date.now()}-${counter++}`);
const day = (n: number, hour = 9) => new Date(Date.UTC(2026, 7, 1 + n, hour)).toISOString();
const NOW = new Date(Date.UTC(2026, 7, 30, 12));
const source = { kind: "inference" as const, refId: "ts-1", label: "Three Stories" };

async function closure(db: LocalDatabase, at: string, sessionId: string) {
  await recordError(db, { type: "PREMATURE_CLOSURE", subskill: "inference.alternatives", source, detail: "Stopped at the first story.", sessionId, at });
}

describe("Red Thread detection", () => {
  it("every pattern targets a real subskill and at least one error type", () => {
    for (const p of PATTERNS) {
      expect(p.errorTypes.length).toBeGreaterThan(0);
      expect(p.targetSubskill).toMatch(/^[a-z]+\.[a-z_]+$/);
      expect(patternFor(p.key)).toBe(p);
    }
  });

  it("does not call a pattern from a single session or too few instances", async () => {
    const db = fresh();
    for (let i = 0; i < MIN_INSTANCES + 2; i++) await closure(db, day(1, 9 + i), "s1");
    const r = await detectRedThreads(db, NOW);
    expect(r.created).toHaveLength(0);

    const db2 = fresh();
    for (let i = 0; i < MIN_INSTANCES - 1; i++) await closure(db2, day(i), `s${i}`);
    const r2 = await detectRedThreads(db2, NOW);
    expect(r2.created).toHaveLength(0);
  });

  it("creates a candidate once the thresholds are met, and never duplicates it", async () => {
    const db = fresh();
    for (let i = 0; i < MIN_INSTANCES; i++) await closure(db, day(i), `s${i % MIN_SESSIONS}`);
    const r = await detectRedThreads(db, NOW);
    expect(r.created).toHaveLength(1);
    expect(r.created[0]!.patternKey).toBe("PREMATURE_CLOSURE");
    expect(r.created[0]!.status).toBe("candidate");
    expect(r.created[0]!.targetSubskill).toBe("inference.alternatives");

    // A concurrent second run shares the first; a later run finds nothing new.
    const [a, b] = await Promise.all([detectRedThreads(db, NOW), detectRedThreads(db, NOW)]);
    expect(a).toBe(b);
    const again = await detectRedThreads(db, NOW);
    expect(again.created).toHaveLength(0);
    expect(await db.store("red_threads").count()).toBe(1);
    const notes = await db.store("notifications").list();
    expect(notes.filter((n) => n.kind === "thread_detected")).toHaveLength(1);
  });

  it("strengthens to emerging and established with more instances across sessions", async () => {
    const db = fresh();
    for (let i = 0; i < 5; i++) await closure(db, day(i), `s${i}`);
    const r1 = await detectRedThreads(db, NOW);
    expect(r1.created[0]!.status).toBe("emerging");
    for (let i = 5; i < 9; i++) await closure(db, day(i), `s${i}`);
    const r2 = await detectRedThreads(db, NOW);
    expect(r2.updated[0]!.status).toBe("established");
    expect(r2.updated[0]!.evidenceIds).toHaveLength(9);
    expect(r2.updated[0]!.strength).toBeGreaterThan(r1.created[0]!.strength);
  });

  it("moves to improving on strong counter-evidence, and resolves only after a quiet fortnight", async () => {
    const db = fresh();
    for (let i = 0; i < 6; i++) await closure(db, day(i), `s${i}`);
    await detectRedThreads(db, NOW);

    // Three strong performances on the targeted subskill across two later sessions.
    for (let i = 0; i < 3; i++) {
      await recordEvidence(db, { subskill: "inference.alternatives", score: 0.9, difficulty: 4, format: "free", source, sessionId: `c${i % 2}`, at: day(10 + i) });
    }
    const r = await detectRedThreads(db, NOW);
    expect(r.improved).toHaveLength(1);
    expect(r.improved[0]!.status).toBe("improving");

    // Not yet resolved: needs six strong results across three sessions and fourteen quiet days.
    for (let i = 3; i < 6; i++) {
      await recordEvidence(db, { subskill: "inference.alternatives", score: 0.85, difficulty: 4, format: "free", source, sessionId: `c${i % 3}`, at: day(14 + i) });
    }
    const r2 = await detectRedThreads(db, NOW);
    expect(r2.resolved).toHaveLength(1);
    expect(r2.resolved[0]!.status).toBe("resolved");
    expect(r2.resolved[0]!.counterEvidenceIds).toHaveLength(6);
  });

  it("regresses an improving thread when the error recurs", async () => {
    const db = fresh();
    for (let i = 0; i < 6; i++) await closure(db, day(i), `s${i}`);
    await detectRedThreads(db, NOW);
    for (let i = 0; i < 3; i++) await recordEvidence(db, { subskill: "inference.alternatives", score: 0.9, difficulty: 4, format: "free", source, sessionId: `c${i % 2}`, at: day(10 + i) });
    const improving = await detectRedThreads(db, NOW);
    expect(improving.improved[0]!.status).toBe("improving");
    await closure(db, day(20), "s20");
    const r = await detectRedThreads(db, NOW);
    expect(["emerging", "established"]).toContain(r.updated[0]!.status);
  });
});
