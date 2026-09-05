"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useStudy, useStudyQuery } from "@/lib/persistence/provider";
import type { ErrorEvent, RedThreadStatus, SkillEvidence } from "@/lib/domain/types";
import { detectRedThreads, PATTERNS, patternFor } from "@/lib/adaptation/red-thread";
import { ERROR_META } from "@/lib/domain/errors";
import { subskillLabel } from "@/lib/domain/faculties";
import { PageHeader, Empty, HairlineProgress, Note } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { cx, shortDate, relativeDays } from "@/lib/util/format";
import { qaSeedThreads } from "./qa-seed";

const STATUS_ORDER: RedThreadStatus[] = ["established", "emerging", "candidate", "improving", "resolved"];
const STATUS_TEXT: Record<RedThreadStatus, string> = {
  candidate: "Seen enough to watch, not enough to name.",
  emerging: "Recurring across sessions. Worth a targeted test.",
  established: "A reliable pattern in your work.",
  improving: "Recent evidence on the targeted skill has been strong, with no recurrence.",
  resolved: "It stopped recurring.",
};
const SOURCE_HREF: Record<string, string> = { case: "/casebook", observation: "/observation", inference: "/inference", salon: "/salon", strategy: "/strategy", memory: "/memory", archive: "/archive", rhetoric: "/rhetoric", forecast: "/forecasts", decision: "/decisions", baseline: "/profile", fieldwork: "/fieldwork", curator: "/curator", investigation: "/investigations", cabinet: "/cabinet", reading: "/archive/reading" };

export function RedThreadRoom({ slug }: { slug: string[] }) {
  const { db } = useStudy();
  const params = useSearchParams();
  useEffect(() => {
    (async () => {
      if (params.get("qa-seed") === "1") await qaSeedThreads(db);
      await detectRedThreads(db);
    })().catch(() => {});
  }, [db, params]);
  if (slug[0] === "errors") return <WhatRecurs />;
  if (slug[0]) return <ThreadDetail id={slug[0]} />;
  return <Index />;
}

