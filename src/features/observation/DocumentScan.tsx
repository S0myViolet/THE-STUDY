"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { PressureMode } from "@/lib/domain/types";
import { DOCUMENT_EXERCISES } from "@/content";
import { shortAnswerCorrect } from "@/lib/scoring/observation";
import { Button, Field } from "@/components/ui/primitives";
import { Material } from "@/features/casebook/Material";
import { isUnknownAnswer } from "@/features/casebook/evaluate";
import { ModeHeader, PressureControl, ResultPanel, TimedReveal, ListBlock, pressureFactor, useObservationRecorder, usePick, useStart } from "./shared";
import { todayKey } from "@/lib/util/format";

export function DocumentScan() {
  const params = useSearchParams();
  const { record, defaultPressure } = useObservationRecorder();
  const exercise = usePick(DOCUMENT_EXERCISES, params.get("exercise"), todayKey() + ":doc");
  const [pressure, setPressure] = useState<PressureMode>(defaultPressure);
  const [phase, setPhase] = useState<"intro" | "questions" | "done">("intro");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ per: { id: string; correct: boolean; given: string; unknown: boolean }[]; correct: number; falseClaims: number } | null>(null);
  const timer = useStart();
  if (!exercise) return <div className="page"><ModeHeader mode="document" /><p className="text-ink-3">Document exercises are being prepared.</p></div>;
  const seconds = Math.max(5, Math.round(exercise.seconds * pressureFactor(pressure)));
  const material = { kind: (exercise.rows ? "table" : "document") as "table" | "document", title: exercise.title, lines: exercise.lines, columns: exercise.columns, rows: exercise.rows, seconds };

  async function submit() {
    const per = exercise!.questions.map((q) => {
      const given = (answers[q.id] ?? "").trim();
      const unknown = isUnknownAnswer(given);
      const correct = !unknown && shortAnswerCorrect(given, q.answer, q.accept ?? []);
      return { id: q.id, correct, given, unknown };
    });
    const correct = per.filter((p) => p.correct).length;
    const falseClaims = per.filter((p) => !p.correct && !p.unknown).length;
    setResult({ per, correct, falseClaims });
    setPhase("done");
    await record({
      mode: "document",
      exerciseId: exercise!.id,
      exposureSeconds: seconds,
      pressure,
      coverage: correct / exercise!.questions.length,
      precision: correct + falseClaims ? correct / (correct + falseClaims) : 1,
      correct,
      total: exercise!.questions.length,
      falseClaims,
      latencyMs: timer.elapsed(),
      details: { answers },
      difficulty: exercise!.difficulty,
      label: `Document Scan · ${exercise!.title}`,
      evidence: [
        ...exercise!.questions.map((q, i) => ({ subskill: q.subskill, score: per[i].correct ? 1 : per[i].unknown ? 0.15 : 0, correct: per[i].correct })),
        { subskill: "observation.precision" as const, score: 1 - falseClaims / exercise!.questions.length },
      ],
      errors: exercise!.questions.filter((_, i) => !per[i].correct).map((q, i) => ({ type: /\d/.test(q.answer) && !per[i].unknown ? ("NUMERIC_DETAIL_LOSS" as const) : per[i].unknown ? ("OBSERVATION_MISS" as const) : ("FALSE_OBSERVATION" as const), subskill: q.subskill, detail: `${q.prompt} — was ${q.answer}.` })),
    });
  }

  return (
    <div className="page">
      <ModeHeader mode="document" title={exercise.title} />
      {phase === "intro" ? (
        <div className="space-y-5">
          <PressureControl value={pressure} onChange={setPressure} />
          <TimedReveal seconds={seconds} onHidden={() => { timer.reset(); setPhase("questions"); }} intro={<p className="text-[14px] text-ink-2">The document appears for <span className="numeral text-ink">{seconds} seconds</span>. Numbers, names and times matter. Then {exercise.questions.length} precise questions.</p>}>
            <Material material={material} />
          </TimedReveal>
        </div>
      ) : null}
      {phase === "questions" ? (
        <div className="anim-place">
          <ol className="space-y-5">
            {exercise.questions.map((q, i) => (
              <li key={q.id} className="border-t border-line pt-4">
                <div className="flex gap-3">
                  <span className="mono text-[11px] text-ink-3 pt-1">{String(i + 1).padStart(2, "0")}</span>
                  <div className="flex-1">
                    <p className="text-[15px]">{q.prompt}</p>
                    <Field className="mt-2 max-w-md" value={answers[q.id] ?? ""} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} placeholder="Exact answer, or I don't know" aria-label={q.prompt} />
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-6"><Button size="lg" onClick={submit}>Submit</Button></div>
        </div>
      ) : null}
      {phase === "done" && result ? (
        <ResultPanel coverage={result.correct / exercise.questions.length} precision={result.correct + result.falseClaims ? result.correct / (result.correct + result.falseClaims) : 1} correct={result.correct} total={exercise.questions.length} falseClaims={result.falseClaims} onAgain={() => { setAnswers({}); setResult(null); setPhase("intro"); }} againLabel="Look again">
          <Material material={material} />
          <ListBlock title="Right" tone="ok" items={exercise.questions.filter((q) => result.per.find((p) => p.id === q.id)?.correct).map((q) => `${q.prompt} ${q.answer}`)} />
          <ListBlock title="Not quite" tone="wine" items={exercise.questions.filter((q) => !result.per.find((p) => p.id === q.id)?.correct).map((q) => { const p = result.per.find((p) => p.id === q.id)!; return `${q.prompt} ${q.answer}${p.unknown ? " (you passed)" : ` (you said ${p.given})`}`; })} />
        </ResultPanel>
      ) : null}
    </div>
  );
}
