"use client";

import React, { useMemo, useState } from "react";
import { useStudy, useStudyQuery } from "@/lib/persistence/provider";
import { ARCHIVE_ENTRIES } from "@/content";
import { keyPointCoverage, wordCount } from "@/lib/scoring/text";
import { recordEvidence } from "@/lib/services/evidence";
import { reviewMemoryItem } from "@/lib/services/memory";
import { ai, useAIStatus } from "@/lib/ai/client";
import { Button, TextArea, Empty } from "@/components/ui/primitives";
import { MemoryHeader, Finish } from "./shared";
import Link from "next/link";
import { cx } from "@/lib/util/format";

/** Rebuild an argument, concept or Archive entry from memory, then compare against its key points. */
export function Reconstruct() {
  const { db } = useStudy();
  const aiStatus = useAIStatus();
  const progress = useStudyQuery((db) => db.store("archive_progress").list({ filter: (p) => p.status !== "unread" }), ["archive_progress"]);
  const concepts = useStudyQuery((db) => db.store("memory_items").list({ filter: (m) => (m.kind === "concept" || m.kind === "reconstruction") && !m.suspended }), ["memory_items"]);
  const candidates = useMemo(() => {
    const read = (progress.data ?? []).map((p) => ARCHIVE_ENTRIES.find((e) => e.id === p.entryId)).filter(Boolean) as typeof ARCHIVE_ENTRIES;
    const fromArchive = read.map((e) => ({ id: "arc:" + e.id, title: e.title, prompt: `Reconstruct: ${e.title}`, keyPoints: e.remember, href: `/v1/archive/${e.id}` }));
    const fromItems = (concepts.data ?? []).map((m) => ({ id: "mem:" + m.id, title: m.prompt, prompt: m.prompt, keyPoints: m.answer.split(/[;.]\s+/).filter((s) => s.length > 8).slice(0, 5), href: undefined as string | undefined, item: m }));
    return [...fromArchive, ...fromItems];
  }, [progress.data, concepts.data]);
  const [pick, setPick] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ covered: string[]; missing: string[]; ratio: number; feedback?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const chosen = candidates.find((c) => c.id === pick);

  async function submit() {
    if (!chosen) return;
    setBusy(true);
    const cov = keyPointCoverage(text, chosen.keyPoints);
    let feedback: string | undefined;
    let score = cov.ratio;
    if (aiStatus.configured) {
      const res = await ai.call("evaluateRecall", { keyPoints: chosen.keyPoints, reconstruction: text });
      if (res.ok) {
        feedback = res.data.feedback;
        score = (score + res.data.score) / 2;
      }
    }
    setResult({ ...cov, feedback });
    const source = { kind: "memory" as const, refId: chosen.id, label: `Reconstruct · ${chosen.title}` };
    await recordEvidence(db, { subskill: "memory.reconstruction", score, difficulty: 4, format: "free", source });
    if ("item" in chosen && chosen.item) await reviewMemoryItem(db, { item: chosen.item, correct: score >= 0.5 });
    setBusy(false);
  }

  return (
    <div className="page">
      <MemoryHeader title="Reconstruct" />
      {!candidates.length && !progress.loading ? (
        <Empty title="Nothing to reconstruct yet." body="Read an Archive entry, or learn a concept, and it will appear here." action={<Link href="/v1/archive" className="btn btn-secondary">Open the Archive</Link>} />
      ) : null}
      {candidates.length && !chosen ? (
        <div>
          <p className="text-[13px] text-ink-3 mb-3">Choose something you have read or learned. Then, without looking, rebuild it.</p>
          <ul className="divide-y divide-line border-t border-line">
            {candidates.slice(0, 30).map((c) => (
              <li key={c.id}><button className="w-full text-left py-3 serif text-[18px] hover:text-ink-2" onClick={() => setPick(c.id)}>{c.title}</button></li>
            ))}
          </ul>
        </div>
      ) : null}
      {chosen && !result ? (
        <div className="anim-place">
          <p className="serif text-[24px] mb-4">{chosen.title}</p>
          <TextArea label="From memory: what is it, why it matters, what it connects to" serif rows={10} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void submit(); }} autoFocus />
          <div className="mt-4 flex gap-3"><Button size="lg" disabled={busy || wordCount(text) < 15} onClick={submit}>{busy ? "Comparing…" : "Compare"}</Button><Button variant="ghost" onClick={() => setPick(null)}>Choose another</Button></div>
        </div>
      ) : null}
      {chosen && result ? (
        <div className="anim-place space-y-6">
          <div className="border-t border-ink pt-4"><div className="eyebrow">Key points recovered</div><div className="numeral text-[28px] mt-1">{result.covered.length} / {chosen.keyPoints.length}</div></div>
          {result.feedback ? <p className="serif text-[17px] text-ink-2">{result.feedback}</p> : null}
          <ul className="space-y-2">{chosen.keyPoints.map((k) => <li key={k} className={cx("pl-3 border-l serif text-[17px]", result.covered.includes(k) ? "border-forest" : "border-wine")}>{k.replace(/\|.*$/, "")}</li>)}</ul>
          {chosen.href ? <Link href={chosen.href} className="text-[13px] underline underline-offset-4">Reread the source</Link> : null}
          <Finish onAgain={() => { setPick(null); setText(""); setResult(null); }} againLabel="Another" />
        </div>
      ) : null}
    </div>
  );
}
