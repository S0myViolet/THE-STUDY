"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStudyQuery } from "@/lib/persistence/provider";
import type { ArchiveConnection, ArchiveEntry, ArchiveProgress, Entity } from "@/lib/domain/types";
import { I } from "@/components/ui/icons";
import { cx } from "@/lib/util/format";
import { allEdges, mergeEntries, progressMap, statusOf, type Edge, type Status } from "@/lib/archive/entries";

/* ------------------------------------------------------------------ */
/* Data hook                                                            */
/* ------------------------------------------------------------------ */

export interface ArchiveData {
  entries: ArchiveEntry[];
  byId: Map<string, ArchiveEntry>;
  progress: Map<string, ArchiveProgress>;
  edges: Edge[];
  userConnections: (ArchiveConnection & Entity)[];
  loading: boolean;
}

/** Seed + generated entries, progress and every connection, live against the store. */
export function useArchive(): ArchiveData {
  const generated = useStudyQuery((db) => db.store("generated_content").list({ where: { kind: "archive" } }), ["generated_content"]);
  const progress = useStudyQuery((db) => db.store("archive_progress").list(), ["archive_progress"]);
  const userConn = useStudyQuery((db) => db.store("archive_user_connections").list({ orderBy: "createdAt" }), ["archive_user_connections"]);
  const entries = useMemo(() => mergeEntries(generated.data), [generated.data]);
  const byId = useMemo(() => new Map(entries.map((e) => [e.id, e])), [entries]);
  const pmap = useMemo(() => progressMap(progress.data), [progress.data]);
  const edges = useMemo(() => allEdges(userConn.data, new Set(byId.keys())), [userConn.data, byId]);
  return {
    entries,
    byId,
    progress: pmap,
    edges,
    userConnections: userConn.data ?? [],
    loading: generated.loading || progress.loading || userConn.loading,
  };
}

/* ------------------------------------------------------------------ */
/* Marks                                                                */
/* ------------------------------------------------------------------ */

export const STATUS_LABEL: Record<Status, string> = { unread: "Unread", read: "Read", understood: "Understood", retained: "Retained" };

/** Three small ticks: read · understood · retained. Quiet, typographic. */
export function StatusMark({ status, className }: { status: Status; className?: string }) {
  const steps: Status[] = ["read", "understood", "retained"];
  const rank = ["unread", "read", "understood", "retained"].indexOf(status);
  return (
    <span className={cx("inline-flex items-center gap-1", className)} aria-label={STATUS_LABEL[status]} title={STATUS_LABEL[status]}>
      {steps.map((s, i) => (
        <span key={s} className={cx("inline-block w-1 h-1 rounded-full", rank > i ? (s === "retained" ? "bg-brass" : s === "understood" ? "bg-forest" : "bg-ink-2") : "bg-line")} />
      ))}
    </span>
  );
}

export function statusFor(data: ArchiveData, id: string): Status {
  return statusOf(data.progress, id);
}

/* ------------------------------------------------------------------ */
/* Navigation                                                           */
/* ------------------------------------------------------------------ */

export const ARCHIVE_VIEWS = [
  { href: "/v1/archive/graph", label: "Graph", icon: "Graph" as const },
  { href: "/v1/archive/world", label: "World", icon: "Map" as const },
  { href: "/v1/archive/timeline", label: "Timeline", icon: "Timeline" as const },
  { href: "/v1/archive/reading", label: "Bookshelf", icon: "Book" as const },
];

export function ArchiveHeader({ title, eyebrow = "The Archive", lede, aside, back = "/v1/archive", backLabel = "The Archive", children }: { title: React.ReactNode; eyebrow?: React.ReactNode; lede?: React.ReactNode; aside?: React.ReactNode; back?: string; backLabel?: string; children?: React.ReactNode }) {
  return (
    <header className="mb-8">
      <div className="flex items-center justify-between gap-4 mb-4">
        <Link href={back} className="text-[12px] text-ink-3 hover:text-ink inline-flex items-center gap-1.5">
          <I.ArrowLeft size={12} /> {backLabel}
        </Link>
        <ViewLinks />
      </div>
      <div className="flex items-end justify-between gap-6">
        <div className="min-w-0">
          <div className="eyebrow eyebrow-wine">{eyebrow}</div>
          <h1 className="display text-[32px] md:text-[38px] mt-1 text-ink">{title}</h1>
          {lede ? <p className="mt-2 text-ink-2 max-w-[62ch] text-[15px]">{lede}</p> : null}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
      {children}
    </header>
  );
}

export function ViewLinks({ className }: { className?: string }) {
  const path = usePathname();
  return (
    <nav className={cx("hidden md:flex items-center gap-4 text-[12px]", className)} aria-label="Archive views">
      {ARCHIVE_VIEWS.map((v) => {
        const Icon = I[v.icon];
        const current = path?.startsWith(v.href);
        return (
          <Link key={v.href} href={v.href} className={cx("inline-flex items-center gap-1.5 hover:text-ink", current ? "text-ink" : "text-ink-3")} aria-current={current ? "page" : undefined}>
            <Icon size={13} /> {v.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Row used in lists throughout the room. */
export function EntryRow({ entry, status, meta, compact }: { entry: ArchiveEntry; status: Status; meta?: React.ReactNode; compact?: boolean }) {
  return (
    <Link href={`/v1/archive/${entry.id}`} className={cx("group flex items-start justify-between gap-4 -mx-2 px-2 rounded-sm hover:bg-paper-3", compact ? "py-2" : "py-3")}>
      <span className="min-w-0">
        <span className="eyebrow block">{meta ?? entry.domain}</span>
        <span className={cx("serif text-ink group-hover:text-ink-2 block leading-snug", compact ? "text-[17px]" : "text-[20px]")}>{entry.title}</span>
        {!compact && entry.subtitle ? <span className="block text-[13px] text-ink-3 mt-0.5 truncate">{entry.subtitle}</span> : null}
      </span>
      <StatusMark status={status} className="mt-2 shrink-0" />
    </Link>
  );
}

export function ModelNote({ configured, children }: { configured: boolean; children?: React.ReactNode }) {
  if (configured) return null;
  return <p className="text-[12px] text-ink-4">{children ?? "Deterministic review — connect a model in Settings for a deeper read."}</p>;
}
