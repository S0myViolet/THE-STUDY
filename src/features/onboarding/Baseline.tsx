"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useStudy } from "@/lib/persistence/provider";
import { recordConfidence, recordEvidence } from "@/lib/services/evidence";
import type { Difficulty, SubskillId } from "@/lib/domain/faculties";
import type { ArchiveDomain } from "@/lib/domain/types";
import type { KnowledgeQuestion } from "@/lib/domain/content";
import { KNOWLEDGE_QUESTIONS } from "@/content";
import { buildScene, createRng, generateQuestions, SceneSvg, type SceneQuestion } from "@/lib/scene";
import { shortAnswerCorrect } from "@/lib/scoring/observation";
import { sentenceCount, wordCount, keyPointCoverage } from "@/lib/scoring/text";
import { brier } from "@/lib/scoring/calibration";
import { isUnknownAnswer } from "@/features/casebook/evaluate";
import { TimedReveal } from "@/features/observation/shared";
import { Button, Choice, ConfidenceDial, Field, HairlineProgress, TextArea, useCountdown } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { cx } from "@/lib/util/format";
import {
  BASELINE_CALIBRATION,
  BASELINE_EXPLANATION,
  BASELINE_GLANCE,
  BASELINE_INFERENCE,
  BASELINE_KNOWLEDGE,
  BASELINE_MEMORY,
  BASELINE_PEOPLE,
  BASELINE_QUESTION,
  BASELINE_STEP_LABEL,
  BASELINE_STEPS,
  BASELINE_STRATEGY,
  type BaselineStep,
  type ScoredOption,
} from "./baseline-items";

const STEP_KEY = "the-study:baseline-step";
const SOURCE = (refId: string, label: string) => ({ kind: "baseline" as const, refId, label });

/* ------------------------------------------------------------------ */
/* Runner                                                               */
/* ------------------------------------------------------------------ */

