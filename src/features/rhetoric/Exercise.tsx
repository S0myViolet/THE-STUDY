"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStudy } from "@/lib/persistence/provider";
import { stamp } from "@/lib/persistence/store";
import type { RhetoricEntry, RhetoricPrompt } from "@/lib/domain/types";
import { DIFFICULTY_LABEL } from "@/lib/domain/faculties";
import { ai, useAIStatus } from "@/lib/ai/client";
import { recordError, recordEvidence } from "@/lib/services/evidence";
import { detectRedThreads } from "@/lib/adaptation/red-thread";
import { useSessionItem } from "@/lib/services/session-context";
import { Button, HairlineProgress, TextArea, useCountdown } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { MODE_META, audiencesFor, constraintLine } from "@/lib/rhetoric/modes";
import { evaluateDeterministic, mergeReview, textMetrics, type AIReview, type RhetoricResponse, type StoredFeedback } from "@/lib/rhetoric/evaluate";
import { HEDGES, countPhrases, wordCount } from "@/lib/scoring/text";
import { FeedbackView } from "./Feedback";
import { TopBar } from "./shared";
import { cx } from "@/lib/util/format";

type Phase = "brief" | "prep" | "respond";

const LIVE_STRUCTURE = new Set(["one_sentence", "three_people", "analogy", "argument", "steelman", "precision", "question"]);

/**
 * One exercise, any mode. The mode decides the composition: timed phases,
 * three fields, a source passage, live counts. The review is always the same shape.
 */
