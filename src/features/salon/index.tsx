"use client";

import React from "react";
import Link from "next/link";
import { useStudyQuery } from "@/lib/persistence/provider";
import { PageHeader, Empty } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { SALON_SCENARIOS } from "@/content";
import { DIFFICULTY_LABEL } from "@/lib/domain/faculties";
import { minutes, shortDate } from "@/lib/util/format";
import { Conversation } from "./Conversation";
import { GenerateSalon } from "./GenerateSalon";
import type { SalonScenario } from "@/lib/domain/types";

export function SalonRoom({ slug }: { slug: string[] }) {
  const generated = useStudyQuery((db) => db.store("generated_content").list({ where: { kind: "salon" } }), ["generated_content"]);
  const all: SalonScenario[] = [...SALON_SCENARIOS, ...((generated.data ?? []).map((g) => g.payload as SalonScenario))];
  if (slug[0]) {
    const s = all.find((x) => x.id === slug[0]);
    if (!s) return generated.loading ? null : <div className="page"><Empty title="No one by that name in the Salon." action={<Link href="/salon" className="btn btn-secondary">Back</Link>} /></div>;
    return <Conversation key={s.id} scenario={s} />;
  }
  return <Index scenarios={all} />;
}

function Index({ scenarios }: { scenarios: SalonScenario[] }) {
  const sessions = useStudyQuery((db) => db.store("salon_sessions").list({ orderBy: "createdAt", desc: true }), ["salon_sessions"]);
  const by = new Map<string, { active?: boolean; completed: number; best?: number; last?: string }>();
  for (const s of sessions.data ?? []) {
    const cur = by.get(s.scenarioId) ?? { completed: 0 };
    if (s.status === "active") cur.active = true;
    else { cur.completed++; cur.best = Math.max(cur.best ?? 0, s.review?.score ?? 0); cur.last = cur.last ?? s.completedAt; }
    by.set(s.scenarioId, cur);
  }
  const completed = (sessions.data ?? []).filter((s) => s.status === "completed" && s.review);
  const asked = completed.reduce((s, x) => s + (x.review?.questionsAsked ?? 0), 0);
  const forcing = completed.reduce((s, x) => s + (x.review?.questionsForcingNewInfo ?? 0), 0);

  return (
    <div className="page">
      <PageHeader eyebrow="The Salon" title="Converse" lede="Fictional people who do not reveal everything at once. Understand what they know, what they want and what they are avoiding. Let them talk." aside={<GenerateSalon />} />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10">
        <ul className="divide-y divide-line border-t border-line">
          {scenarios.map((s) => {
            const st = by.get(s.id);
            return (
              <li key={s.id}>
                <Link href={`/salon/${s.id}`} className="group flex items-start gap-6 py-5 -mx-3 px-3 rounded-sm hover:bg-paper-3">
                  <div className="flex-1 min-w-0">
                    <div className="serif text-[22px] text-ink group-hover:text-ink-2">{s.character.name} <span className="text-ink-3 text-[16px]">· {s.character.role}</span></div>
                    <p className="text-[14px] text-ink-2 mt-1 max-w-[62ch]">{s.title}. {s.objectives[0]?.text}</p>
                    <p className="text-[11px] text-ink-4 mt-2">{DIFFICULTY_LABEL[s.difficulty]} · {minutes(s.estimatedMinutes)} · {s.hiddenFacts.length} things unsaid</p>
                  </div>
                  <div className="text-right text-[12px] text-ink-3 shrink-0 pt-1">
                    {st?.active ? <span className="text-wine">In progress</span> : st?.completed ? <span className="numeral">{Math.round((st.best ?? 0) * 100)} · {st.last ? shortDate(st.last) : ""}</span> : null}
                    <I.ArrowRight size={14} className="block ml-auto mt-2 text-ink-4 group-hover:text-ink" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
        <aside className="space-y-6">
          <div className="border-t border-line pt-3"><div className="eyebrow">Questions per new fact</div><div className="numeral text-[28px] mt-1">{forcing ? (asked / forcing).toFixed(1) : "—"}</div><div className="text-[12px] text-ink-3 mt-1">{completed.length ? `${asked} questions, ${forcing} that forced information, across ${completed.length} conversation${completed.length === 1 ? "" : "s"}` : "Lower is better, once you have talked to someone."}</div></div>
          <div className="border-t border-line pt-3 text-[12px] text-ink-3 space-y-2">
            <p>Leading questions produce agreement or defensiveness, not information. Open questions attached to a specific observation produce the most.</p>
            <p>Nothing here is body-language reading. It is what people say, when, and what they avoid.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
