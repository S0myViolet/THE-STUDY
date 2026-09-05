"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useStudyQuery } from "@/lib/persistence/provider";
import type { GeneratedContent, RhetoricEntry, RhetoricMode, RhetoricPrompt } from "@/lib/domain/types";
import { RHETORIC_PROMPTS } from "@/content/rhetoric";
import { I } from "@/components/ui/icons";
import { useSessionItem } from "@/lib/services/session-context";
import { isMode } from "@/lib/rhetoric/modes";
import type { StoredFeedback } from "@/lib/rhetoric/evaluate";
import { cx } from "@/lib/util/format";

/* ------------------------------------------------------------------ */
/* Prompts: seeded plus generated                                       */
/* ------------------------------------------------------------------ */

function looksLikePrompt(p: unknown): p is RhetoricPrompt {
  if (!p || typeof p !== "object") return false;
  const x = p as Partial<RhetoricPrompt>;
  return typeof x.id === "string" && typeof x.title === "string" && typeof x.prompt === "string" && isMode(x.mode) && Array.isArray(x.rubric) && Array.isArray(x.subskills);
}

export function mergePrompts(generated: GeneratedContent[] | undefined): RhetoricPrompt[] {
  const seen = new Set(RHETORIC_PROMPTS.map((p) => p.id));
  const extra: RhetoricPrompt[] = [];
  for (const g of generated ?? []) {
    if (g.kind !== "rhetoric") continue;
    const p = g.payload;
    if (!looksLikePrompt(p) || seen.has(p.id)) continue;
    seen.add(p.id);
    extra.push({ ...p, origin: "generated" });
  }
  return [...RHETORIC_PROMPTS, ...extra];
}

export function usePrompts(): { prompts: RhetoricPrompt[]; loading: boolean } {
  const generated = useStudyQuery((db) => db.store("generated_content").list({ where: { kind: "rhetoric" }, orderBy: "createdAt", desc: true }), ["generated_content"]);
  const prompts = useMemo(() => mergePrompts(generated.data), [generated.data]);
  return { prompts, loading: generated.loading };
}

export function promptsFor(prompts: RhetoricPrompt[], mode: RhetoricMode): RhetoricPrompt[] {
  return prompts.filter((p) => p.mode === mode);
}

export function useEntries(): { entries: RhetoricEntry[]; loading: boolean } {
  const q = useStudyQuery((db) => db.store("rhetoric_entries").list({ orderBy: "createdAt", desc: true }), ["rhetoric_entries"]);
  return { entries: q.data ?? [], loading: q.loading };
}

export function readFeedback(entry: RhetoricEntry): StoredFeedback | undefined {
  return entry.feedback as StoredFeedback | undefined;
}

/* ------------------------------------------------------------------ */
/* Small pieces                                                         */
/* ------------------------------------------------------------------ */

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-[12px] text-ink-3 hover:text-ink inline-flex items-center gap-1.5">
      <I.ArrowLeft size={12} /> {label}
    </Link>
  );
}

export function SessionMark() {
  const { inSession } = useSessionItem();
  if (!inSession) return null;
  return (
    <span className="mark">
      <span className="mark-dot" /> Today&apos;s session
    </span>
  );
}

export function TopBar({ href, label }: { href: string; label: string }) {
  return (
    <div className="flex items-center justify-between gap-4 mb-5">
      <BackLink href={href} label={label} />
      <SessionMark />
    </div>
  );
}

/** A score as a small numeral with its context, never a lone percentage. */
export function ScoreMark({ score, ai, className }: { score: number; ai?: boolean; className?: string }) {
  return (
    <span className={cx("inline-flex items-baseline gap-1.5", className)}>
      <span className="numeral text-[15px] text-ink">{Math.round(score * 100)}</span>
      <span className="text-[11px] text-ink-4">{ai ? "· model" : "· deterministic"}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Hedge sparkline: one series, ink on paper                            */
/* ------------------------------------------------------------------ */

export function Sparkline({ values, label, className }: { values: number[]; label: string; className?: string }) {
  const W = 160;
  const H = 36;
  const padX = 4;
  const padY = 5;
  const n = values.length;
  const max = Math.max(1, ...values);
  const x = (i: number) => (n <= 1 ? W / 2 : padX + (i / (n - 1)) * (W - padX * 2));
  const y = (v: number) => H - padY - (v / max) * (H - padY * 2);
  const d = values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const last = n ? values[n - 1] : 0;
  const summary = values.join(", ");
  if (!n) return null;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cx("w-full h-auto max-w-[160px]", className)} role="img" aria-label={`${label}: ${summary}`}>
      <title>{`${label}: ${summary}`}</title>
      <line x1={padX} y1={H - padY} x2={W - padX} y2={H - padY} stroke="var(--line)" strokeWidth={1} />
      {n > 1 ? <path d={d} fill="none" stroke="var(--ink)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" /> : null}
      {values.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r={i === n - 1 ? 4 : 3} fill={i === n - 1 ? "var(--ink)" : "var(--paper)"} stroke="var(--ink)" strokeWidth={i === n - 1 ? 0 : 1.5}>
          <title>{`Entry ${i + 1}: ${v}`}</title>
        </circle>
      ))}
      <text x={W - padX} y={y(last) - 7} textAnchor="end" fontSize={9} fill="var(--ink-3)" fontFamily="var(--font-mono)">
        {last}
      </text>
    </svg>
  );
}
