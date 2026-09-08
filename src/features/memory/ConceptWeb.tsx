"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useStudy, useStudyQuery } from "@/lib/persistence/provider";
import { ARCHIVE_ENTRIES, ARCHIVE_CONNECTIONS } from "@/content";
import { recordEvidence } from "@/lib/services/evidence";
import { Button, TextArea, Empty } from "@/components/ui/primitives";
import { MemoryHeader, Finish } from "./shared";
import { cx, seedFromString, todayKey } from "@/lib/util/format";
import { normalize } from "@/lib/scoring/observation";

/** Given a central idea, recall what it connects to. Matched against the knowledge graph. */
export function ConceptWeb() {
  const { db } = useStudy();
  const progress = useStudyQuery((db) => db.store("archive_progress").list({ filter: (p) => p.status !== "unread" }), ["archive_progress"]);
  const [round, setRound] = useState(0);
  const centre = useMemo(() => {
    const read = (progress.data ?? []).map((p) => p.entryId);
    const withNeighbours = ARCHIVE_ENTRIES.filter((e) => e.kind !== "path" && ARCHIVE_CONNECTIONS.some((c) => c.from === e.id || c.to === e.id));
    const pool = withNeighbours.filter((e) => read.includes(e.id));
    const list = pool.length ? pool : withNeighbours;
    return list.length ? list[(seedFromString(todayKey()) + round) % list.length] : undefined;
  }, [progress.data, round]);
  const neighbours = useMemo(() => {
    if (!centre) return [];
    return ARCHIVE_CONNECTIONS.filter((c) => c.from === centre.id || c.to === centre.id)
      .map((c) => ({ id: c.from === centre.id ? c.to : c.from, relation: c.relation, note: c.note }))
      .map((n) => ({ ...n, entry: ARCHIVE_ENTRIES.find((e) => e.id === n.id) }))
      .filter((n) => n.entry);
  }, [centre]);
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ hit: string[]; extra: string[] } | null>(null);
  if (!centre) return <div className="page"><MemoryHeader title="Concept Web" /><Empty title="The web needs the Archive." action={<Link href="/v1/archive" className="btn btn-secondary">Open the Archive</Link>} /></div>;

  async function submit() {
    const lines = text.split(/\n|,/).map((s) => normalize(s)).filter(Boolean);
    const hit: string[] = [];
    const extra: string[] = [];
    for (const l of lines) {
      const n = neighbours.find((n) => !hit.includes(n.id) && (normalize(n.entry!.title).includes(l) || l.includes(normalize(n.entry!.title)) || normalize(n.entry!.title).split(" ").filter((w) => w.length > 4).some((w) => l.includes(w))));
      if (n) hit.push(n.id);
      else extra.push(l);
    }
    setResult({ hit, extra });
    const score = neighbours.length ? Math.min(1, hit.length / Math.min(4, neighbours.length)) : 0;
    const source = { kind: "memory" as const, refId: centre!.id, label: `Concept Web · ${centre!.title}` };
    await recordEvidence(db, { subskill: "knowledge.connections", score, difficulty: 4, format: "free", source });
    await recordEvidence(db, { subskill: "synthesis.cross_domain", score: Math.min(1, new Set(hit.map((h) => ARCHIVE_ENTRIES.find((e) => e.id === h)?.domain)).size / 2), difficulty: 4, format: "free", source });
  }

  return (
    <div className="page">
      <MemoryHeader title="Concept Web" />
      <div className="sheet-raised paper-texture p-6 md:p-8 text-center"><div className="eyebrow">Central idea</div><p className="display text-[36px] mt-2">{centre.title}</p><p className="text-[14px] text-ink-2 mt-2">{centre.summary}</p></div>
      {!result ? (
        <div className="mt-6">
          <TextArea label="What does it connect to? One per line" serif rows={6} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void submit(); }} placeholder="people, places, events, ideas, works" />
          <Button size="lg" className="mt-4" onClick={submit} disabled={text.trim().length < 3}>Compare with the Archive</Button>
        </div>
      ) : (
        <div className="mt-6 anim-place space-y-6">
          <div className="border-t border-ink pt-4"><div className="eyebrow">Connections recalled</div><div className="numeral text-[28px] mt-1">{result.hit.length} / {neighbours.length}</div></div>
          <svg viewBox="0 0 600 320" className="w-full h-auto" role="img" aria-label="Concept web">
            <circle cx={300} cy={160} r={38} fill="var(--paper-2)" stroke="var(--ink)" />
            <text x={300} y={164} textAnchor="middle" fontSize={11} fill="var(--ink)" fontFamily="var(--font-sans)">{centre.title.slice(0, 18)}</text>
            {neighbours.map((n, i) => {
              const a = (i / neighbours.length) * Math.PI * 2 - Math.PI / 2;
              const x = 300 + Math.cos(a) * 200;
              const y = 160 + Math.sin(a) * 110;
              const ok = result.hit.includes(n.id);
              return (
                <g key={n.id}>
                  <line x1={300} y1={160} x2={x} y2={y} stroke={ok ? "var(--forest)" : "var(--line-2)"} strokeWidth={ok ? 1.5 : 1} className={ok ? "anim-draw" : ""} />
                  <circle cx={x} cy={y} r={5} fill={ok ? "var(--forest)" : "var(--paper-3)"} stroke={ok ? "var(--forest)" : "var(--line-2)"} />
                  <text x={x} y={y + (y > 160 ? 18 : -10)} textAnchor="middle" fontSize={10} fill={ok ? "var(--ink)" : "var(--ink-3)"} fontFamily="var(--font-sans)">{n.entry!.title}</text>
                </g>
              );
            })}
          </svg>
          <ul className="space-y-1">{neighbours.map((n) => <li key={n.id} className={cx("text-[14px] pl-3 border-l", result.hit.includes(n.id) ? "border-forest" : "border-line-2 text-ink-2")}><Link href={`/v1/archive/${n.id}`} className="serif text-[16px] hover:underline underline-offset-4">{n.entry!.title}</Link> <span className="text-[11px] uppercase tracking-wider text-ink-3 ml-2">{n.relation.toLowerCase().replace("_", " ")}</span>{n.note ? <span className="block text-[12px] text-ink-3">{n.note}</span> : null}</li>)}</ul>
          {result.extra.length ? <p className="text-[12px] text-ink-3">Not in the Archive's graph (yet): {result.extra.join(", ")}. Add them as connections from the entry page if they are real.</p> : null}
          <Finish onAgain={() => { setRound((r) => r + 1); setText(""); setResult(null); }} againLabel="Another idea" />
        </div>
      )}
    </div>
  );
}
