"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useStudy, useStudyQuery } from "@/lib/persistence/provider";
import { stamp } from "@/lib/persistence/store";
import type { Forecast, ForecastCategory } from "@/lib/domain/types";
import { brier, calibrationBuckets, calibrationVerdict, meanBrier } from "@/lib/scoring/calibration";
import { recordConfidence, recordEvidence } from "@/lib/services/evidence";
import { notify, reachMilestone } from "@/lib/services/notifications";
import { detectRedThreads } from "@/lib/adaptation/red-thread";
import { useSessionItem } from "@/lib/services/session-context";
import { Button, ConfidenceDial, Empty, Field, PageHeader, Segmented, TextArea, Note } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { cx, relativeDays, shortDate } from "@/lib/util/format";

const CATEGORIES: ForecastCategory[] = ["personal", "economics", "technology", "politics", "sports", "business", "other"];

export function ForecastsRoom({ slug }: { slug: string[] }) {
  const params = useSearchParams();
  if (slug[0] === "new" || params.get("new") === "1") return <NewForecast />;
  if (slug[0]) return <ForecastDetail id={slug[0]} />;
  return <Index />;
}

function Index() {
  const { db } = useStudy();
  const forecasts = useStudyQuery((db) => db.store("forecasts").list({ orderBy: "createdAt", desc: true }), ["forecasts"]);
  const all = forecasts.data ?? [];
  const open = all.filter((f) => f.status === "open").sort((a, b) => a.resolutionDate.localeCompare(b.resolutionDate));
  const resolved = all.filter((f) => f.status === "resolved").sort((a, b) => (b.resolvedAt ?? "").localeCompare(a.resolvedAt ?? ""));
  const ready = open.filter((f) => new Date(f.resolutionDate).getTime() <= Date.now());
  const mb = meanBrier(resolved.map((f) => ({ probability: f.probability, outcome: !!f.outcome })));
  const entries = resolved.map((f) => ({ confidence: f.probability >= 0.5 ? f.probability : 1 - f.probability, correct: f.probability >= 0.5 ? !!f.outcome : !f.outcome }));
  const verdict = calibrationVerdict(entries);
  const buckets = calibrationBuckets(entries);

  useEffect(() => {
    for (const f of ready) notify(db, { kind: "forecast_resolvable", title: `Ready to resolve: ${f.question.slice(0, 60)}`, body: "The resolution date has passed.", href: `/forecasts/${f.id}`, dedupeKey: f.id }).catch(() => {});
  }, [ready, db]);

  return (
    <div className="page">
      <PageHeader eyebrow="Forecasts" title="Meet reality" lede="Will X occur before Y? A probability, a reason, and a date on which you find out. Calibration is built from these, nothing else." aside={all.length ? <Link href="/forecasts/new" className="btn"><I.Plus size={14} /> Forecast</Link> : null} />
      {!all.length && !forecasts.loading ? (
        <Empty title="Calibration requires predictions that eventually meet reality." body="Nothing is scored until a forecast resolves. Start with something that resolves within a month." action={<Link href="/forecasts/new" className="btn btn-lg">Make first forecast</Link>} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
          <div>
            <section>
              <div className="eyebrow mb-1">Open · {open.length}</div>
              <ul className="divide-y divide-line border-t border-line">
                {open.map((f) => (
                  <li key={f.id}>
                    <Link href={`/forecasts/${f.id}`} className="group flex items-baseline gap-4 py-3.5 -mx-3 px-3 hover:bg-paper-3 rounded-sm">
                      <span className="numeral text-[18px] w-14 shrink-0">{Math.round(f.probability * 100)}%</span>
                      <span className="flex-1 min-w-0"><span className="serif text-[17px] text-ink block truncate">{f.question}</span><span className="text-[12px] text-ink-3">{f.category} · resolves {relativeDays(f.resolutionDate)}{new Date(f.resolutionDate).getTime() <= Date.now() ? <span className="text-wine"> · ready to resolve</span> : null}</span></span>
                      <I.ArrowRight size={14} className="text-ink-4 group-hover:text-ink" />
                    </Link>
                  </li>
                ))}
                {!open.length ? <li className="py-4 text-[13px] text-ink-3">Nothing open. Make a forecast.</li> : null}
              </ul>
            </section>
            <section className="mt-10">
              <div className="eyebrow mb-1">Resolved · {resolved.length}</div>
              <ul className="divide-y divide-line border-t border-line">
                {resolved.map((f) => (
                  <li key={f.id}>
                    <Link href={`/forecasts/${f.id}`} className="group flex items-baseline gap-4 py-3.5 -mx-3 px-3 hover:bg-paper-3 rounded-sm">
                      <span className="numeral text-[18px] w-14 shrink-0">{Math.round(f.probability * 100)}%</span>
                      <span className="flex-1 min-w-0"><span className="serif text-[17px] text-ink block truncate">{f.question}</span><span className="text-[12px] text-ink-3">{f.outcome ? "Happened" : "Did not happen"} · Brier {f.brier?.toFixed(2)} · {f.resolvedAt ? shortDate(f.resolvedAt) : ""}</span></span>
                      <span className={cx("w-[6px] h-[6px] rounded-full", (f.probability >= 0.5) === !!f.outcome ? "bg-forest" : "bg-wine")} aria-hidden />
                    </Link>
                  </li>
                ))}
                {!resolved.length ? <li className="py-4 text-[13px] text-ink-3">No forecast has met reality yet.</li> : null}
              </ul>
            </section>
          </div>
          <aside className="space-y-6">
            <div className="border-t border-line pt-3"><div className="eyebrow">Mean Brier</div><div className="numeral text-[28px] mt-1">{mb === null ? "—" : mb.toFixed(3)}</div><div className="text-[12px] text-ink-3 mt-1">{resolved.length ? `n = ${resolved.length} · 0 is perfect, 0.25 is coin-flipping` : "Resolves with the first forecast"}</div></div>
            <div className="border-t border-line pt-3"><div className="eyebrow">Calibration</div><div className="serif text-[20px] mt-1">{verdict.verdict === "insufficient" ? "Not enough yet" : verdict.verdict === "well_calibrated" ? "Well calibrated" : verdict.verdict === "overconfident" ? "Overconfident" : "Underconfident"}</div><div className="text-[12px] text-ink-3 mt-1">{verdict.n ? `${verdict.n} in buckets with enough samples` : "At least five resolutions per bucket before a verdict."}</div></div>
            <CalibrationPlot buckets={buckets} />
            <p className="text-[12px] text-ink-4 border-t border-line pt-3">Nothing here is scored until a prediction resolves. No fake performance.</p>
          </aside>
        </div>
      )}
    </div>
  );
}

