"use client";

import React, { useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStudy } from "@/lib/persistence/provider";
import { stamp } from "@/lib/persistence/store";
import type { InferenceAttempt, InferenceMode } from "@/lib/domain/types";
import type { Difficulty, FacultyId, SubskillId } from "@/lib/domain/faculties";
import type { ErrorType } from "@/lib/domain/errors";
import { recordConfidence, recordError, recordEvidence } from "@/lib/services/evidence";
import { detectRedThreads } from "@/lib/adaptation/red-thread";
import { useSessionItem } from "@/lib/services/session-context";
import { Button } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { keyPointCoverage } from "@/lib/scoring/text";
import { cx } from "@/lib/util/format";

export const MODE_META: Record<InferenceMode, { title: string; blurb: string; minutes: number }> = {
  three_stories: { title: "Three Stories", blurb: "Evidence, then three plausible explanations. The goal is to fight the first one.", minutes: 5 },
  best_explanation: { title: "Best Explanation", blurb: "Score competing hypotheses on evidence explained, assumptions, contradictions and plausibility.", minutes: 6 },
  missing_variable: { title: "Missing Variable", blurb: "A correlation. What third factor could explain it?", minutes: 4 },
  base_rate: { title: "Base Rate", blurb: "Vivid specific evidence against what is usually true. Which wins, and by how much?", minutes: 5 },
  counterfactual: { title: "Counterfactual", blurb: "What would you expect to observe if your theory were false?", minutes: 4 },
  disconfirm: { title: "Disconfirm Me", blurb: "State a hypothesis. Then name the evidence that would weaken it.", minutes: 5 },
  anomaly: { title: "The Anomaly", blurb: "Most evidence points one way. One clue does not. What could it mean?", minutes: 4 },
  how_sure: { title: "How Sure?", blurb: "Not yes or no. A number. Then find out whether your numbers behave like numbers.", minutes: 5 },
  information_value: { title: "Information Value", blurb: "Five unknowns, one question. Which reduces uncertainty most?", minutes: 4 },
  ladder: { title: "Inference Ladder", blurb: "Observed, inferred, because, alternatives, confidence, what would change my mind.", minutes: 8 },
  fast_slow: { title: "Fast, then Slow", blurb: "Twelve seconds of intuition, then two minutes of analysis. Did thinking improve the answer?", minutes: 5 },
};

export const MODES = Object.keys(MODE_META) as InferenceMode[];

export interface InferenceWrite {
  mode: InferenceMode;
  challengeId: string;
  response: Record<string, unknown>;
  score: number;
  confidence?: number;
  correct?: boolean;
  latencyMs?: number;
  evaluation?: Record<string, unknown>;
  difficulty: Difficulty;
  label: string;
  evidence: { subskill: SubskillId; score: number; format?: "mcq" | "free" | "numeric" | "sort" | "timed"; correct?: boolean; note?: string }[];
  errors: { type: ErrorType; subskill: SubskillId; detail: string }[];
  /** record a calibration entry for this attempt */
  calibration?: { confidence: number; correct: boolean; domain: FacultyId };
}

export function useInferenceRecorder() {
  const { db } = useStudy();
  const { sessionId } = useSessionItem();
  const record = useCallback(
    async (w: InferenceWrite) => {
      const attempt = stamp<InferenceAttempt>(db.userId, "inf", {
        mode: w.mode,
        challengeId: w.challengeId,
        response: w.response,
        score: w.score,
        confidence: w.confidence,
        correct: w.correct,
        latencyMs: w.latencyMs,
        evaluation: w.evaluation,
        sessionId: sessionId ?? undefined,
      });
      await db.store("inference_attempts").put(attempt);
      const source = { kind: "inference" as const, refId: attempt.id, label: w.label };
      for (const e of w.evidence) await recordEvidence(db, { subskill: e.subskill, score: e.score, difficulty: w.difficulty, format: e.format ?? "free", source, correct: e.correct, latencyMs: w.latencyMs, sessionId: sessionId ?? undefined, note: e.note });
      for (const err of w.errors.slice(0, 4)) await recordError(db, { type: err.type, subskill: err.subskill, source, detail: err.detail, sessionId: sessionId ?? undefined });
      if (w.calibration) await recordConfidence(db, { ...w.calibration, source, sessionId: sessionId ?? undefined, difficulty: w.difficulty });
      detectRedThreads(db).catch(() => {});
      return attempt;
    },
    [db, sessionId],
  );
  return record;
}

