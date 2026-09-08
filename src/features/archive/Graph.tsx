"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ArchiveDomain } from "@/lib/domain/types";
import { Empty } from "@/components/ui/primitives";
import { cx, plural } from "@/lib/util/format";
import { statusRank } from "@/lib/archive/entries";
import { DOMAIN_GROUPS, domainColor, graphMetrics, springLayout } from "@/lib/archive/layout";
import { ArchiveHeader, useArchive } from "./shared";

const W = 960;
const H = 620;

type Highlight = "isolated" | "foundational" | "bridges";

const HIGHLIGHT_META: Record<Highlight, { label: string; blurb: string }> = {
  isolated: { label: "Isolated", blurb: "one connection or none; the places your knowledge has no neighbours" },
  foundational: { label: "Foundational", blurb: "the most connected tenth; understanding these pays for itself" },
  bridges: { label: "Bridges", blurb: "neighbours in three or more domains; where transfer happens" },
};

export default function Graph() {
  const data = useArchive();
  const router = useRouter();
  const [highlight, setHighlight] = useState<Set<Highlight>>(new Set());
  const [dimmed, setDimmed] = useState<Set<ArchiveDomain>>(new Set());
  const [hover, setHover] = useState<string | null>(null);

  const nodesIn = useMemo(() => data.entries.filter((e) => e.kind !== "path").map((e) => ({ id: e.id, domain: e.domain })), [data.entries]);
  const positioned = useMemo(() => springLayout(nodesIn, data.edges, W, H, 150), [nodesIn, data.edges]);
  const metrics = useMemo(() => graphMetrics(positioned), [positioned]);
  const pos = useMemo(() => new Map(positioned.map((n) => [n.id, n])), [positioned]);

  function toggle(h: Highlight) {
    setHighlight((s) => {
      const n = new Set(s);
      if (n.has(h)) n.delete(h);
      else n.add(h);
      return n;
    });
  }
  function toggleDomain(ds: ArchiveDomain[]) {
    setDimmed((s) => {
      const n = new Set(s);
      const allDim = ds.every((d) => n.has(d));
      for (const d of ds) if (allDim) n.delete(d);
      else n.add(d);
      return n;
    });
  }

  const inHighlight = (id: string) => (highlight.has("isolated") && metrics.isolated.has(id)) || (highlight.has("foundational") && metrics.foundational.has(id)) || (highlight.has("bridges") && metrics.bridges.has(id));
  const neighboursOfHover = useMemo(() => {
    if (!hover) return new Set<string>();
    const s = new Set<string>([hover]);
    for (const e of data.edges) {
      if (e.from === hover) s.add(e.to);
      if (e.to === hover) s.add(e.from);
    }
    return s;
  }, [hover, data.edges]);

  const readCount = positioned.filter((n) => statusRank(data.progress.get(n.id)?.status ?? "unread") >= 1).length;
  const userEdges = data.edges.filter((e) => e.user).length;

  if (!positioned.length && !data.loading) {
    return (
      <div className="page">
        <ArchiveHeader eyebrow="The Archive · Graph" title="The knowledge graph" />
        <Empty title="No entries to draw yet." action={<Link href="/v1/archive" className="btn btn-secondary">Back to the Archive</Link>} />
      </div>
    );
  }

  return (
    <div className="page">
      <ArchiveHeader eyebrow="The Archive · Graph" title="What connects to what" lede={<>{plural(positioned.length, "entry", "entries")}, {plural(data.edges.length, "connection")}{userEdges ? `, ${userEdges} yours` : ""}. Labels stay on for what you have read ({readCount}); hover or tab for the rest.</>} />

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-4">
        <div className="flex items-center gap-2" role="group" aria-label="Highlight">
          <span className="eyebrow mr-1">Highlight</span>
          {(Object.keys(HIGHLIGHT_META) as Highlight[]).map((h) => {
            const count = metrics[h].size;
            return (
              <button key={h} type="button" aria-pressed={highlight.has(h)} onClick={() => toggle(h)} title={HIGHLIGHT_META[h].blurb} className={cx("text-[12px] px-2 py-1 border-b-2 transition-colors", highlight.has(h) ? "border-ink text-ink" : "border-transparent text-ink-3 hover:text-ink")}>
                {HIGHLIGHT_META[h].label} <span className="numeral text-ink-4">{count}</span>
              </button>
            );
          })}
        </div>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1" aria-label="Domains">
          {DOMAIN_GROUPS.map((g) => {
            const off = g.domains.every((d) => dimmed.has(d));
            return (
              <li key={g.label}>
                <button type="button" aria-pressed={!off} onClick={() => toggleDomain(g.domains)} className={cx("inline-flex items-center gap-1.5 text-[12px]", off ? "text-ink-4 line-through" : "text-ink-2 hover:text-ink")}>
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: domainColor(g.domains[0]) }} />
                  {g.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="stage">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="group" aria-label="Knowledge graph">
          <g>
            {data.edges.map((e) => {
              const a = pos.get(e.from);
              const b = pos.get(e.to);
              if (!a || !b) return null;
              const active = hover ? e.from === hover || e.to === hover : false;
              const faded = (dimmed.has(a.domain) && dimmed.has(b.domain)) || (hover && !active);
              return <line key={e.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={e.user ? "var(--wine)" : active ? "var(--ink-3)" : "var(--line-2)"} strokeWidth={active ? 1.4 : 1} strokeDasharray={e.user ? "3 3" : undefined} opacity={faded ? 0.18 : 1} />;
            })}
          </g>
          <g>
            {positioned.map((n) => {
              const entry = data.byId.get(n.id);
              if (!entry) return null;
              const status = data.progress.get(n.id)?.status ?? "unread";
              const read = statusRank(status) >= 1;
              const lit = inHighlight(n.id);
              const anyHighlight = highlight.size > 0;
              const faded = dimmed.has(n.domain) || (anyHighlight && !lit) || (hover && !neighboursOfHover.has(n.id));
              const showLabel = read || hover === n.id || (hover && neighboursOfHover.has(n.id)) || lit;
              const r = 4 + Math.min(6, n.degree * 0.7);
              const label = entry.title.length > 26 ? entry.title.slice(0, 25) + "…" : entry.title;
              return (
                <a
                  key={n.id}
                  href={`/v1/archive/${n.id}`}
                  onClick={(ev) => {
                    ev.preventDefault();
                    router.push(`/v1/archive/${n.id}`);
                  }}
                  onMouseEnter={() => setHover(n.id)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(n.id)}
                  onBlur={() => setHover(null)}
                  aria-label={`${entry.title}, ${status}, ${plural(n.degree, "connection")}`}
                  className="cursor-pointer outline-none [&:focus-visible>circle]:stroke-[var(--focus)] [&:focus-visible>circle]:stroke-2"
                  style={{ opacity: faded ? 0.22 : 1 }}
                >
                  {lit ? <circle cx={n.x} cy={n.y} r={r + 5} fill="none" stroke={domainColor(n.domain)} strokeWidth={1} opacity={0.6} /> : null}
                  <circle cx={n.x} cy={n.y} r={r} fill={read ? domainColor(n.domain) : "var(--paper-2)"} stroke={domainColor(n.domain)} strokeWidth={1.5} />
                  {showLabel ? (
                    <text x={n.x + r + 5} y={n.y + 4} fontSize={11} fill={hover === n.id ? "var(--ink)" : "var(--ink-2)"} fontFamily="var(--font-serif)" style={{ paintOrder: "stroke", stroke: "var(--paper-3)", strokeWidth: 3, strokeLinejoin: "round" }}>
                      {label}
                    </text>
                  ) : null}
                </a>
              );
            })}
          </g>
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-[12px] text-ink-3">
        <span className="inline-flex items-center gap-2"><span className="inline-block w-2.5 h-2.5 rounded-full bg-ink-3" /> read</span>
        <span className="inline-flex items-center gap-2"><span className="inline-block w-2.5 h-2.5 rounded-full border border-ink-3 bg-paper-2" /> unread</span>
        <span className="inline-flex items-center gap-2"><span className="inline-block w-5 border-t border-dashed border-wine" /> your connection</span>
        <span className="inline-flex items-center gap-2"><span className="inline-block w-5 border-t border-line-2" /> seeded</span>
        <span>Size follows connections.</span>
      </div>

      {highlight.size ? (
        <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {(Object.keys(HIGHLIGHT_META) as Highlight[]).filter((h) => highlight.has(h)).map((h) => (
            <div key={h}>
              <div className="border-t border-ink pt-2 mb-2">
                <span className="eyebrow">{HIGHLIGHT_META[h].label}</span>
                <p className="text-[12px] text-ink-3 mt-1">{HIGHLIGHT_META[h].blurb}.</p>
              </div>
              <ul className="divide-y divide-line">
                {positioned.filter((n) => metrics[h].has(n.id)).sort((a, b) => b.degree - a.degree).map((n) => {
                  const e = data.byId.get(n.id)!;
                  return (
                    <li key={n.id}>
                      <Link href={`/v1/archive/${n.id}`} className="flex items-baseline justify-between gap-3 py-1.5 hover:text-ink">
                        <span className="serif text-[16px]">{e.title}</span>
                        <span className="numeral text-[11px] text-ink-4">{n.degree}{h === "bridges" ? ` · ${n.neighbourDomains} domains` : ""}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}
