"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import type { ConceptState, EvidenceConfidence } from "@/lib/v2/types";
import { SECTIONS, type SectionId } from "@/lib/nav";
import { I } from "./icons";
import { Trend, useCountdown } from "./primitives";
import { cx } from "@/lib/util/format";

/* ------------------------------------------------------------------ */
/* Concept state                                                        */
/* ------------------------------------------------------------------ */

export const STATE_META: Record<ConceptState, { label: string; note: string }> = {
  not_started: { label: "Not started", note: "No evidence yet." },
  exposed: { label: "Exposed", note: "Seen in a lesson or reading; nothing checked." },
  understood: { label: "Understood", note: "A checkpoint or explanation succeeded." },
  practicing: { label: "Practising", note: "Independent attempts are succeeding." },
  retained: { label: "Retained", note: "Recalled after at least a day." },
  applied: { label: "Applied", note: "Used in a transfer, project, application or exam." },
  durable: { label: "Durable", note: "Repeated delayed recall over a week or more." },
  fragile: { label: "Fragile", note: "Once retained, now slipping; a delayed retrieval failed or is overdue." },
};

/** A small typographic mark for a concept state. Tone comes from `.state-<state>` in globals.css. */
export function StateBadge({ state, className, title }: { state: ConceptState; className?: string; title?: string }) {
  const meta = STATE_META[state];
  return (
    <span className={cx("state", `state-${state}`, className)} data-state={state} title={title ?? meta.note}>
      <span className="state-dot" aria-hidden />
      {meta.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Evidence                                                             */
/* ------------------------------------------------------------------ */

export const CONFIDENCE_LABEL: Record<EvidenceConfidence, string> = { low: "low confidence", medium: "medium confidence", high: "high confidence" };

/**
 * A hairline bar for a 0..1 estimate with its sample size and evidence confidence.
 * When n is 0 the bar is empty and the label says so; never a number without its n.
 */
export function EvidenceMeter({ value, n, confidence, label, className }: { value: number; n: number; confidence?: EvidenceConfidence; label?: string; className?: string }) {
  const v = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  const none = n <= 0;
  return (
    <div className={cx("min-w-0", className)}>
      {label ? <div className="eyebrow mb-1">{label}</div> : null}
      <div className="flex items-center gap-3">
        <div className={cx("hairline-progress flex-1", confidence === "low" && "opacity-70")} role="progressbar" aria-valuenow={none ? 0 : Math.round(v * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? "Estimate"}>
          <span style={{ width: `${none ? 0 : v * 100}%` }} />
        </div>
        <span className="numeral text-[12px] text-ink-2 w-9 text-right">{none ? "—" : Math.round(v * 100)}</span>
      </div>
      <div className="mt-1 text-[11px] text-ink-3">{none ? "no evidence yet" : `n = ${n}${confidence ? ` · ${CONFIDENCE_LABEL[confidence]}` : ""}`}</div>
    </div>
  );
}

/** One concept in a list: title, state, estimate with n, trend, optional link. */
export function MasteryRow({
  title,
  state,
  estimate,
  n,
  confidence,
  trend,
  href,
  sub,
  aside,
  className,
}: {
  title: React.ReactNode;
  state: ConceptState;
  estimate: number;
  n: number;
  confidence?: EvidenceConfidence;
  trend?: "up" | "down" | "flat";
  href?: string;
  sub?: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
}) {
  const heading = <span className="serif text-[17px] text-ink leading-snug">{title}</span>;
  return (
    <div className={cx("grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_200px_auto] gap-x-6 gap-y-2 items-center py-3 border-t border-line", className)}>
      <div className="min-w-0">
        {href ? (
          <Link href={href} className="hover:underline underline-offset-4">
            {heading}
          </Link>
        ) : (
          heading
        )}
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <StateBadge state={state} />
          {trend ? <Trend trend={trend} /> : null}
          {sub ? <span className="text-[12px] text-ink-3">{sub}</span> : null}
        </div>
      </div>
      <EvidenceMeter value={estimate} n={n} confidence={confidence} />
      {aside ? <div className="shrink-0">{aside}</div> : <span className="hidden md:block" />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Confidence                                                           */
/* ------------------------------------------------------------------ */

/**
 * A stated confidence (0..1) as a mono numeral. When `correct` is known the tone
 * marks a calibration problem: wrong at 80 % or more, or right at 40 % or less.
 */
export function ConfidenceMark({ value, correct, className }: { value: number | null | undefined; correct?: boolean; className?: string }) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return <span className={cx("numeral text-[12px] text-ink-4", className)}>—</span>;
  }
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  const over = correct === false && value >= 0.8;
  const under = correct === true && value <= 0.4;
  const note = over ? "Confident and wrong" : under ? "Right but unsure" : undefined;
  return (
    <span className={cx("numeral text-[12px] inline-flex items-center gap-1.5", over ? "text-wine" : under ? "text-brass" : "text-ink-2", className)} title={note ? `${pct}% · ${note}` : `${pct}% confidence`}>
      {pct}%{note ? <span className="sr-only">{note}</span> : null}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Section mark                                                         */
/* ------------------------------------------------------------------ */

/** A small uppercase mark with a section's icon, for cross-references (an agenda row, a source of evidence). */
export function SectionMark({ section, className, link }: { section: SectionId; className?: string; link?: boolean }) {
  const s = SECTIONS.find((x) => x.id === section);
  if (!s) return null;
  const Icon = I[s.icon];
  const inner = (
    <>
      <Icon size={12} />
      {s.label}
    </>
  );
  const cls = cx("mark", className);
  return link ? (
    <Link href={s.href} className={cx(cls, "hover:text-ink")}>
      {inner}
    </Link>
  ) : (
    <span className={cls}>{inner}</span>
  );
}

/* ------------------------------------------------------------------ */
/* Sparkline                                                            */
/* ------------------------------------------------------------------ */

type Point = number | { estimate: number } | { value: number };

function toNumber(p: Point): number {
  if (typeof p === "number") return p;
  if ("estimate" in p) return p.estimate;
  return p.value;
}

/**
 * A small inline line for a history (mastery estimates, scores). Values are scaled
 * to the min/max of the series unless `domain` fixes it (e.g. [0, 1]).
 */
export function Sparkline({ values, width = 96, height = 24, domain, className, label }: { values: Point[]; width?: number; height?: number; domain?: [number, number]; className?: string; label?: string }) {
  const nums = useMemo(() => values.map(toNumber).filter((v) => Number.isFinite(v)), [values]);
  if (nums.length < 2) {
    return <span className={cx("inline-block align-middle text-[11px] text-ink-4", className)}>{nums.length === 1 ? "one point" : "no history"}</span>;
  }
  const lo = domain ? domain[0] : Math.min(...nums);
  const hi = domain ? domain[1] : Math.max(...nums);
  const span = hi - lo || 1;
  const pad = 2;
  const pts = nums.map((v, i) => {
    const x = pad + (i / (nums.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (v - lo) / span) * (height - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const last = pts[pts.length - 1].split(",").map(Number);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={cx("inline-block align-middle overflow-visible", className)} role="img" aria-label={label ?? `${nums.length} points, latest ${Math.round(nums[nums.length - 1] * 100) / 100}`}>
      <polyline points={pts.join(" ")} fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r={1.75} fill="currentColor" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Timer                                                                */
/* ------------------------------------------------------------------ */

export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m >= 60 ? `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}:${String(r).padStart(2, "0")}` : `${m}:${String(r).padStart(2, "0")}`;
}

/**
 * A countdown built on `useCountdown`: mm:ss in mono with a hairline. Quiet by
 * design; the last tenth of the time is marked in wine, nothing flashes.
 */
export function Timer({ seconds, running, onDone, label = "Time remaining", showBar = true, className }: { seconds: number; running: boolean; onDone?: () => void; label?: string; showBar?: boolean; className?: string }) {
  const left = useCountdown(seconds, running, onDone);
  const ratio = seconds > 0 ? Math.max(0, Math.min(1, left / seconds)) : 0;
  const late = seconds > 0 && ratio <= 0.1 && left > 0;
  return (
    <div className={cx("flex items-center gap-3", className)} role="timer" aria-live="off" aria-label={label}>
      <span className={cx("numeral text-[13px] tabular-nums", late ? "text-wine" : "text-ink-2")}>{formatClock(left)}</span>
      {showBar ? (
        <div className="hairline-progress w-32">
          <span style={{ width: `${ratio * 100}%`, background: late ? "var(--wine)" : undefined }} />
        </div>
      ) : null}
    </div>
  );
}
