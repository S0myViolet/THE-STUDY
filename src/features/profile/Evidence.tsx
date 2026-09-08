"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useStudyQuery } from "@/lib/persistence/provider";
import { Empty, LevelMark, PageHeader, Segmented, Spinner } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { FACULTIES, FACULTY_META } from "@/lib/domain/faculties";
import { calibrationBuckets, calibrationVerdict, MIN_BUCKET } from "@/lib/scoring/calibration";
import { MILESTONES } from "@/lib/services/notifications";
import { facultyHistory, facultyViews, inRange, rangeStart, RANGE_OPTIONS, retentionByInterval, weekKey, weekKeys, type Range } from "@/lib/profile/derive";
import { CalibrationChart, Columns, Figure, Legend, LineChart, SmallLine, Timeline } from "./charts";
import { ProfileNav } from "./ProfileNav";
import { cx, plural, shortDate } from "@/lib/util/format";

const DAY = 86400000;

/** /profile/evidence — the EVIDENCE section: every chart the Study can honestly draw. */
export function EvidenceSection() {
  const [range, setRange] = useState<Range>("90d");
  const since = rangeStart(range);
  const [now] = useState(() => Date.now());

  const estimates = useStudyQuery((db) => db.store("skill_estimates").list(), ["skill_estimates"]);
  const evidence = useStudyQuery((db) => db.store("skill_evidence").list({ orderBy: "createdAt" }), ["skill_evidence"]);
  const confidences = useStudyQuery((db) => db.store("confidence_entries").list({ orderBy: "createdAt" }), ["confidence_entries"]);
  const observations = useStudyQuery((db) => db.store("observation_attempts").list({ orderBy: "createdAt" }), ["observation_attempts"]);
  const reviews = useStudyQuery((db) => db.store("memory_reviews").list({ orderBy: "createdAt" }), ["memory_reviews"]);
  const salons = useStudyQuery((db) => db.store("salon_sessions").list({ where: { status: "completed" }, orderBy: "createdAt" }), ["salon_sessions"]);
  const threads = useStudyQuery((db) => db.store("red_threads").list({ orderBy: "firstDetected" }), ["red_threads"]);
  const sessions = useStudyQuery((db) => db.store("daily_sessions").list({ orderBy: "createdAt" }), ["daily_sessions"]);
  const milestones = useStudyQuery((db) => db.store("milestones").list({ orderBy: "reachedAt" }), ["milestones"]);

  const loading = [estimates, evidence, confidences, observations, reviews, salons, threads, sessions, milestones].some((q) => q.loading);

  const ev = useMemo(() => inRange(evidence.data ?? [], since), [evidence.data, since]);
  const conf = useMemo(() => inRange(confidences.data ?? [], since), [confidences.data, since]);
  const obs = useMemo(() => inRange(observations.data ?? [], since).filter((o) => o.coverage !== undefined && o.precision !== undefined), [observations.data, since]);
  const revs = useMemo(() => inRange(reviews.data ?? [], since), [reviews.data, since]);
  const sal = useMemo(() => inRange(salons.data ?? [], since).filter((s) => s.review && s.review.questionsAsked > 0), [salons.data, since]);
  const thr = useMemo(() => (threads.data ?? []).filter((t) => since === undefined || Date.parse(t.lastReinforced) >= since || Date.parse(t.firstDetected) >= since), [threads.data, since]);
  const ses = useMemo(() => inRange(sessions.data ?? [], since).filter((s) => s.status === "completed"), [sessions.data, since]);

  // The window the time charts draw across: the range, or (ALL) from the first evidence.
  const firstAt = evidence.data?.[0]?.createdAt;
  const from = since ?? (firstAt ? Math.min(Date.parse(firstAt), now - 7 * DAY) : now - 30 * DAY);
  const to = now;

  const views = useMemo(() => facultyViews(estimates.data ?? []), [estimates.data]);
  const totalEvidence = evidence.data?.length ?? 0;

  // Calibration
  const buckets = useMemo(() => calibrationBuckets(conf), [conf]);
  const verdict = useMemo(() => calibrationVerdict(conf), [conf]);

  // Retention
  const retention = useMemo(() => retentionByInterval(revs), [revs]);

  // Sessions per week
  const weeks = useMemo(() => {
    const keys = weekKeys(new Date(from).toISOString(), new Date(to).toISOString());
    const counts = new Map<string, number>();
    for (const s of ses) counts.set(weekKey(s.createdAt), (counts.get(weekKey(s.createdAt)) ?? 0) + 1);
    return keys.map((k) => ({ label: shortDate(k), value: counts.get(k) ?? 0 }));
  }, [ses, from, to]);

  // Threads
  const threadRows = useMemo(
    () =>
      thr.map((t) => ({
        label: t.title,
        status: t.status,
        start: Date.parse(t.firstDetected),
        end: t.resolvedAt ? Date.parse(t.resolvedAt) : Date.parse(t.lastReinforced),
        resolved: t.status === "resolved",
      })),
    [thr],
  );
  const threadCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of thr) m.set(t.status, (m.get(t.status) ?? 0) + 1);
    return ["candidate", "emerging", "established", "improving", "resolved"].filter((s) => m.get(s)).map((s) => `${m.get(s)} ${s}`);
  }, [thr]);

  // Milestones
  const reached = new Map((milestones.data ?? []).map((m) => [m.key, m]));

  const rangeLabel = RANGE_OPTIONS.find((o) => o.value === range)?.label ?? "";

  return (
    <div className="page">
      <PageHeader eyebrow="Profile" title="Evidence" lede="What the Study has seen, drawn plainly. Every chart states its n; where there is not enough to say anything, it says so." aside={<Segmented value={range} onChange={setRange} label="Time range" options={RANGE_OPTIONS} />} />
      <ProfileNav current="evidence" />

      {loading ? (
        <Spinner label="Reading the evidence" />
      ) : totalEvidence === 0 ? (
        <Empty
          title="The Study has no evidence yet. Begin with a case."
          body="Charts appear as evidence accumulates. None of them are drawn from assumptions."
          action={
            <Link href="/v1/casebook" className="btn btn-lg">
              Open the Casebook <I.ArrowRight size={14} />
            </Link>
          }
        />
      ) : (
        <>
          <p className="text-[13px] text-ink-3 mb-8">
            <span className="numeral text-ink">{ev.length}</span> pieces of evidence in the last {rangeLabel === "ALL" ? "record" : rangeLabel.toLowerCase()} · <span className="numeral text-ink">{totalEvidence}</span> in all
          </p>

          {/* 1. Faculty trends: small multiples */}
          <section aria-labelledby="trends" className="border-t border-line-2 pt-4">
            <div className="flex items-baseline justify-between gap-4">
              <span id="trends" className="eyebrow">
                Faculty trends
              </span>
              <span className="numeral text-[11px] text-ink-3">{rangeLabel}</span>
            </div>
            <p className="mt-1 text-[13px] text-ink-3 max-w-[60ch]">Each line is the running faculty estimate as its subskills were updated. The hairline is 0.5, the prior every subskill starts from.</p>
            <div className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-6">
              {FACULTIES.map((f) => {
                const v = views.find((x) => x.id === f)!;
                const n = ev.filter((e) => e.faculty === f).length;
                const hist = facultyHistory(v.estimates, since).map((h) => ({ t: Date.parse(h.at), value: h.value }));
                const enough = n >= 5 && hist.length >= 2;
                return (
                  <div key={f} className="min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <Link href={`/v1/profile/${f}`} className="text-[13px] text-ink hover:underline underline-offset-4 truncate">
                        {FACULTY_META[f].label}
                      </Link>
                      <span className="numeral text-[11px] text-ink-3 shrink-0">n = {n}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <LevelMark level={v.level} />
                    </div>
                    {enough ? (
                      <div className="mt-2">
                        <SmallLine points={hist} from={from} to={to} />
                      </div>
                    ) : (
                      <p className="mt-2 h-16 flex items-end text-[12px] text-ink-4 serif">Not enough evidence yet.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-x-14 gap-y-12">
            {/* 2. Observation: precision vs coverage */}
            <Figure title="Observation · precision and coverage" explain="Coverage is how much of what was there you reported; precision is how much of what you reported was there. Inventing nothing and noticing everything are different skills." n={obs.length} table={{ columns: ["Date", "Mode", "Coverage", "Precision"], rows: obs.map((o) => [shortDate(o.createdAt), o.mode, `${Math.round((o.coverage ?? 0) * 100)}%`, `${Math.round((o.precision ?? 0) * 100)}%`]) }}>
              <LineChart
                yLabel="Observation"
                from={from}
                to={to}
                series={[
                  { label: "Precision", shape: "circle", className: "stroke-ink fill-ink", points: obs.map((o) => ({ t: Date.parse(o.createdAt), value: o.precision ?? 0 })) },
                  { label: "Coverage", shape: "square", className: "stroke-brass fill-brass", points: obs.map((o) => ({ t: Date.parse(o.createdAt), value: o.coverage ?? 0 })) },
                ]}
              />
              <Legend items={[{ label: "Precision", shape: "circle", className: "stroke-ink fill-ink" }, { label: "Coverage", shape: "square", className: "stroke-brass fill-brass" }]} />
            </Figure>

            {/* 3. Calibration */}
            <Figure
              title="Calibration"
              explain={`Stated confidence against how often you were right. Solid marks are buckets with at least ${MIN_BUCKET} entries; hollow ones are too thin to trust. Above the line is underconfident, below is overconfident.`}
              n={conf.length}
              aside={<VerdictText verdict={verdict.verdict} gap={verdict.gap} n={verdict.n} />}
              table={{ columns: ["Bucket", "n", "Stated", "Right"], rows: buckets.map((b) => [b.label, b.n, `${Math.round(b.meanConfidence * 100)}%`, b.n ? `${Math.round(b.accuracy * 100)}%` : "—"]) }}
            >
              <CalibrationChart buckets={buckets} />
              <Legend items={[{ label: `Trusted bucket (n ≥ ${MIN_BUCKET})`, shape: "circle", className: "stroke-ink fill-ink" }, { label: "Too few to trust", shape: "circle", className: "stroke-ink-3 fill-paper-2", hollow: true }]} />
            </Figure>

            {/* 4. Retention */}
            <Figure title="Retention by interval" explain="Share of memory reviews answered correctly, grouped by how long since the item was last seen. The right-hand columns are the ones that matter." n={revs.length} table={{ columns: ["Interval", "n", "Correct"], rows: retention.map((r) => [r.label, r.n, r.n ? `${Math.round(r.rate * 100)}%` : "—"]) }}>
              <Columns data={retention.map((r) => ({ label: r.label, value: r.rate, n: r.n, faint: r.n < 3 }))} max={1} fmt={(v) => `${Math.round(v * 100)}%`} yLabel="Retention" sub={(d) => (d.n ? `n ${d.n}` : undefined)} />
              <p className="mt-1 text-[11px] text-ink-4">Paler columns rest on fewer than three reviews.</p>
            </Figure>

            {/* 5. Question quality */}
            <Figure
              title="Question quality"
              explain="In each Salon, the share of your questions that forced the character to give up something new. Fewer, better questions raise it."
              n={sal.length}
              aside={(() => {
                const asked = sal.reduce((s, x) => s + (x.review?.questionsAsked ?? 0), 0);
                const forcing = sal.reduce((s, x) => s + (x.review?.questionsForcingNewInfo ?? 0), 0);
                return asked ? (
                  <span>
                    <span className="numeral text-ink">{forcing}</span> of <span className="numeral text-ink">{asked}</span> questions forced new information ({Math.round((forcing / asked) * 100)}%).
                  </span>
                ) : null;
              })()}
              table={{ columns: ["Date", "Asked", "Forced new information"], rows: sal.map((s) => [shortDate(s.createdAt), s.review!.questionsAsked, s.review!.questionsForcingNewInfo]) }}
            >
              <LineChart yLabel="Question quality" from={from} to={to} series={[{ label: "Forcing questions", shape: "circle", className: "stroke-ink fill-ink", points: sal.map((s) => ({ t: Date.parse(s.createdAt), value: s.review!.questionsForcingNewInfo / s.review!.questionsAsked })) }]} />
            </Figure>

            {/* 6. Red Thread history */}
            <Figure title="Red Thread history" explain="Each recurring pattern from first detection to its last reinforcement, or to the day it stopped recurring. A dotted line is a resolved thread." n={thr.length} minN={1} aside={threadCounts.length ? <span>{threadCounts.join(" · ")}</span> : null} table={{ columns: ["Thread", "Status", "First seen", "Last"], rows: thr.map((t) => [t.title, t.status, shortDate(t.firstDetected), shortDate(t.resolvedAt ?? t.lastReinforced)]) }}>
              <Timeline rows={threadRows} from={from} to={to} />
              <p className="mt-1 text-[11px] text-ink-4">
                <Link href="/v1/red-thread" className="underline underline-offset-4 hover:text-ink">
                  Open the Red Thread
                </Link>
              </p>
            </Figure>

            {/* 7. Session history */}
            <Figure title="Sessions completed per week" explain="Daily sessions carried through to their debrief. Regularity matters more than length; the Study is not counting streaks." n={ses.length} minN={1} table={{ columns: ["Week of", "Sessions"], rows: weeks.map((w) => [w.label, w.value]) }}>
              <Columns data={weeks} labelEvery={Math.max(1, Math.ceil(weeks.length / 8))} yLabel="Sessions per week" max={Math.max(3, ...weeks.map((w) => w.value))} />
            </Figure>
          </div>

          {/* 8. Milestones */}
          <section className="mt-14 border-t border-line-2 pt-4" aria-labelledby="milestones">
            <div className="flex items-baseline justify-between gap-4">
              <span id="milestones" className="eyebrow">
                Milestones
              </span>
              <span className="numeral text-[11px] text-ink-3">
                {reached.size} of {MILESTONES.length}
              </span>
            </div>
            <p className="mt-1 text-[13px] text-ink-3 max-w-[60ch]">Moments the Study marks once. {reached.size ? plural(reached.size, "has been reached", "have been reached").replace(/^\d+ /, (m) => m) : "None reached yet."}</p>
            <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-12">
              {[...MILESTONES].sort((a, b) => Number(reached.has(b.key)) - Number(reached.has(a.key))).map((m) => {
                const r = reached.get(m.key);
                return (
                  <li key={m.key} className={cx("flex items-baseline gap-3 py-2.5 border-b border-line", !r && "text-ink-4")}>
                    <span className="shrink-0 w-4 flex justify-center" aria-hidden="true">
                      {r ? <I.Check size={14} className="text-forest" /> : <span className="inline-block w-1.5 h-1.5 rounded-full border border-current mt-1" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cx("block text-[14px]", r ? "text-ink serif text-[16px]" : "")}>{m.title}</span>
                      <span className="block text-[12px] text-ink-3 mt-0.5">{m.description}</span>
                    </span>
                    <span className="numeral text-[11px] text-ink-3 shrink-0">{r ? shortDate(r.reachedAt) : "Not yet"}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

function VerdictText({ verdict, gap, n }: { verdict: ReturnType<typeof calibrationVerdict>["verdict"]; gap: number; n: number }) {
  const pts = Math.round(Math.abs(gap) * 100);
  if (verdict === "insufficient") return <span className="text-ink-3">No verdict yet: trusted buckets hold {n} entries; ten are needed.</span>;
  if (verdict === "overconfident")
    return (
      <span>
        <strong className="font-medium text-ink">Overconfident</strong> by about {pts} points across {n} trusted entries. Your certainty runs ahead of your accuracy.
      </span>
    );
  if (verdict === "underconfident")
    return (
      <span>
        <strong className="font-medium text-ink">Underconfident</strong> by about {pts} points across {n} trusted entries. You are right more often than you say.
      </span>
    );
  return (
    <span>
      <strong className="font-medium text-ink">Well calibrated</strong> across {n} trusted entries; stated and actual sit within {Math.max(1, pts)} points.
    </span>
  );
}
