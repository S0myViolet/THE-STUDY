"use client";

import React, { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CHRONOLOGY_EXERCISES } from "@/content";
import { createRng } from "@/lib/scene";
import { Button } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { ModeHeader, ResultPanel, useObservationRecorder, usePick, useStart } from "./shared";
import { seedFromString, todayKey, cx } from "@/lib/util/format";

/** Fraction of pairs in the right relative order (Kendall-style agreement). */
export function orderAgreement(given: string[], truth: string[]): number {
  const pos = new Map(truth.map((t, i) => [t, i]));
  let agree = 0;
  let total = 0;
  for (let i = 0; i < given.length; i++) {
    for (let j = i + 1; j < given.length; j++) {
      total++;
      if ((pos.get(given[i]) ?? 0) < (pos.get(given[j]) ?? 0)) agree++;
    }
  }
  return total ? agree / total : 0;
}

export function Chronology() {
  const params = useSearchParams();
  const { record } = useObservationRecorder();
  const exercise = usePick(CHRONOLOGY_EXERCISES, params.get("exercise"), todayKey() + ":chrono");
  const [nonce, setNonce] = useState(0);
  const shuffled = useMemo(() => (exercise ? createRng(seedFromString(exercise.id) + nonce).shuffle(exercise.ordered) : []), [exercise, nonce]);
  const [order, setOrder] = useState<string[] | null>(null);
  const current = order ?? shuffled;
  const [result, setResult] = useState<{ agreement: number; exact: number } | null>(null);
  const timer = useStart();

  if (!exercise) return <div className="page"><ModeHeader mode="chronology" /><p className="text-ink-3">Chronology exercises are being prepared.</p></div>;

  function move(i: number, dir: -1 | 1) {
    const next = [...current];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
  }

  async function submit() {
    const agreement = orderAgreement(current, exercise!.ordered);
    const exact = current.filter((x, i) => exercise!.ordered[i] === x).length;
    setResult({ agreement, exact });
    await record({
      mode: "chronology",
      exerciseId: exercise!.id,
      pressure: "standard",
      correct: exact,
      total: exercise!.ordered.length,
      falseClaims: 0,
      coverage: agreement,
      precision: agreement,
      latencyMs: timer.elapsed(),
      details: { given: current },
      difficulty: exercise!.difficulty,
      label: `Chronology · ${exercise!.title}`,
      evidence: [{ subskill: "observation.chronology", score: agreement, format: "sort" }],
      errors: agreement < 0.7 ? [{ type: "CHRONOLOGY_LOSS", subskill: "observation.chronology", detail: `${exercise!.title}: ${Math.round(agreement * 100)}% of pairs in the right order.` }] : [],
    });
  }

  return (
    <div className="page">
      <ModeHeader mode="chronology" title={exercise.title}>
        <p className="serif text-[18px] text-ink-2 mt-3 max-w-[62ch]">{exercise.context}</p>
      </ModeHeader>
      {!result ? (
        <div>
          <p className="text-[13px] text-ink-3 mb-4">Arrange from earliest to latest. Use the arrows or keyboard (focus a row, then ↑/↓).</p>
          <ol className="space-y-2" aria-label="Observations to order">
            {current.map((item, i) => (
              <li key={item} className="flex items-center gap-3 sheet p-3" tabIndex={0} onKeyDown={(e) => { if (e.key === "ArrowUp") { e.preventDefault(); move(i, -1); } if (e.key === "ArrowDown") { e.preventDefault(); move(i, 1); } }}>
                <span className="mono text-[11px] text-ink-3 w-5">{i + 1}</span>
                <span className="flex-1 serif text-[16px]">{item}</span>
                <span className="flex flex-col">
                  <button className="btn btn-ghost btn-sm !h-6 !px-1" onClick={() => move(i, -1)} aria-label={`Move "${item}" earlier`} disabled={i === 0}><I.Up size={12} /></button>
                  <button className="btn btn-ghost btn-sm !h-6 !px-1" onClick={() => move(i, 1)} aria-label={`Move "${item}" later`} disabled={i === current.length - 1}><I.Down size={12} /></button>
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-6"><Button size="lg" onClick={submit}>Commit the order</Button></div>
        </div>
      ) : (
        <ResultPanel coverage={result.agreement} correct={result.exact} total={exercise.ordered.length} onAgain={() => { setNonce((n) => n + 1); setOrder(null); setResult(null); timer.reset(); }} againLabel="Shuffle again">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="eyebrow mb-2">Your order</div>
              <ol className="space-y-1">{current.map((x, i) => <li key={x} className={cx("text-[14px] pl-3 border-l", exercise.ordered[i] === x ? "border-forest" : "border-wine")}>{x}</li>)}</ol>
            </div>
            <div>
              <div className="eyebrow mb-2">Likely order</div>
              <ol className="space-y-1">{exercise.ordered.map((x) => <li key={x} className="text-[14px] pl-3 border-l border-line-2 text-ink-2">{x}</li>)}</ol>
            </div>
          </div>
          <section><div className="eyebrow mb-2">The cues</div><p className="serif text-[17px] text-ink-2 leading-relaxed">{exercise.explanation}</p></section>
        </ResultPanel>
      )}
    </div>
  );
}
