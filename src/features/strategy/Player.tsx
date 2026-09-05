"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStudy } from "@/lib/persistence/provider";
import { stamp } from "@/lib/persistence/store";
import { ensureOne } from "@/lib/persistence/ensure";
import type { StrategyActor, StrategyMove, StrategyRun, StrategyScenario } from "@/lib/domain/types";
import type { SubskillId } from "@/lib/domain/faculties";
import { ai, useAIStatus } from "@/lib/ai/client";
import { recordError, recordEvidence } from "@/lib/services/evidence";
import { writeAfterAction } from "@/lib/services/after-action";
import { reachMilestone } from "@/lib/services/notifications";
import { detectRedThreads } from "@/lib/adaptation/red-thread";
import { useSessionItem } from "@/lib/services/session-context";
import { keyPointCoverage, wordCount } from "@/lib/scoring/text";
import { Button, Choice, TextArea, Note, Field } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { cx, minutes } from "@/lib/util/format";
import { DIFFICULTY_LABEL } from "@/lib/domain/faculties";

const MODE_LABEL: Record<StrategyScenario["mode"], string> = { three_moves: "Three Moves Ahead", counterparty: "Counterparty", incentive_map: "Incentive Map", option_value: "Option Value", red_team: "Red Team", premortem: "Pre-mortem", second_order: "Second Order", negotiation: "Negotiation", story: "Strategic Story" };

const MODE_SUBSKILL: Record<StrategyScenario["mode"], SubskillId> = { three_moves: "strategy.second_order", counterparty: "strategy.adversarial", incentive_map: "strategy.incentives", option_value: "strategy.optionality", red_team: "strategy.adversarial", premortem: "strategy.planning", second_order: "strategy.second_order", negotiation: "strategy.negotiation", story: "strategy.planning" };

interface FreeStep { situation: string; move: string; rationale?: string; consequence: string; counterpartyReply?: string; quality: number; secondOrder: string[]; terminal: boolean }

