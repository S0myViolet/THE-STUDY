"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStudy } from "@/lib/persistence/provider";
import { stamp } from "@/lib/persistence/store";
import type { ArchiveConnection, ArchiveDomain, ArchiveEntry, ArchiveRelation, Entity, GeneratedContent } from "@/lib/domain/types";
import { ai, useAIStatus } from "@/lib/ai/client";
import { Button, Empty, Field, HairlineProgress, Select, TextArea } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { cx, plural } from "@/lib/util/format";
import { DOMAINS, DOMAIN_LABEL, KIND_GROUPS, RELATIONS, matchesQuery, pathProgress, pickRandom, statusRank } from "@/lib/archive/entries";
import { ARCHIVE_VIEWS, EntryRow, StatusMark, useArchive, type ArchiveData } from "./shared";
import { Entry } from "./Entry";
import { GraphPage } from "./GraphPage";
import { World } from "./World";
import { Timeline } from "./Timeline";
import { Reading } from "./Reading";
import { ReadingItemView } from "./ReadingItem";

export function ArchiveRoom({ slug }: { slug: string[] }) {
  switch (slug[0]) {
    case undefined:
      return <Index />;
    case "graph":
      return <GraphPage />;
    case "world":
      return <World />;
    case "timeline":
      return <Timeline />;
    case "reading":
      return slug[1] ? <ReadingItemView id={slug[1]} /> : <Reading />;
    default:
      return <Entry id={slug[0]} />;
  }
}

/* ------------------------------------------------------------------ */
/* Index: discovery                                                     */
/* ------------------------------------------------------------------ */

const EMPTY_TITLE = "The Archive is nearly empty. Start with a question, not a subject.";

