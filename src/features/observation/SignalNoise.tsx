"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { SIGNAL_EXERCISES } from "@/content";
import { Button } from "@/components/ui/primitives";
import { ModeHeader, ResultPanel, useObservationRecorder, usePick, useStart } from "./shared";
import { cx, todayKey } from "@/lib/util/format";

export function SignalNoise() {
  const params = useSearchParams();
  const { record } = useObservationRecorder();
  const exercise = usePick(SIGNAL_EXERCISES, params.get("exercise"), todayKey() + ":signal");
  const [picked, setPicked] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const timer = useStart();
  if (!exercise) return <div className="page"><ModeHeader mode="signal_noise" /><p className="text-ink-3">Signal exercises are being prepared.</p></div>;
  const signals = exercise.details.filter((d) => d.signal).map((d) => d.id);
  const hits = picked.filter((p) => signals.includes(p)).length;
  const falsePicks = picked.length - hits;

  async function submit() {
    setDone(true);
    const recall = signals.length ? hits / signals.length : 0;
    const precision = picked.length ? hits / picked.length : 0;
    await record({
      mode: "signal_noise",
      exerciseId: exercise!.id,
      pressure: "standard",
      coverage: recall,
      precision,
      correct: hits,
      total: signals.length,
      falseClaims: falsePicks,
      latencyMs: timer.elapsed(),
      details: { picked },
      difficulty: exercise!.difficulty,
      label: `Signal vs Noise · ${exercise!.title}`,
      evidence: [
        { subskill: "observation.anomaly", score: Math.max(0, recall - falsePicks * 0.1), format: "sort" },
        { subskill: "inference.evidence_weighting", score: (recall + precision) / 2, format: "sort" },
      ],
      errors: recall < 0.6 ? [{ type: "OBSERVATION_MISS", subskill: "observation.anomaly", detail: `${exercise!.title}: found ${hits} of ${signals.length} high-information details.` }] : [],
    });
  }

  return (
    <div className="page">
      <ModeHeader mode="signal_noise" title={exercise.title}>
        <p className="serif text-[18px] text-ink-2 mt-3 max-w-[62ch]">{exercise.context}</p>
      </ModeHeader>
      <p className="text-[13px] text-ink-3 mb-4">Choose the {exercise.pick} details that carry the most information. {picked.length} of {exercise.pick} chosen.</p>
      <ul className="space-y-2">
        {exercise.details.map((d) => {
          const on = picked.includes(d.id);
          return (
            <li key={d.id}>
              <button
                type="button"
                className={cx("choice", done && d.signal && "!border-forest", done && !d.signal && on && "!border-wine")}
                aria-pressed={on}
                disabled={done}
                onClick={() => setPicked((p) => (on ? p.filter((x) => x !== d.id) : p.length < exercise.pick ? [...p, d.id] : p))}
              >
                <span className="min-w-0">
                  <span className="block text-[15px] serif">{d.text}</span>
                  {done ? <span className={cx("block mt-1 text-[13px]", d.signal ? "text-forest" : "text-ink-3")}>{d.signal ? "Signal. " : "Noise. "}{d.why}</span> : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {!done ? (
        <div className="mt-6"><Button size="lg" onClick={submit} disabled={picked.length !== exercise.pick}>Commit</Button></div>
      ) : (
        <div className="mt-8">
          <ResultPanel coverage={signals.length ? hits / signals.length : 0} precision={picked.length ? hits / picked.length : 0} correct={hits} total={signals.length} falseClaims={falsePicks} onAgain={() => { setPicked([]); setDone(false); timer.reset(); }} againLabel="Reset" />
        </div>
      )}
    </div>
  );
}
