"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useStudy, useStudyQuery } from "@/lib/persistence/provider";
import type { ArchiveEntry, Curiosity, CuriosityView } from "@/lib/domain/types";
import { recordEvidence } from "@/lib/services/evidence";
import { createMemoryItem } from "@/lib/services/memory";
import { detectRedThreads } from "@/lib/adaptation/red-thread";
import { useSessionItem } from "@/lib/services/session-context";
import { Button, Empty, TextArea } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { cx, plural, shortDate } from "@/lib/util/format";
import { DOMAIN_LABEL, matchesQuery, statusOf } from "@/lib/archive/entries";
import { StatusMark, useArchive, type ArchiveData } from "@/features/archive/shared";
import { WHY_MIN_WORDS, firstSentence, hookAsQuestion, neighbours, paragraphs, randomUnseen, readingMinutes, whyFeedback, whyScore, whyWordCount } from "@/lib/cabinet/curiosities";
import { markSeen, updateView } from "@/lib/cabinet/views";
import { BackToCabinet, useCabinet, type CabinetData } from "./shared";

export function CuriosityPage({ id }: { id: string }) {
  const { db } = useStudy();
  const cab = useCabinet();
  const archive = useArchive();
  const c = cab.byId.get(id);
  const cid = c?.id;

  // Mark the view on open (idempotent; a later open only touches updatedAt).
  useEffect(() => {
    if (!cid) return;
    markSeen(db, cid).catch(() => {});
  }, [db, cid]);

  if (!c) {
    if (cab.loading) return <div className="page" />;
    return (
      <div className="page">
        <BackToCabinet />
        <Empty
          title="Nothing in the cabinet by that name."
          body="It may have been generated on another device, or the link is old."
          action={
            <Link href="/v1/cabinet" className="btn btn-secondary">
              The Cabinet
            </Link>
          }
        />
      </div>
    );
  }
  return <Reading c={c} view={cab.views.get(c.id)} cab={cab} archive={archive} />;
}

/* ------------------------------------------------------------------ */
/* The reading page                                                     */
/* ------------------------------------------------------------------ */

interface Connected {
  entry: ArchiveEntry;
  yours: boolean;
}

