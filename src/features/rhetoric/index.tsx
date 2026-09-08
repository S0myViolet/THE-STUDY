"use client";

import React from "react";
import Link from "next/link";
import { Empty } from "@/components/ui/primitives";
import { isMode } from "@/lib/rhetoric/modes";
import { Exercise } from "./Exercise";
import { History, EntryDetail } from "./History";
import { Index } from "./RoomIndex";
import { ModePage } from "./ModePage";
import { Voice } from "./Voice";
import { promptsFor, usePrompts } from "./shared";

/**
 * The Rhetoric Room. Routes by slug:
 *   /rhetoric                       the eleven modes, voice, recent work
 *   /rhetoric/<mode>                prompts in a mode, plus "new prompt"
 *   /rhetoric/<mode>/<promptId>     the exercise
 *   /rhetoric/<promptId>            the exercise (session links use this form)
 *   /rhetoric/voice                 voice practice
 *   /rhetoric/history               every entry
 *   /rhetoric/entry/<id>            one entry with its review
 */
export function RhetoricRoom({ slug }: { slug: string[] }) {
  const { prompts, loading } = usePrompts();
  const [head, second] = slug;

  if (!head) return <Index prompts={prompts} />;
  if (head === "voice") return <Voice prompts={prompts} />;
  if (head === "history") return <History prompts={prompts} />;
  if (head === "entry" && second) return <EntryDetail id={second} prompts={prompts} />;

  if (isMode(head)) {
    if (!second) return <ModePage mode={head} prompts={promptsFor(prompts, head)} />;
    const p = prompts.find((x) => x.id === second);
    if (!p) return loading ? null : <Missing href={`/v1/rhetoric/${head}`} />;
    return <Exercise key={p.id} prompt={p} siblings={promptsFor(prompts, p.mode)} />;
  }

  const p = prompts.find((x) => x.id === head);
  if (p) return <Exercise key={p.id} prompt={p} siblings={promptsFor(prompts, p.mode)} />;
  return loading ? null : <Missing href="/v1/rhetoric" />;
}

function Missing({ href }: { href: string }) {
  return (
    <div className="page">
      <Empty
        title="No prompt by that name."
        body="It may have been generated in another browser, or the link is stale."
        action={
          <Link href={href} className="btn btn-secondary">
            Back
          </Link>
        }
      />
    </div>
  );
}
