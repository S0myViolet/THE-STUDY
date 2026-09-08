"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import type { RhetoricPrompt } from "@/lib/domain/types";
import { PageHeader } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { MODES, MODE_META } from "@/lib/rhetoric/modes";
import { Sparkline, readFeedback, useEntries } from "./shared";
import { plural, shortDate } from "@/lib/util/format";

export function Index({ prompts }: { prompts: RhetoricPrompt[] }) {
  const { entries, loading } = useEntries();
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of prompts) m.set(p.mode, (m.get(p.mode) ?? 0) + 1);
    return m;
  }, [prompts]);
  const titles = useMemo(() => new Map(prompts.map((p) => [p.id, p.title])), [prompts]);
  const recent = entries.slice(0, 5);
  const lastTen = entries.slice(0, 10);
  const hedges = [...lastTen].reverse().map((e) => e.feedback?.metrics.hedgeCount ?? 0);
  const meanWords = entries.length ? Math.round(entries.reduce((s, e) => s + e.wordCount, 0) / entries.length) : null;
  const meanScore = entries.length ? entries.reduce((s, e) => s + (e.feedback?.score ?? 0), 0) / entries.length : null;

  return (
    <div className="page">
      <PageHeader eyebrow="Rhetoric" title="Say exactly what you mean" lede="Eleven short disciplines for putting an idea into words that survive contact with a listener. Each one is judged on structure, coverage and economy; each leaves evidence behind." />
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-x-12 gap-y-10">
        <div className="min-w-0">
          <div className="eyebrow mb-1">Modes</div>
          <ol className="divide-y divide-line border-t border-line">
            {MODES.map((id, i) => {
              const m = MODE_META[id];
              const n = counts.get(id) ?? 0;
              return (
                <li key={id}>
                  <Link href={`/v1/rhetoric/${id}`} className="group flex items-baseline gap-4 md:gap-6 py-4 -mx-3 px-3 rounded-sm hover:bg-paper-3">
                    <span className="mono text-[11px] text-ink-4 w-5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex-1 min-w-0">
                      <span className="serif text-[21px] md:text-[22px] text-ink group-hover:text-ink-2 block leading-snug">{m.title}</span>
                      <span className="text-[13.5px] text-ink-2 block mt-0.5 max-w-[60ch]">{m.blurb}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="numeral text-[12px] text-ink-3 block">{plural(n, "prompt")}</span>
                      <I.ArrowRight size={14} className="inline-block mt-1.5 text-ink-4 group-hover:text-ink" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>

          <div className="eyebrow mt-10 mb-1">Aloud</div>
          <div className="border-t border-line">
            <Link href="/v1/rhetoric/voice" className="group flex items-baseline gap-4 md:gap-6 py-4 -mx-3 px-3 rounded-sm hover:bg-paper-3">
              <span className="w-5 shrink-0 text-ink-4 self-center">
                <I.Mic size={14} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="serif text-[21px] md:text-[22px] text-ink group-hover:text-ink-2 block leading-snug">Voice</span>
                <span className="text-[13.5px] text-ink-2 block mt-0.5 max-w-[60ch]">Record yourself, hear it back, count the fillers and the pace. Nothing is uploaded.</span>
              </span>
              <span className="shrink-0">
                <I.ArrowRight size={14} className="inline-block text-ink-4 group-hover:text-ink" />
              </span>
            </Link>
          </div>
        </div>

        <aside className="space-y-6 lg:pt-6">
          <div className="border-t border-line pt-3">
            <div className="flex items-baseline justify-between gap-3">
              <div className="eyebrow">Recent work</div>
              {entries.length ? (
                <Link href="/v1/rhetoric/history" className="text-[11px] text-ink-3 hover:text-ink">
                  All {entries.length}
                </Link>
              ) : null}
            </div>
            {recent.length ? (
              <ul className="mt-2 divide-y divide-line">
                {recent.map((e) => {
                  const fb = readFeedback(e);
                  return (
                    <li key={e.id}>
                      <Link href={`/v1/rhetoric/entry/${e.id}`} className="group flex items-baseline gap-3 py-2.5 -mx-2 px-2 rounded-sm hover:bg-paper-3">
                        <span className="numeral text-[15px] text-ink w-7 shrink-0">{fb ? Math.round(fb.score * 100) : "—"}</span>
                        <span className="flex-1 min-w-0">
                          <span className="text-[13px] text-ink block truncate">{titles.get(e.promptId) ?? "Prompt no longer available"}</span>
                          <span className="text-[11px] text-ink-4">
                            {MODE_META[e.mode].title} · {shortDate(e.createdAt)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-[13px] text-ink-3 mt-2">{loading ? "Reading the ledger." : "Nothing yet. One Sentence is a good first exercise."}</p>
            )}
          </div>
          {entries.length ? (
            <>
              <div className="border-t border-line pt-3 grid grid-cols-2 gap-4">
                <div>
                  <div className="eyebrow">Mean score</div>
                  <div className="numeral text-[24px] mt-1 leading-none">{meanScore === null ? "—" : Math.round(meanScore * 100)}</div>
                  <div className="text-[11px] text-ink-4 mt-1">n = {entries.length}</div>
                </div>
                <div>
                  <div className="eyebrow">Average words</div>
                  <div className="numeral text-[24px] mt-1 leading-none">{meanWords ?? "—"}</div>
                  <div className="text-[11px] text-ink-4 mt-1">per entry</div>
                </div>
              </div>
              <div className="border-t border-line pt-3">
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <div className="eyebrow">Hedges per entry</div>
                  <span className="text-[11px] text-ink-4">last {lastTen.length}</span>
                </div>
                <Sparkline values={hedges} label="Hedges per entry, oldest to newest" />
                <p className="text-[11px] text-ink-4 mt-1">{hedgeTrendLine(hedges)}</p>
              </div>
            </>
          ) : null}
          <p className="text-[11px] text-ink-4 border-t border-line pt-3">Evidence goes to Clarity, Concision, Argument, Explanation, Storytelling, Analogy and Verbal precision in your Profile.</p>
        </aside>
      </div>
    </div>
  );
}

function hedgeTrendLine(values: number[]): string {
  if (values.length < 3) return "A trend needs three entries.";
  const half = Math.floor(values.length / 2);
  const early = values.slice(0, half).reduce((a, b) => a + b, 0) / half;
  const late = values.slice(half).reduce((a, b) => a + b, 0) / (values.length - half);
  if (late < early - 0.3) return "Fewer hedges lately.";
  if (late > early + 0.3) return "More hedges lately. Decide, then say it.";
  return values.every((v) => v === 0) ? "No hedges in any of these." : "Holding steady.";
}
