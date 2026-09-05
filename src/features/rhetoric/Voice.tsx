"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useStudy, useStudyQuery } from "@/lib/persistence/provider";
import { stamp } from "@/lib/persistence/store";
import type { RhetoricPrompt, VoiceSession } from "@/lib/domain/types";
import { recordEvidence } from "@/lib/services/evidence";
import { detectRedThreads } from "@/lib/adaptation/red-thread";
import { useSessionItem } from "@/lib/services/session-context";
import { Button, HairlineProgress, Note, PageHeader, Segmented, Select, TextArea, useCountdown } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { MODE_META } from "@/lib/rhetoric/modes";
import { voiceMetrics, voiceScore } from "@/lib/rhetoric/evaluate";
import { transcribe, transcriptionEnabled } from "@/lib/rhetoric/transcribe";
import { FILLERS } from "@/lib/scoring/text";
import { TopBar } from "./shared";
import { cx, plural, shortDate } from "@/lib/util/format";

type Support = "unknown" | "mic" | "timed";
type Stage = "idle" | "recording" | "recorded" | "saved";

const BARS = 48;
const SPEAKABLE = new Set(["thirty_seconds", "impromptu", "one_sentence", "anecdote", "story", "analogy"]);
const DURATIONS = [30, 60, 90] as const;

const subscribeNothing = () => () => {};
const detectSupport = (): Support => (typeof MediaRecorder !== "undefined" && !!navigator.mediaDevices?.getUserMedia ? "mic" : "timed");
const serverSupport = (): Support => "unknown";

