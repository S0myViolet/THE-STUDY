import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Entity } from "@/lib/domain/types";
import { COLLECTIONS, type CollectionMap, type CollectionName } from "./collections";
import { applyListOptions, nowIso, type ListOptions, type Store, type StudyDatabase } from "./store";
import { changeBus } from "./events";

/**
 * Cloud adapter. Tables share the collection name; columns are snake_case
 * versions of entity fields (see supabase/migrations/0001_init.sql).
 * Row-level security restricts every table to `auth.uid() = user_id`.
 */

export function supabaseConfig(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

let client: SupabaseClient | null = null;
export function getSupabaseClient(): SupabaseClient | null {
  const cfg = supabaseConfig();
  if (!cfg) return null;
  if (!client) client = createClient(cfg.url, cfg.anonKey, { auth: { persistSession: true } });
  return client;
}

const camelToSnake = (s: string) => s.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase());
const snakeToCamel = (s: string) => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

export function toRow(entity: Record<string, unknown>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(entity)) row[camelToSnake(k)] = v === undefined ? null : v;
  return row;
}

export function fromRow<T>(row: Record<string, unknown>): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) if (v !== null) out[snakeToCamel(k)] = v;
  return out as T;
}

class CloudStore<T extends Entity> implements Store<T> {
  constructor(
    private client: SupabaseClient,
    private name: CollectionName,
    private userId: string,
  ) {}

  private q() {
    return this.client.from(this.name);
  }

  async get(id: string) {
    const { data, error } = await this.q().select("*").eq("id", id).eq("user_id", this.userId).maybeSingle();
    if (error) throw error;
    return data ? fromRow<T>(data) : undefined;
  }

  async put(item: T) {
    const next = { ...item, userId: this.userId, updatedAt: nowIso() };
    const { error } = await this.q().upsert(toRow(next as unknown as Record<string, unknown>));
    if (error) throw error;
    changeBus.emit(this.name);
    return next;
  }

  async putMany(items: T[]) {
    if (!items.length) return;
    const t = nowIso();
    const rows = items.map((i) => toRow({ ...i, userId: this.userId, updatedAt: t } as unknown as Record<string, unknown>));
    const { error } = await this.q().upsert(rows);
    if (error) throw error;
    changeBus.emit(this.name);
  }

  async update(id: string, patch: Partial<T>) {
    const existing = await this.get(id);
    if (!existing) return undefined;
    return this.put({ ...existing, ...patch, id });
  }

  async delete(id: string) {
    const { error } = await this.q().delete().eq("id", id).eq("user_id", this.userId);
    if (error) throw error;
    changeBus.emit(this.name);
  }

  async list(opts?: ListOptions<T>) {
    let query = this.q().select("*").eq("user_id", this.userId);
    if (opts?.where) {
      for (const [k, v] of Object.entries(opts.where)) {
        if (v === undefined) continue;
        query = query.eq(camelToSnake(k), v as never);
      }
    }
    if (opts?.orderBy) query = query.order(camelToSnake(opts.orderBy), { ascending: !opts.desc });
    if (opts?.limit !== undefined && !opts.filter) query = query.limit(opts.limit + (opts.offset ?? 0));
    const { data, error } = await query;
    if (error) throw error;
    const rows = (data ?? []).map((r) => fromRow<T>(r));
    // Apply predicate/offset/limit consistently in memory.
    return applyListOptions(rows, { filter: opts?.filter, offset: opts?.offset, limit: opts?.limit });
  }

  async count(where?: Partial<T>) {
    let query = this.q().select("id", { count: "exact", head: true }).eq("user_id", this.userId);
    if (where) for (const [k, v] of Object.entries(where)) query = query.eq(camelToSnake(k), v as never);
    const { count, error } = await query;
    if (error) throw error;
    return count ?? 0;
  }

  async clear() {
    const { error } = await this.q().delete().eq("user_id", this.userId);
    if (error) throw error;
    changeBus.emit(this.name);
  }
}

export class CloudDatabase implements StudyDatabase {
  readonly mode = "cloud" as const;
  private stores = new Map<string, Store<Entity>>();
  constructor(
    private client: SupabaseClient,
    readonly userId: string,
  ) {}

  store<K extends CollectionName>(name: K): Store<CollectionMap[K]> {
    let s = this.stores.get(name);
    if (!s) {
      s = new CloudStore<Entity>(this.client, name, this.userId);
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
