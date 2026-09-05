"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useStudyQuery } from "@/lib/persistence/provider";
import { Empty, LevelMark, PageHeader, Spinner, Trend } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { DIFFICULTY_LABEL, FACULTY_META, LEVEL_LABEL, subskillLabel, type FacultyId } from "@/lib/domain/faculties";
import { facultyViews, subskillRows } from "@/lib/profile/derive";
import { TRAINING_ROOMS } from "@/lib/profile/rooms";
import { Sparkline } from "./charts";
import { cx, shortDate } from "@/lib/util/format";

/** /profile/<faculty>: subskills, sparklines, the last twenty pieces of evidence, where to train it. */
export function FacultyDetail({ faculty }: { faculty: FacultyId }) {
  const meta = FACULTY_META[faculty];
  const estimates = useStudyQuery((db) => db.store("skill_estimates").list({ where: { faculty } }), ["skill_estimates"], [faculty]);
  const evidence = useStudyQuery((db) => db.store("skill_evidence").list({ where: { faculty }, orderBy: "createdAt", desc: true, limit: 20 }), ["skill_evidence"], [faculty]);
  const view = useMemo(() => facultyViews(estimates.data ?? []).find((v) => v.id === faculty)!, [estimates.data, faculty]);
  const rows = subskillRows(faculty, estimates.data ?? []);
  const loading = estimates.loading || evidence.loading;
  const untested = view.evidenceCount === 0;

  return (
    <div className="page">
      <Link href="/profile" className="inline-flex items-center gap-2 text-[12px] text-ink-3 hover:text-ink mb-6">
        <I.ArrowLeft size={14} /> Capability map
      </Link>
      <PageHeader
        eyebrow="Faculty"
        title={meta.label}
        lede={<span className="serif italic text-[17px]">{meta.question}</span>}
        aside={
          !loading && !untested ? (
            <dl className="grid grid-cols-3 gap-6 text-[13px] text-right">
              <div>
                <dt className="eyebrow">Level</dt>
                <dd className="mt-1">
                  <LevelMark level={view.level} />
                </dd>
              </div>
              <div>
                <dt className="eyebrow">Trend</dt>
                <dd className="mt-1 inline-flex items-center gap-1.5 text-ink-2">
                  <Trend trend={view.trend} />
                  {view.trend === "up" ? "Rising" : view.trend === "down" ? "Falling" : "Steady"}
                </dd>
              </div>
              <div>
                <dt className="eyebrow">Evidence</dt>
                <dd className="mt-1 numeral text-ink">
                  {view.evidenceCount} <span className="text-ink-3 text-[11px]">· {view.confidenceLabel.toLowerCase()} confidence</span>
                </dd>
              </div>
            </dl>
          ) : undefined
        }
      />
      <p className="text-[14px] text-ink-2 max-w-[62ch] -mt-3 mb-10">{meta.description}</p>

      {loading ? (
        <Spinner label="Reading the evidence" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 items-start">
          <div className="min-w-0">
            <section aria-labelledby="subskills">
              <div id="subskills" className="eyebrow mb-2">
                Subskills
              </div>
              <ul className="border-t border-line-2 divide-y divide-line">
                {rows.map(({ subskill, estimate }) => {
                  const n = estimate?.evidenceCount ?? 0;
                  return (
                    <li key={subskill} className={cx("grid grid-cols-[1fr_auto_auto] md:grid-cols-[1fr_120px_100px_90px] gap-4 items-center py-3", n === 0 && "text-ink-4")}>
                      <span className="min-w-0">
                        <span className={cx("block text-[15px]", n ? "text-ink" : "text-ink-4")}>{subskillLabel(subskill)}</span>
                        <span className="block text-[12px] text-ink-3 mt-0.5">{n ? `${n} pieces · ${estimate?.trend === "up" ? "rising" : estimate?.trend === "down" ? "falling" : "steady"}` : "No evidence yet"}</span>
                      </span>
                      <Sparkline points={estimate?.history ?? []} faint={n === 0} width={100} height={24} className="hidden md:block" />
                      <span className="hidden md:inline text-[12px] text-ink-3 text-right numeral">{estimate?.lastEvidenceAt ? shortDate(estimate.lastEvidenceAt) : "—"}</span>
                      <span className="text-right">{estimate ? <LevelMark level={estimate.level} /> : <span className="level" data-level="untested">{LEVEL_LABEL.untested}</span>}</span>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="mt-12" aria-labelledby="latest">
              <div className="flex items-baseline justify-between mb-2">
                <div id="latest" className="eyebrow">
                  Latest evidence
                </div>
                <span className="text-[11px] text-ink-3 numeral">last {Math.min(20, evidence.data?.length ?? 0)}</span>
              </div>
              {evidence.data?.length ? (
                <ol className="border-t border-line-2 divide-y divide-line">
                  {evidence.data.map((e) => (
                    <li key={e.id} className="grid grid-cols-[1fr_auto] md:grid-cols-[110px_1fr_140px_60px] gap-4 items-baseline py-2.5 text-[13px]">
                      <span className="numeral text-ink-3 text-[12px] order-3 md:order-none">{shortDate(e.createdAt)}</span>
                      <span className="min-w-0 truncate text-ink">
                        {e.source.label ?? e.source.kind}
                        <span className="text-ink-3"> · {subskillLabel(e.subskill)}</span>
                      </span>
                      <span className="hidden md:block text-[12px] text-ink-3 truncate">
                        {DIFFICULTY_LABEL[e.difficulty]} · {e.format}
                        {e.transfer ? " · transfer" : ""}
                      </span>
                      <span className="numeral text-right text-ink">{Math.round(e.score * 100)}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <Empty title={`Nothing has tested ${meta.label.toLowerCase()} yet.`} body="Evidence appears here the moment an exercise records it." action={<Link href={TRAINING_ROOMS[faculty][0].href} className="btn">Train it now <I.ArrowRight size={14} /></Link>} />
              )}
              {evidence.data?.length ? <p className="mt-2 text-[11px] text-ink-4">Score is quality of the response, 0–100, not merely right or wrong.</p> : null}
            </section>
          </div>

          <aside className="border-t border-ink pt-4">
            <div className="eyebrow">Where it is trained</div>
            <ul className="mt-3 divide-y divide-line">
              {TRAINING_ROOMS[faculty].map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="group flex items-baseline gap-3 py-3">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] text-ink group-hover:text-ink-2">{r.label}</span>
                      <span className="block text-[12px] text-ink-3 mt-0.5">{r.note}</span>
                    </span>
                    <I.ArrowRight size={14} className="text-ink-4 group-hover:text-ink shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[12px] text-ink-4">
              Estimates move by shrinkage: each new piece pulls the estimate toward what it showed, less as evidence accumulates. <Link href="/profile/methodology" className="underline underline-offset-4 hover:text-ink">Methodology</Link>
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
