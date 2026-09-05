"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useStudy } from "@/lib/persistence/provider";
import { stamp } from "@/lib/persistence/store";
import type { ArchiveConnection, ArchiveEntry, ArchiveRelation, Entity } from "@/lib/domain/types";
import { recordEvidence } from "@/lib/services/evidence";
import { Button, Select } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { cx } from "@/lib/util/format";
import { RELATIONS, RELATION_INVERSE, RELATION_LABEL, matchesQuery, type Edge } from "@/lib/archive/entries";
import { domainColor } from "@/lib/archive/layout";
import type { ArchiveData } from "./shared";

export function Connections({ entry, data }: { entry: ArchiveEntry; data: ArchiveData }) {
  const { db } = useStudy();
  const edges = useMemo(() => data.edges.filter((e) => e.from === entry.id || e.to === entry.id), [data.edges, entry.id]);
  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState("");
  const [target, setTarget] = useState<ArchiveEntry | null>(null);
  const [relation, setRelation] = useState<ArchiveRelation>("RELATED_TO");
  const [note, setNote] = useState("");
  const [fresh, setFresh] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const candidates = useMemo(() => {
    if (!q.trim()) return [];
    return data.entries.filter((e) => e.id !== entry.id && e.kind !== "path" && matchesQuery(e, q)).slice(0, 6);
  }, [q, data.entries, entry.id]);

  async function add() {
    if (!target || busy) return;
    setBusy(true);
    const row = stamp<ArchiveConnection & Entity>(db.userId, "uconn", { from: entry.id, to: target.id, relation, note: note.trim() || undefined });
    await db.store("archive_user_connections").put(row);
    const crossDomain = target.domain !== entry.domain;
    await recordEvidence(db, { subskill: "knowledge.connections", score: crossDomain ? 0.8 : 0.65, difficulty: crossDomain ? 4 : 3, format: "free", transfer: crossDomain, source: { kind: "archive", refId: entry.id, label: `${entry.title} → ${target.title}` }, note: `${RELATION_LABEL[relation]} ${target.title}` });
    setFresh(row.id);
    setAdding(false);
    setQ("");
    setTarget(null);
    setNote("");
    setBusy(false);
  }

  async function remove(id: string) {
    await db.store("archive_user_connections").delete(id);
  }

  return (
    <section aria-label="Connections">
      <div className="flex items-baseline justify-between border-t border-ink pt-3 mb-3">
        <span className="eyebrow">Connections</span>
        <span className="numeral text-[11px] text-ink-4">{edges.length}</span>
      </div>
      <LocalGraph entry={entry} edges={edges} data={data} fresh={fresh} />
      <ul className="mt-4 divide-y divide-line">
        {edges.map((e) => {
          const outgoing = e.from === entry.id;
          const otherId = outgoing ? e.to : e.from;
          const other = data.byId.get(otherId);
          if (!other) return null;
          return (
            <li key={e.id} className={cx("py-2.5 group", e.id === fresh && "anim-place")}>
              <div className="flex items-baseline justify-between gap-3">
                <Link href={`/archive/${other.id}`} className="min-w-0 hover:text-ink">
                  <span className="text-[11px] tracking-[0.08em] uppercase text-ink-3 block">{outgoing ? RELATION_LABEL[e.relation] : RELATION_INVERSE[e.relation]}{e.user ? " · yours" : ""}</span>
                  <span className="serif text-[17px] text-ink leading-snug block">{other.title}</span>
                </Link>
                {e.user ? (
                  <button type="button" className="btn btn-ghost btn-sm !h-6 !px-1 opacity-0 group-hover:opacity-100 focus:opacity-100 text-ink-3" aria-label={`Remove connection to ${other.title}`} onClick={() => remove(e.id)}>
                    <I.Close size={12} />
                  </button>
                ) : null}
              </div>
              {e.note ? <p className="text-[12.5px] text-ink-3 mt-1 leading-snug">{e.note}</p> : null}
            </li>
          );
        })}
      </ul>

      {!adding ? (
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => setAdding(true)}>
          <I.Plus size={12} /> Add a connection
        </Button>
      ) : (
        <form
          className="mt-4 space-y-3 anim-unfold"
          onSubmit={(e) => {
            e.preventDefault();
            void add();
          }}
        >
          <label className="block">
            <span className="eyebrow block mb-1.5">{entry.title} …</span>
            <Select value={relation} onChange={(e) => setRelation(e.target.value as ArchiveRelation)} aria-label="Relation">
              {RELATIONS.map((r) => (
                <option key={r} value={r}>{RELATION_LABEL[r]}</option>
              ))}
            </Select>
          </label>
          {target ? (
            <div className="flex items-center justify-between gap-3 sheet px-3 py-2">
              <span className="serif text-[16px] text-ink truncate">{target.title}</span>
              <button type="button" className="text-[12px] text-ink-3 hover:text-ink" onClick={() => setTarget(null)}>change</button>
            </div>
          ) : (
            <label className="block">
              <span className="eyebrow block mb-1.5">… which entry?</span>
              <input className="field" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search entries" autoFocus />
              {candidates.length ? (
                <ul className="mt-1 sheet divide-y divide-line" role="listbox" aria-label="Matching entries">
                  {candidates.map((c) => (
                    <li key={c.id}>
                      <button type="button" role="option" aria-selected={false} className="w-full text-left px-3 py-2 hover:bg-paper-3 flex items-baseline justify-between gap-3" onClick={() => { setTarget(c); setQ(""); }}>
                        <span className="serif text-[15px] text-ink">{c.title}</span>
                        <span className="text-[11px] text-ink-4 uppercase tracking-[0.08em]">{c.domain}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : q.trim() ? <p className="text-[12px] text-ink-4 mt-1">Nothing matches.</p> : null}
            </label>
          )}
          <label className="block">
            <span className="eyebrow block mb-1.5">Why? (optional)</span>
            <input className="field" value={note} onChange={(e) => setNote(e.target.value)} placeholder="The mechanism, in one line" onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void add(); }} />
          </label>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={!target || busy}>Connect</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => { setAdding(false); setTarget(null); setQ(""); }}>Cancel</Button>
          </div>
        </form>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Local graph: this entry and its neighbours                          */
/* ------------------------------------------------------------------ */

const W = 300;
const H = 210;

function LocalGraph({ entry, edges, data, fresh }: { entry: ArchiveEntry; edges: Edge[]; data: ArchiveData; fresh: string | null }) {
  const neighbours = useMemo(() => {
    const seen = new Map<string, Edge>();
    for (const e of edges) {
      const other = e.from === entry.id ? e.to : e.from;
      if (!seen.has(other)) seen.set(other, e);
    }
    const list = [...seen.keys()].map((id) => data.byId.get(id)).filter((e): e is ArchiveEntry => !!e);
    const r = Math.min(W, H) * 0.38;
    return list.map((n, i) => {
      const a = (i / list.length) * Math.PI * 2 - Math.PI / 2;
      return { entry: n, x: W / 2 + Math.cos(a) * r, y: H / 2 + Math.sin(a) * r, edge: seen.get(n.id)! };
    });
  }, [edges, entry.id, data.byId]);

  if (!neighbours.length) {
    return <p className="text-[13px] text-ink-3">Nothing connects here yet. The first connection is usually the most interesting one.</p>;
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`${entry.title} and ${neighbours.length} connected entries`}>
      {neighbours.map((n) => (
        <line key={n.edge.id} x1={W / 2} y1={H / 2} x2={n.x} y2={n.y} stroke={n.edge.user ? "var(--wine)" : "var(--line-2)"} strokeWidth={n.edge.user ? 1.2 : 1} strokeDasharray={n.edge.user ? "3 3" : undefined} className={n.edge.id === fresh ? "anim-draw" : undefined} />
      ))}
      {neighbours.map((n) => {
        const label = n.entry.title.length > 22 ? n.entry.title.slice(0, 21) + "…" : n.entry.title;
        const left = n.x < W / 2 - 4;
        return (
          <Link key={n.entry.id} href={`/archive/${n.entry.id}`}>
            <g className="cursor-pointer" tabIndex={-1}>
              <circle cx={n.x} cy={n.y} r={4} fill={domainColor(n.entry.domain)} />
              <text x={n.x + (left ? -8 : 8)} y={n.y + 3.5} fontSize={10} textAnchor={left ? "end" : "start"} fill="var(--ink-2)" fontFamily="var(--font-sans)">{label}</text>
            </g>
          </Link>
        );
      })}
      <circle cx={W / 2} cy={H / 2} r={7} fill={domainColor(entry.domain)} stroke="var(--paper)" strokeWidth={2} />
    </svg>
  );
}
