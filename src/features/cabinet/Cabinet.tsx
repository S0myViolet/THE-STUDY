"use client";

import React, { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useStudy } from "@/lib/persistence/provider";
import { stamp } from "@/lib/persistence/store";
import type { ArchiveDomain, Curiosity, CuriosityView, GeneratedContent } from "@/lib/domain/types";
import { ai } from "@/lib/ai/client";
import { Button, PageHeader, Select, Spinner } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { plural, shortDate } from "@/lib/util/format";
import { DOMAINS, DOMAIN_LABEL } from "@/lib/archive/entries";
import { useArchive } from "@/features/archive/shared";
import { coerceCuriosity, dailyPick, drawers, leastRecentlySeen, randomUnseen, readingMinutes, seenState, type Drawer } from "@/lib/cabinet/curiosities";
import { SeenLegend, SeenMark, useCabinet } from "./shared";

const MOBILE = "(max-width: 767px)";

function subscribeMobile(cb: () => void) {
  const mq = window.matchMedia(MOBILE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** True below 768px; false during server rendering so hydration matches. */
function useIsMobile(): boolean {
  return useSyncExternalStore(subscribeMobile, () => window.matchMedia(MOBILE).matches, () => false);
}

interface Offer {
  message: string;
  lead: string;
  pick?: Curiosity;
}

export function CabinetIndex() {
  const { db } = useStudy();
  const router = useRouter();
  const params = useSearchParams();
  const cab = useCabinet();
  const archive = useArchive();
  const wantRandom = params.get("random") === "1";
  const isMobile = useIsMobile();
  const [toggled, setToggled] = useState<ReadonlySet<ArchiveDomain>>(() => new Set());
  const [domain, setDomain] = useState<ArchiveDomain | "any">("any");
  const [busy, setBusy] = useState(false);
  const [offer, setOffer] = useState<Offer | null>(null);

  const today = useMemo(() => (cab.loading ? undefined : dailyPick(cab.items, cab.views)), [cab.loading, cab.items, cab.views]);
  const groups = useMemo(() => drawers(cab.items), [cab.items]);
  const recent = useMemo(
    () =>
      [...cab.views.values()]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map((view) => ({ view, item: cab.byId.get(view.curiosityId) }))
        .filter((x): x is { view: CuriosityView; item: Curiosity } => !!x.item)
        .slice(0, 5),
    [cab.views, cab.byId],
  );

  // /cabinet?random=1 — the command palette's "Give me something strange".
  useEffect(() => {
    if (!wantRandom || cab.loading) return;
    const pick = randomUnseen(cab.items, cab.views);
    if (pick) router.replace(`/v1/cabinet/${pick.id}`);
  }, [wantRandom, cab.loading, cab.items, cab.views, router]);

  function strange() {
    const pick = randomUnseen(cab.items, cab.views);
    if (pick) router.push(`/v1/cabinet/${pick.id}`);
  }

  function toggle(d: ArchiveDomain) {
    setToggled((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  }

  function isOpen(d: ArchiveDomain): boolean {
    // Desktop: every drawer open. Mobile: only today's drawer, until tapped.
    const byDefault = !isMobile || (today ? today.domain === d : false);
    return toggled.has(d) ? !byDefault : byDefault;
  }

  async function askNew(e: React.FormEvent) {
    e.preventDefault();
    if (busy || cab.loading) return;
    setBusy(true);
    setOffer(null);
    let message = "Generation needs a model — connect one in Settings.";
    const status = await ai.getStatus();
    if (status.configured) {
      const res = await ai.call("generateCuriosity", {
        domain: domain === "any" ? undefined : domain,
        avoid: cab.items.map((c) => c.id),
        existing: archive.entries.filter((en) => en.kind !== "path").map((en) => en.id),
      });
      if (res.ok) {
        const cur = coerceCuriosity(res.data, new Set(cab.items.map((c) => c.id)));
        await db.store("generated_content").put(stamp<GeneratedContent>(db.userId, "gen", { kind: "curiosity", refId: cur.id, payload: cur, model: res.model }));
        setBusy(false);
        router.push(`/v1/cabinet/${cur.id}?fresh=1`);
        return;
      }
      if (res.reason !== "unconfigured") message = "The model did not return a curiosity.";
    }
    const lrs = leastRecentlySeen(cab.items, cab.views);
    const pick = lrs ?? randomUnseen(cab.items, cab.views);
    setOffer({ message, lead: lrs ? "Until then, the one you saw longest ago:" : "Nothing has been opened yet. Start with", pick });
    setBusy(false);
  }

  if (wantRandom) {
    return (
      <div className="page">
        <Spinner label="Choosing something strange" />
      </div>
    );
  }

  const total = cab.items.length;

  return (
    <div className="page">
      <PageHeader
        eyebrow={
          <>
            The Cabinet · <span className="numeral">{cab.seen}</span> of <span className="numeral">{total}</span> seen
            {cab.connected ? (
              <>
                {" "}
                · <span className="numeral">{cab.connected}</span> connected
              </>
            ) : null}
          </>
        }
        title="Cabinet of Curiosities"
        lede="How things came to be the way they are: twenty mechanisms worth knowing for their own sake, each with a thread back into the Archive."
      />

      {/* Today's curiosity */}
      <section aria-labelledby="today-eyebrow" className="border-t border-ink pt-5 md:flex md:items-end md:justify-between md:gap-12">
        {today ? (
          <>
            <div className="min-w-0">
              <div id="today-eyebrow" className="eyebrow eyebrow-brass">
                Today&apos;s curiosity · {DOMAIN_LABEL[today.domain]}
                {seenState(cab.views, today.id) !== "unseen" ? " · seen" : ""}
              </div>
              <Link href={`/v1/cabinet/${today.id}`} className="block mt-2 group">
                <h2 className="display text-[28px] md:text-[36px] text-ink group-hover:text-ink-2 leading-tight">{today.title}</h2>
              </Link>
              <p className="serif text-[18px] md:text-[19px] text-ink-2 mt-3 max-w-[60ch] leading-snug">{today.hook}</p>
              <p className="text-[12px] text-ink-3 mt-3">
                Connects to {plural(today.connects.length, "Archive entry", "Archive entries")} · about {plural(readingMinutes(today.body), "minute")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-6 md:mt-0 shrink-0">
              <Link href={`/v1/cabinet/${today.id}`} className="btn btn-lg">
                Open <I.ArrowRight size={14} />
              </Link>
              <Button variant="secondary" size="lg" onClick={strange}>
                Something strange
              </Button>
            </div>
          </>
        ) : (
          <div className="py-6">
            <Spinner label="Opening the cabinet" />
          </div>
        )}
      </section>

      {/* Drawers */}
      <section className="mt-14" aria-labelledby="drawers-eyebrow">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 mb-3">
          <div id="drawers-eyebrow" className="eyebrow">
            Drawers · {plural(groups.length, "domain")}
          </div>
          <SeenLegend />
        </div>
        <div className="md:columns-2 md:gap-x-16">
          {groups.map((g) => (
            <DrawerView key={g.domain} drawer={g} open={isOpen(g.domain)} onToggle={() => toggle(g.domain)} views={cab.views} />
          ))}
        </div>
      </section>

      {/* A new one */}
      <section className="mt-14 border-t border-line-2 pt-5 md:grid md:grid-cols-[1fr_auto] md:gap-12 md:items-start" aria-labelledby="ask-eyebrow">
        <div>
          <div id="ask-eyebrow" className="eyebrow">
            A new one
          </div>
          <p className="serif text-[18px] text-ink mt-2 max-w-[52ch] leading-snug">Ask for a curiosity the cabinet does not hold yet. Whatever arrives stays in the drawers.</p>
        </div>
        <form className="mt-4 md:mt-0 flex flex-wrap items-end gap-3" onSubmit={askNew}>
          <Select label="Domain" className="w-44" value={domain} onChange={(e) => setDomain(e.target.value as ArchiveDomain | "any")}>
            <option value="any">Any</option>
            {DOMAINS.map((d) => (
              <option key={d} value={d}>
                {DOMAIN_LABEL[d]}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="secondary" disabled={busy || cab.loading}>
            <I.Sparkle size={14} /> {busy ? "Asking" : "Ask for a new one"}
          </Button>
        </form>
        {offer ? (
          <p className="md:col-span-2 mt-4 text-[13px] text-ink-3 anim-fade" role="status">
            {offer.message}{" "}
            {offer.pick ? (
              <>
                {offer.lead}{" "}
                <Link href={`/v1/cabinet/${offer.pick.id}`} className="serif text-[15px] text-ink underline underline-offset-4 decoration-line-2 hover:decoration-ink">
                  {offer.pick.title}
                </Link>
                .
              </>
            ) : null}
          </p>
        ) : null}
      </section>

      {/* Recently opened */}
      {recent.length ? (
        <section className="mt-14 border-t border-line-2 pt-5" aria-labelledby="recent-eyebrow">
          <div id="recent-eyebrow" className="eyebrow mb-1">
            Recently opened
          </div>
          <ul className="divide-y divide-line">
            {recent.map(({ view, item }) => (
              <li key={view.id}>
                <Link href={`/v1/cabinet/${item.id}`} className="flex items-baseline justify-between gap-4 py-2.5 -mx-2 px-2 rounded-sm hover:bg-paper-3">
                  <span className="min-w-0 serif text-[16px] text-ink truncate">{item.title}</span>
                  <span className="shrink-0 inline-flex items-baseline gap-3 text-[11px] text-ink-4">
                    {view.note ? <span>note</span> : null}
                    {view.connectedTo.length ? <span>{plural(view.connectedTo.length, "connection")}</span> : null}
                    <span className="numeral">{shortDate(view.updatedAt)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Drawer                                                               */
/* ------------------------------------------------------------------ */

function DrawerView({ drawer, open, onToggle, views }: { drawer: Drawer; open: boolean; onToggle: () => void; views: Map<string, CuriosityView> }) {
  const seenCount = drawer.items.filter((c) => seenState(views, c.id) !== "unseen").length;
  const listId = `drawer-${drawer.domain}`;
  return (
    <section className="break-inside-avoid mb-7" aria-label={`${drawer.label} drawer`}>
      <button type="button" className="w-full flex items-baseline justify-between gap-3 border-t border-line-2 pt-3 pb-1 text-left group" aria-expanded={open} aria-controls={listId} onClick={onToggle}>
        <span className="eyebrow text-ink group-hover:text-ink-2">{drawer.label}</span>
        <span className="inline-flex items-center gap-3 text-ink-4">
          <span className="numeral text-[11px]">
            {seenCount}/{drawer.items.length}
          </span>
          {open ? <I.Collapse size={12} /> : <I.Expand size={12} />}
        </span>
      </button>
      {open ? (
        <ul id={listId} className="anim-unfold">
          {drawer.items.map((c) => (
            <li key={c.id}>
              <Row c={c} views={views} />
            </li>
          ))}
        </ul>
      ) : (
        <p id={listId} className="text-[12px] text-ink-4 pt-1">
          {plural(drawer.items.length, "curiosity", "curiosities")}
        </p>
      )}
    </section>
  );
}

function Row({ c, views }: { c: Curiosity; views: Map<string, CuriosityView> }) {
  const state = seenState(views, c.id);
  return (
    <Link href={`/v1/cabinet/${c.id}`} className="group flex items-start gap-3 py-2.5 -mx-2 px-2 rounded-sm hover:bg-paper-3">
      <SeenMark state={state} className="mt-[7px]" />
      <span className="min-w-0">
        <span className="serif text-[17px] leading-snug text-ink group-hover:text-ink-2 block">
          {c.title}
          {c.origin === "generated" ? <span className="ml-2 text-[10px] tracking-[0.1em] uppercase text-ink-4 align-middle">generated</span> : null}
        </span>
        <span className="block text-[12.5px] text-ink-3 mt-0.5 leading-snug">{c.hook}</span>
      </span>
    </Link>
  );
}
