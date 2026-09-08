"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStudy } from "@/lib/persistence/provider";
import { stamp } from "@/lib/persistence/store";
import type { ObservationAttempt, ObservationMode, PressureMode } from "@/lib/domain/types";
import type { SubskillId, Difficulty } from "@/lib/domain/faculties";
import type { ErrorType } from "@/lib/domain/errors";
import { recordError, recordEvidence } from "@/lib/services/evidence";
import { detectRedThreads } from "@/lib/adaptation/red-thread";
import { useSessionItem } from "@/lib/services/session-context";
import { Button, Countdown, Segmented, useCountdown } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { cx } from "@/lib/util/format";

export const MODE_META: Record<ObservationMode, { title: string; blurb: string; minutes: number }> = {
  glance: { title: "The Glance", blurb: "A scene for a few seconds. Then it is gone, and you are asked what was there.", minutes: 4 },
  room_scan: { title: "Room Scan", blurb: "Look, then write everything you noticed. Scored on what was real, not on how much you wrote.", minutes: 6 },
  change: { title: "Change Detection", blurb: "Scene A. Scene B. What moved, vanished, appeared or changed colour?", minutes: 5 },
  chronology: { title: "Chronology", blurb: "Several observations. Reconstruct the order in which things happened.", minutes: 4 },
  document: { title: "Document Scan", blurb: "A receipt, a schedule, a memo. Precise questions about numbers, names and times.", minutes: 4 },
  signal_noise: { title: "Signal vs Noise", blurb: "Many details. Only a few carry information. Find them.", minutes: 4 },
  missing: { title: "What Is Missing?", blurb: "A scene that implies something expected and absent. Negative evidence, handled carefully.", minutes: 4 },
  observation_or_story: { title: "Observation or Story?", blurb: "Did you see it, or did you conclude it? The distinction underneath everything else.", minutes: 4 },
};

export const MODES = Object.keys(MODE_META) as ObservationMode[];

export function pressureFactor(p: PressureMode): number {
  return p === "pressure" ? 0.6 : p === "none" ? 1.4 : 1;
}

/* ------------------------------------------------------------------ */
/* Recorder                                                            */
/* ------------------------------------------------------------------ */

export interface AttemptWrite {
  mode: ObservationMode;
  exerciseId: string;
  exposureSeconds?: number;
  pressure: PressureMode;
  coverage?: number;
  precision?: number;
  correct: number;
  total: number;
  falseClaims: number;
  latencyMs?: number;
  details: Record<string, unknown>;
  evidence: { subskill: SubskillId; score: number; format?: "mcq" | "free" | "numeric" | "sort" | "timed"; correct?: boolean; latencyMs?: number; note?: string }[];
  errors: { type: ErrorType; subskill: SubskillId; detail: string }[];
  difficulty: Difficulty;
  label: string;
}

/** Persists an attempt, its evidence and errors in one call. */
export function useObservationRecorder() {
  const { db, prefs } = useStudy();
  const { sessionId } = useSessionItem();
  const record = useCallback(
    async (w: AttemptWrite) => {
      const attempt = stamp<ObservationAttempt>(db.userId, "obs", {
        mode: w.mode,
        exerciseId: w.exerciseId,
        exposureSeconds: w.exposureSeconds,
        pressure: w.pressure,
        coverage: w.coverage,
        precision: w.precision,
        correct: w.correct,
        total: w.total,
        falseClaims: w.falseClaims,
        latencyMs: w.latencyMs,
        details: w.details,
        sessionId: sessionId ?? undefined,
      });
      await db.store("observation_attempts").put(attempt);
      const source = { kind: "observation" as const, refId: attempt.id, label: w.label };
      for (const e of w.evidence) {
        await recordEvidence(db, { subskill: e.subskill, score: e.score, difficulty: w.pressure === "pressure" ? (Math.min(8, w.difficulty + 1) as Difficulty) : w.difficulty, format: e.format ?? "free", source, correct: e.correct, latencyMs: e.latencyMs ?? w.latencyMs, sessionId: sessionId ?? undefined, note: e.note });
      }
      if (w.pressure === "pressure" && w.evidence.length) {
        const mean = w.evidence.reduce((s, e) => s + e.score, 0) / w.evidence.length;
        await recordEvidence(db, { subskill: "composure.pressure", score: mean, difficulty: w.difficulty, format: "timed", source, sessionId: sessionId ?? undefined });
      }
      for (const err of w.errors.slice(0, 6)) await recordError(db, { type: err.type, subskill: err.subskill, source, detail: err.detail, sessionId: sessionId ?? undefined });
      detectRedThreads(db).catch(() => {});
      return attempt;
    },
    [db, sessionId],
  );
  return { record, defaultPressure: prefs.pressureDefault };
}

/* ------------------------------------------------------------------ */
/* Layout pieces                                                       */
/* ------------------------------------------------------------------ */

export function ModeHeader({ mode, title, children }: { mode: ObservationMode; title?: string; children?: React.ReactNode }) {
  const { inSession } = useSessionItem();
  return (
    <header className="mb-6">
      <div className="flex items-center justify-between gap-4 mb-3">
        <Link href="/v1/observation" className="text-[12px] text-ink-3 hover:text-ink inline-flex items-center gap-1.5">
          <I.ArrowLeft size={12} /> Observation Room
        </Link>
        {inSession ? <span className="mark"><span className="mark-dot" /> Today&apos;s session</span> : null}
      </div>
      <div className="eyebrow eyebrow-wine">{MODE_META[mode].title}</div>
      <h1 className="display text-[30px] md:text-[36px] mt-1">{title ?? MODE_META[mode].title}</h1>
      {children}
    </header>
  );
}

