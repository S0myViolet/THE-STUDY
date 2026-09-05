"use client";

import React, { useState } from "react";
import { useStudy, useStudyQuery } from "@/lib/persistence/provider";
import type { MemoryKind } from "@/lib/domain/types";
import { createMemoryItem } from "@/lib/services/memory";
import { Button, Field, TextArea, Select, Segmented } from "@/components/ui/primitives";
import { MemoryHeader, stockStarterSet } from "./shared";
import { relativeDays, cx } from "@/lib/util/format";

const KINDS: MemoryKind[] = ["fact", "concept", "person", "sequence", "story", "spatial", "reconstruction", "archive"];

export function Library() {
  const { db } = useStudy();
  const items = useStudyQuery((db) => db.store("memory_items").list({ orderBy: "due" }), ["memory_items"]);
  const [filter, setFilter] = useState<"all" | MemoryKind>("all");
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ kind: "fact" as MemoryKind, prompt: "", answer: "", hint: "" });
  const [stocking, setStocking] = useState(false);
  const list = (items.data ?? []).filter((m) => filter === "all" || m.kind === filter);

  async function add() {
    await createMemoryItem(db, { kind: f.kind, prompt: f.prompt.trim(), answer: f.answer.trim(), hint: f.hint.trim() || undefined, sourceRef: { kind: "memory", refId: "custom" }, dueInDays: 0.5 });
    setF({ kind: "fact", prompt: "", answer: "", hint: "" });
    setAdding(false);
  }

  return (
    <div className="page">
      <MemoryHeader title="Library" eyebrow="Memory Palace">
        <p className="text-[13px] text-ink-3 mt-2">Everything the Study is keeping for you, and when it will ask.</p>
      </MemoryHeader>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Segmented value={filter} onChange={setFilter} label="Kind" options={[{ value: "all", label: "All" }, ...KINDS.map((k) => ({ value: k, label: k }))]} />
        <Button variant="secondary" size="sm" className="ml-auto" onClick={() => setAdding((a) => !a)}>Add an item</Button>
        <Button variant="ghost" size="sm" disabled={stocking} onClick={async () => { setStocking(true); await stockStarterSet(db); setStocking(false); }}>Stock the starter set</Button>
      </div>
      {adding ? (
        <div className="sheet p-5 mb-6 space-y-3 anim-unfold">
          <Select label="Kind" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as MemoryKind })}>{KINDS.filter((k) => ["fact", "concept", "story"].includes(k)).map((k) => <option key={k} value={k}>{k}</option>)}</Select>
          <Field label="Prompt" value={f.prompt} onChange={(e) => setF({ ...f, prompt: e.target.value })} serif />
          <TextArea label="Answer" value={f.answer} onChange={(e) => setF({ ...f, answer: e.target.value })} rows={2} serif />
          <Field label="Hint (optional)" value={f.hint} onChange={(e) => setF({ ...f, hint: e.target.value })} />
          <p className="text-[12px] text-ink-3">If this is about a real acquaintance, keep to ordinary details they volunteered.</p>
          <div className="flex gap-3"><Button onClick={add} disabled={f.prompt.trim().length < 3 || !f.answer.trim()}>Keep it</Button><Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button></div>
        </div>
      ) : null}
      <table className="table">
        <thead><tr><th>Prompt</th><th>Kind</th><th>Due</th><th>Interval</th><th>Reps</th><th></th></tr></thead>
        <tbody>
          {list.map((m) => (
            <tr key={m.id} className={cx(m.suspended && "opacity-50")}>
              <td className="serif text-[15px]">{m.prompt}</td>
              <td className="text-ink-3">{m.kind}</td>
              <td className="numeral">{relativeDays(m.due)}</td>
              <td className="numeral">{m.intervalDays}d</td>
              <td className="numeral">{m.reps}{m.lapses ? <span className="text-wine"> · {m.lapses} lapses</span> : null}</td>
              <td className="text-right whitespace-nowrap">
                <button className="text-[12px] text-ink-3 hover:text-ink mr-3" onClick={() => db.store("memory_items").update(m.id, { suspended: !m.suspended })}>{m.suspended ? "resume" : "suspend"}</button>
                <button className="text-[12px] text-ink-3 hover:text-wine" onClick={() => db.store("memory_items").delete(m.id)}>remove</button>
              </td>
            </tr>
          ))}
          {!list.length ? <tr><td colSpan={6} className="text-ink-3 serif text-[16px] py-8 text-center">Nothing here yet.</td></tr> : null}
        </tbody>
      </table>
    </div>
  );
}