export function ModeHeader({ mode, title, children }: { mode: InferenceMode; title?: string; children?: React.ReactNode }) {
  const { inSession } = useSessionItem();
  return (
    <header className="mb-6">
      <div className="flex items-center justify-between gap-4 mb-3">
        <Link href="/v1/inference" className="text-[12px] text-ink-3 hover:text-ink inline-flex items-center gap-1.5"><I.ArrowLeft size={12} /> Inference Room</Link>
        {inSession ? <span className="mark"><span className="mark-dot" /> Today&apos;s session</span> : null}
      </div>
      <div className="eyebrow eyebrow-wine">{MODE_META[mode].title}</div>
      <h1 className="display text-[30px] md:text-[36px] mt-1">{title ?? MODE_META[mode].title}</h1>
      {children}
    </header>
  );
}

export function Evidence({ lines, title = "Evidence" }: { lines: string[]; title?: string }) {
  return (
    <div className="sheet paper-texture p-6 md:p-8 mb-6">
      <div className="eyebrow mb-3">{title}</div>
      <ol className="space-y-2">
        {lines.map((l, i) => (
          <li key={i} className="flex gap-3">
            <span className="mono text-[11px] text-ink-3 pt-1.5">{String(i + 1).padStart(2, "0")}</span>
            <span className="serif text-[17px] text-ink leading-relaxed">{l}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Debrief({ text, title = "Debrief" }: { text: string; title?: string }) {
  return (
    <section className="border-t border-line pt-5">
      <div className="eyebrow mb-2">{title}</div>
      <p className="serif text-[17px] text-ink-2 leading-relaxed">{text}</p>
    </section>
  );
}

export function Finish({ onAgain, againLabel = "Another" }: { onAgain?: () => void; againLabel?: string }) {
  const { finish, inSession } = useSessionItem();
  const router = useRouter();
  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      {inSession ? (
        <Button size="lg" onClick={() => finish()}>Continue the session <I.ArrowRight size={14} /></Button>
      ) : (
        <>
          {onAgain ? <Button size="lg" onClick={onAgain}>{againLabel}</Button> : null}
          <Button variant="secondary" onClick={() => router.push("/v1/inference")}>Inference Room</Button>
        </>
      )}
    </div>
  );
}

export function Verdict({ good, children }: { good: boolean | null; children: React.ReactNode }) {
  return <div className={cx("border-l-2 pl-4 py-1 text-[15px] serif", good === null ? "border-line-2 text-ink-2" : good ? "border-forest text-ink" : "border-wine text-ink")}>{children}</div>;
}

/** Match free-text items against keyworded candidates; each candidate matched at most once. */
export function matchList(texts: string[], candidates: { text: string; keywords: string[] }[]): { matched: number[]; unmatched: string[] } {
  const matched: number[] = [];
  const unmatched: string[] = [];
  for (const t of texts) {
    if (!t.trim()) continue;
    const idx = candidates.findIndex((c, i) => !matched.includes(i) && keyPointCoverage(t, c.keywords).ratio >= 0.3);
    if (idx >= 0) matched.push(idx);
    else unmatched.push(t);
  }
  return { matched, unmatched };
}

export function useStart() {
  const ref = useRef(performance.now());
  return { reset: () => (ref.current = performance.now()), elapsed: () => Math.round(performance.now() - ref.current) };
}

export function pickBy<T extends { id: string }>(items: T[], id: string | null | undefined, seedKey: string): T | undefined {
  if (!items.length) return undefined;
  if (id) return items.find((i) => i.id === id) ?? items[0];
  let h = 0;
  for (const ch of seedKey) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return items[h % items.length];
}
