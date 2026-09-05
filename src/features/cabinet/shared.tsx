"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useStudyQuery } from "@/lib/persistence/provider";
import type { Curiosity, CuriosityView } from "@/lib/domain/types";
import { I } from "@/components/ui/icons";
import { cx } from "@/lib/util/format";
import { mergeCuriosities, seenState, viewMap, type SeenState } from "@/lib/cabinet/curiosities";

/* ------------------------------------------------------------------ */
/* Data hook                                                            */
/* ------------------------------------------------------------------ */

export interface CabinetData {
  items: Curiosity[];
  byId: Map<string, Curiosity>;
  views: Map<string, CuriosityView>;
  seen: number;
  connected: number;
  loading: boolean;
}

/** Seeded + generated curiosities and the user's views, live against the store. */
export function useCabinet(): CabinetData {
  const generated = useStudyQuery((db) => db.store("generated_content").list({ where: { kind: "curiosity" } }), ["generated_content"]);
  const views = useStudyQuery((db) => db.store("curiosity_views").list(), ["curiosity_views"]);
  const items = useMemo(() => mergeCuriosities(generated.data), [generated.data]);
  const byId = useMemo(() => new Map(items.map((c) => [c.id, c])), [items]);
  const vmap = useMemo(() => viewMap(views.data), [views.data]);
  const counts = useMemo(() => {
    let seen = 0;
    let connected = 0;
    for (const c of items) {
      const s = seenState(vmap, c.id);
      if (s !== "unseen") seen++;
      if (s === "connected") connected++;
    }
    return { seen, connected };
  }, [items, vmap]);
  return { items, byId, views: vmap, seen: counts.seen, connected: counts.connected, loading: generated.loading || views.loading };
}

/* ------------------------------------------------------------------ */
/* Marks                                                                */
/* ------------------------------------------------------------------ */

export const SEEN_LABEL: Record<SeenState, string> = { unseen: "Unseen", seen: "Seen", connected: "Connected" };

/** One small dot: hollow when unseen, ink when seen, brass once you have connected it to something. */
export function SeenMark({ state, className }: { state: SeenState; className?: string }) {
  return (
    <span
      role="img"
      aria-label={SEEN_LABEL[state]}
      title={SEEN_LABEL[state]}
      className={cx("inline-block w-[7px] h-[7px] rounded-full shrink-0", state === "unseen" ? "border border-line-2" : state === "seen" ? "bg-ink-3" : "bg-brass", className)}
    />
  );
}

export function SeenLegend({ className }: { className?: string }) {
  return (
    <div className={cx("flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-4", className)} aria-label="Marks">
      <span className="inline-flex items-center gap-1.5"><SeenMark state="unseen" /> unseen</span>
      <span className="inline-flex items-center gap-1.5"><SeenMark state="seen" /> seen</span>
      <span className="inline-flex items-center gap-1.5"><SeenMark state="connected" /> connected</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Navigation                                                           */
/* ------------------------------------------------------------------ */

export function BackToCabinet({ right }: { right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <Link href="/cabinet" className="text-[12px] text-ink-3 hover:text-ink inline-flex items-center gap-1.5">
        <I.ArrowLeft size={12} /> The Cabinet
      </Link>
      {right}
    </div>
  );
}
