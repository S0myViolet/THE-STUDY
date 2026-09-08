"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStudy } from "@/lib/persistence/provider";
import { stamp } from "@/lib/persistence/store";
import type { ArchiveNote, Investigation } from "@/lib/domain/types";
import { recordEvidence } from "@/lib/services/evidence";
import { writeAfterAction } from "@/lib/services/after-action";
import { detectRedThreads } from "@/lib/adaptation/red-thread";
import { Button, Empty, TextArea, Note } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { shortDate } from "@/lib/util/format";
import { parseConfidence, stripConfidence, synthesisScore } from "@/lib/investigations/devil";
import { useInvestigation } from "./index";

interface Draft {
  supports: string;
  contested: string;
  position: string;
  changeMind: string;
}

function parse(synthesis?: string): Draft {
  const d: Draft = { supports: "", contested: "", position: "", changeMind: "" };
  if (!synthesis) return d;
  const grab = (h: string) => {
    const m = synthesis.match(new RegExp(`## ${h}\\n([\\s\\S]*?)(?=\\n## |$)`));
    return m ? m[1]!.trim() : "";
  };
  d.supports = grab("What the evidence supports");
  d.contested = grab("What remains contested");
  d.position = grab("My position");
  d.changeMind = grab("What would change my mind");
  return d;
}

function compose(inv: Investigation, d: Draft): string {
  return [`# ${inv.title}`, `*${inv.question}*`, "", "## What the evidence supports", d.supports.trim(), "", "## What remains contested", d.contested.trim(), "", "## My position", d.position.trim(), "", "## What would change my mind", d.changeMind.trim()].join("\n");
}