export function Player({ scenario }: { scenario: StrategyScenario }) {
  const { db } = useStudy();
  const router = useRouter();
  const aiStatus = useAIStatus();
  const { inSession, sessionId, finish } = useSessionItem();
  const [run, setRun] = useState<StrategyRun | null>(null);
  const [phase, setPhase] = useState<"map" | "play">("map");
  const [mapAnswers, setMapAnswers] = useState<Record<string, { wants: string; fears: string }>>({});
  const [mapResult, setMapResult] = useState<{ score: number; per: { name: string; wants: number; fears: number }[] } | null>(null);
  const [chosen, setChosen] = useState<StrategyMove | null>(null);
  const [rationale, setRationale] = useState("");
  const [showActors, setShowActors] = useState(false);
  const [custom, setCustom] = useState("");
  const [free, setFree] = useState<FreeStep[]>([]);
  const [freeSituation, setFreeSituation] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [debrief, setDebrief] = useState<{ text: string; score: number; oneThing?: string } | null>(null);

  const nodes = useMemo(() => new Map(scenario.nodes.map((n) => [n.id, n])), [scenario]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const r = await ensureOne(db, "strategy_runs", { scenarioId: scenario.id, status: "active" }, () =>
        stamp<StrategyRun>(db.userId, "srun", { scenarioId: scenario.id, status: "active", path: [], currentNodeId: scenario.rootNodeId, sessionId: sessionId ?? undefined }),
      );
      if (alive) {
        setRun(r);
        setPhase(r.path.length ? "play" : "map");
      }
    })();
    return () => {
      alive = false;
    };
  }, [db, scenario, sessionId]);

  const node = run ? nodes.get(run.currentNodeId) : undefined;
  const mapActors = scenario.actors.filter((a) => !a.name.toLowerCase().startsWith("you") && !a.name.toLowerCase().includes("the study")).slice(0, 3);

  async function submitMap() {
    const per = mapActors.map((a) => ({ name: a.name, wants: keyPointCoverage(mapAnswers[a.name]?.wants ?? "", keysFor(a.goals)).ratio, fears: keyPointCoverage(mapAnswers[a.name]?.fears ?? "", keysFor(a.fears)).ratio }));
    const score = per.length ? per.reduce((s, p) => s + (p.wants + p.fears) / 2, 0) / per.length : 0;
    setMapResult({ score, per });
    await recordEvidence(db, { subskill: "strategy.incentives", score: Math.min(1, score + 0.15), difficulty: scenario.difficulty, format: "free", source: { kind: "strategy", refId: run?.id ?? scenario.id, label: `Incentive map · ${scenario.title}` }, sessionId: sessionId ?? undefined });
    await recordEvidence(db, { subskill: "social.incentive_recognition", score: Math.min(1, score + 0.15), difficulty: scenario.difficulty, format: "free", source: { kind: "strategy", refId: run?.id ?? scenario.id, label: `Incentive map · ${scenario.title}` }, sessionId: sessionId ?? undefined });
  }

  async function choose(move: StrategyMove) {
    if (!run || !node) return;
    setChosen(move);
    const source = { kind: "strategy" as const, refId: run.id, label: `Strategy · ${scenario.title}` };
    await recordEvidence(db, { subskill: MODE_SUBSKILL[scenario.mode], score: move.quality, difficulty: scenario.difficulty, format: "mcq", source, sessionId: sessionId ?? undefined, note: move.text.slice(0, 80) });
    if (move.reveals) await recordEvidence(db, { subskill: "strategy.optionality", score: Math.max(move.quality, 0.7), difficulty: scenario.difficulty, format: "mcq", source, sessionId: sessionId ?? undefined });
    if (move.errorType) await recordError(db, { type: move.errorType, subskill: MODE_SUBSKILL[scenario.mode], source, detail: `${scenario.title}: "${move.text}"`, sessionId: sessionId ?? undefined });
    const next: StrategyRun = { ...run, path: [...run.path, { nodeId: node.id, moveId: move.id, at: new Date().toISOString(), rationale: rationale.trim() || undefined }] };
    await db.store("strategy_runs").put(next);
    setRun(next);
  }

  async function advance() {
    if (!run || !chosen) return;
    const nextId = chosen.nextNodeId;
    const nextNode = nextId ? nodes.get(nextId) : undefined;
    const next: StrategyRun = { ...run, currentNodeId: nextId ?? run.currentNodeId };
    await db.store("strategy_runs").put(next);
    setRun(next);
    setChosen(null);
    setRationale("");
    if (!nextNode || nextNode.terminal) await complete(next, nextNode?.debrief);
  }

  async function customMove() {
    if (!run || !custom.trim()) return;
    setBusy(true);
    const situation = freeSituation ?? node?.situation ?? scenario.summary;
    const history = [...run.path.map((p) => ({ move: nodes.get(p.nodeId)?.moves.find((m) => m.id === p.moveId)?.text ?? p.moveId, rationale: p.rationale })), ...free.map((f) => ({ move: f.move, consequence: f.consequence }))];
    const res = await ai.call("simulateCounterpartyMove", { scenario: scenario.summary, actors: scenario.actors, history, situation, move: custom, rationale });
    if (!res.ok) {
      setBusy(false);
      return;
    }
    const step: FreeStep = { situation, move: custom, rationale: rationale.trim() || undefined, consequence: res.data.consequence, counterpartyReply: res.data.counterpartyReply, quality: res.data.quality, secondOrder: res.data.secondOrder, terminal: res.data.terminal || free.length >= 5 };
    const source = { kind: "strategy" as const, refId: run.id, label: `Strategy · ${scenario.title}` };
    await recordEvidence(db, { subskill: MODE_SUBSKILL[scenario.mode], score: step.quality, difficulty: scenario.difficulty, format: "free", source, sessionId: sessionId ?? undefined, note: custom.slice(0, 80) });
    if (res.data.errorType) await recordError(db, { type: res.data.errorType as never, subskill: MODE_SUBSKILL[scenario.mode], source, detail: `${scenario.title}: "${custom}"`, sessionId: sessionId ?? undefined });
    const nextRun: StrategyRun = { ...run, path: [...run.path, { nodeId: "free", moveId: custom.slice(0, 40), at: new Date().toISOString(), rationale: rationale.trim() || undefined }] };
    await db.store("strategy_runs").put(nextRun);
    setRun(nextRun);
    setFree((f) => [...f, step]);
    setFreeSituation(step.terminal ? null : res.data.nextSituation);
    setCustom("");
    setRationale("");
    setBusy(false);
    if (step.terminal) await complete(nextRun, undefined, [...free, step]);
  }

  async function complete(r: StrategyRun, treeDebrief?: string, freeSteps: FreeStep[] = free) {
    const qualities = [...r.path.filter((p) => p.nodeId !== "free").map((p) => nodes.get(p.nodeId)?.moves.find((m) => m.id === p.moveId)?.quality ?? 0), ...freeSteps.map((f) => f.quality)];
    let score = qualities.length ? qualities.reduce((s, q) => s + q, 0) / qualities.length : 0;
    let text = treeDebrief ?? "";
    let oneThing: string | undefined;
    if (aiStatus.configured) {
      const res = await ai.call("evaluateStrategy", { scenario: scenario.summary, path: r.path.map((p) => ({ situation: nodes.get(p.nodeId)?.situation, move: nodes.get(p.nodeId)?.moves.find((m) => m.id === p.moveId)?.text ?? p.moveId, rationale: p.rationale })) });
      if (res.ok) {
        text = text ? `${text}\n\n${res.data.debrief}` : res.data.debrief;
        oneThing = res.data.oneThing;
        score = (score + res.data.score) / 2;
      }
    }
    const done: StrategyRun = { ...r, status: "completed", score, debrief: text, completedAt: new Date().toISOString() };
    await db.store("strategy_runs").put(done);
    setRun(done);
    setDebrief({ text, score, oneThing });
    const source = { kind: "strategy" as const, refId: done.id, label: `Strategy · ${scenario.title}` };
    const poor = r.path.map((p) => nodes.get(p.nodeId)?.moves.find((m) => m.id === p.moveId)).filter((m) => m && m.quality < 0.4);
    if (scenario.conceptLinks.length) {
      const progress = await db.store("archive_progress").list({ filter: (p) => scenario.conceptLinks.includes(p.entryId) && p.status !== "unread" });
      if (progress.length && score >= 0.65) {
        await recordEvidence(db, { subskill: "synthesis.transfer", score, difficulty: Math.min(8, scenario.difficulty + 1) as never, format: "free", transfer: true, source, sessionId: sessionId ?? undefined, note: `Drew on ${progress.map((p) => p.entryId).join(", ")}` });
        for (const p of progress) await db.store("archive_progress").update(p.id, { timesUsed: p.timesUsed + 1 });
      }
    }
    await writeAfterAction(db, { source, title: `Strategy · ${scenario.title}`, saw: r.path.map((p) => nodes.get(p.nodeId)?.moves.find((m) => m.id === p.moveId)?.reveals).filter((x): x is string => !!x), missed: poor.map((m) => m!.text), assumed: r.path.filter((p) => p.rationale).map((p) => p.rationale!).slice(0, 3), didWell: r.path.map((p) => nodes.get(p.nodeId)?.moves.find((m) => m.id === p.moveId)).filter((m) => m && m.quality >= 0.8).map((m) => m!.text), turningPoint: r.path.map((p) => nodes.get(p.nodeId)?.moves.find((m) => m.id === p.moveId)).find((m) => m?.reveals)?.reveals, oneThing: oneThing ?? (poor.length ? `Before an irreversible move, ask what the other side does next. "${poor[0]!.text.slice(0, 60)}" invited the reply you did not want.` : "Keep asking 'then what?' one step further than feels necessary."), score, sessionId: sessionId ?? undefined });
    if (scenario.mode === "story") await reachMilestone(db, "strategy_complete");
    await detectRedThreads(db);
  }

  if (!run) return <div className="page"><div className="text-[13px] text-ink-3">Setting the table.</div></div>;

  const pathMoves = run.path.map((p) => ({ node: nodes.get(p.nodeId), move: nodes.get(p.nodeId)?.moves.find((m) => m.id === p.moveId), free: p.nodeId === "free" ? p.moveId : undefined }));

  return (
    <div className="page">
      <div className="flex items-center justify-between gap-4 mb-4">
        <Link href="/strategy" className="text-[12px] text-ink-3 hover:text-ink inline-flex items-center gap-1.5"><I.ArrowLeft size={12} /> Strategy Table</Link>
        <div className="flex items-center gap-4 text-[11px] text-ink-3">{inSession ? <span className="mark"><span className="mark-dot" /> Today&apos;s session</span> : null}<span>{MODE_LABEL[scenario.mode]} · {DIFFICULTY_LABEL[scenario.difficulty]} · {minutes(scenario.estimatedMinutes)}</span></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8">
        <div className="min-w-0">
          <header className="mb-6">
            <div className="eyebrow eyebrow-wine">{MODE_LABEL[scenario.mode]}</div>
            <h1 className="display text-[30px] md:text-[38px] mt-1">{scenario.title}</h1>
            <p className="eyebrow mt-3">{scenario.setting}</p>
            <p className="serif text-[18px] text-ink-2 mt-3 max-w-[64ch] leading-relaxed">{scenario.summary}</p>
          </header>

          {phase === "map" && run.status === "active" ? (
            <section className="sheet p-6 anim-place">
              <div className="eyebrow mb-1">Before you move</div>
              <p className="serif text-[18px]">Map the incentives. For each of the others, what do they want, and what do they fear?</p>
              {!mapResult ? (
                <div className="mt-4 space-y-4">
                  {mapActors.map((a) => (
                    <div key={a.name} className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-line pt-3">
                      <div className="md:col-span-2 text-[13px] text-ink-2 font-medium">{a.name}</div>
                      <Field label="Wants" value={mapAnswers[a.name]?.wants ?? ""} onChange={(e) => setMapAnswers((m) => ({ ...m, [a.name]: { ...(m[a.name] ?? { wants: "", fears: "" }), wants: e.target.value } }))} />
                      <Field label="Fears" value={mapAnswers[a.name]?.fears ?? ""} onChange={(e) => setMapAnswers((m) => ({ ...m, [a.name]: { ...(m[a.name] ?? { wants: "", fears: "" }), fears: e.target.value } }))} />
                    </div>
                  ))}
                  <div className="flex gap-3"><Button onClick={submitMap} disabled={mapActors.some((a) => wordCount(mapAnswers[a.name]?.wants ?? "") < 2)}>Compare</Button><Button variant="ghost" onClick={() => setPhase("play")}>Skip to the table</Button></div>
                </div>
              ) : (
                <div className="mt-4 space-y-3 anim-unfold">
                  {mapResult.per.map((p) => { const a = scenario.actors.find((x) => x.name === p.name)!; return <div key={p.name} className="border-t border-line pt-3 text-[13px]"><div className="font-medium text-ink">{p.name} <span className="numeral text-ink-3">wants {Math.round(p.wants * 100)}% · fears {Math.round(p.fears * 100)}%</span></div><div className="text-ink-2 mt-1">Wants: {a.goals.join("; ")}. Fears: {a.fears.join("; ")}. Leverage: {a.leverage.join("; ")}.</div></div>; })}
                  <Button onClick={() => setPhase("play")}>To the table <I.ArrowRight size={14} /></Button>
                </div>
              )}
            </section>
          ) : null}

          {phase === "play" && run.status === "active" && node && !node.terminal && !freeSituation ? (
            <section key={node.id} className="anim-place">
              <div className="sheet-raised paper-texture p-6 md:p-8">
                <div className="eyebrow mb-2">Move {run.path.length + 1}</div>
                <p className="serif text-[20px] leading-relaxed">{node.situation}</p>
              </div>
              {!chosen ? (
                <div className="mt-5 space-y-2">
                  {node.moves.map((m, i) => <Choice key={m.id} index={i} label={m.text} onClick={() => choose(m)} />)}
                  <TextArea className="mt-3" label="Why this move? (optional, kept in the record)" value={rationale} onChange={(e) => setRationale(e.target.value)} rows={2} />
                  {aiStatus.configured ? (
                    <div className="mt-3 border-t border-line pt-3">
                      <TextArea label="Or make your own move" serif value={custom} onChange={(e) => setCustom(e.target.value)} rows={2} placeholder="Describe what you would actually do." />
                      <Button variant="secondary" size="sm" className="mt-2" disabled={busy || wordCount(custom) < 3} onClick={customMove}>{busy ? "The table responds…" : "Play it"}</Button>
                    </div>
                  ) : <p className="mt-3 text-[11px] text-ink-4">Free-form moves, answered by a simulated counterparty, activate when a model is connected in Settings.</p>}
                </div>
              ) : (
                <div className="mt-5 space-y-4 anim-unfold">
                  <Note tone="neutral"><span className="eyebrow block mb-1">You chose</span>{chosen.text}</Note>
                  <Note tone={chosen.quality >= 0.7 ? "forest" : chosen.quality >= 0.4 ? "brass" : "wine"}><span className="eyebrow block mb-1">What happens next</span>{chosen.consequence}</Note>
                  {chosen.counterpartyReply ? <blockquote className="serif text-[18px] text-ink-2 pl-4 border-l-2 border-line-2 italic">{chosen.counterpartyReply}</blockquote> : null}
                  {chosen.reveals ? <Note tone="brass"><span className="eyebrow block mb-1">What you learned</span>{chosen.reveals}</Note> : null}
                  <Button onClick={advance}>{chosen.nextNodeId && !nodes.get(chosen.nextNodeId)?.terminal ? "Then what?" : "See how it ends"} <I.ArrowRight size={14} /></Button>
                </div>
              )}
            </section>
          ) : null}

          {freeSituation && run.status === "active" ? (
            <section className="anim-place">
              <div className="sheet-raised paper-texture p-6 md:p-8"><div className="eyebrow mb-2">Move {run.path.length + 1} · simulated</div><p className="serif text-[20px] leading-relaxed">{freeSituation}</p></div>
              <div className="mt-5">
                <TextArea label="Your move" serif value={custom} onChange={(e) => setCustom(e.target.value)} rows={3} />
                <TextArea className="mt-2" label="Why (optional)" value={rationale} onChange={(e) => setRationale(e.target.value)} rows={2} />
                <Button className="mt-3" disabled={busy || wordCount(custom) < 3} onClick={customMove}>{busy ? "The table responds…" : "Play it"}</Button>
              </div>
            </section>
          ) : null}

          {free.length ? (
            <ol className="mt-6 space-y-4">
              {free.map((f, i) => <li key={i} className="border-t border-line pt-3"><div className="eyebrow">Your move</div><p className="text-[14px]">{f.move}</p><div className="eyebrow mt-2">Consequence</div><p className="serif text-[16px] text-ink-2">{f.consequence}</p>{f.secondOrder.length ? <p className="text-[12px] text-ink-3 mt-1">Second order: {f.secondOrder.join("; ")}</p> : null}</li>)}
            </ol>
          ) : null}

          {run.status === "completed" || (node?.terminal && !debrief) ? (
            <Debrief scenario={scenario} run={run} debrief={debrief ?? { text: node?.debrief ?? run.debrief ?? "", score: run.score ?? 0 }} onDone={async () => { if (!(await finish())) router.push("/strategy"); }} inSession={inSession} />
          ) : null}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-8 self-start">
          <div>
            <div className="eyebrow mb-2">Your path</div>
            <PathTree steps={pathMoves} active={run.status === "active"} />
          </div>
          <div>
            <button className="eyebrow flex items-center gap-2 hover:text-ink" onClick={() => setShowActors((s) => !s)} aria-expanded={showActors}>Actors <I.Down size={11} className={cx("transition-transform", showActors && "rotate-180")} /></button>
            {showActors ? (
              <ul className="mt-2 space-y-3 anim-unfold">{scenario.actors.map((a) => <ActorCard key={a.name} a={a} />)}</ul>
            ) : <p className="text-[12px] text-ink-3 mt-1">{scenario.actors.map((a) => a.name).join(" · ")}</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}

function keysFor(list: string[]): string[] {
  return list.flatMap((g) => g.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 5)).slice(0, 12);
}