function fmt(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/**
 * Voice practice. The microphone path records locally (never uploaded, never
 * persisted); the fallback is a timed speaking round. Either way the transcript
 * is typed, and the metrics come from the transcript and the clock.
 */
export function Voice({ prompts }: { prompts: RhetoricPrompt[] }) {
  const { db } = useStudy();
  const { inSession, sessionId, finish } = useSessionItem();
  const past = useStudyQuery((db) => db.store("voice_sessions").list({ orderBy: "createdAt", desc: true, limit: 8 }), ["voice_sessions"]);
  const speakable = useMemo(() => prompts.filter((p) => SPEAKABLE.has(p.mode)), [prompts]);

  const detected = useSyncExternalStore(subscribeNothing, detectSupport, serverSupport);
  const [override, setSupport] = useState<Support | null>(null);
  const support: Support = override ?? detected;
  const [stage, setStage] = useState<Stage>("idle");
  const [promptId, setPromptId] = useState<string>("");
  const [durationMs, setDurationMs] = useState(0);
  const [levels, setLevels] = useState<number[]>(() => Array(BARS).fill(0));
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [timedSeconds, setTimedSeconds] = useState<(typeof DURATIONS)[number]>(60);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<VoiceSession | null>(null);

  const recRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef(0);
  const startRef = useRef(0);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);

  const prompt = speakable.find((p) => p.id === promptId);
  const canTranscribe = transcriptionEnabled();

  const teardown = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      teardown();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startMic() {
    setNote(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const rec = new MediaRecorder(stream);
      recRef.current = rec;
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        blobRef.current = blob;
        setAudioUrl((old) => {
          if (old) URL.revokeObjectURL(old);
          return URL.createObjectURL(blob);
        });
      };
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.fftSize);
      startRef.current = performance.now();
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        setLevels((ls) => [...ls.slice(1), Math.min(1, rms * 3)]);
        setDurationMs(performance.now() - startRef.current);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      rec.start();
      setStage("recording");
    } catch {
      teardown();
      setSupport("timed");
      setNote("The microphone is unavailable or permission was refused. Timed speaking works without it: speak aloud against the clock, then type what you said.");
    }
  }

  function stopMic() {
    const rec = recRef.current;
    const elapsed = performance.now() - startRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
    teardown();
    setDurationMs(elapsed);
    setStage("recorded");
  }

  // Timed speaking fallback
  const timedRunning = support === "timed" && stage === "recording";
  const left = useCountdown(timedSeconds, timedRunning, () => {
    setDurationMs(timedSeconds * 1000);
    setStage("recorded");
  });

  function startTimed() {
    setNote(null);
    startRef.current = performance.now();
    setStage("recording");
  }

  function stopTimed() {
    setDurationMs(performance.now() - startRef.current);
    setStage("recorded");
  }

  function reset() {
    teardown();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    blobRef.current = null;
    setTranscript("");
    setDurationMs(0);
    setLevels(Array(BARS).fill(0));
    setSaved(null);
    setNote(null);
    setStage("idle");
  }

  async function runTranscription() {
    if (!blobRef.current) return;
    setBusy(true);
    const text = await transcribe(blobRef.current);
    if (text) setTranscript(text);
    else setNote("The transcription service did not return text. Type the transcript instead.");
    setBusy(false);
  }

  const metrics = useMemo(() => voiceMetrics(transcript, durationMs), [transcript, durationMs]);
  const fillersFound = useMemo(() => {
    const t = " " + transcript.toLowerCase().replace(/[^a-z'\s]/g, " ").replace(/\s+/g, " ") + " ";
    return FILLERS.filter((f) => t.includes(" " + f + " "));
  }, [transcript]);

  async function save() {
    if (busy || stage !== "recorded") return;
    setBusy(true);
    const hasTranscript = transcript.trim().length > 0;
    const m = hasTranscript ? { fillerWords: metrics.fillerWords, wordsPerMinute: metrics.wordsPerMinute, words: metrics.words } : undefined;
    const session = stamp<VoiceSession>(db.userId, "voice", { promptId: prompt?.id, durationMs: Math.round(durationMs), transcript: hasTranscript ? transcript.trim() : undefined, metrics: m });
    await db.store("voice_sessions").put(session);
    if (hasTranscript && metrics.words >= 10) {
      const score = voiceScore(metrics);
      const source = { kind: "rhetoric" as const, refId: prompt?.id ?? "voice", label: `Voice · ${prompt?.title ?? "free speaking"}` };
      const difficulty = prompt?.difficulty ?? 3;
      await recordEvidence(db, { subskill: "rhetoric.clarity", score, difficulty, format: "timed", source, latencyMs: Math.round(durationMs), sessionId: sessionId ?? undefined });
      await recordEvidence(db, { subskill: "composure.pressure", score, difficulty, format: "timed", source, latencyMs: Math.round(durationMs), sessionId: sessionId ?? undefined });
      detectRedThreads(db).catch(() => {});
    }
    setSaved(session);
    setStage("saved");
    setBusy(false);
  }

  const recording = stage === "recording";

  return (
    <div className="page">
      <TopBar href="/rhetoric" label="Rhetoric" />
      <PageHeader eyebrow="Voice" title="Hear yourself" lede="Speak, then read what you said. Fillers and pace are counted from the transcript; the recording stays on this device and is gone when you leave." />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-x-10 gap-y-8">
        <div className="min-w-0">
          {stage === "idle" ? (
            <div className="space-y-5 max-w-[560px]">
              <Select label="Speak to" value={promptId} onChange={(e) => setPromptId(e.target.value)}>
                <option value="">Free speaking: anything you have been meaning to explain</option>
                {speakable.map((p) => (
                  <option key={p.id} value={p.id}>
                    {MODE_META[p.mode].title} · {p.title}
                  </option>
                ))}
              </Select>
              {prompt ? <p className="serif text-[17px] text-ink-2 leading-relaxed">{prompt.prompt}</p> : null}
              {support === "timed" ? (
                <div>
                  <div className="eyebrow mb-1.5">Speaking time</div>
                  <Segmented value={String(timedSeconds)} onChange={(v) => setTimedSeconds(Number(v) as (typeof DURATIONS)[number])} label="Speaking time" options={DURATIONS.map((d) => ({ value: String(d), label: `${d}s` }))} />
                </div>
              ) : null}
              {note ? <Note tone="wine">{note}</Note> : null}
              <div className="flex flex-wrap items-center gap-3">
                {support === "mic" ? (
                  <Button size="lg" onClick={startMic}>
                    <I.Mic size={14} /> Record
                  </Button>
                ) : (
                  <Button size="lg" onClick={startTimed} disabled={support === "unknown"}>
                    <I.Clock size={14} /> Start speaking
                  </Button>
                )}
                {support === "mic" ? (
                  <button type="button" className="text-[12px] text-ink-3 hover:text-ink underline underline-offset-4" onClick={() => setSupport("timed")}>
                    Use timed speaking instead
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {recording ? (
            <div className="border-t border-line pt-5">
              {prompt ? <p className="serif text-[17px] text-ink-2 leading-relaxed mb-5 max-w-[60ch]">{prompt.prompt}</p> : null}
              <div className="flex items-end justify-between gap-6" role="timer" aria-live="off" aria-label="Recording time">
                <div>
                  <div className="eyebrow">{support === "mic" ? "Recording" : "Speaking"}</div>
                  <div className="numeral text-[56px] md:text-[64px] leading-none mt-2 text-ink">{support === "mic" ? fmt(durationMs) : Math.ceil(left)}</div>
                </div>
                {support === "mic" ? <LevelMeter levels={levels} live /> : null}
              </div>
              {support === "timed" ? <HairlineProgress value={left / timedSeconds} className="mt-4 max-w-[320px]" /> : null}
              <div className="mt-6 flex items-center gap-3">
                <Button size="lg" variant="wine" onClick={support === "mic" ? stopMic : stopTimed}>
                  Stop
                </Button>
                <span className="text-[12px] text-ink-3">{support === "mic" ? "Nothing is uploaded." : "Speak aloud. The clock is the only judge until you type."}</span>
              </div>
            </div>
          ) : null}

          {stage === "recorded" || stage === "saved" ? (
            <div className="space-y-6 anim-place">
              <div className="border-t border-line pt-4 flex flex-wrap items-baseline gap-x-8 gap-y-2">
                <div>
                  <div className="eyebrow">Duration</div>
                  <div className="numeral text-[24px] mt-1 leading-none">{fmt(durationMs)}</div>
                </div>
                {prompt ? (
                  <div className="min-w-0">
                    <div className="eyebrow">Prompt</div>
                    <div className="serif text-[17px] mt-1 leading-tight truncate">{prompt.title}</div>
                  </div>
                ) : null}
              </div>
              {audioUrl ? (
                <div>
                  <div className="eyebrow mb-2">Listen back</div>
                  <audio controls src={audioUrl} className="w-full max-w-[520px]" aria-label="Your recording" />
                  <p className="text-[11px] text-ink-4 mt-1.5">Kept in memory only. It is not saved and is discarded when you leave the page.</p>
                </div>
              ) : null}

              {stage === "recorded" ? (
                <>
                  <TextArea label="Transcript" serif rows={7} value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder={support === "mic" ? "Play it back and type what you said, word for word, fillers included." : "Type what you said, word for word, fillers included."} autoFocus hint={canTranscribe ? "A transcription service is configured; you can also type or correct the text." : "Transcription runs only if a transcription service is configured server-side. Type or paste the transcript."} onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void save(); }} />
                  {canTranscribe && audioUrl ? (
                    <Button variant="secondary" size="sm" onClick={runTranscription} disabled={busy}>
                      {busy ? "Transcribing…" : "Transcribe the recording"}
                    </Button>
                  ) : null}
                  {note ? <Note tone="wine">{note}</Note> : null}
                  <MetricsRow metrics={metrics} fillers={fillersFound} hasTranscript={transcript.trim().length > 0} />
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="lg" onClick={save} disabled={busy}>
                      {transcript.trim() ? "Save and review" : "Save without transcript"}
                    </Button>
                    <span className="text-[12px] text-ink-3">⌘↵</span>
                    <Button variant="ghost" onClick={reset} disabled={busy}>
                      Discard
                    </Button>
                  </div>
                </>
              ) : null}

              {stage === "saved" && saved ? (
                <section className="border-t border-ink pt-5" aria-label="Review">
                  <div className="eyebrow eyebrow-wine mb-3">Review</div>
                  {saved.transcript ? (
                    <>
                      <MetricsRow metrics={metrics} fillers={fillersFound} hasTranscript />
                      <div className="mt-5 space-y-3">
                        <Note tone={metrics.fillerWords === 0 ? "forest" : "wine"}>
                          <span className="eyebrow block mb-1">Fillers</span>
                          {metrics.fillerWords === 0 ? "None. Silence did the work a filler would have done badly." : `${plural(metrics.fillerWords, "filler")} in ${plural(metrics.words, "word")}${fillersFound.length ? ` (${fillersFound.slice(0, 3).join(", ")})` : ""}. Each is a pause you could have taken silently.`}
                        </Note>
                        <Note tone={metrics.wordsPerMinute !== undefined && metrics.wordsPerMinute >= 120 && metrics.wordsPerMinute <= 170 ? "forest" : "brass"}>
                          <span className="eyebrow block mb-1">Pace</span>
                          {metrics.wordsPerMinute === undefined ? `${Math.round(durationMs / 1000)} seconds is too short to judge pace. Five seconds is the minimum.` : paceLine(metrics.wordsPerMinute)}
                        </Note>
                      </div>
                      <p className="mt-4 text-[12px] text-ink-4">Score {Math.round(voiceScore(metrics) * 100)} from filler rate{metrics.wordsPerMinute !== undefined ? " and pace" : ""}, recorded to Clarity and Precision under pressure.</p>
                    </>
                  ) : (
                    <p className="text-[14px] text-ink-2">Saved with the duration only. Without a transcript there is nothing to count, so no evidence was recorded.</p>
                  )}
                  <div className="mt-6 flex flex-wrap gap-3">
                    {inSession ? (
                      <Button size="lg" onClick={() => finish()}>
                        Continue the session <I.ArrowRight size={14} />
                      </Button>
                    ) : (
                      <Button size="lg" onClick={reset}>
                        Record another
                      </Button>
                    )}
                    <Link href="/rhetoric/history" className="btn btn-secondary">
                      History
                    </Link>
                  </div>
                </section>
              ) : null}
            </div>
          ) : null}
        </div>

        <aside className="space-y-6">
          <div className="border-t border-line pt-3">
            <div className="eyebrow">What is counted</div>
            <ul className="mt-2 space-y-1.5 text-[13px] text-ink-2">
              <li>Words per minute: conversational speech sits around 120 to 170.</li>
              <li>Fillers: {FILLERS.slice(0, 6).join(", ")} and the like.</li>
              <li>Whether you ended on purpose or ran out.</li>
            </ul>
          </div>
          <div className="border-t border-line pt-3">
            <div className="eyebrow">Recent recordings</div>
            {past.data?.length ? (
              <ul className="mt-2 space-y-1.5">
                {past.data.map((v) => (
                  <li key={v.id} className="text-[12px] text-ink-2 flex items-baseline gap-3">
                    <span className="numeral w-10 shrink-0">{Math.round(v.durationMs / 1000)}s</span>
                    <span className="flex-1 min-w-0 truncate">{v.metrics?.wordsPerMinute ? `${v.metrics.wordsPerMinute} wpm · ${plural(v.metrics.fillerWords, "filler")}` : "no transcript"}</span>
                    <span className="text-ink-4 shrink-0">{shortDate(v.createdAt)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[12px] text-ink-3 mt-1.5">None yet.</p>
            )}
          </div>
          <p className="text-[11px] text-ink-4 border-t border-line pt-3">{support === "mic" ? "Microphone available. Audio is processed in the browser and never leaves it." : support === "timed" ? "No microphone path; timed speaking is in use." : ""}</p>
        </aside>
      </div>
    </div>
  );
}

function paceLine(wpm: number): string {
  if (wpm < 90) return `${wpm} words a minute: slow enough that a listener's attention drifts, unless every word is earning its place.`;
  if (wpm < 120) return `${wpm} words a minute: measured. Fine for a hard idea; a little slow for a story.`;
  if (wpm <= 170) return `${wpm} words a minute: conversational. A listener can follow without effort.`;
  if (wpm <= 200) return `${wpm} words a minute: quick. Fine if the sentences are short; otherwise slow the important one.`;
  return `${wpm} words a minute: rushing. Pauses are part of speech.`;
}

function MetricsRow({ metrics, fillers, hasTranscript }: { metrics: ReturnType<typeof voiceMetrics>; fillers: string[]; hasTranscript: boolean }) {
  return (
    <dl className="grid grid-cols-3 gap-x-6 gap-y-3 border-t border-line pt-4 max-w-[520px]" aria-live="polite">
      <div>
        <dt className="eyebrow">Words</dt>
        <dd className="numeral text-[20px] mt-1 leading-none">{hasTranscript ? metrics.words : "—"}</dd>
      </div>
      <div>
        <dt className="eyebrow">Fillers</dt>
        <dd className={cx("numeral text-[20px] mt-1 leading-none", metrics.fillerWords > 0 && "text-wine")}>{hasTranscript ? metrics.fillerWords : "—"}</dd>
        {fillers.length ? <dd className="text-[11px] text-ink-4 mt-1">{fillers.slice(0, 3).join(", ")}</dd> : null}
      </div>
      <div>
        <dt className="eyebrow">Per minute</dt>
        <dd className="numeral text-[20px] mt-1 leading-none">{hasTranscript && metrics.wordsPerMinute !== undefined ? metrics.wordsPerMinute : "—"}</dd>
        {hasTranscript && metrics.wordsPerMinute === undefined ? <dd className="text-[11px] text-ink-4 mt-1">under five seconds</dd> : null}
      </div>
    </dl>
  );
}

function LevelMeter({ levels, live }: { levels: number[]; live?: boolean }) {
  const W = 240;
  const H = 48;
  const gap = 1;
  const bw = (W - gap * (levels.length - 1)) / levels.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-[240px] max-w-full h-12" role="img" aria-label={live ? "Microphone level" : "Level"}>
      <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke="var(--line)" strokeWidth={1} />
      {levels.map((l, i) => {
        const h = Math.max(2, l * (H - 4));
        return <rect key={i} x={i * (bw + gap)} y={(H - h) / 2} width={bw} height={h} rx={1} fill={i === levels.length - 1 ? "var(--wine)" : "var(--ink)"} opacity={0.35 + (i / levels.length) * 0.65} />;
      })}
    </svg>
  );
}
