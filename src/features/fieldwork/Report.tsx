"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useStudy, useStudyQuery } from "@/lib/persistence/provider";
import { stamp } from "@/lib/persistence/store";
import type { FieldAssignment, FieldReport } from "@/lib/domain/types";
import { subskillLabel, type Difficulty } from "@/lib/domain/faculties";
import { recordError, recordEvidence } from "@/lib/services/evidence";
import { writeAfterAction } from "@/lib/services/after-action";
import { detectRedThreads } from "@/lib/adaptation/red-thread";
import { useSessionItem } from "@/lib/services/session-context";
import { afterActionFor, analyseReport, errorsFor, evidenceScoreFor, responseFor, responseKey, type ReportAnalysis } from "@/lib/fieldwork/score";
import { Button, Empty, Spinner } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { cx, longDate } from "@/lib/util/format";
import { wordCount } from "@/lib/scoring/text";
import { DebriefBlock } from "./Debrief";
import { KindLine, NotFound, TopBar, assignmentById, daysSince, pad, useSessionSuffix } from "./shared";

const REFLECTION_PROMPT = "What did you notice that you would not have noticed a month ago?";

interface Filed {
  report: FieldReport;
  analysis: ReportAnalysis;
  done: boolean;
}

export function Report({ id }: { id: string }) {
  const a = assignmentById(id);
  const { db } = useStudy();
  const { inSession, sessionId, finish } = useSessionItem();
  const suffix = useSessionSuffix();
  const q = useStudyQuery((db) => db.store("field_reports").list({ where: { assignmentId: id }, orderBy: "createdAt", desc: true }), ["field_reports"], [id]);
  const [filed, setFiled] = useState<Filed | null>(null);
  const [busy, setBusy] = useState(false);

  if (!a) return <NotFound />;
  const reports = q.data ?? [];
  const active = reports.find((r) => r.status === "assigned");
  const latest = reports[0];

  async function file(report: FieldReport, responses: Record<string, string>, reflection: string) {
    if (!a) return;
    const analysis = analyseReport(a, { responses, reflection });
    const completedAt = new Date().toISOString();
    const snapshot: FieldReport = { ...report, status: "completed", completedAt, responses, reflection: reflection.trim() || undefined, updatedAt: completedAt };
    setFiled({ report: snapshot, analysis, done: false });
    const source = { kind: "fieldwork" as const, refId: report.id, label: a.title };
    const difficulty: Difficulty = a.estimatedMinutes >= 25 ? 4 : 3;
    try {
      await db.store("field_reports").update(report.id, { status: "completed", completedAt, responses, reflection: reflection.trim() || undefined });
      for (const s of a.subskills) {
        await recordEvidence(db, {
          subskill: s,
          score: evidenceScoreFor(s, analysis),
          difficulty,
          format: "free",
          transfer: true,
          source,
          sessionId: sessionId ?? undefined,
          note: `${analysis.full}/${analysis.promptCount} prompts in full · ${analysis.markerCount} concrete markers · ${analysis.separation.verdict}`,
        });
      }
      for (const err of errorsFor(analysis)) await recordError(db, { ...err, source, sessionId: sessionId ?? undefined });
      await writeAfterAction(db, { ...afterActionFor(a, analysis), source, sessionId: sessionId ?? undefined });
      await detectRedThreads(db).catch(() => {});
    } finally {
      setFiled((f) => (f ? { ...f, done: true } : f));
    }
  }

  async function takeNow() {
    if (!a || busy) return;
    setBusy(true);
    const r = stamp<FieldReport>(db.userId, "fr", { assignmentId: a.id, status: "assigned", assignedAt: new Date().toISOString(), responses: {} });
    await db.store("field_reports").put(r);
    setBusy(false);
  }

  async function resume(r: FieldReport) {
    if (busy) return;
    setBusy(true);
    await db.store("field_reports").update(r.id, { status: "assigned" });
    setBusy(false);
  }

  if (filed) {
    return (
      <div className="page">
        <TopBar back={`/fieldwork${suffix}`} backLabel="Fieldwork" inSession={inSession} />
        <div className="max-w-[680px] anim-place">
          <div className="eyebrow eyebrow-wine">Report filed</div>
          <h1 className="display text-[32px] md:text-[40px] text-ink mt-2">{a.title}</h1>
          <p className="text-[13px] text-ink-3 mt-2">{longDate(filed.report.completedAt!)}</p>
          <DebriefBlock analysis={filed.analysis} className="mt-8" />
          <div className="mt-6 border-t border-line pt-4 text-[13px] text-ink-3 leading-relaxed">
            {filed.done ? (
              <>
                Evidence recorded for {a.subskills.map((s) => subskillLabel(s)).join(", ")}, as transfer from the room to the world. An After Action was written.
              </>
            ) : (
              <Spinner label="Recording evidence" />
            )}
          </div>
          <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
            {inSession ? (
              <Button size="lg" onClick={() => finish()} disabled={!filed.done}>
                Continue the session <I.ArrowRight size={14} />
              </Button>
            ) : null}
            <Link href={`/fieldwork/reports/${filed.report.id}${suffix}`} className={cx("btn", inSession ? "btn-secondary" : "")} aria-disabled={!filed.done}>
              Read the report
            </Link>
            <Link href={`/fieldwork${suffix}`} className="btn btn-ghost">
              Fieldwork
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (q.loading) return <div className="page" />;

  if (!active) {
    const state = latest?.status === "completed" ? "filed" : latest?.status === "skipped" ? "set-aside" : "untaken";
    return (
      <div className="page">
        <TopBar back={`/fieldwork/${a.id}${suffix}`} backLabel={a.title} inSession={inSession} />
        <Empty
          title={state === "filed" ? "This assignment has been filed." : state === "set-aside" ? "This assignment was set aside." : "This assignment has not been taken yet."}
          body={
            state === "filed"
              ? "You can read the report, or take the assignment again and file a second one."
              : state === "set-aside"
                ? "Resume it with whatever was written, or take it fresh."
                : "Read the brief first; the report is written after the assignment, not during it."
          }
          action={
            <div className="flex flex-wrap justify-center gap-3">
              {state === "filed" && latest ? (
                <Link href={`/fieldwork/reports/${latest.id}${suffix}`} className="btn">
                  Read the report
                </Link>
              ) : null}
              {state === "set-aside" && latest ? (
                <Button onClick={() => resume(latest)} disabled={busy}>
                  Resume the assignment
                </Button>
              ) : null}
              <Button variant={state === "untaken" ? "primary" : "secondary"} onClick={takeNow} disabled={busy}>
                {state === "filed" ? "Take it again" : state === "set-aside" ? "Take it fresh" : "Take this assignment"}
              </Button>
              <Link href={`/fieldwork/${a.id}${suffix}`} className="btn btn-ghost">
                The brief
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="page">
      <TopBar back={`/fieldwork/${a.id}${suffix}`} backLabel="The brief" inSession={inSession} />
      <ReportForm key={active.id} assignment={a} report={active} onFile={file} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The form                                                            */
/* ------------------------------------------------------------------ */

function ReportForm({ assignment: a, report, onFile }: { assignment: FieldAssignment; report: FieldReport; onFile: (report: FieldReport, responses: Record<string, string>, reflection: string) => Promise<void> }) {
  const { db } = useStudy();
  const [responses, setResponses] = useState<Record<string, string>>(() => Object.fromEntries(a.reportPrompts.map((_, i) => [responseKey(i), responseFor(report.responses, i)])));
  const [reflection, setReflection] = useState(report.reflection ?? "");
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [filing, setFiling] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Handlers are recreated every render, so they always close over the latest state.
  async function save(key: string) {
    await db.store("field_reports").update(report.id, { responses, reflection: reflection.trim() || undefined });
    setSavedKey(key);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setSavedKey(null), 1800);
  }

  const answered = a.reportPrompts.filter((_, i) => (responses[responseKey(i)] ?? "").trim().length > 0).length;
  const canFile = answered >= 1 && !filing;

  async function file() {
    if (!canFile) return;
    setFiling(true);
    await onFile(report, responses, reflection);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      void file();
    }
  }

  return (
    <form
      className="max-w-[680px]"
      onSubmit={(e) => {
        e.preventDefault();
        void file();
      }}
    >
      <KindLine a={a} extra={`assigned ${daysSince(report.assignedAt)}`} />
      <h1 className="display text-[32px] md:text-[40px] text-ink mt-2">{a.title}</h1>
      <details className="mt-4 group">
        <summary className="cursor-pointer list-none text-[13px] text-ink-3 hover:text-ink inline-flex items-center gap-1.5 select-none">
          <I.Expand size={12} className="group-open:hidden" />
          <I.Collapse size={12} className="hidden group-open:inline" />
          The brief and steps
        </summary>
        <div className="mt-3 pl-4 border-l border-line space-y-3">
          <p className="serif text-[16px] text-ink-2 leading-relaxed">{a.brief}</p>
          <ol className="space-y-1.5">
            {a.steps.map((s, i) => (
              <li key={i} className="flex gap-3 text-[13px] text-ink-3 leading-relaxed">
                <span className="mono text-[11px] pt-0.5 w-5 shrink-0">{pad(i + 1)}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </details>

      <div className="mt-9 space-y-9">
        {a.reportPrompts.map((p, i) => {
          const key = responseKey(i);
          return (
            <PromptField
              key={key}
              index={i}
              prompt={p}
              value={responses[key] ?? ""}
              saved={savedKey === key}
              onChange={(v) => setResponses((r) => ({ ...r, [key]: v }))}
              onBlur={() => void save(key)}
              onKeyDown={onKeyDown}
              autoFocus={i === 0 && answered === 0}
            />
          );
        })}
        <div className="border-t border-line pt-8">
          <PromptField
            label="Reflection"
            prompt={REFLECTION_PROMPT}
            value={reflection}
            saved={savedKey === "reflection"}
            onChange={setReflection}
            onBlur={() => void save("reflection")}
            onKeyDown={onKeyDown}
            rows={3}
          />
        </div>
      </div>

      <div className="mt-10 border-t border-ink pt-6 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-5">
        <Button size="lg" type="submit" disabled={!canFile}>
          {filing ? "Filing" : "File the report"}
        </Button>
        <span className="text-[12px] text-ink-3">
          {answered} of {a.reportPrompts.length} prompts answered · saves when you leave a field · <kbd>⌘</kbd> <kbd>↵</kbd> files
        </span>
      </div>
    </form>
  );
}

function PromptField({
  index,
  label,
  prompt,
  value,
  saved,
  onChange,
  onBlur,
  onKeyDown,
  rows = 4,
  autoFocus,
}: {
  index?: number;
  label?: string;
  prompt: string;
  value: string;
  saved: boolean;
  onChange: (v: string) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  rows?: number;
  autoFocus?: boolean;
}) {
  const id = useId();
  const words = wordCount(value);
  return (
    <div>
      {label ? <div className="eyebrow mb-2">{label}</div> : null}
      <div className="flex items-baseline justify-between gap-4 mb-2">
        <label htmlFor={id} className="serif text-[18px] text-ink leading-snug">
          {index !== undefined ? <span className="mono text-[11px] text-ink-3 mr-3 align-middle">{pad(index + 1)}</span> : null}
          {prompt}
        </label>
        <span className={cx("mono text-[11px] shrink-0 inline-flex items-center gap-1.5 tabular-nums", saved ? "text-forest" : "text-ink-4")} aria-live="polite">
          {saved ? (
            <>
              <I.Check size={11} /> Saved
            </>
          ) : words ? (
            `${words} words`
          ) : null}
        </span>
      </div>
      <textarea id={id} className="field field-serif" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} onKeyDown={onKeyDown} autoFocus={autoFocus} />
    </div>
  );
}
