"use client";

import React, { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { PressureMode } from "@/lib/domain/types";
import { CHANGE_EXERCISES } from "@/content";
import { buildScene, mutateScene, SceneSvg, listTemplates } from "@/lib/scene";
import { splitClaims, claimMatchesFact } from "@/lib/scoring/observation";
import { Button, TextArea } from "@/components/ui/primitives";
import { ModeHeader, PressureControl, ResultPanel, TimedReveal, ListBlock, pressureFactor, useObservationRecorder, usePick, useStart } from "./shared";
import { todayKey } from "@/lib/util/format";

export function Change() {
  const params = useSearchParams();
  const { record, defaultPressure } = useObservationRecorder();
  const exercise = usePick(CHANGE_EXERCISES, params.get("exercise"), todayKey() + ":change");
  const [nonce, setNonce] = useState(0);
  const [pressure, setPressure] = useState<PressureMode>(defaultPressure);
  const [phase, setPhase] = useState<"a" | "between" | "b" | "write" | "done">("a");
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ matched: number[]; falseClaims: string[] } | null>(null);
  const timer = useStart();
  const template = exercise?.scene.template ?? listTemplates()[0]?.id ?? "office";
  const seed = (exercise?.scene.seed ?? 2718) + nonce * 7907;
  const changes = exercise?.changes ?? 3;
  const sceneA = useMemo(() => buildScene(template, seed), [template, seed]);
  const { sceneB, mutations } = useMemo(() => mutateScene(sceneA, changes, seed + 99), [sceneA, changes, seed]);
  const seconds = Math.max(4, Math.round((exercise?.seconds ?? 15) * pressureFactor(pressure)));

  async function submit() {
    const claims = splitClaims(text);
    const matched: number[] = [];
    const falseClaims: string[] = [];
    for (const c of claims) {
      const idx = mutations.findIndex((m, i) => !matched.includes(i) && claimMatchesFact(c, { id: String(i), text: m.description, keywords: m.keywords, category: "object", importance: 2 }));
      if (idx >= 0) matched.push(idx);
      else falseClaims.push(c);
    }
    setResult({ matched, falseClaims });
    setPhase("done");
    const coverage = mutations.length ? matched.length / mutations.length : 0;
    const precision = matched.length + falseClaims.length ? matched.length / (matched.length + falseClaims.length) : 1;
    await record({
      mode: "change",
      exerciseId: exercise?.id ?? `${template}:${seed}`,
      exposureSeconds: seconds,
      pressure,
      coverage,
      precision,
      correct: matched.length,
      total: mutations.length,
      falseClaims: falseClaims.length,
      latencyMs: timer.elapsed(),
      details: { template, seed, mutations: mutations.map((m) => m.description), claims },
      difficulty: exercise?.difficulty ?? 3,
      label: `Change Detection · ${sceneA.title}`,
      evidence: [
        { subskill: "observation.change", score: Math.max(0, coverage - falseClaims.length * 0.15) },
        { subskill: "observation.precision", score: precision },
      ],
      errors: [
        ...mutations.filter((_, i) => !matched.includes(i)).slice(0, 3).map((m) => ({ type: (m.kind === "move" || m.kind === "swap" ? "SPATIAL_MISS" : "OBSERVATION_MISS") as "SPATIAL_MISS" | "OBSERVATION_MISS", subskill: "observation.change" as const, detail: `Missed change: ${m.description}.` })),
        ...falseClaims.slice(0, 2).map((c) => ({ type: "FALSE_OBSERVATION" as const, subskill: "observation.precision" as const, detail: `Reported a change that did not happen: "${c}".` })),
      ],
    });
  }

  return (
    <div className="page">
      <ModeHeader mode="change" title={sceneA.title}>
        <p className="text-[14px] text-ink-2 mt-2">{sceneA.setting} · {changes} changes between A and B.</p>
      </ModeHeader>
      {phase === "a" ? (
        <div className="space-y-5">
          <PressureControl value={pressure} onChange={setPressure} />
          <TimedReveal seconds={seconds} label="Show scene A" onHidden={() => setPhase("between")} intro={<p className="text-[14px] text-ink-2">Scene A for <span className="numeral text-ink">{seconds} seconds</span>, then scene B for the same. Then list what changed, one per line.</p>}>
            <div className="stage"><SceneSvg scene={sceneA} className="w-full h-auto block" /></div>
          </TimedReveal>
        </div>
      ) : null}
      {phase === "between" ? (
        <div className="sheet p-6 anim-place">
          <p className="serif text-[18px]">Scene A is gone. Ready for B?</p>
          <Button size="lg" className="mt-4" onClick={() => setPhase("b")}>Show scene B</Button>
        </div>
      ) : null}
      {phase === "b" ? (
        <TimedRevealAuto seconds={seconds} onHidden={() => { timer.reset(); setPhase("write"); }}>
          <div className="stage"><SceneSvg scene={sceneB} className="w-full h-auto block" /></div>
        </TimedRevealAuto>
      ) : null}
      {phase === "write" ? (
        <div className="anim-place">
          <TextArea label="What changed? One per line" serif rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder={"the lamp moved to the window\nthe cup is now green\nthe umbrella is gone"} onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void submit(); }} autoFocus />
          <div className="mt-5"><Button size="lg" onClick={submit} disabled={text.trim().length < 3}>Score it</Button></div>
        </div>
      ) : null}
      {phase === "done" && result ? (
        <ResultPanel coverage={mutations.length ? result.matched.length / mutations.length : 0} precision={result.matched.length + result.falseClaims.length ? result.matched.length / (result.matched.length + result.falseClaims.length) : 1} correct={result.matched.length} total={mutations.length} falseClaims={result.falseClaims.length} onAgain={() => { setNonce((n) => n + 1); setText(""); setResult(null); setPhase("a"); }} againLabel="Another pair">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><div className="eyebrow mb-2">A</div><div className="stage"><SceneSvg scene={sceneA} className="w-full h-auto block" /></div></div>
            <div><div className="eyebrow mb-2">B</div><div className="stage"><SceneSvg scene={sceneB} className="w-full h-auto block" /></div></div>
          </div>
          <ListBlock title="Caught" tone="ok" items={mutations.filter((_, i) => result.matched.includes(i)).map((m) => m.description)} />
          <ListBlock title="Missed" tone="wine" items={mutations.filter((_, i) => !result.matched.includes(i)).map((m) => m.description)} />
          <ListBlock title="Did not happen" tone="muted" items={result.falseClaims} />
        </ResultPanel>
      ) : null}
    </div>
  );
}

/** A reveal that starts immediately (scene B). */
function TimedRevealAuto({ seconds, children, onHidden }: { seconds: number; children: React.ReactNode; onHidden: () => void }) {
  return (
    <AutoStart>
      <TimedReveal seconds={seconds} onHidden={onHidden} label="Show scene B">{children}</TimedReveal>
    </AutoStart>
  );
}

function AutoStart({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const t = setTimeout(() => window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" })), 50);
    return () => clearTimeout(t);
  }, []);
  return <>{children}</>;
}
