"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useStudy } from "@/lib/persistence/provider";
import { stamp } from "@/lib/persistence/store";
import type { ArchiveEntry, ArchiveNote, CuratorConversation, CuratorMode, GeneratedContent } from "@/lib/domain/types";
import { ai, useAIStatus } from "@/lib/ai/client";
import { recordEvidence } from "@/lib/services/evidence";
import { createMemoryItem } from "@/lib/services/memory";
import { detectRedThreads } from "@/lib/adaptation/red-thread";
import { useSessionItem } from "@/lib/services/session-context";
import { Button } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { buildCuratorContext, sliceContext } from "@/lib/curator/context";
import { isCuratorMode, modeMeta } from "@/lib/curator/modes";
import { containsAttempt, shouldThinkFirst, thinkFirstReply } from "@/lib/curator/think-first";
import { firstSentence, looksLikeKnowledgeQuestion, offlineReply, suggestedTitleFrom, type KnowledgeRef } from "@/lib/curator/offline";
import { cx } from "@/lib/util/format";
import { ModeRail } from "./ModeRail";
import { Conversations } from "./Conversations";
import { RichText } from "./RichText";
import { titleFrom, type CuratorMsg } from "./shared";

type Conv = Omit<CuratorConversation, "messages"> & { messages: CuratorMsg[] };

