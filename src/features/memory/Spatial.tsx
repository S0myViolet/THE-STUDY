"use client";

import React, { useMemo, useState } from "react";
import { useStudy } from "@/lib/persistence/provider";
import { buildScene, SceneSvg, listTemplates } from "@/lib/scene";
import { recordEvidence, recordError } from "@/lib/services/evidence";
import { Button, Select, useCountdown } from "@/components/ui/primitives";
import { MemoryHeader, Finish } from "./shared";
import { cx, seedFromString, todayKey } from "@/lib/util/format";
import { PASSTHROUGH, SURFACE } from "@/lib/scene/layout";

/** Study an arrangement for twenty seconds; then put each object back in its zone. */
export function Spatial() {
  const { db } = useStudy();
  const [round, setRound] = useState(0);
  const templates = listTemplates();
  const template = templates[(seedFromString(todayKey()) + round) % Math.max(1, templates.length)]?.id ?? "study";
  const seed = 5000 + ((seedFromString(todayKey() + ":spatial") + round * 131) % 4000);
  const scene = useMemo(() => buildScene(template, seed), [template, seed]);
  const items = useMemo(() => scene.objects.filter((o) => !!o.zone && !PASSTHROUGH.has(o.type) && !SURFACE.has(o.type)).slice(0, 8), [scene]);
  const zones = scene.zones.map((z) => z.name);
  const [phase, setPhase] = useState<"intro" | "study" | "place" | "done">("intro");
  const left = useCountdown(20, phase === "study", () => setPhase("place"));
  const [placement, setPlacement] = useState<Record<string, string>>({});
  const [score, setScore] = useState<number | null>(null);

  async function submit() {
    const correct = items.filter((o) => placement[o.id] === o.zone).length;
    const s = items.length ? correct / items.length : 0;
    setScore(s);
    setPhase("done");
    const source = { kind: "memory" as const, refId: scene.id, label: `Spatial · ${scene.title}` };
    await recordEvidence(db, { subskill: "memory.spatial", score: s, difficulty: 3, format: "sort", source });
    await recordEvidence(db, { subskill: "observation.spatial", score: s, difficulty: 3, format: "sort", source });
    if (s < 0.5) await recordError(db, { type: "SPATIAL_MISS", subskill: "memory.spatial", source, detail: `${scene.title}: placed ${correct} of ${items.length} correctly.` });
  }

  return (
    <div className="page">
      <MemoryHeader title={`Spatial · ${scene.title}`} />
      {phase === "intro" ? (
        <div className="sheet p-6"><p className="text-[14px] text-ink-2 max-w-[60ch]">Twenty seconds with the room. Then the room is gone and you are given its objects; put each one back where it was.</p><Button size="lg" className="mt-5" onClick={() => setPhase("study")}>Show the room</Button></div>
      ) : null}
      {phase === "study" ? (
        <div><div className="flex items-center justify-between mb-3"><span className="eyebrow">Study</span><span className="numeral text-[14px]">{Math.ceil(left)}s</span></div><div className="stage"><SceneSvg scene={scene} className="w-full h-auto block" /></div></div>
      ) : null}
      {phase === "place" ? (
        <div className="anim-place">
          <p className="text-[13px] text-ink-3 mb-4">Where was each of these?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((o) => (
              <Select key={o.id} label={`${o.type}${o.label ? ` (${o.label})` : ""}`} value={placement[o.id] ?? ""} onChange={(e) => setPlacement((p) => ({ ...p, [o.id]: e.target.value }))}>
                <option value="">—</option>
                {zones.map((z) => <option key={z} value={z}>{z}</option>)}
              </Select>
            ))}
          </div>
          <Button size="lg" className="mt-6" onClick={submit} disabled={items.some((o) => !placement[o.id])}>Commit</Button>
        </div>
      ) : null}
      {phase === "done" && score !== null ? (
        <div className="anim-place space-y-6">
          <div className="border-t border-ink pt-4"><div className="eyebrow">Placed correctly</div><div className="numeral text-[28px] mt-1">{Math.round(score * items.length)} / {items.length}</div></div>
          <div className="stage"><SceneSvg scene={scene} className="w-full h-auto block" /></div>
          <ul className="space-y-1">{items.map((o) => <li key={o.id} className={cx("text-[14px] pl-3 border-l", placement[o.id] === o.zone ? "border-forest" : "border-wine")}>{o.type}{o.label ? ` (${o.label})` : ""}: {o.zone}{placement[o.id] !== o.zone ? ` — you said ${placement[o.id]}` : ""}</li>)}</ul>
          <Finish onAgain={() => { setRound((r) => r + 1); setPlacement({}); setScore(null); setPhase("intro"); }} againLabel="Another room" />
        </div>
      ) : null}
    </div>
  );
}
