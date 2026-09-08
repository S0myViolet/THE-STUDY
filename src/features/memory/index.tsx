"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useStudy, useStudyQuery } from "@/lib/persistence/provider";
import { PageHeader, Button, Empty } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { isDue, retentionRisk } from "@/lib/scoring/spaced";
import { MODES, stockStarterSet } from "./shared";
import { Review } from "./Review";
import { People } from "./People";
import { Reconstruct } from "./Reconstruct";
import { StoryChain } from "./StoryChain";
import { Spatial } from "./Spatial";
import { ConceptWeb } from "./ConceptWeb";
import { Palace } from "./Palace";
import { Library } from "./Library";
import { minutes, plural } from "@/lib/util/format";

export function MemoryRoom({ slug }: { slug: string[] }) {
  switch (slug[0]) {
    case "review": return <Review />;
    case "people": return <People />;
    case "reconstruct": return <Reconstruct />;
    case "story": return <StoryChain />;
    case "spatial": return <Spatial />;
    case "web": return <ConceptWeb />;
    case "palace": return <Palace palaceId={slug[1]} />;
    case "library": return <Library />;
    default: return <Index />;
  }
}

function Index() {
  const { db } = useStudy();
  const items = useStudyQuery((db) => db.store("memory_items").list(), ["memory_items"]);
  const reviews = useStudyQuery((db) => db.store("memory_reviews").list({ orderBy: "createdAt", desc: true, limit: 200 }), ["memory_reviews"]);
  const palaces = useStudyQuery((db) => db.store("memory_palaces").list(), ["memory_palaces"]);
  const [stocking, setStocking] = useState(false);
  const all = items.data ?? [];
  const due = all.filter((m) => isDue(m));
  const atRisk = all.filter((m) => !isDue(m) && retentionRisk(m) > 0.6).length;
  const byKind = useMemo(() => { const m = new Map<string, number>(); for (const it of all) m.set(it.kind, (m.get(it.kind) ?? 0) + 1); return [...m.entries()]; }, [all]);
  const retention = useMemo(() => {
    const r = reviews.data ?? [];
    const long = r.filter((x) => x.intervalBefore >= 7);
    return { all: r.length ? r.filter((x) => x.correct).length / r.length : null, long: long.length >= 5 ? long.filter((x) => x.correct).length / long.length : null, n: r.length, nLong: long.length };
  }, [reviews.data]);

  useEffect(() => {}, []);

  return (
    <div className="page">
      <PageHeader eyebrow="Memory Palace" title="Keep" lede="Working recall, long retention, names and details, sequences, spaces, concepts. Retrieval, spaced, with confidence and speed shaping the next interval." aside={due.length ? <Link href="/v1/memory/review" className="btn btn-lg">Recall {due.length} <I.ArrowRight size={14} /></Link> : null} />
      {!all.length && !items.loading ? (
        <div className="mb-10">
          <Empty title="Nothing is due. That is not the same as having nothing to learn." body="Stock the palace with the Study's starter set: facts with Archive links, concepts, sequences, stories and a few people to remember." action={<div className="flex gap-3"><Button disabled={stocking} onClick={async () => { setStocking(true); await stockStarterSet(db); setStocking(false); }}>{stocking ? "Stocking…" : "Stock the starter set"}</Button><Link href="/v1/archive" className="btn btn-secondary">Explore the Archive</Link></div>} />
        </div>
      ) : null}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10">
        <ul className="divide-y divide-line border-t border-line">
          {MODES.map((m) => (
            <li key={m.id}>
              <Link href={m.href} className="group flex items-start gap-6 py-5 -mx-3 px-3 rounded-sm hover:bg-paper-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3"><span className="serif text-[22px] text-ink group-hover:text-ink-2">{m.title}</span><span className="text-[11px] text-ink-4">{minutes(m.minutes)}</span>{m.id === "review" && due.length ? <span className="text-[11px] text-wine">{due.length} due</span> : null}{m.id === "palace" && palaces.data?.length ? <span className="text-[11px] text-ink-3">{plural(palaces.data.length, "palace")}</span> : null}</div>
                  <p className="text-[14px] text-ink-2 mt-1 max-w-[60ch]">{m.blurb}</p>
                </div>
                <I.ArrowRight size={14} className="mt-2 text-ink-4 group-hover:text-ink shrink-0" />
              </Link>
            </li>
          ))}
          <li><Link href="/v1/memory/library" className="group flex items-start gap-6 py-5 -mx-3 px-3 rounded-sm hover:bg-paper-3"><div className="flex-1"><span className="serif text-[22px] text-ink group-hover:text-ink-2">Library</span><p className="text-[14px] text-ink-2 mt-1">Everything kept, and when it will be asked. Add your own.</p></div><I.ArrowRight size={14} className="mt-2 text-ink-4 group-hover:text-ink" /></Link></li>
        </ul>
        <aside className="space-y-6">
          <div className="border-t border-line pt-3"><div className="eyebrow">Due now</div><div className="numeral text-[28px] mt-1">{due.length}</div><div className="text-[12px] text-ink-3 mt-1">{atRisk ? `${atRisk} more at risk soon` : all.length ? `${all.length} items kept` : "Nothing kept yet"}</div></div>
          <div className="border-t border-line pt-3"><div className="eyebrow">Retention</div><div className="numeral text-[28px] mt-1">{retention.all === null ? "—" : `${Math.round(retention.all * 100)}%`}</div><div className="text-[12px] text-ink-3 mt-1">{retention.n ? `${retention.n} reviews` : "No reviews yet"}{retention.long !== null ? ` · ${Math.round(retention.long * 100)}% at 7+ days (n = ${retention.nLong})` : ""}</div></div>
          {byKind.length ? <div className="border-t border-line pt-3"><div className="eyebrow mb-2">By kind</div><ul className="text-[13px] space-y-1">{byKind.map(([k, n]) => <li key={k} className="flex justify-between"><span className="text-ink-2">{k}</span><span className="numeral">{n}</span></li>)}</ul></div> : null}
          <p className="text-[12px] text-ink-4 border-t border-line pt-3">Delayed recall is stronger evidence than immediate recall. Items reviewed after long intervals count more toward Retention.</p>
        </aside>
      </div>
    </div>
  );
}
