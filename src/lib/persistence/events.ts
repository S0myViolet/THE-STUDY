import type { CollectionName } from "./collections";

type Listener = (collection: CollectionName) => void;

/**
 * A tiny change bus. Every write through a Store emits its collection name;
 * `useStudyQuery` re-runs queries subscribed to that collection.
 */
class ChangeBus {
  private listeners = new Set<Listener>();
  private pending = new Set<CollectionName>();
  private scheduled = false;

  emit(collection: CollectionName) {
    this.pending.add(collection);
    if (this.scheduled) return;
    this.scheduled = true;
    const flush = () => {
      this.scheduled = false;
      const batch = [...this.pending];
      this.pending.clear();
      for (const c of batch) for (const l of this.listeners) l(c);
    };
    if (typeof queueMicrotask === "function") queueMicrotask(flush);
    else setTimeout(flush, 0);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const changeBus = new ChangeBus();