function Reading({ c, view, cab, archive }: { c: Curiosity; view: CuriosityView | undefined; cab: CabinetData; archive: ArchiveData }) {
  const { db } = useStudy();
  const router = useRouter();
  const params = useSearchParams();
  const { inSession, finish, sessionId } = useSessionItem();
  const fresh = params.get("fresh") === "1";
  const label = DOMAIN_LABEL[c.domain];
  const nb = useMemo(() => neighbours(cab.items, c), [cab.items, c]);
  const paras = useMemo(() => paragraphs(c.body), [c.body]);

  /* Connections: the authored ones, then the user's own. */
  const viewConnected = view?.connectedTo;
  const userIds = useMemo(() => viewConnected ?? [], [viewConnected]);
  const connected = useMemo<Connected[]>(() => {
    const out: Connected[] = [];
    for (const id of c.connects) {
      const entry = archive.byId.get(id);
      if (entry) out.push({ entry, yours: false });
    }
    for (const id of userIds) {
      if (c.connects.includes(id)) continue;
      const entry = archive.byId.get(id);
      if (entry) out.push({ entry, yours: true });
    }
    return out;
  }, [c.connects, userIds, archive.byId]);

  const [q, setQ] = useState("");
  const [freshId, setFreshId] = useState<string | null>(null);
  const [busyConnect, setBusyConnect] = useState(false);
  const candidates = useMemo(() => {
    if (!q.trim()) return [];
    const taken = new Set(connected.map((x) => x.entry.id));
    return archive.entries.filter((e) => e.kind !== "path" && !taken.has(e.id) && matchesQuery(e, q)).slice(0, 6);
  }, [q, archive.entries, connected]);

  async function connect(e: ArchiveEntry) {
    if (busyConnect) return;
    setBusyConnect(true);
    await updateView(db, c.id, { connectedTo: [...userIds.filter((x) => x !== e.id), e.id] });
    setQ("");
    setFreshId(e.id);
    setBusyConnect(false);
  }

  async function disconnect(id: string) {
    await updateView(db, c.id, { connectedTo: userIds.filter((x) => x !== id) });
  }

  /* Why does this matter? — the one place this room writes evidence. */
  const prior = useStudyQuery(
    (db) => db.store("skill_evidence").list({ filter: (e) => e.source.kind === "cabinet" && e.source.refId === c.id && e.subskill === "knowledge.connections", orderBy: "createdAt", desc: true }),
    ["skill_evidence"],
    [c.id],
  );
  const [why, setWhy] = useState("");
  const [whyNote, setWhyNote] = useState<string | null>(null);
  const [busyWhy, setBusyWhy] = useState(false);
  const whyReady = whyWordCount(why) >= WHY_MIN_WORDS;

  async function saveWhy() {
    if (!whyReady || busyWhy) return;
    setBusyWhy(true);
    const text = why.trim();
    const { score, mentioned } = whyScore(text, connected.map((x) => x.entry));
    await recordEvidence(db, {
      subskill: "knowledge.connections",
      score,
      difficulty: 3,
      format: "free",
      source: { kind: "cabinet", refId: c.id, label: c.title },
      sessionId: sessionId ?? undefined,
      note: text.slice(0, 600),
    });
    detectRedThreads(db).catch(() => {});
    setWhyNote(whyFeedback(mentioned));
    setWhy("");
    setBusyWhy(false);
  }

  /* Memory */
  const mem = useStudyQuery((db) => db.store("memory_items").list({ filter: (m) => m.sourceRef?.kind === "cabinet" && m.sourceRef.refId === c.id }), ["memory_items"], [c.id]);
  const kept = (mem.data?.length ?? 0) > 0;
  const [busyMem, setBusyMem] = useState(false);

  async function keep() {
    if (kept || busyMem) return;
    setBusyMem(true);
    await createMemoryItem(db, {
      kind: "fact",
      prompt: hookAsQuestion(c.hook),
      answer: firstSentence(c.body),
      sourceRef: { kind: "cabinet", refId: c.id, label: c.title },
      tags: [c.domain, "cabinet"],
      dueInDays: 1,
    });
    setBusyMem(false);
  }

  function strange() {
    const pick = randomUnseen(cab.items, cab.views, Math.random, c.id);
    if (pick) router.push(`/v1/cabinet/${pick.id}`);
  }

  return (
    <div className="page">
      <BackToCabinet
        right={
          inSession ? (
            <span className="mark">
              <span className="mark-dot" /> Today&apos;s session
            </span>
          ) : null
        }
      />
      <div className="lg:grid lg:grid-cols-[minmax(0,680px)_280px] lg:gap-x-16">
        {/* The text */}
        <article className="reading-column">
          <div className="eyebrow eyebrow-wine">
            {label} · <span className="numeral">{nb.index + 1}</span> of <span className="numeral">{nb.total}</span>
            {c.origin === "generated" ? " · generated" : ""}
          </div>
          <h1 className="display text-[32px] md:text-[42px] mt-2 text-ink">{c.title}</h1>
          <p className="serif text-[20px] md:text-[22px] text-ink-2 leading-snug mt-5 pl-4 border-l-2 border-brass">{c.hook}</p>
          <p className="text-[12px] text-ink-4 mt-4">About {plural(readingMinutes(c.body), "minute")}</p>
          <div className="prose-study mt-8">
            {paras.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {fresh ? <p className="mt-6 text-[12px] text-ink-4">Written by the connected model just now and kept in this cabinet. Check anything you intend to repeat.</p> : null}
        </article>

        {/* Where it connects */}
        <aside className="lg:row-span-2 mt-12 lg:mt-0 lg:sticky lg:top-10 self-start space-y-8">
          <section aria-labelledby="connects-eyebrow">
            <div className="flex items-baseline justify-between border-t border-ink pt-3 mb-1">
              <span id="connects-eyebrow" className="eyebrow">
                Where it connects
              </span>
              <span className="numeral text-[11px] text-ink-4">{connected.length}</span>
            </div>
            <ul className="divide-y divide-line">
              {connected.map(({ entry, yours }) => (
                <li key={entry.id} className={cx("py-2.5 group", entry.id === freshId && "anim-place")}>
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/v1/archive/${entry.id}`} className="min-w-0 block">
                      <span className="text-[11px] tracking-[0.08em] uppercase text-ink-3 block">
                        {DOMAIN_LABEL[entry.domain]}
                        {yours ? " · yours" : ""}
                      </span>
                      <span className="serif text-[17px] text-ink group-hover:text-ink-2 leading-snug block">{entry.title}</span>
                    </Link>
                    <span className="flex items-center gap-2 shrink-0 mt-1.5">
                      <StatusMark status={statusOf(archive.progress, entry.id)} />
                      {yours ? (
                        <button type="button" className="btn btn-ghost btn-sm !h-6 !px-1 opacity-0 group-hover:opacity-100 focus:opacity-100 text-ink-3" aria-label={`Remove connection to ${entry.title}`} onClick={() => disconnect(entry.id)}>
                          <I.Close size={12} />
                        </button>
                      ) : null}
                    </span>
                  </div>
                </li>
              ))}
              {!connected.length ? <li className="py-3 text-[13px] text-ink-3">Nothing in the Archive matches yet.</li> : null}
            </ul>
          </section>

          <section aria-labelledby="connect-eyebrow">
            <label className="block">
              <span id="connect-eyebrow" className="eyebrow block mb-1.5">
                Connect this to something you know
              </span>
              <input className="field" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the Archive" autoComplete="off" />
            </label>
            {candidates.length ? (
              <ul className="mt-1 sheet divide-y divide-line" role="listbox" aria-label="Matching entries">
                {candidates.map((e) => (
                  <li key={e.id}>
                    <button type="button" role="option" aria-selected={false} className="w-full text-left px-3 py-2 hover:bg-paper-3 flex items-baseline justify-between gap-3" onClick={() => connect(e)} disabled={busyConnect}>
                      <span className="serif text-[15px] text-ink">{e.title}</span>
                      <span className="text-[11px] text-ink-4 uppercase tracking-[0.08em]">{e.domain}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : q.trim() ? (
              <p className="mt-2 text-[12px] text-ink-4">Nothing in the Archive matches &ldquo;{q.trim()}&rdquo;.</p>
            ) : null}
          </section>

          <section className="border-t border-line-2 pt-4" aria-labelledby="keep-eyebrow">
            <div id="keep-eyebrow" className="eyebrow mb-2">
              Keep it
            </div>
            <Button variant="secondary" size="sm" onClick={keep} disabled={kept || busyMem || mem.loading}>
              {kept ? (
                <>
                  <I.Check size={12} /> In Memory
                </>
              ) : (
                <>
                  <I.Memory size={12} /> Save to Memory
                </>
              )}
            </Button>
            <p className="mt-2 text-[12px] text-ink-4" role="status">
              {kept ? "A recall prompt is due tomorrow." : "The hook becomes a recall prompt; the first sentence is the answer."}
            </p>
          </section>
        </aside>

        {/* Your part */}
        <section className="reading-column mt-12 space-y-10">
          <section aria-label="Why it matters" className="border-t border-ink pt-4">
            <TextArea
              label="Why does this matter?"
              serif
              rows={2}
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              placeholder="One line. What it explains, or what it changes about something you already knew."
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void saveWhy();
              }}
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Button variant={inSession ? "secondary" : "primary"} onClick={saveWhy} disabled={!whyReady || busyWhy}>
                Record
              </Button>
              <span className="text-[11px] text-ink-4">Ctrl/⌘ Enter</span>
            </div>
            {whyNote ? (
              <p className="mt-3 border-l-2 border-forest pl-4 py-1 text-[15px] serif text-ink" role="status">
                {whyNote}
              </p>
            ) : null}
            {prior.data?.length ? (
              <ul className="mt-4 space-y-2" aria-label="Earlier answers">
                {prior.data.slice(0, 3).map((e) => (
                  <li key={e.id} className="flex gap-3 text-[14px] serif text-ink-2 leading-snug">
                    <span className="numeral text-[11px] text-ink-4 pt-1 shrink-0 w-14">{shortDate(e.createdAt)}</span>
                    <span>{e.note}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          <NoteField key={view?.id ?? "none"} initial={view?.note ?? ""} onSave={(text) => updateView(db, c.id, { note: text || undefined }).then(() => undefined)} />

          <nav aria-label="Neighbours" className="border-t border-line-2 pt-5 grid grid-cols-2 gap-6">
            {nb.total <= 1 ? (
              <p className="col-span-2 text-[12px] text-ink-4">The only one in {label} so far.</p>
            ) : (
              <>
                <div>
                  {nb.prev ? (
                    <Link href={`/v1/cabinet/${nb.prev.id}`} className="group block">
                      <span className="eyebrow block">Previous in {label}</span>
                      <span className="serif text-[17px] text-ink group-hover:text-ink-2 leading-snug block mt-1">{nb.prev.title}</span>
                    </Link>
                  ) : (
                    <span className="eyebrow text-ink-4">First in {label}</span>
                  )}
                </div>
                <div className="text-right">
                  {nb.next ? (
                    <Link href={`/v1/cabinet/${nb.next.id}`} className="group block">
                      <span className="eyebrow block">Next in {label}</span>
                      <span className="serif text-[17px] text-ink group-hover:text-ink-2 leading-snug block mt-1">{nb.next.title}</span>
                    </Link>
                  ) : (
                    <span className="eyebrow text-ink-4">Last in {label}</span>
                  )}
                </div>
              </>
            )}
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            {inSession ? (
              <Button size="lg" onClick={() => finish()}>
                Done <I.Check size={14} />
              </Button>
            ) : (
              <Button variant="secondary" onClick={strange}>
                Something else strange
              </Button>
            )}
            <Link href="/v1/cabinet" className="btn btn-ghost">
              The Cabinet
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Personal note, saved when the field loses focus                      */
/* ------------------------------------------------------------------ */

function NoteField({ initial, onSave }: { initial: string; onSave: (text: string) => Promise<void> }) {
  const [text, setText] = useState(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");

  async function blur() {
    if (text.trim() === initial.trim()) return;
    setState("saving");
    await onSave(text.trim());
    setState("saved");
  }

  return (
    <section aria-label="Personal note">
      <TextArea
        label="Your note"
        serif
        rows={3}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (state !== "idle") setState("idle");
        }}
        onBlur={blur}
        placeholder="What this reminded you of, what you doubt, what to look up."
      />
      <p className="mt-1.5 text-[11px] text-ink-4 h-4" role="status">
        {state === "saved" ? "Saved" : state === "saving" ? "Saving" : initial ? "Saved on leaving the field" : ""}
      </p>
    </section>
  );
}
