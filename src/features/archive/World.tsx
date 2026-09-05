"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import type { ArchiveDomain, ArchiveEntry } from "@/lib/domain/types";
import { Empty, Segmented, Select } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { cx, plural } from "@/lib/util/format";
import { DOMAINS, DOMAIN_LABEL, KIND_LABEL, RELATION_INVERSE, RELATION_LABEL, eraLabel, statusRank, type Edge, type Status } from "@/lib/archive/entries";
import { LAND, MAP_H, MAP_W, SEAS, pathFor, project, type MapView } from "@/lib/archive/world";
import { ArchiveHeader, STATUS_LABEL, StatusMark, useArchive, type ArchiveData } from "./shared";

/* ------------------------------------------------------------------ */
/* Views and geometry                                                    */
/* ------------------------------------------------------------------ */

const MAP_VIEWS: MapView[] = [
  { id: "world", label: "World", lon: [-180, 180], lat: [-56, 82] },
  { id: "europe", label: "Europe & Mediterranean", lon: [-14, 46], lat: [28, 62] },
  { id: "asia", label: "Middle East & Asia", lon: [24, 140], lat: [2, 58] },
];

type ViewId = "world" | "europe" | "asia";

/** The visible box never changes; views are transforms on the map group, which CSS can animate. */
const BASE = (() => {
  const a = project(-180, 82);
  const b = project(180, -56);
  return { x: a.x, y: a.y, w: b.x - a.x, h: b.y - a.y };
})();

function transformFor(v: MapView): { s: number; tx: number; ty: number } {
  const a = project(v.lon[0], v.lat[1]);
  const b = project(v.lon[1], v.lat[0]);
  const bw = b.x - a.x;
  const bh = b.y - a.y;
  const s = Math.min(BASE.w / bw, BASE.h / bh);
  const cx = (a.x + b.x) / 2;
  const cy = (a.y + b.y) / 2;
  return { s, tx: BASE.x + BASE.w / 2 - s * cx, ty: BASE.y + BASE.h / 2 - s * cy };
}

const GRATICULE = (() => {
  const d: string[] = [];
  for (let lon = -150; lon <= 150; lon += 30) d.push(`M${project(lon, 90).x.toFixed(1)} 0 V${MAP_H}`);
  for (let lat = -60; lat <= 60; lat += 30) d.push(`M0 ${project(0, lat).y.toFixed(1)} H${MAP_W}`);
  return d.join(" ");
})();

function statusColor(s: Status): string {
  if (s === "retained") return "var(--brass)";
  if (statusRank(s) >= 1) return "var(--forest)";
  return "var(--wine)";
}

interface Marker {
  entry: ArchiveEntry;
  x: number;
  y: number;
  /** index and size of the group sharing this exact place */
  slot: number;
  of: number;
  status: Status;
}

