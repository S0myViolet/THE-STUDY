"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { MISSING_EXERCISES } from "@/content";
import { claimMatchesFact, splitClaims } from "@/lib/scoring/observation";
import { Button, TextArea } from "@/components/ui/primitives";
import { ModeHeader, ResultPanel, ListBlock, useObservationRecorder, usePick, useStart } from "./shared";
import { todayKey } from "@/lib/util/format";

export function Missing() {
  const params = useSearchParams();
  const { record } = useObservationRecorder();
  const exercise = usePick(MISSING_EXERCISES, params.get("exercise"), todayKey() + ":missing");
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ found: number[]; falseClaims: string[]; distracted: string[] } | null>(null);
  const timer = useStart();
  if (!exercise) return <div className="page"><ModeHeader mode="missing" /><p className="text-ink-3">Exercises are being prepared.</p></div>;

  async function submit() {
    const claims = splitClaims(text);
    const found: number[] = [];
    const falseClaims: string[] = [];
    const distracted: string[] = [];
    for (const c of claims) {
      const idx = exercise!.missing.findIndex((m, i) => !found.includes(i) && claimMatchesFact(c, { id: String(i), text: m.text, keywords: m.keywords, category: "anomaly", importance: 3 }));
      if (idx >= 0) { found.push(idx); continue; }
      if (exercise!.distractors.some((d) => claimMatchesFact(c, { id: "d", text: d.text, keywords: d.keywords, category: "object", importance: 1 }))) distracted.push(c);
      else falseClaims.push(c);
    }
    setResult({ found, falseClaims, distracted });
    const coverage = found.length / exercise!.missing.length;
    const precision = found.length + falseClaims.length + distracted.length ? found.length / (found.length + falseClaims.length + distracted.length) : 1;
    await record({
      mode: "missing",
      exerciseId: exercise!.id,
      pressure: "standard",
      coverage,
      precision,
      correct: found.length,
      total: exercise!.missing.length,
      falseClaims: falseClaims.length + distracted.length,
      latencyMs: timer.elapsed(),
      details: { claims },
      difficulty: exercise!.difficulty,
      label: `What Is Missing · ${exercise!.title}`,
      evidence: [{ subskill: "observation.anomaly", score: Math.max(0, coverage - distracted.length * 0.2) }, { subskill: "inference.evidence_weighting", score: precision }],
      errors: distracted.slice(0, 2).map((c) => ({ type: "ASSUMPTION" as const, subskill: "observation.anomaly" as const, detail: `Claimed "${c}" was missing, but its absence was not evidence of anything.` })),
    });
  }

  return (
    <div className="page">
      <ModeHeader mode="missing" title={exercise.title} />
      <div className="sheet paper-texture p-6 md:p-8 mb-6"><p className="prose-study">{exercise.scene}</p></div>
      {!result ? (
        <div>
          <TextArea label="What would you expect here that is absent? One per line" serif rows={5} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void submit(); }} placeholder="the smell of food" />
          <p className="mt-2 text-[12px] text-ink-3">Absence is evidence only when presence was expected. Name the expectation, not every possible object.</p>
          <div className="mt-5"><Button size="lg" onClick={submit} disabled={text.trim().length < 3}>Score it</Button></div>
        </div>
      ) : (
        <ResultPanel coverage={result.found.length / exercise.missing.length} precision={result.found.length + result.falseClaims.length + result.distracted.length ? result.found.length / (result.found.length + result.falseClaims.length + result.distracted.length) : 1} correct={result.found.length} total={exercise.missing.length} falseClaims={result.falseClaims.length + result.distracted.length} onAgain={() => { setText(""); setResult(null); timer.reset(); }} againLabel="Try another reading">
          <ListBlock title="You noticed the absence of" tone="ok" items={exercise.missing.filter((_, i) => result.found.includes(i)).map((m) => `${m.text} — ${m.why}`)} />
          <ListBlock title="Also absent, and telling" tone="wine" items={exercise.missing.filter((_, i) => !result.found.includes(i)).map((m) => `${m.text} — ${m.why}`)} />
          <ListBlock title="Absent, but not informative" tone="muted" items={result.distracted} />
          <ListBlock title="Not clearly implied by the scene" tone="muted" items={result.falseClaims} />
        </ResultPanel>
      )}
    </div>
  );
}
