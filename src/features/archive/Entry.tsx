"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useStudy, useStudyQuery } from "@/lib/persistence/provider";
import { stamp } from "@/lib/persistence/store";
import type { ArchiveEntry, ArchiveProgress } from "@/lib/domain/types";
import { ai, useAIStatus } from "@/lib/ai/client";
import { recordError, recordEvidence } from "@/lib/services/evidence";
import { createMemoryItem } from "@/lib/services/memory";
import { detectRedThreads } from "@/lib/adaptation/red-thread";
import { useSessionItem } from "@/lib/services/session-context";
import { Button, Empty, HairlineProgress, TextArea } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { cx, minutes, plural } from "@/lib/util/format";
import { wordCount } from "@/lib/scoring/text";
import { DOMAIN_LABEL, KIND_LABEL, eraLabel, knowledgeSubskill, pathProgress, statusRank } from "@/lib/archive/entries";
import { blendScore, explainCoverage, type ExplainResult } from "@/lib/archive/scoring";
import { ArchiveHeader, EntryRow, STATUS_LABEL, StatusMark, useArchive, type ArchiveData } from "./shared";
import { Connections } from "./Connections";
import { Notes } from "./Notes";

export function Entry({ id }: { id: string }) {
  const data = useArchive();
  const entry = data.byId.get(id);
  if (data.loading && !entry) return <div className="page" />;
  if (!entry) {
    return (
      <div className="page">
        <ArchiveHeader title="Not in the Archive" />
        <Empty title="There is no entry with that name yet." body="Ask the Archive from the index and a model can write one; or start from something that is already here." action={<Link href="/v1/archive" className="btn btn-secondary">Back to the Archive</Link>} />
      </div>
    );
  }
  if (entry.kind === "path") return <PathView entry={entry} data={data} />;
  return <EntryView key={entry.id} entry={entry} data={data} />;
}

/* ------------------------------------------------------------------ */
/* Reading                                                              */
/* ------------------------------------------------------------------ */