export function CalibrationPlot({ buckets }: { buckets: ReturnType<typeof calibrationBuckets> }) {
  const W = 220;
  const H = 180;
  const pad = 24;
  const x = (v: number) => pad + v * (W - pad * 2);
  const y = (v: number) => H - pad - v * (H - pad * 2);
  return (
    <div className="border-t border-line pt-3">
      <div className="eyebrow mb-2">Predicted vs actual</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Calibration plot: predicted confidence against actual accuracy">
        <line x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)} stroke="var(--line-2)" strokeDasharray="3 4" />
        <line x1={x(0)} y1={y(0)} x2={x(1)} y2={y(0)} stroke="var(--line)" />
        <line x1={x(0)} y1={y(0)} x2={x(0)} y2={y(1)} stroke="var(--line)" />
        {[0, 0.5, 1].map((t) => <text key={t} x={x(t)} y={H - 8} textAnchor="middle" fontSize={9} fill="var(--ink-3)" fontFamily="var(--font-mono)">{Math.round(t * 100)}</text>)}
        {buckets.map((b) => (
          <g key={b.label}>
            <circle cx={x(b.meanConfidence)} cy={y(b.n ? b.accuracy : b.meanConfidence)} r={b.sufficient ? 4 : 3} fill={b.sufficient ? "var(--ink)" : "none"} stroke="var(--ink)" strokeWidth={1} opacity={b.n ? 1 : 0.25} />
            {b.n ? <text x={x(b.meanConfidence)} y={y(b.n ? b.accuracy : b.meanConfidence) - 8} textAnchor="middle" fontSize={8} fill="var(--ink-3)" fontFamily="var(--font-mono)">n{b.n}</text> : null}
          </g>
        ))}
      </svg>
      <p className="text-[11px] text-ink-4 mt-1">Solid points have five or more resolutions. The dashed line is perfect calibration.</p>
    </div>
  );
}

