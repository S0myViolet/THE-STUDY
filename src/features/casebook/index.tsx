"use client";

import React from "react";
import Link from "next/link";
import { useStudy, useStudyQuery } from "@/lib/persistence/provider";
import { PageHeader, Empty, Button } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { CASES } from "@/content";
import type { CaseDefinition } from "@/lib/domain/types";
import { DIFFICULTY_LABEL, FACULTY_META } from "@/lib/domain/faculties";
import { minutes, shortDate, cx } from "@/lib/util/format";
import { CasePlayer } from "./CasePlayer";
import { GenerateCase } from "./GenerateCase";

export function CasebookRoom({ slug }: { slug: string[] }) {
  const generated = useStudyQuery((db) => db.store("generated_content").list({ where: { kind: "case" } }), ["generated_content"]);
  const all: CaseDefinition[] = [...CASES, ...((generated.data ?? []).map((g) => g.payload as CaseDefinition))];
  if (slug[0]) {
    const kase = all.find((c) => c.id === slug[0]);
    if (!kase) {
      if (generated.loading) return null;
      return (
        <div className="page">
          <Empty title="No such file in the Casebook." action={<Link href="/casebook" className="btn btn-secondary">Back to the Casebook</Link>} />
        </div>
      );
    }
    return <CasePlayer key={kase.id} kase={kase} />;
  }
  return <CaseList cases={all} />;
}

function CaseList({ cases }: { cases: CaseDefinition[] }) {
  const { db } = useStudy();
  const attempts = useStudyQuery((db) => db.store("case_attempts").list({ orderBy: "createdAt", desc: true }), ["case_attempts"]);
  const byCase = new Map<string, { active?: boolean; completed: number; best?: number; last?: string }>();
  for (const a of attempts.data ?? []) {
    const cur = byCase.get(a.caseId) ?? { completed: 0 };
    if (a.status === "active") cur.active = true;
    if (a.status === "completed") {
      cur.completed++;
      cur.best = Math.max(cur.best ?? 0, a.summary?.overallScore ?? 0);
      cur.last = cur.last ?? a.completedAt;
    }
    byCase.set(a.caseId, cur);
  }
  const open = cases.filter((c) => byCase.get(c.id)?.active);
  const fresh = cases.filter((c) => !byCase.get(c.id));
  const closed = cases.filter((c) => byCase.get(c.id)?.completed && !byCase.get(c.id)?.active);

  const Row = ({ c }: { c: CaseDefinition }) => {
    const s = byCase.get(c.id);
    return (
      <li>
        <Link href={`/casebook/${c.id}`} className="group grid grid-cols-[64px_1fr_auto] md:grid-cols-[72px_1fr_180px_120px] gap-4 items-baseline py-4 border-t border-line hover:bg-paper-3 -mx-3 px-3 rounded-sm">
          <span className="mono text-[12px] text-ink-3">{c.number}</span>
          <span className="min-w-0">
            <span className="serif text-[20px] text-ink group-hover:text-ink-2 block truncate">{c.title}</span>
            <span className="block text-[13px] text-ink-3 truncate">{c.setting}</span>
          </span>
          <span className="hidden md:block text-[12px] text-ink-3">{c.faculties.slice(0, 3).map((f) => FACULTY_META[f].label).join(" · ")}</span>
          <span className="text-right text-[12px] text-ink-3">
            {s?.active ? <span className="text-wine">Open</span> : s?.completed ? <span className="numeral">{Math.round((s.best ?? 0) * 100)} · {s.last ? shortDate(s.last) : ""}</span> : <span>{DIFFICULTY_LABEL[c.difficulty]} · {minutes(c.estimatedMinutes)}</span>}
          </span>
        </Link>
      </li>
    );
  };

  return (
    <div className="page">
      <PageHeader eyebrow="Casebook" title="Cases" lede="Each file combines several faculties in one situation. Notice, recall, separate, hypothesise, ask, update, decide, explain. Then read the debrief." aside={<GenerateCase existing={cases} />} />
      {open.length ? (
        <section className="mb-10">
          <div className="eyebrow mb-1">Open</div>
          <ul>{open.map((c) => <Row key={c.id} c={c} />)}</ul>
        </section>
      ) : null}
      <section className="mb-10">
        <div className="eyebrow mb-1">Unopened</div>
        {fresh.length ? <ul>{fresh.map((c) => <Row key={c.id} c={c} />)}</ul> : <p className="serif text-[18px] text-ink-3 py-4">Every seeded file has been opened. Generate a new one, or reopen a closed case with fresh eyes.</p>}
      </section>
      {closed.length ? (
        <section>
          <div className="eyebrow mb-1">Closed</div>
          <ul>{closed.map((c) => <Row key={c.id} c={c} />)}</ul>
        </section>
      ) : null}
      {!cases.length ? <Empty title="The Casebook is empty." body="Seeded cases are being prepared." /> : null}
      <p className={cx("mt-10 text-[12px] text-ink-4")}>Scores are quality of reasoning across stages, not merely whether you reached the answer. {db.mode === "local" ? "Stored locally in this browser." : ""}</p>
    </div>
  );
}
