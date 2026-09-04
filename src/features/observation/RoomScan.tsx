"use client";

import React, { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { PressureMode } from "@/lib/domain/types";
import { ROOM_SCAN_EXERCISES } from "@/content";
import { buildScene, SceneSvg, listTemplates } from "@/lib/scene";
import { scoreObservationClaims, splitClaims, observationScore } from "@/lib/scoring/observation";
import { Button, TextArea } from "@/components/ui/primitives";
import { ModeHeader, PressureControl, ResultPanel, TimedReveal, ListBlock, pressureFactor, useObservationRecorder, usePick, useStart } from "./shared";
import { todayKey } from "@/lib/util/format";

export function RoomScan() {
  const params = useSearchParams();
  const { record, defaultPressure } = useObservationRecorder();
  const exercise = usePick(ROOM_SCAN_EXERCISES, params.get("exercise"), todayKey() + ":scan");
  const [nonce, setNonce] = useState(0);
  const [pressure, setPressure] = useState<PressureMode>(defaultPressure);
  const [phase, setPhase] = useState<"intro" | "write" | "done">("intro");
  const [text, setText] = useState("");
  const [result, setResult] = useState<ReturnType<typeof scoreObservationClaims> | null>(null);
  const timer = useStart();
  const template = exercise?.scene.template ?? listTemplates()[0]?.id ?? "cafe";
  const seed = (exercise?.scene.seed ?? 3141) + nonce * 104729;
  const scene = useMemo(() => buildScene(template, seed), [template, seed]);
  const seconds = Math.max(5, Math.round((exercise?.seconds ?? 30) * pressureFactor(pressure)));

  async function submit() {
    const claims = splitClaims(text);
    const r = scoreObservationClaims(claims, scene.facts);
    setResult(r);
    setPhase("done");
    const byCat = (cat: string) => scene.facts.filter((f) => f.category === cat);
    const catScore = (cat: string) => {
      const fs = byCat(cat);
      return fs.length ? fs.filter((f) => r.matchedFactIds.includes(f.id)).length / fs.length : undefined;
    };
    const anomalyScore = catScore("anomaly");
    const textScore = catScore("text");
    const posScore = catScore("position");
    const missedImportant = r.missedFacts.filter((f) => f.importance >= 2);
    await record({
      mode: "room_scan",
      exerciseId: exercise?.id ?? scene.id,
      exposureSeconds: seconds,
      pressure,
      coverage: r.weightedCoverage,
      precision: r.precision,
      correct: r.matchedFactIds.length,
      total: scene.facts.length,
      falseClaims: r.falseClaims.length,
      latencyMs: timer.elapsed(),
      details: { template, seed, claims, matched: r.matchedFactIds, falseClaims: r.falseClaims },
      difficulty: exercise?.difficulty ?? 3,
      label: `Room Scan · ${scene.title}`,
      evidence: [
        { subskill: "observation.detail", score: r.weightedCoverage },
        { subskill: "observation.precision", score: r.precision },
        ...(anomalyScore !== undefined ? [{ subskill: "observation.anomaly" as const, score: anomalyScore }] : []),
        ...(textScore !== undefined ? [{ subskill: "observation.text" as const, score: textScore }] : []),
        ...(posScore !== undefined ? [{ subskill: "observation.spatial" as const, score: posScore }] : []),
      ],
      errors: [
        ...r.falseClaims.slice(0, 3).map((c) => ({ type: "FALSE_OBSERVATION" as const, subskill: "observation.precision" as const, detail: `Reported "${c}", which was not in the scene.` })),
        ...missedImportant.slice(0, 3).map((f) => ({ type: f.category === "anomaly" ? ("OBSERVATION_MISS" as const) : f.category === "text" ? ("NUMERIC_DETAIL_LOSS" as const) : ("OBSERVATION_MISS" as const), subskill: (f.category === "text" ? "observation.text" : f.category === "anomaly" ? "observation.anomaly" : "observation.detail") as "observation.text" | "observation.anomaly" | "observation.detail", detail: `Missed: ${f.text}.` })),
      ],
    });
  }

  return (
    <div className="page">
      <ModeHeader mode="room_scan" title={scene.title}>
        <p className="text-[14px] text-ink-2 mt-2">{scene.setting}</p>
      </ModeHeader>
      {phase === "intro" ? (
        <div className="space-y-5">
          <PressureControl value={pressure} onChange={setPressure} />
          <TimedReveal seconds={seconds} onHidden={() => { timer.reset(); setPhase("write"); }} intro={<p className="text-[14px] text-ink-2">Look for <span className="numeral text-ink">{seconds} seconds</span>. Afterwards, write everything you noticed, one thing per line: objects, colours, text, positions, counts, anything odd. Hedge what you are unsure of (&ldquo;maybe a clock&rdquo;); a hedged miss costs half.</p>}>
            <div className="stage"><SceneSvg scene={scene} className="w-full h-auto block" /></div>
          </TimedReveal>
        </div>
      ) : null}
      {phase === "write" ? (
        <div className="anim-place">
          <TextArea label="Everything you noticed, one per line" serif rows={12} value={text} onChange={(e) => setText(e.target.value)} placeholder={"a burgundy notebook on the desk\nthree chairs by the window\nthe clock read 10:35\nmaybe an umbrella near the door"} onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void submit(); }} autoFocus />
          <div className="mt-5 flex items-center gap-3">
            <Button size="lg" onClick={submit} disabled={text.trim().length < 3}>Score it</Button>
            <span className="text-[12px] text-ink-3">⌘↵ to submit</span>
          </div>
        </div>
      ) : null}
      {phase === "done" && result ? (
        <ResultPanel coverage={result.weightedCoverage} precision={result.precision} correct={result.matchedFactIds.length} total={scene.facts.length} falseClaims={result.falseClaims.length} onAgain={() => { setNonce((n) => n + 1); setText(""); setResult(null); setPhase("intro"); }} againLabel="Another room">
          <p className="serif text-[18px] text-ink">
            {result.precision >= 0.9 && result.weightedCoverage < 0.5 ? "You invent almost nothing, and you see less than is there. Look longer before you look away." : result.precision < 0.7 ? "Some of what you reported was never there. Precision is the skill; coverage is the reward for it." : result.weightedCoverage >= 0.7 ? "Wide and accurate. The high-information details were mostly yours." : "A fair scan. The details that carried the most information are listed below."}
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="eyebrow mb-2">The scene, again</div>
              <div className="stage"><SceneSvg scene={scene} className="w-full h-auto block" /></div>
            </div>
            <div className="space-y-6">
              <ListBlock title="Matched" tone="ok" items={scene.facts.filter((f) => result.matchedFactIds.includes(f.id)).map((f) => f.text)} />
              <ListBlock title="Missed" tone="wine" items={result.missedFacts.sort((a, b) => b.importance - a.importance).map((f) => `${f.text}${f.importance === 3 ? " — high information" : ""}`)} />
              <ListBlock title="Not there" tone="muted" items={result.falseClaims} />
            </div>
          </div>
          <p className="text-[12px] text-ink-4">Score for the Profile: {Math.round(observationScore(result.weightedCoverage, result.precision) * 100)} — precision weighs more than coverage.</p>
        </ResultPanel>
      ) : null}
    </div>
  );
}