function ActorCard({ a }: { a: StrategyActor }) {
  return (
    <li className="text-[12px] border-l border-line-2 pl-3">
      <div className="text-ink font-medium text-[13px]">{a.name}</div>
      <div className="text-ink-2 mt-0.5"><span className="text-ink-3">Wants</span> {a.goals.join("; ")}</div>
      <div className="text-ink-2"><span className="text-ink-3">Fears</span> {a.fears.join("; ")}</div>
      <div className="text-ink-2"><span className="text-ink-3">Leverage</span> {a.leverage.join("; ")}</div>
      <div className="text-ink-2"><span className="text-ink-3">Alternatives</span> {a.alternatives.join("; ") || "—"}</div>
    </li>
  );
}

/** The decision tree, grown one move at a time. */
function PathTree({ steps, active }: { steps: { node?: StrategyScenario["nodes"][number]; move?: StrategyMove; free?: string }[]; active: boolean }) {
  const h = Math.max(60, steps.length * 46 + (active ? 46 : 20));
  return (
    <svg viewBox={`0 0 240 ${h}`} className="w-full h-auto" role="img" aria-label="Decision path">
      <line x1={14} y1={8} x2={14} y2={h - 8} stroke="var(--line-2)" />
      {steps.map((s, i) => {
        const y = 20 + i * 46;
        const q = s.move?.quality ?? 0.6;
        const color = q >= 0.7 ? "var(--forest)" : q >= 0.4 ? "var(--brass)" : "var(--wine)";
        return (
          <g key={i} className="anim-place" style={{ animationDelay: `${i * 60}ms` }}>
            <circle cx={14} cy={y} r={5} fill={color} />
            <line x1={19} y1={y} x2={40} y2={y} stroke="var(--line-2)" />
            <text x={44} y={y + 4} fontSize={11} fontFamily="var(--font-sans)" fill="var(--ink-2)">{(s.move?.text ?? s.free ?? "").slice(0, 30)}{(s.move?.text ?? s.free ?? "").length > 30 ? "…" : ""}</text>
          </g>
        );
      })}
      {active ? <circle cx={14} cy={20 + steps.length * 46} r={5} fill="none" stroke="var(--ink)" strokeDasharray="2 2" /> : null}
    </svg>
  );
}

