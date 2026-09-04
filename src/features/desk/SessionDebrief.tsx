"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useStudy, useStudyQuery } from "@/lib/persistence/provider";
import type { DailySession } from "@/lib/domain/types";
import { Button, TextArea } from "@/components/ui/primitives";
import { FACULTY_META, type FacultyId } from "@/lib/domain/faculties";
import { writeAfterAction } from "@/lib/services/after-action";
import { detectRedThreads } from "@/lib/adaptation/red-thread";
import { completeSessionItem } from "@/lib/adaptation/session";
import { todayKey } from "@/lib/util/format";

/** The session After Action: what today produced, and one thing to change. */
export function SessionDebrief({ session, onDone }: { session: DailySession; onDone: () => void }) {
  const { db } = useStudy();
  const [oneThing, setOneThing] = useState("");
  const [saving, setSaving] = useState(false);
  const evidence = useStudyQuery((db) => db.store("skill_evidence").list({ filter: (e) => e.createdAt.slice(0, 10) === todayKey() }), ["skill_evidence"]);
  const errors = useStudyQuery((db) => db.store("error_events").list({ filter: (e) => e.createdAt.slice(0, 10) === todayKey() }), ["error_events"]);
  const afterActions = useStudyQuery((db) => db.store("after_actions").list({ filter: (a) => a.createdAt.slice(0, 10) === todayKey() && a.source.kind !== "baseline" }), ["after_actions"]);

  const byFaculty = useMemo(() => {
    const m = new Map<FacultyId, { n: number; sum: number }>();
    for (const e of evidence.data ?? []) {
      const cur = m.get(e.faculty) ?? { n: 0, sum: 0 };
      cur.n++;
      cur.sum += e.score;
      m.set(e.faculty, cur);
    }
    return [...m.entries()].sort((a, b) => b[1].n - a[1].n);
  }, [evidence.data]);

  const errorCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of errors.data ?? []) m.set(e.type, (m.get(e.type) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [errors.data]);

  const done = session.items.filter((i) => i.status === "done");
  const skipped = session.items.filter((i) => i.status === "skipped");

  useEffect(() => {
    detectRedThreads(db).catch(() => {});
  }, [db]);

  async function finish() {
    setSaving(true);
    const missed = errorCounts.map(([t, n]) => `${t.toLowerCase().replace(/_/g, " ")} ×${n}`);
    await writeAfterAction(db, {
      source: { kind: "case", refId: session.id, label: `Session · ${session.date}` },
      title: `Session · ${session.length}`,
      saw: done.map((i) => i.title),
      missed,
      assumed: [],
      didWell: byFaculty.filter(([, v]) => v.sum / v.n >= 0.7).map(([f]) => FACULTY_META[f].label),
      oneThing: oneThing.trim() || "Keep the sequence; notice the pause before answering.",
      sessionId: session.id,
    });
    const item = session.items.find((i) => i.kind === "after_action");
    if (item) await completeSessionItem(db, session.id, item.id);
    else await db.store("daily_sessions").update(session.id, { status: "completed", completedAt: new Date().toISOString() });
    setSaving(false);
    onDone();
  }

  return (
    <div className="page">
      <div className="max-w-[680px]">
        <div className="eyebrow eyebrow-wine">After Action · today</div>
        <h1 className="display text-[36px] mt-2">What today produced</h1>

        <section className="mt-8 border-t border-line pt-4">
          <div className="eyebrow mb-3">What you did</div>
          <ul className="space-y-1 text-[14px]">
            {done.map((i) => (
              <li key={i.id} className="text-ink">{i.title}</li>
            ))}
            {skipped.map((i) => (
              <li key={i.id} className="text-ink-4">{i.title} — skipped</li>
            ))}
          </ul>
        </section>

        <section className="mt-6 border-t border-line pt-4">
          <div className="eyebrow mb-3">Evidence gathered</div>
          {byFaculty.length ? (
            <ul className="grid grid-cols-2 gap-x-8 gap-y-2 text-[14px]">
              {byFaculty.map(([f, v]) => (
                <li key={f} className="flex items-baseline justify-between border-b border-line py-1">
                  <span>{FACULTY_META[f].label}</span>
                  <span className="numeral text-ink-2">{Math.round((v.sum / v.n) * 100)} · n={v.n}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[14px] text-ink-3">No scored exercises today.</p>
          )}
        </section>

        {errorCounts.length ? (
          <section className="mt-6 border-t border-line pt-4">
            <div className="eyebrow mb-3">What recurred</div>
            <ul className="text-[14px] space-y-1">
              {errorCounts.map(([t, n]) => (
                <li key={t} className="text-ink-2">
                  {t.toLowerCase().replace(/_/g, " ")} <span className="numeral text-ink-3">×{n}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {afterActions.data?.length ? (
          <section className="mt-6 border-t border-line pt-4">
            <div className="eyebrow mb-3">From today&apos;s debriefs</div>
            <ul className="space-y-2">
              {afterActions.data.map((a) => (
                <li key={a.id} className="serif text-[17px] text-ink">
                  {a.oneThing}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-8">
          <TextArea label="One thing to change next time" value={oneThing} onChange={(e) => setOneThing(e.target.value)} serif placeholder="One sentence. Specific." onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void finish(); }} />
        </section>
        <div className="mt-6">
          <Button size="lg" onClick={finish} disabled={saving}>Close the day</Button>
        </div>
      </div>
    </div>
  );
}