export function Consultation({ conversationId }: { conversationId?: string }) {
  const { db, prefs } = useStudy();
  const params = useSearchParams();
  const aiStatus = useAIStatus();
  const { inSession, sessionId, finish } = useSessionItem();

  const paramMode = params.get("mode");
  const [mode, setMode] = useState<CuratorMode>(isCuratorMode(paramMode) ? paramMode : "reason");
  const [conv, setConv] = useState<Conv | null>(null);
  const [loading, setLoading] = useState(!!conversationId);
  const [missing, setMissing] = useState(false);
  const [text, setText] = useState(() => params.get("q") ?? "");
  const [busy, setBusy] = useState(false);
  const [streaming, setStreaming] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const useModel = aiStatus.configured;

  // Load an existing consultation
  useEffect(() => {
    if (!conversationId) return;
    let alive = true;
    db.store("curator_conversations")
      .get(conversationId)
      .then((c) => {
        if (!alive) return;
        if (!c) setMissing(true);
        else {
          setConv(c as Conv);
          setMode(c.mode);
        }
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [db, conversationId]);

  const messageCount = conv?.messages.length ?? 0;
  const isStreaming = streaming !== null;
  useEffect(() => {
    if (messageCount) endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messageCount, isStreaming]);

  const meta = modeMeta(mode);
  const messages = conv?.messages ?? [];

  const persist = useCallback(
    async (next: Conv) => {
      const stamped: Conv = { ...next, updatedAt: new Date().toISOString() };
      await db.store("curator_conversations").put(stamped as CuratorConversation);
      setConv(stamped);
      return stamped;
    },
    [db],
  );

  async function send(raw?: string) {
    const userText = (raw ?? text).trim();
    if (!userText || busy) return;
    setBusy(true);
    setNote(null);
    setText("");
    const at = new Date().toISOString();
    const userMsg: CuratorMsg = { role: "user", text: userText, at, mode };

    let current: Conv;
    if (conv) {
      current = { ...conv, mode, messages: [...conv.messages, userMsg] };
    } else {
      current = stamp<CuratorConversation>(db.userId, "cur", { title: titleFrom(userText), mode, messages: [userMsg], independentAttempts: 0, contextRef: sessionId ? { kind: "curator", refId: sessionId } : undefined }) as Conv;
      if (typeof window !== "undefined") window.history.replaceState(null, "", `/v1/curator/${current.id}`);
    }

    // Did the user just follow a Think First prompt with an attempt of their own?
    const prev = conv?.messages[conv.messages.length - 1];
    const afterAttempt = prev?.role === "curator" && !!prev.thinkFirst && containsAttempt(userText);
    if (afterAttempt) {
      current = { ...current, independentAttempts: current.independentAttempts + 1 };
      await recordEvidence(db, { subskill: "curiosity.questioning", score: 0.7, difficulty: 2, format: "free", source: { kind: "curator", refId: current.id, label: "Curator · attempt before answer" }, sessionId: sessionId ?? undefined });
      void detectRedThreads(db);
    }
    current = await persist(current);

    // Think First: ask for their read before reasoning for them.
    if (shouldThinkFirst(userText, prefs.thinkFirst)) {
      const reply: CuratorMsg = { role: "curator", text: thinkFirstReply(userText), at: new Date().toISOString(), mode, thinkFirst: true };
      await persist({ ...current, messages: [...current.messages, reply] });
      setBusy(false);
      return;
    }

    const knowledgeAsk = looksLikeKnowledgeQuestion(userText);
    let reply: CuratorMsg | null = null;

    if (useModel) {
      const ctx = sliceContext(await buildCuratorContext(db, prefs), mode);
      const input = {
        mode,
        thinkFirst: prefs.thinkFirst,
        depth: prefs.curatorDepth,
        style: prefs.challengeStyle,
        context: { ...ctx, stance: meta.stance },
        messages: current.messages.slice(-14).map((m) => ({ role: m.role, text: m.text })),
      };
      if (knowledgeAsk) {
        const res = await ai.call("curatorRespond", input);
        if (res.ok && res.data.text.trim()) {
          const d = res.data;
          const knowledge: KnowledgeRef | undefined = d.isKnowledgeAnswer ? { title: d.suggestedArchiveTitle?.trim() || suggestedTitleFrom(userText), question: userText.replace(/\s+/g, " "), answer: firstSentence(d.text) } : undefined;
          reply = { role: "curator", text: d.text.trim(), at: new Date().toISOString(), mode, thinkFirst: d.thinkFirst || undefined, knowledge, offers: knowledge ? { saveToArchive: true, testLater: true } : undefined };
        } else if (!res.ok && res.reason !== "unconfigured") setNote("The model did not answer; this reply comes from the record instead.");
      } else {
        setStreaming("");
        const res = await ai.stream("curatorRespond", input, (_chunk, full) => setStreaming(full));
        setStreaming(null);
        if (res.ok && res.data.trim() && !res.data.includes("[error:")) {
          reply = { role: "curator", text: res.data.trim(), at: new Date().toISOString(), mode };
        } else if (!res.ok && res.reason !== "unconfigured") setNote("The model did not answer; this reply comes from the record instead.");
      }
    }

    if (!reply) {
      const off = await offlineReply(db, userText, mode, { afterAttempt });
      reply = { role: "curator", text: off.text, at: new Date().toISOString(), mode, offline: true, knowledge: off.knowledge, offers: off.knowledge ? { saveToArchive: true, testLater: true } : undefined };
    }

    await persist({ ...current, messages: [...current.messages, reply] });
    setBusy(false);
  }

  async function saveToArchive(index: number) {
    if (!conv) return;
    const m = conv.messages[index];
    if (!m?.knowledge) return;
    const k = m.knowledge;
    if (k.entryId) {
      await db.store("archive_notes").put(stamp<ArchiveNote>(db.userId, "note", { entryId: k.entryId, text: `From the Curator (${new Date().toISOString().slice(0, 10)}): ${m.text.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")}` }));
    } else {
      const id = `arc-gen-${conv.id.replace(/^cur_/, "")}-${index}`;
      const body = m.text.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
      const entry: ArchiveEntry = {
        id,
        kind: "concept",
        domain: "philosophy",
        title: k.title,
        summary: firstSentence(body),
        what: body,
        why: "",
        before: "",
        after: "",
        connects: "",
        remember: [firstSentence(body)],
        tags: ["curator"],
        recall: [{ prompt: k.question, answer: k.answer }],
        readingMinutes: Math.max(1, Math.round(body.split(/\s+/).length / 200)),
        origin: "generated",
      };
      await db.store("generated_content").put(stamp<GeneratedContent>(db.userId, "gen", { kind: "archive", refId: id, payload: entry, model: aiStatus.model ?? undefined }));
    }
    const messages = conv.messages.map((x, i) => (i === index ? { ...x, offers: { ...x.offers, saved: true } } : x));
    await persist({ ...conv, messages });
  }

  async function testLater(index: number) {
    if (!conv) return;
    const m = conv.messages[index];
    if (!m?.knowledge) return;
    const k = m.knowledge;
    await createMemoryItem(db, { kind: k.entryId ? "archive" : "concept", prompt: k.question, answer: k.answer, hint: k.title, sourceRef: { kind: "curator", refId: conv.id, label: `Curator · ${k.title}` }, tags: ["curator"], dueInDays: 1 });
    const messages = conv.messages.map((x, i) => (i === index ? { ...x, offers: { ...x.offers, scheduled: true } } : x));
    await persist({ ...conv, messages });
  }

  const statusLine = useMemo(() => {
    if (aiStatus.loading) return null;
    if (useModel) return <span className="text-[11px] text-ink-3">Live · {aiStatus.model}</span>;
    return (
      <span className="text-[11px] text-ink-3 text-right">
        <span className="hidden md:inline">Reading the record only · </span>
        <Link href="/settings" className="underline underline-offset-4 hover:text-ink">connect a model<span className="hidden md:inline"> in Settings</span></Link>
        <span className="hidden md:inline"> for the full consultation</span>
      </span>
    );
  }, [aiStatus.loading, aiStatus.model, useModel]);

  if (missing) {
    return (
      <div className="page">
        <p className="serif text-[22px] text-ink">That consultation is not in the record.</p>
        <Link href="/v1/curator" className="btn btn-secondary mt-6">Begin a new one</Link>
      </div>
    );
  }

  const empty = !loading && messages.length === 0;

  return (
    <div className="page !pb-8">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="eyebrow eyebrow-wine">The Curator</div>
        <div className="flex items-center gap-4">
          {inSession ? <span className="mark"><span className="mark-dot" /> Today&apos;s session</span> : null}
          {statusLine}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[224px_minmax(0,1fr)] gap-x-12 gap-y-4">
        <aside className="lg:sticky lg:top-8 self-start lg:pr-4 lg:border-r lg:border-line min-w-0">
          <ModeRail value={mode} onChange={setMode} disabled={busy} />
          <div className="hidden lg:block mt-8">
            <Conversations currentId={conv?.id} />
          </div>
        </aside>

        <div className="min-w-0 flex flex-col">
          <header className="lg:hidden mb-3">
            <p className="text-[13px] text-ink-3">{meta.description}</p>
          </header>

          {empty ? (
            <Opening mode={mode} onPick={(s) => { setText(s); areaRef.current?.focus(); }} />
          ) : (
            <ol className="space-y-7 flex-1" aria-live="polite" aria-busy={busy}>
              {loading ? <li className="text-[13px] text-ink-3">Opening the record.</li> : null}
              {messages.map((m, i) => (
                <li key={i} className={cx("anim-place", m.role === "user" ? "pl-8 md:pl-24" : "")}>
                  <div className="eyebrow mb-1.5 flex items-center gap-2">
                    <span>{m.role === "user" ? "You" : "The Curator"}</span>
                    {m.role === "curator" && m.mode ? <span className="text-ink-4">· {modeMeta(m.mode).label}</span> : null}
                    {m.role === "curator" && m.thinkFirst ? <span className="text-wine">· Think first</span> : null}
                    {m.role === "curator" && m.offline ? <span className="text-ink-4">· from the record</span> : null}
                  </div>
                  <RichText text={m.text} className={m.role === "curator" ? "serif text-[17px] md:text-[18px] text-ink leading-relaxed max-w-[68ch]" : "text-[15px] text-ink-2 leading-relaxed max-w-[68ch]"} />
                  {m.role === "curator" && m.knowledge ? <Offers msg={m} onSave={() => saveToArchive(i)} onTest={() => testLater(i)} /> : null}
                </li>
              ))}
              {streaming !== null ? (
                <li className="anim-fade">
                  <div className="eyebrow mb-1.5 flex items-center gap-2"><span>The Curator</span><span className="text-ink-4">· {meta.label}</span></div>
                  <RichText text={streaming} streaming className="serif text-[17px] md:text-[18px] text-ink leading-relaxed max-w-[68ch]" />
                </li>
              ) : busy ? (
                <li className="serif text-[16px] text-ink-3 anim-fade">The Curator considers that.</li>
              ) : null}
            </ol>
          )}
          <div ref={endRef} />

          {note ? <p className="mt-4 text-[12px] text-ink-3 border-l-2 border-line-2 pl-3">{note}</p> : null}

          <div className={cx("border-t border-line pt-4", empty ? "mt-6" : "mt-8")}>
            <textarea
              ref={areaRef}
              className="field field-serif"
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={empty ? meta.openers[0] : "Continue."}
              disabled={busy}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  void send();
                }
              }}
              aria-label={`Ask the Curator in ${meta.label} mode`}
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Button onClick={() => send()} disabled={busy || !text.trim()}>
                {busy ? "Considering…" : "Ask"}
              </Button>
              <span className="text-[12px] text-ink-3 hidden sm:inline">⌘↵</span>
              <span className="text-[12px] text-ink-4">{meta.label} · {meta.description}</span>
              {inSession && messages.length >= 2 ? (
                <Button variant="ghost" className="ml-auto" onClick={() => void finish()}>
                  Continue the session <I.ArrowRight size={14} />
                </Button>
              ) : null}
            </div>
          </div>

          <div className="lg:hidden mt-10">
            <Conversations currentId={conv?.id} limit={5} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Opening({ mode, onPick }: { mode: CuratorMode; onPick: (s: string) => void }) {
  const meta = modeMeta(mode);
  return (
    <div className="pt-2 lg:pt-6 anim-fade" key={mode}>
      <p className="serif text-[26px] md:text-[30px] text-ink leading-snug max-w-[30ch]">{OPENING_LINE[mode]}</p>
      <p className="mt-3 text-[14px] text-ink-3 max-w-[56ch]">{meta.stance}</p>
      <div className="mt-8">
        <div className="eyebrow mb-2">Begin with</div>
        <ul className="divide-y divide-line border-t border-line">
          {meta.openers.map((o) => (
            <li key={o}>
              <button type="button" onClick={() => onPick(o)} className="w-full text-left py-2.5 text-[14px] text-ink-2 hover:text-ink flex items-center justify-between gap-4 group">
                <span className="serif text-[16px]">{o}</span>
                <I.ArrowRight size={14} className="shrink-0 text-ink-4 group-hover:text-ink" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const OPENING_LINE: Record<CuratorMode, string> = {
  observe: "Tell me what you saw. Not what it meant; what you saw.",
  reason: "Bring me an inference. We will see whether it survives its alternatives.",
  question: "What are you trying to find out, and from whom?",
  teach: "Name a thing worth understanding properly.",
  challenge: "State the belief. I will look for where it bends.",
  debate: "Pick a side. You will argue the other one before we finish.",
  strategize: "Describe the situation and the players. We will think past the first move.",
  review: "Let us look at the record as it is, not as you remember it.",
  explore: "Where does your curiosity go when nobody is asking it to be useful?",
  remember: "What did you learn that you would not want to lose?",
};

function Offers({ msg, onSave, onTest }: { msg: CuratorMsg; onSave: () => void; onTest: () => void }) {
  const o = msg.offers ?? {};
  const [busy, setBusy] = useState<"save" | "test" | null>(null);
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
      {o.saved ? (
        <span className="text-forest inline-flex items-center gap-1"><I.Check size={12} /> Saved to the Archive</span>
      ) : (
        <button type="button" className="text-ink-3 hover:text-ink underline underline-offset-4 disabled:opacity-60" disabled={busy !== null} onClick={async () => { setBusy("save"); await onSave(); setBusy(null); }}>
          Save to Archive
        </button>
      )}
      {o.scheduled ? (
        <span className="text-forest inline-flex items-center gap-1"><I.Check size={12} /> Scheduled for recall <Link href="/v1/memory" className="underline underline-offset-4 text-ink-3 hover:text-ink ml-1">Memory</Link></span>
      ) : (
        <button type="button" className="text-ink-3 hover:text-ink underline underline-offset-4 disabled:opacity-60" disabled={busy !== null} onClick={async () => { setBusy("test"); await onTest(); setBusy(null); }}>
          Test me later
        </button>
      )}
    </div>
  );
}
