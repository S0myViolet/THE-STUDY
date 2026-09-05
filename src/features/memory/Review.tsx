"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useStudy } from "@/lib/persistence/provider";
import type { MemoryItem } from "@/lib/domain/types";
import { dueMemoryItems, reviewMemoryItem } from "@/lib/services/memory";
import { shortAnswerCorrect } from "@/lib/scoring/observation";
import { keyPointCoverage } from "@/lib/scoring/text";
import { Button, Field, TextArea, Empty } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { MemoryHeader, Finish } from "./shared";
import { orderAgreement } from "@/features/observation/Chronology";
import { createRng } from "@/lib/scene";
import { cx, relativeDays } from "@/lib/util/format";
import Link from "next/link";
import { detectRedThreads } from "@/lib/adaptation/red-thread";
import { reachMilestone } from "@/lib/services/notifications";

type Conf = 0.4 | 0.7 | 0.95;

export function Review() {
  const { db } = useStudy();
  const [queue, setQueue] = useState<MemoryItem[] | null>(null);
  const [practice, setPractice] = useState(false);
  const [i, setI] = useState(0);
  const [typed, setTyped] = useState("");
  const [order, setOrder] = useState<string[] | null>(null);
  const [conf, setConf] = useState<Conf | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [autoCorrect, setAutoCorrect] = useState<boolean | null>(null);
  const [log, setLog] = useState<{ correct: boolean; interval: number; item: MemoryItem }[]>([]);
  const startRef = useRef(performance.now());

  useEffect(() => {
    (async () => {
      const due = await dueMemoryItems(db);
      if (due.length) setQueue(due.slice(0, 20));
      else {
        const soon = await db.store("memory_items").list({ filter: (m) => !m.suspended, orderBy: "due", limit: 10 });
        setQueue(soon);
        setPractice(true);
      }
    })();
  }, [db]);

  const item = queue?.[i];
  const shuffled = useMemo(() => (item?.sequence ? createRng(i + 17).shuffle(item.sequence) : []), [item, i]);
  const seqOrder = order ?? shuffled;

  useEffect(() => {
    startRef.current = performance.now();
    setTyped("");
    setOrder(null);
    setConf(null);
    setRevealed(false);
    setAutoCorrect(null);
  }, [i]);

  if (!queue) return <div className="page"><MemoryHeader title="Recall" /></div>;
  if (!queue.length) {
    return (
      <div className="page">
        <MemoryHeader title="Recall" />
        <Empty title="Nothing is due. That is not the same as having nothing to learn." action={<Link href="/archive" className="btn btn-secondary">Explore the Archive</Link>} />
      </div>
    );
  }

  if (!item) {
    const correct = log.filter((l) => l.correct).length;
    const longIntervals = log.filter((l) => l.interval >= 7);
    return (
      <div className="page">
        <MemoryHeader title="Recall · done" />
        <div className="grid grid-cols-3 gap-6 border-t border-ink pt-4">
          <div><div className="eyebrow">Recalled</div><div className="numeral text-[28px] mt-1">{correct} / {log.length}</div></div>
          <div><div className="eyebrow">Long intervals</div><div className="numeral text-[28px] mt-1">{longIntervals.filter((l) => l.correct).length} / {longIntervals.length}</div><div className="text-[12px] text-ink-3">items 7+ days old</div></div>
          <div><div className="eyebrow">Lapses</div><div className="numeral text-[28px] mt-1">{log.length - correct}</div></div>
        </div>
        <ul className="mt-6 space-y-1">
          {log.map((l, k) => <li key={k} className={cx("text-[14px] pl-3 border-l flex justify-between gap-4", l.correct ? "border-forest" : "border-wine")}><span className="truncate">{l.item.prompt}</span><span className="numeral text-[12px] text-ink-3 shrink-0">next {relativeDays(l.item.due)}</span></li>)}
        </ul>
        <Finish />
      </div>
    );
  }

  function reveal() {
    let ok: boolean | null = null;
    if (item!.kind === "sequence" && item!.sequence) ok = orderAgreement(seqOrder, item!.sequence) >= 0.9;
    else if (item!.kind === "reconstruction" || item!.kind === "story" || item!.kind === "archive") ok = typed.trim() ? keyPointCoverage(typed, item!.answer.split(/[;.]\s+/).filter((s) => s.length > 6).slice(0, 4)).ratio >= 0.5 : null;
    else if (typed.trim()) ok = shortAnswerCorrect(typed, item!.answer, item!.accept ?? []);
    setAutoCorrect(ok);
    setRevealed(true);
  }

  async function grade(correct: boolean) {
    const latencyMs = Math.round(performance.now() - startRef.current);
    const before = item!;
    const { item: after } = await reviewMemoryItem(db, { item: before, correct, latencyMs, confidence: conf ?? undefined });
    setLog((l) => [...l, { correct, interval: before.intervalDays, item: after }]);
    if (before.intervalDays >= 90 && correct) {
      const retained = await db.store("memory_reviews").list({ filter: (r) => r.correct && r.intervalBefore >= 90 });
      if (retained.length >= 10) await reachMilestone(db, "retained_90");
    }
    if (i + 1 >= queue!.length) detectRedThreads(db).catch(() => {});
    setI((x) => x + 1);
  }

  const isSeq = item.kind === "sequence" && !!item.sequence;
  const isLong = item.kind === "reconstruction" || item.kind === "story" || item.kind === "archive";

  return (
    <div className="page">
      <MemoryHeader title={practice ? "Practice" : "Recall"}>
        <p className="text-[12px] text-ink-3 mt-2 numeral">{i + 1} / {queue.length}{practice ? " · nothing is due; practising the soonest" : ""}</p>
      </MemoryHeader>
      <div className="sheet-raised paper-texture p-6 md:p-10 anim-place" key={item.id}>
        <div className="flex items-center justify-between">
          <span className="eyebrow">{item.kind}</span>
          <span className="text-[11px] text-ink-4 numeral">interval {item.intervalDays}d · {item.reps} reps</span>
        </div>
        <p className="serif text-[26px] md:text-[30px] leading-snug mt-4">{item.prompt}</p>
        {item.hint && !revealed ? <p className="text-[13px] text-ink-3 mt-2">Hint: {item.hint}</p> : null}

        {!revealed ? (
          <div className="mt-6 space-y-4">
            {isSeq ? (
              <ol className="space-y-2" aria-label="Put in order">
                {seqOrder.map((s, k) => (
                  <li key={s} className="flex items-center gap-3 sheet p-2.5">
                    <span className="mono text-[11px] text-ink-3 w-4">{k + 1}</span>
                    <span className="flex-1 text-[15px]">{s}</span>
                    <button className="btn btn-ghost btn-sm !h-6 !px-1" aria-label="earlier" disabled={k === 0} onClick={() => { const n = [...seqOrder]; [n[k - 1], n[k]] = [n[k], n[k - 1]]; setOrder(n); }}><I.Up size={12} /></button>
                    <button className="btn btn-ghost btn-sm !h-6 !px-1" aria-label="later" disabled={k === seqOrder.length - 1} onClick={() => { const n = [...seqOrder]; [n[k + 1], n[k]] = [n[k], n[k + 1]]; setOrder(n); }}><I.Down size={12} /></button>
                  </li>
                ))}
              </ol>
            ) : isLong ? (
              <TextArea label="From memory" serif rows={5} value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Write what you remember. Structure matters more than exact wording." />
            ) : (
              <Field label="Your answer (optional: think it, then reveal)" serif value={typed} onChange={(e) => setTyped(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") reveal(); }} autoFocus />
            )}
            <div className="flex flex-wrap items-center gap-3">
              <span className="eyebrow">How sure</span>
              {([0.4, 0.7, 0.95] as Conf[]).map((c) => (
                <button key={c} className="choice !w-auto !py-1.5 !px-3 text-[13px]" aria-pressed={conf === c} onClick={() => setConf(c)}>{c === 0.4 ? "Unsure" : c === 0.7 ? "Likely" : "Certain"}</button>
              ))}
              <Button className="ml-auto" onClick={reveal}>Reveal</Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-5 anim-unfold">
            <div className="border-t border-line pt-4">
              <div className="eyebrow mb-1">Answer</div>
              {isSeq ? <ol className="space-y-1">{item.sequence!.map((s, k) => <li key={s} className="text-[15px]"><span className="mono text-[11px] text-ink-3 mr-2">{k + 1}</span>{s}</li>)}</ol> : <p className="serif text-[20px]">{item.answer}</p>}
              {item.person ? <p className="text-[13px] text-ink-3 mt-1">{item.person.profession} · {item.person.origin ?? ""} · {item.person.interest} · {item.person.detail}</p> : null}
            </div>
            {autoCorrect !== null ? <p className={cx("text-[13px]", autoCorrect ? "text-ok" : "text-wine")}>{autoCorrect ? "Your answer matched." : "Your answer did not match. Grade honestly."}</p> : null}
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => grade(false)}>Forgot</Button>
              <Button variant="secondary" onClick={() => grade(true)}>Recalled</Button>
              <span className="text-[12px] text-ink-3 self-center">Confidence and speed shape the next interval.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
