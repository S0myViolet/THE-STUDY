"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useStudy, useStudyQuery } from "@/lib/persistence/provider";
import { greeting, longDate, minutes, plural, todayKey } from "@/lib/util/format";
import { todaysCase, todaysSession, planSession, startSession, currentItem, sessionHref, LENGTH_MINUTES, completeSessionItem } from "@/lib/adaptation/session";
import { computeInsights } from "@/lib/adaptation/insights";
import { dueMemoryItems } from "@/lib/services/memory";
import { detectRedThreads } from "@/lib/adaptation/red-thread";
import { Button, Eyebrow, Segmented, HairlineProgress } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import type { DailySession, SessionLength } from "@/lib/domain/types";
import * as C from "@/content";
import { Arrival } from "./Arrival";
import { SessionDebrief } from "./SessionDebrief";
import { cx } from "@/lib/util/format";
import { FACULTY_META } from "@/lib/domain/faculties";

export function DeskRoom({ slug: _slug }: { slug?: string[] } = {}) {
  const { db, profile, prefs } = useStudy();
  const params = useSearchParams();
  const router = useRouter();
  const [length, setLength] = useState<SessionLength>(prefs.sessionLength === "variable" ? "standard" : prefs.sessionLength);

  const session = useStudyQuery((db) => todaysSession(db), ["daily_sessions"]);
  const kase = useStudyQuery((db) => todaysCase(db, profile), ["case_attempts", "skill_estimates"], [profile.id]);
  const due = useStudyQuery((db) => dueMemoryItems(db), ["memory_items"]);
  const insights = useStudyQuery((db) => computeInsights(db), ["skill_estimates", "confidence_entries", "observation_attempts", "memory_reviews", "salon_sessions"]);
  const threads = useStudyQuery((db) => db.store("red_threads").list({ filter: (t) => t.status !== "resolved", orderBy: "strength", desc: true }), ["red_threads"]);
  const progress = useStudyQuery((db) => db.store("archive_progress").list(), ["archive_progress"]);
  const field = useStudyQuery((db) => db.store("field_reports").list({ orderBy: "createdAt", desc: true, limit: 1 }), ["field_reports"]);
  const reading = useStudyQuery((db) => db.store("reading_items").list({ where: { status: "reading" }, orderBy: "updatedAt", desc: true, limit: 1 }), ["reading_items"]);
  const activeCase = useStudyQuery((db) => db.store("case_attempts").list({ where: { status: "active" }, orderBy: "updatedAt", desc: true, limit: 1 }), ["case_attempts"]);
  const activeStrategy = useStudyQuery((db) => db.store("strategy_runs").list({ where: { status: "active" }, orderBy: "updatedAt", desc: true, limit: 1 }), ["strategy_runs"]);
  const investigations = useStudyQuery((db) => db.store("investigations").list({ where: { status: "open" }, orderBy: "updatedAt", desc: true, limit: 1 }), ["investigations"]);
  const notes = useStudyQuery((db) => db.store("notifications").list({ where: { read: false }, orderBy: "createdAt", desc: true, limit: 4 }), ["notifications"]);
  const todayEvidence = useStudyQuery((db) => db.store("skill_evidence").list({ filter: (e) => e.createdAt.slice(0, 10) === todayKey() }), ["skill_evidence"]);

  // Run pattern detection quietly when the Desk opens.
  useEffect(() => {
    detectRedThreads(db).catch(() => {});
  }, [db]);

  // Command-palette commands land here.
  useEffect(() => {
    if (params.get("begin") === "case" && kase.data) router.replace(`/casebook/${kase.data.id}`);
  }, [params, kase.data, router]);
  const autoBegun = useRef(false);
  useEffect(() => {
    if (params.get("session") !== "1" || autoBegun.current || session.loading) return;
    autoBegun.current = true;
    void beginSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, session.loading]);

  const unreadEntry = useMemo(() => {
    const read = new Set((progress.data ?? []).filter((p) => p.status !== "unread").map((p) => p.entryId));
    const pool = C.ARCHIVE_ENTRIES.filter((e) => e.kind !== "path" && !read.has(e.id));
    const interest = pool.filter((e) => profile.interests.includes(e.domain as never));
    const pick = (interest.length ? interest : pool)[0];
    return pick;
  }, [progress.data, profile.interests]);

  if (params.get("arrival") === "1") {
    return <Arrival onDone={async () => {
      const sid = params.get("session"); const iid = params.get("item");
      if (sid && iid) await completeSessionItem(db, sid, iid);
      router.replace(sid ? `/desk?session=${sid}` : "/desk");
    }} />;
  }
  if (params.get("debrief") === "1" && session.data) {
    return <SessionDebrief session={session.data} onDone={() => router.replace("/desk")} />;
  }

  const s = session.data;
  const active = s && s.status === "active";
  const item = s ? currentItem(s) : undefined;
  const doneCount = s ? s.items.filter((i) => i.status === "done" || i.status === "skipped").length : 0;
  const name = profile.displayName?.trim() || undefined;

  async function beginSession() {
    const planned = s && s.status === "planned" && s.length === length ? s : await planSession(db, profile, prefs, { length });
    const started = await startSession(db, planned);
    const first = currentItem(started);
    if (first) router.push(sessionHref(first, started.id));
  }

  async function skipItem() {
    if (!s || !item) return;
    await completeSessionItem(db, s.id, item.id, "skipped");
  }

  return (
    <div className="page">
      <header className="mb-10">
        <div className="eyebrow">{longDate(new Date().toISOString())}</div>
        <h1 className="display text-[38px] md:text-[48px] mt-2 text-ink">{greeting(name)}</h1>
        <p className="mt-2 text-ink-3 text-[15px]">
          {active && item ? "Today's session is under way." : due.data?.length ? `Something is waiting on the desk. ${plural(due.data.length, "memory item is", "memory items are")} due.` : "Something is waiting on the desk."}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
        {/* Today's file / session */}
        <section aria-labelledby="todays-file">
          {active && s && item ? (
            <div className="sheet-raised paper-texture case-edge p-6 md:p-8 anim-place">
              <div className="flex items-baseline justify-between gap-4">
                <div id="todays-file" className="eyebrow eyebrow-wine">Today&apos;s session · {s.length}</div>
                <span className="numeral text-[12px] text-ink-3">
                  {doneCount} / {s.items.length}
                </span>
              </div>
              <HairlineProgress value={doneCount / s.items.length} className="mt-3" />
              <h2 className="display text-[30px] md:text-[36px] mt-6">{item.title}</h2>
              <p className="mt-2 text-ink-2 text-[15px]">{item.reasonText}</p>
              <div className="mt-2 flex items-center gap-4 text-[12px] text-ink-3">
                <span>{minutes(item.minutes)}</span>
                <span className="mark"><span className="mark-dot" /> {item.reason}</span>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <Link href={sessionHref(item, s.id)} className="btn btn-lg">
                  Continue <I.ArrowRight size={14} />
                </Link>
                <Button variant="ghost" onClick={skipItem}>Skip this</Button>
              </div>
              <ol className="mt-8 border-t border-line pt-4 space-y-1.5">
                {s.items.map((it, i) => (
                  <li key={it.id} className={cx("flex items-center gap-3 text-[13px]", it.status === "done" ? "text-ink-3 line-through decoration-line-2" : it.id === item.id ? "text-ink" : "text-ink-3")}>
                    <span className="mono text-[11px] w-5 text-right">{i + 1}</span>
                    <span className="flex-1">{it.title}</span>
                    <span className="numeral text-[11px]">{it.minutes}m</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : kase.data ? (
            <div className="sheet-raised paper-texture case-edge p-6 md:p-8 anim-place">
              <div className="flex items-baseline justify-between gap-4">
                <div id="todays-file" className="eyebrow eyebrow-wine">Today&apos;s file</div>
                <span className="mono text-[12px] text-ink-3">CASE {kase.data.number}</span>
              </div>
              <h2 className="display text-[34px] md:text-[44px] mt-4 leading-[1.05]">{kase.data.title}</h2>
              <p className="mt-3 serif text-[18px] text-ink-2 max-w-[52ch]">{kase.data.summary}</p>
              <div className="mt-6 grid grid-cols-2 gap-6 text-[13px]">
                <div>
                  <div className="eyebrow">Estimated time</div>
                  <div className="mt-1 text-ink">{minutes(kase.data.estimatedMinutes)}</div>
                </div>
                <div>
                  <div className="eyebrow">Skills</div>
                  <div className="mt-1 text-ink">{kase.data.faculties.map((f) => FACULTY_META[f].label).join(" · ")}</div>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href={`/casebook/${kase.data.id}`} className="btn btn-lg">
                  {activeCase.data?.[0]?.caseId === kase.data.id ? "Resume" : "Begin"} <I.ArrowRight size={14} />
                </Link>
                <div className="flex items-center gap-3 ml-auto">
                  <Segmented value={length} onChange={setLength} label="Session length" options={[{ value: "quick", label: "Quick" }, { value: "standard", label: "Standard" }, { value: "deep", label: "Deep" }, { value: "immersion", label: "Immersion" }]} />
                  <Button variant="secondary" onClick={beginSession}>
                    Session · {LENGTH_MINUTES[length]} min
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="sheet p-8">
              <div className="eyebrow">Today&apos;s file</div>
              <p className="serif text-[22px] mt-3">The Casebook is being prepared.</p>
            </div>
          )}

          {/* Recent discoveries */}
          <section className="mt-12" aria-labelledby="discoveries">
            <div id="discoveries" className="eyebrow mb-4">Recent discoveries</div>
            {insights.data && insights.data.length ? (
              <ul className="space-y-4 stagger">
                {insights.data.map((ins) => (
                  <li key={ins.id} className="border-l-2 border-brass pl-4">
                    <Link href={ins.href ?? "/profile"} className="block group">
                      <p className="serif text-[19px] leading-snug text-ink group-hover:text-ink-2">{ins.text}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="serif text-[18px] text-ink-3">Nothing has repeated enough to say yet. The Study is still collecting evidence{todayEvidence.data?.length ? ` — ${todayEvidence.data.length} pieces today` : ""}.</p>
            )}
          </section>

          {/* Continue */}
          <section className="mt-12" aria-labelledby="continue">
            <div id="continue" className="eyebrow mb-4">Continue</div>
            <ul className="divide-y divide-line border-t border-line">
              <ContinueRow label="Active book" title={reading.data?.[0]?.title} href={reading.data?.[0] ? `/archive/reading/${reading.data[0].id}` : "/archive/reading"} empty="Nothing open. Add a book to the shelf." />
              <ContinueRow label="Active case" title={activeCase.data?.[0] ? C.CASES.find((c) => c.id === activeCase.data![0].caseId)?.title : undefined} href={activeCase.data?.[0] ? `/casebook/${activeCase.data[0].caseId}` : "/casebook"} empty="No case left open." />
              <ContinueRow label="Knowledge trail" title={(() => { const path = C.ARCHIVE_ENTRIES.find((e) => e.kind === "path" && (progress.data ?? []).some((p) => e.pathEntries?.includes(p.entryId))); return path?.title; })()} href={(() => { const path = C.ARCHIVE_ENTRIES.find((e) => e.kind === "path" && (progress.data ?? []).some((p) => e.pathEntries?.includes(p.entryId))); return path ? `/archive/${path.id}` : "/archive/paths"; })()} empty="No trail started." />
              <ContinueRow label="Strategic scenario" title={activeStrategy.data?.[0] ? C.STRATEGY_SCENARIOS.find((s) => s.id === activeStrategy.data![0].scenarioId)?.title : undefined} href={activeStrategy.data?.[0] ? `/strategy/${activeStrategy.data[0].scenarioId}` : "/strategy"} empty="No scenario in progress." />
              <ContinueRow label="Investigation" title={investigations.data?.[0]?.title} href={investigations.data?.[0] ? `/investigations/${investigations.data[0].id}` : "/investigations"} empty="No open question." />
            </ul>
          </section>
        </section>

        {/* Secondary column */}
        <aside className="space-y-8 lg:pt-1">
          <SecondaryItem label="Memory due" value={due.data ? (due.data.length ? `${due.data.length} items` : "Nothing due") : "…"} href="/memory/review" sub={due.data?.length ? "Retention decays fastest right after learning." : "That is not the same as having nothing to learn."} />
          <SecondaryItem label="The Archive" value={unreadEntry ? unreadEntry.title : "All read"} href={unreadEntry ? `/archive/${unreadEntry.id}` : "/archive"} sub={unreadEntry ? "One new piece waiting." : "Add a question to the Archive."} serif />
          <SecondaryItem label="Open thread" value={threads.data?.[0]?.title ?? "Nothing yet"} href={threads.data?.[0] ? `/red-thread/${threads.data[0].id}` : "/red-thread"} sub={threads.data?.[0] ? `${threads.data[0].status} · ${threads.data[0].confidence} confidence` : "Nothing has repeated enough to call a pattern."} />
          <SecondaryItem label="Field assignment" value={field.data?.[0] ? (field.data[0].status === "completed" ? "Completed" : "Not completed") : "None assigned"} href="/fieldwork" sub={field.data?.[0] ? C.FIELD_ASSIGNMENTS.find((a) => a.id === field.data![0].assignmentId)?.title : "Take the Study outside."} />
          {notes.data?.length ? (
            <div>
              <Eyebrow className="mb-3">Notes</Eyebrow>
              <ul className="space-y-3">
                {notes.data.map((n) => (
                  <li key={n.id} className="text-[13px]">
                    <Link href={n.href ?? "/desk"} className="text-ink hover:underline underline-offset-4" onClick={() => db.store("notifications").update(n.id, { read: true })}>
                      {n.title}
                    </Link>
                    <p className="text-ink-3 mt-0.5">{n.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function SecondaryItem({ label, value, sub, href, serif }: { label: string; value: string; sub?: string; href: string; serif?: boolean }) {
  return (
    <Link href={href} className="block group border-t border-line pt-3">
      <div className="eyebrow">{label}</div>
      <div className={cx("mt-1 text-ink group-hover:text-ink-2", serif ? "serif text-[20px] leading-tight" : "text-[17px]")}>{value}</div>
      {sub ? <div className="mt-1 text-[12px] text-ink-3">{sub}</div> : null}
    </Link>
  );
}

function ContinueRow({ label, title, href, empty }: { label: string; title?: string; href: string; empty: string }) {
  return (
    <li>
      <Link href={href} className="flex items-baseline gap-4 py-3 group">
        <span className="eyebrow w-40 shrink-0">{label}</span>
        <span className={cx("flex-1 text-[15px]", title ? "serif text-[17px] text-ink group-hover:text-ink-2" : "text-ink-4")}>{title ?? empty}</span>
        <I.ArrowRight size={14} className="text-ink-4 group-hover:text-ink" />
      </Link>
    </li>
  );
}