function Index() {
  const data = useArchive();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState<ArchiveDomain | "all">("all");

  const paths = useMemo(() => data.entries.filter((e) => e.kind === "path"), [data.entries]);
  const visible = useMemo(
    () => data.entries.filter((e) => e.kind !== "path" && (domain === "all" || e.domain === domain) && matchesQuery(e, q)),
    [data.entries, domain, q],
  );
  const unread = useMemo(() => data.entries.filter((e) => e.kind !== "path" && statusRank(data.progress.get(e.id)?.status ?? "unread") === 0), [data.entries, data.progress]);
  const readCount = data.entries.filter((e) => e.kind !== "path" && statusRank(data.progress.get(e.id)?.status ?? "unread") >= 1).length;
  const total = data.entries.filter((e) => e.kind !== "path").length;
  const domainCounts = useMemo(() => {
    const m = new Map<ArchiveDomain, number>();
    for (const e of data.entries) if (e.kind !== "path") m.set(e.domain, (m.get(e.domain) ?? 0) + 1);
    return m;
  }, [data.entries]);

  function somethingInteresting() {
    const pool = unread.length ? unread : data.entries.filter((e) => e.kind !== "path");
    const pick = pickRandom(pool);
    if (pick) router.push(`/archive/${pick.id}`);
  }

  const interesting = (
    <Button onClick={somethingInteresting} disabled={!total} className="w-full md:w-auto">
      Give me something interesting <I.ArrowRight size={14} />
    </Button>
  );

  return (
    <div className="page">
      <header className="mb-6">
        <div className="eyebrow eyebrow-wine">The Archive</div>
        <h1 className="display text-[34px] md:text-[40px] mt-1 text-ink">Connected knowledge</h1>
        <p className="mt-2 text-ink-2 max-w-[62ch] text-[15px]">History, places, money, ideas, works. Read one, explain it back, connect it to another, keep it. {total ? `${readCount} of ${total} read.` : null}</p>
      </header>

      <label className="block mb-8">
        <span className="sr-only">Search the Archive</span>
        <div className="relative">
          <I.Search size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-ink-4" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title, tag, subject" className="serif w-full bg-transparent border-0 border-b border-line-2 focus:border-ink outline-none pl-7 py-2 text-[20px] text-ink placeholder:text-ink-4" type="search" />
        </div>
      </label>

      {/* Mobile composition: actions first */}
      <div className="md:hidden mb-8 space-y-4">
        {interesting}
        <nav className="flex items-center justify-between text-[12px]" aria-label="Archive views">
          {ARCHIVE_VIEWS.map((v) => {
            const Icon = I[v.icon];
            return (
              <Link key={v.href} href={v.href} className="inline-flex items-center gap-1.5 text-ink-3 hover:text-ink">
                <Icon size={13} /> {v.label}
              </Link>
            );
          })}
        </nav>
        <Select label="Domain" value={domain} onChange={(e) => setDomain(e.target.value as ArchiveDomain | "all")}>
          <option value="all">All domains</option>
          {DOMAINS.filter((d) => domainCounts.get(d)).map((d) => (
            <option key={d} value={d}>{DOMAIN_LABEL[d]} · {domainCounts.get(d)}</option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-12">
        <div className="min-w-0">
          {paths.length && !q && domain === "all" ? (
            <section className="mb-12">
              <div className="eyebrow border-b border-line-2 pb-2 mb-1">Paths</div>
              <ul className="divide-y divide-line">
                {paths.map((p) => {
                  const pr = pathProgress(p, data.progress);
                  return (
                    <li key={p.id}>
                      <Link href={`/archive/${p.id}`} className="group block py-4 -mx-2 px-2 rounded-sm hover:bg-paper-3">
                        <span className="flex items-baseline justify-between gap-4">
                          <span className="serif text-[22px] text-ink group-hover:text-ink-2">{p.title}</span>
                          <span className="numeral text-[12px] text-ink-3 shrink-0">{pr.done} / {pr.total}</span>
                        </span>
                        <span className="block text-[14px] text-ink-2 mt-0.5 max-w-[64ch]">{p.summary}</span>
                        <HairlineProgress value={pr.total ? pr.done / pr.total : 0} className="mt-3 max-w-[320px]" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {!visible.length && !data.loading ? (
            <Empty title={EMPTY_TITLE} body={q ? `Nothing matches “${q}”. Ask the Archive below and a model can write the entry, or clear the search.` : undefined} action={interesting} />
          ) : (
            KIND_GROUPS.map((g) => {
              const items = visible.filter((e) => g.kinds.includes(e.kind));
              if (!items.length) return null;
              return (
                <section key={g.title} className="mb-10">
                  <div className="flex items-baseline justify-between border-b border-line-2 pb-2 mb-1">
                    <span className="eyebrow">{g.title}</span>
                    <span className="numeral text-[11px] text-ink-4">{items.length}</span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                    {items.map((e) => (
                      <li key={e.id} className="border-b border-line last:border-b-0 sm:[&:nth-last-child(2)]:border-b-0">
                        <EntryRow entry={e} status={data.progress.get(e.id)?.status ?? "unread"} meta={<>{DOMAIN_LABEL[e.domain]}{e.origin === "generated" ? " · generated" : ""}</>} />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })
          )}
        </div>

        <aside className="hidden md:block space-y-8">
          <div>{interesting}</div>
          <div>
            <div className="eyebrow mb-2">Views</div>
            <ul className="space-y-1.5">
              {ARCHIVE_VIEWS.map((v) => {
                const Icon = I[v.icon];
                return (
                  <li key={v.href}>
                    <Link href={v.href} className="inline-flex items-center gap-2 text-[14px] text-ink-2 hover:text-ink">
                      <Icon size={14} className="text-ink-4" /> {v.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <div className="eyebrow mb-2">Domain</div>
            <ul className="space-y-0.5" role="group" aria-label="Filter by domain">
              <li>
                <button type="button" aria-pressed={domain === "all"} onClick={() => setDomain("all")} className={cx("w-full flex justify-between text-[13px] py-0.5 hover:text-ink", domain === "all" ? "text-ink" : "text-ink-3")}>
                  <span>All</span><span className="numeral">{total}</span>
                </button>
              </li>
              {DOMAINS.filter((d) => domainCounts.get(d)).map((d) => (
                <li key={d}>
                  <button type="button" aria-pressed={domain === d} onClick={() => setDomain(domain === d ? "all" : d)} className={cx("w-full flex justify-between text-[13px] py-0.5 hover:text-ink", domain === d ? "text-ink" : "text-ink-3")}>
                    <span>{DOMAIN_LABEL[d]}</span><span className="numeral">{domainCounts.get(d)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <AskTheArchive data={data} initialQuestion={q} />
        </aside>
      </div>

      <div className="md:hidden mt-10 border-t border-line pt-6">
        <AskTheArchive data={data} initialQuestion={q} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Ask the Archive                                                      */
/* ------------------------------------------------------------------ */

export function AskTheArchive({ data, initialQuestion = "" }: { data: ArchiveData; initialQuestion?: string }) {
  const { db } = useStudy();
  const router = useRouter();
  const status = useAIStatus();
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState(initialQuestion);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const existing = useMemo(() => {
    const t = `${title} ${question}`.toLowerCase();
    return data.entries.find((e) => e.kind !== "path" && t.includes(e.title.toLowerCase()));
  }, [data.entries, title, question]);

  async function submit() {
    const t = title.trim() || question.trim().slice(0, 60);
    if (!t) return;
    if (!status.configured) {
      router.push(`/curator?q=${encodeURIComponent(question.trim() || t)}`);
      return;
    }
    setBusy(true);
    setError(null);
    const res = await ai.call("generateArchiveEntry", { title: t, question: question.trim() || undefined, existing: data.entries.filter((e) => e.kind !== "path").map((e) => e.id) });
    if (!res.ok) {
      setBusy(false);
      setError(res.reason === "unconfigured" ? "No model is connected. Ask the Curator instead." : "The model did not return an entry. Try again, or ask the Curator.");
      return;
    }
    const { connections, ...entry } = res.data;
    const id = data.byId.has(entry.id) ? `${entry.id}-${Date.now().toString(36)}` : entry.id;
    const payload: ArchiveEntry = { ...entry, id, origin: "generated" };
    await db.store("generated_content").put(stamp<GeneratedContent>(db.userId, "gen", { kind: "archive", refId: id, payload, model: res.model }));
    const known = new Set(data.entries.map((e) => e.id));
    for (const c of connections ?? []) {
      if (!known.has(c.to)) continue;
      const relation = (RELATIONS as string[]).includes(c.relation) ? (c.relation as ArchiveRelation) : "RELATED_TO";
      await db.store("archive_user_connections").put(stamp<ArchiveConnection & Entity>(db.userId, "uconn", { from: id, to: c.to, relation, note: c.note ? `${c.note} (suggested by the model)` : "Suggested by the model" }));
    }
    setBusy(false);
    router.push(`/archive/${id}`);
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <div className="eyebrow">Ask the Archive</div>
      <Field label="Subject" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="The Hanseatic League" />
      <TextArea label="Your question" rows={3} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Why did a league of towns work without a king?" onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void submit(); }} />
      {existing ? (
        <p className="text-[12px] text-ink-3">Already here: <Link href={`/archive/${existing.id}`} className="underline underline-offset-4 hover:text-ink">{existing.title}</Link></p>
      ) : null}
      {error ? <p className="text-[12px] text-bad">{error}</p> : null}
      <div className="flex items-center gap-3">
        <Button type="submit" variant="secondary" size="sm" disabled={busy || (!title.trim() && !question.trim())}>
          {busy ? "Writing the entry…" : status.configured ? "Write an entry" : "Ask the Curator"}
        </Button>
        {status.configured ? <span className="text-[11px] text-ink-4">{plural(data.entries.length, "entry", "entries")} known</span> : null}
      </div>
      {!status.configured && !status.loading ? <p className="text-[12px] text-ink-4">Without a model the question goes to the Curator. Connect a model in Settings to have entries written here.</p> : null}
    </form>
  );
}

export { StatusMark };
