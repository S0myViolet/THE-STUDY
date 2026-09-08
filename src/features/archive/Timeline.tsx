"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ArchiveDomain } from "@/lib/domain/types";
import { Empty, Select } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { cx, plural } from "@/lib/util/format";
import { DOMAINS, DOMAIN_LABEL, KIND_LABEL, eraLabel, formatYear, statusRank, type Status } from "@/lib/archive/entries";
import { bandsFor, contemporaries, datedEntries, estimateLabelWidth, packLanes, scaleYear, yearTicks, type Dated } from "@/lib/archive/timeline";
import { ArchiveHeader, STATUS_LABEL, StatusMark, useArchive } from "./shared";

const AXIS_W = 2400;
const PAD_X = 48;
const LANE_H = 30;
const TOP_PAD = 28;
const AXIS_AREA = 64;
const WINDOW = 50;
const X = (t: number) => PAD_X + t;

function statusColor(s: Status): string {
  if (s === "retained") return "var(--brass)";
  if (statusRank(s) >= 1) return "var(--forest)";
  return "var(--wine)";
}

export function Timeline() {
  const data = useArchive();
  const router = useRouter();
  const [domain, setDomain] = useState<ArchiveDomain | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  const all = useMemo(() => datedEntries(data.entries), [data.entries]);
  const domainCounts = useMemo(() => {
    const m = new Map<ArchiveDomain, number>();
    for (const d of all) m.set(d.entry.domain, (m.get(d.entry.domain) ?? 0) + 1);
    return m;
  }, [all]);
  const items = useMemo(() => all.filter((d) => domain === "all" || d.entry.domain === domain), [all, domain]);
  const bands = useMemo(() => bandsFor(all[0]?.start ?? -800), [all]);
  const ticks = useMemo(() => yearTicks(bands), [bands]);
  const { placed, lanes } = useMemo(() => packLanes(items, bands, AXIS_W, (d) => estimateLabelWidth(d.entry.title, 12) + 10), [items, bands]);
  const sel = useMemo(() => items.find((d) => d.entry.id === selected), [items, selected]);
  const same = useMemo(() => (sel ? contemporaries(sel, items, WINDOW) : []), [sel, items]);
  const sameIds = useMemo(() => new Set(same.map((d) => d.entry.id)), [same]);

  const height = TOP_PAD + Math.max(1, lanes) * LANE_H + AXIS_AREA;
  const axisY = TOP_PAD + Math.max(1, lanes) * LANE_H;
  const laneY = (lane: number) => axisY - 14 - lane * LANE_H;

  // Keep the selected entry in view on the desktop axis.
  useEffect(() => {
    const el = scroller.current;
    const p = placed.find((d) => d.entry.id === selected);
    if (!el || !p) return;
    const target = X(p.x0) - el.clientWidth * 0.4;
    el.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [selected, placed]);

  function activate(id: string) {
    if (selected === id) router.push(`/v1/archive/${id}`);
    else setSelected(id);
  }

  const status = (id: string) => data.progress.get(id)?.status ?? "unread";

  if (!all.length && !data.loading) {
    return (
      <div className="page">
        <ArchiveHeader eyebrow="The Archive · Timeline" title="When the ideas happened" />
        <Empty title="Nothing dated yet." action={<Link href="/v1/archive" className="btn btn-secondary">Back to the Archive</Link>} />
      </div>
    );
  }

  const domainFilter = (
    <>
      <div className="hidden md:flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]" role="group" aria-label="Filter by domain">
        <button type="button" aria-pressed={domain === "all"} onClick={() => { setDomain("all"); }} className={cx("hover:text-ink", domain === "all" ? "text-ink underline underline-offset-4" : "text-ink-3")}>
          All <span className="numeral text-ink-4">{all.length}</span>
        </button>
        {DOMAINS.filter((d) => domainCounts.get(d)).map((d) => (
          <button key={d} type="button" aria-pressed={domain === d} onClick={() => { setDomain(domain === d ? "all" : d); setSelected(null); }} className={cx("hover:text-ink", domain === d ? "text-ink underline underline-offset-4" : "text-ink-3")}>
            {DOMAIN_LABEL[d]} <span className="numeral text-ink-4">{domainCounts.get(d)}</span>
          </button>
        ))}
      </div>
      <Select className="md:hidden" aria-label="Domain" value={domain} onChange={(e) => { setDomain(e.target.value as ArchiveDomain | "all"); setSelected(null); }}>
        <option value="all">All domains</option>
        {DOMAINS.filter((d) => domainCounts.get(d)).map((d) => (
          <option key={d} value={d}>{DOMAIN_LABEL[d]} · {domainCounts.get(d)}</option>
        ))}
      </Select>
    </>
  );

  return (
    <div className="page">
      <ArchiveHeader eyebrow="The Archive · Timeline" title="When the ideas happened" lede={<>{plural(all.length, "dated entry", "dated entries")} on a scale that gives the last century as much room as the fifteen before it. Select one to see what else was going on; select it again to open it.</>} />

      <div className="mb-4">{domainFilter}</div>

      {/* Desktop: horizontal axis with a side panel */}
      <div className="hidden md:grid grid-cols-[minmax(0,1fr)_280px] gap-x-10">
        <div className="min-w-0">
          <div ref={scroller} className="overflow-x-auto overflow-y-hidden border border-line rounded-[var(--radius-lg)] bg-paper-2" tabIndex={-1}>
            <svg width={AXIS_W + PAD_X * 2} height={height} viewBox={`0 0 ${AXIS_W + PAD_X * 2} ${height}`} className="block" role="group" aria-label="Timeline of Archive entries">
              {/* Band separators and captions */}
              {bands.map((b, i) => {
                const x0 = X(scaleYear(b.from, bands) * AXIS_W);
                const x1 = X(scaleYear(b.to, bands) * AXIS_W);
                return (
                  <g key={b.id}>
                    {i > 0 ? <line x1={x0} y1={TOP_PAD - 12} x2={x0} y2={axisY} stroke="var(--line)" strokeDasharray="2 4" /> : null}
                    <text x={(x0 + x1) / 2} y={axisY + 46} textAnchor="middle" fontSize={10} letterSpacing="0.1em" fill="var(--ink-3)" fontFamily="var(--font-sans)" style={{ textTransform: "uppercase" }}>
                      {b.label.toUpperCase()} · {b.caption.toUpperCase()}
                    </text>
                  </g>
                );
              })}

              {/* Axis and year ticks */}
              <line x1={X(0)} y1={axisY} x2={X(AXIS_W)} y2={axisY} stroke="var(--ink)" strokeWidth={1} />
              {ticks.map((t) => {
                const x = X(t.t * AXIS_W);
                const label = t.major || t.year >= 1000 || t.year % 400 === 0;
                return (
                  <g key={t.year}>
                    <line x1={x} y1={axisY} x2={x} y2={axisY + (t.major ? 10 : 5)} stroke={t.major ? "var(--ink)" : "var(--ink-4)"} />
                    {label ? (
                      <text x={x} y={axisY + 24} textAnchor="middle" fontSize={10} fill={t.major ? "var(--ink-2)" : "var(--ink-4)"} fontFamily="var(--font-mono)">
                        {formatYear(t.year)}
                      </text>
                    ) : null}
                  </g>
                );
              })}

              {/* Guides from each entry down to the axis, under the entries so hit areas stay compact */}
              {placed.map((p) => {
                const isSel = selected === p.entry.id;
                const isSame = sameIds.has(p.entry.id);
                const dim = sel && !isSel && !isSame && hover !== p.entry.id;
                return <line key={`g-${p.entry.id}`} x1={X(p.x0)} y1={laneY(p.lane) + 6} x2={X(p.x0)} y2={axisY} stroke={isSel ? statusColor(status(p.entry.id)) : "var(--line)"} strokeWidth={1} opacity={dim ? 0.3 : isSel ? 0.9 : 0.85} />;
              })}

              {/* Entries */}
              {placed.map((p) => {
                const s = status(p.entry.id);
                const color = statusColor(s);
                const y = laneY(p.lane);
                const isSel = selected === p.entry.id;
                const isSame = sameIds.has(p.entry.id);
                const isHover = hover === p.entry.id;
                const dim = sel && !isSel && !isSame && !isHover;
                const range = p.x1 - p.x0 > 2;
                return (
                  <a
                    key={p.entry.id}
                    href={`/v1/archive/${p.entry.id}`}
                    onClick={(e) => { e.preventDefault(); activate(p.entry.id); }}
                    onMouseEnter={() => setHover(p.entry.id)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(p.entry.id)}
                    onBlur={() => setHover(null)}
                    aria-label={`${p.entry.title}, ${eraLabel(p.entry)}, ${STATUS_LABEL[s].toLowerCase()}${isSel ? ", selected; activate again to open" : ""}`}
                    aria-current={isSel ? "true" : undefined}
                    className="cursor-pointer outline-none [&:focus-visible>circle]:stroke-[var(--focus)] [&:focus-visible>circle]:stroke-2"
                    style={{ opacity: dim ? 0.3 : 1, transition: "opacity 200ms" }}
                  >
                    {range ? <line x1={X(p.x0)} y1={y + 6} x2={X(p.x1)} y2={y + 6} stroke={color} strokeWidth={isSel ? 2.5 : 1.75} opacity={isSel || isSame ? 0.9 : 0.5} strokeLinecap="round" /> : null}
                    <rect x={X(p.x0) - 4} y={y - 12} width={Math.max(p.right - p.x0 + 8, 24)} height={26} fill="transparent" />
                    {isSel || isSame ? <circle cx={X(p.x0)} cy={y + 6} r={7} fill="none" stroke={color} strokeWidth={1} opacity={0.6} /> : null}
                    <circle cx={X(p.x0)} cy={y + 6} r={isSel ? 4.5 : 3.5} fill={color} stroke="var(--paper-2)" strokeWidth={1.5} />
                    <text x={X(p.x0) + 9} y={y + 2} fontSize={12} fontFamily="var(--font-serif)" fill={isSel || isHover ? "var(--ink)" : isSame ? "var(--ink)" : "var(--ink-2)"} fontWeight={isSel ? 600 : 400} style={{ paintOrder: "stroke", stroke: "var(--paper-2)", strokeWidth: 3, strokeLinejoin: "round" }}>
                      {p.entry.title}
                    </text>
                  </a>
                );
              })}
            </svg>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-ink-3">
            <span className="inline-flex items-center gap-2"><span className="inline-block w-2.5 h-2.5 rounded-full bg-wine" /> unread</span>
            <span className="inline-flex items-center gap-2"><span className="inline-block w-2.5 h-2.5 rounded-full bg-forest" /> read</span>
            <span className="inline-flex items-center gap-2"><span className="inline-block w-2.5 h-2.5 rounded-full bg-brass" /> retained</span>
            <span className="inline-flex items-center gap-2"><span className="inline-block w-5 border-t-2 border-ink-3" /> span</span>
            <span className="inline-flex items-center gap-1 ml-auto">Scroll sideways <I.ArrowRight size={12} /></span>
          </div>
        </div>

        <aside className="min-w-0 border-l border-line pl-8" aria-live="polite">
          {sel ? (
            <SamePanel key={sel.entry.id} sel={sel} same={same} status={status} onPick={(id) => setSelected(id)} onClose={() => setSelected(null)} />
          ) : (
            <div className="border-t border-ink pt-3">
              <div className="eyebrow">At the same time</div>
              <p className="serif text-[17px] text-ink-2 mt-2 leading-snug">Select an entry to see what was happening within fifty years of its beginning.</p>
              <ul className="mt-4 text-[13px] text-ink-3 space-y-1">
                {bands.map((b) => {
                  const n = items.filter((d) => d.start >= b.from && d.start < b.to).length;
                  return (
                    <li key={b.id} className="flex justify-between gap-3"><span>{b.caption}</span><span className="numeral">{n}</span></li>
                  );
                })}
              </ul>
            </div>
          )}
        </aside>
      </div>

      {/* Mobile: a vertical chronology */}
      <div className="md:hidden">
        <ol className="border-l border-line-2 ml-2">
          {bands.map((b) => {
            const inBand = items.filter((d) => d.start >= b.from && d.start < b.to);
            if (!inBand.length) return null;
            return (
              <li key={b.id} className="mb-6">
                <div className="eyebrow pl-4 -ml-px border-l border-ink py-0.5">{b.label} · {b.caption}</div>
                <ul className="mt-1">
                  {inBand.map((d) => {
                    const s = status(d.entry.id);
                    const isSel = selected === d.entry.id;
                    const isSame = sameIds.has(d.entry.id);
                    return (
                      <li key={d.entry.id} className={cx("relative pl-4 py-1.5", sel && !isSel && !isSame && "opacity-40")}>
                        <span className="absolute -left-[5px] top-[15px] w-[9px] h-[9px] rounded-full border-2 border-paper" style={{ background: statusColor(s) }} aria-hidden />
                        <button type="button" aria-pressed={isSel} onClick={() => setSelected(isSel ? null : d.entry.id)} className="w-full text-left flex items-baseline gap-3">
                          <span className="numeral text-[11px] text-ink-4 w-[64px] shrink-0">{formatYear(d.start)}</span>
                          <span className={cx("serif text-[17px] leading-snug", isSel ? "text-ink" : "text-ink-2")}>{d.entry.title}</span>
                        </button>
                        {isSel ? (
                          <div className="mt-2 ml-[76px] anim-unfold">
                            <p className="text-[13px] text-ink-2 leading-snug">{d.entry.summary}</p>
                            <Link href={`/v1/archive/${d.entry.id}`} className="btn btn-sm mt-3">Open entry <I.ArrowRight size={12} /></Link>
                            {same.length ? (
                              <div className="mt-4">
                                <div className="eyebrow">At the same time</div>
                                <ul className="mt-1 space-y-1">
                                  {same.slice(0, 8).map((o) => (
                                    <li key={o.entry.id} className="flex items-baseline gap-3">
                                      <span className="numeral text-[11px] text-ink-4 w-[64px] shrink-0">{formatYear(o.start)}</span>
                                      <Link href={`/v1/archive/${o.entry.id}`} className="serif text-[15px] text-ink-2 hover:text-ink">{o.entry.title}</Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Side panel                                                            */
/* ------------------------------------------------------------------ */

function SamePanel({ sel, same, status, onPick, onClose }: { sel: Dated; same: Dated[]; status: (id: string) => Status; onPick: (id: string) => void; onClose: () => void }) {
  const e = sel.entry;
  const s = status(e.id);
  return (
    <div className="anim-place">
      <div className="flex items-start justify-between gap-3 border-t border-ink pt-3">
        <div className="eyebrow">{KIND_LABEL[e.kind]} · {DOMAIN_LABEL[e.domain]} · {eraLabel(e)}</div>
        <button type="button" className="text-ink-3 hover:text-ink -mt-0.5" aria-label="Clear selection" onClick={onClose}>
          <I.Close size={14} />
        </button>
      </div>
      <h2 className="serif text-[24px] text-ink leading-tight mt-1.5">{e.title}</h2>
      <p className="serif text-[15px] text-ink-2 leading-snug mt-2">{e.summary}</p>
      <div className="mt-3 flex items-center gap-2 text-[12px] text-ink-3"><StatusMark status={s} /> {STATUS_LABEL[s]}</div>
      <Link href={`/v1/archive/${e.id}`} className="btn mt-4">Open entry <I.ArrowRight size={14} /></Link>

      <div className="mt-8 border-t border-line pt-3">
        <div className="flex items-baseline justify-between">
          <span className="eyebrow">At the same time</span>
          <span className="numeral text-[11px] text-ink-4">±{WINDOW} years · {same.length}</span>
        </div>
        {same.length ? (
          <ul className="mt-1 divide-y divide-line">
            {same.map((o) => (
              <li key={o.entry.id} className="py-2 flex items-baseline justify-between gap-3">
                <button type="button" onClick={() => onPick(o.entry.id)} className="min-w-0 text-left group">
                  <span className="block text-[11px] numeral text-ink-4">{eraLabel(o.entry)}</span>
                  <span className="serif text-[16px] text-ink group-hover:text-ink-2 leading-snug block truncate">{o.entry.title}</span>
                </button>
                <Link href={`/v1/archive/${o.entry.id}`} className="text-ink-3 hover:text-ink shrink-0" aria-label={`Open ${o.entry.title}`}>
                  <I.ArrowRight size={13} />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[13px] text-ink-3 mt-2">Nothing else in the Archive begins within fifty years of {formatYear(sel.start)}.</p>
        )}
      </div>
    </div>
  );
}

