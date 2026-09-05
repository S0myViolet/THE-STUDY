"use client";

import React, { useEffect, useState } from "react";
import { FACULTIES, type FacultyId } from "@/lib/domain/faculties";
import type { FacultyView } from "@/lib/profile/derive";
import { cx } from "@/lib/util/format";

/**
 * The faculty constellation. Twelve nodes placed by kinship, not by score:
 * reasoning to the left, people to the right, knowledge below. Size is evidence,
 * shade is level, the small glyph is trend. Untested faculties stay faint.
 */

type Pos = Record<FacultyId, [number, number]>;

const WIDE: { w: number; h: number; pos: Pos } = {
  w: 760,
  h: 470,
  pos: {
    composure: [300, 70],
    observation: [110, 175],
    inference: [245, 215],
    calibration: [385, 150],
    quantitative: [205, 340],
    social: [555, 85],
    rhetoric: [680, 185],
    strategy: [570, 275],
    memory: [355, 420],
    knowledge: [470, 365],
    synthesis: [600, 405],
    curiosity: [705, 330],
  },
};

const NARROW: { w: number; h: number; pos: Pos } = {
  w: 380,
  h: 640,
  pos: {
    composure: [190, 55],
    observation: [60, 140],
    inference: [180, 175],
    calibration: [300, 120],
    quantitative: [95, 270],
    social: [250, 300],
    rhetoric: [330, 400],
    strategy: [200, 415],
    memory: [60, 480],
    knowledge: [140, 575],
    synthesis: [270, 555],
    curiosity: [330, 610],
  },
};

/** Thin lines between kindred faculties. */
export const LINKS: [FacultyId, FacultyId][] = [
  ["observation", "inference"],
  ["inference", "calibration"],
  ["composure", "calibration"],
  ["inference", "quantitative"],
  ["social", "rhetoric"],
  ["rhetoric", "strategy"],
  ["social", "strategy"],
  ["memory", "knowledge"],
  ["knowledge", "synthesis"],
  ["synthesis", "curiosity"],
];

function radiusFor(evidenceCount: number): number {
  if (evidenceCount === 0) return 6;
  return Math.min(24, 8 + Math.sqrt(evidenceCount) * 2.2);
}

const FILL: Record<FacultyView["level"], string> = {
  untested: "fill-paper-2 stroke-ink-4",
  emerging: "fill-ink-4 stroke-ink-4",
  reliable: "fill-ink-3 stroke-ink-3",
  sharp: "fill-ink-2 stroke-ink-2",
  advanced: "fill-ink stroke-ink",
  exceptional: "fill-ink stroke-ink",
};

function useNarrow(): boolean {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return narrow;
}

export function Constellation({ views, selected, onSelect, className }: { views: FacultyView[]; selected: FacultyId | null; onSelect: (id: FacultyId) => void; className?: string }) {
  const narrow = useNarrow();
  const L = narrow ? NARROW : WIDE;
  const byId = new Map(views.map((v) => [v.id, v]));
  const font = narrow ? 12 : 11;

  return (
    <div className={cx("min-w-0", className)}>
      <svg viewBox={`0 0 ${L.w} ${L.h}`} width="100%" role="group" aria-label="Faculty constellation. Each faculty is a node; size is evidence, shade is level." className="block max-w-[760px] mx-auto overflow-visible select-none">
        {/* Links */}
        {LINKS.map(([a, b]) => {
          const [ax, ay] = L.pos[a];
          const [bx, by] = L.pos[b];
          const faint = (byId.get(a)?.evidenceCount ?? 0) === 0 || (byId.get(b)?.evidenceCount ?? 0) === 0;
          return <line key={a + b} x1={ax} y1={ay} x2={bx} y2={by} className={faint ? "stroke-line" : "stroke-line-2"} strokeWidth={1} />;
        })}
        {/* Nodes */}
        {FACULTIES.map((id) => {
          const v = byId.get(id);
          if (!v) return null;
          const [x, y] = L.pos[id];
          const r = radiusFor(v.evidenceCount);
          const untested = v.evidenceCount === 0;
          const isSel = selected === id;
          const label = `${v.label}. ${untested ? "Untested." : `${v.level}, ${v.trend === "up" ? "rising" : v.trend === "down" ? "falling" : "steady"}, ${v.evidenceCount} pieces of evidence.`}`;
          const glyphX = x + r * 0.72 + 3;
          const glyphY = y - r * 0.72 - 3;
          return (
            <g
              key={id}
              role="button"
              tabIndex={0}
              aria-pressed={isSel}
              aria-label={label}
              className={cx("cursor-pointer outline-none [&:focus-visible>circle:first-child]:stroke-wine", untested && !isSel && "opacity-60")}
              onClick={() => onSelect(id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(id);
                }
              }}
            >
              {/* hit area + focus ring */}
              <circle cx={x} cy={y} r={r + 9} className={cx("fill-transparent", isSel ? "stroke-wine" : "stroke-transparent")} strokeWidth={1} />
              {/* level rings */}
              {v.level === "advanced" || v.level === "exceptional" ? <circle cx={x} cy={y} r={r + 4} fill="none" className={v.level === "exceptional" ? "stroke-wine" : "stroke-brass"} strokeWidth={1.25} /> : null}
              {v.level === "sharp" ? <circle cx={x} cy={y} r={r + 4} fill="none" className="stroke-ink-3" strokeWidth={0.75} /> : null}
              {/* body */}
              <circle cx={x} cy={y} r={r} className={FILL[v.level]} strokeWidth={untested ? 1 : 0} strokeDasharray={untested ? "2 3" : undefined} />
              {/* trend glyph */}
              {!untested ? (
                <g transform={`translate(${glyphX} ${glyphY})`} aria-hidden="true">
                  <circle r={5.5} className="fill-paper" />
                  {v.trend === "up" ? <path d="M-3 2 L0 -2.5 L3 2Z" className="fill-forest" /> : v.trend === "down" ? <path d="M-3 -2 L0 2.5 L3 -2Z" className="fill-wine" /> : <line x1={-3} x2={3} y1={0} y2={0} className="stroke-ink-3" strokeWidth={1.25} />}
                </g>
              ) : null}
              {/* label */}
              <text x={x} y={y + r + 15} textAnchor="middle" fontSize={font} className={cx(untested ? "fill-ink-4" : isSel ? "fill-ink" : "fill-ink-2")} style={{ letterSpacing: "0.01em" }}>
                {v.label === "Quantitative reasoning" ? "Quantitative" : v.label === "Social intelligence" ? "Social" : v.label}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-3 text-[11px] text-ink-3 text-center md:text-left">
        Size is evidence · shade is level · the small glyph is trend · faint means untested.
      </p>
    </div>
  );
}
