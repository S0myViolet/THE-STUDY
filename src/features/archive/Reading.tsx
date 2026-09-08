"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useStudy, useStudyQuery } from "@/lib/persistence/provider";
import { stamp } from "@/lib/persistence/store";
import type { ReadingItem, ReadingKind, ReadingStatus } from "@/lib/domain/types";
import { Button, Dialog, Empty, Field, Select, TextArea } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { cx, plural, shortDate } from "@/lib/util/format";
import { NOTE_FIELDS, READING_KINDS, READING_KIND_LABEL, READING_STATUSES, READING_STATUS_BLURB, READING_STATUS_LABEL, SPINE_TONES, shelfOrder, spineFor } from "@/lib/archive/reading";
import { ArchiveHeader } from "./shared";

const EMPTY_TITLE = "No books yet. What are you reading, or pretending to read?";

export function Reading() {
  const items = useStudyQuery((db) => db.store("reading_items").list({ orderBy: "updatedAt", desc: true }), ["reading_items"]);
  const [adding, setAdding] = useState(false);
  const [fresh, setFresh] = useState<string | null>(null);
  const list = useMemo(() => [...(items.data ?? [])].sort(shelfOrder), [items.data]);
  const byStatus = useMemo(() => {
    const m = new Map<ReadingStatus, ReadingItem[]>();
    for (const s of READING_STATUSES) m.set(s, []);
    for (const it of list) m.get(it.status)!.push(it);
    return m;
  }, [list]);

  const addButton = (
    <Button onClick={() => setAdding(true)}>
      <I.Plus size={14} /> Add a book
    </Button>
  );

  return (
    <div className="page">
      <ArchiveHeader eyebrow="The Archive · Bookshelf" title="Bookshelf" lede={list.length ? <>What you are reading, what is next, what you finished and what you keep to consult. {plural(list.length, "item")}, {byStatus.get("finished")!.length} finished.</> : "What you are reading, what is next, what you finished and what you keep to consult. Notes are structured so that a book can be rebuilt from memory later."} aside={list.length ? <div className="hidden md:block">{addButton}</div> : undefined} />

      {list.length ? <div className="md:hidden mb-6">{addButton}</div> : null}

      {!list.length && !items.loading ? (
        <Empty title={EMPTY_TITLE} body="Books, articles, papers, essays, reports. Each gets a page with a question to read for, structured notes, and a reconstruction exercise." action={addButton} />
      ) : null}

      {list.length ? (
        <>
          <Shelf items={list} fresh={fresh} />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {READING_STATUSES.map((s) => {
              const group = byStatus.get(s)!;
              return (
                <section key={s} aria-label={READING_STATUS_LABEL[s]}>
                  <div className="flex items-baseline justify-between border-b border-line-2 pb-2 mb-1">
                    <span className="eyebrow">{READING_STATUS_LABEL[s]}</span>
                    <span className="numeral text-[11px] text-ink-4">{group.length || ""}</span>
                  </div>
                  {group.length ? (
                    <ul className="divide-y divide-line">
                      {group.map((it) => (
                        <li key={it.id}>
                          <Link href={`/v1/archive/reading/${it.id}`} className="group flex items-start justify-between gap-4 py-3 -mx-2 px-2 rounded-sm hover:bg-paper-3">
                            <span className="min-w-0">
                              <span className="eyebrow block">{READING_KIND_LABEL[it.kind]}{it.author ? ` · ${it.author}` : ""}</span>
                              <span className="serif text-[19px] text-ink group-hover:text-ink-2 block leading-snug">{it.title}</span>
                              {it.question ? <span className="block text-[13px] text-ink-3 mt-0.5 truncate">{it.question}</span> : it.why ? <span className="block text-[13px] text-ink-3 mt-0.5 truncate">{it.why}</span> : null}
                            </span>
                            <span className="shrink-0 text-right text-[11px] text-ink-4 numeral pt-1.5">
                              {notesCount(it) ? `${notesCount(it)} / ${NOTE_FIELDS.length} notes` : s === "finished" && it.finishedAt ? shortDate(it.finishedAt) : ""}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[13px] text-ink-4 py-3">{READING_STATUS_BLURB[s]}</p>
                  )}
                </section>
              );
            })}
          </div>
        </>
      ) : null}

      <AddDialog
        open={adding}
        onClose={() => setAdding(false)}
        onAdded={(id) => {
          setFresh(id);
          setAdding(false);
        }}
      />
    </div>
  );
}

function notesCount(it: ReadingItem): number {
  return NOTE_FIELDS.filter((f) => (it[f.key] ?? "").trim()).length;
}

/* ------------------------------------------------------------------ */
/* The shelf                                                             */
/* ------------------------------------------------------------------ */

function Shelf({ items, fresh }: { items: ReadingItem[]; fresh: string | null }) {
  return (
    <div className="overflow-x-auto -mx-2 px-2" role="list" aria-label="Spines">
      <div className="inline-flex items-end gap-[3px] min-w-full border-b-2 border-ink pb-0 pt-4 pr-6">
        {items.map((it, i) => {
          const prev = items[i - 1];
          const gap = prev && prev.status !== it.status;
          const sp = spineFor(it);
          return (
            <React.Fragment key={it.id}>
              {gap ? <span className="w-5 shrink-0" aria-hidden /> : null}
              <Link
                href={`/v1/archive/reading/${it.id}`}
                role="listitem"
                title={`${it.title}${it.author ? ` · ${it.author}` : ""} · ${READING_STATUS_LABEL[it.status]}`}
                className={cx("relative shrink-0 flex flex-col items-center justify-between rounded-t-[2px] border border-b-0 border-line-2/60 hover:-translate-y-1 focus-visible:-translate-y-1 transition-transform duration-200 outline-none focus-visible:ring-1 focus-visible:ring-[var(--focus)]", it.id === fresh && "anim-place")}
                style={{ width: sp.width, height: sp.height, background: SPINE_TONES[sp.tone], boxShadow: "inset 2px 0 0 rgba(255,255,255,0.18), inset -3px 0 0 rgba(0,0,0,0.14)" }}
              >
                {sp.band === "top" ? <span className="absolute left-0 right-0 top-2 h-[3px] bg-ink/25" aria-hidden /> : null}
                {sp.band === "bottom" ? <span className="absolute left-0 right-0 bottom-3 h-[3px] bg-ink/25" aria-hidden /> : null}
                <span className="absolute left-0 right-0 top-[18px] bottom-[18px] flex flex-col items-center justify-start overflow-hidden">
                  <span className="serif text-ink text-[12.5px] leading-none whitespace-nowrap overflow-hidden text-ellipsis" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", maxHeight: "100%" }}>
                    {it.title}
                  </span>
                </span>
                {it.status === "finished" ? <span className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-brass" aria-hidden /> : null}
              </Link>
            </React.Fragment>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-ink-4">
        {READING_STATUSES.map((s) => {
          const n = items.filter((i) => i.status === s).length;
          return n ? <span key={s}>{READING_STATUS_LABEL[s]} <span className="numeral">{n}</span></span> : null;
        })}
        <span className="ml-auto">Spines sit by status; a brass dot marks a finished book.</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Add a book                                                            */
/* ------------------------------------------------------------------ */

function AddDialog({ open, onClose, onAdded }: { open: boolean; onClose: () => void; onAdded: (id: string) => void }) {
  const { db } = useStudy();
  const [kind, setKind] = useState<ReadingKind>("book");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [why, setWhy] = useState("");
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState<ReadingStatus>("reading");
  const [busy, setBusy] = useState(false);

  async function submit() {
    const t = title.trim();
    if (!t || busy) return;
    setBusy(true);
    const item = stamp<ReadingItem>(db.userId, "read", {
      kind,
      title: t,
      author: author.trim() || undefined,
      status,
      why: why.trim() || undefined,
      question: question.trim() || undefined,
      connections: [],
    });
    await db.store("reading_items").put(item);
    setTitle("");
    setAuthor("");
    setWhy("");
    setQuestion("");
    setKind("book");
    setStatus("reading");
    setBusy(false);
    onAdded(item.id);
  }

  return (
    <Dialog open={open} onClose={onClose} title="Add a book">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4">
          <Select label="Kind" value={kind} onChange={(e) => setKind(e.target.value as ReadingKind)}>
            {READING_KINDS.map((k) => (
              <option key={k} value={k}>{READING_KIND_LABEL[k]}</option>
            ))}
          </Select>
          <Field label="Title" serif value={title} onChange={(e) => setTitle(e.target.value)} placeholder="The Great Transformation" autoFocus required />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_160px] gap-4">
          <Field label="Author" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Karl Polanyi" />
          <Select label="Shelf" value={status} onChange={(e) => setStatus(e.target.value as ReadingStatus)}>
            {READING_STATUSES.map((s) => (
              <option key={s} value={s}>{READING_STATUS_LABEL[s]}</option>
            ))}
          </Select>
        </div>
        <TextArea label="Why this?" rows={2} value={why} onChange={(e) => setWhy(e.target.value)} placeholder="What made you pick it up. One line is enough." />
        <TextArea label="Your question" rows={2} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="The question you are reading it to answer." onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void submit(); }} />
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={!title.trim() || busy}>Put it on the shelf</Button>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <span className="text-[11px] text-ink-4 ml-auto">Ctrl/⌘ Enter</span>
        </div>
      </form>
    </Dialog>
  );
}
