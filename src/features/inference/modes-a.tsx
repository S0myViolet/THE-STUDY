"use client";

import React, { useMemo, useState } from "react";
import { THREE_STORIES, BEST_EXPLANATION, MISSING_VARIABLE, BASE_RATE, COUNTERFACTUAL, ANOMALY } from "@/content";
import { Button, Choice, ConfidenceDial, Field, TextArea } from "@/components/ui/primitives";
import { ModeHeader, Evidence, Debrief, Finish, Verdict, matchList, useInferenceRecorder, useStart, pickBy } from "./shared";
import { ai, useAIStatus } from "@/lib/ai/client";
import { keyPointCoverage, wordCount } from "@/lib/scoring/text";
import { cx, todayKey } from "@/lib/util/format";

/* ------------------------------------------------------------------ */
/* Three Stories                                                       */
/* ------------------------------------------------------------------ */

export function ThreeStories({ id }: { id?: string }) {
  const record = useInferenceRecorder();
  const aiStatus = useAIStatus();
  const [nonce, setNonce] = useState(0);
  const ch = useMemo(() => pickBy(THREE_STORIES, id, todayKey() + ":ts" + nonce), [id, nonce]);
  const [stories, setStories] = useState(["", "", ""]);
  const [result, setResult] = useState<{ matched: number[]; unmatched: string[]; obviousOnly: boolean; feedback?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const timer = useStart();
  if (!ch) return <div className="page"><ModeHeader mode="three_stories" /><p className="text-ink-3">Challenges are being prepared.</p></div>;

  async function submit() {
    setBusy(true);
    const { matched, unmatched } = matchList(stories, ch!.plausible.map((p) => ({ text: p.title, keywords: p.keywords })));
    const distinct = new Set(matched).size;
    const obviousOnly = distinct <= 1 && keyPointCoverage(stories.join(" "), [ch!.obvious]).ratio > 0;
    let feedback: string | undefined;
    let score = Math.min(1, distinct / 3 + (unmatched.length && distinct >= 2 ? 0.1 : 0));
    if (aiStatus.configured) {
      const res = await ai.call("evaluateReasoning", { task: "Give three plausible, genuinely different explanations for the evidence.", groundTruth: ch!.plausible.map((p) => `${p.title}: ${p.note}`).join("; "), response: stories.map((s, i) => `${i + 1}. ${s}`).join("\n"), context: ch!.evidence.join(" ") });
      if (res.ok) {
        feedback = res.data.feedback;
        score = (score + Math.min(1, res.data.alternativesConsidered / 3)) / 2;
      }
    }
    setResult({ matched, unmatched, obviousOnly, feedback });
    await record({
      mode: "three_stories",
      challengeId: ch!.id,
      response: { stories },
      score,
      latencyMs: timer.elapsed(),
      difficulty: ch!.difficulty,
      label: `Three Stories · ${ch!.title}`,
      evidence: [{ subskill: "inference.alternatives", score }, { subskill: "inference.hypothesis", score: distinct >= 1 ? 0.8 : 0.3 }],
      errors: distinct < 2 ? [{ type: "ALTERNATIVE_NEGLECT", subskill: "inference.alternatives", detail: `${ch!.title}: ${distinct} distinct plausible explanation(s).` }, ...(obviousOnly ? [{ type: "PREMATURE_CLOSURE" as const, subskill: "inference.alternatives" as const, detail: `${ch!.title}: settled on the obvious story.` }] : [])] : [],
    });
    setBusy(false);
  }

  return (
    <div className="page">
      <ModeHeader mode="three_stories" title={ch.title} />
      <Evidence lines={ch.evidence} />
      {!result ? (
        <div className="space-y-4">
          {stories.map((s, i) => (
            <TextArea key={i} label={["First explanation", "A different explanation", "A third, unlikely but possible"][i]} serif rows={2} value={s} onChange={(e) => setStories((st) => st.map((x, j) => (j === i ? e.target.value : x)))} />
          ))}
          <Button size="lg" disabled={busy || stories.some((s) => wordCount(s) < 4)} onClick={submit}>{busy ? "Reading…" : "Commit"}</Button>
        </div>
      ) : (
        <div className="space-y-6 anim-place">
          <Verdict good={new Set(result.matched).size >= 2}>
            {new Set(result.matched).size >= 3 ? "Three genuinely different explanations." : new Set(result.matched).size === 2 ? "Two distinct explanations; the third circled back." : result.obviousOnly ? `You reached for the obvious story: ${ch.obvious}. Then stayed there.` : "One explanation and its variations."}
            {result.feedback ? <span className="block mt-2 text-[14px] text-ink-2 font-sans">{result.feedback}</span> : null}
          </Verdict>
          <section>
            <div className="eyebrow mb-2">What a careful reader lists</div>
            <ul className="space-y-2">
              {ch.plausible.map((p, i) => (
                <li key={p.title} className={cx("pl-3 border-l", result.matched.includes(i) ? "border-forest" : "border-line-2")}>
                  <span className="serif text-[17px]">{p.title}</span>
                  <span className="block text-[13px] text-ink-3">{p.note}</span>
                </li>
              ))}
            </ul>
          </section>
          <Debrief text={ch.debrief} />
          <Finish onAgain={() => { setNonce((n) => n + 1); setStories(["", "", ""]); setResult(null); timer.reset(); }} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Best Explanation                                                    */
/* ------------------------------------------------------------------ */

export function BestExplanation({ id }: { id?: string }) {
  const record = useInferenceRecorder();
  const [nonce, setNonce] = useState(0);
  const ch = useMemo(() => pickBy(BEST_EXPLANATION, id, todayKey() + ":be" + nonce), [id, nonce]);
  const [scores, setScores] = useState<Record<string, { explained: number; assumptions: number; contradictions: number; plausibility: number }>>({});
  const [pick, setPick] = useState<string | null | "insufficient">(null);
  const [done, setDone] = useState<{ score: number } | null>(null);
  const timer = useStart();
  if (!ch) return <div className="page"><ModeHeader mode="best_explanation" /><p className="text-ink-3">Challenges are being prepared.</p></div>;
  const ready = ch.hypotheses.every((h) => scores[h.id]) && pick !== null;

  async function submit() {
    // Agreement between user's scoring and the reference, plus whether the final pick matches.
    let agree = 0;
    for (const h of ch!.hypotheses) {
      const s = scores[h.id];
      agree += 1 - Math.min(1, Math.abs(s.explained - h.evidenceExplained) + Math.abs(s.plausibility - h.plausibility)) / 2;
    }
    agree /= ch!.hypotheses.length;
    const pickCorrect = ch!.best === null ? pick === "insufficient" : pick === ch!.best;
    const score = Math.round((agree * 0.5 + (pickCorrect ? 0.5 : 0)) * 100) / 100;
    setDone({ score });
    await record({
      mode: "best_explanation",
      challengeId: ch!.id,
      response: { scores, pick },
      score,
      correct: pickCorrect,
      latencyMs: timer.elapsed(),
      difficulty: ch!.difficulty,
      label: `Best Explanation · ${ch!.title}`,
      evidence: [{ subskill: "inference.evidence_weighting", score }, ...(ch!.best === null ? [{ subskill: "composure.ambiguity" as const, score: pick === "insufficient" ? 1 : 0.2 }] : [])],
      errors: !pickCorrect ? [{ type: ch!.best === null ? "PREMATURE_CLOSURE" : "CONFIRMATION_BIAS", subskill: "inference.evidence_weighting", detail: `${ch!.title}: chose ${pick === "insufficient" ? "insufficient evidence" : ch!.hypotheses.find((h) => h.id === pick)?.text}.` }] : [],
    });
  }

  const Slider = ({ label, value, onChange, max = 1, step = 0.1 }: { label: string; value: number; onChange: (v: number) => void; max?: number; step?: number }) => (
    <label className="block">
      <span className="flex justify-between text-[11px] text-ink-3 uppercase tracking-wider"><span>{label}</span><span className="numeral">{max === 1 ? Math.round(value * 100) + "%" : value}</span></span>
      <input type="range" min={0} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[var(--ink)]" disabled={!!done} />
    </label>
  );

  return (
    <div className="page">
      <ModeHeader mode="best_explanation" title={ch.title} />
      <Evidence lines={ch.evidence} />
      <div className="space-y-6">
        {ch.hypotheses.map((h) => {
          const s = scores[h.id] ?? { explained: 0.5, assumptions: 1, contradictions: 0, plausibility: 0.5 };
          return (
            <div key={h.id} className="sheet p-5">
              <p className="serif text-[18px]">{h.text}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <Slider label="Evidence explained" value={s.explained} onChange={(v) => setScores((sc) => ({ ...sc, [h.id]: { ...s, explained: v } }))} />
                <Slider label="Assumptions needed" value={s.assumptions} max={5} step={1} onChange={(v) => setScores((sc) => ({ ...sc, [h.id]: { ...s, assumptions: v } }))} />
                <Slider label="Contradictions" value={s.contradictions} max={4} step={1} onChange={(v) => setScores((sc) => ({ ...sc, [h.id]: { ...s, contradictions: v } }))} />
                <Slider label="Plausibility" value={s.plausibility} onChange={(v) => setScores((sc) => ({ ...sc, [h.id]: { ...s, plausibility: v } }))} />
              </div>
              {done ? <p className="mt-3 text-[13px] text-ink-3">Reference: explains {Math.round(h.evidenceExplained * 100)}%, {h.assumptions} assumption{h.assumptions === 1 ? "" : "s"}, {h.contradictions} contradiction{h.contradictions === 1 ? "" : "s"}, plausibility {Math.round(h.plausibility * 100)}%. {h.note}</p> : null}
            </div>
          );
        })}
      </div>
      <div className="mt-6">
        <div className="eyebrow mb-2">Which explanation is best supported?</div>
        <div className="space-y-2">
          {ch.hypotheses.map((h, i) => <Choice key={h.id} index={i} label={h.text} selected={pick === h.id} onClick={() => !done && setPick(h.id)} disabled={!!done} correct={!!done && ch.best === h.id} wrong={!!done && pick === h.id && ch.best !== h.id} />)}
          <Choice label="The evidence cannot yet separate them — insufficient evidence" selected={pick === "insufficient"} onClick={() => !done && setPick("insufficient")} disabled={!!done} correct={!!done && ch.best === null} wrong={!!done && pick === "insufficient" && ch.best !== null} />
        </div>
      </div>
      {!done ? <div className="mt-6"><Button size="lg" disabled={!ready} onClick={submit}>Commit</Button></div> : (
        <div className="mt-6 space-y-6 anim-place">
          <Verdict good={ch.best === null ? pick === "insufficient" : pick === ch.best}>{ch.best === null ? (pick === "insufficient" ? "Correct: the evidence does not yet carry a conclusion." : "The evidence here genuinely cannot separate these. Declining to conclude was the strong move.") : pick === ch.best ? "Your weighting and your pick agree with a careful reading." : "Look again at which explanation requires the fewest assumptions while explaining the most."}</Verdict>
          <Debrief text={ch.debrief} />
          <Finish onAgain={() => { setNonce((n) => n + 1); setScores({}); setPick(null); setDone(null); timer.reset(); }} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Missing Variable                                                    */
/* ------------------------------------------------------------------ */

export function MissingVariable({ id }: { id?: string }) {
  const record = useInferenceRecorder();
  const [nonce, setNonce] = useState(0);
  const ch = useMemo(() => pickBy(MISSING_VARIABLE, id, todayKey() + ":mv" + nonce), [id, nonce]);
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ matched: number[]; unmatched: string[] } | null>(null);
  const timer = useStart();
  if (!ch) return <div className="page"><ModeHeader mode="missing_variable" /><p className="text-ink-3">Challenges are being prepared.</p></div>;

  async function submit() {
    const items = text.split(/\n/).map((s) => s.trim()).filter(Boolean);
    const r = matchList(items, ch!.candidates);
    setResult(r);
    const strong = r.matched.some((i) => ch!.candidates[i].strength === "strong");
    const score = Math.min(1, (strong ? 0.6 : r.matched.length ? 0.4 : 0.1) + r.matched.length * 0.15);
    await record({
      mode: "missing_variable",
      challengeId: ch!.id,
      response: { items },
      score,
      latencyMs: timer.elapsed(),
      difficulty: ch!.difficulty,
      label: `Missing Variable · ${ch!.title}`,
      evidence: [{ subskill: "inference.causal", score }],
      errors: !r.matched.length ? [{ type: "CAUSAL_ERROR", subskill: "inference.causal", detail: `${ch!.title}: no plausible confounder identified.` }] : [],
    });
  }

  return (
    <div className="page">
      <ModeHeader mode="missing_variable" title={ch.title} />
      <div className="sheet paper-texture p-6 md:p-8 mb-6"><div className="eyebrow mb-2">The correlation</div><p className="serif text-[20px] leading-snug">{ch.correlation}</p></div>
      {!result ? (
        <div>
          <TextArea label="Third factors that could produce this, one per line" serif rows={4} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void submit(); }} />
          <div className="mt-4"><Button size="lg" disabled={wordCount(text) < 2} onClick={submit}>Commit</Button></div>
        </div>
      ) : (
        <div className="space-y-6 anim-place">
          <Verdict good={result.matched.length > 0}>{result.matched.length ? `You found ${result.matched.length} of ${ch.candidates.length} candidate factors.` : "None of these is a factor a careful reader would reach for. See below."}</Verdict>
          <ul className="space-y-2">{ch.candidates.map((c, i) => <li key={i} className={cx("pl-3 border-l", result.matched.includes(i) ? "border-forest" : "border-line-2")}><span className="serif text-[17px]">{c.text}</span> <span className="text-[12px] text-ink-3 uppercase tracking-wider ml-2">{c.strength}</span></li>)}</ul>
          <Debrief text={ch.debrief} />
          <Finish onAgain={() => { setNonce((n) => n + 1); setText(""); setResult(null); timer.reset(); }} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Base Rate                                                           */
/* ------------------------------------------------------------------ */

export function BaseRate({ id }: { id?: string }) {
  const record = useInferenceRecorder();
  const [nonce, setNonce] = useState(0);
  const ch = useMemo(() => pickBy(BASE_RATE, id, todayKey() + ":br" + nonce), [id, nonce]);
  const [pick, setPick] = useState<string | null>(null);
  const [num, setNum] = useState("");
  const [conf, setConf] = useState<number | null>(null);
  const [done, setDone] = useState<{ correct: boolean; numericOk?: boolean } | null>(null);
  const timer = useStart();
  if (!ch) return <div className="page"><ModeHeader mode="base_rate" /><p className="text-ink-3">Challenges are being prepared.</p></div>;

  async function submit() {
    const chosen = ch!.options.find((o) => o.id === pick)!;
    let numericOk: boolean | undefined;
    if (ch!.numeric) {
      const v = Number(num.replace("%", "")) / (ch!.numeric.unit === "probability" && Number(num.replace("%", "")) > 1 ? 100 : 1);
      numericOk = Math.abs(v - ch!.numeric.answer) <= ch!.numeric.tolerance;
    }
    const correct = chosen.correct && (numericOk ?? true);
    setDone({ correct, numericOk });
    await record({
      mode: "base_rate",
      challengeId: ch!.id,
      response: { pick, num, conf },
      score: correct ? 1 : chosen.correct ? 0.6 : 0,
      correct,
      confidence: conf ?? undefined,
      latencyMs: timer.elapsed(),
      difficulty: ch!.difficulty,
      label: `Base Rate · ${ch!.title}`,
      evidence: [{ subskill: "inference.base_rates", score: correct ? 1 : chosen.correct ? 0.6 : 0, format: "mcq", correct }, ...(ch!.numeric ? [{ subskill: "quantitative.probability" as const, score: numericOk ? 1 : 0, format: "numeric" as const, correct: numericOk }] : [])],
      errors: !chosen.correct ? [{ type: "BASE_RATE_NEGLECT", subskill: "inference.base_rates", detail: `${ch!.title}: chose "${chosen.text}".` }] : [],
      calibration: conf !== null ? { confidence: conf, correct, domain: "quantitative" } : undefined,
    });
  }

  return (
    <div className="page">
      <ModeHeader mode="base_rate" title={ch.title} />
      <div className="sheet paper-texture p-6 md:p-8 mb-6 space-y-3">
        <p className="serif text-[17px] leading-relaxed">{ch.setup}</p>
        <p className="serif text-[17px] leading-relaxed border-l-2 border-wine pl-4">{ch.evidence}</p>
      </div>
      <div className="space-y-2">{ch.options.map((o, i) => <Choice key={o.id} index={i} label={o.text} selected={pick === o.id} onClick={() => !done && setPick(o.id)} disabled={!!done} correct={!!done && o.correct} wrong={!!done && pick === o.id && !o.correct} detail={done ? o.why : undefined} />)}</div>
      {ch.numeric ? <Field className="mt-4 max-w-xs" label={ch.numeric.unit === "probability" ? "Your estimate (probability, e.g. 0.08 or 8%)" : "Your estimate (count)"} value={num} onChange={(e) => setNum(e.target.value)} disabled={!!done} inputMode="decimal" /> : null}
      <div className="mt-4"><ConfidenceDial value={conf} onChange={setConf} disabled={!!done} /></div>
      {!done ? <div className="mt-6"><Button size="lg" disabled={!pick || conf === null || (!!ch.numeric && !num)} onClick={submit}>Commit</Button></div> : (
        <div className="mt-6 space-y-6 anim-place">
          <Verdict good={done.correct}>{done.correct ? "The base rate held." : ch.baseRateNote}{done.numericOk === false ? ` The number: about ${ch.numeric!.unit === "probability" ? Math.round(ch.numeric!.answer * 100) + "%" : ch.numeric!.answer}.` : ""}</Verdict>
          <Debrief text={ch.baseRateNote} title="Base rate note" />
          <Finish onAgain={() => { setNonce((n) => n + 1); setPick(null); setNum(""); setConf(null); setDone(null); timer.reset(); }} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Counterfactual & Disconfirm Me                                      */
/* ------------------------------------------------------------------ */

export function Counterfactual({ id, disconfirm }: { id?: string; disconfirm?: boolean }) {
  const record = useInferenceRecorder();
  const aiStatus = useAIStatus();
  const [nonce, setNonce] = useState(0);
  const ch = useMemo(() => pickBy(COUNTERFACTUAL, id, todayKey() + ":cf" + nonce), [id, nonce]);
  const [own, setOwn] = useState("");
  const [useOwn, setUseOwn] = useState(false);
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ matched: number[]; unmatched: string[]; feedback?: string; score: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const timer = useStart();
  const mode = disconfirm ? "disconfirm" : "counterfactual";
  if (!ch) return <div className="page"><ModeHeader mode={mode} /><p className="text-ink-3">Challenges are being prepared.</p></div>;
  const theory = useOwn && own.trim() ? own.trim() : ch.theory;

  async function submit() {
    setBusy(true);
    const items = text.split(/\n/).map((s) => s.trim()).filter(Boolean);
    let matched: number[] = [];
    let unmatched: string[] = items;
    let score: number;
    let feedback: string | undefined;
    if (!useOwn) {
      const r = matchList(items, ch!.expected);
      matched = r.matched;
      unmatched = r.unmatched;
      score = Math.min(1, matched.length / Math.min(2, ch!.expected.length) + (unmatched.length >= 1 && matched.length ? 0.1 : 0));
    } else {
      // Heuristic for a user-supplied theory: observable, specific, conditional statements.
      const observable = items.filter((t) => /\b(would|should|expect|see|find|observe|measure|show|if|no|not|fewer|more|less)\b/i.test(t) && wordCount(t) >= 5).length;
      score = Math.min(1, observable / 3);
    }
    if (aiStatus.configured) {
      const res = await ai.call("evaluateReasoning", { task: `List what one would expect to observe if this theory were false: "${theory}"`, groundTruth: useOwn ? "Expected observations must be specific, observable and would actually discriminate." : ch!.expected.map((e) => e.text).join("; "), response: items.join("\n"), context: ch!.context });
      if (res.ok) {
        feedback = res.data.feedback;
        score = (score + res.data.score) / 2;
      }
    }
    setResult({ matched, unmatched, feedback, score });
    await record({
      mode,
      challengeId: useOwn ? "own" : ch!.id,
      response: { theory, items },
      score,
      latencyMs: timer.elapsed(),
      difficulty: ch!.difficulty,
      label: `${disconfirm ? "Disconfirm Me" : "Counterfactual"} · ${useOwn ? theory.slice(0, 40) : ch!.title}`,
      evidence: [{ subskill: "inference.disconfirmation", score }],
      errors: score < 0.4 ? [{ type: "CONFIRMATION_BIAS", subskill: "inference.disconfirmation", detail: `Could not name what would weaken "${theory.slice(0, 60)}".` }] : [],
    });
    setBusy(false);
  }

  return (
    <div className="page">
      <ModeHeader mode={mode} title={useOwn ? "Your hypothesis" : ch.title} />
      {disconfirm ? (
        <div className="mb-5 flex flex-wrap gap-2">
          <button className="choice !w-auto !py-1.5 !px-3 text-[13px]" aria-pressed={!useOwn} onClick={() => setUseOwn(false)} disabled={!!result}>Use a prepared theory</button>
          <button className="choice !w-auto !py-1.5 !px-3 text-[13px]" aria-pressed={useOwn} onClick={() => setUseOwn(true)} disabled={!!result}>State my own</button>
        </div>
      ) : null}
      {useOwn ? (
        <TextArea label="Your hypothesis" serif rows={2} value={own} onChange={(e) => setOwn(e.target.value)} disabled={!!result} placeholder="The thing you currently believe about a situation." className="mb-5" />
      ) : (
        <div className="sheet paper-texture p-6 md:p-8 mb-6"><div className="eyebrow mb-2">The theory</div><p className="serif text-[20px] leading-snug">{ch.theory}</p><p className="text-[14px] text-ink-2 mt-3">{ch.context}</p></div>
      )}
      {!result ? (
        <div>
          <TextArea label="If this were false, what would you expect to observe? One per line" serif rows={5} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void submit(); }} />
          <div className="mt-4"><Button size="lg" disabled={busy || wordCount(text) < 4 || (useOwn && wordCount(own) < 3)} onClick={submit}>{busy ? "Reading…" : "Commit"}</Button></div>
        </div>
      ) : (
        <div className="space-y-6 anim-place">
          <Verdict good={result.score >= 0.5}>{result.score >= 0.7 ? "Specific, observable, discriminating. That is a falsifiable position." : result.score >= 0.4 ? "Some of these would genuinely weaken the theory. Make the others observable." : "These would not change your mind if you saw them. Name something that would."}{result.feedback ? <span className="block mt-2 text-[14px] text-ink-2 font-sans">{result.feedback}</span> : null}</Verdict>
          {!useOwn ? <ul className="space-y-2">{ch.expected.map((e, i) => <li key={i} className={cx("pl-3 border-l serif text-[17px]", result.matched.includes(i) ? "border-forest" : "border-line-2")}>{e.text}</li>)}</ul> : null}
          <Debrief text={ch.debrief} />
          <Finish onAgain={() => { setNonce((n) => n + 1); setText(""); setResult(null); timer.reset(); }} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Anomaly                                                             */
/* ------------------------------------------------------------------ */

export function Anomaly({ id }: { id?: string }) {
  const record = useInferenceRecorder();
  const [nonce, setNonce] = useState(0);
  const ch = useMemo(() => pickBy(ANOMALY, id, todayKey() + ":an" + nonce), [id, nonce]);
  const [pick, setPick] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ correct: boolean; matched: number[] } | null>(null);
  const timer = useStart();
  if (!ch) return <div className="page"><ModeHeader mode="anomaly" /><p className="text-ink-3">Challenges are being prepared.</p></div>;

  async function submit() {
    const correct = pick === ch!.anomalyIndex;
    const r = matchList(text.split(/\n/).map((s) => s.trim()).filter(Boolean), ch!.significance);
    setResult({ correct, matched: r.matched });
    const score = (correct ? 0.5 : 0) + Math.min(0.5, r.matched.length * 0.25);
    await record({
      mode: "anomaly",
      challengeId: ch!.id,
      response: { pick, text },
      score,
      correct,
      latencyMs: timer.elapsed(),
      difficulty: ch!.difficulty,
      label: `The Anomaly · ${ch!.title}`,
      evidence: [{ subskill: "observation.anomaly", score: correct ? 1 : 0, format: "mcq", correct }, { subskill: "inference.hypothesis", score: Math.min(1, r.matched.length / 2) }],
      errors: !correct ? [{ type: "CONFIRMATION_BIAS", subskill: "observation.anomaly", detail: `${ch!.title}: missed the clue that did not fit.` }] : [],
    });
  }

  return (
    <div className="page">
      <ModeHeader mode="anomaly" title={ch.title}>
        <p className="text-[14px] text-ink-2 mt-2">The dominant explanation: <span className="serif text-[16px] text-ink">{ch.dominantExplanation}</span></p>
      </ModeHeader>
      <div className="space-y-2 mb-6">
        {ch.evidence.map((e, i) => <Choice key={i} index={i} label={e} selected={pick === i} onClick={() => !result && setPick(i)} disabled={!!result} correct={!!result && i === ch.anomalyIndex} wrong={!!result && pick === i && i !== ch.anomalyIndex} />)}
      </div>
      <TextArea label="If that clue is real, what could it mean? One or two possibilities" serif rows={3} value={text} onChange={(e) => setText(e.target.value)} disabled={!!result} />
      {!result ? <div className="mt-4"><Button size="lg" disabled={pick === null || wordCount(text) < 3} onClick={submit}>Commit</Button></div> : (
        <div className="mt-6 space-y-6 anim-place">
          <Verdict good={result.correct}>{result.correct ? "That is the line that does not fit." : "The anomaly was elsewhere. Evidence that supports the dominant story is easy to see; the piece that doesn't is the one that matters."}</Verdict>
          <ul className="space-y-2">{ch.significance.map((s, i) => <li key={i} className={cx("pl-3 border-l serif text-[17px]", result.matched.includes(i) ? "border-forest" : "border-line-2")}>{s.text}</li>)}</ul>
          <Debrief text={ch.debrief} />
          <Finish onAgain={() => { setNonce((n) => n + 1); setPick(null); setText(""); setResult(null); timer.reset(); }} />
        </div>
      )}
    </div>
  );
}
