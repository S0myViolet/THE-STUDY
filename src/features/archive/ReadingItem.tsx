"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStudy, useStudyQuery } from "@/lib/persistence/provider";
import type { ArchiveEntry, ReadingItem, ReadingStatus } from "@/lib/domain/types";
import { ai, useAIStatus } from "@/lib/ai/client";
import { recordEvidence } from "@/lib/services/evidence";
import { createMemoryItem } from "@/lib/services/memory";
import { detectRedThreads } from "@/lib/adaptation/red-thread";
import { useSessionItem } from "@/lib/services/session-context";
import { Button, Empty, Segmented, TextArea } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { cx, plural, shortDate } from "@/lib/util/format";
import { wordCount } from "@/lib/scoring/text";
import { DOMAIN_LABEL, matchesQuery } from "@/lib/archive/entries";
import { blendScore, explainCoverage, type ExplainResult } from "@/lib/archive/scoring";
import { NOTE_FIELDS, READING_KIND_LABEL, READING_STATUSES, READING_STATUS_LABEL, canReconstruct, reconstructionPoints, type NoteField } from "@/lib/archive/reading";
import { ArchiveHeader, useArchive } from "./shared";

export function ReadingItemView({ id }: { id: string }) {
  const item = useStudyQuery((db) => db.store("reading_items").get(id), ["reading_items"], [id]);
  if (item.loading && !item.data) return <div className="page" />;
  if (!item.data) {
    return (
      <div className="page">
        <ArchiveHeader eyebrow="The Archive · Bookshelf" title="Not on the shelf" back="/archive/reading" backLabel="Bookshelf" />
        <Empty title="There is no item with that name." body="It may have been removed. The shelf has everything that remains." action={<Link href="/archive/reading" className="btn btn-secondary">Back to the Bookshelf</Link>} />
      </div>
    );
  }
  return <ItemPage key={id} item={item.data} />;
}

/* ------------------------------------------------------------------ */
/* Page                                                                  */
/* ------------------------------------------------------------------ */