export function PressureControl({ value, onChange }: { value: PressureMode; onChange: (p: PressureMode) => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="eyebrow">Pace</span>
      <Segmented value={value} onChange={onChange} label="Pressure mode" options={[{ value: "none", label: "No timer pressure" }, { value: "standard", label: "Standard" }, { value: "pressure", label: "Pressure" }]} />
    </div>
  );
}

/**
 * Intro → full-attention reveal with countdown → hidden.
 * Space closes early. On small screens the reveal takes the whole viewport.
 */
export function TimedReveal({
  seconds,
  children,
  intro,
  onHidden,
  label = "Show it",
  fullscreen = true,
}: {
  seconds: number;
  children: React.ReactNode;
  intro?: React.ReactNode;
  onHidden: () => void;
  label?: string;
  fullscreen?: boolean;
}) {
  const [running, setRunning] = useState(false);
  const [closed, setClosed] = useState(false);
  const left = useCountdown(seconds, running, () => setClosed(true));
  const onHiddenRef = useRef(onHidden);
  onHiddenRef.current = onHidden;
  useEffect(() => {
    if (!closed) return;
    const t = setTimeout(() => onHiddenRef.current(), 300);
    return () => clearTimeout(t);
  }, [closed]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && !(e.target instanceof HTMLTextAreaElement) && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        if (!running) setRunning(true);
        else if (!closed) setClosed(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, closed]);

  if (!running) {
    return (
      <div className="sheet p-6">
        {intro ?? (
          <p className="text-[14px] text-ink-2">
            You will see it for <span className="numeral text-ink">{seconds} seconds</span>. Then it disappears. Do not try to memorise; try to see.
          </p>
        )}
        <div className="mt-5 flex items-center gap-3">
          <Button size="lg" onClick={() => setRunning(true)}>{label}</Button>
          <span className="text-[12px] text-ink-3">Space starts and closes it.</span>
        </div>
      </div>
    );
  }
  return (
    <div className={cx(closed && "anim-close", fullscreen && "md:static fixed inset-0 z-40 bg-paper md:bg-transparent flex flex-col md:block")}>
      <div className="flex items-center justify-between mb-3 px-4 md:px-0 pt-3 md:pt-0">
        <span className="eyebrow">Notice</span>
        <Countdown seconds={left} total={seconds} />
      </div>
      <div className="flex-1 min-h-0 flex items-center px-2 md:px-0">
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Results                                                             */
/* ------------------------------------------------------------------ */

export function ResultPanel({
  coverage,
  precision,
  correct,
  total,
  falseClaims,
  children,
  onAgain,
  againLabel = "Another",
}: {
  coverage?: number;
  precision?: number;
  correct?: number;
  total?: number;
  falseClaims?: number;
  children?: React.ReactNode;
  onAgain?: () => void;
  againLabel?: string;
}) {
  const { finish, inSession } = useSessionItem();
  const router = useRouter();
  return (
    <div className="anim-place">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-ink pt-4">
        {coverage !== undefined ? <Metric label="Coverage" value={`${Math.round(coverage * 100)}%`} sub="of what mattered, noticed" /> : null}
        {precision !== undefined ? <Metric label="Precision" value={`${Math.round(precision * 100)}%`} sub="of what you reported, real" /> : null}
        {correct !== undefined && total !== undefined ? <Metric label="Correct" value={`${correct} / ${total}`} /> : null}
        {falseClaims !== undefined ? <Metric label="Invented" value={String(falseClaims)} sub={falseClaims === 0 ? "none" : "details that were not there"} tone={falseClaims ? "wine" : undefined} /> : null}
      </div>
      <div className="mt-6 space-y-6">{children}</div>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        {inSession ? (
          <Button size="lg" onClick={() => finish()}>Continue the session <I.ArrowRight size={14} /></Button>
        ) : (
          <>
            {onAgain ? <Button size="lg" onClick={onAgain}>{againLabel}</Button> : null}
            <Button variant="secondary" onClick={() => router.push("/v1/observation")}>Observation Room</Button>
          </>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "wine" }) {
  return (
    <div>
      <div className="eyebrow">{label}</div>
      <div className={cx("numeral text-[28px] mt-1 leading-none", tone === "wine" ? "text-wine" : "text-ink")}>{value}</div>
      {sub ? <div className="text-[12px] text-ink-3 mt-1">{sub}</div> : null}
    </div>
  );
}

export function ListBlock({ title, items, tone }: { title: string; items: string[]; tone?: "ok" | "wine" | "muted" }) {
  if (!items.length) return null;
  return (
    <section>
      <div className="eyebrow mb-2">{title}</div>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className={cx("text-[14px] pl-3 border-l", tone === "ok" ? "border-forest text-ink" : tone === "wine" ? "border-wine text-ink" : "border-line-2 text-ink-2")}>
            {it}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Deterministic pick from a list by an optional id or seed. */
export function usePick<T extends { id: string }>(items: T[], id: string | null, seedKey: string): T | undefined {
  return useMemo(() => {
    if (!items.length) return undefined;
    if (id) return items.find((i) => i.id === id) ?? items[0];
    let h = 0;
    for (const ch of seedKey) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return items[h % items.length];
  }, [items, id, seedKey]);
}

export function useStart() {
  const ref = useRef(performance.now());
  return { reset: () => (ref.current = performance.now()), elapsed: () => Math.round(performance.now() - ref.current) };
}
