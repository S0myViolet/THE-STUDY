"use client";

import React from "react";
import type { ReasoningPathPoint } from "@/lib/domain/types";
import { cx } from "@/lib/util/format";

/**
 * The reasoning path: a vertical timeline of evidence, hypotheses and confidence.
 * Animates chronologically. Used by case debriefs and After Action.
 */
export function ReasoningPath({ points, className }: { points: ReasoningPathPoint[]; className?: string }) {
  if (!points.length) return null;
  return (
    <ol className={cx("relative pl-6", className)} aria-label="Reasoning path">
      <span className="absolute left-[7px] top-2 bottom-2 w-px bg-line-2" aria-hidden />
      {points.map((p, i) => (
        <li key={i} className="relative py-2 anim-place" style={{ animationDelay: `${i * 90}ms` }}>
          <span
            className={cx(
              "absolute -left-6 top-[13px] w-[15px] h-[15px] rounded-full border bg-paper-2 flex items-center justify-center",
              p.kind === "evidence" && "border-ink",
              p.kind === "hypothesis" && "border-brass",
              p.kind === "confidence" && "border-forest",
              p.kind === "question" && "border-line-2",
              p.kind === "decision" && "border-wine",
            )}
            aria-hidden
          >
            <span
              className={cx(
                "w-[5px] h-[5px] rounded-full",
                p.kind === "evidence" && "bg-ink",
                p.kind === "hypothesis" && "bg-brass",
                p.kind === "confidence" && "bg-forest",
                p.kind === "question" && "bg-line-2",
                p.kind === "decision" && "bg-wine",
              )}
            />
          </span>
          <div className="flex items-baseline gap-3">
            <span className="eyebrow w-24 shrink-0">{p.kind}</span>
            <span className="text-[14px] text-ink">{p.label}</span>
            {p.value !== undefined ? <span className="numeral text-[13px] text-ink-2 ml-auto">{Math.round(p.value * 100)}%</span> : null}
          </div>
          {p.note ? <p className="mt-0.5 ml-[6.75rem] text-[13px] text-ink-3">{p.note}</p> : null}
        </li>
      ))}
    </ol>
  );
}
