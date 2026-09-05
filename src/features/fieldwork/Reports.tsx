"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStudy, useStudyQuery } from "@/lib/persistence/provider";
import type { FieldReport } from "@/lib/domain/types";
import { kindLabel } from "@/lib/fieldwork/assignments";
import { analyseReport, responseFor } from "@/lib/fieldwork/score";
import { useSessionItem } from "@/lib/services/session-context";
import { Button, Empty, PageHeader } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { longDate, plural, shortDate } from "@/lib/util/format";
import { DebriefBlock } from "./Debrief";
import { NotFound, TopBar, answeredCount, assignmentById, daysSince, pad, useSessionSuffix } from "./shared";

const REFLECTION_PROMPT = "What did you notice that you would not have noticed a month ago?";

export function ReportsList() {
  const suffix = useSessionSuffix();
  const q = useStudyQuery((db) => db.store("field_reports").list({ orderBy: "createdAt", desc: true }), ["field_reports"]);
  const all = q.data ?? [];
  const completed = all.filter((r) => r.status === "completed").sort((a, b) => (b.completedAt ?? b.updatedAt).localeCompare(a.completedAt ?? a.updatedAt));
  const inProgress = all.filter((r) => r.status === "assigned");
  const skipped = all.filter((r) => r.status === "skipped");

  return (
    <div className="page">
      <TopBar back={`/fieldwork${suffix}`} backLabel="Fieldwork" inSession={false} />
      <PageHeader eyebrow="Fieldwork" title="Reports" lede="What came back from the world, in your own words. Each report is read the same way every time: how much of it was answered, how much of it could be checked, and whether seeing and thinking were kept apart." />
      {!all.length && !q.loading ? (
        <Empty
          title="Nothing filed yet."
          body="A report is written after the assignment. Take one from the list and go."
          action={
            <Link href={`/fieldwork${suffix}`} className="btn">
              Assignments
            </Link>
          }
        />
      ) : (
        <div className="max-w-[760px] space-y-12">
          <section aria-label="Filed">
            <div className="eyebrow mb-1">Filed · {completed.length}</div>
            <ul className="divide-y divide-line border-t border-line">
              {completed.map((r) => (
                <Row key={r.id} r={r} suffix={suffix} />
              ))}
              {!completed.length ? <li className="py-4 text-[13px] text-ink-3">No report has been filed yet.</li> : null}
            </ul>
          </section>
          {inProgress.length ? (
            <section aria-label="In progress">
              <div className="eyebrow eyebrow-wine mb-1">In progress · {inProgress.length}</div>
              <ul className="divide-y divide-line border-t border-line">
                {inProgress.map((r) => (
                  <Row key={r.id} r={r} suffix={suffix} />
                ))}
              </ul>
            </section>
          ) : null}
          {skipped.length ? (
            <section aria-label="Set aside">
              <div className="eyebrow mb-1">Set aside · {skipped.length}</div>
              <ul className="divide-y divide-line border-t border-line">
                {skipped.map((r) => (
                  <Row key={r.id} r={r} suffix={suffix} />
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}

function Row({ r, suffix }: { r: FieldReport; suffix: string }) {
  const a = assignmentById(r.assignmentId);
  if (!a) return null;
  let sub: React.ReactNode;
  if (r.status === "completed") {
    const an = analyseReport(a, r);
    sub = `${kindLabel(a.kind)} · ${an.full} of ${an.promptCount} in full · ${plural(an.markerCount, "concrete marker")}`;
  } else if (r.status === "assigned") {
    const n = answeredCount(a, r);
    sub = `${kindLabel(a.kind)} · assigned ${daysSince(r.assignedAt)} · ${n ? `${n} of ${a.reportPrompts.length} answered` : "not started"}`;
  } else {
    sub = `${kindLabel(a.kind)} · set aside ${shortDate(r.updatedAt)}`;
  }
  return (
    <li>
      <Link href={`/fieldwork/reports/${r.id}${suffix}`} className="group flex items-baseline gap-4 py-3.5 -mx-3 px-3 hover:bg-paper-3 rounded-sm">
        <span className="numeral text-[12px] text-ink-3 w-14 shrink-0">{shortDate(r.status === "completed" ? (r.completedAt ?? r.updatedAt) : r.assignedAt)}</span>
        <span className="flex-1 min-w-0">
          <span className="serif text-[17px] text-ink block">{a.title}</span>
          <span className="text-[12px] text-ink-3 block mt-0.5">{sub}</span>
        </span>
        <I.ArrowRight size={14} className="text-ink-4 group-hover:text-ink shrink-0" />
      </Link>
    </li>
  );
}

export function ReportDetail({ id }: { id: string }) {
  const { db } = useStudy();
  const { inSession } = useSessionItem();
  const suffix = useSessionSuffix();
  const q = useStudyQuery((db) => db.store("field_reports").get(id), ["field_reports"], [id]);
  const [busy, setBusy] = useState(false);
  const r = q.data;
  const a = assignmentById(r?.assignmentId);
  if (q.loading) return <div className="page" />;
  if (!r || !a) return <NotFound what="report" />;

  async function resume() {
    if (!r || busy) return;
    setBusy(true);
    await db.store("field_reports").update(r.id, { status: "assigned" });
    setBusy(false);
  }

  const analysis = r.status === "completed" ? analyseReport(a, r) : null;
  const when = r.status === "completed" ? `Filed ${longDate(r.completedAt ?? r.updatedAt)}` : r.status === "assigned" ? `In progress · assigned ${daysSince(r.assignedAt)}` : `Set aside ${longDate(r.updatedAt)}`;

  return (
    <div className="page">
      <TopBar back={`/fieldwork/reports${suffix}`} backLabel="Reports" inSession={inSession} />
      <article className="max-w-[680px]">
        <div className="eyebrow">
          {kindLabel(a.kind)} · {when}
        </div>
        <h1 className="display text-[32px] md:text-[40px] text-ink mt-2">
          <Link href={`/fieldwork/${a.id}${suffix}`} className="hover:text-ink-2">
            {a.title}
          </Link>
        </h1>

        {r.status !== "completed" ? (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {r.status === "assigned" ? (
              <Link href={`/fieldwork/${a.id}/report${suffix}`} className="btn">
                Continue the report <I.ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Button onClick={resume} disabled={busy}>
                  Resume the assignment
                </Button>
                <span className="text-[12px] text-ink-3">Puts it back in progress with whatever was written.</span>
              </>
            )}
          </div>
        ) : null}

        <div className="mt-9 space-y-8">
          {a.reportPrompts.map((p, i) => {
            const text = responseFor(r.responses, i).trim();
            return (
              <section key={i}>
                <h2 className="serif italic text-[16px] text-ink-3 leading-snug">
                  <span className="mono not-italic text-[11px] mr-3 align-middle">{pad(i + 1)}</span>
                  {p}
                </h2>
                {text ? <p className="serif text-[18px] md:text-[19px] text-ink leading-relaxed mt-2 whitespace-pre-line">{text}</p> : <p className="text-[13px] text-ink-4 mt-2">Not answered.</p>}
              </section>
            );
          })}
          <section className="border-t border-line pt-6">
            <div className="eyebrow mb-2">Reflection</div>
            <h2 className="serif italic text-[16px] text-ink-3 leading-snug">{REFLECTION_PROMPT}</h2>
            {r.reflection?.trim() ? <p className="serif text-[18px] md:text-[19px] text-ink leading-relaxed mt-2 whitespace-pre-line">{r.reflection}</p> : <p className="text-[13px] text-ink-4 mt-2">Not written.</p>}
          </section>
        </div>

        {analysis ? <DebriefBlock analysis={analysis} compact className="mt-10" /> : null}

        {r.status === "completed" ? (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href={`/fieldwork/${a.id}${suffix}`} className="btn btn-secondary">
              Take it again
            </Link>
            <Link href="/after-action" className="text-[12px] text-ink-3 hover:text-ink">
              The After Action for this report
            </Link>
          </div>
        ) : null}
      </article>
    </div>
  );
}
