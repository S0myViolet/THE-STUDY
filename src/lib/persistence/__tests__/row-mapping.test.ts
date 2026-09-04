import "fake-indexeddb/auto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { CaseAttempt, MemoryItem, RedThread } from "@/lib/domain/types";
import { COLLECTIONS, LOCAL_INDEXES } from "@/lib/persistence/collections";
import { LocalDatabase } from "@/lib/persistence/local";
import { stamp } from "@/lib/persistence/store";
import { fromRow, toRow } from "@/lib/persistence/supabase";

/* ------------------------------------------------------------------ */
/* Samples: every field populated so column coverage is exhaustive      */
/* ------------------------------------------------------------------ */

const USER = "11111111-1111-4111-8111-111111111111";
const T0 = "2026-09-01T09:00:00.000Z";
const T1 = "2026-09-01T09:25:00.000Z";

const caseAttempt: CaseAttempt = {
  id: "ca_sample01",
  userId: USER,
  createdAt: T0,
  updatedAt: T1,
  caseId: "case-the-quiet-ledger",
  status: "completed",
  currentStageIndex: 10,
  startedAt: T0,
  completedAt: T1,
  sessionId: "ds_20260901",
  summary: {
    recallCorrect: 7,
    recallTotal: 9,
    falseRecalls: 1,
    separationAccuracy: 0.8,
    hypothesesCount: 3,
    alternativesCount: 2,
    questionInformationValue: 0.6,
    confidenceBefore: 0.7,
    confidenceAfter: 0.45,
    decisionQuality: 0.75,
    overallScore: 0.68,
    reasoningPath: [
      { label: "Ledger gap noticed", kind: "evidence", note: "March entries missing" },
      { label: "Confidence in fraud", kind: "confidence", value: 0.7 },
    ],
    noticed: ["missing March entries"],
    missed: ["second signature"],
    assumptions: ["the clerk kept the books alone"],
    didWell: ["asked about the audit schedule"],
    turningPoint: "The audit letter",
    oneThing: "Check who else had access before naming a culprit.",
  },
};

const memoryItem: MemoryItem = {
  id: "mi_sample01",
  userId: USER,
  createdAt: T0,
  updatedAt: T1,
  kind: "person",
  prompt: "Who ran the Venetian mint in your case?",
  answer: "Marco Sanudo",
  accept: ["Sanudo"],
  hint: "Surname begins with S",
  person: { name: "Marco Sanudo", profession: "Mint master", detail: "Kept two ledgers", interest: "Coin weights", origin: "Venice" },
  sequence: ["arrive", "weigh", "record"],
  sourceRef: { kind: "case", refId: "case-the-quiet-ledger", label: "The Quiet Ledger" },
  palaceLocusId: "locus_hall_01",
  ease: 2.5,
  intervalDays: 3,
  due: "2026-09-04T09:00:00.000Z",
  reps: 2,
  lapses: 0,
  lastReviewedAt: T1,
  suspended: false,
  tags: ["venice", "people"],
};

const redThread: RedThread = {
  id: "rt_sample01",
  userId: USER,
  createdAt: T0,
  updatedAt: T1,
  patternType: "reasoning",
  patternKey: "PREMATURE_CLOSURE",
  title: "Settling early",
  description: "Three cases where the first plausible explanation was accepted before the evidence stage.",
  evidenceIds: ["ee_1", "ee_2", "ee_3"],
  counterEvidenceIds: ["se_9"],
  strength: 0.62,
  confidence: "moderate",
  status: "emerging",
  firstDetected: T0,
  lastReinforced: T1,
  nextTest: "A case whose correct conclusion is insufficient evidence.",
  targetSubskill: "inference.alternatives",
  sessionsObserved: ["ds_20260828", "ds_20260901"],
  resolvedAt: T1,
};

const camelToSnake = (s: string) => s.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase());

/* ------------------------------------------------------------------ */
/* toRow / fromRow                                                       */
/* ------------------------------------------------------------------ */

describe("toRow / fromRow", () => {
  it.each([
    ["CaseAttempt", caseAttempt],
    ["MemoryItem", memoryItem],
    ["RedThread", redThread],
  ])("round-trips a %s", (_name, entity) => {
    const row = toRow(entity as unknown as Record<string, unknown>);
    for (const key of Object.keys(row)) expect(key).toMatch(/^[a-z][a-z0-9_]*$/);
    expect(row.user_id).toBe(USER);
    expect(row.created_at).toBe(T0);
    const back = fromRow<typeof entity>(row);
    expect(back).toEqual(entity);
  });

  it("maps undefined to null on the way out and drops null on the way back", () => {
    const row = toRow({ id: "x", userId: USER, createdAt: T0, updatedAt: T0, completedAt: undefined, sessionId: "s" });
    expect(row.completed_at).toBeNull();
    expect(row.session_id).toBe("s");
    const back = fromRow<Record<string, unknown>>(row);
    expect("completedAt" in back).toBe(false);
    expect(back.sessionId).toBe("s");
  });

  it("keeps nested objects untouched (jsonb columns are stored as-is)", () => {
    const row = toRow(caseAttempt as unknown as Record<string, unknown>);
    expect(row.summary).toBe(caseAttempt.summary);
    expect(Object.keys(row.summary as object)).toContain("recallCorrect");
  });
});

