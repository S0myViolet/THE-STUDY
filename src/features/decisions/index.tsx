"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useStudy, useStudyQuery } from "@/lib/persistence/provider";
import { stamp } from "@/lib/persistence/store";
import type { DecisionEntry } from "@/lib/domain/types";
import { recordConfidence, recordEvidence } from "@/lib/services/evidence";
import { notify, reachMilestone } from "@/lib/services/notifications";
import { detectRedThreads } from "@/lib/adaptation/red-thread";
import { Button, ConfidenceDial, Empty, Field, PageHeader, TextArea, Note } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { cx, relativeDays, shortDate } from "@/lib/util/format";

export function DecisionsRoom({ slug }: { slug: string[] }) {
  const params = useSearchParams();
  if (slug[0] === "new" || params.get("new") === "1") return <NewDecision />;
  if (slug[0]) return <DecisionDetail id={slug[0]} />;
  return <Index />;
}

function Index() {
  const { db } = useStudy();
  const q = useStudyQuery((db) => db.store("decision_entries").list({ orderBy: "createdAt", desc: true }), ["decision_entries"]);
  const all = q.data ?? [];
  const open = all.filter((d) => d.status === "open").sort((a, b) => a.reviewDate.localeCompare(b.reviewDate));
  const reviewed = all.filter((d) => d.status === "reviewed");
  const due = open.filter((d) => new Date(d.reviewDate).getTime() <= Date.now());
  useEffect(() => {
    for (const d of due) notify(db, { kind: "decision_review", title: `Decision due for review: ${d.title.slice(0, 50)}`, body: "Separate what was luck from what was skill.", href: `/decisions/${d.id}`, dedupeKey: d.id }).catch(() => {});
  }, [due, db]);
  const meanGap = reviewed.length ? reviewed.reduce((s, d) => s + ((d.review?.outcomeQuality ?? 0) - (d.review?.decisionQuality ?? 0)), 0) / reviewed.length : null;

  return (
    <div className="page">
      <PageHeader eyebrow="Decision Journal" title="Decide, then check" lede="Before a meaningful decision: options, belief, expected outcome, confidence, assumptions, risks, a date. Afterwards: what happened, what was luck, what was skill." aside={all.length ? <Link href="/decisions/new" className="btn"><I.Plus size={14} /> Decision</Link> : null} />
      {!all.length && !q.loading ? (
        <Empty title="A journal that separates decision quality from outcome quality." body="It becomes valuable in months, not minutes. Good decisions can have bad outcomes; the journal is how you tell." action={<Link href="/decisions/new" className="btn btn-lg">Log a decision</Link>} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10">
          <div>
            <section>
              <div className="eyebrow mb-1">Open · {open.length}</div>
              <ul className="divide-y divide-line border-t border-line">
                {open.map((d) => <Row key={d.id} d={d} />)}
                {!open.length ? <li className="py-4 text-[13px] text-ink-3">Nothing awaiting review.</li> : null}
              </ul>
            </section>
            <section className="mt-10">
              <div className="eyebrow mb-1">Reviewed · {reviewed.length}</div>
              <ul className="divide-y divide-line border-t border-line">{reviewed.map((d) => <Row key={d.id} d={d} />)}</ul>
            </section>
          </div>
          <aside className="space-y-6">
            <div className="border-t border-line pt-3"><div className="eyebrow">Luck vs skill</div><div className="numeral text-[28px] mt-1">{meanGap === null ? "—" : (meanGap >= 0 ? "+" : "") + Math.round(meanGap * 100)}</div><div className="text-[12px] text-ink-3 mt-1">{reviewed.length ? `mean outcome minus decision quality, n = ${reviewed.length}. Positive means outcomes have been kinder than your decisions deserved.` : "Appears after the first review."}</div></div>
            <p className="text-[12px] text-ink-4 border-t border-line pt-3">Reviews feed Calibration and Strategy in your Profile.</p>
          </aside>
        </div>
      )}
    </div>
  );
}

