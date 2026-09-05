import type { Entity } from "@/lib/domain/types";
import type { CollectionMap, CollectionName } from "./collections";
import type { StudyDatabase } from "./store";

const pending = new Map<string, Promise<Entity>>();

/**
 * Find the newest record matching `where`, or create one. Concurrent callers
 * with the same key share one promise, so a component whose mount effect runs
 * twice (React development mode, fast remounts) never creates duplicates.
 */
export function ensureOne<K extends CollectionName>(
  db: StudyDatabase,
  collection: K,
  where: Partial<CollectionMap[K]>,
  create: () => CollectionMap[K],
): Promise<CollectionMap[K]> {
  const key = `${db.userId}:${collection}:${JSON.stringify(where)}`;
  const inflight = pending.get(key);
  if (inflight) return inflight as Promise<CollectionMap[K]>;
  const p = (async () => {
    const existing = (await db.store(collection).list({ where, orderBy: "createdAt", desc: true, limit: 1 }))[0];
    if (existing) return existing;
    const entity = create();
    await db.store(collection).put(entity);
    return entity;
  })().finally(() => {
    pending.delete(key);
  });
  pending.set(key, p as Promise<Entity>);
  return p;
}
