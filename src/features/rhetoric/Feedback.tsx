"use client";

import React from "react";
import Link from "next/link";
import type { RhetoricPrompt } from "@/lib/domain/types";
import { Note } from "@/components/ui/primitives";
import type { StoredFeedback } from "@/lib/rhetoric/evaluate";
import { cx } from "@/lib/util/format";

/**
 * The review of one entry: score with context, metrics, one or two strengths,
 * one or two improvements, and, when a model produced one, a tighter version.
 */
export function FeedbackView({ feedback, prompt, configured, className }: { feedback: StoredFeedback; prompt?: RhetoricPrompt; configured: boolean; className?: string }) {
  const m = feedback.metrics;
  const c = prompt?.constraints ?? {};
  const overWords = c.maxWords ? m.words > c.maxWords : false;
  const overSentences = c.maxSentences ? m.sentences > c.maxSentences : false;
  return (
    <section className={cx("border-t border-ink pt-5 anim-place", className)} aria-label="Review">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 mb-5">
        <div className="eyebrow eyebrow-wine">Review</div>
        <div className="flex items-baseline gap-2">
          <span className="numeral text-[30px] text-ink leading-none">{Math.round(feedback.score * 100)}</span>
          <span className="text-[12px] text-ink-3">{feedback.aiEvaluated ? "blend of model and deterministic read" : "deterministic read, out of 100"}</span>
        </div>
      </div>

      <dl className="grid grid-cols-3 sm:grid-cols-5 gap-x-6 gap-y-4 border-t border-line pt-4">
        <Metric label="Words" value={m.words} sub={c.maxWords ? `of ${c.maxWords}` : undefined} warn={overWords} />
        <Metric label="Sentences" value={m.sentences} sub={c.maxSentences ? `of ${c.maxSentences}` : undefined} warn={overSentences} />
        <Metric label="Avg length" value={m.avgSentenceLength} sub="words" />
        <Metric label="Hedges" value={m.hedgeCount} warn={m.hedgeCount > 0} />
        <Metric label="Fillers" value={m.fillerCount} warn={m.fillerCount > 0} />
      </dl>

      <div className="mt-6 space-y-3">
        {feedback.strengths.map((s, i) => (
          <Note key={"s" + i} tone="forest">
            <span className="eyebrow block mb-1">{i === 0 ? "Working" : "Also working"}</span>
            {s}
          </Note>
        ))}
        {feedback.improvements.map((s, i) => (
          <Note key={"i" + i} tone="wine">
            <span className="eyebrow block mb-1">{i === 0 ? "One thing to change" : "And"}</span>
            {s}
          </Note>
        ))}
        {!feedback.strengths.length && !feedback.improvements.length ? <p className="text-[14px] text-ink-3">Nothing to say yet. Write more.</p> : null}
      </div>

      {feedback.rewrite ? (
        <div className="mt-6 sheet paper-texture p-5 md:p-6">
          <div className="eyebrow mb-2">A tighter version</div>
          <p className="serif text-[17px] text-ink leading-relaxed whitespace-pre-wrap">{feedback.rewrite}</p>
        </div>
      ) : null}

      {!configured ? (
        <p className="mt-5 text-[12px] text-ink-4">
          Deterministic review — connect a model in{" "}
          <Link href="/settings" className="underline underline-offset-4 hover:text-ink">
            Settings
          </Link>{" "}
          for a deeper read.
        </p>
      ) : null}
    </section>
  );
}

function Metric({ label, value, sub, warn }: { label: string; value: number; sub?: string; warn?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="eyebrow">{label}</dt>
      <dd className={cx("numeral text-[20px] mt-1 leading-none", warn ? "text-wine" : "text-ink")}>
        {value}
        {sub ? <span className="text-[11px] text-ink-4 ml-1">{sub}</span> : null}
      </dd>
    </div>
  );
}
