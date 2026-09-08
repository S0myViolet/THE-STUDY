"use client";

import React from "react";
import Link from "next/link";
import { useStudyQuery } from "@/lib/persistence/provider";
import { PageHeader, Empty } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { STRATEGY_SCENARIOS } from "@/content";
import type { StrategyScenario } from "@/lib/domain/types";
import { DIFFICULTY_LABEL } from "@/lib/domain/faculties";
import { minutes, shortDate } from "@/lib/util/format";
import { Player } from "./Player";
import { GenerateStrategy } from "./GenerateStrategy";

const MODE_BLURB: Record<StrategyScenario["mode"], string> = {
  three_moves: "If you do X, what happens next? Then what? Then what?",
  counterparty: "You choose. A counterpart responds to incentives, not hopes.",
  incentive_map: "Goals, constraints, leverage, fears, alternatives, likely behaviour.",
  option_value: "Irreversible action now, or an information-gathering step first?",
  red_team: "You propose a plan. The Study attacks its assumptions.",
  premortem: "Assume the plan failed. Why?",
  second_order: "What happens because of what happens?",
  negotiation: "BATNA, reservation values, information, silence, framing.",
  story: "A long-running situation where decisions persist.",
};

export function StrategyRoom({ slug }: { slug: string[] }) {
  const generated = useStudyQuery((db) => db.store("generated_content").list({ where: { kind: "strategy" } }), ["generated_content"]);
  const all: StrategyScenario[] = [...STRATEGY_SCENARIOS, ...((generated.data ?? []).map((g) => g.payload as StrategyScenario))];
  if (slug[0]) {
    const s = all.find((x) => x.id === slug[0]);
    if (!s) return generated.loading ? null : <div className="page"><Empty title="No scenario by that name." action={<Link href="/v1/strategy" className="btn btn-secondary">Back to the table</Link>} /></div>;
    return <Player key={s.id} scenario={s} />;
  }
  return <Index scenarios={all} />;
}

function Index({ scenarios }: { scenarios: StrategyScenario[] }) {
  const runs = useStudyQuery((db) => db.store("strategy_runs").list({ orderBy: "createdAt", desc: true }), ["strategy_runs"]);
  const by = new Map<string, { active?: boolean; completed: number; best?: number; last?: string }>();
  for (const r of runs.data ?? []) {
    const cur = by.get(r.scenarioId) ?? { completed: 0 };
    if (r.status === "active") cur.active = true;
    else { cur.completed++; cur.best = Math.max(cur.best ?? 0, r.score ?? 0); cur.last = cur.last ?? r.completedAt; }
    by.set(r.scenarioId, cur);
  }
  const completed = (runs.data ?? []).filter((r) => r.status === "completed");
  const mean = completed.length ? completed.reduce((s, r) => s + (r.score ?? 0), 0) / completed.length : null;

  return (
    <div className="page">
      <PageHeader eyebrow="Strategy Table" title="Think further" lede="Incentives, second-order effects, optionality, negotiation. Not criminal strategy; the ordinary strategy of a person who thinks past the first move." aside={<GenerateStrategy />} />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10">
        <ul className="divide-y divide-line border-t border-line">
          {scenarios.map((s) => {
            const st = by.get(s.id);
            return (
              <li key={s.id}>
                <Link href={`/v1/strategy/${s.id}`} className="group flex items-start gap-6 py-5 -mx-3 px-3 rounded-sm hover:bg-paper-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3 flex-wrap"><span className="serif text-[22px] text-ink group-hover:text-ink-2">{s.title}</span><span className="eyebrow">{s.mode.replace("_", " ")}</span></div>
                    <p className="text-[14px] text-ink-2 mt-1 max-w-[62ch]">{s.summary}</p>
                    <p className="text-[11px] text-ink-4 mt-2">{DIFFICULTY_LABEL[s.difficulty]} · {minutes(s.estimatedMinutes)} · {s.actors.length} actors · {MODE_BLURB[s.mode]}</p>
                  </div>
                  <div className="text-right text-[12px] text-ink-3 shrink-0 pt-1">
                    {st?.active ? <span className="text-wine">In play</span> : st?.completed ? <span className="numeral">{Math.round((st.best ?? 0) * 100)} · {st.last ? shortDate(st.last) : ""}</span> : null}
                    <I.ArrowRight size={14} className="block ml-auto mt-2 text-ink-4 group-hover:text-ink" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
        <aside className="space-y-6">
          <div className="border-t border-line pt-3"><div className="eyebrow">Quality of play</div><div className="numeral text-[28px] mt-1">{mean === null ? "—" : Math.round(mean * 100)}</div><div className="text-[12px] text-ink-3 mt-1">{completed.length ? `mean over ${completed.length} scenario${completed.length === 1 ? "" : "s"}` : "Complete a scenario first."}</div></div>
          <div className="border-t border-line pt-3 text-[12px] text-ink-3 space-y-2">
            <p>Sometimes the correct move is to wait, ask, or verify. The table does not reward recklessness.</p>
            <p>Decisions you log in the Decision Journal can be reviewed later against what actually happened.</p>
            <Link href="/decisions" className="inline-flex items-center gap-1 text-ink hover:underline underline-offset-4">Decision Journal <I.ArrowRight size={12} /></Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
