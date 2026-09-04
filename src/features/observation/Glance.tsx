"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { PressureMode } from "@/lib/domain/types";
import { GLANCE_EXERCISES } from "@/content";
import { buildScene, createRng, generateQuestions, SceneSvg, listTemplates, type SceneQuestion } from "@/lib/scene";
import { shortAnswerCorrect } from "@/lib/scoring/observation";
import { Button, Choice, Field, Segmented } from "@/components/ui/primitives";
import { ModeHeader, PressureControl, ResultPanel, TimedReveal, ListBlock, pressureFactor, useObservationRecorder, usePick, useStart } from "./shared";
import { isUnknownAnswer } from "@/features/casebook/evaluate";
import { cx, todayKey } from "@/lib/util/format";
import { useCountdown } from "@/components/ui/primitives";

const EXPOSURES = [5, 10, 20, 30, 60];

export function Glance() {
  const params = useSearchParams();
  const { record, defaultPressure } = useObservationRecorder();
  const exercise = usePick(GLANCE_EXERCISES, params.get("exercise"), todayKey() + ":glance");
  const [nonce, setNonce] = useState(0);
  const [pressure, setPressure] = useState<PressureMode>(params.get("pressure") === "1" ? "pressure" : defaultPressure);
  const [seconds, setSeconds] = useState<number>(exercise?.seconds ?? 20);
  const [phase, setPhase] = useState<"intro" | "questions" | "done">("intro");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ per: { q: SceneQuestion; given: string; correct: boolean; unknown: boolean }[]; correct: number; falseClaims: number } | null>(null);
  const timer = useStart();

  const template = params.get("template") ?? exercise?.scene.template ?? listTemplates()[0]?.id ?? "desk";
  const seed = Number(params.get("seed") ?? exercise?.scene.seed ?? 4021) + nonce * 7919;
  const scene = useMemo(() => buildScene(template, seed), [template, seed]);
  const questions = useMemo(() => generateQuestions(scene, createRng(seed + 1), exercise?.questionCount ?? 6), [scene, seed, exercise?.questionCount]);
  const effective = Math.max(3, Math.round(seconds * pressureFactor(pressure)));

  useEffect(() => {
    if (exercise) setSeconds(exercise.seconds);
  }, [exercise]);

  async function submit() {
    const per = questions.map((q) => {
      const given = (answers[q.id] ?? "").trim();
      const unknown = isUnknownAnswer(given);
      const correct = q.format === "mcq" ? given.toLowerCase() === q.answer.toLowerCase() : !unknown && shortAnswerCorrect(given, q.answer, q.accept ?? []);
      return { q, given, correct, unknown };
    });
    const correct = per.filter((p) => p.correct).length;
    const falseClaims = per.filter((p) => !p.correct && !p.unknown && p.q.format !== "mcq").length;
    setResult({ per, correct, falseClaims });
    setPhase("done");
    const latencyMs = timer.elapsed();
    await record({
      mode: "glance",
      exerciseId: exercise?.id ?? `${template}:${seed}`,
      exposureSeconds: effective,
      pressure,
      coverage: questions.length ? correct / questions.length : 0,
      precision: correct + falseClaims ? correct / (correct + falseClaims) : 1,
      correct,
      total: questions.length,
      falseClaims,
      latencyMs,
      details: { template, seed, answers },
      difficulty: exercise?.difficulty ?? 3,
      label: `The Glance · ${scene.title}`,
      evidence: [
        ...per.map((p) => ({ subskill: p.q.subskill, score: p.correct ? 1 : p.unknown ? 0.15 : 0, format: p.q.format === "mcq" ? ("mcq" as const) : ("free" as const), correct: p.correct })),
        { subskill: "observation.precision" as const, score: questions.length ? 1 - falseClaims / questions.length : 1 },
      ],
      errors: per
        .filter((p) => !p.correct)
        .map((p) => ({
          type: p.unknown ? ("OBSERVATION_MISS" as const) : p.q.format === "mcq" ? (p.q.subskill === "observation.spatial" ? ("SPATIAL_MISS" as const) : ("OBSERVATION_MISS" as const)) : ("FALSE_OBSERVATION" as const),
          subskill: p.q.subskill,
          detail: `${p.q.prompt} — ${p.unknown ? "did not know" : `said "${p.given}"`}; was ${p.q.answer}.`,
        })),
    });
  }

  function again() {
    setNonce((n) => n + 1);
    setAnswers({});
    setResult(null);
    setPhase("intro");
  }

  return (
    <div className="page">
      <ModeHeader mode="glance" title={scene.title}>
        <p className="text-[14px] text-ink-2 mt-2">{scene.setting}</p>
      </ModeHeader>

      {phase === "intro" ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="eyebrow">Exposure</span>
              <Segmented value={String(seconds)} onChange={(v) => setSeconds(Number(v))} label="Exposure seconds" options={EXPOSURES.map((s) => ({ value: String(s), label: `${s}s` }))} />
            </div>
            <PressureControl value={pressure} onChange={setPressure} />
          </div>
          <TimedReveal
            seconds={effective}
            onHidden={() => {
              timer.reset();
              setPhase("questions");
            }}
            intro={
              <p className="text-[14px] text-ink-2">
                The scene appears for <span className="numeral text-ink">{effective} seconds</span>{pressure === "pressure" ? " (pressure pace)" : ""}. Look at positions, colours, text and counts. Then answer {questions.length} questions. &ldquo;I don&apos;t know&rdquo; costs less than a guess.
              </p>
            }
          >
            <div className="stage">
              <SceneSvg scene={scene} className="w-full h-auto block" />
            </div>
          </TimedReveal>
        </div>
      ) : null}

      {phase === "questions" ? (
        <QuestionForm questions={questions} answers={answers} setAnswers={setAnswers} onSubmit={submit} pressure={pressure} />
      ) : null}

      {phase === "done" && result ? (
        <ResultPanel coverage={questions.length ? result.correct / questions.length : 0} precision={result.correct + result.falseClaims ? result.correct / (result.correct + result.falseClaims) : 1} correct={result.correct} total={questions.length} falseClaims={result.falseClaims} onAgain={again} againLabel="Another glance">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8">
            <div>
              <div className="eyebrow mb-2">The scene, again</div>
              <div className="stage">
                <SceneSvg scene={scene} className="w-full h-auto block" />
              </div>
            </div>
            <div className="space-y-6">
              <ListBlock title="What you saw" tone="ok" items={result.per.filter((p) => p.correct).map((p) => `${p.q.prompt} ${p.q.answer}`)} />
              <ListBlock title="What you missed" tone="wine" items={result.per.filter((p) => !p.correct).map((p) => `${p.q.prompt} ${p.q.answer}${p.unknown ? " (you passed)" : p.given ? ` (you said ${p.given})` : ""}`)} />
            </div>
          </div>
        </ResultPanel>
      ) : null}
    </div>
  );
}