/* ------------------------------------------------------------------ */
/* Schema coverage: entity keys -> columns in 0001_init.sql              */
/* ------------------------------------------------------------------ */

interface TableDef {
  columns: string[];
}

function parseTables(sql: string): Record<string, TableDef> {
  const tables: Record<string, TableDef> = {};
  const re = /create table (?:if not exists )?(?:public\.)?([a-z_]+)\s*\(([\s\S]*?)\n\);/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql))) {
    const name = m[1];
    const body = m[2];
    const columns: string[] = [];
    for (const raw of body.split("\n")) {
      const line = raw.trim();
      if (!line || line.startsWith("--")) continue;
      const first = /^("?[a-z_]+"?)\s+/i.exec(line);
      if (!first) continue;
      const token = first[1].replace(/"/g, "").toLowerCase();
      if (["constraint", "check", "unique", "foreign", "primary"].includes(token)) continue;
      // continuation lines of a multi-line check() start with "check" and are skipped above
      columns.push(token);
    }
    tables[name] = { columns };
  }
  return tables;
}

const sqlPath = path.resolve(__dirname, "../../../../supabase/migrations/0001_init.sql");
const sqlText = readFileSync(sqlPath, "utf8");
const TABLES = parseTables(sqlText);

describe("0001_init.sql", () => {
  it("defines exactly one table per collection", () => {
    for (const c of COLLECTIONS) expect(TABLES[c], `table ${c}`).toBeDefined();
    expect(Object.keys(TABLES).sort()).toEqual([...COLLECTIONS].sort());
  });

  it("gives every table the base entity columns", () => {
    for (const c of COLLECTIONS) {
      for (const col of ["id", "user_id", "created_at", "updated_at"]) {
        expect(TABLES[c].columns, `${c}.${col}`).toContain(col);
      }
    }
  });

  it.each([
    ["case_attempts", caseAttempt],
    ["memory_items", memoryItem],
    ["red_threads", redThread],
  ])("has a column for every field of the %s sample", (table, entity) => {
    const cols = TABLES[table].columns;
    for (const key of Object.keys(entity)) {
      expect(cols, `${table}.${camelToSnake(key)}`).toContain(camelToSnake(key));
    }
  });

  it("indexes every LOCAL_INDEXES column and (user_id, created_at) for every table", () => {
    for (const [table, fields] of Object.entries(LOCAL_INDEXES)) {
      for (const f of fields ?? []) {
        const col = camelToSnake(f);
        const quoted = `"${col}"`;
        const re = new RegExp(`create index if not exists \\w+ on public\\.${table} \\(user_id, (${col}|${quoted})\\)`);
        expect(sqlText, `${table} index on ${col}`).toMatch(re);
      }
    }
    expect(sqlText).toContain("(user_id, created_at)");
    for (const c of COLLECTIONS) expect(sqlText).toContain(`'${c}'`);
  });

  it("enables row level security with owner-only policies and an updated_at trigger", () => {
    expect(sqlText).toMatch(/enable row level security/);
    for (const op of ["select", "insert", "update", "delete"]) expect(sqlText).toContain(`for ${op} to authenticated`);
    expect(sqlText).toContain("auth.uid() = user_id");
    expect(sqlText).toMatch(/create trigger set_updated_at before insert or update/);
    expect(sqlText).toMatch(/create or replace function public\.set_updated_at\(\)/);
  });

  it("references parents with foreign keys where entities point at other entities", () => {
    expect(sqlText).toMatch(/foreign key \(attempt_id, user_id\) references public\.case_attempts \(id, user_id\) on delete cascade/);
    expect(sqlText).toMatch(/foreign key \(item_id, user_id\) references public\.memory_items \(id, user_id\) on delete cascade/);
    expect(TABLES.red_threads.columns).toContain("evidence_ids");
  });
});

/* ------------------------------------------------------------------ */
/* LocalDatabase (Dexie over fake-indexeddb)                            */
/* ------------------------------------------------------------------ */

let dbCounter = 0;
function freshDbName() {
  return `the-study-test-${Date.now()}-${dbCounter++}`;
}

