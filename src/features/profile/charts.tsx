"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { cx, shortDate } from "@/lib/util/format";

/**
 * Restrained inline-SVG charts for the Profile room. No chart library.
 * Ink carries the data; brass is the one secondary series colour, always paired
 * with a different marker shape so nothing is colour alone. Grids are hairlines.
 */

/* ------------------------------------------------------------------ */
/* Measuring                                                            */
/* ------------------------------------------------------------------ */

export function useWidth<T extends HTMLElement>(fallback = 320): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cw = entries[0]?.contentRect.width;
      if (cw) setW(Math.floor(cw));
    });
    ro.observe(el);
    setW(Math.floor(el.getBoundingClientRect().width) || fallback);
    return () => ro.disconnect();
  }, [fallback]);
  return [ref, w];
}

/* ------------------------------------------------------------------ */
/* Figure: title, one-line explanation, n, insufficient state           */
/* ------------------------------------------------------------------ */

export const MIN_N = 5;

export function Figure({
  title,
  explain,
  n,
  minN = MIN_N,
  children,
  table,
  aside,
  className,
}: {
  title: string;
  explain: string;
  n: number;
  minN?: number;
  children: React.ReactNode;
  /** Accessible twin of the chart: rows of cells */
  table?: { columns: string[]; rows: (string | number)[][] };
  aside?: React.ReactNode;
  className?: string;
}) {
  const id = useId();
  const enough = n >= minN;
  return (
    <figure className={cx("border-t border-line pt-4 min-w-0", className)} aria-labelledby={id}>
      <figcaption>
        <div className="flex items-baseline justify-between gap-4">
          <span id={id} className="eyebrow">
            {title}
          </span>
          <span className="numeral text-[11px] text-ink-3 shrink-0">n = {n}</span>
        </div>
        <p className="mt-1 text-[13px] text-ink-3 max-w-[60ch]">{explain}</p>
      </figcaption>
      {enough ? (
        <div className="mt-4">
          {children}
          {aside ? <div className="mt-2 text-[13px] text-ink-2">{aside}</div> : null}
          {table ? (
            <details className="mt-2">
              <summary className="text-[11px] text-ink-3 cursor-pointer select-none hover:text-ink">As a table</summary>
              <div className="overflow-x-auto mt-2">
                <table className="table">
                  <thead>
                    <tr>
                      {table.columns.map((c) => (
                        <th key={c}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((r, i) => (
                      <tr key={i}>
                        {r.map((c, j) => (
                          <td key={j} className={typeof c === "number" ? "numeral" : undefined}>
                            {c}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          ) : null}
        </div>
      ) : (
        <p className="mt-4 mb-2 serif text-[17px] text-ink-3">Not enough evidence yet{n > 0 ? ` — ${n} of ${minN} needed` : ""}.</p>
      )}
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Scales                                                               */
/* ------------------------------------------------------------------ */

function linear(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  return (x: number) => r0 + ((x - d0) / span) * (r1 - r0);
}

function pathFrom(points: { x: number; y: number }[]): string {
  return points.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
}

/* ------------------------------------------------------------------ */
/* Sparkline: inline, 84 × 22, no axes                                  */
/* ------------------------------------------------------------------ */

export function Sparkline({ points, width = 84, height = 22, className, faint }: { points: { value: number }[]; width?: number; height?: number; className?: string; faint?: boolean }) {
  if (points.length < 2) {
    return (
      <svg width={width} height={height} className={cx("shrink-0", className)} aria-hidden="true">
        <line x1={0} x2={width} y1={height / 2} y2={height / 2} className="stroke-line" strokeWidth={1} />
      </svg>
    );
  }
  const x = linear([0, points.length - 1], [1, width - 1]);
  const y = linear([0, 1], [height - 2, 2]);
  const pts = points.map((p, i) => ({ x: x(i), y: y(p.value) }));
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} className={cx("shrink-0", className)} aria-hidden="true">
      <line x1={0} x2={width} y1={y(0.5)} y2={y(0.5)} className="stroke-line" strokeWidth={1} />
      <path d={pathFrom(pts)} fill="none" className={faint ? "stroke-ink-4" : "stroke-ink-2"} strokeWidth={1.25} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last.x} cy={last.y} r={2} className={faint ? "fill-ink-4" : "fill-ink"} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Marker shapes (identity never by colour alone)                       */
/* ------------------------------------------------------------------ */

export type Shape = "circle" | "square" | "diamond";

export function Marker({ x, y, shape, r = 3.5, className, hollow }: { x: number; y: number; shape: Shape; r?: number; className?: string; hollow?: boolean }) {
  const fill = hollow ? "fill-paper-2" : className;
  const stroke = className;
  if (shape === "square") return <rect x={x - r} y={y - r} width={r * 2} height={r * 2} className={cx(fill, stroke)} strokeWidth={1.25} />;
  if (shape === "diamond") return <path d={`M${x} ${y - r * 1.2} L${x + r * 1.2} ${y} L${x} ${y + r * 1.2} L${x - r * 1.2} ${y}Z`} className={cx(fill, stroke)} strokeWidth={1.25} />;
  return <circle cx={x} cy={y} r={r} className={cx(fill, stroke)} strokeWidth={1.25} />;
}

export function Legend({ items }: { items: { label: string; shape: Shape; className: string; hollow?: boolean }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1 mt-2" aria-label="Legend">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-2 text-[12px] text-ink-2">
          <svg width={12} height={12} aria-hidden="true">
            <Marker x={6} y={6} shape={it.shape} className={it.className} hollow={it.hollow} r={3.5} />
          </svg>
          {it.label}
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Line chart over time (one or two series, 0..1 y)                     */
/* ------------------------------------------------------------------ */

export interface Series {
  label: string;
  points: { t: number; value: number }[];
  shape: Shape;
  /** stroke/fill class pair, e.g. "stroke-ink fill-ink" */
  className: string;
}

export function LineChart({ series, height = 180, yLabel, from, to, yTicks = [0, 0.5, 1], fmtY = (v: number) => `${Math.round(v * 100)}%` }: { series: Series[]; height?: number; yLabel?: string; from?: number; to?: number; yTicks?: number[]; fmtY?: (v: number) => string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<{ si: number; pi: number } | null>(null);
  const m = { l: 36, r: 12, t: 10, b: 24 };
  const all = series.flatMap((s) => s.points);
  const t0 = from ?? Math.min(...all.map((p) => p.t));
  const t1 = to ?? Math.max(...all.map((p) => p.t));
  const x = linear([t0, t1 === t0 ? t0 + 1 : t1], [m.l, width - m.r]);
  const y = linear([0, 1], [height - m.b, m.t]);
  const h = hover ? series[hover.si]?.points[hover.pi] : undefined;
  return (
    <div ref={ref} className="relative min-w-0">
      <svg width={width} height={height} role="img" aria-label={yLabel ? `${yLabel} over time` : "Over time"} className="block overflow-visible">
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={m.l} x2={width - m.r} y1={y(v)} y2={y(v)} className="stroke-line" strokeWidth={1} />
            <text x={m.l - 8} y={y(v)} dy={3} textAnchor="end" className="fill-ink-3 mono" fontSize={10}>
              {fmtY(v)}
            </text>
          </g>
        ))}
        <text x={m.l} y={height - 6} className="fill-ink-3" fontSize={10}>
          {shortDate(new Date(t0).toISOString())}
        </text>
        <text x={width - m.r} y={height - 6} textAnchor="end" className="fill-ink-3" fontSize={10}>
          {shortDate(new Date(t1).toISOString())}
        </text>
        {series.map((s, si) => {
          const pts = s.points.map((p) => ({ x: x(p.t), y: y(p.value) }));
          const stroke = s.className.split(" ").find((c) => c.startsWith("stroke-")) ?? "stroke-ink";
          return (
            <g key={s.label}>
              {pts.length > 1 ? <path d={pathFrom(pts)} fill="none" className={stroke} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" /> : null}
              {pts.map((p, pi) => (
                <g key={pi}>
                  <Marker x={p.x} y={p.y} shape={s.shape} className={s.className} r={hover?.si === si && hover.pi === pi ? 4.5 : 3} />
                  <rect x={p.x - 10} y={p.y - 10} width={20} height={20} fill="transparent" onMouseEnter={() => setHover({ si, pi })} onMouseLeave={() => setHover(null)} />
                </g>
              ))}
            </g>
          );
        })}
      </svg>
      {h && hover ? (
        <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-full bg-paper-2 border border-line rounded-sm px-2 py-1 text-[11px] text-ink-2 whitespace-nowrap shadow-paper" style={{ left: x(h.t), top: y(h.value) - 8 }} role="status">
          {series[hover.si].label} · <span className="numeral text-ink">{fmtY(h.value)}</span> · {shortDate(new Date(h.t).toISOString())}
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small multiple: one faculty line, compact                            */
/* ------------------------------------------------------------------ */

export function SmallLine({ points, from, to, height = 64 }: { points: { t: number; value: number }[]; from: number; to: number; height?: number }) {
  const [ref, width] = useWidth<HTMLDivElement>(200);
  const x = linear([from, to === from ? from + 1 : to], [2, width - 2]);
  const y = linear([0, 1], [height - 4, 4]);
  const pts = points.map((p) => ({ x: x(p.t), y: y(p.value) }));
  const last = pts.at(-1);
  return (
    <div ref={ref} className="min-w-0">
      <svg width={width} height={height} aria-hidden="true" className="block overflow-visible">
        <line x1={2} x2={width - 2} y1={y(0.5)} y2={y(0.5)} className="stroke-line" strokeWidth={1} />
        {pts.length > 1 ? <path d={pathFrom(pts)} fill="none" className="stroke-ink-2" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" /> : null}
        {last ? <circle cx={last.x} cy={last.y} r={3} className="fill-ink stroke-paper-2" strokeWidth={2} /> : null}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Calibration: predicted vs actual, diagonal                           */
/* ------------------------------------------------------------------ */

export function CalibrationChart({ buckets }: { buckets: { label: string; n: number; meanConfidence: number; accuracy: number; sufficient: boolean }[] }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const size = Math.min(width, 320);
  const m = { l: 36, r: 12, t: 12, b: 28 };
  const x = linear([0.4, 1], [m.l, size - m.r]);
  const y = linear([0.4, 1], [size - m.b, m.t]);
  const ticks = [0.5, 0.75, 1];
  const shown = buckets.filter((b) => b.n > 0);
  return (
    <div ref={ref} className="min-w-0 relative">
      <svg width={size} height={size} role="img" aria-label="Stated confidence against actual accuracy" className="block overflow-visible">
        {ticks.map((v) => (
          <g key={v}>
            <line x1={m.l} x2={size - m.r} y1={y(v)} y2={y(v)} className="stroke-line" strokeWidth={1} />
            <line y1={m.t} y2={size - m.b} x1={x(v)} x2={x(v)} className="stroke-line" strokeWidth={1} />
            <text x={m.l - 8} y={y(v)} dy={3} textAnchor="end" className="fill-ink-3 mono" fontSize={10}>
              {Math.round(v * 100)}%
            </text>
            <text x={x(v)} y={size - m.b + 14} textAnchor="middle" className="fill-ink-3 mono" fontSize={10}>
              {Math.round(v * 100)}%
            </text>
          </g>
        ))}
        <line x1={x(0.4)} y1={y(0.4)} x2={x(1)} y2={y(1)} className="stroke-ink-4" strokeWidth={1} strokeDasharray="3 3" />
        <text x={x(1)} y={y(1) - 6} textAnchor="end" className="fill-ink-4" fontSize={10}>
          perfect calibration
        </text>
        <text x={(m.l + size - m.r) / 2} y={size - 2} textAnchor="middle" className="fill-ink-3" fontSize={10}>
          stated confidence
        </text>
        <text x={10} y={(m.t + size - m.b) / 2} textAnchor="middle" transform={`rotate(-90 10 ${(m.t + size - m.b) / 2})`} className="fill-ink-3" fontSize={10}>
          actual accuracy
        </text>
        {shown.map((b, i) => {
          const r = 4 + Math.min(8, Math.sqrt(b.n));
          const cx0 = x(Math.max(0.4, b.meanConfidence));
          const cy0 = y(Math.max(0.4, b.accuracy));
          return (
            <g key={b.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0} aria-label={`${b.label} bucket: stated ${Math.round(b.meanConfidence * 100)}%, accuracy ${Math.round(b.accuracy * 100)}%, n = ${b.n}${b.sufficient ? "" : ", too few to trust"}`}>
              <circle cx={cx0} cy={cy0} r={r} className={b.sufficient ? "fill-ink stroke-paper-2" : "fill-paper-2 stroke-ink-3"} strokeWidth={b.sufficient ? 2 : 1.25} />
              <circle cx={cx0} cy={cy0} r={Math.max(12, r + 6)} fill="transparent" />
            </g>
          );
        })}
      </svg>
      {hover !== null && shown[hover] ? (
        <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-full bg-paper-2 border border-line rounded-sm px-2 py-1 text-[11px] text-ink-2 whitespace-nowrap shadow-paper" style={{ left: x(Math.max(0.4, shown[hover].meanConfidence)), top: y(Math.max(0.4, shown[hover].accuracy)) - 16 }} role="status">
          Stated <span className="numeral text-ink">{Math.round(shown[hover].meanConfidence * 100)}%</span> · right <span className="numeral text-ink">{Math.round(shown[hover].accuracy * 100)}%</span> · n = {shown[hover].n}
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Columns: categorical x, 0..1 or count y                              */
/* ------------------------------------------------------------------ */

export function Columns({ data, height = 160, max, fmt = (v: number) => String(v), yLabel, labelEvery = 1, sub }: { data: { label: string; value: number; n?: number; faint?: boolean }[]; height?: number; max?: number; fmt?: (v: number) => string; yLabel?: string; labelEvery?: number; sub?: (d: { label: string; value: number; n?: number }) => string | undefined }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const m = { l: 32, r: 8, t: 12, b: 36 };
  const top = max ?? Math.max(1, ...data.map((d) => d.value));
  const y = linear([0, top], [height - m.b, m.t]);
  const band = (width - m.l - m.r) / Math.max(1, data.length);
  const bw = Math.min(24, Math.max(6, band - 4));
  return (
    <div ref={ref} className="min-w-0 relative">
      <svg width={width} height={height} role="img" aria-label={yLabel ?? "Columns"} className="block overflow-visible">
        {[0, top].map((v) => (
          <g key={v}>
            <line x1={m.l} x2={width - m.r} y1={y(v)} y2={y(v)} className="stroke-line" strokeWidth={1} />
            <text x={m.l - 6} y={y(v)} dy={3} textAnchor="end" className="fill-ink-3 mono" fontSize={10}>
              {fmt(v)}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx0 = m.l + band * i + band / 2;
          const h = Math.max(0, y(0) - y(d.value));
          const isHover = hover === i;
          return (
            <g key={d.label + i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={cx0 - band / 2} y={m.t} width={band} height={height - m.t - m.b} fill="transparent" />
              {d.value > 0 ? <rect x={cx0 - bw / 2} y={y(d.value)} width={bw} height={h} rx={0} className={d.faint ? "fill-ink-4" : isHover ? "fill-ink" : "fill-ink-2"} /> : <line x1={cx0 - bw / 2} x2={cx0 + bw / 2} y1={y(0)} y2={y(0)} className="stroke-ink-4" strokeWidth={1.5} />}
              {i % labelEvery === 0 ? (
                <text x={cx0} y={height - m.b + 14} textAnchor="middle" className="fill-ink-3" fontSize={10}>
                  {d.label}
                </text>
              ) : null}
              {sub?.(d) ? (
                <text x={cx0} y={height - m.b + 26} textAnchor="middle" className="fill-ink-4 mono" fontSize={9}>
                  {sub(d)}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      {hover !== null && data[hover] ? (
        <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-full bg-paper-2 border border-line rounded-sm px-2 py-1 text-[11px] text-ink-2 whitespace-nowrap shadow-paper" style={{ left: m.l + band * hover + band / 2, top: y(data[hover].value) - 6 }} role="status">
          {data[hover].label} · <span className="numeral text-ink">{fmt(data[hover].value)}</span>
          {data[hover].n !== undefined ? ` · n = ${data[hover].n}` : ""}
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Timeline rows (Red Thread history)                                   */
/* ------------------------------------------------------------------ */

export function Timeline({ rows, from, to }: { rows: { label: string; status: string; start: number; end: number; resolved?: boolean }[]; from: number; to: number }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const labelW = Math.min(180, Math.max(110, width * 0.3));
  const x = linear([from, to === from ? from + 1 : to], [labelW, width - 8]);
  const rowH = 26;
  const height = rows.length * rowH + 20;
  return (
    <div ref={ref} className="min-w-0">
      <svg width={width} height={height} role="img" aria-label="Threads over time" className="block overflow-visible">
        <line x1={labelW} x2={width - 8} y1={height - 14} y2={height - 14} className="stroke-line" strokeWidth={1} />
        <text x={labelW} y={height - 2} className="fill-ink-3" fontSize={10}>
          {shortDate(new Date(from).toISOString())}
        </text>
        <text x={width - 8} y={height - 2} textAnchor="end" className="fill-ink-3" fontSize={10}>
          {shortDate(new Date(to).toISOString())}
        </text>
        {rows.map((r, i) => {
          const cy = i * rowH + 12;
          const x0 = x(Math.max(from, r.start));
          const x1 = x(Math.min(to, Math.max(r.end, r.start)));
          return (
            <g key={r.label + i}>
              <text x={0} y={cy} dy={4} className="fill-ink" fontSize={12}>
                {r.label.length > 22 ? r.label.slice(0, 21) + "…" : r.label}
              </text>
              <line x1={x0} x2={Math.max(x0 + 1, x1)} y1={cy} y2={cy} className={r.resolved ? "stroke-ink-4" : "stroke-ink-2"} strokeWidth={r.resolved ? 1.5 : 2.5} strokeLinecap="round" strokeDasharray={r.resolved ? "2 4" : undefined} />
              <circle cx={x0} cy={cy} r={3} className="fill-paper-2 stroke-ink-2" strokeWidth={1.25} />
              {r.resolved ? <Marker x={x1} y={cy} shape="diamond" className="fill-paper-2 stroke-ink-3" r={3} /> : <circle cx={x1} cy={cy} r={3.5} className="fill-ink stroke-paper-2" strokeWidth={2} />}
              <text x={width - 8} y={cy} dy={-7} textAnchor="end" className="fill-ink-3" fontSize={9} letterSpacing="0.08em">
                {r.status.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
