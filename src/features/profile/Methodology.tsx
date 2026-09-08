"use client";

import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/primitives";
import { FORMAT_WEIGHT, MASS_CAP, difficultyWeight, evidenceWeight } from "@/lib/scoring/estimates";
import { MIN_BUCKET } from "@/lib/scoring/calibration";
import { DIFFICULTY_LABEL, LEVEL_LABEL } from "@/lib/domain/faculties";
import { ProfileNav } from "./ProfileNav";

const FORMAT_NOTE: Record<keyof typeof FORMAT_WEIGHT, string> = {
  mcq: "Recognition is easier than recall; a guess is sometimes right.",
  free: "You had to produce the answer, not pick it.",
  numeric: "A number, judged by distance from the truth.",
  sort: "Ordering: partial credit for partial order.",
  timed: "Under a clock; precision matters more than speed.",
  delayed: "Recall after an interval — the strongest sign something stayed.",
};

/** Thresholds mirrored from levelFor() in lib/scoring/estimates.ts. */
const LEVEL_RULES: { level: keyof typeof LEVEL_LABEL; rule: string }[] = [
  { level: "untested", rule: "Fewer than 3 pieces of evidence, whatever they showed." },
  { level: "emerging", rule: "Estimate below 0.52." },
  { level: "reliable", rule: "Estimate at or above 0.52." },
  { level: "sharp", rule: "Estimate at or above 0.66 with at least 8 pieces." },
  { level: "advanced", rule: "Estimate at or above 0.78 with at least 20 pieces." },
  { level: "exceptional", rule: "Estimate at or above 0.88, at least 40 pieces, and estimate confidence of 0.85 or more." },
];

export function Methodology() {
  const one = 1 as const;
  const eight = 8 as const;
  return (
    <div className="page">
      <PageHeader eyebrow="Profile" title="Methodology" lede="How a faculty estimate is made from evidence, why it moves slowly, and why the Study will never hand you a single number." />
      <ProfileNav current="methodology" />

      <div className="reading-column prose-study">
        <h3>What is being estimated</h3>
        <p>
          Each of the 77 subskills carries a latent estimate between 0 and 1: roughly, the quality of response the Study expects from you on a fair task in that subskill. A faculty is the mass-weighted average of its subskills. Nothing is estimated for a subskill that has not been tested; it stays <em>Untested</em> rather than being guessed.
        </p>

        <h3>Shrinkage updates</h3>
        <p>
          A new piece of evidence does not replace the estimate; it pulls the estimate toward what the evidence showed. The pull is <span className="mono text-[15px]">gain = weight ÷ (mass + weight)</span>, where <em>mass</em> is the accumulated weight of everything seen before. A fresh subskill starts with a prior of 0.5 and a prior mass of 2, so the first piece of evidence moves it a good deal; the fortieth barely does. Mass is capped at {MASS_CAP}, so a faculty can still change with sustained new evidence, but never on the strength of one good or bad afternoon.
        </p>

        <h3>Why some evidence counts more</h3>
        <p>Weight is the product of three factors.</p>
        <ul>
          <li>
            <strong>Difficulty.</strong> Level 1 ({DIFFICULTY_LABEL[1]}) carries {difficultyWeight(one).toFixed(2)}; level 8 ({DIFFICULTY_LABEL[8]}) carries {difficultyWeight(eight).toFixed(2)}. The scale is linear between.
          </li>
          <li>
            <strong>Format.</strong>{" "}
            {(Object.keys(FORMAT_WEIGHT) as (keyof typeof FORMAT_WEIGHT)[]).map((k, i, arr) => (
              <span key={k}>
                {k} {FORMAT_WEIGHT[k].toFixed(1)}
                {i < arr.length - 1 ? " · " : "."}
              </span>
            ))}
          </li>
          <li>
            <strong>Transfer.</strong> A task that applies something learned elsewhere is multiplied by 1.5. Transfer is the point of learning; it is weighted accordingly.
          </li>
        </ul>
        <p>
          So an introductory multiple-choice item weighs {evidenceWeight({ difficulty: 1, format: "mcq" }).toFixed(2)}, and a synthesis-level delayed recall that transfers weighs {evidenceWeight({ difficulty: 8, format: "delayed", transfer: true }).toFixed(2)} — about seven times more.
        </p>

        <div className="not-prose my-8 border-t border-line-2">
          <table className="table">
            <thead>
              <tr>
                <th>Format</th>
                <th className="text-right">Weight</th>
                <th>Why</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(FORMAT_WEIGHT) as (keyof typeof FORMAT_WEIGHT)[]).map((k) => (
                <tr key={k}>
                  <td className="mono">{k}</td>
                  <td className="numeral text-right">{FORMAT_WEIGHT[k].toFixed(1)}</td>
                  <td className="text-ink-2">{FORMAT_NOTE[k]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3>Levels</h3>
        <p>Levels are words because the estimate is uncertain, and a word carries that honestly. Higher levels demand both a higher estimate and more evidence behind it.</p>
        <div className="not-prose my-6 border-t border-line-2">
          <table className="table">
            <tbody>
              {LEVEL_RULES.map((r) => (
                <tr key={r.level}>
                  <td className="w-[120px]">
                    <span className="level" data-level={r.level}>
                      {LEVEL_LABEL[r.level]}
                    </span>
                  </td>
                  <td className="text-ink-2">{r.rule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          <em>Estimate confidence</em> is a separate quantity: how much the Study trusts its own estimate, rising with evidence mass and shown as High, Moderate or Low. <em>Trend</em> compares the last five updates with the five before; it needs at least six points before it says anything other than Steady.
        </p>

        <h3>Calibration</h3>
        <p>
          Every confidence you state is kept with whether you were right. Entries are grouped into buckets (around 50, 60, 75, 85 and 95 percent). A bucket is only trusted once it holds {MIN_BUCKET} entries, and a verdict of over- or under-confidence is only given once trusted buckets hold ten between them and the gap between stated and actual exceeds eight points.
        </p>

        <h3>Why there is no score</h3>
        <p>
          A single number would have to collapse twelve faculties, each with its own evidence and uncertainty, into one figure, and then invite you to compare it with other people&apos;s. The first is a loss of information; the second is a distraction. The faculties do not trade off against each other. Being Sharp at observation and Emerging at calibration is a specific, useful thing to know; averaging them is not.
        </p>
        <p>
          The Study also does not use timed puzzles, pattern completion or vocabulary size, the material intelligence tests are made from. It watches what you do with evidence, questions, memory, numbers and people, over weeks. That is slower, narrower in each moment and much more informative about how you actually think. The map is the answer; there is no number underneath it that would say more.
        </p>

        <p className="mt-10 text-[14px] font-sans text-ink-3">
          The constants above are read from the scoring code at render time. See <Link href="/v1/profile/evidence" className="underline underline-offset-4 hover:text-ink">Evidence</Link> for the charts they produce.
        </p>
      </div>
    </div>
  );
}
