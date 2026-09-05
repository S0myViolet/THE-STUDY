"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useStudyQuery } from "@/lib/persistence/provider";
import type { AfterAction } from "@/lib/domain/types";
import { PageHeader, Empty } from "@/components/ui/primitives";
import { ReasoningPath } from "@/components/ui/ReasoningPath";
import { I } from "@/components/ui/icons";
import { cx, longDate, shortDate } from "@/lib/util/format";

const SOURCE_HREF: Record<string, string> = { case: "/casebook", salon: "/salon", strategy: "/strategy", observation: "/observation", inference: "/inference", baseline: "/profile", memory: "/memory", rhetoric: "/rhetoric", fieldwork: "/fieldwork" };

export function AfterActionRoom({ slug }: { slug: string[] }) {
  if (slug[0]) return <Detail id={slug[0]} />;
  return <Index />;
}

function Index() {
  const q = useStudyQuery((db) => db.store("after_actions").list({ orderBy: "createdAt", desc: true, limit: 200 }), ["after_actions"]);
  const groups = useMemo(() => {
    const m = new Map<string, AfterAction[]>();
    for (const a of q.data ?? []) {
      const k = a.createdAt.slice(0, 10);
      m.set(k, [...(m.get(k) ?? []), a]);
    }
    return [...m.entries()];
  }, [q.data]);
  return (
    <div className="page">
      <PageHeader eyebrow="After Action" title="Debriefs" lede="What you saw, what you missed, what you assumed, what you did well, the turning point, and one thing to change." />
      {!groups.length && !q.loading ? <Empty title="No debriefs yet." body="Every case, conversation and scenario ends here." action={<Link href="/casebook" className="btn btn-secondary">Open the Casebook</Link>} /> : null}
      {groups.map(([day, list]) => (
        <section key={day} className="mb-8">
          <div className="eyebrow mb-1">{longDate(day + "T12:00:00")}</div>
          <ul className="divide-y divide-line border-t border-line">
            {list.map((a) => (
              <li key={a.id}>
                <Link href={`/after-action/${a.id}`} className="group flex items-baseline gap-4 py-4 -mx-3 px-3 hover:bg-paper-3 rounded-sm">
                  <span className="flex-1 min-w-0"><span className="serif text-[19px] text-ink group-hover:text-ink-2 block">{a.title}</span><span className="text-[13px] text-ink-2 block mt-0.5 truncate">{a.oneThing}</span></span>
                  {a.score !== undefined ? <span className="numeral text-[13px] text-ink-3 shrink-0">{Math.round(a.score * 100)}</span> : null}
                  <I.ArrowRight size={14} className="text-ink-4 group-hover:text-ink shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Detail({ id }: { id: string }) {
  const q = useStudyQuery((db) => db.store("after_actions").get(id), ["after_actions"], [id]);
  const a = q.data;
  if (q.loading) return <div className="page" />;
  if (!a) return <div className="page"><Empty title="No such debrief." action={<Link href="/after-action" className="btn btn-secondary">Back</Link>} /></div>;
  return (
    <div className="page">
      <Link href="/after-action" className="text-[12px] text-ink-3 hover:text-ink inline-flex items-center gap-1.5 mb-4"><I.ArrowLeft size={12} /> After Action</Link>
      <div className="eyebrow eyebrow-wine">{shortDate(a.createdAt)} · <Link href={SOURCE_HREF[a.source.kind] ?? "/desk"} className="hover:text-ink">{a.source.kind}</Link></div>
      <h1 className="display text-[32px] md:text-[40px] mt-2">{a.title}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10 mt-8">
        <div className="space-y-8">
          <List title="What you saw" items={a.saw} tone="ok" />
          <List title="What you missed" items={a.missed} tone="wine" />
          <List title="What you assumed" items={a.assumed} />
          <List title="What you did well" items={a.didWell} tone="ok" />
          {a.turningPoint ? <section><div className="eyebrow mb-2">The turning point</div><p className="serif text-[18px]">{a.turningPoint}</p></section> : null}
          <section className="border-l-2 border-brass pl-4"><div className="eyebrow eyebrow-brass mb-2">One thing to change next time</div><p className="serif text-[20px]">{a.oneThing}</p></section>
        </div>
        <aside>
          {a.reasoningPath?.length ? <><div className="eyebrow mb-3">Your reasoning path</div><ReasoningPath points={a.reasoningPath} /></> : null}
          {a.score !== undefined ? <div className="border-t border-line pt-3 mt-6"><div className="eyebrow">Score</div><div className="numeral text-[26px] mt-1">{Math.round(a.score * 100)}</div></div> : null}
        </aside>
      </div>
    </div>
  );
}

function List({ title, items, tone }: { title: string; items: string[]; tone?: "ok" | "wine" }) {
  if (!items?.length) return null;
  return <section><div className="eyebrow mb-2">{title}</div><ul className="space-y-1">{items.map((it, i) => <li key={i} className={cx("text-[14px] pl-3 border-l", tone === "ok" ? "border-forest" : tone === "wine" ? "border-wine" : "border-line-2 text-ink-2")}>{it}</li>)}</ul></section>;
}
