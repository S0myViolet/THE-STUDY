"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useStudy, useStudyQuery } from "@/lib/persistence/provider";
import { ensureOne } from "@/lib/persistence/ensure";
import type { Investigation } from "@/lib/domain/types";
import { INVESTIGATION_TEMPLATES } from "@/content";
import { Button, Empty, Field, PageHeader, TextArea } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { cx, plural, shortDate } from "@/lib/util/format";
import { balance, blank, daysOpen, fromTemplate } from "@/lib/investigations/devil";
import { Workbench } from "./Workbench";
import { Synthesis } from "./Synthesis";

export function InvestigationsRoom({ slug }: { slug: string[] }) {
  const params = useSearchParams();
  const template = params.get("template");
  if (template) return <StartFromTemplate templateId={template} />;
  if (slug[0] === "new") return <NewInvestigation />;
  if (slug[0] && slug[1] === "synthesis") return <Synthesis id={slug[0]} />;
  if (slug[0]) return <Workbench id={slug[0]} />;
  return <Index />;
}

/* ------------------------------------------------------------------ */
/* Index                                                                */
/* ------------------------------------------------------------------ */

function Index() {
  const investigations = useStudyQuery((db) => db.store("investigations").list({ orderBy: "updatedAt", desc: true }), ["investigations"]);
  const all = investigations.data ?? [];
  const open = all.filter((i) => i.status === "open");
  const synthesised = all.filter((i) => i.status === "synthesised");
  const archived = all.filter((i) => i.status === "archived");
  const usedTemplates = new Set(all.map((i) => i.templateId).filter(Boolean));

  return (
    <div className="page">
      <PageHeader eyebrow="Investigations" title="Long questions" lede="A question you cannot answer in an afternoon, pursued over weeks: claims graded by support, counterclaims that are not straw, sources, notes, and eventually a position you can defend." aside={all.length ? <Link href="/investigations/new" className="btn"><I.Plus size={14} /> Start an investigation</Link> : null} />

      {!all.length && !investigations.loading ? (
        <Empty title="No investigations open. Pick a question you cannot answer in an afternoon." body="Begin from one of the templates below, or bring your own question." action={<Link href="/investigations/new" className="btn btn-lg">Start an investigation</Link>} />
      ) : null}

      {open.length ? (
        <section className="mb-12">
          <div className="eyebrow mb-1">Open · {open.length}</div>
          <ul className="divide-y divide-line border-t border-line">
            {open.map((inv) => (
              <InvestigationRow key={inv.id} inv={inv} />
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mb-12">
        <div className="eyebrow mb-1">Begin from a template</div>
        <ul className="divide-y divide-line border-t border-line">
          {INVESTIGATION_TEMPLATES.map((t) => (
            <li key={t.id}>
              <Link href={`/investigations?template=${t.id}`} className="group flex items-start justify-between gap-6 py-4 -mx-3 px-3 rounded-sm hover:bg-paper-3">
                <span className="min-w-0">
                  <span className="serif text-[20px] text-ink group-hover:text-ink-2 block leading-snug">{t.title}</span>
                  <span className="block text-[14px] text-ink-2 mt-1 max-w-[70ch]">{t.question}</span>
                  <span className="block text-[11px] text-ink-4 mt-2">
                    {t.threads.length} threads · {t.startingClaims.length} claims · {t.sources.length} sources{usedTemplates.has(t.id) ? " · already begun" : ""}
                  </span>
                </span>
                <I.ArrowRight size={14} className="mt-2 shrink-0 text-ink-4 group-hover:text-ink" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {synthesised.length ? (
        <section className="mb-12">
          <div className="eyebrow mb-1">Synthesised · {synthesised.length}</div>
          <ul className="divide-y divide-line border-t border-line">
            {synthesised.map((inv) => (
              <InvestigationRow key={inv.id} inv={inv} />
            ))}
          </ul>
        </section>
      ) : null}
      {archived.length ? (
        <section>
          <div className="eyebrow mb-1">Archived · {archived.length}</div>
          <ul className="divide-y divide-line border-t border-line">
            {archived.map((inv) => (
              <InvestigationRow key={inv.id} inv={inv} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function InvestigationRow({ inv }: { inv: Investigation }) {
  const b = balance(inv);
  return (
    <li>
      <Link href={`/investigations/${inv.id}`} className="group block py-4 -mx-3 px-3 rounded-sm hover:bg-paper-3">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="serif text-[21px] text-ink group-hover:text-ink-2 leading-snug">{inv.title}</div>
            <p className="text-[14px] text-ink-2 mt-1 max-w-[70ch]">{inv.question}</p>
            <p className="mono text-[11px] text-ink-3 mt-2">
              {inv.status === "open" ? `${plural(daysOpen(inv), "day")} open` : `${inv.status} · ${shortDate(inv.updatedAt)}`} · {inv.claims.length} claims · {inv.counterclaims.length} counterclaims · {inv.notes.length} notes · {inv.openQuestions.length} open questions
            </p>
          </div>
          <div className="shrink-0 w-28 pt-2" aria-label={`Balance: ${Math.round(b * 100)}% weight on claims`} title="Weight on claims against counterclaims">
            <div className="flex h-[3px] w-full overflow-hidden">
              <span className="bg-ink" style={{ width: `${b * 100}%` }} />
              <span className="bg-wine" style={{ width: `${(1 - b) * 100}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-ink-4 mt-1">
              <span>claims</span>
              <span>against</span>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Start                                                                */
/* ------------------------------------------------------------------ */

function StartFromTemplate({ templateId }: { templateId: string }) {
  const { db } = useStudy();
  const router = useRouter();
  const started = useRef(false);
  const template = INVESTIGATION_TEMPLATES.find((t) => t.id === templateId);
  useEffect(() => {
    if (!template || started.current) return;
    started.current = true;
    (async () => {
      const inv = await ensureOne(db, "investigations", { templateId: template.id, status: "open" } as Partial<Investigation>, () => fromTemplate(db.userId, template));
      router.replace(`/investigations/${inv.id}`);
    })();
  }, [db, router, template]);
  if (!template) {
    return (
      <div className="page">
        <Empty title="No template by that name." action={<Link href="/investigations" className="btn btn-secondary">Back</Link>} />
      </div>
    );
  }
  return (
    <div className="page">
      <div className="eyebrow">Investigations</div>
      <p className="serif text-[22px] mt-3 text-ink-2">Opening the file.</p>
    </div>
  );
}

function NewInvestigation() {
  const { db } = useStudy();
  const router = useRouter();
  const [f, setF] = useState({ title: "", question: "", whyItMatters: "" });
  const [busy, setBusy] = useState(false);
  const ok = f.title.trim().length >= 4 && f.question.trim().length >= 12;

  async function save() {
    if (!ok || busy) return;
    setBusy(true);
    const inv = blank(db.userId, { title: f.title.trim(), question: f.question.trim(), whyItMatters: f.whyItMatters.trim() });
    await db.store("investigations").put(inv);
    router.push(`/investigations/${inv.id}`);
  }

  return (
    <div className="page">
      <Link href="/investigations" className="text-[12px] text-ink-3 hover:text-ink inline-flex items-center gap-1.5 mb-6">
        <I.ArrowLeft size={12} /> Investigations
      </Link>
      <PageHeader eyebrow="A new investigation" title="What is the question?" lede="Pick one you cannot answer in an afternoon and would still care about in a month." />
      <div className="max-w-[62ch] space-y-5">
        <Field label="Short title" serif value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Why do cities keep rebuilding on floodplains?" autoFocus />
        <TextArea label="The question, precisely" serif rows={2} value={f.question} onChange={(e) => setF({ ...f, question: e.target.value })} placeholder="Phrase it so that evidence could move you one way or the other." />
        <TextArea label="Why it matters to you" rows={3} value={f.whyItMatters} onChange={(e) => setF({ ...f, whyItMatters: e.target.value })} placeholder="The reason you will still be reading about this in three weeks." onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void save(); }} />
        <div className="flex items-center gap-3">
          <Button size="lg" onClick={save} disabled={!ok || busy}>
            Open the investigation
          </Button>
          <span className="text-[12px] text-ink-3">⌘↵</span>
        </div>
      </div>
    </div>
  );
}

export function useInvestigation(id: string) {
  const q = useStudyQuery((db) => db.store("investigations").get(id), ["investigations"], [id]);
  return { inv: q.data ?? null, loading: q.loading };
}

export function statusTone(status: Investigation["status"]) {
  return cx(status === "open" ? "text-forest" : status === "synthesised" ? "text-brass" : "text-ink-3");
}
