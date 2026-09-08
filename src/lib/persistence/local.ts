import Dexie, { type Table } from "dexie";
import type { Entity } from "@/lib/domain/types";
import { COLLECTIONS, LOCAL_INDEXES, type CollectionMap, type CollectionName } from "./collections";
import { applyListOptions, matchesWhere, nowIso, type ListOptions, type Store, type StudyDatabase } from "./store";
import { changeBus } from "./events";

const DB_NAME = "the-study";
const DB_VERSION = 2; // 2: V2 collections added (Dexie diffs the schema against the stored one)

function buildSchema(): Record<string, string> {
  const schema: Record<string, string> = {};
  for (const c of COLLECTIONS) {
    const extra = LOCAL_INDEXES[c] ?? [];
    schema[c] = ["id", "userId", "createdAt", "updatedAt", ...extra].join(", ");
  }
  return schema;
}

class StudyDexie extends Dexie {
  constructor(name = DB_NAME) {
    super(name);
    this.version(DB_VERSION).stores(buildSchema());
  }
}

class LocalStore<T extends Entity> implements Store<T> {
  constructor(
    private db: StudyDexie,
    private name: CollectionName,
    private userId: string,
  ) {}

  private get table(): Table<T, string> {
    return this.db.table(this.name) as unknown as Table<T, string>;
  }

  async get(id: string) {
    const item = await this.table.get(id);
    return item && item.userId === this.userId ? item : undefined;
  }

  async put(item: T) {
    const next = { ...item, userId: this.userId, updatedAt: nowIso() };
    await this.table.put(next);
    changeBus.emit(this.name);
    return next;
  }

  async putMany(items: T[]) {
    if (!items.length) return;
    const t = nowIso();
    await this.table.bulkPut(items.map((i) => ({ ...i, userId: this.userId, updatedAt: t })));
    changeBus.emit(this.name);
  }

  async update(id: string, patch: Partial<T>) {
    const existing = await this.get(id);
    if (!existing) return undefined;
    const next = { ...existing, ...patch, id, userId: this.userId, updatedAt: nowIso() };
    await this.table.put(next);
    changeBus.emit(this.name);
    return next;
  }

  async delete(id: string) {
    const existing = await this.get(id);
    if (!existing) return;
    await this.table.delete(id);
    changeBus.emit(this.name);
  }

  async list(opts?: ListOptions<T>) {
    const all = await this.table.where("userId").equals(this.userId).toArray();
    return applyListOptions(all, opts);
  }

  async count(where?: Partial<T>) {
    const all = await this.table.where("userId").equals(this.userId).toArray();
    return all.filter((i) => matchesWhere(i, where)).length;
  }

  async clear() {
    const ids = (await this.table.where("userId").equals(this.userId).toArray()).map((i) => i.id);
    await this.table.bulkDelete(ids);
    changeBus.emit(this.name);
  }
}

export class LocalDatabase implements StudyDatabase {
  readonly mode = "local" as const;
  private dexie: StudyDexie;
  private stores = new Map<string, Store<Entity>>();

  constructor(
    readonly userId: string,
    dbName = DB_NAME,
  ) {
    this.dexie = new StudyDexie(dbName);
  }

  store<K extends CollectionName>(name: K): Store<CollectionMap[K]> {
    let s = this.stores.get(name);
    if (!s) {
      s = new LocalStore<Entity>(this.dexie, name, this.userId);
      this.stores.set(name, s);
    }
    return s as unknown as Store<CollectionMap[K]>;
  }

  async exportAll() {
    const out: Record<string, unknown[]> = {};
    for (const c of COLLECTIONS) out[c] = await this.store(c).list();
    return out;
  }

  async importAll(data: Record<string, unknown[]>) {
    for (const c of COLLECTIONS) {
      const rows = (data[c] ?? []) as Entity[];
      if (rows.length) await this.store(c).putMany(rows as never);
    }
  }

  async wipe() {
    for (const c of COLLECTIONS) await this.store(c).clear();
  }
}
