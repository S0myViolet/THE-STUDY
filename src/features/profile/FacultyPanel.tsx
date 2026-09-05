"use client";

import React from "react";
import Link from "next/link";
import { LevelMark, Trend } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { FACULTY_META, LEVEL_LABEL, subskillLabel } from "@/lib/domain/faculties";
import { subskillRows, type FacultyView } from "@/lib/profile/derive";
import { Sparkline } from "./charts";
import { plural, shortDate } from "@/lib/util/format";

/** The detail panel beside the constellation. Words, not scores. */
export function FacultyPanel({ view }: { view: FacultyView }) {
  const meta = FACULTY_META[view.id];
  const rows = subskillRows(view.id, view.estimates);
  const untested = view.evidenceCount === 0;
  return (
    <aside className="border-t border-ink pt-4 anim-fade" key={view.id} aria-live="polite" aria-label={`${view.label} detail`}>
      <div className="eyebrow">{untested ? "Untested faculty" : "Faculty"}</div>
      <h2 className="display text-[28px] mt-1 text-ink">{view.label}</h2>
      <p className="serif italic text-[16px] text-ink-2 mt-1">{meta.question}</p>

      <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
        <div>
          <dt className="eyebrow">Level</dt>
          <dd className="mt-1">
            <LevelMark level={view.level} />
          </dd>
        </div>
        <div>
          <dt className="eyebrow">Trend</dt>
          <dd className="mt-1 flex items-center gap-1.5 text-ink-2">
            <Trend trend={view.trend} />
            <span>{view.trend === "up" ? "Rising" : view.trend === "down" ? "Falling" : "Steady"}</span>
          </dd>
        </div>
        <div>
          <dt className="eyebrow">Evidence</dt>
          <dd className="mt-1 numeral text-ink">{view.evidenceCount}</dd>
        </div>
        <div>
          <dt className="eyebrow">Estimate confidence</dt>
          <dd className="mt-1 text-ink">{view.confidenceLabel}</dd>
        </div>
      </dl>

      {untested ? (
        <p className="mt-5 text-[14px] text-ink-3">{meta.description} The Study has not seen this faculty at work yet.</p>
      ) : (
        <>
          <div className="eyebrow mt-7 mb-2">Subskills</div>
          <ul className="divide-y divide-line border-t border-line">
            {rows.map(({ subskill, estimate }) => (
              <li key={subskill} className="flex items-center gap-3 py-2">
                <span className="flex-1 min-w-0 text-[13px] text-ink truncate">{subskillLabel(subskill)}</span>
                <Sparkline points={estimate?.history ?? []} faint={!estimate || estimate.evidenceCount === 0} />
                <span className="w-[86px] text-right">{estimate ? <LevelMark level={estimate.level} /> : <span className="level" data-level="untested">{LEVEL_LABEL.untested}</span>}</span>
              </li>
            ))}
          </ul>
          {view.lastEvidenceAt ? <p className="mt-3 text-[12px] text-ink-3">Last evidence {shortDate(view.lastEvidenceAt)} · {plural(view.estimates.filter((e) => e.evidenceCount > 0).length, "subskill")} seen</p> : null}
        </>
      )}

      <Link href={`/profile/${view.id}`} className="btn btn-secondary mt-6">
        Open {view.label.toLowerCase()} <I.ArrowRight size={14} />
      </Link>
    </aside>
  );
}
