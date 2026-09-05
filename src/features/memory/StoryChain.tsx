"use client";

import React, { useMemo, useState } from "react";
import { useStudy } from "@/lib/persistence/provider";
import { MEMORY_SEEDS } from "@/content";
import { createMemoryItem } from "@/lib/services/memory";
import { recordEvidence } from "@/lib/services/evidence";
import { orderAgreement } from "@/features/observation/Chronology";
import { Button, useCountdown } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { MemoryHeader, Finish } from "./shared";
import { createRng } from "@/lib/scene";
import { cx, seedFromString, todayKey } from "@/lib/util/format";

/** Story Chain: study a sequence with a linking narrative, then reassemble it after a pause. */
export function StoryChain() {
  const { db } = useStudy();
  const seqs = useMemo(() => MEMORY_SEEDS.filter((s) => s.kind === "sequence" && s.sequence && s.sequence.length >= 4), []);
  const [round, setRound] = useState(0);
  const seed = useMemo(() => (seqs.length ? seqs[(seedFromString(todayKey()) + round) % seqs.length] : undefined), [seqs, round]);
  const [phase, setPhase] = useState<"intro" | "study" | "pause" | "order" | "done">("intro");
  const left = useCountdown(45, phase === "study", () => setPhase("pause"));
  const pauseLeft = useCountdown(20, phase === "pause", () => setPhase("order"));
  const shuffled = useMemo(() => (seed?.sequence ? createRng(round + 5).shuffle(seed.sequence) : []), [seed, round]);
  const [order, setOrder] = useState<string[] | null>(null);
  const current = order ?? shuffled;
  const [agreement, setAgreement] = useState<number | null>(null);
  if (!seed) return <div className="page"><MemoryHeader title="Story Chain" /><p className="text-ink-3">Sequences are being prepared.</p></div>;

  function move(i: number, d: -1 | 1) {
    const n = [...current];
    const j = i + d;
    if (j < 0 || j >= n.length) return;
    [n[i], n[j]] = [n[j], n[i]];
    setOrder(n);
  }

  async function submit() {
    const a = orderAgreement(current, seed!.sequence!);
    setAgreement(a);
    setPhase("done");
    await recordEvidence(db, { subskill: "memory.sequences", score: a, difficulty: 3, format: "sort", source: { kind: "memory", refId: seed!.id, label: `Story Chain · ${seed!.prompt}` } });
    await createMemoryItem(db, { kind: "sequence", prompt: seed!.prompt, answer: seed!.answer, sequence: seed!.sequence, hint: seed!.hint, sourceRef: { kind: "memory", refId: seed!.id, label: "Story Chain" }, tags: seed!.tags, dueInDays: 2 });
  }

  return (
    <div className="page">
      <MemoryHeader title="Story Chain" />
      {phase === "intro" ? (
        <div className="sheet p-6">
          <p className="serif text-[20px]">{seed.prompt}</p>
          <p className="text-[14px] text-ink-2 mt-3 max-w-[60ch]">You will see the sequence for forty-five seconds. Link each step to the next with an image or a small story; the chain is what you will retrieve. Then a short pause, then you rebuild it.</p>
          <Button size="lg" className="mt-5" onClick={() => setPhase("study")}>Show the sequence</Button>
        </div>
      ) : null}
      {phase === "study" ? (
        <div>
          <div className="flex items-center justify-between mb-4"><span className="eyebrow">Study</span><span className="numeral text-[14px]">{Math.ceil(left)}s</span></div>
          <ol className="space-y-2 stagger">{seed.sequence!.map((s, i) => <li key={s} className="sheet-raised p-4 flex gap-4 items-baseline"><span className="mono text-[12px] text-ink-3">{i + 1}</span><span className="serif text-[19px]">{s}</span></li>)}</ol>
          {seed.hint ? <p className="text-[13px] text-ink-3 mt-3">A link to try: {seed.hint}</p> : null}
          <Button variant="ghost" className="mt-4" onClick={() => setPhase("pause")}>I have the chain</Button>
        </div>
      ) : null}
      {phase === "pause" ? (
        <div className="sheet p-8 text-center anim-fade">
          <div className="eyebrow">A short pause</div>
          <p className="serif text-[22px] mt-3">Think about something else. What did you have for breakfast?</p>
          <div className="numeral text-[40px] mt-4">{Math.ceil(pauseLeft)}</div>
        </div>
      ) : null}
      {phase === "order" ? (
        <div className="anim-place">
          <p className="text-[13px] text-ink-3 mb-3">Rebuild the order.</p>
          <ol className="space-y-2">
            {current.map((s, i) => (
              <li key={s} className="flex items-center gap-3 sheet p-3" tabIndex={0} onKeyDown={(e) => { if (e.key === "ArrowUp") { e.preventDefault(); move(i, -1); } if (e.key === "ArrowDown") { e.preventDefault(); move(i, 1); } }}>
                <span className="mono text-[11px] text-ink-3 w-5">{i + 1}</span><span className="flex-1 serif text-[17px]">{s}</span>
                <span className="flex flex-col"><button className="btn btn-ghost btn-sm !h-6 !px-1" onClick={() => move(i, -1)} disabled={i === 0} aria-label="earlier"><I.Up size={12} /></button><button className="btn btn-ghost btn-sm !h-6 !px-1" onClick={() => move(i, 1)} disabled={i === current.length - 1} aria-label="later"><I.Down size={12} /></button></span>
              </li>
            ))}
          </ol>
          <Button size="lg" className="mt-5" onClick={submit}>Commit</Button>
        </div>
      ) : null}
      {phase === "done" && agreement !== null ? (
        <div className="anim-place space-y-6">
          <div className="border-t border-ink pt-4"><div className="eyebrow">Order agreement</div><div className="numeral text-[28px] mt-1">{Math.round(agreement * 100)}%</div></div>
          <ol className="space-y-1">{seed.sequence!.map((s, i) => <li key={s} className={cx("pl-3 border-l serif text-[17px]", current[i] === s ? "border-forest" : "border-wine")}>{s}</li>)}</ol>
          <p className="text-[13px] text-ink-3">This sequence is now in your queue and will come back in two days.</p>
          <Finish onAgain={() => { setRound((r) => r + 1); setOrder(null); setAgreement(null); setPhase("intro"); }} againLabel="Another chain" />
        </div>
      ) : null}
    </div>
  );
}