describe("LocalDatabase", () => {
  it("put / get / list / update / delete", async () => {
    const db = new LocalDatabase("user_a", freshDbName());
    const store = db.store("memory_items");

    const item = stamp<MemoryItem>("user_a", "mi", {
      kind: "fact",
      prompt: "Year of the Peace of Westphalia?",
      answer: "1648",
      ease: 2.5,
      intervalDays: 0,
      due: T0,
      reps: 0,
      lapses: 0,
    });
    const saved = await store.put(item);
    expect(saved.id).toBe(item.id);
    expect(saved.userId).toBe("user_a");

    const got = await store.get(item.id);
    expect(got?.answer).toBe("1648");

    const second = stamp<MemoryItem>("user_a", "mi", {
      kind: "concept",
      prompt: "What is a base rate?",
      answer: "The prior frequency of an outcome in the reference class",
      ease: 2.5,
      intervalDays: 0,
      due: T1,
      reps: 0,
      lapses: 0,
    });
    await store.put(second);

    const facts = await store.list({ where: { kind: "fact" } });
    expect(facts.map((i) => i.id)).toEqual([item.id]);

    const byDueDesc = await store.list({ orderBy: "due", desc: true });
    expect(byDueDesc.map((i) => i.id)).toEqual([second.id, item.id]);

    const limited = await store.list({ orderBy: "due", limit: 1 });
    expect(limited).toHaveLength(1);
    expect(limited[0].id).toBe(item.id);

    expect(await store.count()).toBe(2);
    expect(await store.count({ kind: "concept" })).toBe(1);

    const updated = await store.update(item.id, { reps: 3, intervalDays: 6 });
    expect(updated?.reps).toBe(3);
    expect(updated?.intervalDays).toBe(6);
    expect(updated?.prompt).toBe(item.prompt);
    expect((updated?.updatedAt ?? "") >= item.updatedAt).toBe(true);
    expect(await store.update("mi_missing", { reps: 1 })).toBeUndefined();

    await store.delete(item.id);
    expect(await store.get(item.id)).toBeUndefined();
    expect(await store.count()).toBe(1);
  });

  it("isolates ownership between two userIds sharing one IndexedDB", async () => {
    const name = freshDbName();
    const dbA = new LocalDatabase("user_a", name);
    const dbB = new LocalDatabase("user_b", name);

    const a1 = stamp<CaseAttempt>("user_a", "ca", { caseId: "case-1", status: "active", currentStageIndex: 0, startedAt: T0 });
    const a2 = stamp<CaseAttempt>("user_a", "ca", { caseId: "case-2", status: "completed", currentStageIndex: 9, startedAt: T0 });
    const b1 = stamp<CaseAttempt>("user_b", "ca", { caseId: "case-1", status: "active", currentStageIndex: 2, startedAt: T0 });
    await dbA.store("case_attempts").putMany([a1, a2]);
    await dbB.store("case_attempts").put(b1);

    // Each user lists only their own rows.
    expect((await dbA.store("case_attempts").list()).map((r) => r.id).sort()).toEqual([a1.id, a2.id].sort());
    expect((await dbB.store("case_attempts").list()).map((r) => r.id)).toEqual([b1.id]);
    expect(await dbA.store("case_attempts").count()).toBe(2);
    expect(await dbB.store("case_attempts").count()).toBe(1);

    // Cross-user reads, updates and deletes are refused (no-ops).
    expect(await dbB.store("case_attempts").get(a1.id)).toBeUndefined();
    expect(await dbB.store("case_attempts").update(a1.id, { status: "abandoned" })).toBeUndefined();
    await dbB.store("case_attempts").delete(a1.id);
    expect((await dbA.store("case_attempts").get(a1.id))?.status).toBe("active");

    // A put through user B's store is stamped with B's userId, whatever the entity claimed.
    const smuggled = { ...a2, id: "ca_smuggled" };
    await dbB.store("case_attempts").put(smuggled);
    expect((await dbB.store("case_attempts").get("ca_smuggled"))?.userId).toBe("user_b");
    expect(await dbA.store("case_attempts").get("ca_smuggled")).toBeUndefined();

    // Clearing one user's collection leaves the other's rows alone.
    await dbB.store("case_attempts").clear();
    expect(await dbB.store("case_attempts").count()).toBe(0);
    expect(await dbA.store("case_attempts").count()).toBe(2);
  });

  it("exports and re-imports the user's data", async () => {
    const name = freshDbName();
    const db = new LocalDatabase("user_a", name);
    await db.store("milestones").put(stamp("user_a", "ms", { key: "first-case", title: "First case", description: "", reachedAt: T0 }));
    const dump = await db.exportAll();
    expect(Object.keys(dump).sort()).toEqual([...COLLECTIONS].sort());
    expect(dump.milestones).toHaveLength(1);

    const other = new LocalDatabase("user_a", freshDbName());
    await other.importAll(dump);
    expect(await other.store("milestones").count({ key: "first-case" })).toBe(1);

    await other.wipe();
    expect(await other.store("milestones").count()).toBe(0);
  });
});
