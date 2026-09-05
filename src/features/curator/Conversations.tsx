"use client";

import React from "react";
import Link from "next/link";
import { useStudyQuery } from "@/lib/persistence/provider";
import { modeMeta } from "@/lib/curator/modes";
import { relativeDays, cx } from "@/lib/util/format";

export function Conversations({ currentId, limit = 8, className }: { currentId?: string; limit?: number; className?: string }) {
  const q = useStudyQuery((db) => db.store("curator_conversations").list({ orderBy: "updatedAt", desc: true, limit }), ["curator_conversations"]);
  const rows = (q.data ?? []).filter((c) => c.messages.length);
  if (!rows.length) return null;
  return (
    <section className={className} aria-label="Previous consultations">
      <div className="flex items-baseline justify-between mb-2">
        <span className="eyebrow">Consultations</span>
        {currentId ? <Link href="/curator" className="text-[11px] text-ink-3 hover:text-ink">New</Link> : null}
      </div>
      <ul className="divide-y divide-line border-t border-line">
        {rows.map((c) => {
          const active = c.id === currentId;
          return (
            <li key={c.id}>
              <Link href={`/curator/${c.id}`} className={cx("block py-2 group", active ? "text-ink" : "text-ink-2 hover:text-ink")} aria-current={active ? "page" : undefined}>
                <span className="block text-[13px] leading-snug serif truncate">{c.title}</span>
                <span className="block text-[11px] text-ink-4 mt-0.5">{modeMeta(c.mode).label} · {relativeDays(c.updatedAt)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