function EntryView({ entry, data }: { entry: ArchiveEntry; data: ArchiveData }) {
  const { db } = useStudy();
  const { inSession, finish } = useSessionItem();
  const progress = data.progress.get(entry.id);
  const status = progress?.status ?? "unread";
  const marked = useRef(false);

  // Mark as read on open; promote to retained when linked memory items have survived long intervals.
  useEffect(() => {
    if (data.loading || marked.current) return;
    marked.current = true;
    (async () => {
      const store = db.store("archive_progress");
      const existing = (await store.list({ where: { entryId: entry.id } as Partial<ArchiveProgress> }))[0];
      if (!existing) {
        await store.put(stamp<ArchiveProgress>(db.userId, "aprog", { entryId: entry.id, status: "read", readAt: new Date().toISOString(), memoryItemIds: [], timesUsed: 0 }));
        return;
      }
      const patch: Partial<ArchiveProgress> = {};
      if (existing.status === "unread") {
        patch.status = "read";
        patch.readAt = new Date().toISOString();
      } else if (existing.status === "understood" && existing.memoryItemIds.length) {
        const items = await db.store("memory_items").list({ filter: (m) => existing.memoryItemIds.includes(m.id) });
        if (items.length && items.every((m) => m.reps >= 2 && m.intervalDays >= 7 && m.lapses === 0)) patch.status = "retained";
      }
      if (!existing.readAt) patch.readAt = new Date().toISOString();
      if (Object.keys(patch).length) await store.update(existing.id, patch);
    })().catch(() => {});
  }, [db, entry.id, data.loading]);

  const siblings = useMemo(() => data.entries.filter((e) => e.kind !== "path" && e.domain === entry.domain), [data.entries, entry.domain]);
  const idx = siblings.findIndex((e) => e.id === entry.id);
  const prev = idx > 0 ? siblings[idx - 1] : undefined;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : undefined;
  const era = eraLabel(entry);
  const connected = data.edges.filter((e) => e.from === entry.id || e.to === entry.id);
  const userConnected = connected.some((e) => e.user);

  return (
    <div className="page">
      <ArchiveHeader
        eyebrow={
          <>
            {KIND_LABEL[entry.kind]} · {DOMAIN_LABEL[entry.domain]}
            {era ? ` · ${era}` : ""}
            {entry.origin === "generated" ? " · generated" : ""}
          </>
        }
        title={entry.title}
        lede={entry.subtitle ? <span className="serif italic text-[18px] text-ink-2">{entry.subtitle}</span> : undefined}
      >
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-ink-3">
          <span className="inline-flex items-center gap-2"><StatusMark status={status} /> {STATUS_LABEL[status]}</span>
          <span className="numeral">{minutes(entry.readingMinutes)} read</span>
          {inSession ? <span className="mark"><span className="mark-dot" /> Today&apos;s session</span> : null}
        </div>
      </ArchiveHeader>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,680px)_300px] gap-x-16 gap-y-12">
        <article className="reading-column min-w-0">
          <p className="serif text-[21px] leading-snug text-ink-2 mb-8">{entry.summary}</p>
          <div className="prose-study">
            <Section title="What is it?" text={entry.what} />
            <Section title="Why does it matter?" text={entry.why} />
            <Section title="What came before?" text={entry.before} />
            <Section title="What came after?" text={entry.after} />
            <Section title="What does it connect to?" text={entry.connects} />
            <h3>What should you remember?</h3>
            <ol className="list-none p-0 m-0 space-y-3">
              {entry.remember.map((r, i) => (
                <li key={i} className="flex gap-4">
                  <span className="mono text-[12px] text-ink-4 pt-1.5 shrink-0 w-4">{i + 1}</span>
                  <span>{r}</span>
                </li>
              ))}
            </ol>
          </div>

          <ExplainAndKeep entry={entry} progress={progress} inSession={inSession} onFinish={finish} />

          <nav className="mt-14 border-t border-line pt-5 flex items-start justify-between gap-6 text-[13px]" aria-label="Neighbouring entries">
            {prev ? (
              <Link href={`/v1/archive/${prev.id}`} className="group min-w-0">
                <span className="eyebrow block">Previous · {DOMAIN_LABEL[prev.domain]}</span>
                <span className="serif text-[17px] text-ink-2 group-hover:text-ink inline-flex items-center gap-1.5"><I.ArrowLeft size={12} /> {prev.title}</span>
              </Link>
            ) : <span />}
            {next ? (
              <Link href={`/v1/archive/${next.id}`} className="group min-w-0 text-right">
                <span className="eyebrow block">Next · {DOMAIN_LABEL[next.domain]}</span>
                <span className="serif text-[17px] text-ink-2 group-hover:text-ink inline-flex items-center gap-1.5">{next.title} <I.ArrowRight size={12} /></span>
              </Link>
            ) : <span />}
          </nav>
        </article>

        <aside className="space-y-10 min-w-0">
          <Strip status={status} progress={progress} connected={userConnected || connected.length > 0} userConnected={userConnected} />
          <Connections entry={entry} data={data} />
          <Notes entryId={entry.id} />
        </aside>
      </div>
    </div>
  );
}