export function Exercise({ prompt, siblings }: { prompt: RhetoricPrompt; siblings: RhetoricPrompt[] }) {
  const { db } = useStudy();
  const router = useRouter();
  const aiStatus = useAIStatus();
  const { inSession, sessionId, finish } = useSessionItem();
  const meta = MODE_META[prompt.mode];
  const c = prompt.constraints ?? {};
  const timed = meta.timed && !!c.responseSeconds;
  const three = prompt.mode === "three_people";
  const audiences = audiencesFor(prompt);

  const [phase, setPhase] = useState<Phase>(timed ? "brief" : "respond");
  const [text, setText] = useState("");
  const [parts, setParts] = useState<string[]>(["", "", ""]);
  const [locked, setLocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<StoredFeedback | null>(null);
  const [entryId, setEntryId] = useState<string | null>(null);
  const startRef = useRef<number | null>(null);
  const fieldWrap = useRef<HTMLDivElement | null>(null);
  const actionWrap = useRef<HTMLDivElement | null>(null);

  const fullText = useMemo(() => (three ? parts.map((p, i) => `${audiences[i]}:\n${p.trim()}`).join("\n\n") : text), [three, parts, audiences, text]);
  const bodyText = three ? parts.join("\n\n") : text;
  const live = useMemo(() => textMetrics(bodyText), [bodyText]);
  const liveStructure = useMemo(() => (LIVE_STRUCTURE.has(prompt.mode) && bodyText.trim() ? evaluateDeterministic(prompt, { text: bodyText, parts: three ? parts : undefined }).structure : null), [prompt, bodyText, parts, three]);
  const sourceWords = prompt.source ? wordCount(prompt.source) : 0;
  const sourceHedges = prompt.source ? countPhrases(prompt.source, HEDGES) : 0;
  const empty = three ? parts.every((p) => !p.trim()) : !text.trim();

  // Timed phases
  const prepLeft = useCountdown(c.prepSeconds ?? 0, phase === "prep", () => setPhase("respond"));
  const respondLeft = useCountdown(c.responseSeconds ?? 0, timed && phase === "respond" && !locked && !result, () => setLocked(true));

  useEffect(() => {
    if (phase === "respond" && startRef.current === null) startRef.current = performance.now();
    if (phase === "respond" && timed) fieldWrap.current?.querySelector("textarea")?.focus();
  }, [phase, timed]);

  useEffect(() => {
    if (locked) actionWrap.current?.querySelector("button")?.focus();
  }, [locked]);

  useEffect(() => {
    if (phase !== "prep") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setPhase("respond");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  const review = useCallback(async () => {
    if (busy || result || empty) return;
    setBusy(true);
    const latencyMs = startRef.current === null ? undefined : Math.round(performance.now() - startRef.current);
    const response: RhetoricResponse = { text: fullText, parts: three ? parts : undefined, timedOut: locked };
    const det = evaluateDeterministic(prompt, response);
    let aiReview: AIReview | null = null;
    if (aiStatus.configured) {
      const r = await ai.call("evaluateRhetoric", { mode: prompt.mode, prompt: prompt.prompt, rubric: prompt.rubric, keyPoints: prompt.keyPoints ?? [], constraints: prompt.constraints ?? {}, source: prompt.source, response: fullText, text: fullText });
      if (r.ok) aiReview = r.data;
    }
    const feedback = mergeReview(det, aiReview);
    const entry = stamp<RhetoricEntry>(db.userId, "rh", {
      promptId: prompt.id,
      mode: prompt.mode,
      text: fullText,
      wordCount: det.metrics.words,
      latencyMs,
      feedback,
      sessionId: sessionId ?? undefined,
    });
    await db.store("rhetoric_entries").put(entry);
    const source = { kind: "rhetoric" as const, refId: prompt.id, label: `Rhetoric · ${prompt.title}` };
    const format = timed ? ("timed" as const) : ("free" as const);
    for (const subskill of prompt.subskills) {
      await recordEvidence(db, { subskill, score: feedback.score, difficulty: prompt.difficulty, format, source, latencyMs, sessionId: sessionId ?? undefined });
    }
    if (c.maxWords && det.constraint.overWords > c.maxWords * 0.15) {
      await recordError(db, { type: "VERBOSITY", subskill: "rhetoric.concision", source, detail: `${det.metrics.words} words against a limit of ${c.maxWords} (${prompt.title}).`, sessionId: sessionId ?? undefined });
    }
    if (prompt.mode === "precision" && det.coverage.missing.length && det.coverage.ratio < 0.7) {
      await recordError(db, { type: "NUMERIC_DETAIL_LOSS", subskill: "rhetoric.precision", source, detail: `Cut lost ${det.coverage.missing.length} of ${(prompt.keyPoints ?? []).length} facts: ${det.coverage.missing.map((k) => k.split("|")[0]).join(", ")}.`, sessionId: sessionId ?? undefined });
    }
    if (det.metrics.hedgeCount >= 3) {
      await recordError(db, { type: "PRECISION", subskill: "rhetoric.precision", source, detail: `${det.metrics.hedgeCount} hedges in ${det.metrics.words} words.`, sessionId: sessionId ?? undefined });
    }
    detectRedThreads(db).catch(() => {});
    setResult(feedback);
    setEntryId(entry.id);
    setBusy(false);
  }, [busy, result, empty, fullText, three, parts, locked, prompt, aiStatus.configured, db, sessionId, timed, c.maxWords]);

  function reset() {
    setPhase(timed ? "brief" : "respond");
    setText("");
    setParts(["", "", ""]);
    setLocked(false);
    setResult(null);
    setEntryId(null);
    startRef.current = null;
  }

  function another() {
    const others = siblings.filter((p) => p.id !== prompt.id);
    if (!others.length) {
      router.push(`/v1/rhetoric/${prompt.mode}`);
      return;
    }
    const next = others[Math.floor(Math.random() * others.length)];
    router.push(`/v1/rhetoric/${prompt.mode}/${next.id}`);
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      void review();
    }
  };

  const fieldDisabled = locked || busy || !!result || (timed && phase !== "respond");

  return (
    <div className="page">
      <TopBar href={`/v1/rhetoric/${prompt.mode}`} label={meta.title} />
      <header className="mb-6 max-w-[72ch]">
        <div className="eyebrow eyebrow-wine">
          {meta.title} · {DIFFICULTY_LABEL[prompt.difficulty]}
          {constraintLine(prompt) ? <span className="text-ink-4"> · {constraintLine(prompt)}</span> : null}
          {prompt.origin === "generated" ? <span className="text-ink-4"> · generated</span> : null}
        </div>
        <h1 className="display text-[30px] md:text-[36px] mt-1">{prompt.title}</h1>
        <p className="serif text-[17px] md:text-[18px] text-ink-2 leading-relaxed mt-3">{prompt.prompt}</p>
      </header>

      {prompt.source ? (
        <div className="sheet paper-texture p-5 md:p-7 mb-6 max-w-[72ch]">
          <div className="flex items-baseline justify-between gap-4 mb-3">
            <div className="eyebrow">{prompt.mode === "steelman" ? "The weak version" : "The passage"}</div>
            <div className="numeral text-[12px] text-ink-3">
              {sourceWords} words{prompt.mode === "precision" ? ` · ${sourceHedges} hedge${sourceHedges === 1 ? "" : "s"}` : ""}
            </div>
          </div>
          <p className="serif text-[17px] text-ink leading-relaxed whitespace-pre-wrap">{prompt.source}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_240px] gap-x-10 gap-y-8">
        <div className="min-w-0">
          {timed && phase === "brief" && !result ? (
            <div className="border-t border-line pt-5">
              <p className="text-[14px] text-ink-2 max-w-[56ch]">
                {c.prepSeconds ? `${c.prepSeconds} seconds to think, then ` : "Then "}
                {c.responseSeconds} seconds to answer. The field locks when the clock stops; whatever is on the page is what gets reviewed.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <Button size="lg" onClick={() => setPhase(c.prepSeconds ? "prep" : "respond")} autoFocus>
                  Begin <I.ArrowRight size={14} />
                </Button>
              </div>
            </div>
          ) : null}

          {timed && phase === "prep" ? (
            <div className="border-t border-line pt-5" role="timer" aria-live="polite" aria-label="Preparation time">
              <div className="eyebrow">Think</div>
              <div className="numeral text-[56px] md:text-[64px] leading-none mt-2 text-ink">{Math.ceil(prepLeft)}</div>
              <HairlineProgress value={c.prepSeconds ? prepLeft / c.prepSeconds : 0} className="mt-4 max-w-[320px]" />
              <p className="mt-4 text-[13px] text-ink-3">Do not write yet. Decide on the first sentence and the last.</p>
              <Button variant="secondary" size="sm" className="mt-4" onClick={() => setPhase("respond")}>
                Start now <span className="text-ink-4 ml-1">Space</span>
              </Button>
            </div>
          ) : null}

          {phase === "respond" ? (
            <div ref={fieldWrap} className={cx(timed && "anim-place")}>
              {timed && !result ? (
                <div className="flex items-center justify-between gap-4 mb-3" role="timer" aria-live="off" aria-label="Response time">
                  <div className="flex items-baseline gap-3">
                    <span className={cx("numeral text-[34px] leading-none", locked ? "text-wine" : "text-ink")}>{Math.ceil(respondLeft)}</span>
                    <span className="text-[12px] text-ink-3">{locked ? "time" : "seconds"}</span>
                  </div>
                  <HairlineProgress value={c.responseSeconds ? respondLeft / c.responseSeconds : 0} className="flex-1 max-w-[280px]" />
                </div>
              ) : null}

              {three ? (
                <div className="space-y-5">
                  {audiences.map((a, i) => (
                    <div key={a}>
                      <TextArea
                        label={a}
                        serif
                        rows={meta.rows}
                        value={parts[i]}
                        onChange={(e) => setParts((ps) => ps.map((p, j) => (j === i ? e.target.value : p)))}
                        onKeyDown={onKeyDown}
                        disabled={fieldDisabled}
                        placeholder={i === 0 ? "Two or three sentences." : ""}
                        hint={`${wordCount(parts[i])} words`}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <TextArea
                  label={meta.instruction}
                  serif={meta.serif}
                  rows={meta.rows}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={onKeyDown}
                  disabled={fieldDisabled}
                  autoFocus={!timed}
                  placeholder={locked ? "" : placeholderFor(prompt)}
                  aria-label="Your response"
                />
              )}

              <LiveStrip prompt={prompt} words={live.words} sentences={live.sentences} hedges={live.hedgeCount} fillers={live.fillerCount} sourceWords={sourceWords} sourceHedges={sourceHedges} />

              {liveStructure && !result ? (
                <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5" aria-label="Structure">
                  {liveStructure.map((s) => (
                    <li key={s.label} className={cx("inline-flex items-center gap-2 text-[12px]", s.ok ? "text-ink" : "text-ink-4")}>
                      <span className={cx("w-[6px] h-[6px] rounded-full", s.ok ? "bg-forest" : "bg-line-2")} aria-hidden />
                      {s.label}
                      <span className="sr-only">{s.ok ? " present" : " missing"}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {!result ? (
                <div ref={actionWrap} className="mt-5 flex flex-wrap items-center gap-3">
                  <Button size="lg" onClick={review} disabled={busy || empty}>
                    {busy ? "Reading…" : locked ? "Review what is on the page" : timed ? "Finish and review" : "Review"}
                  </Button>
                  <span className="text-[12px] text-ink-3">⌘↵</span>
                  {locked ? <span className="text-[12px] text-wine">The clock stopped. The field is locked.</span> : null}
                </div>
              ) : null}
            </div>
          ) : null}

          {result ? (
            <>
              <FeedbackView feedback={result} prompt={prompt} configured={aiStatus.configured} className="mt-8" />
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {inSession ? (
                  <Button size="lg" onClick={() => finish()}>
                    Continue the session <I.ArrowRight size={14} />
                  </Button>
                ) : (
                  <>
                    <Button size="lg" onClick={another}>
                      Another {meta.title.toLowerCase()} prompt
                    </Button>
                    <Button variant="secondary" onClick={reset}>
                      Try this one again
                    </Button>
                  </>
                )}
                {entryId ? (
                  <Link href={`/v1/rhetoric/entry/${entryId}`} className="text-[12px] text-ink-3 hover:text-ink ml-auto">
                    Saved to your history
                  </Link>
                ) : null}
              </div>
            </>
          ) : null}
        </div>

        <aside className="space-y-6 lg:pt-1">
          <div>
            <div className="eyebrow mb-2">What is being judged</div>
            <ul className="space-y-2.5">
              {prompt.rubric.map((r, i) => (
                <li key={i}>
                  <div className="text-[13px] text-ink-2 leading-snug">{r.criterion}</div>
                  <HairlineProgress value={r.weight} className="mt-1.5 max-w-[120px]" />
                </li>
              ))}
            </ul>
          </div>
          {result && prompt.keyPoints?.length ? (
            <div className="border-t border-line pt-3">
              <div className="eyebrow mb-2">A strong answer usually touches</div>
              <ul className="space-y-1.5">
                {prompt.keyPoints.map((k) => {
                  const hit = k.split("|").some((a) => bodyText.toLowerCase().includes(a.trim().toLowerCase()));
                  return (
                    <li key={k} className={cx("text-[12px] leading-snug border-l pl-2", hit ? "border-forest text-ink-2" : "border-line text-ink-4")}>
                      {k.split("|")[0]}
                      {hit ? <span className="sr-only"> (reached)</span> : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
          <p className="text-[11px] text-ink-4 border-t border-line pt-3">
            {meta.minutes} minutes · {prompt.subskills.length} subskill{prompt.subskills.length === 1 ? "" : "s"} evidenced · {aiStatus.configured ? `reviewed with ${aiStatus.model ?? "a model"} on top of the deterministic read` : "deterministic review"}
          </p>
        </aside>
      </div>
    </div>
  );
}

function LiveStrip({ prompt, words, sentences, hedges, fillers, sourceWords, sourceHedges }: { prompt: RhetoricPrompt; words: number; sentences: number; hedges: number; fillers: number; sourceWords: number; sourceHedges: number }) {
  const c = prompt.constraints ?? {};
  const overW = !!c.maxWords && words > c.maxWords;
  const overS = !!c.maxSentences && sentences > c.maxSentences;
  const reduction = sourceWords && words ? Math.round((1 - words / sourceWords) * 100) : null;
  return (
    <div className="mt-2 flex flex-wrap items-baseline gap-x-5 gap-y-1 text-[12px] text-ink-3" aria-live="polite">
      <span className={cx("numeral", overW && "text-wine")}>
        {words}
        {c.maxWords ? ` / ${c.maxWords}` : ""} words
      </span>
      <span className={cx("numeral", overS && "text-wine")}>
        {sentences}
        {c.maxSentences ? ` / ${c.maxSentences}` : ""} sentence{sentences === 1 && !c.maxSentences ? "" : "s"}
      </span>
      <span className={cx("numeral", hedges > 0 && "text-wine")}>{hedges} hedge{hedges === 1 ? "" : "s"}</span>
      {fillers > 0 ? <span className="numeral text-wine">{fillers} filler{fillers === 1 ? "" : "s"}</span> : null}
      {prompt.mode === "precision" && sourceWords ? (
        <span className="numeral">
          source {sourceWords} words · {sourceHedges} hedges{reduction !== null ? ` · cut ${Math.max(0, reduction)}%` : ""}
        </span>
      ) : null}
    </div>
  );
}

function placeholderFor(p: RhetoricPrompt): string {
  switch (p.mode) {
    case "one_sentence":
      return "One sentence.";
    case "thirty_seconds":
    case "impromptu":
      return "Type as you would speak.";
    case "story":
      return "Start inside the moment.";
    case "anecdote":
      return "The setup, the turn, the line.";
    case "analogy":
      return "It is like…";
    case "argument":
      return "The claim first.";
    case "steelman":
      return "The strongest version, in its defenders' voice.";
    case "precision":
      return "The same facts, fewer words.";
    case "question":
      return "The question, then why it is worth their time.";
    default:
      return "";
  }
}
