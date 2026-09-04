import type { Entity } from "@/lib/domain/types";
import type { CollectionMap, CollectionName } from "./collections";

export interface ListOptions<T> {
  where?: Partial<T>;
  /** Predicate filter applied after `where` */
  filter?: (item: T) => boolean;
  orderBy?: keyof T & string;
  desc?: boolean;
  limit?: number;
  offset?: number;
}

export interface Store<T extends Entity> {
  get(id: string): Promise<T | undefined>;
  put(item: T): Promise<T>;
  putMany(items: T[]): Promise<void>;
  update(id: string, patch: Partial<T>): Promise<T | undefined>;
  delete(id: string): Promise<void>;
  list(opts?: ListOptions<T>): Promise<T[]>;
  count(where?: Partial<T>): Promise<number>;
  clear(): Promise<void>;
}

export type PersistenceMode = "local" | "cloud";

export interface StudyDatabase {
  readonly mode: PersistenceMode;
  readonly userId: string;
  store<K extends CollectionName>(name: K): Store<CollectionMap[K]>;
  /** Export everything for backup / inspection */
  exportAll(): Promise<Record<string, unknown[]>>;
  importAll(data: Record<string, unknown[]>): Promise<void>;
  /** Destroy all data for this user (local: the whole DB) */
  wipe(): Promise<void>;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function newId(prefix = "id"): string {
  const rnd =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 16)
      : Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
  return `${prefix}_${rnd}`;
}

/** Build an entity skeleton for a user. */
export function stamp<T extends Entity>(userId: string, prefix: string, body: Omit<T, keyof Entity>): T {
  const t = nowIso();
  return { id: newId(prefix), userId, createdAt: t, updatedAt: t, ...(body as object) } as T;
}

export function matchesWhere<T>(item: T, where?: Partial<T>): boolean {
  if (!where) return true;
  for (const k of Object.keys(where) as (keyof T)[]) {
    if (item[k] !== where[k]) return false;
  }
  return true;
}

export function applyListOptions<T extends Entity>(items: T[], opts?: ListOptions<T>): T[] {
  let out = items;
  if (opts?.where) out = out.filter((i) => matchesWhere(i, opts.where));
  if (opts?.filter) out = out.filter(opts.filter);
  if (opts?.orderBy) {
    const key = opts.orderBy;
    const dir = opts.desc ? -1 : 1;
    out = [...out].sort((a, b) => {
      const av = a[key] as unknown as string | number;
      const bv = b[key] as unknown as string | number;
      if (av === bv) return 0;
      if (av === undefined || av === null) return 1;
      if (bv === undefined || bv === null) return -1;
      return av < bv ? -dir : dir;
    });
  }
  if (opts?.offset) out = out.slice(opts.offset);
  if (opts?.limit !== undefined) out = out.slice(0, opts.limit);
  return out;
}
