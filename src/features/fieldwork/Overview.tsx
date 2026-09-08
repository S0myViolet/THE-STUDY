"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useStudyQuery } from "@/lib/persistence/provider";
import type { FieldAssignment, FieldReport } from "@/lib/domain/types";
import { FIELD_ASSIGNMENTS } from "@/content/fieldwork";
import { KIND_META, KIND_ORDER, briefExcerpt, kindLabel, weeklyPick } from "@/lib/fieldwork/assignments";
import { useSessionItem } from "@/lib/services/session-context";
import { PageHeader } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { cx, plural, shortDate } from "@/lib/util/format";
import { SessionMark, answeredCount, assignmentById, daysSince, useSessionSuffix } from "./shared";

interface AssignmentState {
  active?: FieldReport;
  completed: FieldReport[];
  skipped: number;
}

export function Overview() {
  const { inSession } = useSessionItem();
  const suffix = useSessionSuffix();
  const q = useStudyQuery((db) => db.store("field_reports").list({ orderBy: "createdAt", desc: true }), ["field_reports"]);
  const all = useMemo(() => q.data ?? [], [q.data]);

  const byAssignment = useMemo(() => {
    const m = new Map<string, AssignmentState>();
    for (const r of all) {
      const s = m.get(r.assignmentId) ?? { completed: [], skipped: 0 };
      if (r.status === "assigned" && !s.active) s.active = r;
      else if (r.status === "completed") s.completed.push(r);
      else if (r.status === "skipped") s.skipped++;
      m.set(r.assignmentId, s);
    }
    return m;
  }, [all]);

  const inProgress = all.filter((r) => r.status === "assigned").sort((a, b) => a.assignedAt.localeCompare(b.assignedAt));
  const completed = all.filter((r) => r.status === "completed").sort((a, b) => (b.completedAt ?? b.updatedAt).localeCompare(a.completedAt ?? a.updatedAt));
  const completedIds = useMemo(() => new Set(completed.map((r) => r.assignmentId)), [completed]);
  const pick = useMemo(() => weeklyPick(FIELD_ASSIGNMENTS, completedIds), [completedIds]);
  const groups = KIND_ORDER.map((kind) => ({ kind, items: FIELD_ASSIGNMENTS.filter((a) => a.kind === kind) })).filter((g) => g.items.length);
  const totalMinutes = FIELD_ASSIGNMENTS.reduce((s, a) => s + a.estimatedMinutes, 0);

  return (
    <div className="page">
      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-3">
            Fieldwork
            {inSession ? <SessionMark /> : null}
          </span>
        }
        title="Take it outside"
        lede={
          <>
            Safe practice in the real world: observation, recall, conversation, memory, curiosity, the city, the news, a decision. Nothing here intrudes on
            anyone. No surveillance, no photographs of people, no inferring private characteristics. You look at places, objects, text and your own thinking,
            then report back.
          </>
        }
        aside={
          completed.length ? (
            <span className="hidden md:block">
              <Link href={`/v1/fieldwork/reports${suffix}`} className="btn btn-secondary">
                Reports
              </Link>
            </span>
          ) : null
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-x-12 gap-y-10">
        {/* Aside first on mobile: the week's pick is the one thing to do. */}
        <aside className="order-first lg:order-none lg:col-start-2 space-y-8">
          <WeeklyPick pick={pick} state={pick ? byAssignment.get(pick.id) : undefined} suffix={suffix} allFiled={!pick && FIELD_ASSIGNMENTS.length > 0} />
          <div className="border-t border-line pt-3 text-[12px] text-ink-3 leading-relaxed">
            <div className="eyebrow mb-2">Ground rules</div>
            <ul className="space-y-1.5">
              <li>Places, objects and text; never a description of a person.</li>
              <li>No photographs of anyone, no recording, no following.</li>
              <li>If someone notices you looking, look away. The exercise is not worth their discomfort.</li>
            </ul>
          </div>
          <div className="hidden lg:block border-t border-line pt-3 text-[12px] text-ink-4">
            {plural(FIELD_ASSIGNMENTS.length, "assignment")} · about {Math.round(totalMinutes / 60)} hours in total · {completed.length ? `${plural(completed.length, "report")} filed` : "nothing filed yet"}
          </div>
        </aside>

        <div className="lg:col-start-1 lg:row-start-1 space-y-12">
          {inProgress.length ? (
            <section aria-label="In progress">
              <div className="eyebrow eyebrow-wine mb-1">In progress · {inProgress.length}</div>
              <ul className="divide-y divide-line border-t border-line">
                {inProgress.map((r) => {
                  const a = assignmentById(r.assignmentId);
                  if (!a) return null;
                  const n = answeredCount(a, r);
                  return (
                    <li key={r.id}>
                      <Link href={`/v1/fieldwork/${a.id}/report${suffix}`} className="group flex items-baseline gap-4 py-3.5 -mx-3 px-3 hover:bg-paper-3 rounded-sm">
                        <span className="flex-1 min-w-0">
                          <span className="serif text-[18px] text-ink block">{a.title}</span>
                          <span className="text-[12px] text-ink-3 block mt-0.5">
                            Assigned {daysSince(r.assignedAt)} · {n ? `${n} of ${a.reportPrompts.length} prompts answered` : "report not started"}
                          </span>
                        </span>
                        <span className="text-[12px] text-ink-3 shrink-0 hidden sm:inline">{n ? "Continue the report" : "Write the report"}</span>
                        <I.ArrowRight size={14} className="text-ink-4 group-hover:text-ink shrink-0" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          <section aria-label="Assignments">
            <div className="eyebrow mb-1">Assignments · {FIELD_ASSIGNMENTS.length}</div>
            <div className="border-t border-line">
              {groups.map((g) => (
                <div key={g.kind} className="pt-4 pb-2">
                  <div className="flex items-baseline justify-between gap-4 px-0">
                    <h2 className="serif text-[15px] text-ink-2 italic">{KIND_META[g.kind].label}</h2>
                    <span className="text-[12px] text-ink-4 hidden sm:inline">{KIND_META[g.kind].note}</span>
                  </div>
                  <ul className="mt-1">
                    {g.items.map((a) => (
                      <AssignmentRow key={a.id} a={a} state={byAssignment.get(a.id)} suffix={suffix} featured={pick?.id === a.id} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section aria-label="Reports">
            <div className="flex items-baseline justify-between gap-4 mb-1">
              <div className="eyebrow">Reports · {completed.length}</div>
              {completed.length > 5 ? (
                <Link href={`/v1/fieldwork/reports${suffix}`} className="text-[12px] text-ink-3 hover:text-ink">
                  All reports
                </Link>
              ) : null}
            </div>
            <ul className="divide-y divide-line border-t border-line">
              {completed.slice(0, 5).map((r) => {
                const a = assignmentById(r.assignmentId);
                if (!a) return null;
                return (
                  <li key={r.id}>
                    <Link href={`/v1/fieldwork/reports/${r.id}${suffix}`} className="group flex items-baseline gap-4 py-3.5 -mx-3 px-3 hover:bg-paper-3 rounded-sm">
                      <span className="numeral text-[12px] text-ink-3 w-14 shrink-0">{shortDate(r.completedAt ?? r.updatedAt)}</span>
                      <span className="flex-1 min-w-0">
                        <span className="serif text-[17px] text-ink block truncate">{a.title}</span>
                        <span className="text-[12px] text-ink-3">{kindLabel(a.kind)}</span>
                      </span>
                      <I.ArrowRight size={14} className="text-ink-4 group-hover:text-ink shrink-0" />
                    </Link>
                  </li>
                );
              })}
              {!completed.length && !q.loading ? <li className="py-4 text-[13px] text-ink-3">Nothing filed yet. A report is written after the assignment, not during it.</li> : null}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function AssignmentRow({ a, state, suffix, featured }: { a: FieldAssignment; state?: AssignmentState; suffix: string; featured: boolean }) {
  const last = state?.completed[0];
  let status: React.ReactNode;
  if (state?.active) status = <span className="text-wine">In progress · assigned {daysSince(state.active.assignedAt)}</span>;
  else if (last) status = `Filed ${state!.completed.length === 1 ? "once" : state!.completed.length === 2 ? "twice" : `${state!.completed.length} times`} · last ${shortDate(last.completedAt ?? last.updatedAt)}`;
  else if (state?.skipped) status = "Set aside";
  else status = briefExcerpt(a.brief);
  return (
    <li>
      <Link href={`/v1/fieldwork/${a.id}${suffix}`} className="group flex items-baseline gap-4 py-3 -mx-3 px-3 hover:bg-paper-3 rounded-sm">
        <span className="flex-1 min-w-0">
          <span className="serif text-[17px] text-ink block">
            {a.title}
            {featured ? <span className="eyebrow eyebrow-brass ml-3 align-middle whitespace-nowrap">this week</span> : null}
          </span>
          <span className={cx("text-[12px] text-ink-3 block mt-0.5 truncate")}>{status}</span>
        </span>
        <span className="numeral text-[12px] text-ink-3 shrink-0 w-14 text-right">{a.estimatedMinutes} min</span>
        <I.ArrowRight size={14} className="text-ink-4 group-hover:text-ink shrink-0" />
      </Link>
    </li>
  );
}

function WeeklyPick({ pick, state, suffix, allFiled }: { pick?: FieldAssignment; state?: AssignmentState; suffix: string; allFiled: boolean }) {
  if (!pick) {
    return (
      <section className="border-t border-ink pt-4" aria-label="This week's assignment">
        <div className="eyebrow eyebrow-brass">This week&apos;s assignment</div>
        <p className="serif text-[18px] text-ink mt-2 leading-snug">{allFiled ? "Every assignment has been filed at least once." : "Nothing to pick from."}</p>
        <p className="text-[13px] text-ink-3 mt-2">Repeat any of them; familiar places are where recall is most confidently wrong.</p>
      </section>
    );
  }
  const href = state?.active ? `/v1/fieldwork/${pick.id}/report${suffix}` : `/v1/fieldwork/${pick.id}${suffix}`;
  return (
    <section className="border-t border-ink pt-4" aria-label="This week's assignment">
      <div className="eyebrow eyebrow-brass">This week&apos;s assignment</div>
      <Link href={href} className="block mt-2 group">
        <h2 className="serif text-[26px] text-ink leading-tight group-hover:text-ink-2">{pick.title}</h2>
      </Link>
      <p className="text-[12px] text-ink-3 mt-1.5">
        {kindLabel(pick.kind)} · about {pick.estimatedMinutes} minutes
      </p>
      <p className="serif text-[16px] text-ink-2 mt-3 leading-relaxed">{briefExcerpt(pick.brief, 2)}</p>
      <Link href={href} className="btn mt-5">
        {state?.active ? "Continue the report" : "Read the brief"} <I.ArrowRight size={14} />
      </Link>
    </section>
  );
}
