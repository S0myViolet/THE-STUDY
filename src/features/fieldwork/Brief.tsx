"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStudy, useStudyQuery } from "@/lib/persistence/provider";
import { stamp } from "@/lib/persistence/store";
import type { FieldReport } from "@/lib/domain/types";
import { subskillLabel } from "@/lib/domain/faculties";
import { useSessionItem } from "@/lib/services/session-context";
import { Button, Note } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { plural, shortDate } from "@/lib/util/format";
import { KindLine, NotFound, TopBar, answeredCount, assignmentById, daysSince, pad, useSessionSuffix } from "./shared";

export function Brief({ id }: { id: string }) {
  const a = assignmentById(id);
  const { db } = useStudy();
  const { inSession, finish } = useSessionItem();
  const suffix = useSessionSuffix();
  const q = useStudyQuery((db) => db.store("field_reports").list({ where: { assignmentId: id }, orderBy: "createdAt", desc: true }), ["field_reports"], [id]);
  const [busy, setBusy] = useState(false);
  const [justTaken, setJustTaken] = useState(false);
  const [setAsideId, setSetAsideId] = useState<string | null>(null);

  if (!a) return <NotFound />;
  const reports = q.data ?? [];
  const active = reports.find((r) => r.status === "assigned");
  const completed = reports.filter((r) => r.status === "completed");
  const last = completed[0];

  async function take() {
    if (!a || busy) return;
    setBusy(true);
    const r = stamp<FieldReport>(db.userId, "fr", { assignmentId: a.id, status: "assigned", assignedAt: new Date().toISOString(), responses: {} });
    await db.store("field_reports").put(r);
    setSetAsideId(null);
    setJustTaken(true);
    setBusy(false);
  }

  async function setAside() {
    if (!active || busy) return;
    setBusy(true);
    await db.store("field_reports").update(active.id, { status: "skipped" });
    setSetAsideId(active.id);
    setJustTaken(false);
    setBusy(false);
  }

  async function undo() {
    if (!setAsideId || busy) return;
    setBusy(true);
    await db.store("field_reports").update(setAsideId, { status: "assigned" });
    setSetAsideId(null);
    setBusy(false);
  }

  const answered = active ? answeredCount(a, active) : 0;

  return (
    <div className="page">
      <TopBar back={`/fieldwork${suffix}`} backLabel="Fieldwork" inSession={inSession} />
      <article className="max-w-[680px]">
        <KindLine a={a} />
        <h1 className="display text-[32px] md:text-[40px] text-ink mt-2">{a.title}</h1>
        <p className="serif text-[19px] md:text-[20px] text-ink leading-relaxed mt-5">{a.brief}</p>

        <section className="mt-9" aria-label="Steps">
          <div className="eyebrow mb-3">Steps</div>
          <ol className="space-y-3">
            {a.steps.map((s, i) => (
              <li key={i} className="flex gap-4">
                <span className="mono text-[11px] text-ink-3 pt-1.5 w-5 shrink-0">{pad(i + 1)}</span>
                <span className="text-[15px] text-ink-2 leading-relaxed">{s}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-9" aria-label="Before you begin">
          <div className="eyebrow mb-3">Before you begin</div>
          <ul className="space-y-2.5">
            {a.ethics.map((e, i) => (
              <li key={i} className="text-[15px] text-ink-2 leading-relaxed pl-4 border-l border-line-2">
                {e}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-9 border-t border-line pt-4 grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-6" aria-label="Details">
          <div>
            <div className="eyebrow">Estimated time</div>
            <div className="numeral text-[24px] text-ink mt-1 leading-none">
              {a.estimatedMinutes} <span className="text-[13px] text-ink-3 font-sans">min</span>
            </div>
          </div>
          <div className="min-w-0">
            <div className="eyebrow">Trains</div>
            <p className="text-[14px] text-ink-2 mt-1.5 leading-relaxed">{a.subskills.map((s) => subskillLabel(s)).join(", ")}</p>
          </div>
        </section>

        <section className="mt-10 border-t border-ink pt-6" aria-label="Take the assignment">
          {setAsideId && !active ? (
            <Note tone="brass">
              Set aside. It stays in your reports as skipped.{" "}
              <button type="button" className="underline underline-offset-4 text-ink hover:text-wine" onClick={undo} disabled={busy}>
                Undo
              </button>
            </Note>
          ) : active ? (
            <div className="anim-unfold">
              <div className="eyebrow eyebrow-wine mb-3">{justTaken ? "Taken just now" : `In progress · assigned ${daysSince(active.assignedAt)}`}</div>
              <p className="text-[14px] text-ink-2 mb-5 max-w-[52ch]">
                Do the assignment first. The report has {plural(a.reportPrompts.length, "prompt")} and one reflection, and it saves as you write.
              </p>
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
                <Link href={`/v1/fieldwork/${a.id}/report${suffix}`} className="btn btn-lg">
                  {answered ? "Continue the report" : "Write the report"} <I.ArrowRight size={14} />
                </Link>
                {inSession ? (
                  <Button variant="secondary" onClick={() => finish()} disabled={busy}>
                    Continue the session
                  </Button>
                ) : null}
                <Button variant="ghost" onClick={setAside} disabled={busy}>
                  Set aside
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[14px] text-ink-2 mb-5 max-w-[52ch]">
                The report has {plural(a.reportPrompts.length, "prompt")} and one reflection. Write it afterwards, from memory where the assignment asks for it.
              </p>
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-5">
                <Button size="lg" onClick={take} disabled={busy}>
                  {last ? "Take it again" : "Take this assignment"}
                </Button>
                {last ? (
                  <Link href={`/v1/fieldwork/reports/${last.id}${suffix}`} className="text-[12px] text-ink-3 hover:text-ink">
                    Filed {completed.length === 1 ? "once" : completed.length === 2 ? "twice" : `${completed.length} times`} · last {shortDate(last.completedAt ?? last.updatedAt)}
                  </Link>
                ) : null}
              </div>
            </div>
          )}
        </section>
      </article>
    </div>
  );
}