function NewForecast() {
  const { db } = useStudy();
  const router = useRouter();
  const { finish } = useSessionItem();
  const [q, setQ] = useState("");
  const [p, setP] = useState<number | null>(null);
  const [reasoning, setReasoning] = useState("");
  const [evidence, setEvidence] = useState("");
  const [changeMind, setChangeMind] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState<ForecastCategory>("personal");
  const [busy, setBusy] = useState(false);
  const minDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const ok = q.trim().length > 8 && p !== null && date >= minDate && reasoning.trim().length > 5;

  async function save() {
    setBusy(true);
    const f = stamp<Forecast>(db.userId, "fc", { question: q.trim(), probability: p!, reasoning: reasoning.trim(), evidence: evidence.trim(), changeMind: changeMind.trim(), resolutionDate: new Date(date + "T12:00:00").toISOString(), category, status: "open", history: [{ at: new Date().toISOString(), probability: p! }] });
    await db.store("forecasts").put(f);
    await reachMilestone(db, "first_forecast");
    if (!(await finish())) router.push(`/forecasts/${f.id}`);
  }

  return (
    <div className="page">
      <Link href="/forecasts" className="text-[12px] text-ink-3 hover:text-ink inline-flex items-center gap-1.5 mb-4"><I.ArrowLeft size={12} /> Forecasts</Link>
      <PageHeader eyebrow="New forecast" title="Will it happen?" />
      <div className="max-w-[680px] space-y-6">
        <TextArea label="The question" serif rows={2} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Will X occur before Y? Precise enough that a stranger could judge it." autoFocus />
        <ConfidenceDial value={p} onChange={setP} label="Probability" stops={[5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95]} />
        <TextArea label="Reasoning" value={reasoning} onChange={(e) => setReasoning(e.target.value)} rows={3} />
        <TextArea label="Evidence" value={evidence} onChange={(e) => setEvidence(e.target.value)} rows={2} />
        <TextArea label="What would change my mind" value={changeMind} onChange={(e) => setChangeMind(e.target.value)} rows={2} onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && ok) void save(); }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Resolution date" type="date" value={date} min={minDate} onChange={(e) => setDate(e.target.value)} />
          <div><div className="eyebrow mb-1.5">Category</div><Segmented value={category} onChange={setCategory} label="Category" options={CATEGORIES.map((c) => ({ value: c, label: c }))} /></div>
        </div>
        <div className="flex items-center gap-3"><Button size="lg" onClick={save} disabled={!ok || busy}>Record the forecast</Button><span className="text-[12px] text-ink-3">⌘↵</span></div>
      </div>
    </div>
  );
}

