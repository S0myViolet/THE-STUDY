"use client";
/**
 * SceneSvg — the flat-illustration renderer for procedural scenes.
 *
 * Editorial line-and-fill: warm paper grounds, thin ink outlines, no gradients,
 * one flat shade per surface. Every SceneObjectType has a glyph; backdrops are
 * keyed by scene.backdrop. Objects are drawn in z order. Text on objects (book
 * spines, signs, boards, tickets) is real, legible text so the questions the
 * engine asks are answerable from the picture alone.
 */
import React from "react";
import type { Scene, SceneObject, SceneObjectType } from "./types";
import { COLOR_HEX } from "./engine";
import { LIGHT_COLORS } from "./data";
import { FLOOR, GEOMETRY, H, W } from "./templates";

/* ------------------------------------------------------------------ */
/* Palette and typography                                               */
/* ------------------------------------------------------------------ */

const INK = "#2b2a27";
const INK_SOFT = "rgba(43,42,39,0.45)";
const INK_FAINT = "rgba(43,42,39,0.16)";
const IVORY = "#f6f0e2";
const CREAM = "#efe6d2";
const LEAF = "#3f6b45";
const LEAF_DARK = "#2e5236";
const SKY = "#e9e6dc";
const SERIF = "var(--font-serif), 'Iowan Old Style', Georgia, serif";
const SANS = "var(--font-sans), system-ui, sans-serif";
const MONO = "var(--font-mono), 'SFMono-Regular', Menlo, monospace";
const STROKE = 1.4;

