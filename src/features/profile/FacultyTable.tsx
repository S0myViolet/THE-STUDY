"use client";

import React from "react";
import Link from "next/link";
import { LevelMark, Trend } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import type { FacultyView } from "@/lib/profile/derive";
import { cx } from "@/lib/util/format";

/** The faculty list as an editorial table. Each row opens the faculty. */
export function FacultyTable({ views }: { views: FacultyView[] }) {
  return (
    <div className="relative overflow-x-auto -mx-3 px-3">
      <table className="w-full border-collapse text-[13px] min-w-[560px]">
        <thead>
          <tr className="border-b border-line-2">
            <th className="eyebrow text-left font-medium py-2 pr-3">Faculty</th>
            <th className="eyebrow text-left font-medium py-2 pr-3">Level</th>
            <th className="eyebrow text-left font-medium py-2 pr-3">Trend</th>
            <th className="eyebrow text-right font-medium py-2 pr-3">Evidence</th>
            <th className="eyebrow text-left font-medium py-2 pr-3">Confidence</th>
            <th className="sr-only">Open</th>
          </tr>
        </thead>
        <tbody>
          {views.map((v) => {
            const untested = v.evidenceCount === 0;
            return (
              <tr key={v.id} className={cx("border-b border-line group", untested && "text-ink-4")}>
                <td className="py-3 pr-3">
                  <Link href={`/v1/profile/${v.id}`} className="block">
                    <span className={cx("serif text-[18px] leading-tight block", untested ? "text-ink-4" : "text-ink group-hover:text-ink-2")}>{v.label}</span>
                    <span className="block text-[12px] text-ink-3 mt-0.5">{v.question}</span>
                  </Link>
                </td>
                <td className="py-3 pr-3 align-middle">
                  <LevelMark level={v.level} />
                </td>
                <td className="py-3 pr-3 align-middle">
                  {untested ? <span className="text-ink-4">—</span> : (
                    <span className="inline-flex items-center gap-1.5 text-ink-2">
                      <Trend trend={v.trend} />
                      <span className="text-[12px]">{v.trend === "up" ? "Rising" : v.trend === "down" ? "Falling" : "Steady"}</span>
                    </span>
                  )}
                </td>
                <td className="py-3 pr-3 align-middle text-right numeral">{v.evidenceCount}</td>
                <td className="py-3 pr-3 align-middle text-[12px]">{untested ? <span className="text-ink-4">—</span> : v.confidenceLabel}</td>
                <td className="py-3 align-middle text-right">
                  <Link href={`/v1/profile/${v.id}`} aria-label={`Open ${v.label}`} className="inline-flex text-ink-4 group-hover:text-ink">
                    <I.ArrowRight size={14} />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
