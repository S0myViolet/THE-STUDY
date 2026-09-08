"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { FieldAssignment, FieldReport } from "@/lib/domain/types";
import { FIELD_ASSIGNMENTS } from "@/content/fieldwork";
import { kindLabel } from "@/lib/fieldwork/assignments";
import { responseFor } from "@/lib/fieldwork/score";
import { Empty } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { cx } from "@/lib/util/format";

export function assignmentById(id: string | undefined): FieldAssignment | undefined {
  return id ? FIELD_ASSIGNMENTS.find((a) => a.id === id) : undefined;
}

/** `?session=…&item=…` when the room was opened from the daily session, else "". */
export function useSessionSuffix(): string {
  const params = useSearchParams();
  const s = params.get("session");
  const i = params.get("item");
  return s && i ? `?session=${encodeURIComponent(s)}&item=${encodeURIComponent(i)}` : "";
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-[12px] text-ink-3 hover:text-ink inline-flex items-center gap-1.5">
      <I.ArrowLeft size={12} /> {children}
    </Link>
  );
}

export function SessionMark() {
  return (
    <span className="mark">
      <span className="mark-dot" /> Today&apos;s session
    </span>
  );
}

export function TopBar({ back, backLabel, inSession }: { back: string; backLabel: string; inSession: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 mb-5">
      <BackLink href={back}>{backLabel}</BackLink>
      {inSession ? <SessionMark /> : null}
    </div>
  );
}

export function NotFound({ what = "assignment" }: { what?: string }) {
  return (
    <div className="page">
      <Empty
        title={`No such ${what}.`}
        action={
          <Link href="/v1/fieldwork" className="btn btn-secondary">
            Fieldwork
          </Link>
        }
      />
    </div>
  );
}

/** "today", "yesterday", "3 days ago" for a past date. */
export function daysSince(iso: string, now = new Date()): string {
  const days = Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 86400000));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

export function answeredCount(a: FieldAssignment, r: FieldReport): number {
  return a.reportPrompts.filter((_, i) => responseFor(r.responses, i).trim().length > 0).length;
}

export function KindLine({ a, extra, className }: { a: FieldAssignment; extra?: React.ReactNode; className?: string }) {
  return (
    <div className={cx("eyebrow", className)}>
      {kindLabel(a.kind)} · about {a.estimatedMinutes} minutes
      {extra ? <> · {extra}</> : null}
    </div>
  );
}

export function pad(n: number): string {
  return String(n).padStart(2, "0");
}
