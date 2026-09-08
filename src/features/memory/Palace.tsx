"use client";

import React, { useMemo, useState } from "react";
import { useStudy, useStudyQuery } from "@/lib/persistence/provider";
import { stamp } from "@/lib/persistence/store";
import type { MemoryItem, MemoryLocus, MemoryPalace } from "@/lib/domain/types";
import { isDue } from "@/lib/scoring/spaced";
import { reviewMemoryItem } from "@/lib/services/memory";
import { Button, Field, TextArea, Dialog, Empty, Select } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { MemoryHeader, Finish } from "./shared";
import { cx } from "@/lib/util/format";

/**
 * The Memory Palace: user-built locations with loci; items attached with a mnemonic image.
 * A room map (SVG) shows loci; due loci are highlighted. Walking the palace reviews in order.
 */
export function Palace({ palaceId }: { palaceId?: string }) {
  const { db } = useStudy();
  const palaces = useStudyQuery((db) => db.store("memory_palaces").list({ orderBy: "createdAt" }), ["memory_palaces"]);
  const items = useStudyQuery((db) => db.store("memory_items").list({ filter: (m) => !!m.palaceLocusId }), ["memory_items"]);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const palace = (palaces.data ?? []).find((p) => p.id === palaceId) ?? (palaces.data ?? [])[0];

  async function create() {
    const p = stamp<MemoryPalace>(db.userId, "pal", { name: name.trim(), description: desc.trim() || undefined, loci: [] });
    await db.store("memory_palaces").put(p);
    setCreating(false);
    setName("");
    setDesc("");
  }

  if (palaces.loading) return <div className="page"><MemoryHeader title="Memory Palace" /></div>;

  return (
    <div className="page">
      <MemoryHeader title={palace ? palace.name : "Memory Palace"} eyebrow="Memory Palace">
        <p className="text-[13px] text-ink-3 mt-2">A mnemonic tool: places you know, loci in a fixed order, one vivid image per locus. It does not raise general intelligence. It does make lists stay put.</p>
      </MemoryHeader>
      {!palace ? (
        <Empty title="No palace yet." body="Start with a place you know by heart: your apartment, a childhood home, the walk to a station." action={<Button onClick={() => setCreating(true)}>Build a palace</Button>} />
      ) : (
        <PalaceView palace={palace} items={items.data ?? []} palaces={palaces.data ?? []} onNew={() => setCreating(true)} />
      )}
      <Dialog open={creating} onClose={() => setCreating(false)} title="A new palace">
        <div className="space-y-4">
          <Field label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="The flat on Elm Street" autoFocus />
          <TextArea label="A sentence about it (optional)" value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} />
          <div className="flex gap-3"><Button onClick={create} disabled={name.trim().length < 2}>Create</Button><Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button></div>
        </div>
      </Dialog>
    </div>
  );
}

