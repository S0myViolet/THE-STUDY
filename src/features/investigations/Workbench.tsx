"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useStudy } from "@/lib/persistence/provider";
import type { Investigation } from "@/lib/domain/types";
import { ai, useAIStatus } from "@/lib/ai/client";
import { Button, ConfidenceDial, Empty, Field, Segmented, TextArea } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { cx, plural, shortDate } from "@/lib/util/format";
import { useArchive } from "@/features/archive/shared";
import { balance, daysOpen, devilsAdvocate, newId, parseConfidence, stripConfidence, withConfidence } from "@/lib/investigations/devil";
import { useInvestigation } from "./index";

type Support = Investigation["claims"][number]["support"];
const SUPPORTS: { value: Support; label: string }[] = [
  { value: "strong", label: "Strong" },
  { value: "moderate", label: "Moderate" },
  { value: "weak", label: "Weak" },
  { value: "contested", label: "Contested" },
];
const RANK: Record<Support, number> = { strong: 3, moderate: 2, weak: 1, contested: 0 };

export function Workbench({ id }: { id: string }) {
  const { db } = useStudy();
  const { inv, loading } = useInvestigation(id);
  const aiStatus = useAIStatus();
  const [thread, setThread] = useState<string | null>(null);
  const [devil, setDevil] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);

  async function patch(p: Partial<Investigation>) {
    if (!inv) return;
    await db.store("investigations").update(inv.id, p);
  }

  const claims = useMemo(() => (inv ? [...inv.claims].sort((a, b) => RANK[b.support] - RANK[a.support]) : []), [inv]);

  if (loading) return <div className="page" />;
  if (!inv) {
    return (
      <div className="page">
        <Empty title="No investigation by that id." action={<Link href="/investigations" className="btn btn-secondary">Back</Link>} />
      </div>
    );
  }

  async function advocate() {
    setBusy(true);
    let questions = devilsAdvocate(inv!);
    if (aiStatus.configured) {
      const strongest = claims[0];
      const r = await ai.call("curatorRespond", {
        mode: "challenge",
        thinkFirst: false,
        depth: "concise",
        style: "demanding",
        context: { investigation: inv!.title, question: inv!.question, claims: inv!.claims.map((c) => c.text), counterclaims: inv!.counterclaims.map((c) => c.text) },
        messages: [{ role: "user", content: `Act as devil's advocate against the claim "${strongest?.text ?? inv!.question}". Give two sharp questions, one per line, no preamble.` }],
      });
      if (r.ok && typeof (r.data as { text?: unknown }).text === "string") {
        const lines = (r.data as { text: string }).text.split(/\n+/).map((l) => l.replace(/^[\d.)\-\s]+/, "").trim()).filter((l) => l.length > 12).slice(0, 2);
        if (lines.length) questions = lines;
      }
    }
    setDevil(questions);
    await patch({ openQuestions: [...inv!.openQuestions, ...questions] });
    setBusy(false);
  }

  const b = balance(inv);
  const confidence = parseConfidence(inv.position);

  return (
    <div className="page">
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link href="/investigations" className="text-[12px] text-ink-3 hover:text-ink inline-flex items-center gap-1.5">
          <I.ArrowLeft size={12} /> Investigations
        </Link>
        <div className="flex items-center gap-4 text-[12px] text-ink-3">
          <span className={cx("capitalize", inv.status === "open" ? "text-forest" : inv.status === "synthesised" ? "text-brass" : "")}>{inv.status}</span>
          <span className="numeral whitespace-nowrap">{plural(daysOpen(inv), "day")}</span>
          <Link href={`/investigations/${inv.id}/synthesis`} className="btn btn-sm">
            {inv.synthesis ? "Synthesis" : "Write the synthesis"} <I.ArrowRight size={12} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-8 self-start space-y-6">
          <div>
            <div className="eyebrow eyebrow-wine">The question</div>
            <h1 className="display text-[28px] leading-tight mt-1 text-ink">{inv.title}</h1>
            <p className="serif text-[17px] text-ink-2 mt-2">{inv.question}</p>
          </div>
          {inv.whyItMatters ? (
            <div>
              <div className="eyebrow">Why it matters</div>
              <p className="text-[13px] text-ink-2 mt-1">{inv.whyItMatters}</p>
            </div>
          ) : null}
          <div>
            <div className="eyebrow mb-2">Threads</div>
            <ul className="space-y-1.5">
              {inv.threads.map((t) => (
                <li key={t.id}>
                  <button type="button" className={cx("text-left text-[14px] leading-snug hover:text-ink", thread === t.id ? "text-ink" : "text-ink-2")} onClick={() => setThread(thread === t.id ? null : t.id)} aria-pressed={thread === t.id}>
                    {t.title}
                  </button>
                  {thread === t.id ? <p className="text-[12px] text-ink-3 mt-1 anim-fade">{t.note}</p> : null}
                </li>
              ))}
              <li>
                <AddThread onAdd={(title, note) => patch({ threads: [...inv.threads, { id: newId("t"), title, note }] })} />
              </li>
            </ul>
          </div>
          <div>
            <div className="eyebrow mb-2">Balance</div>
            <div className="flex h-[3px] w-full overflow-hidden">
              <span className="bg-ink" style={{ width: `${b * 100}%` }} />
              <span className="bg-wine" style={{ width: `${(1 - b) * 100}%` }} />
            </div>
            <p className="text-[12px] text-ink-3 mt-2">{b > 0.72 ? "Most of the weight sits on the claims. Where is the case against?" : b < 0.35 ? "The counterclaims outweigh the claims. Is the question still open, or answered?" : "Claims and counterclaims are in tension, which is where an investigation should live."}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={advocate} disabled={busy} className="w-full">
            {busy ? "Arguing…" : "Devil's advocate"}
          </Button>
          {devil ? (
            <div className="sheet p-3 anim-place">
              <div className="eyebrow">Added to open questions</div>
              <ul className="mt-1 space-y-1 text-[13px] text-ink-2">
                {devil.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
              {!aiStatus.configured ? <p className="text-[11px] text-ink-4 mt-2">Deterministic challenges — connect a model in Settings for a sharper adversary.</p> : null}
            </div>
          ) : null}
        </aside>

        {/* Main */}
        <div className="space-y-12 min-w-0">
          <Section title="Claims" count={inv.claims.length} hint="Graded by how well the evidence supports them.">
            <ul className="space-y-3">
              {claims.map((c) => (
                <li key={c.id} className="border-t border-line pt-3">
                  <div className="flex items-start justify-between gap-4">
                    <p className="serif text-[17px] text-ink leading-snug">{c.text}</p>
                    <button type="button" className="text-[11px] text-ink-4 hover:text-wine shrink-0" onClick={() => patch({ claims: inv.claims.filter((x) => x.id !== c.id), counterclaims: inv.counterclaims.map((cc) => (cc.against === c.id ? { ...cc, against: undefined } : cc)) })} aria-label="Remove claim">
                      Remove
                    </button>
                  </div>
                  <div className="mt-2">
                    <Segmented value={c.support} onChange={(v) => patch({ claims: inv.claims.map((x) => (x.id === c.id ? { ...x, support: v } : x)) })} label="Support" options={SUPPORTS} />
                  </div>
                </li>
              ))}
            </ul>
            <AddLine placeholder="A claim you are considering" onAdd={(text) => patch({ claims: [...inv.claims, { id: newId("c"), text, support: "moderate" }] })} />
          </Section>

          <Section title="Counterclaims" count={inv.counterclaims.length} hint="Real objections, stated so their defenders would recognise them.">
            <ul className="space-y-3">
              {inv.counterclaims.map((cc) => (
                <li key={cc.id} className="border-t border-line pt-3">
                  <div className="flex items-start justify-between gap-4">
                    <p className="serif text-[17px] text-ink leading-snug border-l-2 border-wine pl-3">{cc.text}</p>
                    <button type="button" className="text-[11px] text-ink-4 hover:text-wine shrink-0" onClick={() => patch({ counterclaims: inv.counterclaims.filter((x) => x.id !== cc.id) })} aria-label="Remove counterclaim">
                      Remove
                    </button>
                  </div>
                  <label className="mt-2 flex items-center gap-2 text-[12px] text-ink-3">
                    <span>Against</span>
                    <select className="field !h-8 !py-0 text-[12px] max-w-[40ch]" value={cc.against ?? ""} onChange={(e) => patch({ counterclaims: inv.counterclaims.map((x) => (x.id === cc.id ? { ...x, against: e.target.value || undefined } : x)) })}>
                      <option value="">the question in general</option>
                      {inv.claims.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.text.length > 70 ? c.text.slice(0, 67) + "…" : c.text}
                        </option>
                      ))}
                    </select>
                  </label>
                </li>
              ))}
            </ul>
            <AddLine placeholder="The strongest case against" onAdd={(text) => patch({ counterclaims: [...inv.counterclaims, { id: newId("cc"), text }] })} />
          </Section>

          <Section title="Sources" count={inv.sources.length} hint="Books, papers, people. Note what each one is for.">
            <ul className="divide-y divide-line border-t border-line">
              {inv.sources.map((s) => (
                <li key={s.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[15px] text-ink">
                      {s.url ? (
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4">
                          {s.title}
                        </a>
                      ) : (
                        s.title
                      )}
                    </div>
                    {s.note ? <p className="text-[13px] text-ink-3 mt-0.5">{s.note}</p> : null}
                  </div>
                  <button type="button" className="text-[11px] text-ink-4 hover:text-wine shrink-0" onClick={() => patch({ sources: inv.sources.filter((x) => x.id !== s.id) })} aria-label="Remove source">
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <AddSource onAdd={(title, note, url) => patch({ sources: [...inv.sources, { id: newId("s"), title, note: note || undefined, url: url || undefined }] })} />
          </Section>

          <Section title="Notes" count={inv.notes.length} hint="Dated. Newest first. Cmd/Ctrl + Enter to add.">
            <AddNote onAdd={(text) => patch({ notes: [{ id: newId("n"), text, at: new Date().toISOString() }, ...inv.notes] })} />
            <ul className="mt-4 space-y-4">
              {inv.notes.map((n) => (
                <li key={n.id} className="border-l border-line-2 pl-4">
                  <div className="mono text-[11px] text-ink-4">{shortDate(n.at)}</div>
                  <p className="serif text-[16px] text-ink-2 mt-1 whitespace-pre-wrap">{n.text}</p>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Open questions" count={inv.openQuestions.length} hint="Resolve one with a note about what settled it.">
            <ul className="space-y-2">
              {inv.openQuestions.map((q, i) => (
                <OpenQuestion key={`${i}-${q.slice(0, 20)}`} text={q} onResolve={(note) => patch({ openQuestions: inv.openQuestions.filter((_, j) => j !== i), notes: [{ id: newId("n"), text: `Resolved: ${q}\n${note}`, at: new Date().toISOString() }, ...inv.notes] })} />
              ))}
            </ul>
            <AddLine placeholder="Something you do not yet know" onAdd={(text) => patch({ openQuestions: [...inv.openQuestions, text] })} />
          </Section>

          <Section title="Archive connections" count={inv.archiveConnections.length} hint="Entries in the Archive this question touches.">
            <Connections ids={inv.archiveConnections} onChange={(ids) => patch({ archiveConnections: ids })} />
          </Section>

          <Section title="Current position" hint="What you believe now, and how sure. It can change.">
            <Position value={stripConfidence(inv.position)} confidence={confidence} onChange={(text, conf) => patch({ position: withConfidence(text, conf) })} />
          </Section>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pieces                                                               */
/* ------------------------------------------------------------------ */

function Section({ title, count, hint, children }: { title: string; count?: number; hint?: string; children: React.ReactNode }) {
  return (
    <section aria-label={title}>
      <div className="flex items-baseline justify-between gap-4 mb-3">
        <h2 className="eyebrow">
          {title}
          {count !== undefined ? <span className="numeral text-ink-4 ml-2">{count}</span> : null}
        </h2>
        {hint ? <span className="text-[12px] text-ink-4">{hint}</span> : null}
      </div>
      {children}
    </section>
  );
}

function AddLine({ placeholder, onAdd }: { placeholder: string; onAdd: (text: string) => void }) {
  const [v, setV] = useState("");
  function commit() {
    const t = v.trim();
    if (t.length < 3) return;
    onAdd(t);
    setV("");
  }
  return (
    <div className="mt-3 flex gap-2">
      <input className="field" value={v} placeholder={placeholder} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } }} aria-label={placeholder} />
      <Button variant="secondary" size="sm" onClick={commit} disabled={v.trim().length < 3}>
        Add
      </Button>
    </div>
  );
}

function AddThread({ onAdd }: { onAdd: (title: string, note: string) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  if (!open)
    return (
      <button type="button" className="text-[12px] text-ink-4 hover:text-ink mt-1" onClick={() => setOpen(true)}>
        + a thread
      </button>
    );
  return (
    <div className="space-y-2 mt-2">
      <Field label="" placeholder="Thread title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <TextArea label="" rows={2} placeholder="What to test along it" value={note} onChange={(e) => setNote(e.target.value)} />
      <div className="flex gap-2">
        <Button size="sm" onClick={() => { if (title.trim()) { onAdd(title.trim(), note.trim()); setTitle(""); setNote(""); setOpen(false); } }} disabled={!title.trim()}>
          Add
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function AddSource({ onAdd }: { onAdd: (title: string, note: string, url: string) => void }) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [url, setUrl] = useState("");
  function commit() {
    if (title.trim().length < 3) return;
    onAdd(title.trim(), note.trim(), url.trim());
    setTitle("");
    setNote("");
    setUrl("");
  }
  return (
    <div className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
      <input className="field" placeholder="Author, title (year)" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Source title" />
      <input className="field" placeholder="What it is for, or a link" value={note.startsWith("http") ? note : note} onChange={(e) => { const v = e.target.value; if (/^https?:\/\//i.test(v)) { setUrl(v); setNote(""); } else { setNote(v); setUrl(""); } }} aria-label="Source note or link" />
      <Button variant="secondary" size="sm" onClick={commit} disabled={title.trim().length < 3}>
        Add
      </Button>
      {url ? <span className="text-[11px] text-ink-4 md:col-span-3">Link noted: {url}</span> : null}
    </div>
  );
}

function AddNote({ onAdd }: { onAdd: (text: string) => void }) {
  const [v, setV] = useState("");
  function commit() {
    if (v.trim().length < 3) return;
    onAdd(v.trim());
    setV("");
  }
  return (
    <div>
      <TextArea label="" serif rows={3} value={v} onChange={(e) => setV(e.target.value)} placeholder="What you read, what you noticed, what changed." onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") commit(); }} />
      <div className="mt-2 flex justify-end">
        <Button variant="secondary" size="sm" onClick={commit} disabled={v.trim().length < 3}>
          Add note
        </Button>
      </div>
    </div>
  );
}

function OpenQuestion({ text, onResolve }: { text: string; onResolve: (note: string) => void }) {
  const [resolving, setResolving] = useState(false);
  const [note, setNote] = useState("");
  return (
    <li className="border-t border-line pt-2">
      <div className="flex items-start gap-3">
        <button type="button" className="mt-1.5 w-3 h-3 border border-line-2 hover:border-ink shrink-0" aria-label="Resolve this question" onClick={() => setResolving((r) => !r)} />
        <p className="serif text-[16px] text-ink leading-snug">{text}</p>
      </div>
      {resolving ? (
        <div className="mt-2 ml-6 flex gap-2 anim-fade">
          <input className="field" placeholder="What settled it" value={note} onChange={(e) => setNote(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && note.trim()) onResolve(note.trim()); }} aria-label="What settled it" />
          <Button size="sm" onClick={() => onResolve(note.trim() || "Resolved.")}>
            Resolve
          </Button>
        </div>
      ) : null}
    </li>
  );
}

function Connections({ ids, onChange }: { ids: string[]; onChange: (ids: string[]) => void }) {
  const data = useArchive();
  const [q, setQ] = useState("");
  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (t.length < 2) return [];
    return data.entries.filter((e) => e.kind !== "path" && !ids.includes(e.id) && (e.title.toLowerCase().includes(t) || e.tags.some((tag) => tag.includes(t)))).slice(0, 6);
  }, [q, data.entries, ids]);
  return (
    <div>
      <ul className="flex flex-wrap gap-2">
        {ids.map((id) => {
          const e = data.byId.get(id);
          return (
            <li key={id} className="inline-flex items-center gap-2 border border-line-2 px-2.5 py-1 text-[13px]">
              <Link href={`/archive/${id}`} className="text-ink hover:underline underline-offset-4">
                {e?.title ?? id}
              </Link>
              <button type="button" className="text-ink-4 hover:text-wine" aria-label={`Remove ${e?.title ?? id}`} onClick={() => onChange(ids.filter((x) => x !== id))}>
                <I.Close size={11} />
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 relative max-w-md">
        <input className="field" placeholder="Connect an Archive entry" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search the Archive" />
        {matches.length ? (
          <ul className="absolute z-10 left-0 right-0 mt-1 sheet-raised p-1">
            {matches.map((e) => (
              <li key={e.id}>
                <button type="button" className="w-full text-left px-2 py-1.5 text-[14px] hover:bg-paper-3 rounded-sm" onClick={() => { onChange([...ids, e.id]); setQ(""); }}>
                  {e.title} <span className="text-ink-4 text-[12px]">· {e.domain}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

function Position({ value, confidence, onChange }: { value: string; confidence: number | null; onChange: (text: string, conf: number | null) => void }) {
  const [text, setText] = useState(value);
  const [conf, setConf] = useState<number | null>(confidence);
  const [saved, setSaved] = useState(false);
  const dirty = text !== value || conf !== confidence;
  return (
    <div className="space-y-3 max-w-[62ch]">
      <TextArea label="" serif rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="One paragraph. What you believe now and why." />
      <ConfidenceDial value={conf} onChange={setConf} label="How sure are you?" />
      <div className="flex items-center gap-3">
        <Button size="sm" variant="secondary" disabled={!dirty} onClick={() => { onChange(text, conf); setSaved(true); setTimeout(() => setSaved(false), 1500); }}>
          Record position
        </Button>
        {saved ? <span className="text-[12px] text-forest anim-fade">Recorded</span> : null}
      </div>
    </div>
  );
}
