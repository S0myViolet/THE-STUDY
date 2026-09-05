"use client";

import React from "react";
import { SEPARATION_LABEL, debriefFor, type ReportAnalysis } from "@/lib/fieldwork/score";
import { cx } from "@/lib/util/format";

/**
 * The read of a filed report: two observations, then the three measures they rest on.
 * Deterministic, so the same report always reads the same way.
 */
export function DebriefBlock({ analysis, compact, className }: { analysis: ReportAnalysis; compact?: boolean; className?: string }) {
  const [first, second] = debriefFor(analysis);
  const s = analysis.separation;
  return (
    <section className={cx("border-t border-ink pt-5", className)} aria-label="Debrief">
      <div className="eyebrow eyebrow-wine mb-3">Debrief</div>
      <p className={cx("serif text-ink leading-relaxed", compact ? "text-[18px]" : "text-[20px] md:text-[22px]")}>{first}</p>
      <p className={cx("serif text-ink-2 leading-relaxed mt-3", compact ? "text-[17px]" : "text-[18px] md:text-[20px]")}>{second}</p>
      <dl className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5 border-t border-line pt-4">
        <div className="min-w-0">
          <dt className="eyebrow">Answered in full</dt>
          <dd className="numeral text-[24px] text-ink mt-1 leading-none">
            {analysis.full}
            <span className="text-ink-4 text-[16px]"> / {analysis.promptCount}</span>
          </dd>
          <dd className="text-[12px] text-ink-3 mt-1.5">prompts with 25 words or more</dd>
        </div>
        <div className="min-w-0">
          <dt className="eyebrow">Concrete markers</dt>
          <dd className="numeral text-[24px] text-ink mt-1 leading-none">{analysis.markerCount}</dd>
          <dd className="text-[12px] text-ink-3 mt-1.5">{analysis.sampleMarkers.length ? analysis.sampleMarkers.slice(0, 3).join(" · ") : "numbers, times, colours, quoted text"}</dd>
        </div>
        <div className="min-w-0">
          <dt className="eyebrow">Observation vs interpretation</dt>
          <dd className={cx("serif text-[20px] mt-1 leading-none", s.dominated ? "text-wine" : s.verdict === "kept apart" ? "text-forest" : "text-ink")}>{s.dominated ? "Blurred" : SEPARATION_LABEL[s.verdict]}</dd>
          <dd className="text-[12px] text-ink-3 mt-1.5">
            {s.observational} observational · {s.interpretive} interpretive
          </dd>
        </div>
      </dl>
    </section>
  );
}