function Index() {
  const threads = useStudyQuery((db) => db.store("red_threads").list({ orderBy: "strength", desc: true }), ["red_threads"]);
  const errors = useStudyQuery((db) => db.store("error_events").list({ filter: (e) => e.createdAt >= new Date(Date.now() - 60 * 86400000).toISOString() }), ["error_events"]);
  const all = threads.data ?? [];
  const watching = useMemo(() => {
    const present = new Set(all.map((t) => t.patternKey));
    return PATTERNS.map((p) => ({ p, n: (errors.data ?? []).filter((e) => p.errorTypes.includes(e.type)).length })).filter((x) => !present.has(x.p.key) && x.n >= 1 && x.n < 3);
  }, [all, errors.data]);

  return (
    <div className="page">
      <PageHeader eyebrow="The Red Thread" title="What recurs" lede="Patterns across your mistakes, biases and blind spots. The Study accumulates evidence before it names one, and stops naming it once you have corrected it." aside={<Link href="/red-thread/errors" className="text-[13px] text-ink-3 hover:text-ink">Every instance</Link>} />
      {!all.length && !threads.loading ? (
        <Empty title="Nothing has repeated enough to call a pattern yet." body="Keep working. The Study is still collecting evidence." action={<Link href="/casebook" className="btn btn-secondary">Open the Casebook</Link>} />
      ) : (
        STATUS_ORDER.filter((s) => all.some((t) => t.status === s)).map((s) => (
          <section key={s} className="mb-10">
            <div className="flex items-baseline justify-between mb-1"><div className="eyebrow">{s}</div><div className="text-[12px] text-ink-3">{STATUS_TEXT[s]}</div></div>
            <ul className="divide-y divide-line border-t border-line">
              {all.filter((t) => t.status === s).map((t) => (
                <li key={t.id}>
                  <Link href={`/red-thread/${t.id}`} className="group block py-4 -mx-3 px-3 hover:bg-paper-3 rounded-sm">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="serif text-[21px] text-ink group-hover:text-ink-2">{t.title}</span>
                      <span className="text-[11px] text-ink-3 uppercase tracking-wider shrink-0">{t.patternType} · {t.confidence}</span>
                    </div>
                    <p className="text-[14px] text-ink-2 mt-1 max-w-[70ch]">{t.description}</p>
                    <div className="mt-3 flex items-center gap-4"><HairlineProgress value={t.strength} className="w-40" /><span className="text-[11px] text-ink-3">{t.evidenceIds.length} instances · {t.sessionsObserved.length} sessions · last {relativeDays(t.lastReinforced)}</span></div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
      {watching.length ? (
        <section className="mt-6">
          <div className="eyebrow mb-1">Watching</div>
          <ul className="divide-y divide-line border-t border-line">
            {watching.map(({ p, n }) => <li key={p.key} className="py-3 flex items-baseline justify-between text-[13px]"><span className="text-ink-3">{p.title}</span><span className="numeral text-ink-4">{n} of 3 instances observed</span></li>)}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function ThreadDetail({ id }: { id: string }) {
  const t = useStudyQuery((db) => db.store("red_threads").get(id), ["red_threads"], [id]);
  const thread = t.data;
  const evidence = useStudyQuery(async (db) => {
    if (!thread) return { errors: [] as ErrorEvent[], counter: [] as SkillEvidence[] };
    const errs = (await Promise.all(thread.evidenceIds.map((eid) => db.store("error_events").get(eid)))).filter((e): e is ErrorEvent => !!e).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const ev = await db.store("skill_evidence").list({ filter: (e) => thread.counterEvidenceIds.includes(e.id), orderBy: "createdAt" });
    return { errors: errs, counter: ev };
  }, ["error_events", "skill_evidence", "red_threads"], [thread?.id, thread?.evidenceIds.length, thread?.counterEvidenceIds.length]);
  if (t.loading) return <div className="page" />;
  if (!thread) return <div className="page"><Empty title="No such thread." action={<Link href="/red-thread" className="btn btn-secondary">Back</Link>} /></div>;
  const def = patternFor(thread.patternKey);
  const errs = evidence.data?.errors ?? [];
  const counter = evidence.data?.counter ?? [];

  return (
    <div className="page">
      <Link href="/red-thread" className="text-[12px] text-ink-3 hover:text-ink inline-flex items-center gap-1.5 mb-4"><I.ArrowLeft size={12} /> The Red Thread</Link>
      <div className="eyebrow eyebrow-wine">{thread.patternType} pattern · {thread.status}</div>
      <h1 className="display text-[32px] md:text-[40px] mt-2">{thread.title}</h1>
      <p className="serif text-[19px] text-ink-2 mt-3 max-w-[64ch]">{thread.description}</p>

      <ThreadLine errors={errs} counter={counter} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 mt-8">
        <div className="space-y-8">
          <section>
            <div className="eyebrow mb-2">Evidence · {errs.length} instances</div>
            <ul className="divide-y divide-line border-t border-line">
              {errs.map((e) => (
                <li key={e.id} className="py-3 flex gap-4 text-[13px]">
                  <span className="numeral text-ink-3 w-16 shrink-0">{shortDate(e.createdAt)}</span>
                  <span className="flex-1"><span className="text-ink">{e.detail}</span><span className="block text-ink-3 mt-0.5">{ERROR_META[e.type]?.label ?? e.type}{e.subskill ? ` · ${subskillLabel(e.subskill)}` : ""} · <Link href={SOURCE_HREF[e.source.kind] ?? "/desk"} className="underline underline-offset-4 hover:text-ink">{e.source.label ?? e.source.kind}</Link></span></span>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <div className="eyebrow mb-2">Counter-evidence · {counter.length}</div>
            {counter.length ? <ul className="divide-y divide-line border-t border-line">{counter.map((c) => <li key={c.id} className="py-3 flex gap-4 text-[13px]"><span className="numeral text-ink-3 w-16 shrink-0">{shortDate(c.createdAt)}</span><span className="flex-1 text-ink">{subskillLabel(c.subskill)} scored {Math.round(c.score * 100)} · {c.source.label ?? c.source.kind}</span></li>)}</ul> : <p className="text-[13px] text-ink-3 border-t border-line pt-3">None yet. Strong performances on {thread.targetSubskill ? subskillLabel(thread.targetSubskill) : "the targeted skill"} after the last recurrence will appear here.</p>}
          </section>
          {thread.status === "resolved" ? <Note tone="forest">This stopped recurring{thread.resolvedAt ? ` on ${shortDate(thread.resolvedAt)}` : ""}. The Study will only raise it again if it returns.</Note> : null}
        </div>
        <aside className="space-y-6">
          <div className="border-t border-line pt-3"><div className="eyebrow">Confidence</div><div className="serif text-[22px] mt-1 capitalize">{thread.confidence}</div><div className="text-[12px] text-ink-3 mt-1">{thread.evidenceIds.length} instances across {thread.sessionsObserved.length} sessions</div></div>
          <div className="border-t border-line pt-3"><div className="eyebrow">Strength</div><HairlineProgress value={thread.strength} className="mt-2" /><div className="text-[12px] text-ink-3 mt-1">First seen {shortDate(thread.firstDetected)} · last {shortDate(thread.lastReinforced)}</div></div>
          <div className="border-t border-line pt-3"><div className="eyebrow">Next test</div><p className="serif text-[16px] mt-1">{thread.nextTest}</p>{def ? <Link href={def.testHref} className="btn mt-3">Take the test <I.ArrowRight size={14} /></Link> : null}</div>
          <p className="text-[12px] text-ink-4 border-t border-line pt-3">{STATUS_TEXT[thread.status]} Improvement needs three strong performances across two sessions with no recurrence; resolution needs that to hold for two weeks.</p>
        </aside>
      </div>
    </div>
  );
}

/** The signature visual: one continuous wine-coloured thread through the recurrences, forest dots for counter-evidence. */
function ThreadLine({ errors, counter }: { errors: ErrorEvent[]; counter: { createdAt: string }[] }) {
  const points = [...errors.map((e) => ({ at: new Date(e.createdAt).getTime(), kind: "err" as const })), ...counter.map((c) => ({ at: new Date(c.createdAt).getTime(), kind: "ok" as const }))].sort((a, b) => a.at - b.at);
  if (points.length < 2) return null;
  const W = 900;
  const H = 120;
  const min = points[0].at;
  const max = points[points.length - 1].at;
  const x = (t: number) => 30 + ((t - min) / Math.max(1, max - min)) * (W - 60);
  const errPts = points.filter((p) => p.kind === "err").map((p, i) => ({ x: x(p.at), y: 40 + (i % 2) * 30 }));
  const d = errPts.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `C ${(errPts[i - 1].x + p.x) / 2} ${errPts[i - 1].y}, ${(errPts[i - 1].x + p.x) / 2} ${p.y}, ${p.x} ${p.y}`)).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto mt-6" role="img" aria-label="Timeline of recurrences joined by a single thread">
      <line x1={30} y1={H - 20} x2={W - 30} y2={H - 20} stroke="var(--line)" />
      <text x={30} y={H - 6} fontSize={10} fill="var(--ink-3)" fontFamily="var(--font-mono)">{new Date(min).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</text>
      <text x={W - 30} y={H - 6} textAnchor="end" fontSize={10} fill="var(--ink-3)" fontFamily="var(--font-mono)">{new Date(max).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</text>
      <path d={d} fill="none" stroke="var(--wine)" strokeWidth={1.5} className="anim-draw" />
      {errPts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={4} fill="var(--paper-2)" stroke="var(--wine)" strokeWidth={1.5} />)}
      {points.filter((p) => p.kind === "ok").map((p, i) => <circle key={"ok" + i} cx={x(p.at)} cy={H - 20} r={4} fill="var(--forest)" />)}
    </svg>
  );
}

function WhatRecurs() {
  const errors = useStudyQuery((db) => db.store("error_events").list({ orderBy: "createdAt", desc: true, limit: 400 }), ["error_events"]);
  const by = useMemo(() => {
    const m = new Map<string, ErrorEvent[]>();
    for (const e of errors.data ?? []) m.set(e.type, [...(m.get(e.type) ?? []), e]);
    return [...m.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [errors.data]);
  return (
    <div className="page">
      <Link href="/red-thread" className="text-[12px] text-ink-3 hover:text-ink inline-flex items-center gap-1.5 mb-4"><I.ArrowLeft size={12} /> The Red Thread</Link>
      <PageHeader eyebrow="The Red Thread" title="What recurs" lede="Every recorded slip, by kind. Recurring kinds raise training priority; they are not a scorecard." />
      {!by.length ? <Empty title="Nothing recorded yet." /> : (
        <div className="space-y-8">
          {by.map(([type, list]) => (
            <section key={type}>
              <div className="flex items-baseline justify-between mb-1"><span className="serif text-[20px]">{ERROR_META[type as keyof typeof ERROR_META]?.label ?? type}</span><span className="numeral text-[13px] text-ink-3">{list.length}</span></div>
              <p className="text-[12px] text-ink-3 mb-2">{ERROR_META[type as keyof typeof ERROR_META]?.description}</p>
              <ul className="divide-y divide-line border-t border-line">{list.slice(0, 6).map((e) => <li key={e.id} className={cx("py-2 text-[13px] flex gap-4")}><span className="numeral text-ink-3 w-16 shrink-0">{shortDate(e.createdAt)}</span><span className="text-ink-2">{e.detail}</span></li>)}{list.length > 6 ? <li className="py-2 text-[12px] text-ink-4">and {list.length - 6} more</li> : null}</ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