export function QuestionForm({ questions, answers, setAnswers, onSubmit, pressure }: { questions: SceneQuestion[]; answers: Record<string, string>; setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>; onSubmit: () => void; pressure: PressureMode }) {
  const limit = pressure === "pressure" ? 12 * questions.length : 0;
  const left = useCountdown(limit || 1, limit > 0, () => onSubmit());
  return (
    <div className="anim-place">
      {limit ? (
        <div className="flex items-center justify-between mb-4">
          <span className="eyebrow">Pressure</span>
          <span className="numeral text-[13px] text-ink-2">{Math.ceil(left)}s</span>
        </div>
      ) : null}
      <ol className="space-y-6">
        {questions.map((q, i) => (
          <li key={q.id} className="border-t border-line pt-4">
            <div className="flex gap-3">
              <span className="mono text-[11px] text-ink-3 pt-1">{String(i + 1).padStart(2, "0")}</span>
              <div className="flex-1">
                <p className="text-[15px] text-ink">{q.prompt}</p>
                {q.format === "mcq" ? (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options!.map((o, j) => (
                      <Choice key={o} index={j} label={o} selected={answers[q.id] === o} onClick={() => setAnswers((a) => ({ ...a, [q.id]: o }))} />
                    ))}
                    <button type="button" className={cx("choice", answers[q.id] === "I don't know" && "!border-ink")} aria-pressed={answers[q.id] === "I don't know"} onClick={() => setAnswers((a) => ({ ...a, [q.id]: "I don't know" }))}>
                      <span className="text-[13px] text-ink-3">I don&apos;t know</span>
                    </button>
                  </div>
                ) : (
                  <Field className="mt-3 max-w-md" value={answers[q.id] ?? ""} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} placeholder={q.format === "number" ? "A number, or I don't know" : "Short answer, or I don't know"} inputMode={q.format === "number" ? "numeric" : undefined} aria-label={q.prompt} />
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-8">
        <Button size="lg" onClick={onSubmit}>Submit</Button>
      </div>
    </div>
  );
}
