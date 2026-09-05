"use client";

import React, { useState } from "react";
import { useStudy, useStudyQuery } from "@/lib/persistence/provider";
import { stamp } from "@/lib/persistence/store";
import type { ArchiveNote } from "@/lib/domain/types";
import { Button, TextArea } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { shortDate } from "@/lib/util/format";

export function Notes({ entryId }: { entryId: string }) {
  const { db } = useStudy();
  const notes = useStudyQuery((db) => db.store("archive_notes").list({ where: { entryId } as Partial<ArchiveNote>, orderBy: "createdAt" }), ["archive_notes"], [entryId]);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [busy, setBusy] = useState(false);

  async function add() {
    const text = draft.trim();
    if (!text || busy) return;
    setBusy(true);
    await db.store("archive_notes").put(stamp<ArchiveNote>(db.userId, "anote", { entryId, text }));
    setDraft("");
    setBusy(false);
  }

  async function save(id: string) {
    const text = editText.trim();
    if (!text) return;
    await db.store("archive_notes").update(id, { text });
    setEditing(null);
  }

  const list = notes.data ?? [];

  return (
    <section aria-label="Notes">
      <div className="flex items-baseline justify-between border-t border-ink pt-3 mb-3">
        <span className="eyebrow">Notes</span>
        <span className="numeral text-[11px] text-ink-4">{list.length || ""}</span>
      </div>
      {list.length ? (
        <ul className="divide-y divide-line mb-4">
          {list.map((n) => (
            <li key={n.id} className="py-3 group">
              {editing === n.id ? (
                <div className="space-y-2">
                  <TextArea serif rows={3} value={editText} onChange={(e) => setEditText(e.target.value)} onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void save(n.id); if (e.key === "Escape") setEditing(null); }} autoFocus aria-label="Edit note" />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => save(n.id)}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="serif text-[16px] text-ink leading-snug whitespace-pre-wrap">{n.text}</p>
                  <div className="mt-1.5 flex items-center gap-3 text-[11px] text-ink-4">
                    <span className="numeral">{shortDate(n.createdAt)}</span>
                    <button type="button" className="hover:text-ink opacity-0 group-hover:opacity-100 focus:opacity-100" onClick={() => { setEditing(n.id); setEditText(n.text); }}>edit</button>
                    <button type="button" className="hover:text-ink opacity-0 group-hover:opacity-100 focus:opacity-100" aria-label="Delete note" onClick={() => db.store("archive_notes").delete(n.id)}>delete</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : null}
      <TextArea serif rows={2} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={list.length ? "Another note" : "A question this raised, a disagreement, a thing to check."} aria-label="New note" onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void add(); }} />
      <div className="mt-2 flex items-center justify-between">
        <Button size="sm" variant="secondary" disabled={!draft.trim() || busy} onClick={add}><I.Plus size={12} /> Add note</Button>
        <span className="text-[11px] text-ink-4">Ctrl/⌘ Enter</span>
      </div>
    </section>
  );
}
