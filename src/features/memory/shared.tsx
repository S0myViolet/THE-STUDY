"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { StudyDatabase } from "@/lib/persistence/store";
import { MEMORY_SEEDS, PEOPLE } from "@/content";
import { createMemoryItem } from "@/lib/services/memory";
import { useSessionItem } from "@/lib/services/session-context";
import { Button } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";

export const MODES: { id: string; title: string; blurb: string; href: string; minutes: number }[] = [
  { id: "review", title: "Recall", blurb: "What is due, retrieved and rescheduled. The core loop.", href: "/v1/memory/review", minutes: 6 },
  { id: "people", title: "Names & Details", blurb: "Four people, one detail each. Later: who was Maya, and what did she mention?", href: "/v1/memory/people", minutes: 5 },
  { id: "reconstruct", title: "Reconstruct", blurb: "Rebuild an argument or a concept from memory, then compare.", href: "/v1/memory/reconstruct", minutes: 6 },
  { id: "story", title: "Story Chain", blurb: "A sequence remembered through association, then reassembled.", href: "/v1/memory/story", minutes: 4 },
  { id: "spatial", title: "Spatial Memory", blurb: "Study an arrangement. Then put everything back where it was.", href: "/v1/memory/spatial", minutes: 5 },
  { id: "web", title: "Concept Web", blurb: "Given one idea, recall what it connects to.", href: "/v1/memory/web", minutes: 4 },
  { id: "palace", title: "Memory Palace", blurb: "Rooms and loci of your own. A mnemonic tool, not magic.", href: "/v1/memory/palace", minutes: 8 },
];

/** Stock the user's memory with the Study's starter set (idempotent). */
export async function stockStarterSet(db: StudyDatabase): Promise<number> {
  let n = 0;
  for (const s of MEMORY_SEEDS) {
    const existing = await db.store("memory_items").list({ filter: (m) => m.sourceRef?.refId === s.id });
    if (existing.length) continue;
    await createMemoryItem(db, {
      kind: s.kind,
      prompt: s.prompt,
      answer: s.answer,
      accept: s.accept,
      hint: s.hint,
      sequence: s.sequence,
      person: s.person ? { name: s.person.name, profession: s.person.profession, detail: s.person.detail, interest: s.person.interest, origin: s.person.origin } : undefined,
      sourceRef: { kind: "memory", refId: s.id, label: "Starter set" },
      tags: s.tags,
      dueInDays: (n % 5) * 0.4,
    });
    n++;
  }
  return n;
}

export function peopleNotYetLearned(known: Set<string>) {
  return PEOPLE.filter((p) => !known.has(p.id));
}

export function MemoryHeader({ title, eyebrow = "Memory Palace", children }: { title: string; eyebrow?: string; children?: React.ReactNode }) {
  const { inSession } = useSessionItem();
  return (
    <header className="mb-6">
      <div className="flex items-center justify-between gap-4 mb-3">
        <Link href="/v1/memory" className="text-[12px] text-ink-3 hover:text-ink inline-flex items-center gap-1.5"><I.ArrowLeft size={12} /> Memory Palace</Link>
        {inSession ? <span className="mark"><span className="mark-dot" /> Today&apos;s session</span> : null}
      </div>
      <div className="eyebrow eyebrow-wine">{eyebrow}</div>
      <h1 className="display text-[30px] md:text-[36px] mt-1">{title}</h1>
      {children}
    </header>
  );
}

export function Finish({ onAgain, againLabel = "Again" }: { onAgain?: () => void; againLabel?: string }) {
  const { finish, inSession } = useSessionItem();
  const router = useRouter();
  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      {inSession ? <Button size="lg" onClick={() => finish()}>Continue the session <I.ArrowRight size={14} /></Button> : (
        <>
          {onAgain ? <Button size="lg" onClick={onAgain}>{againLabel}</Button> : null}
          <Button variant="secondary" onClick={() => router.push("/v1/memory")}>Memory Palace</Button>
        </>
      )}
    </div>
  );
}
