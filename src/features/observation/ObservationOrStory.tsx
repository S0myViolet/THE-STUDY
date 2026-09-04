"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { OBSERVATION_OR_STORY } from "@/content";
import { Button } from "@/components/ui/primitives";
import { ModeHeader, ResultPanel, useObservationRecorder, usePick, useStart } from "./shared";
import { cx, todayKey } from "@/lib/util/format";

type Truth = "observation" | "inference" | "unknown";
const KINDS: Truth[] = ["observation", "inference", "unknown"];

export function ObservationOrStory() {
  const params = useSearchParams();
  const { record } = useObservationRecorder();
  const exercise = usePick(OBSERVATION_OR_STORY, params.get("exercise"), todayKey() + ":oos");
  const [labels, setLabels] = useState<Record<string, Truth>>({});
  const [done, setDone] = useState(false);
  const timer = useStart();
  if (!exercise) return <div className="page"><ModeHeader mode="observation_or_story" /><p className="text-ink-3">Exercises are being prepared.</p></div>;
  const complete = exercise.statements.every((s) => labels[s.id]);
  const correct = exercise.statements.filter((s) => labels[s.id] === s.truth).length;
  const blurred = exercise.statements.filter((s) => labels[s.id] === "observation" && s.truth !== "observation");

  async function submit() {
    setDone(true);
    const accuracy = correct / exercise!.statements.length;
    await record({
      mode: "observation_or_story",
      exerciseId: exercise!.id,
      pressure: "standard",
      coverage: accuracy,
      precision: 1 - blurred.length / exercise!.statements.length,
      correct,
      total: exercise!.statements.length,
      falseClaims: blurred.length,
      latencyMs: timer.elapsed(),
      details: { labels },
      difficulty: exercise!.difficulty,
      label: `Observation or Story · ${exercise!.title}`,
      evidence: [{ subskill: "observation.separation", score: accuracy, format: "sort" }],
      errors: blurred.slice(0, 3).map((s) => ({ type: "MISREAD" as const, subskill: "observation.separation" as const, detail: `Called an ${s.truth} an observation: "${s.text}"` })),
    });
  }

  return (
    <div className="page">
      <ModeHeader mode="observation_or_story" title={exercise.title} />
      <div className="sheet paper-texture p-6 md:p-8 mb-6"><p className="prose-study">{exercise.situation}</p></div>
      <p className="text-[13px] text-ink-3 mb-4">Observation: literally shown or stated. Inference: concluded from it. Unknown: not settled either way.</p>
      <ul className="space-y-3">
        {exercise.statements.map((s) => (
          <li key={s.id} className="border-t border-line pt-3">
            <p className="serif text-[17px]">{s.text}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <div className="segmented" role="group" aria-label={`Classify: ${s.text}`}>
                {KINDS.map((k) => (
                  <button key={k} type="button" aria-pressed={labels[s.id] === k} disabled={done} onClick={() => setLabels((l) => ({ ...l, [s.id]: k }))}>{k}</button>
                ))}
              </div>
              {done ? <span className={cx("text-[12px]", labels[s.id] === s.truth ? "text-ok" : "text-wine")}>{labels[s.id] === s.truth ? "Yes." : `${s.truth}.`} <span className="text-ink-3">{s.why}</span></span> : null}
            </div>
          </li>
        ))}
      </ul>
      {!done ? (
        <div className="mt-6"><Button size="lg" onClick={submit} disabled={!complete}>Submit</Button></div>
      ) : (
        <div className="mt-8">
          <ResultPanel correct={correct} total={exercise.statements.length} falseClaims={blurred.length} onAgain={() => { setLabels({}); setDone(false); timer.reset(); }} againLabel="Again">
            <p className="serif text-[18px]">{blurred.length === 0 ? "You did not describe anything you inferred as though you had seen it. That is the discipline." : `${blurred.length} conclusion${blurred.length > 1 ? "s were" : " was"} dressed as observation. Ask of every statement: did I see it, or did I decide it?`}</p>
          </ResultPanel>
        </div>
      )}
    </div>
  );
}