function ForecastDetail({ id }: { id: string }) {
  const { db } = useStudy();
  const router = useRouter();
  const f = useStudyQuery((db) => db.store("forecasts").get(id), ["forecasts"], [id]);
  const [p, setP] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const fc = f.data;
  const history = useMemo(() => fc?.history ?? [], [fc]);
  if (f.loading) return <div className="page" />;
  if (!fc) return <div className="page"><Empty title="No such forecast." action={<Link href="/forecasts" className="btn btn-secondary">Back</Link>} /></div>;

  async function update() {
    if (!fc || p === null) return;
    setBusy(true);
    await db.store("forecasts").update(fc.id, { probability: p, history: [...fc.history, { at: new Date().toISOString(), probability: p, note: note.trim() || undefined }] });
    setP(null);
    setNote("");
    setBusy(false);
  }

  async function resolve(outcome: boolean) {
    if (!fc) return;
    setBusy(true);
    const b = brier(fc.probability, outcome);
    await db.store("forecasts").update(fc.id, { status: "resolved", outcome, brier: b, resolvedAt: new Date().toISOString() });
    const source = { kind: "forecast" as const, refId: fc.id, label: fc.question.slice(0, 60) };
    const conf = fc.probability >= 0.5 ? fc.probability : 1 - fc.probability;
    const correct = fc.probability >= 0.5 ? outcome : !outcome;
    await recordConfidence(db, { confidence: conf, correct, domain: "calibration", source, asEvidence: false });
    await recordEvidence(db, { subskill: "calibration.forecasts", score: 1 - b, difficulty: 4, format: "numeric", source, confidence: fc.probability, correct });
    const resolvedCount = await db.store("forecasts").count({ status: "resolved" } as never);
    if (resolvedCount >= 25) await reachMilestone(db, "predictions_25");
    if (resolvedCount >= 100) await reachMilestone(db, "predictions_100");
    await detectRedThreads(db);
    setBusy(false);
  }

  const resolvable = fc.status === "open" && new Date(fc.resolutionDate).getTime() <= Date.now();

  return (
    <div className="page">
      <Link href="/forecasts" className="text-[12px] text-ink-3 hover:text-ink inline-flex items-center gap-1.5 mb-4"><I.ArrowLeft size={12} /> Forecasts</Link>
      <div className="max-w-[720px]">
        <div className="eyebrow">{fc.category} · {fc.status === "open" ? `resolves ${relativeDays(fc.resolutionDate)}` : `resolved ${fc.resolvedAt ? shortDate(fc.resolvedAt) : ""}`}</div>
        <h1 className="display text-[30px] md:text-[36px] mt-2">{fc.question}</h1>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-ink pt-4">
          <div><div className="eyebrow">Probability</div><div className="numeral text-[30px] mt-1">{Math.round(fc.probability * 100)}%</div></div>
          <div><div className="eyebrow">Updates</div><div className="numeral text-[30px] mt-1">{fc.history.length - 1}</div></div>
          {fc.status === "resolved" ? <><div><div className="eyebrow">Outcome</div><div className="serif text-[22px] mt-1">{fc.outcome ? "Happened" : "Did not"}</div></div><div><div className="eyebrow">Brier</div><div className="numeral text-[30px] mt-1">{fc.brier?.toFixed(3)}</div></div></> : <div><div className="eyebrow">Made</div><div className="serif text-[22px] mt-1">{shortDate(fc.createdAt)}</div></div>}
        </div>
        <div className="mt-6 space-y-4">
          <Block label="Reasoning" text={fc.reasoning} />
          <Block label="Evidence" text={fc.evidence} />
          <Block label="What would change my mind" text={fc.changeMind} />
        </div>
        {history.length > 1 ? (
          <section className="mt-6"><div className="eyebrow mb-2">History</div><ol className="space-y-1">{history.map((h, i) => <li key={i} className="text-[13px] flex gap-3"><span className="numeral w-12">{Math.round(h.probability * 100)}%</span><span className="text-ink-3">{shortDate(h.at)}</span>{h.note ? <span className="text-ink-2">— {h.note}</span> : null}</li>)}</ol></section>
        ) : null}
        {fc.status === "open" ? (
          <div className="mt-8 space-y-6">
            {resolvable ? <Note tone="wine">The resolution date has passed. What happened?</Note> : null}
            <div className="flex flex-wrap gap-3"><Button onClick={() => resolve(true)} disabled={busy}>It happened</Button><Button variant="secondary" onClick={() => resolve(false)} disabled={busy}>It did not</Button></div>
            <div className="border-t border-line pt-4">
              <div className="eyebrow mb-2">Update the probability</div>
              <ConfidenceDial value={p} onChange={setP} label="New probability" stops={[5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95]} />
              <Field className="mt-3" label="Why (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
              <Button className="mt-3" variant="secondary" size="sm" onClick={update} disabled={p === null || busy}>Record the update</Button>
            </div>
          </div>
        ) : (
          <div className="mt-8 flex gap-3"><Button variant="secondary" onClick={() => router.push("/forecasts/new")}>Another forecast</Button></div>
        )}
      </div>
    </div>
  );
}

function Block({ label, text }: { label: string; text: string }) {
  if (!text) return null;
  return <div><div className="eyebrow mb-1">{label}</div><p className="serif text-[17px] text-ink-2 leading-relaxed">{text}</p></div>;
}
