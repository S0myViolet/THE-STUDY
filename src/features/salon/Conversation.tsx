"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStudy } from "@/lib/persistence/provider";
import { stamp } from "@/lib/persistence/store";
import type { SalonScenario, SalonSession, ConversationTurn } from "@/lib/domain/types";
import { ai, useAIStatus } from "@/lib/ai/client";
import { recordError, recordEvidence } from "@/lib/services/evidence";
import { writeAfterAction } from "@/lib/services/after-action";
import { detectRedThreads } from "@/lib/adaptation/red-thread";
import { useSessionItem } from "@/lib/services/session-context";
import { Button, TextArea, HairlineProgress, Note } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { classifyUserTurn, objectivesMet, reviewConversation, scriptedTurn } from "./engine";
import { cx, minutes } from "@/lib/util/format";

export function Conversation({ scenario }: { scenario: SalonScenario }) {
  const { db, prefs } = useStudy();
  const router = useRouter();
  const aiStatus = useAIStatus();
  const { inSession, sessionId, finish } = useSessionItem();
  const [session, setSession] = useState<SalonSession | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [selfAssessed, setSelfAssessed] = useState<string[]>([]);
  const [ending, setEnding] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const useModel = aiStatus.configured;

  useEffect(() => {
    let alive = true;
    (async () => {
      const existing = (await db.store("salon_sessions").list({ where: { scenarioId: scenario.id, status: "active" }, orderBy: "createdAt", desc: true, limit: 1 }))[0];
      if (existing) {
        if (alive) setSession(existing);
        return;
      }
      const s = stamp<SalonSession>(db.userId, "salon", { scenarioId: scenario.id, status: "active", turns: [{ role: "character", text: scenario.opening, at: new Date().toISOString() }], rapport: 0.35, revealedFacts: [], objectivesMet: [], sessionId: sessionId ?? undefined });
      await db.store("salon_sessions").put(s);
      if (alive) setSession(s);
    })();
    return () => {
      alive = false;
    };
  }, [db, scenario, sessionId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [session?.turns.length, thinking]);

  const met = useMemo(() => (session ? objectivesMet(scenario, session.revealedFacts, selfAssessed) : []), [scenario, session, selfAssessed]);

  async function send() {
    if (!session || !text.trim() || busy) return;
    setBusy(true);
    const userText = text.trim();
    setText("");
    const cls = classifyUserTurn(userText);
    const userTurn: ConversationTurn = { role: "user", text: userText, at: new Date().toISOString(), questionType: cls.questionType, leading: cls.leading };
    let next: SalonSession = { ...session, turns: [...session.turns, userTurn] };
    setSession(next);
    setThinking(true);

    let reply: string;
    let revealed: string[] = [];
    let rapportDelta = 0;
    if (useModel) {
      const res = await ai.call("continueSalonConversation", { character: scenario.character, hiddenFacts: scenario.hiddenFacts, revealed: session.revealedFacts, rapport: session.rapport, turns: session.turns.slice(-12).map((t) => ({ role: t.role, text: t.text })), message: userText });
      if (res.ok) {
        reply = res.data.reply;
        revealed = res.data.revealed.filter((id) => scenario.hiddenFacts.some((f) => f.id === id) && !session.revealedFacts.includes(id));
        rapportDelta = res.data.rapportDelta;
        userTurn.leading = res.data.userWasLeading ?? cls.leading;
        userTurn.questionType = (res.data.userQuestionType as ConversationTurn["questionType"]) ?? cls.questionType;
      } else {
        const r = scriptedTurn(scenario, session, userText);
        reply = r.reply;
        revealed = r.revealed;
        rapportDelta = r.rapportDelta;
      }
    } else {
      const r = scriptedTurn(scenario, session, userText);
      reply = r.reply;
      revealed = r.revealed;
      rapportDelta = r.rapportDelta;
    }
    userTurn.revealed = revealed;
    const rapport = Math.max(0, Math.min(1, session.rapport + rapportDelta));
    const revealedFacts = [...session.revealedFacts, ...revealed];
    next = { ...next, turns: [...next.turns.slice(0, -1), userTurn, { role: "character", text: reply, at: new Date().toISOString(), revealed }], rapport, revealedFacts, objectivesMet: objectivesMet(scenario, revealedFacts, selfAssessed) };
    await db.store("salon_sessions").put(next);
    setSession(next);
    setThinking(false);
    setBusy(false);
  }

  async function end() {
    if (!session) return;
    setBusy(true);
    const objectives = objectivesMet(scenario, session.revealedFacts, selfAssessed);
    let review = reviewConversation(scenario, { ...session, objectivesMet: objectives });
    if (useModel) {
      const res = await ai.call("evaluateSalon", { objectives: scenario.objectives, hiddenFacts: scenario.hiddenFacts, revealed: session.revealedFacts, turns: session.turns.map((t) => ({ role: t.role, text: t.text })) });
      if (res.ok) review = { ...review, keyImprovements: res.data.keyImprovements.length ? res.data.keyImprovements : review.keyImprovements, strongestMove: res.data.strongestMove ?? review.strongestMove, score: Math.round(((review.score + res.data.score) / 2) * 100) / 100 };
    }
    const done: SalonSession = { ...session, status: "completed", objectivesMet: objectives, review, completedAt: new Date().toISOString() };
    await db.store("salon_sessions").put(done);
    const source = { kind: "salon" as const, refId: done.id, label: `Salon · ${scenario.title}` };
    const forcingRatio = review.questionsAsked ? review.questionsForcingNewInfo / review.questionsAsked : 0;
    await recordEvidence(db, { subskill: "social.question_quality", score: Math.max(0, forcingRatio - review.leadingQuestions * 0.1), difficulty: scenario.difficulty, format: "free", source, sessionId: sessionId ?? undefined });
    await recordEvidence(db, { subskill: "social.listening", score: review.talkShare <= 0.5 ? 1 : review.talkShare <= 0.65 ? 0.6 : 0.25, difficulty: scenario.difficulty, format: "free", source, sessionId: sessionId ?? undefined });
    await recordEvidence(db, { subskill: "social.rapport", score: done.rapport, difficulty: scenario.difficulty, format: "free", source, sessionId: sessionId ?? undefined });
    await recordEvidence(db, { subskill: "inference.information_value", score: scenario.hiddenFacts.length ? done.revealedFacts.length / scenario.hiddenFacts.length : 0, difficulty: scenario.difficulty, format: "free", source, sessionId: sessionId ?? undefined });
    await recordEvidence(db, { subskill: "social.perspective", score: scenario.objectives.length ? objectives.length / scenario.objectives.length : 0, difficulty: scenario.difficulty, format: "free", source, sessionId: sessionId ?? undefined });
    for (const t of done.turns.filter((t) => t.role === "user" && t.leading).slice(0, 3)) await recordError(db, { type: "LEADING_QUESTION", subskill: "social.question_quality", source, detail: `Leading: "${t.text.slice(0, 80)}"`, sessionId: sessionId ?? undefined });
    if (review.questionsAsked >= 3 && forcingRatio < 0.3) await recordError(db, { type: "QUESTION_QUALITY", subskill: "social.question_quality", source, detail: `${review.questionsForcingNewInfo} of ${review.questionsAsked} questions forced new information.`, sessionId: sessionId ?? undefined });
    await writeAfterAction(db, { source, title: `Salon · ${scenario.title}`, saw: scenario.hiddenFacts.filter((f) => done.revealedFacts.includes(f.id)).map((f) => f.fact), missed: scenario.hiddenFacts.filter((f) => !done.revealedFacts.includes(f.id)).map((f) => f.fact), assumed: done.turns.filter((t) => t.role === "user" && t.leading).map((t) => `Leading: ${t.text}`), didWell: review.strongestMove ? [review.strongestMove] : [], oneThing: review.keyImprovements[0], score: review.score, sessionId: sessionId ?? undefined });
    await detectRedThreads(db);
    setSession(done);
    setBusy(false);
    setEnding(false);
  }

  if (!session) return <div className="page"><div className="text-[13px] text-ink-3">Taking a seat.</div></div>;

  const facts = scenario.hiddenFacts;
  const done = session.status === "completed";

  return (
    <div className="page !pb-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <Link href="/salon" className="text-[12px] text-ink-3 hover:text-ink inline-flex items-center gap-1.5"><I.ArrowLeft size={12} /> The Salon</Link>
        <div className="flex items-center gap-4 text-[11px] text-ink-3">{inSession ? <span className="mark"><span className="mark-dot" /> Today&apos;s session</span> : null}<span>{useModel ? `Live character · ${aiStatus.model}` : "Scripted character"}</span></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
        <div className="min-w-0">
          <header className="border-b border-line pb-4 mb-4">
            <div className="eyebrow eyebrow-wine">{scenario.title}</div>
            <h1 className="display text-[28px] md:text-[34px] mt-1">{scenario.character.name}</h1>
            <p className="text-[13px] text-ink-3 mt-1">{scenario.character.role}</p>
            <p className="serif text-[16px] text-ink-2 mt-3 max-w-[64ch]">{scenario.setting}</p>
          </header>

          <ol className="space-y-5" aria-live="polite">
            {session.turns.map((t, i) => (
              <li key={i} className={cx("anim-place", t.role === "user" ? "pl-6 md:pl-16" : "")}>
                <div className="eyebrow mb-1">{t.role === "user" ? "You" : scenario.character.name}{t.role === "user" && t.questionType && t.questionType !== "statement" ? <span className="text-ink-4"> · {t.questionType}{t.leading ? " · leading" : ""}</span> : null}</div>
                <p className={cx(t.role === "character" ? "serif text-[18px] text-ink leading-relaxed" : "text-[15px] text-ink-2 leading-relaxed")}>{t.text}</p>
                {t.role === "user" && t.revealed?.length ? <p className="text-[11px] text-forest mt-1">This question earned {t.revealed.length} new fact{t.revealed.length === 1 ? "" : "s"}.</p> : null}
              </li>
            ))}
            {thinking ? <li className="serif text-[16px] text-ink-3 anim-fade">{scenario.character.name} considers that.</li> : null}
          </ol>
          <div ref={endRef} />

          {!done ? (
            <div className="mt-6 border-t border-line pt-4">
              <TextArea serif rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Say something. Ask something. Let them talk." disabled={busy} onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void send(); }} aria-label="Your message" />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Button onClick={send} disabled={busy || !text.trim()}>Say it</Button>
                <span className="text-[12px] text-ink-3">⌘↵</span>
                <Button variant="ghost" className="ml-auto" onClick={() => setEnding(true)} disabled={busy || session.turns.length < 3}>End the conversation</Button>
              </div>
              {ending ? (
                <div className="mt-4 sheet p-5 anim-unfold">
                  <div className="eyebrow mb-2">Before the review</div>
                  {scenario.objectives.filter((o) => !o.requiresFacts?.length).length ? <p className="text-[13px] text-ink-2 mb-3">Some objectives are yours to judge honestly.</p> : null}
                  {scenario.objectives.filter((o) => !o.requiresFacts?.length).map((o) => (
                    <label key={o.id} className="flex items-start gap-3 py-1.5 text-[14px]"><input type="checkbox" className="mt-1 accent-[var(--ink)]" checked={selfAssessed.includes(o.id)} onChange={(e) => setSelfAssessed((s) => (e.target.checked ? [...s, o.id] : s.filter((x) => x !== o.id)))} /><span>{o.text}</span></label>
                  ))}
                  <div className="mt-3 flex gap-3"><Button onClick={end} disabled={busy}>{busy ? "Reviewing…" : "Review the conversation"}</Button><Button variant="ghost" onClick={() => setEnding(false)}>Keep talking</Button></div>
                </div>
              ) : null}
            </div>
          ) : (
            <Review scenario={scenario} session={session} onDone={async () => { if (!(await finish())) router.push("/salon"); }} inSession={inSession} />
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-8 self-start">
          <div>
            <div className="eyebrow mb-2">Objectives</div>
            <ul className="space-y-2">
              {scenario.objectives.map((o) => {
                const ok = met.includes(o.id);
                return <li key={o.id} className={cx("flex gap-2 text-[13px] leading-snug", ok ? "text-ink" : "text-ink-2")}><span className={cx("mt-1.5 w-[6px] h-[6px] rounded-full shrink-0", ok ? "bg-forest" : "bg-line-2")} aria-hidden /><span>{o.text}{ok ? <span className="sr-only"> (met)</span> : null}</span></li>;
              })}
            </ul>
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1"><span className="eyebrow">Rapport</span><span className="numeral text-[12px] text-ink-3">{session.rapport < 0.3 ? "cool" : session.rapport < 0.6 ? "civil" : "warm"}</span></div>
            <HairlineProgress value={session.rapport} />
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1"><span className="eyebrow">What they know</span><span className="numeral text-[12px] text-ink-3">{session.revealedFacts.length} / {facts.length}</span></div>
            <ul className="space-y-1.5">
              {facts.map((f) => <li key={f.id} className={cx("text-[12px] leading-snug border-l pl-2", session.revealedFacts.includes(f.id) ? "border-forest text-ink-2" : "border-line text-ink-4")}>{session.revealedFacts.includes(f.id) || done ? f.fact : f.guarded ? "Something they will only say to someone they trust." : "Something they have not said yet."}</li>)}
            </ul>
          </div>
          <p className="text-[11px] text-ink-4 border-t border-line pt-3">{minutes(scenario.estimatedMinutes)} · The character is fictional. Rapport rises with curiosity and falls with leading or accusatory questions.</p>
        </aside>
      </div>
    </div>
  );
}

function Review({ scenario, session, onDone, inSession }: { scenario: SalonScenario; session: SalonSession; onDone: () => void; inSession: boolean }) {
  const r = session.review!;
  return (
    <div className="mt-8 border-t border-ink pt-5 anim-place">
      <div className="eyebrow eyebrow-wine mb-3">Post-conversation review</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div><div className="eyebrow">Questions</div><div className="numeral text-[26px] mt-1">{r.questionsAsked}</div><div className="text-[12px] text-ink-3">{r.questionsForcingNewInfo} forced new information</div></div>
        <div><div className="eyebrow">Leading</div><div className={cx("numeral text-[26px] mt-1", r.leadingQuestions ? "text-wine" : "")}>{r.leadingQuestions}</div></div>
        <div><div className="eyebrow">Your share of words</div><div className="numeral text-[26px] mt-1">{Math.round(r.talkShare * 100)}%</div></div>
        <div><div className="eyebrow">Objectives</div><div className="numeral text-[26px] mt-1">{r.objectivesMet} / {r.objectivesTotal}</div></div>
      </div>
      <div className="mt-6 space-y-3">
        {r.strongestMove ? <Note tone="forest"><span className="eyebrow block mb-1">Strongest move</span>{r.strongestMove}</Note> : null}
        {r.keyImprovements.map((k, i) => <Note key={i} tone="wine"><span className="eyebrow block mb-1">{i === 0 ? "Key improvement" : "Also"}</span>{k}</Note>)}
      </div>
      <div className="mt-6 text-[13px] text-ink-3">Hidden facts you did not reach are now visible in the margin. Read them; each one had a question that would have earned it.</div>
      <div className="mt-6 flex gap-3"><Button size="lg" onClick={onDone}>{inSession ? "Continue the session" : "Leave the Salon"}</Button></div>
      <p className="mt-3 text-[11px] text-ink-4">Character: {scenario.character.name}. Score {Math.round(r.score * 100)} is a blend of objectives, question quality, rapport and restraint.</p>
    </div>
  );
}