function Section({ title, text }: { title: string; text: string }) {
  const paras = text.split(/\n\s*\n/).filter((p) => p.trim());
  return (
    <>
      <h3>{title}</h3>
      {paras.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Discover → Understand → Connect → Retrieve → Use                      */
/* ------------------------------------------------------------------ */

function Strip({ status, progress, connected, userConnected }: { status: ArchiveProgress["status"]; progress?: ArchiveProgress; connected: boolean; userConnected: boolean }) {
  const rank = statusRank(status);
  const steps: { label: string; done: boolean; note?: string }[] = [
    { label: "Discover", done: rank >= 1, note: progress?.readAt ? "opened" : undefined },
    { label: "Understand", done: rank >= 2, note: progress?.explanationScore !== undefined ? `${Math.round(progress.explanationScore * 100)}%` : undefined },
    { label: "Connect", done: userConnected, note: userConnected ? "yours" : connected ? "seeded" : undefined },
    { label: "Retrieve", done: rank >= 3, note: progress?.memoryItemIds.length ? `${progress.memoryItemIds.length} kept` : undefined },
    { label: "Use", done: (progress?.timesUsed ?? 0) > 0, note: progress?.timesUsed ? `${progress.timesUsed}×` : undefined },
  ];
  return (
    <ol className="flex items-start justify-between gap-1 border-t border-ink pt-3" aria-label="Progress with this entry">
      {steps.map((s) => (
        <li key={s.label} className="min-w-0 flex-1">
          <span className={cx("block text-[9px] tracking-[0.06em] uppercase whitespace-nowrap", s.done ? "text-ink" : "text-ink-4")}>{s.label}</span>
          <span className={cx("block mt-1.5 h-[2px] w-full", s.done ? "bg-ink" : "bg-line")} />
          <span className="block mt-1 text-[10px] text-ink-4 numeral truncate">{s.note ?? " "}</span>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* Explain it back · Save to Memory · Test me later                     */
/* ------------------------------------------------------------------ */

function ExplainAndKeep({ entry, progress, inSession, onFinish }: { entry: ArchiveEntry; progress?: ArchiveProgress; inSession: boolean; onFinish: () => Promise<boolean> }) {
  const { db } = useStudy();
  const { sessionId } = useSessionItem();
  const aiStatus = useAIStatus();
  const [mode, setMode] = useState<"idle" | "explain" | "result">("idle");
  const [text, setText] = useState(progress?.explanation ?? "");
  const [result, setResult] = useState<{ cov: ExplainResult; score: number; feedback?: string; errors?: string[]; ai: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [kept, setKept] = useState<"saved" | "scheduled" | null>(null);
  const startRef = useRef(0);
  const linked = useStudyQuery((db) => (progress?.memoryItemIds.length ? db.store("memory_items").list({ filter: (m) => progress.memoryItemIds.includes(m.id) }) : Promise.resolve([])), ["memory_items"], [progress?.memoryItemIds.join("|")]);

  async function submit() {
    if (wordCount(text) < 12 || busy) return;
    setBusy(true);
    const cov = explainCoverage(text, entry.remember);
    let feedback: string | undefined;
    let errors: string[] | undefined;
    let score = cov.ratio;
    let usedAi = false;
    if (aiStatus.configured) {
      const res = await ai.call("evaluateRecall", { keyPoints: entry.remember, reconstruction: text });
      if (res.ok) {
        usedAi = true;
        feedback = res.data.feedback;
        errors = res.data.errors;
        score = blendScore(cov.ratio, res.data.score);
      }
    }
    const latencyMs = startRef.current ? Math.round(performance.now() - startRef.current) : undefined;
    const source = { kind: "archive" as const, refId: entry.id, label: entry.title };
    const difficulty = entry.readingMinutes >= 6 ? 4 : 3;
    await recordEvidence(db, { subskill: knowledgeSubskill(entry.domain), score, difficulty, format: "free", source, latencyMs, sessionId: sessionId ?? undefined, note: `${cov.covered.length}/${entry.remember.length} points` });
    if (entry.kind === "concept") await recordEvidence(db, { subskill: "knowledge.connections", score, difficulty, format: "free", source, sessionId: sessionId ?? undefined });
    await recordEvidence(db, { subskill: "memory.reconstruction", score, difficulty, format: "free", source, latencyMs, sessionId: sessionId ?? undefined });
    if (score < 0.4) await recordError(db, { type: "MEMORY_FAILURE", subskill: knowledgeSubskill(entry.domain), source, detail: `Explained ${entry.title} back with ${cov.covered.length} of ${entry.remember.length} key points.`, sessionId: sessionId ?? undefined });
    const store = db.store("archive_progress");
    const existing = (await store.list({ where: { entryId: entry.id } as Partial<ArchiveProgress> }))[0];
    const patch: Partial<ArchiveProgress> = { explainedAt: new Date().toISOString(), explanation: text, explanationScore: score };
    if (score >= 0.6 && (!existing || statusRank(existing.status) < 2)) patch.status = "understood";
    if (existing) await store.update(existing.id, patch);
    else await store.put(stamp<ArchiveProgress>(db.userId, "aprog", { entryId: entry.id, status: score >= 0.6 ? "understood" : "read", readAt: new Date().toISOString(), memoryItemIds: [], timesUsed: 0, ...patch }));
    detectRedThreads(db).catch(() => {});
    setResult({ cov, score, feedback, errors, ai: usedAi });
    setMode("result");
    setBusy(false);
  }

  async function keep(kind: "saved" | "scheduled") {
    setBusy(true);
    const ids: string[] = [];
    for (const r of entry.recall) {
      const item = await createMemoryItem(db, { kind: "archive", prompt: r.prompt, answer: r.answer, sourceRef: { kind: "archive", refId: entry.id, label: entry.title }, dueInDays: 1, tags: [entry.domain, entry.kind] });
      ids.push(item.id);
    }
    const store = db.store("archive_progress");
    const existing = (await store.list({ where: { entryId: entry.id } as Partial<ArchiveProgress> }))[0];
    const merged = [...new Set([...(existing?.memoryItemIds ?? []), ...ids])];
    if (existing) await store.update(existing.id, { memoryItemIds: merged });
    else await store.put(stamp<ArchiveProgress>(db.userId, "aprog", { entryId: entry.id, status: "read", readAt: new Date().toISOString(), memoryItemIds: merged, timesUsed: 0 }));
    setKept(kind);
    setBusy(false);
  }

  const keptCount = progress?.memoryItemIds.length ?? 0;
  const soonest = (linked.data ?? []).map((m) => m.due).sort()[0];

  return (
    <section className="mt-12 border-t border-ink pt-6" aria-label="Explain and keep">
      {mode === "idle" ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" onClick={() => { startRef.current = performance.now(); setMode("explain"); }}>
            Explain it back
          </Button>
          <Button variant="secondary" disabled={busy} onClick={() => keep("saved")}>{keptCount ? "Saved to Memory" : "Save to Memory"}</Button>
          <Button variant="ghost" disabled={busy} onClick={() => keep("scheduled")}>Test me later</Button>
          {kept === "saved" || (keptCount && !kept) ? <span className="text-[12px] text-ink-3">{plural(keptCount || entry.recall.length, "prompt")} in the palace{soonest ? `, first due ${new Date(soonest).toLocaleDateString(undefined, { month: "short", day: "numeric" })}` : ""}. <Link href="/v1/memory/review" className="underline underline-offset-4 hover:text-ink">Review</Link></span> : null}
          {kept === "scheduled" ? <span className="text-[12px] text-ink-3">Scheduled. The palace will ask tomorrow. <Link href="/v1/memory" className="underline underline-offset-4 hover:text-ink">Memory Palace</Link></span> : null}
          {progress?.explanationScore !== undefined && !kept ? <span className="text-[12px] text-ink-4 numeral ml-auto">Last explanation {Math.round(progress.explanationScore * 100)}%</span> : null}
        </div>
      ) : null}

      {mode === "explain" ? (
        <div className="anim-place">
          <p className="serif text-[20px] text-ink mb-1">Close the page in your head. What is it, why does it matter, what does it connect to?</p>
          <p className="text-[13px] text-ink-3 mb-4">Scored against the {entry.remember.length} points above. Structure matters more than wording.</p>
          <TextArea label="In your own words" serif rows={8} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void submit(); }} autoFocus placeholder="Start with the one thing you would tell someone who had never heard of it." />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button size="lg" disabled={busy || wordCount(text) < 12} onClick={submit}>{busy ? "Comparing…" : "Compare"}</Button>
            <Button variant="ghost" onClick={() => setMode("idle")}>Not now</Button>
            <span className="text-[12px] text-ink-4 numeral ml-auto">{wordCount(text)} words · Ctrl/⌘ Enter</span>
          </div>
          {!aiStatus.configured && !aiStatus.loading ? <p className="mt-3 text-[12px] text-ink-4">Deterministic review — connect a model in Settings for a deeper read.</p> : null}
        </div>
      ) : null}

      {mode === "result" && result ? (
        <div className="anim-place space-y-6">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="eyebrow">Key points recovered</div>
              <div className="numeral text-[30px] text-ink mt-1 leading-none">{result.cov.covered.length} / {entry.remember.length}</div>
            </div>
            <div className="text-right">
              <div className="eyebrow">{result.score >= 0.6 ? "Understood" : "Read, not yet understood"}</div>
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
              <div className="eyebrow mb-1">Stated but not in the entry</div>
              <ul className="text-[14px] text-ink-2 space-y-1">{result.errors.slice(0, 3).map((e) => <li key={e}>{e}</li>)}</ul>
            </div>
          ) : null}
          <p className="text-[13px] text-ink-3">{result.score >= 0.6 ? "Keep it: the prompts below will be asked tomorrow, then at widening intervals." : "Read the missing points again, then try once more. One more pass now is worth three later."}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant={result.score >= 0.6 ? "primary" : "secondary"} disabled={busy} onClick={() => keep("saved")}>{kept ? "Saved to Memory" : "Save to Memory"}</Button>
            <Button variant="ghost" onClick={() => setMode("explain")}>Try again</Button>
            {inSession ? <Button variant="wine" className="ml-auto" onClick={() => onFinish()}>Continue today&apos;s session</Button> : null}
          </div>
          {!result.ai ? <p className="text-[12px] text-ink-4">Deterministic review — connect a model in Settings for a deeper read.</p> : null}
        </div>
      ) : null}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Paths                                                                */
/* ------------------------------------------------------------------ */

function PathView({ entry, data }: { entry: ArchiveEntry; data: ArchiveData }) {
  const ids = entry.pathEntries ?? [];
  const items = ids.map((id) => data.byId.get(id)).filter((e): e is ArchiveEntry => !!e);
  const pr = pathProgress(entry, data.progress);
  const nextUp = items.find((e) => statusRank(data.progress.get(e.id)?.status ?? "unread") === 0) ?? items[0];
  return (
    <div className="page">
      <ArchiveHeader eyebrow={<>Path · {plural(items.length, "entry", "entries")}</>} title={entry.title} lede={entry.summary} aside={nextUp ? <Link href={`/v1/archive/${nextUp.id}`} className="btn btn-lg">{pr.done ? "Continue the path" : "Begin the path"} <I.ArrowRight size={14} /></Link> : null}>
        <div className="mt-5 max-w-[420px]">
          <div className="flex justify-between text-[12px] text-ink-3 mb-2"><span>Read</span><span className="numeral">{pr.done} / {pr.total}</span></div>
          <HairlineProgress value={pr.total ? pr.done / pr.total : 0} />
        </div>
      </ArchiveHeader>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,680px)_300px] gap-x-16 gap-y-10">
        <div className="reading-column">
          <div className="prose-study mb-10">
            <Section title="Why this order?" text={entry.what} />
            <Section title="What you will be able to do" text={entry.why} />
          </div>
          <ol className="border-t border-line-2">
            {items.map((e, i) => (
              <li key={e.id} className="border-b border-line flex items-start gap-4">
                <span className="mono text-[12px] text-ink-4 pt-4 w-6 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <div className="flex-1 min-w-0"><EntryRow entry={e} status={data.progress.get(e.id)?.status ?? "unread"} meta={<>{KIND_LABEL[e.kind]} · {DOMAIN_LABEL[e.domain]}</>} /></div>
              </li>
            ))}
          </ol>
        </div>
        <aside className="space-y-8">
          <div className="border-t border-ink pt-3">
            <div className="eyebrow">Remember, by the end</div>
            <ul className="mt-2 space-y-2 serif text-[16px] text-ink-2">{entry.remember.map((r) => <li key={r}>{r}</li>)}</ul>
          </div>
          {nextUp ? <Link href={`/v1/archive/${nextUp.id}`} className="btn btn-lg w-full lg:hidden">{pr.done ? "Continue the path" : "Begin the path"}</Link> : null}
        </aside>
      </div>
    </div>
  );
}