export function Baseline({ onDone, onSkip }: { onDone: () => void; onSkip: () => void }) {
  const [index, setIndex] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(STEP_KEY);
      const n = raw ? Number(raw) : 0;
      return Number.isFinite(n) && n >= 0 && n < BASELINE_STEPS.length ? n : 0;
    } catch {
      return 0;
    }
  });
  const step: BaselineStep = BASELINE_STEPS[index] ?? "glance";

  function next() {
    const n = index + 1;
    if (n >= BASELINE_STEPS.length) {
      try {
        localStorage.removeItem(STEP_KEY);
      } catch {}
      onDone();
      return;
    }
    try {
      localStorage.setItem(STEP_KEY, String(n));
    } catch {}
    setIndex(n);
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="page">
      <header className="mb-8">
        <div className="flex items-center justify-between gap-4">
          <div className="eyebrow eyebrow-wine">The baseline</div>
          <span className="numeral text-[12px] text-ink-3">
            {index + 1} of {BASELINE_STEPS.length}
          </span>
        </div>
        <HairlineProgress value={index / BASELINE_STEPS.length} className="mt-3" />
        <h1 className="display text-[30px] md:text-[36px] mt-5 text-ink">{BASELINE_STEP_LABEL[step]}</h1>
      </header>

      <div key={step} className="anim-place">
        {step === "glance" ? <GlanceStep onNext={next} /> : null}
        {step === "inference" ? (
          <ScoredStep
            id={BASELINE_INFERENCE.id}
            label="Baseline · An explanation"
            difficulty={BASELINE_INFERENCE.difficulty}
            situation={BASELINE_INFERENCE.situation}
            parts={[
              { prompt: BASELINE_INFERENCE.prompt, options: BASELINE_INFERENCE.options, subskill: BASELINE_INFERENCE.subskill },
              { prompt: BASELINE_INFERENCE.followPrompt, options: BASELINE_INFERENCE.followOptions, subskill: BASELINE_INFERENCE.followSubskill },
            ]}
            onNext={next}
          />
        ) : null}
        {step === "question" ? (
          <ScoredStep
            id={BASELINE_QUESTION.id}
            label="Baseline · A question"
            difficulty={BASELINE_QUESTION.difficulty}
            situation={BASELINE_QUESTION.situation}
            parts={[{ prompt: BASELINE_QUESTION.prompt, options: BASELINE_QUESTION.options, subskill: BASELINE_QUESTION.subskill }]}
            onNext={next}
          />
        ) : null}
        {step === "memory-study" ? <MemoryStudy onNext={next} /> : null}
        {step === "strategy" ? (
          <ScoredStep
            id={BASELINE_STRATEGY.id}
            label="Baseline · A move"
            difficulty={BASELINE_STRATEGY.difficulty}
            situation={BASELINE_STRATEGY.situation}
            parts={[
              { prompt: BASELINE_STRATEGY.prompt, options: BASELINE_STRATEGY.options, subskill: BASELINE_STRATEGY.subskill },
              { prompt: BASELINE_STRATEGY.secondPrompt, options: BASELINE_STRATEGY.secondOptions, subskill: BASELINE_STRATEGY.secondSubskill },
            ]}
            onNext={next}
          />
        ) : null}
        {step === "knowledge" ? <KnowledgeStep onNext={next} /> : null}
        {step === "memory-recall" ? <MemoryRecall onNext={next} /> : null}
        {step === "explanation" ? <ExplanationStep onNext={next} /> : null}
        {step === "calibration" ? <CalibrationStep onNext={next} /> : null}
      </div>

      <div className="mt-12 flex items-center justify-between text-[12px] text-ink-4">
        <span>Nothing here is a verdict. It is a starting point.</span>
        <button type="button" className="hover:text-ink underline-offset-2 hover:underline" onClick={onSkip}>
          Skip the baseline for now
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared bits                                                          */
/* ------------------------------------------------------------------ */

function Situation({ children }: { children: React.ReactNode }) {
  return <p className="serif text-[19px] md:text-[21px] leading-relaxed text-ink max-w-[62ch]">{children}</p>;
}

function Continue({ onClick, label = "Continue" }: { onClick: () => void; label?: string }) {
  return (
    <div className="mt-8">
      <Button onClick={onClick}>
        {label} <I.ArrowRight size={14} />
      </Button>
    </div>
  );
}

function Reflection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 sheet p-5">
      <div className="eyebrow">{title}</div>
      <div className="mt-2 text-[14px] text-ink-2 space-y-2">{children}</div>
    </div>
  );
}

function useElapsed() {
  const start = useRef(performance.now());
  return () => Math.round(performance.now() - start.current);
}

/* ------------------------------------------------------------------ */
/* 1. Glance                                                            */
/* ------------------------------------------------------------------ */