function Row({ d }: { d: DecisionEntry }) {
  const due = d.status === "open" && new Date(d.reviewDate).getTime() <= Date.now();
  return (
    <li>
      <Link href={`/decisions/${d.id}`} className="group flex items-baseline gap-4 py-3.5 -mx-3 px-3 hover:bg-paper-3 rounded-sm">
        <span className="flex-1 min-w-0"><span className="serif text-[17px] text-ink block truncate">{d.title}</span><span className="text-[12px] text-ink-3">{d.status === "open" ? <>confidence {Math.round(d.confidence * 100)}% · review {relativeDays(d.reviewDate)}{due ? <span className="text-wine"> · due</span> : null}</> : <>decision {Math.round((d.review?.decisionQuality ?? 0) * 100)} · outcome {Math.round((d.review?.outcomeQuality ?? 0) * 100)} · {d.review ? shortDate(d.review.reviewedAt) : ""}</>}</span></span>
        <I.ArrowRight size={14} className="text-ink-4 group-hover:text-ink" />
      </Link>
    </li>
  );
}

function ListEditor({ label, items, onChange, placeholder }: { label: string; items: string[]; onChange: (xs: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState("");
  return (
    <div>
      <div className="eyebrow mb-1.5">{label}</div>
      <ul className="space-y-1 mb-2">{items.map((it, i) => <li key={i} className="flex items-center gap-2 text-[14px]"><span className="flex-1 border-l border-line-2 pl-3">{it}</span><button className="text-ink-4 hover:text-wine" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Remove"><I.Close size={12} /></button></li>)}</ul>
      <div className="flex gap-2"><input className="field" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={placeholder} onKeyDown={(e) => { if (e.key === "Enter" && draft.trim()) { e.preventDefault(); onChange([...items, draft.trim()]); setDraft(""); } }} aria-label={`Add to ${label}`} /><Button variant="secondary" size="sm" onClick={() => { if (draft.trim()) { onChange([...items, draft.trim()]); setDraft(""); } }}>Add</Button></div>
    </div>
  );
}

function NewDecision() {
  const { db } = useStudy();
  const router = useRouter();
  const [f, setF] = useState({ title: "", currentBelief: "", expectedOutcome: "", changeMind: "" });
  const [options, setOptions] = useState<string[]>([]);
  const [assumptions, setAssumptions] = useState<string[]>([]);
  const [risks, setRisks] = useState<string[]>([]);
  const [chosen, setChosen] = useState("");
  const [conf, setConf] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [busy, setBusy] = useState(false);
  const minDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const ok = f.title.trim().length > 3 && options.length >= 2 && conf !== null && date >= minDate && f.expectedOutcome.trim().length > 3;

  async function save() {
    setBusy(true);
    const d = stamp<DecisionEntry>(db.userId, "dec", { title: f.title.trim(), options, chosen: chosen || undefined, currentBelief: f.currentBelief.trim(), expectedOutcome: f.expectedOutcome.trim(), confidence: conf!, assumptions, changeMind: f.changeMind.trim(), risks, reviewDate: new Date(date + "T12:00:00").toISOString(), status: "open" });
    await db.store("decision_entries").put(d);
    router.push(`/decisions/${d.id}`);
  }

  return (
    <div className="page">
      <Link href="/decisions" className="text-[12px] text-ink-3 hover:text-ink inline-flex items-center gap-1.5 mb-4"><I.ArrowLeft size={12} /> Decision Journal</Link>
      <PageHeader eyebrow="Before the decision" title="Write it down first" />
      <div className="max-w-[720px] space-y-6">
        <Field label="Decision" serif value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Whether to take the Lisbon role" autoFocus />
        <ListEditor label="Options" items={options} onChange={setOptions} placeholder="One option, then Enter" />
        {options.length ? <div><div className="eyebrow mb-1.5">Leaning toward</div><div className="flex flex-wrap gap-2">{options.map((o) => <button key={o} className="choice !w-auto !py-1.5 !px-3 text-[13px]" aria-pressed={chosen === o} onClick={() => setChosen(o)}>{o}</button>)}</div></div> : null}
        <TextArea label="Current belief" value={f.currentBelief} onChange={(e) => setF({ ...f, currentBelief: e.target.value })} rows={2} placeholder="What you think is true about the situation." />
        <TextArea label="Expected outcome" value={f.expectedOutcome} onChange={(e) => setF({ ...f, expectedOutcome: e.target.value })} rows={2} placeholder="Specific enough to be wrong." />
        <ConfidenceDial value={conf} onChange={setConf} label="Confidence that the expected outcome occurs" />
        <ListEditor label="Assumptions" items={assumptions} onChange={setAssumptions} placeholder="Something you are taking for granted" />
        <TextArea label="What would change my mind" value={f.changeMind} onChange={(e) => setF({ ...f, changeMind: e.target.value })} rows={2} />
        <ListEditor label="Risks" items={risks} onChange={setRisks} placeholder="What could go wrong" />
        <Field label="Date to review" type="date" value={date} min={minDate} onChange={(e) => setDate(e.target.value)} className="max-w-xs" />
        <Button size="lg" onClick={save} disabled={!ok || busy}>Record the decision</Button>
      </div>
    </div>
  );
}

function DecisionDetail({ id }: { id: string }) {
  const { db } = useStudy();
  const q = useStudyQuery((db) => db.store("decision_entries").get(id), ["decision_entries"], [id]);
  const d = q.data;
  const [r, setR] = useState({ whatHappened: "", luck: "", skill: "", missed: "" });
  const [outcomeQ, setOutcomeQ] = useState(0.5);
  const [decisionQ, setDecisionQ] = useState(0.5);
  const [reviewing, setReviewing] = useState(false);
  const [busy, setBusy] = useState(false);
  if (q.loading) return <div className="page" />;
  if (!d) return <div className="page"><Empty title="No such decision." action={<Link href="/decisions" className="btn btn-secondary">Back</Link>} /></div>;
  const due = d.status === "open" && new Date(d.reviewDate).getTime() <= Date.now();

  async function submitReview() {
    if (!d) return;
    setBusy(true);
    const review = { reviewedAt: new Date().toISOString(), whatHappened: r.whatHappened.trim(), luck: r.luck.trim(), skill: r.skill.trim(), missed: r.missed.trim(), outcomeQuality: outcomeQ, decisionQuality: decisionQ };
    await db.store("decision_entries").update(d.id, { status: "reviewed", review });
    const source = { kind: "decision" as const, refId: d.id, label: d.title.slice(0, 60) };
    await recordConfidence(db, { confidence: d.confidence, correct: outcomeQ >= 0.5, domain: "strategy", source, difficulty: 4 });
    await recordEvidence(db, { subskill: "strategy.planning", score: decisionQ, difficulty: 4, format: "free", source });
    await recordEvidence(db, { subskill: "composure.revision", score: r.missed.trim().length > 20 ? 0.8 : 0.5, difficulty: 3, format: "free", source });
    await reachMilestone(db, "first_decision_reviewed");
    await detectRedThreads(db);
    setBusy(false);
    setReviewing(false);
  }

  return (
    <div className="page">
      <Link href="/decisions" className="text-[12px] text-ink-3 hover:text-ink inline-flex items-center gap-1.5 mb-4"><I.ArrowLeft size={12} /> Decision Journal</Link>
      <div className="max-w-[720px]">
        <div className="eyebrow">{d.status === "open" ? `review ${relativeDays(d.reviewDate)}` : `reviewed ${d.review ? shortDate(d.review.reviewedAt) : ""}`} · decided {shortDate(d.createdAt)}</div>
        <h1 className="display text-[30px] md:text-[36px] mt-2">{d.title}</h1>
        <div className="mt-6 space-y-4">
          <div><div className="eyebrow mb-1">Options</div><ul className="space-y-1">{d.options.map((o) => <li key={o} className={cx("text-[15px] pl-3 border-l", o === d.chosen ? "border-ink text-ink" : "border-line-2 text-ink-2")}>{o}{o === d.chosen ? <span className="text-[11px] text-ink-3 ml-2 uppercase tracking-wider">chosen</span> : null}</li>)}</ul></div>
          <P label="Current belief" text={d.currentBelief} />
          <P label="Expected outcome" text={d.expectedOutcome} />
          <div><div className="eyebrow">Confidence</div><div className="numeral text-[26px] mt-1">{Math.round(d.confidence * 100)}%</div></div>
          {d.assumptions.length ? <div><div className="eyebrow mb-1">Assumptions</div><ul className="space-y-1">{d.assumptions.map((a) => <li key={a} className="text-[14px] pl-3 border-l border-line-2 text-ink-2">{a}</li>)}</ul></div> : null}
          <P label="What would change my mind" text={d.changeMind} />
          {d.risks.length ? <div><div className="eyebrow mb-1">Risks</div><ul className="space-y-1">{d.risks.map((a) => <li key={a} className="text-[14px] pl-3 border-l border-line-2 text-ink-2">{a}</li>)}</ul></div> : null}
        </div>

        {d.status === "reviewed" && d.review ? (
          <section className="mt-8 border-t border-ink pt-5 space-y-4">
            <div className="eyebrow eyebrow-wine">The review</div>
            <div className="grid grid-cols-2 gap-6"><div><div className="eyebrow">Decision quality</div><div className="numeral text-[26px] mt-1">{Math.round(d.review.decisionQuality * 100)}</div></div><div><div className="eyebrow">Outcome quality</div><div className="numeral text-[26px] mt-1">{Math.round(d.review.outcomeQuality * 100)}</div></div></div>
            <P label="What happened" text={d.review.whatHappened} />
            <P label="What was luck" text={d.review.luck} />
            <P label="What was skill" text={d.review.skill} />
            <P label="What I missed" text={d.review.missed} />
            <Note tone={Math.abs(d.review.outcomeQuality - d.review.decisionQuality) < 0.2 ? "forest" : "brass"}>{d.review.outcomeQuality - d.review.decisionQuality >= 0.2 ? "A better outcome than the decision deserved. Do not learn the wrong lesson from it." : d.review.decisionQuality - d.review.outcomeQuality >= 0.2 ? "A good decision with a poor outcome. That happens; the process is what you keep." : "Decision and outcome roughly agree. The judgement was sound and reality cooperated."}</Note>
          </section>
        ) : (
          <section className="mt-8 border-t border-line pt-5">
            {due ? <Note tone="wine" className="mb-4">The review date has arrived.</Note> : null}
            {!reviewing ? <Button onClick={() => setReviewing(true)}>{due ? "Review now" : "Review early"}</Button> : (
              <div className="space-y-5 anim-unfold">
                <TextArea label="What happened?" value={r.whatHappened} onChange={(e) => setR({ ...r, whatHappened: e.target.value })} rows={3} autoFocus />
                <TextArea label="What was luck?" value={r.luck} onChange={(e) => setR({ ...r, luck: e.target.value })} rows={2} />
                <TextArea label="What was skill?" value={r.skill} onChange={(e) => setR({ ...r, skill: e.target.value })} rows={2} />
                <TextArea label="What did I miss?" value={r.missed} onChange={(e) => setR({ ...r, missed: e.target.value })} rows={2} />
                <p className="serif text-[17px] text-ink">Good decisions can have bad outcomes. Separate them.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <label className="block"><span className="flex justify-between eyebrow"><span>Decision quality</span><span className="numeral">{Math.round(decisionQ * 100)}</span></span><input type="range" min={0} max={1} step={0.05} value={decisionQ} onChange={(e) => setDecisionQ(Number(e.target.value))} className="w-full accent-[var(--ink)]" /><span className="text-[11px] text-ink-3">Given what you knew then.</span></label>
                  <label className="block"><span className="flex justify-between eyebrow"><span>Outcome quality</span><span className="numeral">{Math.round(outcomeQ * 100)}</span></span><input type="range" min={0} max={1} step={0.05} value={outcomeQ} onChange={(e) => setOutcomeQ(Number(e.target.value))} className="w-full accent-[var(--ink)]" /><span className="text-[11px] text-ink-3">How it actually turned out.</span></label>
                </div>
                <div className="flex gap-3"><Button onClick={submitReview} disabled={busy || r.whatHappened.trim().length < 5}>File the review</Button><Button variant="ghost" onClick={() => setReviewing(false)}>Not yet</Button></div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function P({ label, text }: { label: string; text: string }) {
  if (!text) return null;
  return <div><div className="eyebrow mb-1">{label}</div><p className="serif text-[17px] text-ink-2 leading-relaxed">{text}</p></div>;
}