function ItemPage({ item }: { item: ReadingItem }) {
  const { db } = useStudy();
  const router = useRouter();
  const { inSession, finish } = useSessionItem();
  const [mode, setMode] = useState<"notes" | "reconstruct">("notes");
  const [removing, setRemoving] = useState(false);
  const kept = useStudyQuery((db) => db.store("memory_items").list({ filter: (m) => m.sourceRef?.kind === "reading" && m.sourceRef.refId === item.id }), ["memory_items"], [item.id]);
  const [justKept, setJustKept] = useState(false);
  const [busy, setBusy] = useState(false);

  async function setStatus(status: ReadingStatus) {
    if (status === item.status) return;
    const patch: Partial<ReadingItem> = { status };
    if (status === "finished" && !item.finishedAt) patch.finishedAt = new Date().toISOString();
    await db.store("reading_items").update(item.id, patch);
  }

  async function keepKeyIdea() {
    const idea = (item.keyIdea ?? "").trim();
    if (!idea || busy) return;
    setBusy(true);
    await createMemoryItem(db, {
      kind: "concept",
      prompt: `What is the key idea of ${item.title}${item.author ? ` (${item.author})` : ""}?`,
      answer: idea,
      hint: item.question ? `You read it asking: ${item.question}` : undefined,
      sourceRef: { kind: "reading", refId: item.id, label: item.title },
      tags: ["reading", item.kind],
      dueInDays: 1,
    });
    setJustKept(true);
    setBusy(false);
  }

  async function remove() {
    await db.store("reading_items").delete(item.id);
    router.push("/archive/reading");
  }

  const filled = NOTE_FIELDS.filter((f) => (item[f.key] ?? "").trim()).length;
  const ready = canReconstruct(item);
  const keptCount = kept.data?.length ?? 0;

  return (
    <div className="page">
      <ArchiveHeader
        eyebrow={<>Bookshelf · {READING_KIND_LABEL[item.kind]}{item.finishedAt ? ` · finished ${shortDate(item.finishedAt)}` : ""}</>}
        title={item.title}
        lede={item.author ? <span className="serif italic text-[18px] text-ink-2">{item.author}</span> : undefined}
        back="/archive/reading"
        backLabel="Bookshelf"
      >
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Segmented label="Status" value={item.status} onChange={(v) => void setStatus(v)} options={READING_STATUSES.map((s) => ({ value: s, label: READING_STATUS_LABEL[s] }))} />
          <span className="text-[12px] text-ink-3 numeral">{filled} / {NOTE_FIELDS.length} notes</span>
          {inSession ? <span className="mark"><span className="mark-dot" /> Today&apos;s session</span> : null}
        </div>
      </ArchiveHeader>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,680px)_300px] gap-x-16 gap-y-12">
        <div className="reading-column min-w-0">
          {mode === "notes" ? (
            <>
              <section aria-label="Reading for">
                <div className="border-t border-ink pt-3 mb-4 eyebrow">Reading for</div>
                <div className="space-y-5">
                  <NoteArea item={item} field="why" label="Why this?" prompt="What made you pick it up." rows={2} />
                  <NoteArea item={item} field="question" label="Your question" prompt="The question you are reading it to answer. Notes are better when they answer something." rows={2} />
                </div>
              </section>

              <section className="mt-12" aria-label="Notes">
                <div className="border-t border-ink pt-3 mb-1 flex items-baseline justify-between">
                  <span className="eyebrow">Notes</span>
                  <span className="text-[11px] text-ink-4">Saved when you leave a field</span>
                </div>
                <p className="text-[13px] text-ink-3 mb-7">Key idea, argument and evidence are what the reconstruction exercise will test. Write them so a stranger could follow.</p>
                <div className="space-y-6">
                  {NOTE_FIELDS.map((f) => (
                    <NoteArea key={f.key} item={item} field={f.key} label={f.label} prompt={f.prompt} rows={f.key === "argument" || f.key === "evidence" ? 5 : 3} />
                  ))}
                </div>
              </section>

              <section className="mt-12 border-t border-ink pt-6" aria-label="Reconstruct from memory">
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="lg" disabled={!ready} onClick={() => setMode("reconstruct")}>Reconstruct from memory</Button>
                  {item.status === "finished" && (item.keyIdea ?? "").trim() ? (
                    <Button variant="secondary" disabled={busy || keptCount > 0} onClick={keepKeyIdea}>{keptCount > 0 || justKept ? "Key idea in Memory" : "Save the key idea to Memory"}</Button>
                  ) : null}
                  {item.reconstructionAt ? <span className="text-[12px] text-ink-4 numeral ml-auto">Last reconstruction {shortDate(item.reconstructionAt)}</span> : null}
                </div>
                {!ready ? <p className="mt-3 text-[13px] text-ink-3">Write at least two full sentences across key idea, argument and evidence, then the notes can be hidden and rebuilt from memory.</p> : <p className="mt-3 text-[13px] text-ink-3">The notes are hidden; you write the argument as you remember it; the two are compared sentence by sentence.</p>}
                {keptCount > 0 || justKept ? (
                  <p className="mt-2 text-[12px] text-ink-3">The key idea is in the palace and will be asked tomorrow. <Link href="/memory/review" className="underline underline-offset-4 hover:text-ink">Review</Link></p>
                ) : item.status !== "finished" && (item.keyIdea ?? "").trim() ? (
                  <p className="mt-2 text-[12px] text-ink-4">Mark it finished to save the key idea to Memory.</p>
                ) : null}
              </section>
            </>
          ) : (
            <Reconstruct item={item} onDone={() => setMode("notes")} inSession={inSession} onFinish={finish} />
          )}
        </div>

        <aside className="space-y-10 min-w-0">
          <ConnectionsEditor item={item} />

          <section aria-label="On this shelf">
            <div className="border-t border-ink pt-3 mb-2 eyebrow">Record</div>
            <ul className="text-[13px] text-ink-2 space-y-1.5">
              <li className="flex justify-between gap-3"><span>Added</span><span className="numeral text-ink-3">{shortDate(item.createdAt)}</span></li>
              {item.finishedAt ? <li className="flex justify-between gap-3"><span>Finished</span><span className="numeral text-ink-3">{shortDate(item.finishedAt)}</span></li> : null}
              {item.reconstructionAt ? <li className="flex justify-between gap-3"><span>Reconstructed</span><span className="numeral text-ink-3">{shortDate(item.reconstructionAt)}</span></li> : null}
              <li className="flex justify-between gap-3"><span>In Memory</span><span className="numeral text-ink-3">{keptCount ? plural(keptCount, "prompt") : "nothing yet"}</span></li>
            </ul>
            <div className="mt-6">
              {removing ? (
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="text-ink-2">Remove for good?</span>
                  <Button size="sm" variant="wine" onClick={remove}>Remove</Button>
                  <Button size="sm" variant="ghost" onClick={() => setRemoving(false)}>Keep</Button>
                </div>
              ) : (
                <button type="button" className="text-[12px] text-ink-4 hover:text-ink underline underline-offset-4" onClick={() => setRemoving(true)}>Remove from the shelf</button>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Note field: saves on blur, says so quietly                            */
/* ------------------------------------------------------------------ */

type EditableField = NoteField | "why" | "question";

function NoteArea({ item, field, label, prompt, rows }: { item: ReadingItem; field: EditableField; label: string; prompt: string; rows: number }) {
  const { db } = useStudy();
  const stored = item[field] ?? "";
  const [value, setValue] = useState(stored);
  const [saved, setSaved] = useState(false);
  const dirty = useRef(false);
  const timer = useRef<number | null>(null);

  // Follow external changes (another tab, a reset) only while the field is clean.
  useEffect(() => {
    if (!dirty.current) setValue(stored);
  }, [stored]);

  async function save() {
    const next = value.trim();
    if (next === stored.trim()) {
      dirty.current = false;
      return;
    }
    await db.store("reading_items").update(item.id, { [field]: next || undefined } as Partial<ReadingItem>);
    dirty.current = false;
    setSaved(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setSaved(false), 1800);
  }

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="eyebrow" htmlFor={`note-${field}`}>{label}</label>
        <span className={cx("text-[11px] text-forest inline-flex items-center gap-1 transition-opacity", saved ? "opacity-100" : "opacity-0")} aria-live="polite">
          {saved ? <><I.Check size={11} /> Saved</> : null}
        </span>
      </div>
      <textarea
        id={`note-${field}`}
        className="field field-serif"
        rows={rows}
        value={value}
        placeholder={prompt}
        onChange={(e) => { dirty.current = true; setValue(e.target.value); }}
        onBlur={() => void save()}
        onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") (e.currentTarget as HTMLTextAreaElement).blur(); }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Connections to the Archive                                            */
/* ------------------------------------------------------------------ */

function ConnectionsEditor({ item }: { item: ReadingItem }) {
  const { db } = useStudy();
  const data = useArchive();
  const [q, setQ] = useState("");
  const linked = useMemo(() => item.connections.map((id) => data.byId.get(id)).filter((e): e is ArchiveEntry => !!e), [item.connections, data.byId]);
  const candidates = useMemo(() => {
    if (!q.trim()) return [];
    return data.entries.filter((e) => e.kind !== "path" && !item.connections.includes(e.id) && matchesQuery(e, q)).slice(0, 6);
  }, [q, data.entries, item.connections]);

  async function add(e: ArchiveEntry) {
    await db.store("reading_items").update(item.id, { connections: [...item.connections, e.id] });
    await recordEvidence(db, { subskill: "knowledge.connections", score: 0.7, difficulty: 3, format: "free", transfer: true, source: { kind: "reading", refId: item.id, label: `${item.title} → ${e.title}` }, note: `connected to ${e.title}` });
    setQ("");
  }

  async function removeLink(id: string) {
    await db.store("reading_items").update(item.id, { connections: item.connections.filter((c) => c !== id) });
  }

  return (
    <section aria-label="Connections">
      <div className="flex items-baseline justify-between border-t border-ink pt-3 mb-3">
        <span className="eyebrow">Connects to</span>
        <span className="numeral text-[11px] text-ink-4">{linked.length || ""}</span>
      </div>
      {linked.length ? (
        <ul className="flex flex-wrap gap-2 mb-3">
          {linked.map((e) => (
            <li key={e.id} className="inline-flex items-center gap-1.5 border border-line-2 rounded-sm pl-2 pr-1 py-0.5 text-[12.5px] text-ink-2">
              <Link href={`/archive/${e.id}`} className="serif text-[14px] text-ink hover:underline underline-offset-4">{e.title}</Link>
              <button type="button" className="text-ink-4 hover:text-ink p-0.5" aria-label={`Remove connection to ${e.title}`} onClick={() => removeLink(e.id)}>
                <I.Close size={11} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[13px] text-ink-3 mb-3">Which Archive entries does this book speak to? A book without connections is filed, not understood.</p>
      )}
      <label className="block">
        <span className="sr-only">Search Archive entries</span>
        <input className="field" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the Archive" aria-label="Search Archive entries" />
      </label>
      {candidates.length ? (
        <ul className="mt-1 sheet divide-y divide-line" role="listbox" aria-label="Matching entries">
          {candidates.map((c) => (
            <li key={c.id}>
              <button type="button" role="option" aria-selected={false} className="w-full text-left px-3 py-2 hover:bg-paper-3 flex items-baseline justify-between gap-3" onClick={() => add(c)}>
                <span className="serif text-[15px] text-ink">{c.title}</span>
                <span className="text-[11px] text-ink-4 uppercase tracking-[0.08em]">{DOMAIN_LABEL[c.domain]}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : q.trim() ? <p className="text-[12px] text-ink-4 mt-1">Nothing matches.</p> : null}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Reconstruct from memory                                               */
/* ------------------------------------------------------------------ */

function Reconstruct({ item, onDone, inSession, onFinish }: { item: ReadingItem; onDone: () => void; inSession: boolean; onFinish: () => Promise<boolean> }) {
  const { db } = useStudy();
  const { sessionId } = useSessionItem();
  const aiStatus = useAIStatus();
  const points = useMemo(() => reconstructionPoints(item), [item]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ cov: ExplainResult; score: number; feedback?: string; errors?: string[]; ai: boolean } | null>(null);
  const started = useRef(0);
  useEffect(() => {
    started.current = performance.now();
  }, []);

  async function compare() {
    if (wordCount(text) < 12 || busy) return;
    setBusy(true);
    const cov = explainCoverage(text, points);
    let score = cov.ratio;
    let feedback: string | undefined;
    let errors: string[] | undefined;
    let usedAi = false;
    if (aiStatus.configured) {
      const res = await ai.call("evaluateRecall", { keyPoints: points, material: points.join(" "), reconstruction: text });
      if (res.ok) {
        usedAi = true;
        feedback = res.data.feedback;
        errors = res.data.errors;
        score = blendScore(cov.ratio, res.data.score);
      }
    }
    const latencyMs = started.current ? Math.round(performance.now() - started.current) : undefined;
    await recordEvidence(db, {
      subskill: "memory.reconstruction",
      score,
      difficulty: 4,
      format: "free",
      source: { kind: "reading", refId: item.id, label: item.title },
      latencyMs,
      sessionId: sessionId ?? undefined,
      note: `${cov.covered.length}/${points.length} points`,
    });
    await db.store("reading_items").update(item.id, { reconstruction: text, reconstructionAt: new Date().toISOString() });
    detectRedThreads(db).catch(() => {});
    setResult({ cov, score, feedback, errors, ai: usedAi });
    setBusy(false);
  }

  if (result) {
    return (
      <section className="anim-place space-y-6" aria-label="Reconstruction result">
        <div className="flex items-end justify-between gap-6 border-t border-ink pt-4">
          <div>
            <div className="eyebrow">Points recovered</div>
            <div className="numeral text-[30px] text-ink mt-1 leading-none">{result.cov.covered.length} / {points.length}</div>
          </div>
          <div className="text-right">
            <div className="eyebrow">{result.score >= 0.6 ? "Held" : "Slipping"}</div>
            <div className="text-[12px] text-ink-3 mt-1 numeral">{Math.round(result.score * 100)}% {result.ai ? "· model + coverage" : "· coverage"}</div>
          </div>
        </div>
        {result.feedback ? <p className="serif text-[18px] text-ink-2">{result.feedback}</p> : null}
        <ul className="space-y-2">
          {result.cov.points.map((p) => (
            <li key={p.point} className={cx("pl-3 border-l serif text-[17px] leading-snug", p.covered ? "border-forest text-ink" : "border-wine text-ink-2")}>{p.point}</li>
          ))}
        </ul>
        {result.errors?.length ? (
          <div>
            <div className="eyebrow mb-1">Stated but not in your notes</div>
            <ul className="text-[14px] text-ink-2 space-y-1">{result.errors.slice(0, 3).map((e) => <li key={e}>{e}</li>)}</ul>
          </div>
        ) : null}
        <div>
          <div className="eyebrow mb-1">What you wrote</div>
          <p className="serif text-[16px] text-ink-2 whitespace-pre-wrap leading-snug">{text}</p>
        </div>
        <p className="text-[13px] text-ink-3">{result.score >= 0.6 ? "The argument survived the night. Come back in a week and try again without reading first." : "Read the missing sentences once more, then rebuild it again tomorrow. The second attempt is the one that sticks."}</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={onDone}>Back to the notes</Button>
          <Button variant="ghost" onClick={() => { setResult(null); setText(""); started.current = performance.now(); }}>Try again</Button>
          {inSession ? <Button variant="wine" className="ml-auto" onClick={() => onFinish()}>Continue today&apos;s session</Button> : null}
        </div>
        {!result.ai ? <p className="text-[12px] text-ink-4">Deterministic review — connect a model in Settings for a deeper read.</p> : null}
      </section>
    );
  }

  return (
    <section className="anim-place" aria-label="Reconstruct from memory">
      <div className="border-t border-ink pt-4">
        <div className="eyebrow">Reconstruct from memory</div>
        <p className="serif text-[21px] text-ink leading-snug mt-2">The notes are closed. What was the argument of <em>{item.title}</em>, and what did the author show to make it?</p>
        <p className="text-[13px] text-ink-3 mt-2">Compared against the {plural(points.length, "sentence")} you wrote under key idea, argument and evidence. Structure matters more than wording.</p>
      </div>
      <div className="mt-5">
        <TextArea label="From memory" serif rows={10} value={text} onChange={(e) => setText(e.target.value)} autoFocus placeholder="Start with the claim. Then how the author gets there. Then what they showed." onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void compare(); }} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button size="lg" disabled={busy || wordCount(text) < 12} onClick={compare}>{busy ? "Comparing…" : "Compare"}</Button>
        <Button variant="ghost" onClick={onDone}>Not now</Button>
        <span className="text-[12px] text-ink-4 numeral ml-auto">{wordCount(text)} words · Ctrl/⌘ Enter</span>
      </div>
      {!aiStatus.configured && !aiStatus.loading ? <p className="mt-3 text-[12px] text-ink-4">Deterministic review — connect a model in Settings for a deeper read.</p> : null}
    </section>
  );
}