function PalaceView({ palace, items, palaces, onNew }: { palace: MemoryPalace; items: MemoryItem[]; palaces: MemoryPalace[]; onNew: () => void }) {
  const { db } = useStudy();
  const [adding, setAdding] = useState<{ x: number; y: number } | null>(null);
  const [locusName, setLocusName] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [attach, setAttach] = useState(false);
  const [walk, setWalk] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const allItems = useStudyQuery((db) => db.store("memory_items").list({ filter: (m) => !m.palaceLocusId && !m.suspended, orderBy: "createdAt", desc: true, limit: 60 }), ["memory_items"]);
  const [pickItem, setPickItem] = useState("");
  const [image, setImage] = useState("");
  const loci = [...palace.loci].sort((a, b) => a.order - b.order);
  const itemsAt = (l: MemoryLocus) => items.filter((m) => m.palaceLocusId === l.id);
  const dueAt = (l: MemoryLocus) => itemsAt(l).some((m) => isDue(m));
  const sel = loci.find((l) => l.id === selected);

  async function addLocus() {
    if (!adding) return;
    const locus: MemoryLocus = { id: `loc_${Math.random().toString(36).slice(2, 8)}`, name: locusName.trim(), order: loci.length + 1, x: adding.x, y: adding.y };
    await db.store("memory_palaces").update(palace.id, { loci: [...palace.loci, locus] });
    setAdding(null);
    setLocusName("");
    setSelected(locus.id);
  }

  async function attachItem() {
    const item = (allItems.data ?? []).find((m) => m.id === pickItem);
    if (!item || !sel) return;
    await db.store("memory_items").update(item.id, { palaceLocusId: sel.id, hint: image.trim() || item.hint });
    await db.store("memory_palaces").update(palace.id, { loci: palace.loci.map((l) => (l.id === sel.id ? { ...l, image: image.trim() || l.image } : l)) });
    setAttach(false);
    setPickItem("");
    setImage("");
  }

  async function removeLocus(id: string) {
    for (const m of items.filter((m) => m.palaceLocusId === id)) await db.store("memory_items").update(m.id, { palaceLocusId: undefined });
    await db.store("memory_palaces").update(palace.id, { loci: palace.loci.filter((l) => l.id !== id).map((l, i) => ({ ...l, order: i + 1 })) });
    setSelected(null);
  }

  const walkLoci = loci.filter((l) => itemsAt(l).length);
  const walking = walk !== null ? walkLoci[walk] : undefined;
  const walkItem = walking ? itemsAt(walking)[0] : undefined;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
      <div>
        {palaces.length > 1 ? (
          <div className="flex flex-wrap gap-2 mb-4">{palaces.map((p) => <a key={p.id} href={`/v1/memory/palace/${p.id}`} className={cx("choice !w-auto !py-1.5 !px-3 text-[13px]", p.id === palace.id && "!border-ink")}>{p.name}</a>)}</div>
        ) : null}
        <div className="stage relative">
          <svg viewBox="0 0 800 480" className="w-full h-auto block cursor-crosshair" role="img" aria-label={`Room map of ${palace.name}`} onClick={(e) => { if (walk !== null) return; const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect(); setAdding({ x: Math.round(((e.clientX - r.left) / r.width) * 100), y: Math.round(((e.clientY - r.top) / r.height) * 100) }); }}>
            <rect x={20} y={20} width={760} height={440} fill="var(--paper-2)" stroke="var(--ink)" strokeWidth={1.5} />
            <rect x={20} y={20} width={760} height={440} fill="none" stroke="var(--line)" strokeDasharray="4 6" />
            {[0.25, 0.5, 0.75].map((f) => <line key={f} x1={20 + 760 * f} y1={20} x2={20 + 760 * f} y2={460} stroke="var(--line)" />)}
            {[0.33, 0.66].map((f) => <line key={f} x1={20} y1={20 + 440 * f} x2={780} y2={20 + 440 * f} stroke="var(--line)" />)}
            {loci.map((l, i) => {
              const nx = loci[i + 1];
              return nx ? <line key={l.id + "-p"} x1={20 + (l.x / 100) * 760} y1={20 + (l.y / 100) * 440} x2={20 + (nx.x / 100) * 760} y2={20 + (nx.y / 100) * 440} stroke="var(--line-2)" strokeDasharray="3 5" /> : null;
            })}
            {loci.map((l) => {
              const cx = 20 + (l.x / 100) * 760;
              const cy = 20 + (l.y / 100) * 440;
              const due = dueAt(l);
              const active = selected === l.id || walking?.id === l.id;
              return (
                <g key={l.id} onClick={(e) => { e.stopPropagation(); setSelected(l.id); }} role="button" tabIndex={0} aria-label={`${l.name}${due ? ", due" : ""}`} onKeyDown={(e) => { if (e.key === "Enter") setSelected(l.id); }} className="cursor-pointer">
                  <circle cx={cx} cy={cy} r={active ? 16 : 13} fill={due ? "var(--wine-soft)" : "var(--paper-3)"} stroke={active ? "var(--ink)" : due ? "var(--wine)" : "var(--line-2)"} strokeWidth={active ? 2 : 1.2} />
                  <text x={cx} y={cy + 4} textAnchor="middle" fontSize={11} fontFamily="var(--font-mono)" fill="var(--ink)">{l.order}</text>
                  <text x={cx} y={cy + 30} textAnchor="middle" fontSize={11} fontFamily="var(--font-sans)" fill="var(--ink-2)">{l.name}</text>
                  {itemsAt(l).length ? <circle cx={cx + 12} cy={cy - 12} r={3.5} fill={due ? "var(--wine)" : "var(--brass)"} /> : null}
                </g>
              );
            })}
          </svg>
          {adding ? (
            <div className="absolute inset-x-4 bottom-4 sheet-raised p-4 flex flex-wrap items-end gap-3">
              <Field label={`Locus ${loci.length + 1}`} value={locusName} onChange={(e) => setLocusName(e.target.value)} placeholder="the coat hook by the door" autoFocus onKeyDown={(e) => { if (e.key === "Enter") void addLocus(); }} className="flex-1 min-w-[200px]" />
              <Button onClick={addLocus} disabled={locusName.trim().length < 2}>Place</Button>
              <Button variant="ghost" onClick={() => setAdding(null)}>Cancel</Button>
            </div>
          ) : null}
        </div>
        <p className="text-[12px] text-ink-3 mt-2">Click the map to add a locus in walking order. Dots mark attached items; wine means something there is due.</p>
      </div>
      <aside className="space-y-6">
        {walking && walkItem ? (
          <div className="sheet-raised paper-texture p-5 anim-place">
            <div className="eyebrow">Locus {walking.order} · {walking.name}</div>
            {walking.image ? <p className="text-[13px] text-ink-3 mt-1 italic serif">{walking.image}</p> : null}
            <p className="serif text-[20px] mt-3">{walkItem.prompt}</p>
            {!revealed ? <Button className="mt-4" onClick={() => setRevealed(true)}>Reveal</Button> : (
              <div className="mt-4 space-y-3">
                <p className="serif text-[17px] text-ink-2">{walkItem.answer}</p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={async () => { await reviewMemoryItem(db, { item: walkItem, correct: false }); setRevealed(false); setWalk((w) => (w !== null && w + 1 < walkLoci.length ? w + 1 : null)); }}>Forgot</Button>
                  <Button variant="secondary" size="sm" onClick={async () => { await reviewMemoryItem(db, { item: walkItem, correct: true }); setRevealed(false); setWalk((w) => (w !== null && w + 1 < walkLoci.length ? w + 1 : null)); }}>Recalled</Button>
                </div>
              </div>
            )}
            <p className="text-[11px] text-ink-4 mt-3 numeral">{(walk ?? 0) + 1} / {walkLoci.length}</p>
          </div>
        ) : sel ? (
          <div className="sheet p-5 anim-unfold">
            <div className="flex items-start justify-between"><div><div className="eyebrow">Locus {sel.order}</div><p className="serif text-[22px]">{sel.name}</p></div><button className="btn btn-ghost btn-sm" onClick={() => removeLocus(sel.id)} aria-label="Remove locus"><I.Close size={14} /></button></div>
            {sel.image ? <p className="text-[13px] text-ink-3 mt-2 italic serif">{sel.image}</p> : null}
            <ul className="mt-3 space-y-2">{itemsAt(sel).map((m) => <li key={m.id} className="text-[14px] border-l border-line-2 pl-3"><span className="serif text-[15px]">{m.prompt}</span><span className={cx("block text-[11px]", isDue(m) ? "text-wine" : "text-ink-3")}>{isDue(m) ? "due" : `next in ${Math.max(0, Math.round((new Date(m.due).getTime() - Date.now()) / 86400000))}d`}</span></li>)}</ul>
            <Button variant="secondary" size="sm" className="mt-4" onClick={() => setAttach(true)}>Attach an item</Button>
          </div>
        ) : (
          <div className="text-[13px] text-ink-3">{loci.length ? "Select a locus to see what lives there." : "Add your first locus by clicking the map."}</div>
        )}
        <div className="border-t border-line pt-4 space-y-2">
          <Button onClick={() => { setWalk(0); setRevealed(false); setSelected(null); }} disabled={!walkLoci.length || walk !== null}>Walk the palace</Button>
          <Button variant="ghost" onClick={onNew}>Another palace</Button>
          {walk !== null ? <Finish /> : null}
        </div>
      </aside>
      <Dialog open={attach} onClose={() => setAttach(false)} title="Attach to this locus">
        <div className="space-y-4">
          <Select label="Item" value={pickItem} onChange={(e) => setPickItem(e.target.value)}>
            <option value="">Choose an unplaced item</option>
            {(allItems.data ?? []).map((m) => <option key={m.id} value={m.id}>{m.prompt.slice(0, 70)}</option>)}
          </Select>
          <TextArea label="The image (vivid, absurd, specific)" value={image} onChange={(e) => setImage(e.target.value)} rows={2} placeholder="A brass kettle boiling on the coat hook, whistling the date." />
          <div className="flex gap-3"><Button onClick={attachItem} disabled={!pickItem}>Attach</Button><Button variant="ghost" onClick={() => setAttach(false)}>Cancel</Button></div>
        </div>
      </Dialog>
    </div>
  );
}