function GlanceStep({ onNext }: { onNext: () => void }) {
  const { db } = useStudy();
  const scene = useMemo(() => buildScene(BASELINE_GLANCE.template, BASELINE_GLANCE.seed), []);
  const questions = useMemo(() => generateQuestions(scene, createRng(BASELINE_GLANCE.seed + 1), BASELINE_GLANCE.questionCount), [scene]);
  const [phase, setPhase] = useState<"look" | "answer" | "done">("look");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [per, setPer] = useState<{ q: SceneQuestion; given: string; correct: boolean; unknown: boolean }[]>([]);
  const elapsed = useElapsed();

  async function submit() {
    const rows = questions.map((q) => {
      const given = (answers[q.id] ?? "").trim();
      const unknown = isUnknownAnswer(given) || given === "";
      const correct = q.format === "mcq" ? given.toLowerCase() === q.answer.toLowerCase() : !unknown && shortAnswerCorrect(given, q.answer, q.accept ?? []);
      return { q, given, correct, unknown };
    });
    setPer(rows);
    setPhase("done");
    const latencyMs = elapsed();
    const falseClaims = rows.filter((r) => !r.correct && !r.unknown && r.q.format !== "mcq").length;
    for (const r of rows) {
      await recordEvidence(db, {
        subskill: r.q.subskill,
        score: r.correct ? 1 : r.unknown ? 0.15 : 0,
        difficulty: BASELINE_GLANCE.difficulty as Difficulty,
        format: r.q.format === "mcq" ? "mcq" : "free",
        correct: r.correct,
        latencyMs,
        source: SOURCE(BASELINE_GLANCE.id, "Baseline · A glance"),
      });
    }
    await recordEvidence(db, {
      subskill: "observation.precision",
      score: 1 - falseClaims / Math.max(1, questions.length),
      difficulty: BASELINE_GLANCE.difficulty as Difficulty,
      format: "free",
      source: SOURCE(BASELINE_GLANCE.id, "Baseline · A glance"),
    });
  }

  if (phase === "look") {
    return (
      <div>
        <TimedReveal
          seconds={BASELINE_GLANCE.seconds}
          onHidden={() => setPhase("answer")}
          intro={
            <p className="text-[14px] text-ink-2 max-w-[60ch]">
              A cafe appears for <span className="numeral text-ink">{BASELINE_GLANCE.seconds} seconds</span>. Look at positions, colours, text and counts. Then five questions. &ldquo;I don&apos;t know&rdquo; is an acceptable answer; a confident wrong one is not.
            </p>
          }
        >
          <div className="stage">
            <SceneSvg scene={scene} className="w-full h-auto block" />
          </div>
        </TimedReveal>
      </div>
    );
  }

  if (phase === "answer") {
    const complete = questions.every((q) => (answers[q.id] ?? "").trim() !== "");
    return (
      <div className="space-y-7 max-w-[62ch]">
        {questions.map((q, i) => (
          <div key={q.id}>
            <div className="flex items-baseline gap-3">
              <span className="mono text-[11px] text-ink-3">{i + 1}</span>
              <p className="text-[15px] text-ink">{q.prompt}</p>
            </div>
            {q.format === "mcq" && q.options ? (
              <div className="mt-3 grid gap-2">
                {q.options.map((o, j) => (
                  <Choice key={o} index={j} label={o} selected={answers[q.id] === o} onClick={() => setAnswers((a) => ({ ...a, [q.id]: o }))} />
                ))}
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Field label="" placeholder={q.format === "number" ? "A number, or I don't know" : "Your answer, or I don't know"} value={answers[q.id] ?? ""} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} className="w-full sm:w-72" />
                <button type="button" className="text-[12px] text-ink-3 hover:text-ink" onClick={() => setAnswers((a) => ({ ...a, [q.id]: "I don't know" }))}>
                  I don&apos;t know
                </button>
              </div>
            )}
          </div>
        ))}
        <Button onClick={submit} disabled={!complete}>
          Check <I.ArrowRight size={14} />
        </Button>
      </div>
    );
  }

  const correct = per.filter((p) => p.correct).length;
  const invented = per.filter((p) => !p.correct && !p.unknown && p.q.format !== "mcq").length;
  return (
    <div className="max-w-[62ch]">
      <p className="serif text-[22px] text-ink">
        {correct} of {per.length} from a twelve-second look.
      </p>
      <ul className="mt-5 space-y-3">
        {per.map((p) => (
          <li key={p.q.id} className="text-[14px] flex gap-3">
            <span className={cx("mt-1.5 inline-block w-1.5 h-1.5 rounded-full shrink-0", p.correct ? "bg-forest" : p.unknown ? "bg-line-2" : "bg-wine")} />
            <span>
              <span className="text-ink-2">{p.q.prompt}</span>{" "}
              <span className="text-ink">{p.correct ? p.q.answer : p.unknown ? `Unknown. It was ${p.q.answer}.` : `You said "${p.given}"; it was ${p.q.answer}.`}</span>
            </span>
          </li>
        ))}
      </ul>
      <Reflection title="What this measured">
        <p>Detail, text and position under time. {invented > 0 ? `${invented === 1 ? "One answer" : `${invented} answers`} reported something that was not there; that is the habit the Observation Room works on first.` : "Nothing was invented, which matters more than the count."}</p>
      </Reflection>
      <Continue onClick={onNext} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2, 3, 5. Scored choices                                              */
/* ------------------------------------------------------------------ */

function ScoredStep({ id, label, difficulty, situation, parts, onNext }: { id: string; label: string; difficulty: number; situation: string; parts: { prompt: string; options: ScoredOption[]; subskill: SubskillId }[]; onNext: () => void }) {
  const { db } = useStudy();
  const [partIndex, setPartIndex] = useState(0);
  const [picked, setPicked] = useState<Record<number, string>>({});
  const elapsed = useElapsed();
  const part = parts[partIndex]!;
  const chosen = picked[partIndex] ? part.options.find((o) => o.id === picked[partIndex]) : undefined;
  const best = [...part.options].sort((a, b) => b.value - a.value)[0]!;

  async function choose(o: ScoredOption) {
    if (picked[partIndex]) return;
    setPicked((p) => ({ ...p, [partIndex]: o.id }));
    await recordEvidence(db, {
      subskill: part.subskill,
      score: o.value,
      difficulty: difficulty as Difficulty,
      format: "mcq",
      correct: o.value >= 0.9,
      latencyMs: elapsed(),
      source: SOURCE(id, label),
    });
  }

  function advance() {
    if (partIndex + 1 < parts.length) setPartIndex(partIndex + 1);
    else onNext();
  }

  return (
    <div className="max-w-[62ch]">
      <Situation>{situation}</Situation>
      <p className="mt-6 text-[15px] text-ink">{part.prompt}</p>
      <div className="mt-3 grid gap-2">
        {part.options.map((o, i) => (
          <Choice key={o.id} index={i} label={o.label} selected={chosen?.id === o.id} correct={!!chosen && o.id === best.id} wrong={!!chosen && chosen.id === o.id && o.value < 0.9} disabled={!!chosen} onClick={() => choose(o)} detail={chosen ? o.note : undefined} />
        ))}
      </div>
      {chosen ? (
        <>
          <Reflection title={chosen.value >= 0.9 ? "Strong" : chosen.value >= 0.5 ? "Defensible" : "Costly"}>
            <p>{chosen.note}</p>
            {chosen.id !== best.id ? <p>The stronger option was {String.fromCharCode(65 + part.options.findIndex((o) => o.id === best.id))}: {best.note}</p> : null}
          </Reflection>
          <Continue onClick={advance} label={partIndex + 1 < parts.length ? "Next" : "Continue"} />
        </>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 4 & 7. Memory: study, then recall after a delay                      */
/* ------------------------------------------------------------------ */

function MemoryStudy({ onNext }: { onNext: () => void }) {
  const [running, setRunning] = useState(false);
  const left = useCountdown(BASELINE_MEMORY.studySeconds, running, () => onNext());
  return (
    <div className="max-w-[70ch]">
      {!running ? (
        <div className="sheet p-6">
          <p className="text-[14px] text-ink-2 max-w-[58ch]">
            Four people you have just met. You have <span className="numeral text-ink">{BASELINE_MEMORY.studySeconds} seconds</span> with their cards. Something else will happen in between, then you will be asked about them.
          </p>
          <Button className="mt-5" onClick={() => setRunning(true)}>
            Meet them <I.ArrowRight size={14} />
          </Button>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="eyebrow">Study</span>
            <span className="numeral text-[13px] text-ink-2" role="timer">
              {Math.ceil(left)}s
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {BASELINE_PEOPLE.map((p) => (
              <div key={p.id} className="sheet p-5">
                <div className="serif text-[22px] text-ink">{p.name}</div>
                <div className="mt-1 text-[14px] text-ink-2">
                  {p.profession} · {p.origin}
                </div>
                <div className="mt-3 text-[13px] text-ink-2">{p.interest}</div>
                <div className="mt-1 text-[13px] text-ink-3">{p.detail}</div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Button variant="secondary" onClick={onNext}>
              I have them
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function MemoryRecall({ onNext }: { onNext: () => void }) {
  const { db } = useStudy();
  const people = BASELINE_PEOPLE;
  const professions = useMemo(() => people.map((p) => p.profession), [people]);
  const [prof, setProf] = useState<Record<string, string>>({});
  const [detail, setDetail] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ names: number; details: number } | null>(null);

  function detailHit(p: (typeof people)[number], text: string): boolean {
    const t = text.toLowerCase();
    if (!t.trim()) return false;
    const pool = [p.origin, p.interest, p.detail]
      .flatMap((s) => s.toLowerCase().replace(/[^a-z\s-]/g, " ").split(/\s+/))
      .filter((w) => w.length >= 5 && !["always", "carries", "wears", "drinks", "writes", "with", "right", "left-handed", "there"].includes(w));
    return pool.some((w) => t.includes(w));
  }

  async function submit() {
    const names = people.filter((p) => prof[p.id] === p.profession).length;
    const details = people.filter((p) => detailHit(p, detail[p.id] ?? "")).length;
    setResult({ names, details });
    await recordEvidence(db, { subskill: BASELINE_MEMORY.subskill, score: names / people.length, difficulty: BASELINE_MEMORY.difficulty as Difficulty, format: "delayed", source: SOURCE(BASELINE_MEMORY.id, "Baseline · Four people") });
    await recordEvidence(db, { subskill: BASELINE_MEMORY.detailSubskill, score: details / people.length, difficulty: BASELINE_MEMORY.difficulty as Difficulty, format: "delayed", source: SOURCE(BASELINE_MEMORY.id, "Baseline · Four people") });
  }

  if (result) {
    return (
      <div className="max-w-[62ch]">
        <p className="serif text-[22px] text-ink">
          {result.names} of {people.length} professions, {result.details} of {people.length} details.
        </p>
        <ul className="mt-5 space-y-2 text-[14px]">
          {people.map((p) => (
            <li key={p.id} className="flex gap-3">
              <span className={cx("mt-1.5 inline-block w-1.5 h-1.5 rounded-full shrink-0", prof[p.id] === p.profession ? "bg-forest" : "bg-wine")} />
              <span>
                <span className="text-ink">{p.name}</span> <span className="text-ink-2">· {p.profession}, {p.origin}. {p.interest}. {p.detail}</span>
              </span>
            </li>
          ))}
        </ul>
        <Reflection title="What this measured">
          <p>Names and details after a delay filled with other work. The Memory Palace trains this with spacing, not repetition.</p>
        </Reflection>
        <Continue onClick={onNext} />
      </div>
    );
  }

  const complete = people.every((p) => prof[p.id]);
  return (
    <div className="max-w-[62ch]">
      <p className="text-[14px] text-ink-2">The four people from earlier. Match each name to a profession, and write anything else you remember about them.</p>
      <div className="mt-6 space-y-7">
        {people.map((p) => (
          <div key={p.id}>
            <div className="serif text-[20px] text-ink">{p.name}</div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {professions.map((pr, i) => (
                <Choice key={pr} index={i} label={pr} selected={prof[p.id] === pr} onClick={() => setProf((s) => ({ ...s, [p.id]: pr }))} />
              ))}
            </div>
            <Field label="" placeholder="Anything else: where from, an interest, a detail" value={detail[p.id] ?? ""} onChange={(e) => setDetail((s) => ({ ...s, [p.id]: e.target.value }))} className="mt-2 w-full" />
          </div>
        ))}
      </div>
      <div className="mt-8">
        <Button onClick={submit} disabled={!complete}>
          Check <I.ArrowRight size={14} />
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Knowledge, adaptive                                               */
/* ------------------------------------------------------------------ */

function pickKnowledge(pool: KnowledgeQuestion[], difficulty: number, usedIds: Set<string>, usedDomains: Set<ArchiveDomain>, seed: number): KnowledgeQuestion | undefined {
  const rng = createRng(seed);
  for (let spread = 0; spread <= 7; spread++) {
    const candidates = pool.filter((q) => !usedIds.has(q.id) && Math.abs(q.difficulty - difficulty) <= spread);
    const fresh = candidates.filter((q) => !usedDomains.has(q.domain));
    const list = fresh.length ? fresh : candidates;
    if (list.length) return rng.pick(list);
  }
  return undefined;
}

function KnowledgeStep({ onNext }: { onNext: () => void }) {
  const { db } = useStudy();
  const [asked, setAsked] = useState<KnowledgeQuestion[]>(() => {
    const first = pickKnowledge(KNOWLEDGE_QUESTIONS, BASELINE_KNOWLEDGE.startDifficulty, new Set(), new Set(), 11);
    return first ? [first] : [];
  });
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [difficulty, setDifficulty] = useState(BASELINE_KNOWLEDGE.startDifficulty);
  const current = asked[asked.length - 1];
  const answeredCount = Object.keys(answers).length;
  const finished = answeredCount >= BASELINE_KNOWLEDGE.count || !current;
  const elapsed = useElapsed();

  async function answer(i: number) {
    if (!current || answers[current.id] !== undefined) return;
    const correct = i === current.answer;
    setAnswers((a) => ({ ...a, [current.id]: i }));
    const nextDifficulty = Math.max(1, Math.min(8, difficulty + (correct ? 1 : -1)));
    setDifficulty(nextDifficulty);
    await recordEvidence(db, {
      subskill: `knowledge.${current.domain}` as SubskillId,
      score: correct ? 1 : 0,
      correct,
      difficulty: current.difficulty,
      format: "mcq",
      latencyMs: elapsed(),
      source: SOURCE(BASELINE_KNOWLEDGE.id, "Baseline · Six questions"),
    });
  }

  function nextQuestion() {
    if (answeredCount >= BASELINE_KNOWLEDGE.count) return;
    const q = pickKnowledge(KNOWLEDGE_QUESTIONS, difficulty, new Set(asked.map((a) => a.id)), new Set(asked.map((a) => a.domain)), 11 + asked.length * 17);
    if (q) setAsked((list) => [...list, q]);
  }

  if (!current) {
    return <Continue onClick={onNext} />;
  }

  const given = answers[current.id];
  const done = given !== undefined;
  const correctCount = asked.filter((q) => answers[q.id] === q.answer).length;

  if (finished && done) {
    const hardest = asked.filter((q) => answers[q.id] === q.answer).sort((a, b) => b.difficulty - a.difficulty)[0];
    return (
      <div className="max-w-[62ch]">
        <p className="serif text-[22px] text-ink">
          {correctCount} of {asked.length}, across {new Set(asked.map((q) => q.domain)).size} domains.
        </p>
        <Reflection title="What this measured">
          <p>Breadth, not trivia: each question moved harder or easier depending on the last. {hardest ? `The hardest you carried was ${hardest.domain}, difficulty ${hardest.difficulty} of 8.` : "The Archive starts with the foundations."}</p>
        </Reflection>
        <Continue onClick={onNext} />
      </div>
    );
  }

  return (
    <div className="max-w-[62ch]">
      <div className="flex items-center justify-between">
        <span className="eyebrow">{current.domain}</span>
        <span className="numeral text-[12px] text-ink-3">
          {Math.min(answeredCount + 1, BASELINE_KNOWLEDGE.count)} of {BASELINE_KNOWLEDGE.count}
        </span>
      </div>
      <p className="mt-3 serif text-[20px] text-ink leading-snug">{current.prompt}</p>
      <div className="mt-4 grid gap-2">
        {current.options.map((o, i) => (
          <Choice key={o} index={i} label={o} selected={given === i} correct={done && i === current.answer} wrong={done && given === i && i !== current.answer} disabled={done} onClick={() => answer(i)} />
        ))}
      </div>
      {done ? (
        <>
          <Reflection title={given === current.answer ? "Right" : "Not that"}>
            <p>{current.explanation}</p>
          </Reflection>
          <Continue onClick={nextQuestion} label={answeredCount >= BASELINE_KNOWLEDGE.count ? "Continue" : "Next"} />
        </>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 8. Explanation                                                       */
/* ------------------------------------------------------------------ */

function ExplanationStep({ onNext }: { onNext: () => void }) {
  const { db } = useStudy();
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ score: number; covered: string[]; missing: string[]; sentences: number; words: number } | null>(null);
  const elapsed = useElapsed();

  async function submit() {
    const words = wordCount(text);
    const sentences = sentenceCount(text);
    const cov = keyPointCoverage(text, BASELINE_EXPLANATION.keyPoints);
    const withinLength = sentences <= BASELINE_EXPLANATION.maxSentences ? 1 : sentences === BASELINE_EXPLANATION.maxSentences + 1 ? 0.5 : 0;
    const density = words >= 25 && words <= 90 ? 1 : words < 25 ? Math.max(0, words / 25) : Math.max(0.3, 1 - (words - 90) / 120);
    const score = Math.max(0, Math.min(1, 0.55 * cov.ratio + 0.25 * withinLength + 0.2 * density));
    setResult({ score, covered: cov.covered, missing: cov.missing, sentences, words });
    const latencyMs = elapsed();
    await recordEvidence(db, { subskill: BASELINE_EXPLANATION.subskill, score, difficulty: BASELINE_EXPLANATION.difficulty as Difficulty, format: "free", latencyMs, source: SOURCE(BASELINE_EXPLANATION.id, "Baseline · An explanation of yours") });
    await recordEvidence(db, { subskill: BASELINE_EXPLANATION.claritySubskill, score: 0.5 * withinLength + 0.5 * density, difficulty: BASELINE_EXPLANATION.difficulty as Difficulty, format: "free", latencyMs, source: SOURCE(BASELINE_EXPLANATION.id, "Baseline · An explanation of yours") });
  }

  const readable = (kp: string) => kp.split("|")[0]!;

  return (
    <div className="max-w-[62ch]">
      <Situation>{BASELINE_EXPLANATION.prompt}</Situation>
      {!result ? (
        <>
          <TextArea label="" className="mt-5 min-h-[140px] field-serif" placeholder="Write it as you would say it." value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && wordCount(text) >= 8) void submit(); }} />
          <div className="mt-2 flex items-center justify-between text-[12px] text-ink-3">
            <span className="numeral">
              {wordCount(text)} words · {sentenceCount(text)} {sentenceCount(text) === 1 ? "sentence" : "sentences"}
            </span>
            <span>Cmd/Ctrl + Enter to submit</span>
          </div>
          <div className="mt-6">
            <Button onClick={submit} disabled={wordCount(text) < 8}>
              Submit <I.ArrowRight size={14} />
            </Button>
          </div>
        </>
      ) : (
        <>
          <blockquote className="mt-5 serif text-[18px] text-ink-2 border-l border-line-2 pl-4">{text}</blockquote>
          <Reflection title="Deterministic review">
            <p>
              {result.covered.length ? `It touched ${result.covered.map(readable).join(", ")}.` : "It did not name the mechanism."}{" "}
              {result.missing.length ? `Missing: ${result.missing.map(readable).join(", ")}.` : "Every element of the idea is there."}{" "}
              {result.sentences > BASELINE_EXPLANATION.maxSentences ? `${result.sentences} sentences where three were asked for.` : ""}
            </p>
            <p className="text-ink-3">One version that works: &ldquo;{BASELINE_EXPLANATION.example}&rdquo;</p>
          </Reflection>
          <Continue onClick={onNext} />
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 9. Calibration                                                       */
/* ------------------------------------------------------------------ */

function CalibrationStep({ onNext }: { onNext: () => void }) {
  const { db } = useStudy();
  const claims = BASELINE_CALIBRATION.claims;
  const [i, setI] = useState(0);
  const [verdict, setVerdict] = useState<boolean | null>(null);
  const [conf, setConf] = useState<number | null>(null);
  const [rows, setRows] = useState<{ id: string; correct: boolean; confidence: number }[]>([]);
  const elapsed = useElapsed();
  const claim = claims[i];

  async function commit() {
    if (!claim || verdict === null || conf === null) return;
    const correct = verdict === claim.truth;
    const row = { id: claim.id, correct, confidence: conf };
    setRows((r) => [...r, row]);
    await recordConfidence(db, { confidence: conf, correct, domain: "knowledge", latencyMs: elapsed(), source: SOURCE(BASELINE_CALIBRATION.id, "Baseline · How sure"), difficulty: BASELINE_CALIBRATION.difficulty as Difficulty });
    setVerdict(null);
    setConf(null);
    setI(i + 1);
  }

  if (!claim) {
    const right = rows.filter((r) => r.correct).length;
    const avgConf = rows.length ? rows.reduce((s, r) => s + r.confidence, 0) / rows.length : 0;
    const meanBrier = rows.length ? rows.reduce((s, r) => s + brier(r.confidence, r.correct), 0) / rows.length : 0;
    const hitRate = rows.length ? right / rows.length : 0;
    const gap = avgConf - hitRate;
    const reading = rows.length < 4 ? "Too few answers to say anything about calibration yet." : gap > 0.12 ? "Confidence ran ahead of accuracy. That is the common direction, and the one the Study watches most closely." : gap < -0.12 ? "Accuracy ran ahead of confidence. You know more than you are willing to claim." : "Confidence and accuracy were close. Keep it that way as the questions get harder.";
    return (
      <div className="max-w-[62ch]">
        <p className="serif text-[22px] text-ink">
          Right on {right} of {rows.length}. Average confidence {Math.round(avgConf * 100)}%.
        </p>
        <ul className="mt-5 space-y-2 text-[14px]">
          {claims.map((c) => {
            const r = rows.find((x) => x.id === c.id);
            return (
              <li key={c.id} className="flex gap-3">
                <span className={cx("mt-1.5 inline-block w-1.5 h-1.5 rounded-full shrink-0", r?.correct ? "bg-forest" : "bg-wine")} />
                <span>
                  <span className="text-ink">{c.claim}</span> <span className="text-ink-3">{c.truth ? "True." : "False."} {c.note} You said {Math.round((r?.confidence ?? 0) * 100)}%.</span>
                </span>
              </li>
            );
          })}
        </ul>
        <Reflection title="What this measured">
          <p>{reading}</p>
          <p className="text-ink-3 numeral">Brier {meanBrier.toFixed(2)} (lower is better; 0.25 is a coin toss).</p>
        </Reflection>
        <Continue onClick={onNext} label="See the first map" />
      </div>
    );
  }

  return (
    <div className="max-w-[62ch]">
      <div className="flex items-center justify-between">
        <span className="eyebrow">True or false</span>
        <span className="numeral text-[12px] text-ink-3">
          {i + 1} of {claims.length}
        </span>
      </div>
      <p className="mt-3 serif text-[21px] text-ink leading-snug">{claim.claim}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Choice label="True" selected={verdict === true} onClick={() => setVerdict(true)} />
        <Choice label="False" selected={verdict === false} onClick={() => setVerdict(false)} />
      </div>
      <div className={cx("mt-6 transition-opacity", verdict === null ? "opacity-40 pointer-events-none" : "")}>
        <ConfidenceDial value={conf} onChange={setConf} disabled={verdict === null} />
      </div>
      <div className="mt-6">
        <Button onClick={commit} disabled={verdict === null || conf === null}>
          {i + 1 < claims.length ? "Next" : "Finish"} <I.ArrowRight size={14} />
        </Button>
      </div>
    </div>
  );
}

/** Used by the First Map to know whether any baseline evidence exists. */
export function useBaselineHasEvidence(): boolean {
  const [has, setHas] = useState(false);
  const { db } = useStudy();
  useEffect(() => {
    let alive = true;
    db.store("skill_evidence")
      .count({})
      .then((n) => alive && setHas(n > 0))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [db]);
  return has;
}
