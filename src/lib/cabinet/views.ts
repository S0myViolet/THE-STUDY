/**
 * Persistence helpers for curiosity views: one row per curiosity per user,
 * created on first open and touched on every later open.
 */
import type { CuriosityView } from "@/lib/domain/types";
import type { StudyDatabase } from "@/lib/persistence/store";
import { stamp } from "@/lib/persistence/store";

const inflight = new Map<string, Promise<CuriosityView>>();

/** Upsert the view for a curiosity. Deduplicates concurrent calls (React re-runs effects in development). */
export function markSeen(db: StudyDatabase, curiosityId: string): Promise<CuriosityView> {
  const key = `${db.userId}:${curiosityId}`;
  const running = inflight.get(key);
  if (running) return running;
  const p = (async () => {
    const store = db.store("curiosity_views");
    const rows = await store.list({ where: { curiosityId } as Partial<CuriosityView> });
    if (rows[0]) return (await store.update(rows[0].id, {})) ?? rows[0];
    const row = stamp<CuriosityView>(db.userId, "cview", { curiosityId, connectedTo: [] });
    await store.put(row);
    return row;
  })().finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

/** Patch the view for a curiosity, creating it first when it does not exist yet. */
export async function updateView(db: StudyDatabase, curiosityId: string, patch: Partial<Pick<CuriosityView, "connectedTo" | "note">>): Promise<CuriosityView> {
  const current = await markSeen(db, curiosityId);
  const next = await db.store("curiosity_views").update(current.id, patch);
  return next ?? { ...current, ...patch };
}