export function Synthesis({ id }: { id: string }) {
  const { db } = useStudy();
  const router = useRouter();
  const { inv, loading } = useInvestigation(id);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ score: number; notes: string[] } | null>(null);
  const [savedNote, setSavedNote] = useState(false);

  if (loading) return <div className="page" />;
  if (!inv) {
    return (
      <div className="page">
        <Empty title="No investigation by that id." action={<Link href="/v1/investigations" className="btn btn-secondary">Back</Link>} />
      </div>
    );
  }
  const d = draft ?? { ...parse(inv.synthesis), position: parse(inv.synthesis).position || stripConfidence(inv.position) };
  const set = (k: keyof Draft, v: string) => setDraft({ ...d, [k]: v });
  const ready = d.supports.trim().length > 20 && d.position.trim().length > 10;
  const confidence = parseConfidence(inv.position);

  async function markSynthesised() {
    if (!ready || busy) return;
    setBusy(true);
    const text = compose(inv!, d);
    const r = synthesisScore(inv!, d);
    setResult(r);
    await db.store("investigations").update(inv!.id, { synthesis: text, status: "synthesised" });
    const source = { kind: "investigation" as const, refId: inv!.id, label: `Investigation · ${inv!.title}` };
    await recordEvidence(db, { subskill: "synthesis.integration", score: r.score, difficulty: 5, format: "free", transfer: true, source });
    await recordEvidence(db, { subskill: "inference.evidence_weighting", score: Math.min(1, 0.4 + 0.6 * r.score), difficulty: 5, format: "free", source });
    if (inv!.archiveConnections.length >= 2) await recordEvidence(db, { subskill: "synthesis.cross_domain", score: Math.min(1, 0.5 + inv!.archiveConnections.length * 0.1), difficulty: 4, format: "free", transfer: true, source });
    await writeAfterAction(db, {
      source,
      title: `Investigation · ${inv!.title}`,
      saw: inv!.claims.filter((c) => c.support === "strong" || c.support === "moderate").map((c) => c.text).slice(0, 4),
      missed: inv!.openQuestions.slice(0, 3),
      assumed: inv!.claims.filter((c) => c.support === "contested").map((c) => c.text).slice(0, 3),
      didWell: inv!.counterclaims.length ? [`Recorded ${inv!.counterclaims.length} counterclaim${inv!.counterclaims.length === 1 ? "" : "s"} and met them in the synthesis.`] : [],
      oneThing: r.notes[0] ?? "Return to this in a month and see whether the position still holds.",
      score: r.score,
    });
    await detectRedThreads(db).catch(() => {});
    setDraft(null);
    setBusy(false);
  }

  async function saveToArchive() {
    const target = inv!.archiveConnections[0];
    if (!target) return;
    const note = stamp<ArchiveNote>(db.userId, "an", { entryId: target, text: `From the investigation "${inv!.title}":\n\n${d.position.trim()}` });
    await db.store("archive_notes").put(note);
    setSavedNote(true);
  }

  async function archive() {
    await db.store("investigations").update(inv!.id, { status: "archived" });
    router.push("/v1/investigations");
  }

  async function reopen() {
    await db.store("investigations").update(inv!.id, { status: "open" });
    setResult(null);
  }

  return (
    <div className="page">
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link href={`/v1/investigations/${inv.id}`} className="text-[12px] text-ink-3 hover:text-ink inline-flex items-center gap-1.5">
          <I.ArrowLeft size={12} /> Workbench
        </Link>
        <span className="text-[12px] text-ink-3 capitalize">{inv.status}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
        <div className="max-w-[68ch]">
          <div className="eyebrow eyebrow-wine">Synthesis</div>
          <h1 className="display text-[32px] md:text-[38px] leading-tight mt-1 text-ink">{inv.title}</h1>
          <p className="serif text-[19px] text-ink-2 mt-3 italic">{inv.question}</p>

          {inv.status === "open" || draft ? (
            <div className="mt-8 space-y-6">
              <TextArea label="What the evidence supports" serif rows={5} value={d.supports} onChange={(e) => set("supports", e.target.value)} placeholder="The findings that carry the weight, and which claims they carry." />
              <TextArea label="What remains contested" serif rows={4} value={d.contested} onChange={(e) => set("contested", e.target.value)} placeholder="Where reasonable people still disagree, and why." />
              <TextArea label={`My position${confidence !== null ? ` · confidence ${Math.round(confidence * 100)}%` : ""}`} serif rows={4} value={d.position} onChange={(e) => set("position", e.target.value)} placeholder="A paragraph a stranger could disagree with." />
              <TextArea label="What would change my mind" serif rows={3} value={d.changeMind} onChange={(e) => set("changeMind", e.target.value)} placeholder="The evidence that would move you, and where it would come from." />
              <div className="flex flex-wrap items-center gap-3">
                <Button size="lg" onClick={markSynthesised} disabled={!ready || busy}>
                  {busy ? "Recording…" : inv.status === "open" ? "Mark synthesised" : "Record the revision"}
                </Button>
                {inv.status !== "open" ? (
                  <Button variant="ghost" onClick={() => setDraft(null)}>
                    Discard changes
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <article className="mt-8 prose-study">
              <Block title="What the evidence supports" text={d.supports} />
              <Block title="What remains contested" text={d.contested} />
              <Block title={`My position${confidence !== null ? ` · confidence ${Math.round(confidence * 100)}%` : ""}`} text={d.position} />
              <Block title="What would change my mind" text={d.changeMind} />
              <p className="text-[12px] text-ink-4 mt-6">Synthesised {shortDate(inv.updatedAt)}.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => setDraft({ ...d })}>
                  Revise
                </Button>
                {inv.status !== "archived" ? (
                  <Button variant="ghost" onClick={archive}>
                    Archive this investigation
                  </Button>
                ) : null}
                <Button variant="ghost" onClick={reopen}>
                  Reopen
                </Button>
              </div>
            </article>
          )}

          {result ? (
            <div className="mt-8 sheet p-5 anim-place">
              <div className="eyebrow">Review</div>
              <p className="mt-2 text-[14px] text-ink-2">{result.score >= 0.8 ? "A complete synthesis: evidence, tension, position, exit." : result.score >= 0.5 ? "Most of the structure is there." : "The structure is thin in places."}</p>
              {result.notes.length ? (
                <ul className="mt-2 space-y-1 text-[13px] text-ink-2">
                  {result.notes.slice(0, 2).map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-3">
                {inv.archiveConnections.length ? (
                  <Button variant="secondary" size="sm" onClick={saveToArchive} disabled={savedNote}>
                    {savedNote ? "Saved to the Archive" : "Save the position to the Archive as a note"}
                  </Button>
                ) : null}
                <Button variant="ghost" size="sm" onClick={archive}>
                  Archive this investigation
                </Button>
                <Link href="/v1/after-action" className="btn btn-ghost btn-sm">
                  After Action <I.ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ) : null}
        </div>

        <aside className="space-y-6 lg:pt-10">
          <div>
            <div className="eyebrow mb-2">Claims by support</div>
            <ul className="space-y-1.5 text-[13px]">
              {[...inv.claims]
                .sort((a, b) => ["strong", "moderate", "weak", "contested"].indexOf(a.support) - ["strong", "moderate", "weak", "contested"].indexOf(b.support))
                .map((c) => (
                  <li key={c.id} className="flex gap-2">
                    <span className="mono text-[10px] uppercase text-ink-4 w-20 shrink-0 pt-0.5">{c.support}</span>
                    <span className="text-ink-2">{c.text}</span>
                  </li>
                ))}
            </ul>
          </div>
          {inv.counterclaims.length ? (
            <div>
              <div className="eyebrow mb-2">Counterclaims</div>
              <ul className="space-y-1.5 text-[13px] text-ink-2">
                {inv.counterclaims.map((cc) => (
                  <li key={cc.id} className="border-l-2 border-wine pl-2">
                    {cc.text}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {inv.openQuestions.length ? (
            <Note tone="brass">
              {inv.openQuestions.length} question{inv.openQuestions.length === 1 ? "" : "s"} still open. A synthesis can stand with open questions; it should name them.
            </Note>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function Block({ title, text }: { title: string; text: string }) {
  return (
    <section className="mt-6">
      <h2 className="eyebrow">{title}</h2>
      <p className="serif text-[18px] leading-relaxed text-ink mt-2 whitespace-pre-wrap">{text || <span className="text-ink-4">Not written.</span>}</p>
    </section>
  );
}