/** Darken or lighten a hex colour by a factor (flat shading, never a gradient). */
function shade(hex: string, k: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(k < 1 ? v * k : v + (255 - v) * (k - 1))));
  return `#${[f(r), f(g), f(b)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

interface Ctx {
  o: SceneObject;
  /** fill colour of the object */
  c: string;
  /** darker flat shade for sides and folds */
  d: string;
  /** lighter flat shade */
  l: string;
  /** ink or ivory, whichever reads on `c` */
  t: string;
  /** whether readable text is drawn */
  labels: boolean;
  /** stable per-object variation seed */
  v: number;
}

const ink = { stroke: INK, strokeWidth: STROKE, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

function Text({ x, y, size = 13, family = SANS, fill = INK, anchor = "middle", weight, italic, children, opacity, rotate, spacing }: { x: number; y: number; size?: number; family?: string; fill?: string; anchor?: "start" | "middle" | "end"; weight?: number; italic?: boolean; children: React.ReactNode; opacity?: number; rotate?: number; spacing?: number }) {
  return (
    <text x={x} y={y} fontSize={Math.max(12, size)} fontFamily={family} fill={fill} textAnchor={anchor} fontWeight={weight} fontStyle={italic ? "italic" : undefined} opacity={opacity} transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined} letterSpacing={spacing} style={{ userSelect: "none" }}>
      {children}
    </text>
  );
}

/** Hairlines standing in for unreadable print. */
function textLines(x: number, y: number, w: number, n: number, gap = 5, color = INK_SOFT) {
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const len = w * (i === n - 1 ? 0.55 : 1);
    out.push(<line key={i} x1={x} y1={y + i * gap} x2={x + len} y2={y + i * gap} stroke={color} strokeWidth={1} />);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Backdrops                                                            */
/* ------------------------------------------------------------------ */

function Floor({ y, fill, boards, tiles }: { y: number; fill: string; boards?: boolean; tiles?: boolean }) {
  const lines: React.ReactNode[] = [];
  if (boards) for (let i = 1; i < 5; i++) lines.push(<line key={i} x1={0} y1={y + (i * (H - y)) / 5} x2={W} y2={y + (i * (H - y)) / 5} stroke={INK_FAINT} strokeWidth={1} />);
  if (tiles) {
    for (let i = -6; i < 14; i++) lines.push(<line key={`t${i}`} x1={i * 100} y1={y} x2={i * 100 + 160} y2={H} stroke={INK_FAINT} strokeWidth={1} />);
    for (let i = -6; i < 14; i++) lines.push(<line key={`u${i}`} x1={i * 100 + 100} y1={y} x2={i * 100 - 60} y2={H} stroke={INK_FAINT} strokeWidth={1} />);
  }
  return (
    <g>
      <rect x={0} y={y} width={W} height={H - y} fill={fill} />
      {lines}
      <line x1={0} y1={y} x2={W} y2={y} stroke={INK} strokeWidth={1.2} opacity={0.7} />
    </g>
  );
}

function Skirting({ y, color = "#d8ccb2" }: { y: number; color?: string }) {
  return <rect x={0} y={y - 10} width={W} height={10} fill={color} stroke={INK_SOFT} strokeWidth={0.8} />;
}

function Backdrop({ kind }: { kind: Scene["backdrop"] }) {
  switch (kind) {
    case "room":
      return (
        <g>
          <rect width={W} height={H} fill="#f1e9d7" />
          <line x1={0} y1={30} x2={W} y2={30} stroke={INK_FAINT} strokeWidth={1} />
          <Skirting y={FLOOR} />
          <Floor y={FLOOR} fill="#dfd2b6" boards />
        </g>
      );
    case "cafe":
      return (
        <g>
          <rect width={W} height={H} fill="#efe4cf" />
          <rect x={0} y={290} width={W} height={FLOOR - 290} fill="#e4d6bb" />
          <line x1={0} y1={290} x2={W} y2={290} stroke={INK_SOFT} strokeWidth={1} />
          {Array.from({ length: 24 }, (_, i) => (
            <line key={i} x1={i * 40 + 20} y1={296} x2={i * 40 + 20} y2={FLOOR - 8} stroke={INK_FAINT} strokeWidth={1} />
          ))}
          <Skirting y={FLOOR} color="#cfc0a2" />
          <Floor y={FLOOR} fill="#d6c7a8" tiles />
        </g>
      );
    case "lobby":
      return (
        <g>
          <rect width={W} height={H} fill="#ebe1cc" />
          {[220, 330, 440, 550].map((x) => (
            <rect key={x} x={x} y={60} width={80} height={200} fill="none" stroke={INK_FAINT} strokeWidth={1} />
          ))}
          <line x1={0} y1={280} x2={W} y2={280} stroke={INK_SOFT} strokeWidth={1} />
          <rect x={0} y={280} width={W} height={FLOOR - 280} fill="#e2d5ba" />
          <Skirting y={FLOOR} color="#cdbf9f" />
          <Floor y={FLOOR} fill="#d9cbab" tiles />
        </g>
      );
    case "office":
      return (
        <g>
          <rect width={W} height={H} fill="#f0ede3" />
          <line x1={0} y1={FLOOR - 60} x2={W} y2={FLOOR - 60} stroke={INK_FAINT} strokeWidth={1} />
          <rect x={0} y={FLOOR - 60} width={W} height={60} fill="#e8e4d6" />
          <Skirting y={FLOOR} color="#d3cfc0" />
          <Floor y={FLOOR} fill="#d8d3c3" />
        </g>
      );
    case "train":
      return (
        <g>
          <rect width={W} height={H} fill="#e6dcc6" />
          <rect x={0} y={0} width={W} height={44} fill="#ddd2ba" />
          <line x1={0} y1={44} x2={W} y2={44} stroke={INK_SOFT} strokeWidth={1} />
          <rect x={0} y={340} width={W} height={FLOOR - 340} fill="#cdb894" />
          {Array.from({ length: 30 }, (_, i) => (
            <line key={i} x1={i * 32 + 16} y1={346} x2={i * 32 + 16} y2={FLOOR - 6} stroke={INK_FAINT} strokeWidth={1} />
          ))}
          <line x1={0} y1={340} x2={W} y2={340} stroke={INK_SOFT} strokeWidth={1} />
          <Floor y={FLOOR} fill="#b9ac93" />
        </g>
      );
    case "street":
      return (
        <g>
          <rect width={W} height={H} fill={SKY} />
          <rect x={0} y={40} width={W} height={GEOMETRY.streetPavement - 40} fill="#d9c8a6" />
          <line x1={0} y1={40} x2={W} y2={40} stroke={INK} strokeWidth={1.2} opacity={0.7} />
          <rect x={0} y={40} width={W} height={14} fill="#c9b691" stroke={INK_SOFT} strokeWidth={0.8} />
          {Array.from({ length: 14 }, (_, i) => (
            <line key={i} x1={0} y1={70 + i * 24} x2={W} y2={70 + i * 24} stroke={INK_FAINT} strokeWidth={1} />
          ))}
          <line x1={0} y1={GEOMETRY.streetPavement - 6} x2={W} y2={GEOMETRY.streetPavement - 6} stroke={INK_SOFT} strokeWidth={1} />
          <rect x={0} y={GEOMETRY.streetPavement} width={W} height={GEOMETRY.streetRoad - GEOMETRY.streetPavement} fill="#d5cdb8" />
          <line x1={0} y1={GEOMETRY.streetPavement} x2={W} y2={GEOMETRY.streetPavement} stroke={INK} strokeWidth={1} opacity={0.6} />
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={i * 88} y1={GEOMETRY.streetPavement} x2={i * 88 - 30} y2={GEOMETRY.streetRoad} stroke={INK_FAINT} strokeWidth={1} />
          ))}
          <rect x={0} y={GEOMETRY.streetRoad} width={W} height={H - GEOMETRY.streetRoad} fill="#b6ae9f" />
          <rect x={0} y={GEOMETRY.streetRoad} width={W} height={8} fill="#c6bda9" stroke={INK} strokeWidth={1} />
          <line x1={0} y1={565} x2={W} y2={565} stroke={IVORY} strokeWidth={3} strokeDasharray="40 30" opacity={0.7} />
        </g>
      );
    case "board":
      return (
        <g>
          <rect width={W} height={H} fill="#e9e3d3" />
          <line x1={0} y1={26} x2={W} y2={26} stroke={INK_FAINT} strokeWidth={1} />
          <rect x={0} y={456} width={W} height={570 - 456} fill="#e1d9c5" />
          <line x1={0} y1={456} x2={W} y2={456} stroke={INK_FAINT} strokeWidth={1} />
          <Floor y={570} fill="#cfc6b0" tiles />
        </g>
      );
    case "shelf": {
      const s = GEOMETRY.shelfCase;
      return (
        <g>
          <rect width={W} height={H} fill="#efe7d5" />
          <Skirting y={570} />
          <Floor y={570} fill="#d9ccb0" boards />
          <rect x={s.x} y={s.y} width={s.w} height={s.h} fill="#5a3b26" {...ink} />
          <rect x={s.x + 12} y={s.y + 12} width={s.w - 24} height={s.h - 12} fill="#e3d4b5" stroke="none" />
          <rect x={s.x - 4} y={s.y - 8} width={s.w + 8} height={10} fill="#6e4a30" {...ink} />
        </g>
      );
    }
    case "restaurant":
      return (
        <g>
          <rect width={W} height={H} fill="#ecdfc8" />
          <rect x={0} y={250} width={W} height={FLOOR - 250} fill="#dfcfb2" />
          <line x1={0} y1={250} x2={W} y2={250} stroke={INK_SOFT} strokeWidth={1.2} />
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={i * 120 + 20} y={268} width={80} height={FLOOR - 296} fill="none" stroke={INK_FAINT} strokeWidth={1} />
          ))}
          <Skirting y={FLOOR} color="#cbbb9a" />
          <Floor y={FLOOR} fill="#c9b895" boards />
        </g>
      );
    case "study": {
      const f = GEOMETRY.studyFireplace;
      return (
        <g>
          <rect width={W} height={H} fill="#44534a" />
          <line x1={0} y1={230} x2={W} y2={230} stroke="rgba(246,240,226,0.18)" strokeWidth={1} />
          <rect x={0} y={230} width={W} height={FLOOR - 230} fill="#3c4a42" />
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x={i * 80 + 10} y={246} width={60} height={FLOOR - 270} fill="none" stroke="rgba(246,240,226,0.12)" strokeWidth={1} />
          ))}
          <Skirting y={FLOOR} color="#2f3a34" />
          <Floor y={FLOOR} fill="#a88a63" boards />
          {/* fireplace */}
          <rect x={f.x} y={f.y + 14} width={f.w} height={f.h - 14} fill="#c9b99a" {...ink} />
          <rect x={f.x + 30} y={f.y + 40} width={f.w - 60} height={f.h - 40} fill="#2b2a27" {...ink} />
          <rect x={f.x + 30} y={f.y + 40} width={f.w - 60} height={12} fill="#3b3935" stroke="none" />
          <path d={`M${f.x + 70} ${f.y + f.h} q 12 -50 30 -66 q 8 26 24 30 q 4 -18 -2 -34 q 30 30 22 70 z`} fill="#a34a2a" stroke="none" />
          <path d={`M${f.x + 86} ${f.y + f.h} q 10 -30 18 -40 q 12 14 12 40 z`} fill="#c9a227" stroke="none" />
          <rect x={f.x + 40} y={f.y + f.h - 10} width={f.w - 80} height={10} fill="#5a3b26" stroke="none" />
        </g>
      );
    }
    default:
      return <rect width={W} height={H} fill="#f1e9d7" />;
  }
}

/* ------------------------------------------------------------------ */
/* Glyph helpers                                                        */
/* ------------------------------------------------------------------ */

function shadow(w: number, h: number, rx = w / 2) {
  return <ellipse cx={w / 2} cy={h - 1} rx={rx} ry={Math.min(5, Math.max(2, w / 14))} fill={INK} opacity={0.1} />;
}

/** Repeat a glyph `count` times across the box width. */
function repeat(count: number, w: number, draw: (i: number, cw: number, cx: number) => React.ReactNode) {
  const n = Math.max(1, count);
  const cw = w / n;
  return Array.from({ length: n }, (_, i) => <g key={i}>{draw(i, cw, i * cw)}</g>);
}

function clockHands(text: string | undefined, cx: number, cy: number, r: number, color: string) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(text ?? "");
  const hours = m ? parseInt(m[1], 10) % 12 : 10;
  const mins = m ? parseInt(m[2], 10) : 10;
  const ha = ((hours + mins / 60) / 12) * Math.PI * 2 - Math.PI / 2;
  const ma = (mins / 60) * Math.PI * 2 - Math.PI / 2;
  return (
    <g>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const big = i % 3 === 0;
        return <line key={i} x1={cx + Math.cos(a) * (r - (big ? 7 : 4))} y1={cy + Math.sin(a) * (r - (big ? 7 : 4))} x2={cx + Math.cos(a) * (r - 1.5)} y2={cy + Math.sin(a) * (r - 1.5)} stroke={color} strokeWidth={big ? 1.6 : 1} />;
      })}
      <line x1={cx} y1={cy} x2={cx + Math.cos(ha) * r * 0.52} y2={cy + Math.sin(ha) * r * 0.52} stroke={color} strokeWidth={2.6} strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={cx + Math.cos(ma) * r * 0.8} y2={cy + Math.sin(ma) * r * 0.8} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={2} fill={color} />
    </g>
  );
}

function paintingSubject(subject: string | undefined, w: number, h: number) {
  const px = 10;
  const iw = w - px * 2;
  const ih = h - px * 2;
  const g = (nodes: React.ReactNode) => (
    <g transform={`translate(${px},${px})`}>
      <rect width={iw} height={ih} fill="#e7dcc2" />
      {nodes}
    </g>
  );
  switch (subject) {
    case "harbour":
      return g(
        <>
          <rect x={0} y={ih * 0.55} width={iw} height={ih * 0.45} fill="#7b9aa3" />
          <path d={`M${iw * 0.3} ${ih * 0.6} l ${iw * 0.14} 0 l ${-iw * 0.07} ${-ih * 0.32} z`} fill="#6b1f2a" />
          <line x1={iw * 0.37} y1={ih * 0.28} x2={iw * 0.37} y2={ih * 0.6} stroke={INK} strokeWidth={1} />
          <path d={`M${iw * 0.24} ${ih * 0.6} l ${iw * 0.26} 0 l ${-iw * 0.04} ${ih * 0.1} l ${-iw * 0.18} 0 z`} fill="#5a3b26" />
        </>,
      );
    case "hills":
      return g(
        <>
          <path d={`M0 ${ih} L0 ${ih * 0.7} Q ${iw * 0.3} ${ih * 0.2} ${iw * 0.6} ${ih * 0.65} L ${iw} ${ih * 0.5} L ${iw} ${ih} z`} fill="#6b6b3a" />
          <path d={`M0 ${ih} L0 ${ih * 0.85} Q ${iw * 0.5} ${ih * 0.5} ${iw} ${ih * 0.8} L ${iw} ${ih} z`} fill="#3f6b45" />
        </>,
      );
    case "pears":
      return g(
        <>
          <line x1={0} y1={ih * 0.8} x2={iw} y2={ih * 0.8} stroke={INK_SOFT} strokeWidth={1} />
          <path d={`M${iw * 0.35} ${ih * 0.8} c -14 0 -16 -18 -8 -26 c 4 -8 6 -14 8 -20 c 2 6 4 12 8 20 c 8 8 6 26 -8 26 z`} fill="#c9a227" stroke={INK} strokeWidth={1} />
          <path d={`M${iw * 0.66} ${ih * 0.8} c -12 0 -14 -16 -7 -22 c 3 -7 5 -12 7 -18 c 2 6 4 11 7 18 c 7 6 5 22 -7 22 z`} fill="#6b6b3a" stroke={INK} strokeWidth={1} />
        </>,
      );
    case "portrait":
      return g(
        <>
          <rect width={iw} height={ih} fill="#3b3935" />
          <ellipse cx={iw / 2} cy={ih * 0.42} rx={iw * 0.16} ry={ih * 0.22} fill="#b9a98a" />
          <path d={`M${iw * 0.2} ${ih} q ${iw * 0.3} ${-ih * 0.55} ${iw * 0.6} 0 z`} fill="#6b1f2a" />
        </>,
      );
    case "sail":
      return g(
        <>
          <rect x={0} y={ih * 0.62} width={iw} height={ih * 0.38} fill="#5d6b78" />
          <path d={`M${iw * 0.48} ${ih * 0.62} l 0 ${-ih * 0.5} l ${iw * 0.26} ${ih * 0.5} z`} fill={IVORY} stroke={INK} strokeWidth={1} />
          <path d={`M${iw * 0.46} ${ih * 0.62} l 0 ${-ih * 0.42} l ${-iw * 0.2} ${ih * 0.42} z`} fill="#efe6d2" stroke={INK} strokeWidth={1} />
        </>,
      );
    default:
      return g(
        <>
          <rect x={0} y={ih * 0.66} width={iw} height={ih * 0.34} fill="#7b9aa3" />
          <path d={`M0 ${ih * 0.5} L ${iw} ${ih * 0.5} L ${iw} ${ih * 0.62} Q ${iw * 0.5} ${ih * 0.2} 0 ${ih * 0.62} z`} fill="#8b7355" stroke={INK} strokeWidth={1} />
          <line x1={0} y1={ih * 0.5} x2={iw} y2={ih * 0.5} stroke={INK} strokeWidth={1} />
        </>,
      );
  }
}

function personGlyph(k: Ctx) {
  const { o, c, d, v } = k;
  const w = o.w;
  const h = o.h;
  const s = h / 230; // scale against the canonical 70×230 figure
  const cx = w / 2;
  const hat = v % 4; // 0 none, 1 cap, 2 bowler, 3 brim
  const bag = (v >> 2) % 3; // 0 none, 1 side bag, 2 briefcase
  const scarf = (v >> 4) % 3 === 0;
  const coatLen = 132 + ((v >> 6) % 3) * 16;
  const headR = 15 * s;
  const headY = 20 * s;
  const shoulder = 42 * s;
  const hip = coatLen * s;
  const legEnd = 226 * s;
  const acc = LIGHT_COLORS.has(o.color) ? INK : IVORY;
  return (
    <g>
      {shadow(w, h, w * 0.4)}
      {/* legs */}
      <rect x={cx - 15 * s} y={hip - 4} width={12 * s} height={legEnd - hip + 4} fill={d} {...ink} />
      <rect x={cx + 3 * s} y={hip - 4} width={12 * s} height={legEnd - hip + 4} fill={d} {...ink} />
      <rect x={cx - 18 * s} y={legEnd - 4} width={16 * s} height={5} fill={INK} stroke="none" />
      <rect x={cx + 2 * s} y={legEnd - 4} width={16 * s} height={5} fill={INK} stroke="none" />
      {/* coat */}
      <path d={`M${cx - 20 * s} ${shoulder} q ${20 * s} ${-12 * s} ${40 * s} 0 l ${8 * s} ${hip - shoulder} l ${-56 * s} 0 z`} fill={c} {...ink} />
      <line x1={cx} y1={shoulder + 6} x2={cx} y2={hip - 6} stroke={INK_SOFT} strokeWidth={1} />
      {/* arms */}
      <path d={`M${cx - 20 * s} ${shoulder + 4} l ${-8 * s} ${60 * s} l ${9 * s} 2 l ${8 * s} ${-52 * s} z`} fill={d} {...ink} />
      <path d={`M${cx + 20 * s} ${shoulder + 4} l ${8 * s} ${60 * s} l ${-9 * s} 2 l ${-8 * s} ${-52 * s} z`} fill={d} {...ink} />
      {/* neck + head, same tone as the coat: a silhouette, not a portrait */}
      <rect x={cx - 5 * s} y={headY + headR - 3} width={10 * s} height={10 * s} fill={c} stroke="none" />
      <circle cx={cx} cy={headY} r={headR} fill={c} {...ink} />
      {scarf ? <path d={`M${cx - 14 * s} ${shoulder - 2} q ${14 * s} ${8 * s} ${28 * s} 0 l 0 6 q ${-14 * s} ${8 * s} ${-28 * s} 0 z`} fill={acc} {...ink} /> : null}
      {hat === 1 ? <path d={`M${cx - 15 * s} ${headY - 6} q ${15 * s} ${-16 * s} ${30 * s} 0 l ${8 * s} 2 l ${-38 * s} 0 z`} fill={INK} stroke="none" /> : null}
      {hat === 2 ? (
        <g>
          <path d={`M${cx - 13 * s} ${headY - 6} q ${13 * s} ${-24 * s} ${26 * s} 0 z`} fill={INK} stroke="none" />
          <rect x={cx - 19 * s} y={headY - 8} width={38 * s} height={4} fill={INK} stroke="none" />
        </g>
      ) : null}
      {hat === 3 ? (
        <g>
          <rect x={cx - 12 * s} y={headY - 24 * s} width={24 * s} height={18 * s} fill={INK} stroke="none" />
          <rect x={cx - 22 * s} y={headY - 8} width={44 * s} height={4} fill={INK} stroke="none" />
        </g>
      ) : null}
      {bag === 1 ? <rect x={cx + 22 * s} y={hip - 40 * s} width={20 * s} height={26 * s} rx={2} fill="#5a3b26" {...ink} /> : null}
      {bag === 2 ? <rect x={cx - 44 * s} y={hip + 10 * s} width={26 * s} height={20 * s} rx={2} fill="#2b2a27" {...ink} /> : null}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Glyph switch: one case for every SceneObjectType                     */
/* ------------------------------------------------------------------ */

function glyph(k: Ctx): React.ReactNode {
  const { o, c, d, l, t, labels, v } = k;
  const w = o.w;
  const h = o.h;
  const label = labels ? o.label : undefined;
  const text = labels ? o.text : undefined;
  const type: SceneObjectType = o.type;
  switch (type) {
    case "table": {
      if (o.text === "cloth") {
        return (
          <g>
            <path d={`M0 0 L${w} 0 L${w} ${h * 0.7} Q ${w - 14} ${h * 0.78} ${w - 24} ${h * 0.7} L ${w - 24} ${h} L 24 ${h} L 24 ${h * 0.7} Q 14 ${h * 0.78} 0 ${h * 0.7} z`} fill={c} {...ink} />
            {[0.25, 0.5, 0.75].map((f) => (
              <line key={f} x1={w * f} y1={14} x2={w * f + 6} y2={h * 0.7} stroke={INK_FAINT} strokeWidth={1} />
            ))}
            <line x1={0} y1={12} x2={w} y2={12} stroke={INK_SOFT} strokeWidth={1} />
          </g>
        );
      }
      const top = 16;
      if (w < 200) {
        // small pedestal table (cafe)
        return (
          <g>
            {shadow(w, h, w * 0.3)}
            <rect x={w * 0.2} y={h - 10} width={w * 0.6} height={10} rx={3} fill={d} {...ink} />
            <rect x={w / 2 - 6} y={top} width={12} height={h - top - 8} fill={c} {...ink} />
            <rect x={0} y={0} width={w} height={top} rx={3} fill={c} {...ink} />
            <line x1={4} y1={top - 5} x2={w - 4} y2={top - 5} stroke={INK_SOFT} strokeWidth={1} />
          </g>
        );
      }
      const drawer = w > 260;
      return (
        <g>
          <rect x={6} y={top} width={w - 12} height={h - top} fill={d} {...ink} />
          {drawer ? <rect x={w * 0.3} y={top + 8} width={w * 0.4} height={22} fill={c} {...ink} /> : null}
          {drawer ? <circle cx={w / 2} cy={top + 19} r={3} fill={INK} /> : null}
          <rect x={14} y={top + (drawer ? 36 : 6)} width={w * 0.2} height={h - top - (drawer ? 36 : 6)} fill={c} stroke="none" opacity={0.5} />
          <rect x={w - 14 - w * 0.2} y={top + (drawer ? 36 : 6)} width={w * 0.2} height={h - top - (drawer ? 36 : 6)} fill={c} stroke="none" opacity={0.5} />
          <rect x={0} y={0} width={w} height={top} rx={2} fill={c} {...ink} />
          <line x1={4} y1={top - 5} x2={w - 4} y2={top - 5} stroke={INK_SOFT} strokeWidth={1} />
        </g>
      );
    }
    case "chair": {
      if (o.text === "armchair") {
        return (
          <g>
            {shadow(w, h)}
            <rect x={0} y={h * 0.3} width={w} height={h * 0.62} rx={8} fill={c} {...ink} />
            <rect x={w * 0.18} y={0} width={w * 0.64} height={h * 0.5} rx={10} fill={l} {...ink} />
            <rect x={0} y={h * 0.42} width={w * 0.2} height={h * 0.34} rx={8} fill={l} {...ink} />
            <rect x={w * 0.8} y={h * 0.42} width={w * 0.2} height={h * 0.34} rx={8} fill={l} {...ink} />
            <rect x={w * 0.2} y={h * 0.58} width={w * 0.6} height={h * 0.2} rx={6} fill={d} {...ink} />
            <rect x={w * 0.08} y={h * 0.92} width={8} height={h * 0.08} fill={INK} />
            <rect x={w * 0.92 - 8} y={h * 0.92} width={8} height={h * 0.08} fill={INK} />
          </g>
        );
      }
      return (
        <g>
          {repeat(o.count ?? 1, w, (i, cw, cx) => {
            const pad = 4;
            const x0 = cx + pad;
            const cw2 = cw - pad * 2;
            const seatY = h * 0.55;
            return (
              <g>
                <rect x={x0 + 2} y={0} width={cw2 - 4} height={seatY + 4} rx={4} fill={c} {...ink} />
                <line x1={x0 + 8} y1={h * 0.16} x2={x0 + cw2 - 8} y2={h * 0.16} stroke={INK_SOFT} strokeWidth={1} />
                <line x1={x0 + 8} y1={h * 0.32} x2={x0 + cw2 - 8} y2={h * 0.32} stroke={INK_SOFT} strokeWidth={1} />
                <rect x={x0} y={seatY} width={cw2} height={8} rx={2} fill={d} {...ink} />
                <line x1={x0 + 3} y1={seatY + 8} x2={x0 + 3} y2={h} {...ink} strokeWidth={2.4} />
                <line x1={x0 + cw2 - 3} y1={seatY + 8} x2={x0 + cw2 - 3} y2={h} {...ink} strokeWidth={2.4} />
                <line x1={x0 + 3} y1={h - 12} x2={x0 + cw2 - 3} y2={h - 12} stroke={INK} strokeWidth={1} />
              </g>
            );
          })}
        </g>
      );
    }
    case "book": {
      const fs = Math.min(13, Math.max(12, w * 0.5));
      return (
        <g>
          <rect x={0} y={0} width={w} height={h} rx={1.5} fill={c} {...ink} />
          <line x1={2} y1={7} x2={w - 2} y2={7} stroke={t} strokeWidth={1} opacity={0.7} />
          <line x1={2} y1={h - 7} x2={w - 2} y2={h - 7} stroke={t} strokeWidth={1} opacity={0.7} />
          <line x1={2} y1={11} x2={w - 2} y2={11} stroke={t} strokeWidth={0.6} opacity={0.5} />
          {label ? (
            <Text x={w / 2 + fs * 0.35} y={h / 2} size={fs} family={SERIF} fill={t} rotate={-90}>
              {label}
            </Text>
          ) : (
            <line x1={w / 2} y1={20} x2={w / 2} y2={h - 20} stroke={t} strokeWidth={1.2} opacity={0.6} />
          )}
        </g>
      );
    }
    case "bookstack": {
      const n = Math.max(1, o.count ?? 2);
      const bh = h / n;
      const tones = [c, d, l, c];
      return (
        <g>
          {shadow(w, h, w * 0.45)}
          {Array.from({ length: n }, (_, i) => {
            const idx = n - 1 - i; // bottom first
            const off = (hash(`${v}${i}`) % 9) - 4;
            const bw = w - 10 - Math.abs(off) * 2;
            const x0 = 5 + off;
            const y0 = h - (i + 1) * bh;
            const tone = tones[idx % tones.length];
            return (
              <g key={i}>
                <rect x={x0} y={y0} width={bw} height={bh - 1} rx={1.5} fill={tone} {...ink} />
                <line x1={x0 + 4} y1={y0 + 2.5} x2={x0 + bw - 4} y2={y0 + 2.5} stroke={LIGHT_COLORS.has(o.color) ? INK : IVORY} strokeWidth={0.8} opacity={0.5} />
              </g>
            );
          })}
          {label ? (
            <Text x={w / 2} y={h - bh / 2 + 4.5} size={12} family={SERIF} fill={t} italic>
              {label}
            </Text>
          ) : null}
        </g>
      );
    }
    case "cup":
      return (
        <g>
          {repeat(o.count ?? 1, w, (i, cw, cx) => {
            const bw = Math.min(cw - 8, 26);
            const x0 = cx + (cw - bw) / 2 - 3;
            return (
              <g>
                <ellipse cx={x0 + bw / 2} cy={h - 2} rx={bw / 2 + 5} ry={3} fill={l} {...ink} />
                <path d={`M${x0} ${h * 0.25} L ${x0 + bw} ${h * 0.25} L ${x0 + bw - 3} ${h - 4} L ${x0 + 3} ${h - 4} z`} fill={c} {...ink} />
                <ellipse cx={x0 + bw / 2} cy={h * 0.25} rx={bw / 2} ry={3} fill={l} {...ink} />
                <path d={`M${x0 + bw} ${h * 0.4} q 9 0 9 7 q 0 7 -9 7`} fill="none" {...ink} />
              </g>
            );
          })}
        </g>
      );
    case "lamp": {
      if (h > 150) {
        // floor lamp
        return (
          <g>
            {shadow(w, h, w * 0.45)}
            <ellipse cx={w / 2} cy={h - 4} rx={w * 0.4} ry={4} fill={INK} />
            <line x1={w / 2} y1={h * 0.3} x2={w / 2} y2={h - 4} stroke={INK} strokeWidth={3} />
            <path d={`M${w * 0.16} ${h * 0.3} L ${w * 0.84} ${h * 0.3} L ${w * 0.72} 0 L ${w * 0.28} 0 z`} fill={c} {...ink} />
            <line x1={w * 0.16} y1={h * 0.3} x2={w * 0.84} y2={h * 0.3} stroke={d} strokeWidth={3} />
          </g>
        );
      }
      return (
        <g>
          <ellipse cx={w * 0.45} cy={h - 4} rx={w * 0.28} ry={4} fill={d} {...ink} />
          <path d={`M${w * 0.45} ${h - 5} q ${-w * 0.2} ${-h * 0.4} ${w * 0.1} ${-h * 0.62}`} fill="none" stroke={INK} strokeWidth={2.4} />
          <path d={`M${w * 0.08} ${h * 0.45} L ${w * 0.98} ${h * 0.45} L ${w * 0.78} 0 L ${w * 0.28} 0 z`} fill={c} {...ink} />
          <line x1={w * 0.08} y1={h * 0.45} x2={w * 0.98} y2={h * 0.45} stroke={d} strokeWidth={3} />
        </g>
      );
    }
    case "plant": {
      const potH = h > 140 ? h * 0.28 : h * 0.34;
      const potW = Math.min(w, h > 140 ? w * 0.7 : w * 0.8);
      const px = (w - potW) / 2;
      const top = h - potH;
      const leaves: React.ReactNode[] = [];
      const n = h > 140 ? 7 : 5;
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + ((i - (n - 1) / 2) / (n - 1)) * Math.PI * 0.9;
        const len = top * (0.55 + ((hash(`${v}${i}`) % 40) / 100));
        const bx = w / 2;
        const by = top + 2;
        const ex = bx + Math.cos(a) * len * 0.8;
        const ey = by - Math.abs(Math.sin(a)) * len - 4;
        const dx = ex - bx;
        const dy = ey - by;
        const L = Math.hypot(dx, dy) || 1;
        const bulge = Math.max(6, L * 0.2);
        const nx = (-dy / L) * bulge;
        const ny = (dx / L) * bulge;
        const mx = (bx + ex) / 2;
        const my = (by + ey) / 2;
        leaves.push(<path key={i} d={`M${bx} ${by} Q ${mx + nx} ${my + ny} ${ex} ${ey} Q ${mx - nx} ${my - ny} ${bx} ${by} z`} fill={i % 2 ? LEAF : LEAF_DARK} {...ink} />);
      }
      return (
        <g>
          {shadow(w, h, potW / 2)}
          {leaves}
          <path d={`M${px} ${top} L ${px + potW} ${top} L ${px + potW - potW * 0.12} ${h} L ${px + potW * 0.12} ${h} z`} fill={c} {...ink} />
          <rect x={px - 2} y={top - 2} width={potW + 4} height={potH * 0.22} fill={c} {...ink} />
        </g>
      );
    }
    case "clock": {
      const r = Math.min(w, h) / 2;
      const face = LIGHT_COLORS.has(o.color) ? c : c;
      return (
        <g>
          <circle cx={w / 2} cy={h / 2} r={r} fill={d} {...ink} />
          <circle cx={w / 2} cy={h / 2} r={r - 4} fill={face} {...ink} strokeWidth={1} />
          {clockHands(o.text, w / 2, h / 2, r - 5, t)}
        </g>
      );
    }
    case "sign": {
      if (o.text === "standing") {
        // pavement A-board
        return (
          <g>
            {shadow(w, h)}
            <path d={`M${w * 0.1} 0 L ${w * 0.9} 0 L ${w} ${h} L 0 ${h} z`} fill={c} {...ink} />
            <rect x={w * 0.16} y={h * 0.16} width={w * 0.68} height={h * 0.6} fill={LIGHT_COLORS.has(o.color) ? IVORY : shade(c, 0.85)} {...ink} strokeWidth={1} />
            {label ? (
              <Text x={w / 2} y={h * 0.5 + 5} size={13} family={SERIF} fill={t}>
                {label}
              </Text>
            ) : (
              textLines(w * 0.24, h * 0.36, w * 0.5, 3, 7)
            )}
          </g>
        );
      }
      if (o.color === "charcoal" && o.text && o.text.includes("·")) {
        // departures row: destination · time · gate · status
        const parts = o.text.split("·").map((s) => s.trim());
        const status = parts[2] ?? "";
        const statusColor = status === "Delayed" ? "#e0b62c" : status === "Cancelled" ? "#d9694a" : IVORY;
        return (
          <g>
            <rect x={0} y={0} width={w} height={h} fill="#232220" stroke="#3b3935" strokeWidth={1} />
            <line x1={0} y1={h} x2={w} y2={h} stroke="#3b3935" strokeWidth={1} />
            {labels ? (
              <>
                <Text x={16} y={h / 2 + 5} size={15} family={SERIF} fill={IVORY} anchor="start">
                  {o.label}
                </Text>
                <Text x={w * 0.5} y={h / 2 + 5} size={14} family={MONO} fill={IVORY} anchor="middle">
                  {parts[0]}
                </Text>
                <Text x={w * 0.68} y={h / 2 + 5} size={14} family={MONO} fill={IVORY} anchor="middle">
                  {parts[1]}
                </Text>
                <Text x={w - 16} y={h / 2 + 5} size={14} family={SANS} fill={statusColor} anchor="end">
                  {status}
                </Text>
              </>
            ) : (
              textLines(16, h / 2 - 2, w - 32, 1)
            )}
          </g>
        );
      }
      const two = !!o.text && o.text !== "standing";
      const fs = Math.min(15, Math.max(12, (w - 16) / Math.max(6, (o.label ?? "").length) / 0.62));
      return (
        <g>
          <rect x={0} y={0} width={w} height={h} rx={2} fill={c} {...ink} />
          <rect x={3} y={3} width={w - 6} height={h - 6} fill="none" stroke={t} strokeWidth={0.8} opacity={0.5} />
          {label ? (
            <Text x={w / 2} y={two ? h * 0.42 + 4 : h / 2 + 5} size={fs} family={SANS} fill={t} weight={500} spacing={0.3}>
              {label}
            </Text>
          ) : (
            textLines(12, h / 2 - 2, w - 24, 1)
          )}
          {two && labels ? (
            <Text x={w / 2} y={h * 0.78 + 4} size={12} family={MONO} fill={t}>
              {o.text}
            </Text>
          ) : null}
        </g>
      );
    }
    case "painting":
      return (
        <g>
          <rect x={0} y={0} width={w} height={h} fill={c} {...ink} />
          <rect x={5} y={5} width={w - 10} height={h - 10} fill="none" stroke={t} strokeWidth={0.8} opacity={0.5} />
          {paintingSubject(o.text, w, h)}
          <rect x={10} y={10} width={w - 20} height={h - 20} fill="none" {...ink} strokeWidth={1} />
        </g>
      );
    case "window": {
      if (o.text === "blinds") {
        const n = Math.floor((h - 12) / 9);
        return (
          <g>
            <rect x={0} y={0} width={w} height={h} fill={c} {...ink} />
            {Array.from({ length: n }, (_, i) => (
              <line key={i} x1={6} y1={8 + i * 9} x2={w - 6} y2={8 + i * 9} stroke={INK_SOFT} strokeWidth={2} />
            ))}
            <line x1={w - 14} y1={0} x2={w - 14} y2={h * 0.5} stroke={INK} strokeWidth={1} />
          </g>
        );
      }
      if (o.text === "landscape") {
        return (
          <g>
            <rect x={0} y={0} width={w} height={h} fill={SKY} {...ink} />
            <path d={`M0 ${h * 0.62} Q ${w * 0.2} ${h * 0.4} ${w * 0.4} ${h * 0.58} T ${w * 0.75} ${h * 0.5} T ${w} ${h * 0.6} L ${w} ${h} L 0 ${h} z`} fill="#8e9a6b" stroke="none" />
            <path d={`M0 ${h * 0.78} Q ${w * 0.3} ${h * 0.66} ${w * 0.55} ${h * 0.8} T ${w} ${h * 0.76} L ${w} ${h} L 0 ${h} z`} fill="#6b7a45" stroke="none" />
            <line x1={0} y1={h * 0.9} x2={w} y2={h * 0.9} stroke={INK_SOFT} strokeWidth={1} />
            <line x1={w / 2} y1={0} x2={w / 2} y2={h} stroke={INK} strokeWidth={4} />
            <rect x={0} y={0} width={w} height={h} fill="none" stroke={INK} strokeWidth={4} />
          </g>
        );
      }
      return (
        <g>
          <rect x={-6} y={-6} width={w + 12} height={h + 12} fill={IVORY} {...ink} />
          <rect x={0} y={0} width={w} height={h} fill={SKY} {...ink} />
          <path d={`M0 ${h * 0.7} Q ${w * 0.25} ${h * 0.55} ${w * 0.5} ${h * 0.68} T ${w} ${h * 0.62} L ${w} ${h} L 0 ${h} z`} fill="#c9c8ae" stroke="none" />
          <line x1={w / 2} y1={0} x2={w / 2} y2={h} stroke={INK} strokeWidth={3} />
          <line x1={0} y1={h * 0.45} x2={w} y2={h * 0.45} stroke={INK} strokeWidth={3} />
          <rect x={-10} y={h + 6} width={w + 20} height={8} fill={CREAM} {...ink} />
        </g>
      );
    }
    case "door": {
      if (o.text === "sliding") {
        return (
          <g>
            <rect x={0} y={0} width={w} height={h} fill={c} {...ink} />
            <rect x={w * 0.18} y={h * 0.08} width={w * 0.64} height={h * 0.34} fill={SKY} {...ink} />
            <rect x={w * 0.18} y={h * 0.55} width={w * 0.64} height={h * 0.36} fill={d} {...ink} />
            <rect x={w * 0.1} y={h * 0.46} width={w * 0.14} height={h * 0.06} rx={2} fill={INK} />
          </g>
        );
      }
      return (
        <g>
          <rect x={-8} y={-8} width={w + 16} height={h + 8} fill={CREAM} {...ink} />
          <rect x={0} y={0} width={w} height={h} fill={c} {...ink} />
          <rect x={w * 0.16} y={h * 0.08} width={w * 0.68} height={h * 0.36} fill="none" stroke={t} strokeWidth={1} opacity={0.6} />
          <rect x={w * 0.16} y={h * 0.52} width={w * 0.68} height={h * 0.4} fill="none" stroke={t} strokeWidth={1} opacity={0.6} />
          <circle cx={w * 0.8} cy={h * 0.5} r={3.5} fill="#9c7c34" {...ink} strokeWidth={1} />
        </g>
      );
    }
    case "person":
      return personGlyph(k);
    case "bag":
      return (
        <g>
          {shadow(w, h)}
          <path d={`M${w * 0.28} ${h * 0.34} q ${w * 0.22} ${-h * 0.5} ${w * 0.44} 0`} fill="none" {...ink} strokeWidth={2} />
          <rect x={0} y={h * 0.3} width={w} height={h * 0.68} rx={6} fill={c} {...ink} />
          <rect x={w * 0.36} y={h * 0.3} width={w * 0.28} height={h * 0.22} fill={d} {...ink} strokeWidth={1} />
          <line x1={6} y1={h * 0.62} x2={w - 6} y2={h * 0.62} stroke={INK_SOFT} strokeWidth={1} />
        </g>
      );
    case "phone":
      return (
        <g>
          <rect x={0} y={0} width={w} height={h} rx={3} fill={c} {...ink} />
          <rect x={3} y={5} width={w - 6} height={h - 12} rx={1} fill="#c9c2b0" stroke="none" />
          <circle cx={w / 2} cy={h - 3.5} r={1.4} fill={t} />
        </g>
      );
    case "notebook":
      return (
        <g>
          <rect x={0} y={0} width={w} height={h} rx={3} fill={c} {...ink} />
          <rect x={0} y={0} width={8} height={h} rx={2} fill={d} {...ink} strokeWidth={1} />
          <line x1={w - 12} y1={0} x2={w - 12} y2={h} stroke={t} strokeWidth={2} opacity={0.6} />
          <rect x={16} y={h * 0.32} width={w * 0.45} height={h * 0.3} fill={IVORY} stroke="none" opacity={0.9} />
        </g>
      );
    case "letter":
      return (
        <g>
          <rect x={0} y={0} width={w} height={h} fill={c} {...ink} />
          <path d={`M0 0 L ${w / 2} ${h * 0.55} L ${w} 0`} fill="none" {...ink} strokeWidth={1} />
          <path d={`M0 ${h} L ${w * 0.4} ${h * 0.45} M${w} ${h} L ${w * 0.6} ${h * 0.45}`} fill="none" stroke={INK_SOFT} strokeWidth={1} />
          <rect x={w - 16} y={4} width={11} height={11} fill="#a34a2a" stroke="none" opacity={0.85} />
        </g>
      );
    case "key":
      return (
        <g>
          <circle cx={h / 2} cy={h / 2} r={h / 2 - 1} fill="none" {...ink} strokeWidth={3} />
          <line x1={h - 1} y1={h / 2} x2={w - 2} y2={h / 2} stroke={c} strokeWidth={4} strokeLinecap="round" />
          <line x1={h - 1} y1={h / 2} x2={w - 2} y2={h / 2} stroke={INK} strokeWidth={1} opacity={0.4} />
          <line x1={w - 5} y1={h / 2} x2={w - 5} y2={h - 1} stroke={c} strokeWidth={3} />
          <line x1={w - 11} y1={h / 2} x2={w - 11} y2={h - 3} stroke={c} strokeWidth={3} />
        </g>
      );
    case "glasses": {
      const r = h / 2 - 1;
      return (
        <g>
          <circle cx={w * 0.28} cy={h / 2} r={r} fill="rgba(233,230,220,0.6)" stroke={c} strokeWidth={2.2} />
          <circle cx={w * 0.72} cy={h / 2} r={r} fill="rgba(233,230,220,0.6)" stroke={c} strokeWidth={2.2} />
          <path d={`M${w * 0.28 + r} ${h / 2 - 2} q ${w * 0.22 - r} ${-6} ${w * 0.44 - 2 * r} 0`} fill="none" stroke={c} strokeWidth={2} />
          <line x1={w * 0.28 - r} y1={h / 2 - 2} x2={0} y2={h / 2 - 5} stroke={c} strokeWidth={2} />
          <line x1={w * 0.72 + r} y1={h / 2 - 2} x2={w} y2={h / 2 - 5} stroke={c} strokeWidth={2} />
        </g>
      );
    }
    case "umbrella": {
      if (o.rotation === 90 || w > h) {
        return (
          <g>
            <path d={`M${w * 0.1} ${h * 0.35} L ${w * 0.86} ${h * 0.2} q ${w * 0.08} ${h * 0.3} 0 ${h * 0.6} L ${w * 0.1} ${h * 0.65} z`} fill={c} {...ink} />
            <path d={`M${w * 0.14} ${h * 0.4} L ${w * 0.82} ${h * 0.3} M${w * 0.14} ${h * 0.6} L ${w * 0.82} ${h * 0.7}`} fill="none" stroke={t} strokeWidth={0.8} opacity={0.6} />
            <line x1={w * 0.86} y1={h * 0.5} x2={w} y2={h * 0.5} stroke={INK} strokeWidth={2} />
            <path d={`M${w * 0.1} ${h * 0.5} L 4 ${h * 0.5} q -4 0 -4 ${h * 0.3}`} fill="none" stroke="#5a3b26" strokeWidth={2.4} />
          </g>
        );
      }
      return (
        <g>
          {shadow(w, h)}
          <path d={`M${w * 0.5} 0 L ${w * 0.5} ${h * 0.86}`} stroke={INK} strokeWidth={2} />
          <path d={`M${w * 0.5} ${h * 0.86} q 0 ${h * 0.1} ${-w * 0.25} ${h * 0.1}`} fill="none" stroke="#5a3b26" strokeWidth={2.6} />
          <path d={`M${w * 0.5} ${h * 0.06} L ${w * 0.16} ${h * 0.7} q ${w * 0.34} ${h * 0.06} ${w * 0.68} 0 z`} fill={c} {...ink} />
          <path d={`M${w * 0.5} ${h * 0.1} L ${w * 0.36} ${h * 0.7} M${w * 0.5} ${h * 0.1} L ${w * 0.64} ${h * 0.7}`} fill="none" stroke={t} strokeWidth={0.8} opacity={0.6} />
          <line x1={w * 0.5} y1={h * 0.7} x2={w * 0.5} y2={h * 0.86} stroke={INK} strokeWidth={2} />
        </g>
      );
    }
    case "hat":
      return (
        <g>
          <ellipse cx={w / 2} cy={h * 0.82} rx={w / 2} ry={h * 0.18} fill={d} {...ink} />
          <path d={`M${w * 0.22} ${h * 0.82} L ${w * 0.24} ${h * 0.14} q ${w * 0.26} ${-h * 0.2} ${w * 0.52} 0 L ${w * 0.78} ${h * 0.82} z`} fill={c} {...ink} />
          <rect x={w * 0.22} y={h * 0.58} width={w * 0.56} height={h * 0.12} fill={INK} opacity={0.7} />
        </g>
      );
    case "laptop":
      return (
        <g>
          <path d={`M${w * 0.14} 0 L ${w * 0.86} 0 L ${w * 0.9} ${h * 0.76} L ${w * 0.1} ${h * 0.76} z`} fill={c} {...ink} />
          <path d={`M${w * 0.2} ${h * 0.08} L ${w * 0.8} ${h * 0.08} L ${w * 0.83} ${h * 0.68} L ${w * 0.17} ${h * 0.68} z`} fill="#dcdad0" stroke="none" />
          <path d={`M0 ${h} L ${w} ${h} L ${w * 0.9} ${h * 0.76} L ${w * 0.1} ${h * 0.76} z`} fill={d} {...ink} />
          <rect x={w * 0.36} y={h * 0.86} width={w * 0.28} height={h * 0.06} fill={INK} opacity={0.4} />
        </g>
      );
    case "bottle":
      return (
        <g>
          <rect x={w * 0.34} y={0} width={w * 0.32} height={h * 0.08} fill={INK} />
          <path d={`M${w * 0.36} ${h * 0.08} L ${w * 0.64} ${h * 0.08} L ${w * 0.64} ${h * 0.24} Q ${w} ${h * 0.32} ${w} ${h * 0.44} L ${w} ${h - 3} q 0 3 -3 3 L 3 ${h} q -3 0 -3 -3 L 0 ${h * 0.44} Q 0 ${h * 0.32} ${w * 0.36} ${h * 0.24} z`} fill={c} {...ink} />
          <rect x={2} y={h * 0.56} width={w - 4} height={h * 0.2} fill={IVORY} stroke="none" opacity={0.9} />
          <line x1={w * 0.2} y1={h * 0.34} x2={w * 0.2} y2={h * 0.5} stroke={IVORY} strokeWidth={1.4} opacity={0.5} />
        </g>
      );
    case "vase":
      return (
        <g>
          <path d={`M${w * 0.3} 0 L ${w * 0.7} 0 L ${w * 0.62} ${h * 0.18} Q ${w * 1.02} ${h * 0.4} ${w * 0.86} ${h * 0.72} Q ${w * 0.8} ${h * 0.94} ${w * 0.68} ${h} L ${w * 0.32} ${h} Q ${w * 0.2} ${h * 0.94} ${w * 0.14} ${h * 0.72} Q ${-w * 0.02} ${h * 0.4} ${w * 0.38} ${h * 0.18} z`} fill={c} {...ink} />
          <path d={`M${w * 0.2} ${h * 0.45} q ${w * 0.3} ${h * 0.08} ${w * 0.6} 0`} fill="none" stroke={t} strokeWidth={1} opacity={0.5} />
          <line x1={w * 0.5} y1={0} x2={w * 0.5} y2={-h * 0.28} stroke={LEAF_DARK} strokeWidth={1.4} />
          <line x1={w * 0.42} y1={0} x2={w * 0.24} y2={-h * 0.2} stroke={LEAF_DARK} strokeWidth={1.4} />
          <ellipse cx={w * 0.5} cy={-h * 0.3} rx={5} ry={4} fill="#a34a2a" stroke="none" />
          <ellipse cx={w * 0.22} cy={-h * 0.22} rx={4} ry={3.2} fill="#c9a227" stroke="none" />
        </g>
      );
    case "board": {
      const dark = !LIGHT_COLORS.has(o.color);
      if (o.label === "Departures") {
        return (
          <g>
            <rect x={-6} y={-6} width={w + 12} height={h + 12} rx={3} fill="#3b3935" {...ink} />
            <rect x={0} y={0} width={w} height={h} fill="#1e1d1b" stroke="none" />
            <line x1={14} y1={62} x2={w - 14} y2={62} stroke="#4a4844" strokeWidth={1} />
            {labels ? (
              <>
                <Text x={20} y={44} size={22} family={SERIF} fill={IVORY} anchor="start" spacing={0.5}>
                  {o.label}
                </Text>
                <Text x={w - 20} y={44} size={20} family={MONO} fill="#e0b62c" anchor="end">
                  {o.text}
                </Text>
                <Text x={w * 0.5} y={h * 0.985 - 2} size={12} family={SANS} fill="#7d7a72" anchor="middle" spacing={1}>
                  DESTINATION · TIME · GATE · STATUS
                </Text>
              </>
            ) : null}
          </g>
        );
      }
      const bg = dark ? c : IVORY;
      const fg = dark ? IVORY : INK;
      return (
        <g>
          <rect x={-5} y={-5} width={w + 10} height={h + 10} fill={dark ? "#5a3b26" : "#c9c2b0"} {...ink} />
          <rect x={0} y={0} width={w} height={h} fill={bg} stroke="none" />
          {label ? (
            <Text x={16} y={30} size={16} family={SERIF} fill={fg} anchor="start" italic={dark}>
              {label}
            </Text>
          ) : null}
          {text ? (
            <Text x={16} y={58} size={14} family={dark ? SERIF : SANS} fill={fg} anchor="start">
              {text}
            </Text>
          ) : null}
          <line x1={16} y1={38} x2={w - 16} y2={38} stroke={fg} strokeWidth={0.8} opacity={0.5} />
          {textLines(16, 76, w * 0.5, Math.max(1, Math.floor((h - 84) / 9)), 9, dark ? "rgba(246,240,226,0.35)" : INK_FAINT)}
          <rect x={w * 0.55} y={h - 14} width={w * 0.4} height={5} fill="none" stroke={fg} strokeWidth={0.8} opacity={0.4} />
        </g>
      );
    }
    case "suitcase":
      return (
        <g>
          {shadow(w, h)}
          <rect x={w * 0.34} y={0} width={w * 0.32} height={h * 0.12} rx={3} fill="none" {...ink} strokeWidth={2} />
          <rect x={0} y={h * 0.1} width={w} height={h * 0.9} rx={5} fill={c} {...ink} />
          <line x1={w * 0.28} y1={h * 0.1} x2={w * 0.28} y2={h} stroke={d} strokeWidth={4} />
          <line x1={w * 0.72} y1={h * 0.1} x2={w * 0.72} y2={h} stroke={d} strokeWidth={4} />
          <line x1={0} y1={h * 0.5} x2={w} y2={h * 0.5} stroke={INK_SOFT} strokeWidth={1} />
          <rect x={w * 0.42} y={h * 0.44} width={w * 0.16} height={h * 0.12} fill="#9c7c34" {...ink} strokeWidth={1} />
        </g>
      );
    case "newspaper":
      return (
        <g>
          <rect x={0} y={h * 0.15} width={w} height={h * 0.85} fill={c} {...ink} />
          <path d={`M0 ${h * 0.15} L ${w} ${h * 0.15} L ${w} 0 L 0 ${h * 0.05} z`} fill={d} {...ink} />
          {label ? (
            <Text x={w / 2} y={h * 0.15 + 14} size={12} family={SERIF} fill={INK} weight={700}>
              {label}
            </Text>
          ) : null}
          <line x1={5} y1={h * 0.15 + 18} x2={w - 5} y2={h * 0.15 + 18} stroke={INK} strokeWidth={0.8} />
          {textLines(6, h * 0.15 + 25, w * 0.4, 3, 4)}
          {textLines(w * 0.52, h * 0.15 + 25, w * 0.4, 3, 4)}
        </g>
      );
    case "candle":
      return (
        <g>
          {repeat(o.count ?? 1, w, (i, cw, cx) => {
            const x0 = cx + cw / 2;
            return (
              <g>
                <ellipse cx={x0} cy={h - 2} rx={Math.min(cw / 2, 10)} ry={2.5} fill="#9c7c34" {...ink} strokeWidth={1} />
                <rect x={x0 - 4} y={h * 0.32} width={8} height={h * 0.66} fill={c} {...ink} />
                <line x1={x0} y1={h * 0.32} x2={x0} y2={h * 0.24} stroke={INK} strokeWidth={1} />
                <path d={`M${x0} ${h * 0.02} q 5 ${h * 0.14} 0 ${h * 0.24} q -5 ${-h * 0.1} 0 ${-h * 0.24} z`} fill="#c9a227" stroke="#a34a2a" strokeWidth={0.8} />
              </g>
            );
          })}
        </g>
      );
    case "shelf": {
      if (o.text === "rack") {
        return (
          <g>
            <rect x={0} y={h - 4} width={w} height={4} fill={c} {...ink} />
            {Array.from({ length: Math.floor(w / 24) }, (_, i) => (
              <line key={i} x1={i * 24 + 12} y1={h - 4} x2={i * 24 + 12} y2={h - 18} stroke={INK} strokeWidth={1.4} />
            ))}
            <line x1={0} y1={h - 18} x2={w} y2={h - 18} stroke={INK} strokeWidth={2} />
            <line x1={10} y1={h} x2={0} y2={h + 26} stroke={INK} strokeWidth={2} />
            <line x1={w - 10} y1={h} x2={w} y2={h + 26} stroke={INK} strokeWidth={2} />
          </g>
        );
      }
      if (o.text === "mantel") {
        return (
          <g>
            <rect x={-10} y={0} width={w + 20} height={h} fill="#c9b99a" {...ink} />
            <rect x={-6} y={h} width={w + 12} height={6} fill="#b3a385" {...ink} strokeWidth={1} />
          </g>
        );
      }
      return (
        <g>
          <rect x={0} y={0} width={w} height={h} fill={c} {...ink} />
          <path d={`M12 ${h} l 0 18 l 16 -18`} fill={d} {...ink} strokeWidth={1} />
          <path d={`M${w - 12} ${h} l 0 18 l -16 -18`} fill={d} {...ink} strokeWidth={1} />
        </g>
      );
    }
    case "counter":
      return (
        <g>
          <rect x={4} y={16} width={w - 8} height={h - 16} fill={c} {...ink} />
          {Array.from({ length: Math.floor((w - 8) / 28) }, (_, i) => (
            <line key={i} x1={18 + i * 28} y1={24} x2={18 + i * 28} y2={h - 8} stroke={d} strokeWidth={3} />
          ))}
          <rect x={0} y={0} width={w} height={18} rx={2} fill="#d8ccb2" {...ink} />
          <line x1={0} y1={26} x2={w} y2={26} stroke={INK_SOFT} strokeWidth={1} />
        </g>
      );
    case "rug":
      return (
        <g>
          <rect x={0} y={0} width={w} height={h} rx={h / 2} fill={c} {...ink} />
          <rect x={8} y={6} width={w - 16} height={h - 12} rx={(h - 12) / 2} fill="none" stroke={t} strokeWidth={1} opacity={0.6} />
          <rect x={w * 0.3} y={h * 0.32} width={w * 0.4} height={h * 0.36} rx={4} fill={d} stroke="none" opacity={0.6} />
        </g>
      );
    case "coat": {
      if (h > 160) {
        // coat on a stand
        return (
          <g>
            {shadow(w, h, w * 0.4)}
            <line x1={w / 2} y1={4} x2={w / 2} y2={h - 6} stroke={INK} strokeWidth={3} />
            <path d={`M${w * 0.24} ${h - 4} L ${w * 0.76} ${h - 4} L ${w / 2} ${h - 22} z`} fill="#5a3b26" {...ink} />
            <path d={`M${w / 2 - 14} 6 l 14 -6 l 14 6 M${w / 2 - 22} 14 l 22 -12 l 22 12`} fill="none" stroke={INK} strokeWidth={2} />
            <path d={`M${w * 0.5} 14 L ${w * 0.22} ${h * 0.26} L ${w * 0.14} ${h * 0.68} L ${w * 0.86} ${h * 0.68} L ${w * 0.78} ${h * 0.26} z`} fill={c} {...ink} />
            <line x1={w * 0.5} y1={22} x2={w * 0.5} y2={h * 0.66} stroke={t} strokeWidth={1} opacity={0.5} />
            <circle cx={w * 0.56} cy={h * 0.38} r={1.8} fill={t} />
            <circle cx={w * 0.56} cy={h * 0.48} r={1.8} fill={t} />
          </g>
        );
      }
      return (
        <g>
          <circle cx={w / 2} cy={5} r={3} fill="none" {...ink} strokeWidth={2} />
          <path d={`M${w / 2 - 12} 12 q 12 -10 24 0 L ${w * 0.9} ${h * 0.3} L ${w * 0.84} ${h} L ${w * 0.16} ${h} L ${w * 0.1} ${h * 0.3} z`} fill={c} {...ink} />
          <line x1={w / 2} y1={16} x2={w / 2} y2={h - 6} stroke={t} strokeWidth={1} opacity={0.5} />
        </g>
      );
    }
    case "menu":
      return (
        <g>
          <path d={`M0 ${h} L 0 4 q 0 -4 4 -4 L ${w - 4} 0 q 4 0 4 4 L ${w} ${h} z`} fill={c} {...ink} />
          <rect x={4} y={5} width={w - 8} height={h - 10} fill="none" stroke={t} strokeWidth={0.7} opacity={0.6} />
          {labels ? (
            <Text x={w / 2} y={h * 0.32} size={12} family={SERIF} fill={t} italic>
              Menu
            </Text>
          ) : null}
          {textLines(9, h * 0.48, w - 18, 4, 6, LIGHT_COLORS.has(o.color) ? INK_SOFT : "rgba(246,240,226,0.5)")}
        </g>
      );
    case "ticket":
      return (
        <g>
          <path d={`M0 0 L ${w} 0 L ${w} ${h * 0.35} q -5 0 -5 ${h * 0.15} q 0 ${h * 0.15} 5 ${h * 0.15} L ${w} ${h} L 0 ${h} L 0 ${h * 0.65} q 5 0 5 ${-h * 0.15} q 0 ${-h * 0.15} -5 ${-h * 0.15} z`} fill={c} {...ink} />
          <line x1={w * 0.14} y1={4} x2={w * 0.14} y2={h - 4} stroke={INK_SOFT} strokeWidth={1} strokeDasharray="2 2" />
          {text && text.includes("·") ? (
            <>
              <Text x={w * 0.57} y={h / 2 - 1} size={12} family={MONO} fill={INK}>
                {text.split("·")[0].trim()}
              </Text>
              <Text x={w * 0.57} y={h / 2 + 12} size={12} family={MONO} fill={INK}>
                {text.split("·")[1]?.trim()}
              </Text>
            </>
          ) : text ? (
            <Text x={w * 0.57} y={h / 2 + 4.5} size={12} family={MONO} fill={INK}>
              {text}
            </Text>
          ) : (
            textLines(w * 0.24, h / 2 - 3, w * 0.6, 2, 6)
          )}
        </g>
      );
    case "map":
      return (
        <g>
          <rect x={0} y={0} width={w} height={h} fill={c} {...ink} />
          <path d={`M${w * 0.1} ${h * 0.3} q ${w * 0.15} ${-h * 0.2} ${w * 0.3} ${-h * 0.02} q ${w * 0.12} ${h * 0.18} ${w * 0.3} ${h * 0.06} q ${w * 0.16} ${h * 0.14} ${w * 0.08} ${h * 0.3} q ${-w * 0.16} ${h * 0.24} ${-w * 0.36} ${h * 0.18} q ${-w * 0.16} ${-h * 0.04} ${-w * 0.24} ${h * 0.12} q ${-w * 0.14} ${-h * 0.2} ${-w * 0.08} ${-h * 0.64} z`} fill="#d6cfb0" stroke={INK} strokeWidth={1} />
          <path d={`M${w * 0.3} ${h * 0.5} q ${w * 0.2} ${-h * 0.1} ${w * 0.42} ${h * 0.06}`} fill="none" stroke="#a34a2a" strokeWidth={1} strokeDasharray="3 2" />
          <circle cx={w * 0.3} cy={h * 0.5} r={2.5} fill="#6b1f2a" />
          <circle cx={w * 0.72} cy={h * 0.56} r={2.5} fill="#6b1f2a" />
          {label ? (
            <Text x={w / 2} y={h - 8} size={12} family={SERIF} fill={INK} italic spacing={0.5}>
              {label}
            </Text>
          ) : null}
        </g>
      );
    case "globe": {
      const r = Math.min(w / 2 - 2, h * 0.36);
      const cy = r + 6;
      return (
        <g>
          <path d={`M${w * 0.3} ${h} L ${w * 0.7} ${h} L ${w * 0.6} ${h - 8} L ${w * 0.4} ${h - 8} z`} fill="#5a3b26" {...ink} />
          <line x1={w / 2} y1={h - 8} x2={w / 2} y2={cy + r} stroke={INK} strokeWidth={2} />
          <path d={`M${w / 2 + r * 0.9} ${cy - r * 0.6} A ${r + 5} ${r + 5} 0 0 1 ${w / 2 + r * 0.2} ${cy + r + 3}`} fill="none" stroke="#9c7c34" strokeWidth={2.4} />
          <circle cx={w / 2} cy={cy} r={r} fill={c} {...ink} />
          <ellipse cx={w / 2} cy={cy} rx={r * 0.45} ry={r} fill="none" stroke={t} strokeWidth={0.8} opacity={0.6} />
          <line x1={w / 2 - r} y1={cy} x2={w / 2 + r} y2={cy} stroke={t} strokeWidth={0.8} opacity={0.6} />
          <path d={`M${w / 2 - r * 0.5} ${cy - r * 0.3} q ${r * 0.3} ${-r * 0.4} ${r * 0.7} ${-r * 0.1} q ${r * 0.1} ${r * 0.5} ${-r * 0.3} ${r * 0.6} q ${-r * 0.5} ${-r * 0.1} ${-r * 0.4} ${-r * 0.5} z`} fill={t} opacity={0.35} stroke="none" />
        </g>
      );
    }
    case "typewriter":
      return (
        <g>
          <rect x={w * 0.32} y={0} width={w * 0.36} height={h * 0.4} fill={IVORY} {...ink} />
          {textLines(w * 0.38, h * 0.1, w * 0.24, 3, 5)}
          <rect x={w * 0.1} y={h * 0.32} width={w * 0.8} height={h * 0.18} rx={3} fill={d} {...ink} />
          <path d={`M0 ${h} L ${w} ${h} L ${w * 0.92} ${h * 0.5} L ${w * 0.08} ${h * 0.5} z`} fill={c} {...ink} />
          {[0.62, 0.74, 0.86].map((f, r) => (
            <g key={r}>
              {Array.from({ length: 8 - r }, (_, i) => (
                <circle key={i} cx={w * (0.2 + r * 0.05) + i * w * 0.085} cy={h * f} r={2.6} fill={IVORY} stroke={INK} strokeWidth={0.7} />
              ))}
            </g>
          ))}
        </g>
      );
    case "pen":
      return (
        <g transform={`rotate(-8 ${w / 2} ${h / 2})`}>
          <rect x={h} y={0} width={w - h * 2} height={h} rx={h / 2} fill={c} {...ink} strokeWidth={1} />
          <path d={`M${h} 0 L 0 ${h / 2} L ${h} ${h} z`} fill="#9c7c34" {...ink} strokeWidth={1} />
          <rect x={w - h * 2} y={0} width={h * 2} height={h} rx={h / 2} fill={d} stroke="none" />
        </g>
      );
    case "radio":
      return (
        <g>
          <rect x={0} y={h * 0.14} width={w} height={h * 0.86} rx={5} fill={c} {...ink} />
          <line x1={w * 0.82} y1={h * 0.14} x2={w * 0.96} y2={-h * 0.3} stroke={INK} strokeWidth={1.6} />
          <circle cx={w * 0.74} cy={h * 0.57} r={h * 0.24} fill={IVORY} {...ink} strokeWidth={1} />
          <line x1={w * 0.74} y1={h * 0.57} x2={w * 0.82} y2={h * 0.42} stroke={INK} strokeWidth={1.4} />
          {Array.from({ length: 6 }, (_, i) => (
            <line key={i} x1={w * 0.1 + i * w * 0.08} y1={h * 0.3} x2={w * 0.1 + i * w * 0.08} y2={h * 0.86} stroke={t} strokeWidth={2} opacity={0.6} />
          ))}
        </g>
      );
    case "cat":
      return (
        <g>
          {shadow(w, h, w * 0.4)}
          <ellipse cx={w * 0.42} cy={h * 0.68} rx={w * 0.34} ry={h * 0.3} fill={c} {...ink} />
          <circle cx={w * 0.74} cy={h * 0.36} r={h * 0.26} fill={c} {...ink} />
          <path d={`M${w * 0.6} ${h * 0.22} l -2 ${-h * 0.3} l ${w * 0.12} ${h * 0.14} z M${w * 0.86} ${h * 0.2} l 4 ${-h * 0.3} l ${-w * 0.12} ${h * 0.14} z`} fill={c} {...ink} />
          <path d={`M${w * 0.1} ${h * 0.8} q ${-w * 0.14} ${-h * 0.3} ${w * 0.04} ${-h * 0.62}`} fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
          <path d={`M${w * 0.1} ${h * 0.8} q ${-w * 0.14} ${-h * 0.3} ${w * 0.04} ${-h * 0.62}`} fill="none" stroke={c} strokeWidth={1.4} strokeLinecap="round" />
          <line x1={w * 0.26} y1={h * 0.98} x2={w * 0.56} y2={h * 0.98} stroke={INK} strokeWidth={1} />
        </g>
      );
    case "dog":
      return (
        <g>
          {shadow(w, h, w * 0.42)}
          <rect x={w * 0.14} y={h * 0.32} width={w * 0.56} height={h * 0.38} rx={h * 0.16} fill={c} {...ink} />
          <rect x={w * 0.2} y={h * 0.62} width={w * 0.1} height={h * 0.38} fill={c} {...ink} />
          <rect x={w * 0.34} y={h * 0.62} width={w * 0.1} height={h * 0.38} fill={d} {...ink} />
          <rect x={w * 0.52} y={h * 0.62} width={w * 0.1} height={h * 0.38} fill={c} {...ink} />
          <rect x={w * 0.62} y={h * 0.62} width={w * 0.1} height={h * 0.38} fill={d} {...ink} />
          <path d={`M${w * 0.14} ${h * 0.4} q ${-w * 0.16} ${-h * 0.12} ${-w * 0.1} ${-h * 0.34}`} fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
          <path d={`M${w * 0.14} ${h * 0.4} q ${-w * 0.16} ${-h * 0.12} ${-w * 0.1} ${-h * 0.34}`} fill="none" stroke={c} strokeWidth={1.4} strokeLinecap="round" />
          <rect x={w * 0.66} y={h * 0.08} width={w * 0.3} height={h * 0.34} rx={h * 0.1} fill={c} {...ink} />
          <path d={`M${w * 0.68} ${h * 0.12} q ${-w * 0.08} ${h * 0.22} ${w * 0.02} ${h * 0.34}`} fill={d} {...ink} />
          <rect x={w * 0.6} y={h * 0.3} width={w * 0.06} height={h * 0.12} fill={d} stroke="none" />
          <rect x={w * 0.62} y={h * 0.36} width={w * 0.14} height={h * 0.05} fill="#6b1f2a" stroke="none" />
        </g>
      );
    case "bicycle": {
      const r = Math.min(h * 0.42, w * 0.22);
      const cy = h - r - 2;
      const x1 = r + 4;
      const x2 = w - r - 4;
      return (
        <g>
          {shadow(w, h, w * 0.45)}
          <circle cx={x1} cy={cy} r={r} fill="none" stroke={INK} strokeWidth={2.2} />
          <circle cx={x2} cy={cy} r={r} fill="none" stroke={INK} strokeWidth={2.2} />
          <circle cx={x1} cy={cy} r={r * 0.15} fill={INK} />
          <circle cx={x2} cy={cy} r={r * 0.15} fill={INK} />
          <path d={`M${x1} ${cy} L ${w * 0.42} ${h * 0.22} L ${w * 0.62} ${h * 0.22} L ${x2} ${cy} M${w * 0.42} ${h * 0.22} L ${w * 0.52} ${cy} L ${x1} ${cy} M${w * 0.52} ${cy} L ${w * 0.62} ${h * 0.22}`} fill="none" stroke={c} strokeWidth={4} strokeLinejoin="round" />
          <circle cx={w * 0.52} cy={cy} r={r * 0.22} fill={IVORY} {...ink} strokeWidth={1} />
          <line x1={w * 0.62} y1={h * 0.22} x2={w * 0.7} y2={h * 0.06} stroke={INK} strokeWidth={2.2} />
          <line x1={w * 0.66} y1={h * 0.06} x2={w * 0.78} y2={h * 0.06} stroke={INK} strokeWidth={3} />
          <line x1={w * 0.36} y1={h * 0.14} x2={w * 0.46} y2={h * 0.14} stroke={INK} strokeWidth={4} />
          <line x1={w * 0.42} y1={h * 0.22} x2={w * 0.41} y2={h * 0.14} stroke={INK} strokeWidth={2} />
        </g>
      );
    }
    case "car": {
      const r = h * 0.16;
      return (
        <g>
          {shadow(w, h, w * 0.46)}
          <path d={`M${w * 0.02} ${h * 0.72} L ${w * 0.02} ${h * 0.5} Q ${w * 0.04} ${h * 0.42} ${w * 0.16} ${h * 0.4} L ${w * 0.28} ${h * 0.12} Q ${w * 0.3} ${h * 0.06} ${w * 0.36} ${h * 0.06} L ${w * 0.7} ${h * 0.06} Q ${w * 0.76} ${h * 0.06} ${w * 0.8} ${h * 0.14} L ${w * 0.9} ${h * 0.4} Q ${w * 0.98} ${h * 0.42} ${w * 0.98} ${h * 0.52} L ${w * 0.98} ${h * 0.72} z`} fill={c} {...ink} />
          <path d={`M${w * 0.32} ${h * 0.12} L ${w * 0.5} ${h * 0.12} L ${w * 0.5} ${h * 0.38} L ${w * 0.2} ${h * 0.38} z`} fill={SKY} {...ink} strokeWidth={1} />
          <path d={`M${w * 0.54} ${h * 0.12} L ${w * 0.7} ${h * 0.12} L ${w * 0.84} ${h * 0.38} L ${w * 0.54} ${h * 0.38} z`} fill={SKY} {...ink} strokeWidth={1} />
          <line x1={w * 0.02} y1={h * 0.56} x2={w * 0.98} y2={h * 0.56} stroke={d} strokeWidth={2} />
          <circle cx={w * 0.24} cy={h * 0.74} r={r} fill={INK} />
          <circle cx={w * 0.24} cy={h * 0.74} r={r * 0.45} fill={IVORY} />
          <circle cx={w * 0.76} cy={h * 0.74} r={r} fill={INK} />
          <circle cx={w * 0.76} cy={h * 0.74} r={r * 0.45} fill={IVORY} />
          <rect x={w * 0.03} y={h * 0.6} width={w * 0.06} height={h * 0.05} fill="#c9a227" stroke="none" />
          <rect x={w * 0.91} y={h * 0.6} width={w * 0.06} height={h * 0.05} fill="#a34a2a" stroke="none" />
        </g>
      );
    }
    case "tree":
      return (
        <g>
          {shadow(w, h, w * 0.3)}
          <rect x={w * 0.44} y={h * 0.5} width={w * 0.12} height={h * 0.5} fill="#5a3b26" {...ink} />
          <path d={`M${w * 0.5} ${h * 0.52} l ${-w * 0.16} ${-h * 0.12} M${w * 0.5} ${h * 0.6} l ${w * 0.18} ${-h * 0.14}`} fill="none" stroke="#5a3b26" strokeWidth={4} />
          <ellipse cx={w * 0.5} cy={h * 0.32} rx={w * 0.48} ry={h * 0.3} fill={c} {...ink} />
          <ellipse cx={w * 0.34} cy={h * 0.2} rx={w * 0.26} ry={h * 0.16} fill={l} {...ink} />
          <ellipse cx={w * 0.66} cy={h * 0.4} rx={w * 0.3} ry={h * 0.17} fill={d} {...ink} />
        </g>
      );
    case "bench":
      return (
        <g>
          {shadow(w, h, w * 0.46)}
          <rect x={0} y={0} width={w} height={h * 0.16} rx={2} fill={c} {...ink} />
          <rect x={0} y={h * 0.2} width={w} height={h * 0.14} rx={2} fill={c} {...ink} />
          <rect x={0} y={h * 0.5} width={w} height={h * 0.16} rx={2} fill={c} {...ink} />
          <rect x={0} y={h * 0.68} width={w} height={h * 0.08} rx={2} fill={d} {...ink} />
          <path d={`M${w * 0.08} ${h * 0.34} L ${w * 0.08} ${h} M${w * 0.92} ${h * 0.34} L ${w * 0.92} ${h}`} fill="none" stroke={INK} strokeWidth={3} />
          <path d={`M${w * 0.08} ${h * 0.5} L ${w * 0.08} ${h * 0.34} M${w * 0.92} ${h * 0.5} L ${w * 0.92} ${h * 0.34}`} fill="none" stroke={INK} strokeWidth={3} />
        </g>
      );
    case "streetlamp":
      return (
        <g>
          <path d={`M${w * 0.2} ${h} L ${w * 0.8} ${h} L ${w * 0.66} ${h - 12} L ${w * 0.34} ${h - 12} z`} fill={c} {...ink} />
          <line x1={w / 2} y1={h - 12} x2={w / 2} y2={h * 0.16} stroke={c} strokeWidth={5} />
          <line x1={w / 2} y1={h - 12} x2={w / 2} y2={h * 0.16} stroke={INK} strokeWidth={1} opacity={0.5} />
          <path d={`M${w * 0.1} ${h * 0.16} L ${w * 0.9} ${h * 0.16} L ${w * 0.76} ${h * 0.02} L ${w * 0.24} ${h * 0.02} z`} fill={c} {...ink} />
          <path d={`M${w * 0.16} ${h * 0.16} L ${w * 0.84} ${h * 0.16} L ${w * 0.7} ${h * 0.09} L ${w * 0.3} ${h * 0.09} z`} fill="#e0b62c" stroke="none" opacity={0.9} />
          <line x1={w / 2} y1={h * 0.02} x2={w / 2} y2={-4} stroke={INK} strokeWidth={2} />
        </g>
      );
    case "awning": {
      const fascia = 20;
      const bottom = h * 0.82;
      const n = Math.max(3, Math.floor(w / 38));
      const sw = w / n;
      const stripes: React.ReactNode[] = [];
      for (let i = 0; i < n; i++) {
        if (i % 2 === 0) continue;
        stripes.push(<rect key={i} x={i * sw} y={fascia} width={sw} height={bottom - fascia} fill={IVORY} opacity={0.85} stroke="none" />);
      }
      return (
        <g>
          <rect x={0} y={fascia} width={w} height={bottom - fascia} fill={c} {...ink} />
          {stripes}
          <path d={`M0 ${bottom} ${Array.from({ length: n }, () => `q ${sw / 2} ${h - bottom} ${sw} 0`).join(" ")}`} fill={c} {...ink} />
          <rect x={-6} y={0} width={w + 12} height={fascia} fill={d} {...ink} />
          {label ? (
            <Text x={w / 2} y={fascia - 6} size={13} family={SERIF} fill={IVORY} spacing={2}>
              {label.toUpperCase()}
            </Text>
          ) : null}
        </g>
      );
    }
    case "flag":
      return (
        <g>
          <line x1={4} y1={0} x2={4} y2={h} stroke={INK} strokeWidth={2.4} />
          <circle cx={4} cy={0} r={3} fill="#9c7c34" {...ink} strokeWidth={1} />
          <path d={`M6 4 L ${w} 8 q ${-w * 0.08} ${h * 0.2} 0 ${h * 0.42} L 6 ${h * 0.56} z`} fill={c} {...ink} />
          <line x1={6} y1={h * 0.3} x2={w - 2} y2={h * 0.32} stroke={t} strokeWidth={1.2} opacity={0.6} />
        </g>
      );
    case "box": {
      const n = Math.max(1, o.count ?? 1);
      const bh = h / n;
      return (
        <g>
          {shadow(w, h, w * 0.45)}
          {Array.from({ length: n }, (_, i) => {
            const y0 = i * bh;
            return (
              <g key={i}>
                <rect x={i % 2 ? 3 : 0} y={y0} width={w - (i % 2 ? 3 : 0)} height={bh} fill={c} {...ink} />
                <line x1={(i % 2 ? 3 : 0) + w * 0.5} y1={y0} x2={(i % 2 ? 3 : 0) + w * 0.5} y2={y0 + bh} stroke={INK_SOFT} strokeWidth={1} />
                <rect x={i % 2 ? 3 : 0} y={y0 + bh * 0.3} width={w - (i % 2 ? 3 : 0)} height={bh * 0.06} fill={d} stroke="none" />
              </g>
            );
          })}
          {label ? (
            <Text x={w / 2} y={h - bh / 2 + 5} size={12} family={SANS} fill={t} weight={600} spacing={0.5}>
              {label.toUpperCase()}
            </Text>
          ) : null}
        </g>
      );
    }
    default: {
      // Unknown type: still draw a labelled shape so nothing silently vanishes.
      const name: string = type;
      return (
        <g>
          <rect x={0} y={0} width={w} height={h} fill={c} {...ink} />
          <Text x={w / 2} y={h / 2 + 4} size={12} family={SANS} fill={t}>
            {name}
          </Text>
        </g>
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

export interface SceneSvgProps {
  scene: Scene;
  className?: string;
  /** Replace readable text on objects with hairlines (for exposures where text recall is not the point). */
  hideLabels?: boolean;
}

function ObjectGlyph({ o, seed, labels }: { o: SceneObject; seed: number; labels: boolean }) {
  const c = COLOR_HEX[o.color] ?? COLOR_HEX.charcoal;
  const k: Ctx = {
    o,
    c,
    d: shade(c, 0.78),
    l: shade(c, 1.18),
    t: LIGHT_COLORS.has(o.color) ? INK : IVORY,
    labels,
    v: hash(`${seed}:${o.id}`),
  };
  const tilt = o.rotation && !(o.type === "umbrella" && o.rotation === 90) ? o.rotation : 0;
  const transform = `translate(${o.x},${o.y})` + (tilt ? ` rotate(${tilt} ${o.w / 2} ${o.h / 2})` : "");
  return (
    <g transform={transform} data-object={o.id} data-type={o.type}>
      {glyph(k)}
    </g>
  );
}

export function SceneSvg({ scene, className, hideLabels }: SceneSvgProps) {
  const ordered = scene.objects.map((o, i) => ({ o, i })).sort((a, b) => (a.o.z ?? a.i) - (b.o.z ?? b.i) || a.i - b.i);
  return (
    <svg viewBox={`0 0 ${scene.width} ${scene.height}`} className={className} role="img" aria-label={scene.setting} xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <title>{scene.title}</title>
      <Backdrop kind={scene.backdrop} />
      {ordered.map(({ o }) => (
        <ObjectGlyph key={o.id} o={o} seed={scene.seed} labels={!hideLabels} />
      ))}
      {/* vignette frame: one hairline, like a plate in a book */}
      <rect x={0.5} y={0.5} width={scene.width - 1} height={scene.height - 1} fill="none" stroke={INK} strokeWidth={1} opacity={0.6} />
    </svg>
  );
}
