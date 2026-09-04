"use client";

import React, { useEffect, useMemo, useState } from "react";
import { HOW_SURE, INFORMATION_VALUE, LADDER, CAUSAL, FAST_SLOW } from "@/content";
import { Button, Choice, ConfidenceDial, TextArea, useCountdown } from "@/components/ui/primitives";
import { ModeHeader, Debrief, Finish, Verdict, matchList, useInferenceRecorder, useStart, pickBy } from "./shared";
import { evalFreeQuestion } from "@/features/casebook/evaluate";
import { ai, useAIStatus } from "@/lib/ai/client";
import { wordCount } from "@/lib/scoring/text";
import { cx, todayKey } from "@/lib/util/format";
import { createRng } from "@/lib/scene";
import { seedFromString } from "@/lib/util/format";

/* ------------------------------------------------------------------ */
/* How Sure? — a run of calibration items                              */
/* ------------------------------------------------------------------ */

export function HowSure({ id }: { id?: string }) {
  const record = useInferenceRecorder();
  const [round, setRound] = useState(0);
  const items = useMemo(() => {
    if (id) return HOW_SURE.filter((h) => h.id === id);
    const rng = createRng(seedFromString(todayKey() + ":hs" + round));
    return rng.shuffle(HOW_SURE).slice(0, 6);
  }, [id, round]);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const [conf, setConf] = useState<number | null>(null);
  const [log, setLog] = useState<{ correct: boolean; conf: number }[]>([]);
  const [shown, setShown] = useState(false);
  const timer = useStart();
  const ch = items[i];
  if (!ch) return <div className="page"><ModeHeader mode="how_sure" /><p className="text-ink-3">Challenges are being prepared.</p></div>;
  const finished = log.length === items.length && shown === false && i >= items.length - 1 && log.length > 0 && log.length === items.length;

  async function commit() {
    const correct = pick === ch.correct;
    setShown(true);
    setLog((l) => [...l, { correct, conf: conf! }]);
    await record({
      mode: "how_sure",
      challengeId: ch.id,
      response: { pick, conf },
      score: correct ? 1 : 0,
      correct,
      confidence: conf!,
      latencyMs: timer.elapsed(),
      difficulty: ch.difficulty,
      label: `How Sure · ${ch.title}`,
      evidence: [{ subskill: ch.domain === "knowledge" ? "knowledge.connections" : ch.domain === "quantitative" ? "quantitative.probability" : "inference.evidence_weighting", score: correct ? 1 : 0, format: "mcq", correct }],
      errors: [],
      calibration: { confidence: conf!, correct, domain: ch.domain },
    });
  }

  function next() {
    setShown(false);
    setPick(null);
    setConf(null);
    timer.reset();
    setI((x) => x + 1);
  }

  const done = log.length === items.length && shown;
  const brierMean = log.length ? log.reduce((s, x) => s + (x.conf - (x.correct ? 1 : 0)) ** 2, 0) / log.length : 0;

  return (
    <div className="page">
      <ModeHeader mode="how_sure" title={ch.title}>
        <p className="text-[12px] text-ink-3 mt-2 numeral">{i + 1} / {items.length}</p>
      </ModeHeader>
      <p className="serif text-[22px] leading-snug mb-5">{ch.question}</p>
      <div className="space-y-2">{ch.options.map((o, j) => <Choice key={o.id} index={j} label={o.text} selected={pick === o.id} onClick={() => !shown && setPick(o.id)} disabled={shown} correct={shown && o.id === ch.correct} wrong={shown && pick === o.id && o.id !== ch.correct} />)}</div>
      <div className="mt-5"><ConfidenceDial value={conf} onChange={setConf} disabled={shown} /></div>
      {!shown ? <div className="mt-6"><Button size="lg" disabled={!pick || conf === null} onClick={commit}>Commit</Button></div> : (
        <div className="mt-6 space-y-5 anim-place">
          <Verdict good={pick === ch.correct}>{pick === ch.correct ? `Right, at ${Math.round((conf ?? 0) * 100)}%.` : `Not this time, at ${Math.round((conf ?? 0) * 100)}%.`} <span className="block mt-1 text-[14px] text-ink-2 font-sans">{ch.explanation}</span></Verdict>
          {!done ? <Button onClick={next}>Next</Button> : (
            <div className="space-y-4">
              <div className="border-t border-ink pt-4 grid grid-cols-3 gap-6">
                <div><div className="eyebrow">Correct</div><div className="numeral text-[28px] mt-1">{log.filter((x) => x.correct).length} / {log.length}</div></div>
                <div><div className="eyebrow">Mean confidence</div><div className="numeral text-[28px] mt-1">{Math.round((log.reduce((s, x) => s + x.conf, 0) / log.length) * 100)}%</div></div>
                <div><div className="eyebrow">Brier</div><div className="numeral text-[28px] mt-1">{brierMean.toFixed(2)}</div><div className="text-[12px] text-ink-3">lower is better</div></div>
              </div>
              <p className="serif text-[17px] text-ink-2">Six items is a sample, not a verdict. Calibration accumulates in your Profile across every confidence you state.</p>
              <Finish onAgain={() => { setRound((r) => r + 1); setI(0); setLog([]); setShown(false); setPick(null); setConf(null); timer.reset(); }} againLabel="Another six" />
            </div>
          )}
        </div>
      )}
      {finished ? null : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Information Value                                                   */
/* ------------------------------------------------------------------ */

export function InformationValue({ id }: { id?: string }) {
  const record = useInferenceRecorder();
  const aiStatus = useAIStatus();
  const [nonce, setNonce] = useState(0);
  const ch = useMemo(() => pickBy(INFORMATION_VALUE, id, todayKey() + ":iv" + nonce), [id, nonce]);
  const [pick, setPick] = useState<string | null>(null);
  const [own, setOwn] = useState("");
  const [result, setResult] = useState<{ iv: number; leading: boolean; feedback: string; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const timer = useStart();
  if (!ch) return <div className="page"><ModeHeader mode="information_value" /><p className="text-ink-3">Challenges are being prepared.</p></div>;
  const best = Math.max(...ch.questions.map((q) => q.informationValue));

  async function submit() {
    setBusy(true);
    let r: { iv: number; leading: boolean; feedback: string; text: string };
    if (pick) {
      const q = ch!.questions.find((q) => q.id === pick)!;
      r = { iv: q.informationValue, leading: q.leading, feedback: q.feedback, text: q.text };
    } else {
      const f = evalFreeQuestion(own, undefined, ch!.questions.map((q) => ({ id: q.id, text: q.text, informationValue: q.informationValue, rapportCost: q.rapportCost, leading: q.leading, feedback: q.feedback })));
      r = { iv: f.informationValue, leading: f.leading, feedback: f.feedback, text: own };
      if (aiStatus.configured) {
        const res = await ai.call("evaluateQuestion", { scenario: ch!.scenario, unknowns: ch!.unknowns, question: own });
        if (res.ok) r = { iv: res.data.informationValue, leading: res.data.leading, feedback: res.data.feedback + (res.data.betterQuestion ? ` Stronger: "${res.data.betterQuestion}"` : ""), text: own };
      }
    }
    setResult(r);
    await record({
      mode: "information_value",
      challengeId: ch!.id,
      response: { pick, own },
      score: r.iv,
      latencyMs: timer.elapsed(),
      difficulty: ch!.difficulty,
      label: `Information Value · ${ch!.title}`,
      evidence: [{ subskill: "inference.information_value", score: r.iv, format: pick ? "mcq" : "free" }, { subskill: "social.question_quality", score: r.leading ? Math.min(r.iv, 0.3) : r.iv, format: pick ? "mcq" : "free" }],
      errors: [...(r.iv < 0.4 ? [{ type: "INFORMATION_VALUE" as const, subskill: "inference.information_value" as const, detail: `${ch!.title}: asked "${r.text}".` }] : []), ...(r.leading ? [{ type: "LEADING_QUESTION" as const, subskill: "social.question_quality" as const, detail: `Leading: "${r.text}"` }] : [])],
    });
    setBusy(false);
  }

  return (
    <div className="page">
      <ModeHeader mode="information_value" title={ch.title} />
      <div className="sheet paper-texture p-6 md:p-8 mb-6">
        <p className="serif text-[17px] leading-relaxed">{ch.scenario}</p>
        <div className="eyebrow mt-5 mb-2">Unknowns</div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">{ch.unknowns.map((u) => <li key={u} className="text-[14px] text-ink-2">— {u}</li>)}</ul>
      </div>
      <p className="serif text-[20px] mb-4">You can ask one question. Choose carefully.</p>
      <div className="space-y-2">{ch.questions.map((q, i) => <Choice key={q.id} index={i} label={q.text} selected={pick === q.id} onClick={() => !result && (setPick(q.id), setOwn(""))} disabled={!!result} correct={!!result && q.informationValue >= best - 0.001} wrong={!!result && pick === q.id && q.informationValue < 0.45} detail={result ? `Information value ${Math.round(q.informationValue * 100)}%${q.leading ? " · leading" : ""} — ${q.feedback}` : undefined} />)}</div>
      <TextArea className="mt-4" label="Or ask your own" serif rows={2} value={own} onChange={(e) => { setOwn(e.target.value); setPick(null); }} disabled={!!result} />
      {!result ? <div className="mt-5"><Button size="lg" disabled={busy || (!pick && wordCount(own) < 3)} onClick={submit}>{busy ? "Weighing…" : "Ask"}</Button></div> : (
        <div className="mt-6 space-y-6 anim-place">
          <Verdict good={result.iv >= 0.6}><span className="numeral">{Math.round(result.iv * 100)}%</span> information value{result.leading ? " · leading" : ""}. <span className="font-sans text-[14px] text-ink-2">{result.feedback}</span></Verdict>
          <Debrief text={ch.debrief} />
          <Finish onAgain={() => { setNonce((n) => n + 1); setPick(null); setOwn(""); setResult(null); timer.reset(); }} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Inference Ladder                                                    */
/* ------------------------------------------------------------------ */

export function Ladder({ id }: { id?: string }) {
  const record = useInferenceRecorder();
  const aiStatus = useAIStatus();
  const [nonce, setNonce] = useState(0);
  const ch = useMemo(() => pickBy(LADDER, id, todayKey() + ":ld" + nonce), [id, nonce]);
  const [f, setF] = useState({ observed: "", infer: "", because: "", alternatives: "", change: "" });
  const [conf, setConf] = useState<number | null>(null);
  const [result, setResult] = useState<{ obs: number; inf: number; alt: number; feedback?: string; score: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const timer = useStart();
  if (!ch) return <div className="page"><ModeHeader mode="ladder" /><p className="text-ink-3">Challenges are being prepared.</p></div>;
  const lines = (s: string) => s.split(/\n|;/).map((x) => x.trim()).filter(Boolean);

  async function submit() {
    setBusy(true);
    const obs = matchList(lines(f.observed), ch!.observations).matched.length;
    const inf = matchList(lines(f.infer), ch!.inferences).matched.length;
    const alt = matchList(lines(f.alternatives), ch!.alternatives).matched.length;
    const blur = lines(f.observed).filter((l) => /\b(nervous|lying|angry|guilty|upset|hiding|obviously|clearly)\b/i.test(l)).length;
    let score = Math.min(1, (obs / Math.min(3, ch!.observations.length)) * 0.35 + (inf / Math.min(2, ch!.inferences.length)) * 0.25 + (alt / Math.min(2, ch!.alternatives.length)) * 0.25 + (wordCount(f.because) >= 8 ? 0.075 : 0) + (wordCount(f.change) >= 6 ? 0.075 : 0) - blur * 0.1);
    let feedback: string | undefined;
    if (aiStatus.configured) {
      const res = await ai.call("evaluateReasoning", { task: "Inference Ladder: I observed / I infer / because / alternatives / confidence / what would change my mind.", groundTruth: `Observations: ${ch!.observations.map((o) => o.text).join("; ")}. Inferences: ${ch!.inferences.map((o) => o.text).join("; ")}. Alternatives: ${ch!.alternatives.map((o) => o.text).join("; ")}.`, response: `OBSERVED: ${f.observed}\nINFER: ${f.infer}\nBECAUSE: ${f.because}\nALTERNATIVES: ${f.alternatives}\nCONFIDENCE: ${conf}\nWOULD CHANGE MY MIND: ${f.change}`, context: ch!.situation });
      if (res.ok) {
        feedback = res.data.feedback;
        score = (score + res.data.score) / 2;
      }
    }
    setResult({ obs, inf, alt, feedback, score: Math.max(0, score) });
    await record({
      mode: "ladder",
      challengeId: ch!.id,
      response: { ...f, conf },
      score: Math.max(0, score),
      confidence: conf ?? undefined,
      latencyMs: timer.elapsed(),
      difficulty: ch!.difficulty,
      label: `Inference Ladder · ${ch!.title}`,
      evidence: [
        { subskill: "observation.separation", score: Math.max(0, Math.min(1, obs / 3 - blur * 0.2)) },
        { subskill: "inference.hypothesis", score: Math.min(1, inf / 2) },
        { subskill: "inference.alternatives", score: Math.min(1, alt / 2) },
        { subskill: "inference.disconfirmation", score: wordCount(f.change) >= 6 ? 0.8 : 0.3 },
      ],
      errors: [...(blur ? [{ type: "MISREAD" as const, subskill: "observation.separation" as const, detail: "Listed an interpretation under 'I observed'." }] : []), ...(alt === 0 ? [{ type: "ALTERNATIVE_NEGLECT" as const, subskill: "inference.alternatives" as const, detail: `${ch!.title}: no alternative that a careful reader would list.` }] : [])],
    });
    setBusy(false);
  }

  return (
    <div className="page">
      <ModeHeader mode="ladder" title={ch.title} />
      <div className="sheet paper-texture p-6 md:p-8 mb-6"><p className="prose-study">{ch.situation}</p></div>
      {!result ? (
        <div className="space-y-4">
          <TextArea label="I observed (one per line; only what was literally there)" serif rows={4} value={f.observed} onChange={(e) => setF({ ...f, observed: e.target.value })} />
          <TextArea label="I infer" serif rows={2} value={f.infer} onChange={(e) => setF({ ...f, infer: e.target.value })} />
          <TextArea label="Because" serif rows={2} value={f.because} onChange={(e) => setF({ ...f, because: e.target.value })} />
          <TextArea label="Alternatives (one per line)" serif rows={3} value={f.alternatives} onChange={(e) => setF({ ...f, alternatives: e.target.value })} />
          <ConfidenceDial value={conf} onChange={setConf} label="Confidence in the inference" />
          <TextArea label="What would change my mind" serif rows={2} value={f.change} onChange={(e) => setF({ ...f, change: e.target.value })} />
          <Button size="lg" disabled={busy || wordCount(f.observed) < 4 || wordCount(f.infer) < 3 || conf === null} onClick={submit}>{busy ? "Reading…" : "Commit"}</Button>
        </div>
      ) : (
        <div className="space-y-6 anim-place">
          <Verdict good={result.score >= 0.55}>Observed {result.obs} of {ch.observations.length} key details, {result.inf} of {ch.inferences.length} reasonable inferences, {result.alt} of {ch.alternatives.length} alternatives.{result.feedback ? <span className="block mt-2 text-[14px] text-ink-2 font-sans">{result.feedback}</span> : null}</Verdict>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[["Observations", ch.observations], ["Inferences", ch.inferences], ["Alternatives", ch.alternatives]].map(([t, xs]) => (
              <div key={t as string}><div className="eyebrow mb-2">{t as string}</div><ul className="space-y-1">{(xs as { text: string }[]).map((x) => <li key={x.text} className="text-[14px] pl-3 border-l border-line-2 text-ink-2">{x.text}</li>)}</ul></div>
            ))}
          </div>
          <Debrief text={ch.debrief} />
          <Finish onAgain={() => { setNonce((n) => n + 1); setF({ observed: "", infer: "", because: "", alternatives: "", change: "" }); setConf(null); setResult(null); timer.reset(); }} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Causal                                                              */
/* ------------------------------------------------------------------ */

export function Causal({ id }: { id?: string }) {
  const record = useInferenceRecorder();
  const [nonce, setNonce] = useState(0);
  const ch = useMemo(() => pickBy(CAUSAL, id, todayKey() + ":ca" + nonce), [id, nonce]);
  const [pick, setPick] = useState<string | null>(null);
  const [conf, setConf] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const timer = useStart();
  if (!ch) return <div className="page"><ModeHeader mode="best_explanation" /><p className="text-ink-3">Challenges are being prepared.</p></div>;

  async function submit() {
    const o = ch!.options.find((x) => x.id === pick)!;
    setDone(true);
    await record({
      mode: "best_explanation",
      challengeId: ch!.id,
      response: { pick, conf },
      score: o.correct ? 1 : 0,
      correct: o.correct,
      confidence: conf ?? undefined,
      latencyMs: timer.elapsed(),
      difficulty: ch!.difficulty,
      label: `Causal · ${ch!.title}`,
      evidence: [{ subskill: "inference.causal", score: o.correct ? 1 : 0, format: "mcq", correct: o.correct }],
      errors: !o.correct ? [{ type: o.errorType ?? "CAUSAL_ERROR", subskill: "inference.causal", detail: `${ch!.title}: "${o.text}"` }] : [],
      calibration: conf !== null ? { confidence: conf, correct: o.correct, domain: "inference" } : undefined,
    });
  }

  return (
    <div className="page">
      <header className="mb-6"><div className="eyebrow eyebrow-wine">Causal reasoning</div><h1 className="display text-[30px] md:text-[36px] mt-1">{ch.title}</h1></header>
      <div className="sheet paper-texture p-6 md:p-8 mb-6"><div className="eyebrow mb-2">The claim</div><p className="serif text-[20px] leading-snug">{ch.claim}</p><p className="text-[14px] text-ink-2 mt-3">{ch.context}</p></div>
      <div className="space-y-2">{ch.options.map((o, i) => <Choice key={o.id} index={i} label={o.text} selected={pick === o.id} onClick={() => !done && setPick(o.id)} disabled={done} correct={done && o.correct} wrong={done && pick === o.id && !o.correct} detail={done ? o.why : undefined} />)}</div>
      <div className="mt-4"><ConfidenceDial value={conf} onChange={setConf} disabled={done} /></div>
      {!done ? <div className="mt-6"><Button size="lg" disabled={!pick || conf === null} onClick={submit}>Commit</Button></div> : (
        <div className="mt-6 space-y-6 anim-place">
          <Debrief text={ch.debrief} />
          <Finish onAgain={() => { setNonce((n) => n + 1); setPick(null); setConf(null); setDone(false); timer.reset(); }} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Fast, then Slow                                                     */
/* ------------------------------------------------------------------ */

export function FastSlow({ id }: { id?: string }) {
  const record = useInferenceRecorder();
  const [nonce, setNonce] = useState(0);
  const ch = useMemo(() => pickBy(FAST_SLOW, id, todayKey() + ":fs" + nonce), [id, nonce]);
  const [phase, setPhase] = useState<"intro" | "fast" | "slow" | "done">("intro");
  const [fast, setFast] = useState<string | null>(null);
  const [slow, setSlow] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const timer = useStart();
  const left = useCountdown(ch?.fastSeconds ?? 12, phase === "fast", () => setPhase("slow"));
  useEffect(() => {
    if (phase === "slow" && fast === null) setFast("none");
  }, [phase, fast]);
  if (!ch) return <div className="page"><ModeHeader mode="fast_slow" /><p className="text-ink-3">Challenges are being prepared.</p></div>;

  async function submit() {
    const fastOk = fast === ch!.correct;
    const slowOk = slow === ch!.correct;
    setPhase("done");
    await record({
      mode: "fast_slow",
      challengeId: ch!.id,
      response: { fast, slow, reason },
      score: slowOk ? 1 : 0,
      correct: slowOk,
      latencyMs: timer.elapsed(),
      difficulty: ch!.difficulty,
      label: `Fast, then Slow · ${ch!.title}`,
      evidence: [
        { subskill: "composure.pausing", score: slowOk ? 1 : 0, format: "timed", correct: slowOk, note: `fast ${fastOk ? "right" : "wrong"}, slow ${slowOk ? "right" : "wrong"}` },
        { subskill: ch!.domain === "quantitative" ? "quantitative.probability" : "inference.evidence_weighting", score: slowOk ? 1 : 0, format: "mcq", correct: slowOk },
        { subskill: "composure.revision", score: fastOk === slowOk ? (slowOk ? 0.8 : 0.2) : slowOk ? 1 : 0.1, format: "timed" },
      ],
      errors: !slowOk ? [{ type: "PREMATURE_CLOSURE", subskill: "composure.pausing", detail: `${ch!.title}: the deliberate answer was still wrong.` }] : [],
    });
  }

  return (
    <div className="page">
      <ModeHeader mode="fast_slow" title={ch.title} />
      {phase === "intro" ? (
        <div className="sheet p-6"><p className="text-[14px] text-ink-2">You get <span className="numeral text-ink">{ch.fastSeconds} seconds</span> for a first impression, then as long as you like to think it through. Both answers are kept. The comparison is the point.</p><Button size="lg" className="mt-5" onClick={() => { setPhase("fast"); timer.reset(); }}>Begin</Button></div>
      ) : null}
      {phase !== "intro" ? (
        <div>
          <p className="serif text-[22px] leading-snug mb-5">{ch.question}</p>
          {phase === "fast" ? (
            <div className="anim-place">
              <div className="flex items-center justify-between mb-3"><span className="eyebrow">First impression</span><span className="numeral text-[14px]">{Math.ceil(left)}s</span></div>
              <div className="space-y-2">{ch.options.map((o, i) => <Choice key={o.id} index={i} label={o.text} selected={fast === o.id} onClick={() => { setFast(o.id); setPhase("slow"); }} />)}</div>
            </div>
          ) : null}
          {phase === "slow" ? (
            <div className="anim-place">
              <div className="eyebrow mb-3">Deliberate review</div>
              <div className="space-y-2">{ch.options.map((o, i) => <Choice key={o.id} index={i} label={o.text} selected={slow === o.id} onClick={() => setSlow(o.id)} />)}</div>
              <TextArea className="mt-4" label="Why" serif rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
              <div className="mt-4"><Button size="lg" disabled={!slow} onClick={submit}>Commit</Button></div>
            </div>
          ) : null}
          {phase === "done" ? (
            <div className="space-y-6 anim-place">
              <div className="grid grid-cols-2 gap-6 border-t border-ink pt-4">
                <div><div className="eyebrow">Fast</div><div className={cx("serif text-[18px] mt-1", fast === ch.correct ? "text-forest" : "text-wine")}>{fast === "none" ? "No answer in time" : ch.options.find((o) => o.id === fast)?.text}</div></div>
                <div><div className="eyebrow">Slow</div><div className={cx("serif text-[18px] mt-1", slow === ch.correct ? "text-forest" : "text-wine")}>{ch.options.find((o) => o.id === slow)?.text}</div></div>
              </div>
              <Verdict good={slow === ch.correct}>{fast === ch.correct && slow === ch.correct ? "Your instinct was right and analysis agreed. Intuition earned its keep here." : fast !== ch.correct && slow === ch.correct ? "Thinking improved the answer. This is a domain where the pause pays." : fast === ch.correct && slow !== ch.correct ? "Your first impression was right and you reasoned yourself out of it. Notice which domain this was." : "Both passes missed. The explanation below is worth a minute."}</Verdict>
              <Debrief text={ch.explanation} title="Explanation" />
              <Finish onAgain={() => { setNonce((n) => n + 1); setPhase("intro"); setFast(null); setSlow(null); setReason(""); }} />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