function Debrief({ scenario, run, debrief, onDone, inSession }: { scenario: StrategyScenario; run: StrategyRun; debrief: { text: string; score: number; oneThing?: string }; onDone: () => void; inSession: boolean }) {
  return (
    <section className="mt-8 border-t border-ink pt-5 anim-place">
      <div className="eyebrow eyebrow-wine mb-2">Debrief</div>
      <div className="grid grid-cols-2 gap-6 mb-5">
        <div><div className="eyebrow">Moves</div><div className="numeral text-[26px] mt-1">{run.path.length}</div></div>
        <div><div className="eyebrow">Quality of play</div><div className="numeral text-[26px] mt-1">{Math.round(debrief.score * 100)}</div><div className="text-[12px] text-ink-3">mean move quality, 0–100</div></div>
      </div>
      {debrief.text.split("\n\n").map((p, i) => <p key={i} className="serif text-[17px] text-ink-2 leading-relaxed mb-3">{p}</p>)}
      {debrief.oneThing ? <Note tone="brass" className="mt-3"><span className="eyebrow block mb-1">One thing</span>{debrief.oneThing}</Note> : null}
      <div className="mt-6 flex gap-3"><Button size="lg" onClick={onDone}>{inSession ? "Continue the session" : "Leave the table"}</Button></div>
      <p className="mt-3 text-[11px] text-ink-4">{scenario.conceptLinks.length ? `Draws on: ${scenario.conceptLinks.join(", ")}.` : ""}</p>
    </section>
  );
}
