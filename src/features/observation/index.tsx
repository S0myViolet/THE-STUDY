"use client";

import React from "react";
import Link from "next/link";
import { useStudyQuery } from "@/lib/persistence/provider";
import { PageHeader } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { MODES, MODE_META } from "./shared";
import { Glance } from "./Glance";
import { RoomScan } from "./RoomScan";
import { Change } from "./Change";
import { Chronology } from "./Chronology";
import { DocumentScan } from "./DocumentScan";
import { SignalNoise } from "./SignalNoise";
import { Missing } from "./Missing";
import { ObservationOrStory } from "./ObservationOrStory";
import { GLANCE_EXERCISES, CHANGE_EXERCISES, DOCUMENT_EXERCISES, CHRONOLOGY_EXERCISES, SIGNAL_EXERCISES, MISSING_EXERCISES, OBSERVATION_OR_STORY, ROOM_SCAN_EXERCISES } from "@/content";
import { shortDate, minutes } from "@/lib/util/format";
import type { ObservationMode } from "@/lib/domain/types";

export function ObservationRoom({ slug }: { slug: string[] }) {
  const mode = slug[0] as ObservationMode | undefined;
  switch (mode) {
    case "glance":
      return <Glance />;
    case "room_scan":
      return <RoomScan />;
    case "change":
      return <Change />;
    case "chronology":
      return <Chronology />;
    case "document":
      return <DocumentScan />;
    case "signal_noise":
      return <SignalNoise />;
    case "missing":
      return <Missing />;
    case "observation_or_story":
      return <ObservationOrStory />;
    default:
      return <Index />;
  }
}

const COUNTS: Record<ObservationMode, () => number> = {
  glance: () => GLANCE_EXERCISES.length,
  room_scan: () => ROOM_SCAN_EXERCISES.length,
  change: () => CHANGE_EXERCISES.length,
  chronology: () => CHRONOLOGY_EXERCISES.length,
  document: () => DOCUMENT_EXERCISES.length,
  signal_noise: () => SIGNAL_EXERCISES.length,
  missing: () => MISSING_EXERCISES.length,
  observation_or_story: () => OBSERVATION_OR_STORY.length,
};

function Index() {
  const attempts = useStudyQuery((db) => db.store("observation_attempts").list({ orderBy: "createdAt", desc: true }), ["observation_attempts"]);
  const all = attempts.data ?? [];
  const scored = all.filter((a) => a.coverage !== undefined && a.precision !== undefined);
  const cov = scored.length ? scored.reduce((s, a) => s + (a.coverage ?? 0), 0) / scored.length : null;
  const prec = scored.length ? scored.reduce((s, a) => s + (a.precision ?? 0), 0) / scored.length : null;
  const byMode = new Map<ObservationMode, { n: number; last: string }>();
  for (const a of all) {
    const cur = byMode.get(a.mode) ?? { n: 0, last: a.createdAt };
    cur.n++;
    byMode.set(a.mode, cur);
  }

  return (
    <div className="page">
      <PageHeader eyebrow="Observation Room" title="Notice" lede="Seeing is passive. Observing is a skill: detail, position, text, change, order, and the discipline of not inventing what was never there." />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10">
        <ul className="divide-y divide-line border-t border-line">
          {MODES.map((m) => {
            const meta = MODE_META[m];
            const stat = byMode.get(m);
            const count = COUNTS[m]();
            return (
              <li key={m}>
                <Link href={`/observation/${m}`} className="group flex items-start gap-6 py-5 -mx-3 px-3 rounded-sm hover:bg-paper-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3">
                      <span className="serif text-[22px] text-ink group-hover:text-ink-2">{meta.title}</span>
                      <span className="text-[11px] text-ink-4">{minutes(meta.minutes)}</span>
                    </div>
                    <p className="text-[14px] text-ink-2 mt-1 max-w-[60ch]">{meta.blurb}</p>
                  </div>
                  <div className="text-right text-[12px] text-ink-3 shrink-0 pt-1">
                    {stat ? <div>{stat.n} attempt{stat.n > 1 ? "s" : ""} · {shortDate(stat.last)}</div> : <div>{count ? `${count} prepared` : "procedural"}</div>}
                    <I.ArrowRight size={14} className="inline-block mt-2 text-ink-4 group-hover:text-ink" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
        <aside className="space-y-6">
          <div className="border-t border-line pt-3">
            <div className="eyebrow">Observation precision</div>
            <div className="numeral text-[28px] mt-1">{prec === null ? "—" : `${Math.round(prec * 100)}%`}</div>
            <div className="text-[12px] text-ink-3 mt-1">{scored.length ? `Of what you report, how much was real · n = ${scored.length}` : "Not enough evidence yet."}</div>
          </div>
          <div className="border-t border-line pt-3">
            <div className="eyebrow">Observation coverage</div>
            <div className="numeral text-[28px] mt-1">{cov === null ? "—" : `${Math.round(cov * 100)}%`}</div>
            <div className="text-[12px] text-ink-3 mt-1">{scored.length ? "Of what mattered, how much you noticed" : "Look at something first."}</div>
          </div>
          {prec !== null && cov !== null && scored.length >= 5 ? (
            <p className="serif text-[16px] text-ink-2">{prec - cov > 0.15 ? "You invent little and miss much. Look longer." : cov - prec > 0.15 ? "You notice a great deal, and some of it was never there. Hedge what you are unsure of." : "Coverage and precision are in balance."}</p>
          ) : null}
          <div className="border-t border-line pt-3 text-[12px] text-ink-3">
            <p>A user who recalls fifteen details but invents six does not outperform one who accurately recalls ten. Precision is weighted above coverage.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
