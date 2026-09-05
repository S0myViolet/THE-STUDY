"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useStudyQuery } from "@/lib/persistence/provider";
import type { RhetoricMode, RhetoricPrompt } from "@/lib/domain/types";
import { useAIStatus } from "@/lib/ai/client";
import { Empty, PageHeader, Select } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { MODES, MODE_META } from "@/lib/rhetoric/modes";
import { FeedbackView } from "./Feedback";
import { TopBar, readFeedback, useEntries } from "./shared";
import { cx, plural, shortDate } from "@/lib/util/format";

export function History({ prompts }: { prompts: RhetoricPrompt[] }) {
  const { entries, loading } = useEntries();
  const voice = useStudyQuery((db) => db.store("voice_sessions").list({ orderBy: "createdAt", desc: true, limit: 12 }), ["voice_sessions"]);
  const [mode, setMode] = useState<RhetoricMode | "all">("all");
  const titles = useMemo(() => new Map(prompts.map((p) => [p.id, p.title])), [prompts]);
  const shown = mode === "all" ? entries : entries.filter((e) => e.mode === mode);
  const modesWithEntries = MODES.filter((m) => entries.some((e) => e.mode === m));

  return (
    <div className="page">
      <TopBar href="/rhetoric" label="Rhetoric" />
      <PageHeader eyebrow="History" title="What you have said" lede="Every entry, with its review. Read your own sentences a week later; that is where most of the learning is." />
      {modesWithEntries.length > 1 ? (
        <Select label="Mode" value={mode} onChange={(e) => setMode(e.target.value as RhetoricMode | "all")} className="max-w-[220px] -mt-3 mb-6">
          <option value="all">All modes</option>
          {modesWithEntries.map((m) => (
            <option key={m} value={m}>
              {MODE_META[m].title}
            </option>
          ))}
        </Select>
      ) : null}
      {!entries.length && !loading ? (
        <Empty title="Nothing said yet." body="The history fills in as you complete exercises. Each entry keeps your text and its review." action={<Link href="/rhetoric" className="btn btn-lg">Choose a mode</Link>} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-x-10 gap-y-10">
          <ul className="divide-y divide-line border-t border-line">
            {shown.map((e) => {
              const fb = readFeedback(e);
              return (
                <li key={e.id}>
                  <Link href={`/rhetoric/entry/${e.id}`} className="group flex items-baseline gap-4 md:gap-6 py-3.5 -mx-3 px-3 rounded-sm hover:bg-paper-3">
                    <span className="numeral text-[18px] text-ink w-9 shrink-0">{fb ? Math.round(fb.score * 100) : "—"}</span>
                    <span className="flex-1 min-w-0">
                      <span className="serif text-[17px] text-ink block truncate">{titles.get(e.promptId) ?? "Prompt no longer available"}</span>
                      <span className="text-[12px] text-ink-3">
                        {MODE_META[e.mode].title} · {plural(e.wordCount, "word")}
                        {fb ? ` · ${plural(fb.metrics.hedgeCount, "hedge")}` : ""} · {shortDate(e.createdAt)}
                        {fb?.aiEvaluated ? " · model" : ""}
                      </span>
                    </span>
                    <I.ArrowRight size={14} className="text-ink-4 group-hover:text-ink shrink-0 self-center" />
                  </Link>
                </li>
              );
            })}
            {!shown.length ? <li className="py-4 text-[13px] text-ink-3">No entries in this mode.</li> : null}
          </ul>
          <aside className="space-y-6">
            <div className="border-t border-line pt-3">
              <div className="eyebrow">Entries</div>
              <div className="numeral text-[26px] mt-1 leading-none">{entries.length}</div>
              <div className="text-[12px] text-ink-3 mt-1.5">across {plural(modesWithEntries.length, "mode")}</div>
            </div>
            <div className="border-t border-line pt-3">
              <div className="flex items-baseline justify-between gap-3">
                <div className="eyebrow">Voice</div>
                <Link href="/rhetoric/voice" className="text-[11px] text-ink-3 hover:text-ink">
                  Practise
                </Link>
              </div>
              {voice.data?.length ? (
                <ul className="mt-2 space-y-1.5">
                  {voice.data.slice(0, 6).map((v) => (
                    <li key={v.id} className="text-[12px] text-ink-2 flex items-baseline gap-3">
                      <span className="numeral w-10 shrink-0">{Math.round(v.durationMs / 1000)}s</span>
                      <span className="flex-1 min-w-0 truncate">
                        {v.metrics?.wordsPerMinute ? `${v.metrics.wordsPerMinute} wpm` : "no transcript"}
                        {v.metrics ? ` · ${plural(v.metrics.fillerWords, "filler")}` : ""}
                      </span>
                      <span className="text-ink-4 shrink-0">{shortDate(v.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[12px] text-ink-3 mt-1.5">No recordings yet.</p>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export function EntryDetail({ id, prompts }: { id: string; prompts: RhetoricPrompt[] }) {
  const q = useStudyQuery((db) => db.store("rhetoric_entries").get(id), ["rhetoric_entries"], [id]);
  const aiStatus = useAIStatus();
  const entry = q.data;
  if (q.loading) return <div className="page" />;
  if (!entry)
    return (
      <div className="page">
        <Empty title="No such entry." action={<Link href="/rhetoric/history" className="btn btn-secondary">History</Link>} />
      </div>
    );
  const prompt = prompts.find((p) => p.id === entry.promptId);
  const fb = readFeedback(entry);
  const meta = MODE_META[entry.mode];
  return (
    <div className="page">
      <TopBar href="/rhetoric/history" label="History" />
      <div className="max-w-[72ch]">
        <div className="eyebrow eyebrow-wine">
          {meta.title} · {shortDate(entry.createdAt)} · {plural(entry.wordCount, "word")}
          {entry.latencyMs ? ` · ${Math.round(entry.latencyMs / 1000)}s` : ""}
        </div>
        <h1 className="display text-[30px] md:text-[36px] mt-1">{prompt?.title ?? "Prompt no longer available"}</h1>
        {prompt ? <p className="text-[14px] text-ink-3 mt-3 leading-relaxed">{prompt.prompt}</p> : null}
        <div className="sheet paper-texture p-5 md:p-7 mt-6">
          <div className="eyebrow mb-2">What you said</div>
          <p className={cx("text-ink leading-relaxed whitespace-pre-wrap", entry.mode === "precision" ? "text-[15px]" : "serif text-[18px]")}>{entry.text}</p>
        </div>
        {fb ? <FeedbackView feedback={fb} prompt={prompt} configured={aiStatus.configured || fb.aiEvaluated} className="mt-8" /> : <p className="mt-6 text-[13px] text-ink-3">This entry was saved without a review.</p>}
        <div className="mt-8 flex flex-wrap gap-3">
          {prompt ? (
            <Link href={`/rhetoric/${prompt.mode}/${prompt.id}`} className="btn">
              Try this prompt again
            </Link>
          ) : null}
          <Link href={`/rhetoric/${entry.mode}`} className="btn btn-secondary">
            More {meta.title.toLowerCase()} prompts
          </Link>
        </div>
      </div>
    </div>
  );
}