function markersFor(data: Pick<ArchiveData, "entries" | "progress">): Marker[] {
  // Cluster anything within ~2 map units (about 2px at world scale) so co-located places stay reachable.
  const groups: { x: number; y: number; entries: ArchiveEntry[] }[] = [];
  for (const e of data.entries) {
    if (e.kind === "path" || !e.location) continue;
    const p = project(e.location.lon, e.location.lat);
    const g = groups.find((g) => Math.hypot(g.x - p.x, g.y - p.y) < 2);
    if (g) g.entries.push(e);
    else groups.push({ x: p.x, y: p.y, entries: [e] });
  }
  const out: Marker[] = [];
  for (const g of groups) {
    g.entries.forEach((entry, slot) => {
      out.push({ entry, x: g.x, y: g.y, slot, of: g.entries.length, status: data.progress.get(entry.id)?.status ?? "unread" });
    });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Page                                                                  */
/* ------------------------------------------------------------------ */

export function World() {
  const data = useArchive();
  const [view, setView] = useState<ViewId>("world");
  const [domain, setDomain] = useState<ArchiveDomain | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  const markers = useMemo(() => markersFor({ entries: data.entries, progress: data.progress }), [data.entries, data.progress]);
  const domainCounts = useMemo(() => {
    const m = new Map<ArchiveDomain, number>();
    for (const mk of markers) m.set(mk.entry.domain, (m.get(mk.entry.domain) ?? 0) + 1);
    return m;
  }, [markers]);
  const visible = useMemo(() => markers.filter((m) => domain === "all" || m.entry.domain === domain), [markers, domain]);
  const byId = useMemo(() => new Map(visible.map((m) => [m.entry.id, m])), [visible]);
  const sel = selected ? byId.get(selected) : undefined;

  /** Connections of the selected entry whose other end is on the map. */
  const links = useMemo(() => {
    if (!sel) return [] as { edge: Edge; other: Marker; outgoing: boolean }[];
    const out: { edge: Edge; other: Marker; outgoing: boolean }[] = [];
    const seen = new Set<string>();
    for (const edge of data.edges) {
      const outgoing = edge.from === sel.entry.id;
      if (!outgoing && edge.to !== sel.entry.id) continue;
      const otherId = outgoing ? edge.to : edge.from;
      const other = byId.get(otherId);
      if (!other || seen.has(otherId)) continue;
      seen.add(otherId);
      out.push({ edge, other, outgoing });
    }
    return out;
  }, [sel, data.edges, byId]);
  const elsewhere = useMemo(() => {
    if (!sel) return [] as ArchiveEntry[];
    const linked = new Set(links.map((l) => l.other.entry.id));
    const out: ArchiveEntry[] = [];
    for (const edge of data.edges) {
      const otherId = edge.from === sel.entry.id ? edge.to : edge.to === sel.entry.id ? edge.from : null;
      if (!otherId || linked.has(otherId)) continue;
      const e = data.byId.get(otherId);
      if (e && !out.includes(e)) out.push(e);
    }
    return out;
  }, [sel, links, data.edges, data.byId]);
  const linkedIds = useMemo(() => new Set(links.map((l) => l.other.entry.id)), [links]);

  const current = MAP_VIEWS.find((v) => v.id === view) ?? MAP_VIEWS[0];
  const { s, tx, ty } = transformFor(current);
  const px = (n: number) => n / s; // screen pixels expressed in map units at the current zoom

  const readCount = markers.filter((m) => statusRank(m.status) >= 1).length;
  const countries = useMemo(() => {
    const m = new Map<string, Marker[]>();
    for (const mk of visible) {
      const c = mk.entry.location?.country ?? "Elsewhere";
      const g = m.get(c);
      if (g) g.push(mk);
      else m.set(c, [mk]);
    }
    return [...m.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
  }, [visible]);

  function select(id: string) {
    setSelected((cur) => (cur === id ? null : id));
  }

  const viewControl = (
    <>
      <div className="hidden md:block">
        <Segmented label="Map view" value={view} onChange={setView} options={MAP_VIEWS.map((v) => ({ value: v.id as ViewId, label: v.label }))} />
      </div>
      <Select className="md:hidden" aria-label="Map view" value={view} onChange={(e) => setView(e.target.value as ViewId)}>
        {MAP_VIEWS.map((v) => (
          <option key={v.id} value={v.id}>{v.label}</option>
        ))}
      </Select>
    </>
  );

  if (!markers.length && !data.loading) {
    return (
      <div className="page">
        <ArchiveHeader eyebrow="The Archive · World" title="Where the ideas happened" lede="Where the ideas happened. Places are approximate." />
        <Empty title="Nothing on the map yet." body="Entries with a place appear here as you add them." action={<Link href="/archive" className="btn btn-secondary">Back to the Archive</Link>} />
      </div>
    );
  }

  return (
    <div className="page">
      <ArchiveHeader eyebrow="The Archive · World" title="Where the ideas happened" lede={<>Where the ideas happened. Places are approximate. {plural(markers.length, "entry", "entries")} have a place; {readCount} read.</>} aside={<div className="hidden md:block">{viewControl}</div>} />

      {/* Mobile: controls first */}
      <div className="md:hidden mb-4 grid grid-cols-2 gap-3">
        {viewControl}
        <Select aria-label="Domain" value={domain} onChange={(e) => { setDomain(e.target.value as ArchiveDomain | "all"); setSelected(null); }}>
          <option value="all">All domains</option>
          {DOMAINS.filter((d) => domainCounts.get(d)).map((d) => (
            <option key={d} value={d}>{DOMAIN_LABEL[d]} · {domainCounts.get(d)}</option>
          ))}
        </Select>
      </div>

      <div className="hidden md:flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 text-[12px]" role="group" aria-label="Filter by domain">
        <button type="button" aria-pressed={domain === "all"} onClick={() => { setDomain("all"); setSelected(null); }} className={cx("hover:text-ink", domain === "all" ? "text-ink underline underline-offset-4" : "text-ink-3")}>
          All <span className="numeral text-ink-4">{markers.length}</span>
        </button>
        {DOMAINS.filter((d) => domainCounts.get(d)).map((d) => (
          <button key={d} type="button" aria-pressed={domain === d} onClick={() => { setDomain(domain === d ? "all" : d); setSelected(null); }} className={cx("hover:text-ink", domain === d ? "text-ink underline underline-offset-4" : "text-ink-3")}>
            {DOMAIN_LABEL[d]} <span className="numeral text-ink-4">{domainCounts.get(d)}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_300px] gap-x-10 gap-y-6">
        <div className="min-w-0">
          <div className="border border-line rounded-[var(--radius-lg)] overflow-hidden bg-paper-2">
            <svg viewBox={`${BASE.x} ${BASE.y} ${BASE.w} ${BASE.h}`} className="w-full h-auto block" role="group" aria-label={`Map, ${current.label}`} onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
              <defs>
                <filter id="world-pen" x="-2%" y="-2%" width="104%" height="104%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="7" result="n" />
                  <feDisplacementMap in="SourceGraphic" in2="n" scale="1.4" xChannelSelector="R" yChannelSelector="G" />
                </filter>
                <pattern id="world-hatch" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
                  <line x1="0" y1="0" x2="0" y2="3" stroke="var(--line-2)" strokeWidth="0.35" />
                </pattern>
              </defs>
              <g style={{ transform: `translate(${tx}px, ${ty}px) scale(${s})`, transformOrigin: "0 0", transition: "transform 640ms cubic-bezier(0.2, 0.7, 0.2, 1)" }}>
                <path d={GRATICULE} fill="none" stroke="var(--line)" strokeWidth={1} vectorEffect="non-scaling-stroke" strokeDasharray="2 4" opacity={0.7} />
                <g filter="url(#world-pen)">
                  {LAND.map((l) => (
                    <g key={l.id}>
                      <path d={pathFor(l.points)} fill="var(--paper-3)" stroke="var(--line-2)" strokeWidth={1} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
                      <path d={pathFor(l.points)} fill="url(#world-hatch)" opacity={0.28} />
                      <path d={pathFor(l.points)} fill="none" stroke="var(--ink-4)" strokeWidth={0.6} vectorEffect="non-scaling-stroke" opacity={0.35} transform="translate(0.9 0.9)" strokeLinejoin="round" />
                    </g>
                  ))}
                  {SEAS.map((sea) => (
                    <path key={sea.id} d={pathFor(sea.points)} fill="var(--paper-2)" stroke="var(--line-2)" strokeWidth={1} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
                  ))}
                </g>

                {/* Arcs from the selected entry to its located connections */}
                {sel
                  ? links.map(({ edge, other }) => {
                      const a = offset(sel, px);
                      const b = offset(other, px);
                      const mx = (a.x + b.x) / 2;
                      const my = (a.y + b.y) / 2;
                      const dx = b.x - a.x;
                      const dy = b.y - a.y;
                      const bend = 0.18;
                      const cxp = mx - dy * bend;
                      const cyp = my + dx * bend;
                      return <path key={edge.id} d={`M${a.x} ${a.y} Q${cxp} ${cyp} ${b.x} ${b.y}`} fill="none" stroke={edge.user ? "var(--wine)" : "var(--ink-3)"} strokeWidth={1} vectorEffect="non-scaling-stroke" strokeDasharray={edge.user ? "3 3" : undefined} opacity={0.85} className="anim-draw" />;
                    })
                  : null}

                {visible.map((m) => {
                  const p = offset(m, px);
                  const isSel = sel?.entry.id === m.entry.id;
                  const isLinked = linkedIds.has(m.entry.id);
                  const lit = hover === m.entry.id || isSel || (isLinked && s >= 2);
                  const dim = sel && !isSel && !isLinked && hover !== m.entry.id;
                  const r = px(isSel ? 6 : 4.8);
                  const color = statusColor(m.status);
                  const label = m.entry.title.length > 30 ? m.entry.title.slice(0, 29) + "…" : m.entry.title;
                  return (
                    <g
                      key={m.entry.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`${m.entry.title}, ${DOMAIN_LABEL[m.entry.domain]}, ${STATUS_LABEL[m.status].toLowerCase()}${m.entry.location?.country ? `, ${m.entry.location.country}` : ""}`}
                      aria-pressed={isSel}
                      onClick={(e) => { e.stopPropagation(); select(m.entry.id); }}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(m.entry.id); } }}
                      onMouseEnter={() => setHover(m.entry.id)}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover(m.entry.id)}
                      onBlur={() => setHover(null)}
                      className="cursor-pointer outline-none [&:focus-visible>circle:last-of-type]:stroke-[var(--focus)]"
                      style={{ opacity: dim ? 0.35 : 1, transition: "opacity 200ms" }}
                    >
                      <title>{m.entry.title}</title>
                      {isSel ? <circle cx={p.x} cy={p.y} r={r + px(5)} fill="none" stroke={color} strokeWidth={1} vectorEffect="non-scaling-stroke" opacity={0.7} /> : null}
                      <circle cx={p.x} cy={p.y} r={r + px(6)} fill="transparent" />
                      <circle cx={p.x} cy={p.y} r={r} fill={color} stroke="var(--paper-2)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
                      {lit ? (
                        <text x={p.x + r + px(4)} y={p.y + px(4)} fontSize={px(11.5)} fontFamily="var(--font-serif)" fill={isSel || hover === m.entry.id ? "var(--ink)" : "var(--ink-2)"} style={{ paintOrder: "stroke", stroke: "var(--paper-2)", strokeWidth: px(3), strokeLinejoin: "round" }}>
                          {label}
                        </text>
                      ) : null}
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-ink-3">
            <span className="inline-flex items-center gap-2"><span className="inline-block w-2.5 h-2.5 rounded-full bg-wine" /> unread</span>
            <span className="inline-flex items-center gap-2"><span className="inline-block w-2.5 h-2.5 rounded-full bg-forest" /> read</span>
            <span className="inline-flex items-center gap-2"><span className="inline-block w-2.5 h-2.5 rounded-full bg-brass" /> retained</span>
            <span className="inline-flex items-center gap-2"><span className="inline-block w-5 border-t border-ink-3" /> connection</span>
            <span className="hidden md:inline">Tab moves between places.</span>
          </div>
        </div>

        <aside className="min-w-0 md:border-l md:border-line md:pl-8" aria-live="polite">
          {sel ? (
            <SideSheet key={sel.entry.id} marker={sel} links={links} elsewhere={elsewhere} onPick={(id) => setSelected(id)} onClose={() => setSelected(null)} />
          ) : (
            <div className="space-y-4">
              <div className="border-t border-ink pt-3">
                <div className="eyebrow">Select a place</div>
                <p className="serif text-[17px] text-ink-2 mt-2 leading-snug">Each mark is an entry. Choose one to read its summary and see what it connects to across the map.</p>
              </div>
              <ul className="text-[13px] text-ink-3 space-y-1">
                <li className="flex justify-between"><span>With a place</span><span className="numeral">{visible.length}</span></li>
                <li className="flex justify-between"><span>Read</span><span className="numeral">{visible.filter((m) => statusRank(m.status) >= 1).length}</span></li>
                <li className="flex justify-between"><span>Retained</span><span className="numeral">{visible.filter((m) => m.status === "retained").length}</span></li>
              </ul>
            </div>
          )}
        </aside>
      </div>

      <section className="mt-12" aria-label="Entries by country">
        <div className="flex items-baseline justify-between border-b border-line-2 pb-2 mb-3">
          <span className="eyebrow">By country</span>
          <span className="numeral text-[11px] text-ink-4">{plural(countries.length, "country", "countries")}</span>
        </div>
        <ul className="columns-1 sm:columns-2 lg:columns-3 gap-x-10 [&>li]:break-inside-avoid">
          {countries.map(([country, list]) => (
            <li key={country} className="mb-4">
              <div className="text-[12px] text-ink-3 mb-1">{country}</div>
              <ul>
                {list.map((m) => (
                  <li key={m.entry.id}>
                    <button type="button" onClick={() => select(m.entry.id)} aria-pressed={selected === m.entry.id} className={cx("w-full text-left flex items-center justify-between gap-3 py-1 hover:text-ink", selected === m.entry.id ? "text-ink" : "text-ink-2")}>
                      <span className="serif text-[16px] truncate">{m.entry.title}</span>
                      <StatusMark status={m.status} className="shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/** Co-located markers are spread in a small ring so both can be reached. */
function offset(m: Marker, px: (n: number) => number): { x: number; y: number } {
  if (m.of <= 1) return { x: m.x, y: m.y };
  const a = (m.slot / m.of) * Math.PI * 2 - Math.PI / 2;
  const d = px(4 + 2 * m.of);
  return { x: m.x + Math.cos(a) * d, y: m.y + Math.sin(a) * d };
}

/* ------------------------------------------------------------------ */
/* Side sheet                                                            */
/* ------------------------------------------------------------------ */

function SideSheet({ marker, links, elsewhere, onPick, onClose }: { marker: Marker; links: { edge: Edge; other: Marker; outgoing: boolean }[]; elsewhere: ArchiveEntry[]; onPick: (id: string) => void; onClose: () => void }) {
  const e = marker.entry;
  const era = eraLabel(e);
  return (
    <div className="anim-place">
      <div className="flex items-start justify-between gap-3 border-t border-ink pt-3">
        <div className="eyebrow">
          {KIND_LABEL[e.kind]} · {DOMAIN_LABEL[e.domain]}
          {era ? ` · ${era}` : ""}
        </div>
        <button type="button" className="text-ink-3 hover:text-ink -mt-0.5" aria-label="Clear selection" onClick={onClose}>
          <I.Close size={14} />
        </button>
      </div>
      <h2 className="serif text-[24px] text-ink leading-tight mt-1.5">{e.title}</h2>
      {e.location?.country ? <p className="text-[12px] text-ink-3 mt-1">{e.location.country} · approximate</p> : null}
      <p className="serif text-[16px] text-ink-2 leading-snug mt-3">{e.summary}</p>
      <div className="mt-3 flex items-center gap-2 text-[12px] text-ink-3">
        <StatusMark status={marker.status} /> {STATUS_LABEL[marker.status]}
      </div>
      <Link href={`/archive/${e.id}`} className="btn mt-4">
        Open entry <I.ArrowRight size={14} />
      </Link>

      <div className="mt-8 border-t border-line pt-3">
        <div className="flex items-baseline justify-between">
          <span className="eyebrow">Connected, on the map</span>
          <span className="numeral text-[11px] text-ink-4">{links.length}</span>
        </div>
        {links.length ? (
          <ul className="mt-1 divide-y divide-line">
            {links.map(({ edge, other, outgoing }) => (
              <li key={edge.id}>
                <button type="button" onClick={() => onPick(other.entry.id)} className="w-full text-left py-2 group">
                  <span className="block text-[11px] tracking-[0.08em] uppercase text-ink-3">{outgoing ? RELATION_LABEL[edge.relation] : RELATION_INVERSE[edge.relation]}{edge.user ? " · yours" : ""}</span>
                  <span className="serif text-[17px] text-ink group-hover:text-ink-2 leading-snug block">{other.entry.title}</span>
                  {other.entry.location?.country ? <span className="block text-[12px] text-ink-4">{other.entry.location.country}</span> : null}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[13px] text-ink-3 mt-2">No connected entry has a place of its own.</p>
        )}
      </div>

      {elsewhere.length ? (
        <div className="mt-6">
          <div className="eyebrow">Connected, without a place</div>
          <ul className="mt-1 text-[14px] text-ink-2 space-y-1">
            {elsewhere.slice(0, 6).map((o) => (
              <li key={o.id}>
                <Link href={`/archive/${o.id}`} className="serif text-[16px] hover:text-ink">{o.title}</Link>
              </li>
            ))}
            {elsewhere.length > 6 ? <li className="text-[12px] text-ink-4">and {elsewhere.length - 6} more on the entry</li> : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
