"use client";

import React, { useMemo, useState } from "react";
import { useStudy, useStudyQuery } from "@/lib/persistence/provider";
import { PEOPLE } from "@/content";
import type { PersonCard } from "@/lib/domain/content";
import { createMemoryItem } from "@/lib/services/memory";
import { recordEvidence, recordError } from "@/lib/services/evidence";
import { shortAnswerCorrect } from "@/lib/scoring/observation";
import { Button, Field, useCountdown } from "@/components/ui/primitives";
import { MemoryHeader, Finish } from "./shared";
import { createRng } from "@/lib/scene";
import { cx, seedFromString, todayKey } from "@/lib/util/format";

/**
 * Names & Details. Four fictional people, studied briefly; questioned immediately;
 * then scheduled into spaced retrieval so the Study can ask again in days.
 */
export function People() {
  const { db } = useStudy();
  const known = useStudyQuery((db) => db.store("memory_items").list({ where: { kind: "person" } as never }), ["memory_items"]);
  const knownIds = useMemo(() => new Set((known.data ?? []).map((m) => m.sourceRef?.refId).filter(Boolean)), [known.data]);
  const [round, setRound] = useState(0);
  const cards = useMemo(() => {
    const fresh = PEOPLE.filter((p) => !knownIds.has(p.id));
    const pool = fresh.length >= 4 ? fresh : PEOPLE;
    return createRng(seedFromString(todayKey() + ":people" + round)).shuffle(pool).slice(0, 4);
  }, [knownIds, round]);
  const [phase, setPhase] = useState<"intro" | "study" | "quiz" | "done">("intro");
  const left = useCountdown(60, phase === "study", () => setPhase("quiz"));
  const [answers, setAnswers] = useState<Record<string, { profession: string; detail: string }>>({});
  const [result, setResult] = useState<{ id: string; profOk: boolean; detailOk: boolean }[] | null>(null);
  const questionOrder = useMemo(() => createRng(seedFromString("q" + round)).shuffle(cards), [cards, round]);

  async function submit() {
    const r = questionOrder.map((p) => {
      const a = answers[p.id] ?? { profession: "", detail: "" };
      const profOk = shortAnswerCorrect(a.profession, p.profession, [p.profession.split(" ")[0]]);
      const detailOk = a.detail.trim().length > 2 && (shortAnswerCorrect(a.detail, p.detail) || shortAnswerCorrect(a.detail, p.interest) || p.detail.toLowerCase().split(" ").filter((w) => w.length > 4).some((w) => a.detail.toLowerCase().includes(w)) || p.interest.toLowerCase().split(" ").filter((w) => w.length > 4).some((w) => a.detail.toLowerCase().includes(w)));
      return { id: p.id, profOk, detailOk };
    });
    setResult(r);
    setPhase("done");
    const score = r.reduce((s, x) => s + (x.profOk ? 0.5 : 0) + (x.detailOk ? 0.5 : 0), 0) / r.length;
    const source = { kind: "memory" as const, refId: `people:${todayKey()}`, label: "Names & Details" };
    await recordEvidence(db, { subskill: "memory.names", score, difficulty: 3, format: "free", source });
    for (const x of r.filter((x) => !x.profOk && !x.detailOk).slice(0, 2)) {
      const p = cards.find((c) => c.id === x.id)!;
      await recordError(db, { type: "MEMORY_FAILURE", subskill: "memory.names", source, detail: `Could not recall ${p.name}.` });
    }
    for (const p of cards) {
      await createMemoryItem(db, {
        kind: "person",
        prompt: `Who is ${p.name}, and what did they mention?`,
        answer: `${p.profession}, from ${p.origin}. Interested in ${p.interest}. ${p.detail}`,
        accept: [p.profession, p.interest, p.detail],
        person: { name: p.name, profession: p.profession, detail: p.detail, interest: p.interest, origin: p.origin },
        sourceRef: { kind: "memory", refId: p.id, label: "Names & Details" },
        dueInDays: 1,
      });
    }
  }

  return (
    <div className="page">
      <MemoryHeader title="Names & Details" />
      {phase === "intro" ? (
        <div className="sheet p-6">
          <p className="text-[14px] text-ink-2 max-w-[60ch]">Four people, sixty seconds. Learn the name, the profession, and the one thing each mentioned. You will be asked immediately, and again in a day, and again in a week. These people are fictional; the skill is not.</p>
          <Button size="lg" className="mt-5" onClick={() => setPhase("study")}>Meet them</Button>
        </div>
      ) : null}
      {phase === "study" ? (
        <div>
          <div className="flex items-center justify-between mb-4"><span className="eyebrow">Sixty seconds</span><span className="numeral text-[14px]">{Math.ceil(left)}s</span></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger">
            {cards.map((p) => <Card key={p.id} p={p} />)}
          </div>
          <Button variant="ghost" className="mt-4" onClick={() => setPhase("quiz")}>I have them</Button>
        </div>
      ) : null}
      {phase === "quiz" ? (
        <div className="anim-place space-y-6">
          {questionOrder.map((p) => (
            <div key={p.id} className="border-t border-line pt-4">
              <p className="serif text-[22px]">{p.name}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <Field label="Profession" value={answers[p.id]?.profession ?? ""} onChange={(e) => setAnswers((a) => ({ ...a, [p.id]: { ...(a[p.id] ?? { profession: "", detail: "" }), profession: e.target.value } }))} />
                <Field label="Something they mentioned" value={answers[p.id]?.detail ?? ""} onChange={(e) => setAnswers((a) => ({ ...a, [p.id]: { ...(a[p.id] ?? { profession: "", detail: "" }), detail: e.target.value } }))} />
              </div>
            </div>
          ))}
          <Button size="lg" onClick={submit}>Submit</Button>
        </div>
      ) : null}
      {phase === "done" && result ? (
        <div className="anim-place">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cards.map((p) => {
              const r = result.find((x) => x.id === p.id)!;
              return (
                <div key={p.id} className={cx("sheet p-4", r.profOk && r.detailOk ? "border-forest" : !r.profOk && !r.detailOk ? "border-wine" : "")}>
                  <Card p={p} compact />
                  <p className="text-[12px] text-ink-3 mt-2">{r.profOk ? "Profession recalled." : "Profession missed."} {r.detailOk ? "Detail recalled." : "Detail missed."}</p>
                </div>
              );
            })}
          </div>
          <p className="serif text-[17px] text-ink-2 mt-6">They are now in your memory queue. The Study will ask about them tomorrow, and later.</p>
          <Finish onAgain={() => { setRound((r) => r + 1); setAnswers({}); setResult(null); setPhase("intro"); }} againLabel="Four more" />
        </div>
      ) : null}
    </div>
  );
}

function Card({ p, compact }: { p: PersonCard; compact?: boolean }) {
  return (
    <div className={cx(!compact && "sheet-raised paper-texture p-5")}>
      <p className="serif text-[24px] leading-tight">{p.name}</p>
      <p className="text-[14px] text-ink mt-1">{p.profession}</p>
      <p className="text-[13px] text-ink-2">Grew up near {p.origin}</p>
      <p className="text-[13px] text-ink-2">Interested in {p.interest}</p>
      <p className="text-[13px] text-ink-3 mt-2 italic serif text-[15px]">{p.detail}</p>
    </div>
  );
}
