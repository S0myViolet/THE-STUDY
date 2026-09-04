"use client";

import React from "react";
import Link from "next/link";
import { useStudyQuery } from "@/lib/persistence/provider";
import { PageHeader } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { MODES, MODE_META } from "./shared";
import { ThreeStories, BestExplanation, MissingVariable, BaseRate, Counterfactual, Anomaly } from "./modes-a";
import { HowSure, InformationValue, Ladder, Causal, FastSlow } from "./modes-b";
import { calibrationVerdict } from "@/lib/scoring/calibration";
import { minutes, shortDate } from "@/lib/util/format";
import type { InferenceMode } from "@/lib/domain/types";

export function InferenceRoom({ slug }: { slug: string[] }) {
  const [mode, id] = slug as [string | undefined, string | undefined];
  switch (mode) {
    case "three_stories": return <ThreeStories id={id} />;
    case "best_explanation": return <BestExplanation id={id} />;
    case "missing_variable": return <MissingVariable id={id} />;
    case "base_rate": return <BaseRate id={id} />;
    case "counterfactual": return <Counterfactual id={id} />;
    case "disconfirm": return <Counterfactual id={id} disconfirm />;
    case "anomaly": return <Anomaly id={id} />;
    case "how_sure": return <HowSure id={id} />;
    case "information_value": return <InformationValue id={id} />;
    case "ladder": return <Ladder id={id} />;
    case "causal": return <Causal id={id} />;
    case "fast_slow": return <FastSlow id={id} />;
    default: return <Index />;
  }
}

function Index() {
  const attempts = useStudyQuery((db) => db.store("inference_attempts").list({ orderBy: "createdAt", desc: true }), ["inference_attempts"]);
  const confidences = useStudyQuery((db) => db.store("confidence_entries").list(), ["confidence_entries"]);
  const byMode = new Map<InferenceMode, { n: number; last: string; mean: number }>();
  for (const a of attempts.data ?? []) {
    const cur = byMode.get(a.mode) ?? { n: 0, last: a.createdAt, mean: 0 };
    cur.mean = (cur.mean * cur.n + (a.score ?? 0)) / (cur.n + 1);
    cur.n++;
    byMode.set(a.mode, cur);
  }
  const cal = calibrationVerdict(confidences.data ?? []);
  const rows: { mode: string; title: string; blurb: string; minutes: number; href: string }[] = [
    ...MODES.map((m) => ({ mode: m, title: MODE_META[m].title, blurb: MODE_META[m].blurb, minutes: MODE_META[m].minutes, href: `/inference/${m}` })),
    { mode: "causal", title: "Causal Reasoning", blurb: "Reverse causation, confounding, selection, regression to the mean. Which explains the claim?", minutes: 4, href: "/inference/causal" },
  ];

  return (
    <div className="page">
      <PageHeader eyebrow="Inference Room" title="Reason" lede="Evidence, possibilities, priors, questions, new evidence, update, conclusion. Not riddles; discipline." />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10">
        <ul className="divide-y divide-line border-t border-line">
          {rows.map((r) => {
            const stat = byMode.get(r.mode as InferenceMode);
            return (
              <li key={r.mode}>
                <Link href={r.href} className="group flex items-start gap-6 py-5 -mx-3 px-3 rounded-sm hover:bg-paper-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3"><span className="serif text-[22px] text-ink group-hover:text-ink-2">{r.title}</span><span className="text-[11px] text-ink-4">{minutes(r.minutes)}</span></div>
                    <p className="text-[14px] text-ink-2 mt-1 max-w-[60ch]">{r.blurb}</p>
                  </div>
                  <div className="text-right text-[12px] text-ink-3 shrink-0 pt-1">
                    {stat ? <div>{stat.n} · {shortDate(stat.last)}</div> : null}
                    <I.ArrowRight size={14} className="inline-block mt-2 text-ink-4 group-hover:text-ink" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
        <aside className="space-y-6">
          <div className="border-t border-line pt-3">
            <div className="eyebrow">Calibration</div>
            <div className="serif text-[22px] mt-1">{cal.verdict === "insufficient" ? "Not enough yet" : cal.verdict === "well_calibrated" ? "Well calibrated" : cal.verdict === "overconfident" ? "Overconfident" : "Underconfident"}</div>
            <div className="text-[12px] text-ink-3 mt-1">{cal.n ? `${cal.n} confidence judgements in sufficient buckets` : "State confidences and they accumulate here."}</div>
          </div>
          <div className="border-t border-line pt-3 text-[12px] text-ink-3 space-y-2">
            <p>The core loop: evidence → possibilities → priors → questions → new evidence → update → conclusion.</p>
            <p>&ldquo;Insufficient evidence&rdquo; is sometimes the correct conclusion, and is scored as such.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
