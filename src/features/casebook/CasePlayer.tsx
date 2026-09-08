"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CaseAttempt, CaseDefinition, CaseStage, CaseStageAttempt, RecallQuestion, SeparateStatement } from "@/lib/domain/types";
import { useStudy } from "@/lib/persistence/provider";
import { stamp } from "@/lib/persistence/store";
import { ensureOne } from "@/lib/persistence/ensure";
import { recordConfidence, recordError, recordEvidence } from "@/lib/services/evidence";
import { writeAfterAction } from "@/lib/services/after-action";
import { reachMilestone } from "@/lib/services/notifications";
import { detectRedThreads } from "@/lib/adaptation/red-thread";
import { useSessionItem } from "@/lib/services/session-context";
import { ai, useAIStatus } from "@/lib/ai/client";
import { Button, Choice, ConfidenceDial, Countdown, Field, HairlineProgress, Note, TextArea, useCountdown } from "@/components/ui/primitives";
import { ReasoningPath } from "@/components/ui/ReasoningPath";
import { I } from "@/components/ui/icons";
import { Material } from "./Material";
import { buildScene, createRng, generateQuestions } from "@/lib/scene";
import { composeSummary, evalDecision, evalExplain, evalFreeQuestion, evalHypotheses, evalQuestionOption, evalRecall, evalSeparate, evalUpdate, type StageOutcomes } from "./evaluate";
import { cx, minutes } from "@/lib/util/format";
import { DIFFICULTY_LABEL, FACULTY_META } from "@/lib/domain/faculties";

const STAGE_LABEL: Record<CaseStage["kind"], string> = {
  enter: "Enter",
  notice: "Notice",
  recall: "Recall",
  separate: "Separate",
  hypotheses: "Hypotheses",
  question: "The Question",
  evidence: "New Evidence",
  update: "Update",
  decision: "Decision",
  explain: "Explain",
  debrief: "Debrief",
};

export function CasePlayer({ kase, onComplete, sourceKind = "case" }: { kase: CaseDefinition; onComplete?: () => void; sourceKind?: "case" | "baseline" }) {
  const { db } = useStudy();
  const router = useRouter();
  const { inSession, sessionId, finish } = useSessionItem();
  const aiStatus = useAIStatus();
  const [attempt, setAttempt] = useState<CaseAttempt | null>(null);
  const [outcomes, setOutcomes] = useState<StageOutcomes>({});
  const [stageIndex, setStageIndex] = useState(0);
  const [baselineAlt, setBaselineAlt] = useState<number | undefined>();
  const startRef = useRef<number>(performance.now());

  // Scene-based notice stages generate their recall questions from the engine.
  const sceneQuestions = useMemo(() => {
    const notice = kase.stages.find((s) => s.kind === "notice");
    if (notice?.material?.kind !== "scene" || !notice.material.scene) return null;
    const { template, seed } = notice.material.scene;
    const scene = buildScene(template, seed);
    const qs = generateQuestions(scene, createRng(seed + 1), 6);
    return qs.map<RecallQuestion>((q) => ({ id: q.id, prompt: q.prompt, kind: q.format, options: q.options, answer: q.answer, accept: q.accept, subskill: q.subskill }));
  }, [kase]);

  // Load or create the attempt; rebuild outcomes from stored stage attempts.
  useEffect(() => {
    let alive = true;
    (async () => {
      const a = await ensureOne(db, "case_attempts", { caseId: kase.id, status: "active" }, () =>
        stamp<CaseAttempt>(db.userId, "att", { caseId: kase.id, status: "active", currentStageIndex: 0, startedAt: new Date().toISOString(), sessionId: sessionId ?? undefined }),
      );
      const stageAttempts = await db.store("case_stage_attempts").list({ where: { attemptId: a.id } });
      const o: StageOutcomes = {};
      for (const sa of stageAttempts) {
        const ev = sa.evaluation as unknown;
        if (!ev) continue;
        if (sa.stageKind === "recall") o.recall = ev as StageOutcomes["recall"];
        if (sa.stageKind === "separate") o.separate = ev as StageOutcomes["separate"];
        if (sa.stageKind === "hypotheses") o.hypotheses = ev as StageOutcomes["hypotheses"];
        if (sa.stageKind === "question") o.question = ev as StageOutcomes["question"];
        if (sa.stageKind === "update") o.update = ev as StageOutcomes["update"];
        if (sa.stageKind === "decision") o.decision = ev as StageOutcomes["decision"];
        if (sa.stageKind === "explain") o.explain = ev as StageOutcomes["explain"];
      }
      const reveal = kase.stages.find((s) => s.kind === "evidence")?.reveal;
      if (reveal) o.reveal = reveal;
      const prior = await db.store("case_attempts").list({ where: { status: "completed" } });
      const alts = prior.map((p) => p.summary?.alternativesCount).filter((x): x is number => typeof x === "number");
      if (!alive) return;
      setBaselineAlt(alts.length >= 2 ? alts.reduce((s, x) => s + x, 0) / alts.length / 3 : undefined);
      setOutcomes(o);
      setAttempt(a);
      setStageIndex(Math.min(a.currentStageIndex, kase.stages.length - 1));
    })();
    return () => {
      alive = false;
    };
  }, [db, kase, sessionId]);

  const stage = kase.stages[stageIndex];
  // Looking back at an earlier, untimed stage. Nothing there can be changed; the
  // attempt stays where it is.
  const [viewIndex, setViewIndex] = useState<number | null>(null);
  const reviewing = viewIndex !== null && viewIndex < stageIndex && !isTimedStage(kase.stages[viewIndex]) ? viewIndex : null;
  const shown = reviewing !== null ? kase.stages[reviewing] : stage;
  const returnToCurrent = useCallback(() => setViewIndex(null), []);
  const source = useMemo(() => ({ kind: sourceKind, refId: kase.id, label: `Case ${kase.number} · ${kase.title}` }), [kase, sourceKind]);

  const persistStage = useCallback(
    async (s: CaseStage, response: Record<string, unknown>, evaluation: Record<string, unknown> | undefined, score?: number) => {
      if (!attempt) return;
      const latencyMs = Math.round(performance.now() - startRef.current);
      const sa = stamp<CaseStageAttempt>(db.userId, "sat", { attemptId: attempt.id, caseId: kase.id, stageId: s.id, stageKind: s.kind, response, evaluation, score, latencyMs });
      await db.store("case_stage_attempts").put(sa);
      const nextIndex = Math.min(stageIndex + 1, kase.stages.length - 1);
      const updated = await db.store("case_attempts").update(attempt.id, { currentStageIndex: nextIndex });
      if (updated) setAttempt(updated);
      startRef.current = performance.now();
      setStageIndex(nextIndex);
      return latencyMs;
    },
    [attempt, db, kase, stageIndex],
  );

  const advance = useCallback(() => {
    if (!attempt) return;
    const nextIndex = Math.min(stageIndex + 1, kase.stages.length - 1);
    db.store("case_attempts").update(attempt.id, { currentStageIndex: nextIndex }).then((u) => u && setAttempt(u));
    startRef.current = performance.now();
    setStageIndex(nextIndex);
  }, [attempt, db, kase, stageIndex]);

  if (!attempt || !stage) {
    return (
      <div className="page">
        <div className="text-[13px] text-ink-3">Opening the file.</div>
      </div>
    );
  }

  const latency = () => Math.round(performance.now() - startRef.current);
  const sid = sessionId ?? undefined;
  const diff = kase.difficulty;

  /* ---------------- stage handlers ---------------- */

  async function onRecall(answers: Record<string, string>, questions: RecallQuestion[]) {
    const r = evalRecall(questions, answers);
    const lat = latency();
    for (const p of r.perQuestion) {
      const q = questions.find((q) => q.id === p.id)!;
      await recordEvidence(db, { subskill: q.subskill, score: p.correct ? 1 : p.unknown ? 0.15 : 0, difficulty: diff, format: q.kind === "mcq" ? "mcq" : "free", source, latencyMs: lat, correct: p.correct, sessionId: sid });
      if (!p.correct && !p.unknown) {
        await recordError(db, { type: p.falseRecall ? "FALSE_OBSERVATION" : p.numeric ? "NUMERIC_DETAIL_LOSS" : q.subskill === "observation.spatial" ? "SPATIAL_MISS" : q.subskill === "observation.chronology" ? "CHRONOLOGY_LOSS" : "OBSERVATION_MISS", subskill: q.subskill, source, detail: `${q.prompt} — answered "${p.given}", was ${q.answer}.`, sessionId: sid });
      } else if (!p.correct) {
        await recordError(db, { type: "OBSERVATION_MISS", subskill: q.subskill, source, detail: `${q.prompt} — did not know; was ${q.answer}.`, sessionId: sid });
      }
    }
    await recordEvidence(db, { subskill: "observation.precision", score: questions.length ? 1 - r.falseRecalls / questions.length : 1, difficulty: diff, format: "free", source, sessionId: sid });
    const evaluation = { ...r, questions };
    setOutcomes((o) => ({ ...o, recall: evaluation }));
    await persistStage(stage, { answers }, evaluation as unknown as Record<string, unknown>, r.score);
  }

  async function onSeparate(labels: Record<string, SeparateStatement["truth"] | undefined>, statements: SeparateStatement[]) {
    const r = evalSeparate(statements, labels);
    await recordEvidence(db, { subskill: "observation.separation", score: r.accuracy, difficulty: diff, format: "sort", source, latencyMs: latency(), sessionId: sid });
    for (const p of r.per) {
      if (p.blurred) {
        const s = statements.find((s) => s.id === p.id)!;
        await recordError(db, { type: "MISREAD", subskill: "observation.separation", source, detail: `Called an ${s.truth} an observation: "${s.text}"`, sessionId: sid });
      }
    }
    const evaluation = { ...r, statements };
    setOutcomes((o) => ({ ...o, separate: evaluation }));
    await persistStage(stage, { labels }, evaluation as unknown as Record<string, unknown>, r.accuracy);
  }

  async function onHypotheses(h: { primary: string; alternative: string; unlikely: string }, confidence: number) {
    const rubric = stage.rubric!;
    let r = evalHypotheses(rubric, h);
    let aiFeedback: string | undefined;
    if (aiStatus.configured) {
      const res = await ai.call("evaluateReasoning", { task: "Generate a primary, an alternative and an unlikely-but-possible explanation for the evidence.", groundTruth: `${kase.groundTruth}\nPlausible explanations: ${rubric.plausible.map((p) => p.title + " — " + p.note).join("; ")}`, response: `PRIMARY: ${h.primary}\nALTERNATIVE: ${h.alternative}\nUNLIKELY BUT POSSIBLE: ${h.unlikely}`, context: kase.summary });
      if (res.ok) {
        aiFeedback = res.data.feedback;
        r = { ...r, alternativesScore: Math.round(((r.alternativesScore + Math.min(1, res.data.alternativesConsidered / 3)) / 2) * 1000) / 1000, hypothesisScore: Math.round(((r.hypothesisScore + res.data.score) / 2) * 1000) / 1000 };
      }
    }
    await recordEvidence(db, { subskill: "inference.hypothesis", score: r.hypothesisScore, difficulty: diff, format: "free", source, latencyMs: latency(), sessionId: sid });
    await recordEvidence(db, { subskill: "inference.alternatives", score: r.alternativesScore, difficulty: diff, format: "free", source, sessionId: sid });
    if (r.distinctPlausible < 2) await recordError(db, { type: "ALTERNATIVE_NEGLECT", subskill: "inference.alternatives", source, detail: `Only ${r.distinctPlausible} distinct plausible explanation(s) offered.`, sessionId: sid });
    if (r.distinctPlausible < 2 && confidence >= 0.75) await recordError(db, { type: "PREMATURE_CLOSURE", subskill: "inference.alternatives", source, detail: `Confidence ${Math.round(confidence * 100)}% with a single explanation.`, sessionId: sid });
    const evaluation = { ...r, confidenceBefore: confidence, aiFeedback };
    setOutcomes((o) => ({ ...o, hypotheses: evaluation }));
    await persistStage(stage, { ...h, confidence }, evaluation as unknown as Record<string, unknown>, (r.hypothesisScore + r.alternativesScore) / 2);
  }

  async function onQuestion(choice: { optionId?: string; text?: string }) {
    let r;
    if (choice.optionId) {
      const o = stage.questionOptions!.find((o) => o.id === choice.optionId)!;
      r = evalQuestionOption(o);
    } else {
      r = evalFreeQuestion(choice.text ?? "", kase.stages.find((s) => s.kind === "hypotheses")?.rubric, stage.questionOptions);
      if (aiStatus.configured) {
        const res = await ai.call("evaluateQuestion", { scenario: `${kase.summary}\n${stage.narrative ?? ""}`, unknowns: kase.stages.find((s) => s.kind === "hypotheses")?.rubric?.plausible.map((p) => p.title) ?? [], question: choice.text });
        if (res.ok) r = { ...r, informationValue: res.data.informationValue, rapportCost: res.data.rapportCost, leading: res.data.leading, type: res.data.type, feedback: res.data.feedback + (res.data.betterQuestion ? ` A stronger question: "${res.data.betterQuestion}"` : "") };
      }
    }
    await recordEvidence(db, { subskill: "inference.information_value", score: r.informationValue, difficulty: diff, format: choice.optionId ? "mcq" : "free", source, latencyMs: latency(), sessionId: sid });
    await recordEvidence(db, { subskill: "social.question_quality", score: r.leading ? Math.min(r.informationValue, 0.3) : r.informationValue, difficulty: diff, format: choice.optionId ? "mcq" : "free", source, sessionId: sid });
    if (r.informationValue < 0.4) await recordError(db, { type: "INFORMATION_VALUE", subskill: "inference.information_value", source, detail: `Asked: "${r.text}" (information value ${Math.round(r.informationValue * 100)}%).`, sessionId: sid });
    if (r.leading) await recordError(db, { type: "LEADING_QUESTION", subskill: "social.question_quality", source, detail: `Leading: "${r.text}"`, sessionId: sid });
    setOutcomes((o) => ({ ...o, question: r }));
    await persistStage(stage, choice, r as unknown as Record<string, unknown>, r.informationValue);
  }

  async function onUpdate(after: number) {
    const before = outcomes.hypotheses?.confidenceBefore ?? 0.5;
    const reveal = outcomes.reveal ?? kase.stages.find((s) => s.kind === "evidence")?.reveal;
    const primaryTitle = outcomes.hypotheses?.matches?.[0]?.matchedTitle;
    const r = evalUpdate(before, after, reveal, primaryTitle);
    await recordEvidence(db, { subskill: "inference.updating", score: r.score, difficulty: diff, format: "numeric", source, latencyMs: latency(), sessionId: sid });
    if (r.verdict === "insufficient") await recordError(db, { type: "INSUFFICIENT_UPDATE", subskill: "inference.updating", source, detail: `Contradicting evidence; confidence moved ${Math.round(r.delta * 100)} points.`, sessionId: sid });
    if (r.verdict === "over") await recordError(db, { type: "OVER_UPDATE", subskill: "inference.updating", source, detail: `One clue moved confidence ${Math.round(r.delta * 100)} points.`, sessionId: sid });
    if (r.verdict === "wrong_direction") await recordError(db, { type: "CONFIRMATION_BIAS", subskill: "inference.updating", source, detail: `Moved against the evidence (${Math.round(before * 100)}% → ${Math.round(after * 100)}%).`, sessionId: sid });
    // Calibration: the final belief about the primary explanation, judged against what the evidence supports.
    if (primaryTitle && reveal && (reveal.supports?.length || reveal.undermines?.length)) {
      const correct = !!reveal.supports?.some((t) => t.toLowerCase() === primaryTitle.toLowerCase());
      await recordConfidence(db, { confidence: after, correct, domain: "inference", source, sessionId: sid, difficulty: diff });
    }
    setOutcomes((o) => ({ ...o, update: r }));
    await persistStage(stage, { after }, r as unknown as Record<string, unknown>, r.score);
  }

  async function onDecision(optionId: string) {
    const o = stage.decisionOptions!.find((d) => d.id === optionId)!;
    const r = { ...evalDecision(o, stage), text: o.text };
    await recordEvidence(db, { subskill: "inference.evidence_weighting", score: r.quality, difficulty: diff, format: "mcq", source, latencyMs: latency(), sessionId: sid });
    if (stage.insufficientEvidenceIsCorrect) await recordEvidence(db, { subskill: "composure.ambiguity", score: r.chosenInsufficient ? 1 : Math.min(0.4, r.quality), difficulty: diff, format: "mcq", source, sessionId: sid });
    if (r.errorType) await recordError(db, { type: r.errorType, subskill: "inference.evidence_weighting", source, detail: `Decided: "${o.text}"`, sessionId: sid });
    setOutcomes((prev) => ({ ...prev, decision: r }));
    await persistStage(stage, { optionId }, r as unknown as Record<string, unknown>, r.quality);
  }

  async function onExplain(text: string) {
    let r = evalExplain(text, kase, kase.stages.find((s) => s.kind === "hypotheses")?.rubric);
    let aiFeedback: string | undefined;
    if (aiStatus.configured) {
      const res = await ai.call("evaluateReasoning", { task: stage.explainPrompt ?? "Explain your reasoning.", groundTruth: kase.groundTruth, response: text, context: kase.summary });
      if (res.ok) {
        aiFeedback = `${res.data.feedback} ${res.data.oneThing}`;
        r = { ...r, score: Math.round(((r.score + res.data.score) / 2) * 1000) / 1000, feedback: res.data.feedback };
        for (const et of res.data.errorTypes.slice(0, 2)) {
          if (["PREMATURE_CLOSURE", "ASSUMPTION", "CAUSAL_ERROR", "BASE_RATE_NEGLECT", "CONFIRMATION_BIAS"].includes(et)) await recordError(db, { type: et as never, subskill: "inference.causal", source, detail: res.data.oneThing, sessionId: sid });
        }
      }
    }
    await recordEvidence(db, { subskill: "rhetoric.explanation", score: r.score, difficulty: diff, format: "free", source, latencyMs: latency(), sessionId: sid });
    await recordEvidence(db, { subskill: "inference.causal", score: r.score, difficulty: diff, format: "free", source, sessionId: sid });
    if (r.words > 220) await recordError(db, { type: "VERBOSITY", subskill: "rhetoric.concision", source, detail: `${r.words} words to explain the case.`, sessionId: sid });
    if (!r.mentionsAlternatives) await recordError(db, { type: "ALTERNATIVE_NEGLECT", subskill: "inference.alternatives", source, detail: "Explanation named no rejected alternative.", sessionId: sid });
    const evaluation = { ...r, aiFeedback };
    setOutcomes((o) => ({ ...o, explain: evaluation }));
    await persistStage(stage, { text }, evaluation as unknown as Record<string, unknown>, r.score);
  }

  async function onFinish() {
    if (!attempt) return;
    if (attempt.status === "completed") {
      if (onComplete) return onComplete();
      if (!(await finish())) router.push("/v1/desk");
      return;
    }
    const summary = composeSummary(kase, outcomes, { alternativesMean: baselineAlt });
    await db.store("case_attempts").update(attempt.id, { status: "completed", completedAt: new Date().toISOString(), summary, currentStageIndex: kase.stages.length - 1 });
    await writeAfterAction(db, { source, title: `Case ${kase.number} · ${kase.title}`, saw: summary.noticed, missed: summary.missed, assumed: summary.assumptions, didWell: summary.didWell, turningPoint: summary.turningPoint, oneThing: summary.oneThing, reasoningPath: summary.reasoningPath, score: summary.overallScore, sessionId: sid });
    // Transfer evidence: the case draws on Archive concepts the user has already read.
    if (kase.conceptLinks.length) {
      const progress = await db.store("archive_progress").list({ filter: (p) => kase.conceptLinks.includes(p.entryId) && p.status !== "unread" });
      if (progress.length) {
        await recordEvidence(db, { subskill: "synthesis.transfer", score: summary.overallScore, difficulty: Math.min(8, diff + 1) as never, format: "free", transfer: true, source, sessionId: sid, note: `Drew on ${progress.map((p) => p.entryId).join(", ")}` });
        for (const p of progress) await db.store("archive_progress").update(p.id, { timesUsed: p.timesUsed + 1 });
      }
    }
    const completed = await db.store("case_attempts").count({ status: "completed" } as never);
    await reachMilestone(db, "first_case");
    if (completed >= 10) await reachMilestone(db, "cases_10");
    await detectRedThreads(db);
    setAttempt({ ...attempt, status: "completed", summary });
    if (onComplete) return onComplete();
    if (!(await finish())) router.push(`/v1/after-action`);
  }

  /* ---------------- render ---------------- */

  const progress = stageIndex / (kase.stages.length - 1);

  return (
    <div className="page">
      <div className="flex items-center justify-between gap-4 mb-6">
        {sourceKind === "baseline" ? (
          <span className="text-[12px] text-ink-3">The first case</span>
        ) : (
          <Link href="/v1/casebook" className="text-[12px] text-ink-3 hover:text-ink inline-flex items-center gap-1.5">
            <I.ArrowLeft size={12} /> Casebook
          </Link>
        )}
        <div className="flex items-center gap-4 text-[11px] text-ink-3">
          {inSession ? <span className="mark"><span className="mark-dot" /> Today&apos;s session</span> : null}
          <span className="mono">CASE {kase.number}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-8">
        <div className="hidden md:block sticky top-8 self-start">
          <StageNav stages={kase.stages} current={stageIndex} viewing={reviewing} onSelect={setViewIndex} />
        </div>

        <div className="min-w-0">
          <div className="md:hidden mb-4">
            <div className="flex items-baseline justify-between text-[11px] text-ink-3 mb-2">
              <span>{STAGE_LABEL[stage.kind]}</span>
              <span className="numeral">
                {stageIndex + 1} / {kase.stages.length}
              </span>
            </div>
            <HairlineProgress value={progress} />
            {stageIndex > 0 ? (
              <div className="mt-3">
                <StageNav stages={kase.stages} current={stageIndex} viewing={reviewing} onSelect={setViewIndex} compact />
              </div>
            ) : null}
          </div>

          {reviewing !== null ? (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3 text-[12px] text-ink-3">
              <span>
                Looking back at <span className="text-ink">{STAGE_LABEL[shown.kind]}</span>. Nothing here can be changed.
              </span>
              <Button variant="secondary" size="sm" onClick={returnToCurrent}>
                Back to {STAGE_LABEL[stage.kind]} <I.ArrowRight size={12} />
              </Button>
            </div>
          ) : null}

          <div key={`${shown.id}:${reviewing === null ? "live" : "review"}`} className="anim-place">
            {shown.kind === "enter" ? <EnterStage kase={kase} stage={shown} onNext={reviewing === null ? advance : returnToCurrent} review={reviewing !== null} /> : null}
            {shown.kind === "notice" ? <NoticeStage stage={shown} onNext={advance} /> : null}
            {shown.kind === "recall" ? <RecallStage stage={shown} questions={sceneQuestions ?? shown.questions ?? []} result={outcomes.recall} onSubmit={onRecall} onNext={reviewing === null ? advance : returnToCurrent} /> : null}
            {shown.kind === "separate" ? <SeparateStage stage={shown} result={outcomes.separate} onSubmit={onSeparate} onNext={reviewing === null ? advance : returnToCurrent} /> : null}
            {shown.kind === "hypotheses" ? <HypothesesStage stage={shown} result={outcomes.hypotheses} onSubmit={onHypotheses} onNext={reviewing === null ? advance : returnToCurrent} /> : null}
            {shown.kind === "question" ? <QuestionStage stage={shown} result={outcomes.question} onSubmit={onQuestion} onNext={reviewing === null ? advance : returnToCurrent} /> : null}
            {shown.kind === "evidence" ? <EvidenceStage stage={shown} onNext={reviewing === null ? advance : returnToCurrent} /> : null}
            {shown.kind === "update" ? <UpdateStage stage={shown} before={outcomes.hypotheses?.confidenceBefore ?? 0.5} reveal={outcomes.reveal} result={outcomes.update} onSubmit={onUpdate} onNext={reviewing === null ? advance : returnToCurrent} /> : null}
            {shown.kind === "decision" ? <DecisionStage stage={shown} result={outcomes.decision} onSubmit={onDecision} onNext={reviewing === null ? advance : returnToCurrent} /> : null}
            {shown.kind === "explain" ? <ExplainStage stage={shown} result={outcomes.explain} onSubmit={onExplain} onNext={reviewing === null ? advance : returnToCurrent} /> : null}
            {shown.kind === "debrief" ? <DebriefStage kase={kase} stage={shown} outcomes={outcomes} baselineAlt={baselineAlt} completed={attempt.status === "completed"} onFinish={onFinish} inSession={inSession} /> : null}
          </div>

          {reviewing !== null ? (
            <div className="mt-8 border-t border-line pt-4">
              <Button variant="secondary" onClick={returnToCurrent}>
                Back to {STAGE_LABEL[stage.kind]} <I.ArrowRight size={14} />
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* Stages                                                              */
/* ================================================================== */

function StageHeader({ stage, children }: { stage: CaseStage; children?: React.ReactNode }) {
  return (
    <header className="mb-6">
      <div className="eyebrow eyebrow-wine">{STAGE_LABEL[stage.kind]}</div>
      <h2 className="display text-[28px] md:text-[32px] mt-1">{stage.title}</h2>
      {stage.narrative ? <p className="serif text-[18px] text-ink-2 mt-3 max-w-[60ch] leading-relaxed">{stage.narrative}</p> : null}
      {children}
    </header>
  );
}

function EnterStage({ kase, stage, onNext, review }: { kase: CaseDefinition; stage: CaseStage; onNext: () => void; review?: boolean }) {
  return (
    <div className="sheet-raised paper-texture case-edge p-6 md:p-10">
      <div className="flex items-baseline justify-between">
        <span className="mono text-[12px] text-ink-3">CASE {kase.number}</span>
        <span className="text-[11px] text-ink-3">{DIFFICULTY_LABEL[kase.difficulty]} · {minutes(kase.estimatedMinutes)}</span>
      </div>
      <h1 className="display text-[36px] md:text-[48px] mt-4 leading-[1.05]">{kase.title}</h1>
      <p className="eyebrow mt-4">{stage.setting ?? kase.setting}</p>
      <div className="prose-study mt-6 max-w-[62ch]">
        {(stage.narrative ?? kase.summary).split("\n").map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-1 text-[12px] text-ink-3">
        {kase.faculties.map((f) => (
          <span key={f}>{FACULTY_META[f].label}</span>
        ))}
      </div>
      {!review ? (
        <div className="mt-8">
          <Button size="lg" onClick={onNext}>
            Open the file <I.ArrowRight size={14} />
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/** Stages whose material is shown against a clock. Once they have passed, they stay closed. */
function isTimedStage(s: CaseStage | undefined): boolean {
  return !!s && (s.kind === "notice" || !!s.material?.seconds);
}

/**
 * The stage list. Completed, untimed stages open for reading; the timed stage
 * shows why it will not, and the stages ahead stay quiet.
 */
function StageNav({ stages, current, viewing, onSelect, compact }: { stages: CaseStage[]; current: number; viewing: number | null; onSelect: (i: number | null) => void; compact?: boolean }) {
  return (
    <ol className={cx(compact ? "flex gap-1 overflow-x-auto -mx-1 px-1 pb-1" : "space-y-1")} aria-label="Stages">
      {stages.map((s, i) => {
        const done = i < current;
        const timed = isTimedStage(s);
        const active = viewing === null ? i === current : i === viewing;
        const label = STAGE_LABEL[s.kind];
        const tone = active ? "text-ink" : done ? "text-ink-3" : "text-ink-4";
        const dot = <span className={cx("w-[5px] h-[5px] rounded-full shrink-0", active ? "bg-wine" : done ? "bg-ink-3" : "bg-line-2")} />;
        const base = cx("flex items-center gap-2 text-[12px] py-1 whitespace-nowrap", compact && "px-2 border border-line rounded-sm", tone);
        if (i === current || (done && !timed)) {
          return (
            <li key={s.id}>
              <button type="button" className={cx(base, "hover:text-ink text-left")} aria-current={active ? "step" : undefined} onClick={() => onSelect(i === current ? null : i)} title={i === current ? "Where you are" : `Look back at ${label}`}>
                {dot}
                {label}
              </button>
            </li>
          );
        }
        return (
          <li key={s.id} className={base} title={done && timed ? "Shown against a clock. It does not reopen." : undefined} aria-disabled="true">
            {dot}
            {label}
            {done && timed ? <span className="text-[10px] uppercase tracking-wide text-ink-4">closed</span> : null}
          </li>
        );
      })}
    </ol>
  );
}

function NoticeStage({ stage, onNext }: { stage: CaseStage; onNext: () => void }) {
  const material = stage.material!;
  const [running, setRunning] = useState(false);
  const [closed, setClosed] = useState(false);
  const left = useCountdown(material.seconds, running, () => setClosed(true));
  useEffect(() => {
    if (!closed) return;
    const t = setTimeout(onNext, 320);
    return () => clearTimeout(t);
  }, [closed, onNext]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && running && !closed) {
        e.preventDefault();
        setClosed(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, closed]);

  if (!running) {
    return (
      <div>
        <StageHeader stage={stage} />
        <div className="sheet p-6">
          <p className="text-[14px] text-ink-2">
            You will see the material for <span className="numeral text-ink">{material.seconds} seconds</span>. Then it disappears and you will be asked what was there. Look at everything; do not try to memorise, try to see.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <Button size="lg" onClick={() => setRunning(true)}>Show it</Button>
            <span className="text-[12px] text-ink-3">Press Space to close it early.</span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={cx(closed && "anim-close")}>
      <div className="flex items-center justify-between mb-3">
        <span className="eyebrow">Notice</span>
        <Countdown seconds={left} total={material.seconds} />
      </div>
      <Material material={material} />
    </div>
  );
}

function RecallStage({ stage, questions, result, onSubmit, onNext }: { stage: CaseStage; questions: RecallQuestion[]; result?: StageOutcomes["recall"]; onSubmit: (answers: Record<string, string>, questions: RecallQuestion[]) => Promise<void>; onNext: () => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const done = !!result;
  return (
    <div>
      <StageHeader stage={stage} />
      <p className="text-[13px] text-ink-3 mb-5">Answer only what you actually saw. &ldquo;I don&apos;t know&rdquo; is an acceptable answer and costs less than a guess.</p>
      <ol className="space-y-6">
        {questions.map((q, i) => {
          const r = result?.perQuestion.find((p) => p.id === q.id);
          return (
            <li key={q.id} className="border-t border-line pt-4">
              <div className="flex gap-3">
                <span className="mono text-[11px] text-ink-3 pt-1">{String(i + 1).padStart(2, "0")}</span>
                <div className="flex-1">
                  <p className="text-[15px] text-ink">{q.prompt}</p>
                  {q.kind === "mcq" ? (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options!.map((o, j) => (
                        <Choice key={o} index={j} label={o} selected={answers[q.id] === o} onClick={() => !done && setAnswers((a) => ({ ...a, [q.id]: o }))} disabled={done} correct={done && o === q.answer} wrong={done && r?.given === o && !r.correct} />
                      ))}
                    </div>
                  ) : (
                    <Field className="mt-3 max-w-md" value={answers[q.id] ?? r?.given ?? ""} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} disabled={done} placeholder={q.kind === "number" ? "A number, or I don't know" : "Short answer, or I don't know"} inputMode={q.kind === "number" ? "numeric" : undefined} aria-label={q.prompt} />
                  )}
                  {r ? (
                    <p className={cx("mt-2 text-[13px]", r.correct ? "text-ok" : "text-ink-2")}>
                      {r.correct ? "Correct." : r.unknown ? `Admitted not knowing. It was ${q.answer}.` : r.falseRecall ? `Not what was there. It was ${q.answer}.` : `It was ${q.answer}.`}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-8 flex items-center gap-4">
        {!done ? (
          <Button size="lg" disabled={busy} onClick={async () => { setBusy(true); await onSubmit(answers, questions); setBusy(false); }}>Submit</Button>
        ) : (
          <>
            <div className="text-[13px] text-ink-2">
              <span className="numeral text-ink">{result.correct}</span> of {result.total} recalled{result.falseRecalls ? <>, <span className="numeral text-wine">{result.falseRecalls}</span> invented</> : ", none invented"}.
            </div>
            <Button className="ml-auto" onClick={onNext}>Continue <I.ArrowRight size={14} /></Button>
          </>
        )}
      </div>
    </div>
  );
}

function SeparateStage({ stage, result, onSubmit, onNext }: { stage: CaseStage; result?: StageOutcomes["separate"]; onSubmit: (labels: Record<string, SeparateStatement["truth"] | undefined>, statements: SeparateStatement[]) => Promise<void>; onNext: () => void }) {
  const statements = stage.statements ?? [];
  const [labels, setLabels] = useState<Record<string, SeparateStatement["truth"] | undefined>>({});
  const [busy, setBusy] = useState(false);
  const done = !!result;
  const complete = statements.every((s) => labels[s.id]);
  const kinds: SeparateStatement["truth"][] = ["observation", "inference", "unknown"];
  return (
    <div>
      <StageHeader stage={stage} />
      <p className="text-[13px] text-ink-3 mb-5">An observation is something the material literally showed. An inference is a conclusion drawn from it. Unknown means the material does not settle it either way.</p>
      <ul className="space-y-3">
        {statements.map((s) => {
          const r = result?.per.find((p) => p.id === s.id);
          return (
            <li key={s.id} className="border-t border-line pt-3">
              <p className="serif text-[17px] text-ink">{s.text}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <div className="segmented" role="group" aria-label={`Classify: ${s.text}`}>
                  {kinds.map((k) => (
                    <button key={k} type="button" aria-pressed={(r?.given ?? labels[s.id]) === k} onClick={() => !done && setLabels((l) => ({ ...l, [s.id]: k }))} disabled={done}>
                      {k}
                    </button>
                  ))}
                </div>
                {r ? <span className={cx("text-[12px]", r.correct ? "text-ok" : "text-wine")}>{r.correct ? "Yes." : `${s.truth}.`} <span className="text-ink-3">{s.why}</span></span> : null}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-8 flex items-center gap-4">
        {!done ? (
          <Button size="lg" disabled={!complete || busy} onClick={async () => { setBusy(true); await onSubmit(labels, statements); setBusy(false); }}>Submit</Button>
        ) : (
          <>
            <span className="text-[13px] text-ink-2"><span className="numeral text-ink">{Math.round(result.accuracy * 100)}%</span> correctly separated{result.blurred ? `; ${result.blurred} inference${result.blurred > 1 ? "s" : ""} treated as observed` : ""}.</span>
            <Button className="ml-auto" onClick={onNext}>Continue <I.ArrowRight size={14} /></Button>
          </>
        )}
      </div>
    </div>
  );
}

function HypothesesStage({ stage, result, onSubmit, onNext }: { stage: CaseStage; result?: StageOutcomes["hypotheses"]; onSubmit: (h: { primary: string; alternative: string; unlikely: string }, confidence: number) => Promise<void>; onNext: () => void }) {
  const [h, setH] = useState({ primary: "", alternative: "", unlikely: "" });
  const [conf, setConf] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const done = !!result;
  const ready = h.primary.trim().length > 8 && h.alternative.trim().length > 8 && h.unlikely.trim().length > 8 && conf !== null;
  const r = result;
  return (
    <div>
      <StageHeader stage={stage} />
      <div className="space-y-5">
        <TextArea label="Primary hypothesis" serif value={done ? r!.matches[0].text : h.primary} onChange={(e) => setH({ ...h, primary: e.target.value })} disabled={done} placeholder="The explanation you find most likely, and what it rests on." />
        <TextArea label="Alternative hypothesis" serif value={done ? r!.matches[1].text : h.alternative} onChange={(e) => setH({ ...h, alternative: e.target.value })} disabled={done} placeholder="A different explanation that fits the same evidence." />
        <TextArea label="Unlikely but possible" serif value={done ? r!.matches[2].text : h.unlikely} onChange={(e) => setH({ ...h, unlikely: e.target.value })} disabled={done} placeholder="The one you would be embarrassed to have missed." />
        <ConfidenceDial value={done ? (r!.confidenceBefore ?? null) : conf} onChange={setConf} label="How sure are you of the primary hypothesis?" disabled={done} />
      </div>
      {r ? (
        <div className="mt-6 space-y-2">
          <Note tone={r.distinctPlausible >= 2 ? "forest" : "wine"}>
            {r.distinctPlausible >= 3 ? "Three genuinely different explanations. " : r.distinctPlausible === 2 ? "Two distinct plausible explanations; the third overlapped or missed. " : r.distinctPlausible === 1 ? "One plausible explanation, then variations on it. " : "None of these matched what a careful reader would consider plausible. "}
            {r.duplicates ? `${r.duplicates} of your hypotheses were near-duplicates. ` : ""}
            {(r as { aiFeedback?: string }).aiFeedback ?? ""}
          </Note>
          <div className="text-[13px] text-ink-3">
            An expert&apos;s list: {stage.rubric!.plausible.map((p) => p.title).join(" · ")}.
          </div>
        </div>
      ) : null}
      <div className="mt-8 flex items-center gap-4">
        {!done ? (
          <Button size="lg" disabled={!ready || busy} onClick={async () => { setBusy(true); await onSubmit(h, conf!); setBusy(false); }}>{busy ? "Reading…" : "Commit"}</Button>
        ) : (
          <Button className="ml-auto" onClick={onNext}>Continue <I.ArrowRight size={14} /></Button>
        )}
      </div>
    </div>
  );
}

function QuestionStage({ stage, result, onSubmit, onNext }: { stage: CaseStage; result?: StageOutcomes["question"]; onSubmit: (c: { optionId?: string; text?: string }) => Promise<void>; onNext: () => void }) {
  const [optionId, setOptionId] = useState<string | undefined>();
  const [free, setFree] = useState("");
  const [busy, setBusy] = useState(false);
  const done = !!result;
  const options = stage.questionOptions ?? [];
  return (
    <div>
      <StageHeader stage={stage} />
      <p className="serif text-[20px] text-ink mb-5">If you could ask exactly one question, what would you ask?</p>
      <div className="space-y-2">
        {options.map((o, i) => (
          <Choice key={o.id} index={i} label={o.text} selected={optionId === o.id} onClick={() => !done && (setOptionId(o.id), setFree(""))} disabled={done} correct={done && result.fromOption && result.text === o.text && o.informationValue >= 0.65} wrong={done && result.fromOption && result.text === o.text && o.informationValue < 0.45} detail={done ? `Information value ${Math.round(o.informationValue * 100)}%${o.leading ? " · leading" : ""} — ${o.feedback}` : undefined} />
        ))}
      </div>
      {stage.allowFreeQuestion !== false ? (
        <div className="mt-5">
          <TextArea label="Or ask your own" serif value={done && !result.fromOption ? result.text : free} onChange={(e) => { setFree(e.target.value); setOptionId(undefined); }} disabled={done} placeholder="One question. Make it earn its answer." onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && free.trim()) void onSubmit({ text: free }); }} />
        </div>
      ) : null}
      {done ? (
        <Note className="mt-5" tone={result.informationValue >= 0.6 ? "forest" : "wine"}>
          <span className="numeral text-ink">{Math.round(result.informationValue * 100)}%</span> information value · {result.type}{result.leading ? " · leading" : ""}. {result.feedback}
        </Note>
      ) : null}
      <div className="mt-8 flex items-center gap-4">
        {!done ? (
          <Button size="lg" disabled={(!optionId && free.trim().length < 6) || busy} onClick={async () => { setBusy(true); await onSubmit(optionId ? { optionId } : { text: free.trim() }); setBusy(false); }}>{busy ? "Weighing…" : "Ask"}</Button>
        ) : (
          <Button className="ml-auto" onClick={onNext}>Continue <I.ArrowRight size={14} /></Button>
        )}
      </div>
    </div>
  );
}

function EvidenceStage({ stage, onNext }: { stage: CaseStage; onNext: () => void }) {
  const r = stage.reveal!;
  return (
    <div>
      <StageHeader stage={stage} />
      <div className="sheet-raised paper-texture p-6 md:p-8 anim-place border-l-2 border-l-wine">
        <div className="eyebrow eyebrow-wine">New evidence</div>
        <h3 className="serif text-[24px] mt-2">{r.title}</h3>
        <p className="serif text-[18px] text-ink-2 mt-3 leading-relaxed">{r.text}</p>
      </div>
      <div className="mt-8">
        <Button onClick={onNext}>What changed? <I.ArrowRight size={14} /></Button>
      </div>
    </div>
  );
}

function UpdateStage({ stage, before, reveal, result, onSubmit, onNext }: { stage: CaseStage; before: number; reveal?: StageOutcomes["reveal"]; result?: StageOutcomes["update"]; onSubmit: (after: number) => Promise<void>; onNext: () => void }) {
  const [after, setAfter] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const done = !!result;
  return (
    <div>
      <StageHeader stage={stage} />
      <p className="serif text-[18px] text-ink-2 mb-6">{stage.updatePrompt ?? "Given the new evidence, how sure are you now of your primary hypothesis?"}</p>
      {reveal ? <Note className="mb-6">{reveal.title}: {reveal.text}</Note> : null}
      <div className="grid grid-cols-2 gap-8 mb-4">
        <div>
          <div className="eyebrow">Confidence before</div>
          <div className="numeral text-[32px] mt-1">{Math.round(before * 100)}%</div>
        </div>
        <div>
          <div className="eyebrow">Confidence after</div>
          <div className="numeral text-[32px] mt-1">{done ? `${Math.round(result.after * 100)}%` : after === null ? "—" : `${Math.round(after * 100)}%`}</div>
        </div>
      </div>
      <ConfidenceDial value={done ? result.after : after} onChange={setAfter} label="After" disabled={done} stops={[5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95]} />
      {done ? <Note className="mt-5" tone={result.verdict === "appropriate" ? "forest" : result.verdict === "neutral" ? "neutral" : "wine"}>{result.note}</Note> : null}
      <div className="mt-8 flex items-center gap-4">
        {!done ? (
          <Button size="lg" disabled={after === null || busy} onClick={async () => { setBusy(true); await onSubmit(after!); setBusy(false); }}>Record</Button>
        ) : (
          <Button className="ml-auto" onClick={onNext}>Continue <I.ArrowRight size={14} /></Button>
        )}
      </div>
    </div>
  );
}

function DecisionStage({ stage, result, onSubmit, onNext }: { stage: CaseStage; result?: StageOutcomes["decision"]; onSubmit: (id: string) => Promise<void>; onNext: () => void }) {
  const [id, setId] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const done = !!result;
  const options = stage.decisionOptions ?? [];
  const best = Math.max(...options.map((o) => o.quality));
  return (
    <div>
      <StageHeader stage={stage} />
      <div className="space-y-2">
        {options.map((o, i) => (
          <Choice key={o.id} index={i} label={o.text} selected={id === o.id} onClick={() => !done && setId(o.id)} disabled={done} correct={done && o.quality >= best - 0.001} wrong={done && result.text === o.text && o.quality < best - 0.2} detail={done ? o.feedback : undefined} />
        ))}
      </div>
      <div className="mt-8 flex items-center gap-4">
        {!done ? (
          <Button size="lg" disabled={!id || busy} onClick={async () => { setBusy(true); await onSubmit(id!); setBusy(false); }}>Decide</Button>
        ) : (
          <Button className="ml-auto" onClick={onNext}>Continue <I.ArrowRight size={14} /></Button>
        )}
      </div>
    </div>
  );
}

function ExplainStage({ stage, result, onSubmit, onNext }: { stage: CaseStage; result?: StageOutcomes["explain"]; onSubmit: (t: string) => Promise<void>; onNext: () => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const done = !!result;
  return (
    <div>
      <StageHeader stage={stage} />
      <TextArea label={stage.explainPrompt ?? "Explain your reasoning"} serif rows={8} value={text} onChange={(e) => setText(e.target.value)} disabled={done} placeholder="What you observed. What you inferred, and why. The alternative you rejected. What would change your mind." onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && text.trim().length > 20 && !done) { setBusy(true); void onSubmit(text).finally(() => setBusy(false)); } }} />
      {done ? (
        <Note className="mt-5" tone={result.score >= 0.65 ? "forest" : "neutral"}>
          {result.feedback} {(result as { aiFeedback?: string }).aiFeedback ? <span className="text-ink-3">{(result as { aiFeedback?: string }).aiFeedback}</span> : null}
        </Note>
      ) : null}
      <div className="mt-8 flex items-center gap-4">
        {!done ? (
          <Button size="lg" disabled={text.trim().length < 20 || busy} onClick={async () => { setBusy(true); await onSubmit(text); setBusy(false); }}>{busy ? "Reading…" : "Submit"}</Button>
        ) : (
          <Button className="ml-auto" onClick={onNext}>Debrief <I.ArrowRight size={14} /></Button>
        )}
      </div>
    </div>
  );
}

function DebriefStage({ kase, stage, outcomes, baselineAlt, completed, onFinish, inSession }: { kase: CaseDefinition; stage: CaseStage; outcomes: StageOutcomes; baselineAlt?: number; completed: boolean; onFinish: () => Promise<void>; inSession: boolean }) {
  const summary = useMemo(() => composeSummary(kase, outcomes, { alternativesMean: baselineAlt }), [kase, outcomes, baselineAlt]);
  const [busy, setBusy] = useState(false);
  return (
    <div>
      <StageHeader stage={stage} />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
        <div className="space-y-8">
          <DebriefList title="What you saw" items={summary.noticed} tone="ok" />
          <DebriefList title="What you missed" items={summary.missed} tone="wine" />
          <DebriefList title="What you assumed" items={summary.assumptions} />
          <DebriefList title="What you did well" items={summary.didWell} tone="ok" />
          {summary.turningPoint ? (
            <section>
              <div className="eyebrow mb-2">The turning point</div>
              <p className="serif text-[18px] text-ink">{summary.turningPoint}</p>
            </section>
          ) : null}
          <section className="border-l-2 border-brass pl-4">
            <div className="eyebrow eyebrow-brass mb-2">One thing to change next time</div>
            <p className="serif text-[20px] text-ink">{summary.oneThing}</p>
          </section>
          {stage.expertReasoning ? (
            <section className="border-t border-line pt-6">
              <div className="eyebrow mb-2">How an expert might reason</div>
              <p className="serif text-[17px] text-ink-2 leading-relaxed">{stage.expertReasoning}</p>
              {stage.keyInsight ? <p className="mt-3 text-[14px] text-ink">{stage.keyInsight}</p> : null}
              <p className="mt-3 text-[13px] text-ink-3">What actually happened: {kase.groundTruth}</p>
            </section>
          ) : null}
        </div>
        <aside>
          <div className="eyebrow mb-3">Your reasoning path</div>
          <ReasoningPath points={summary.reasoningPath} />
        </aside>
      </div>
      <div className="mt-10 flex items-center gap-3">
        <Button size="lg" disabled={busy} onClick={async () => { setBusy(true); await onFinish(); setBusy(false); }}>{completed ? (inSession ? "Back to the session" : "Close the file") : inSession ? "File it and continue" : "File it"}</Button>
        <span className="text-[12px] text-ink-3">Evidence is written to your Profile and the Red Thread.</span>
      </div>
    </div>
  );
}

function DebriefList({ title, items, tone }: { title: string; items: string[]; tone?: "ok" | "wine" }) {
  if (!items.length) return null;
  return (
    <section>
      <div className="eyebrow mb-2">{title}</div>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className={cx("text-[14px] pl-3 border-l", tone === "ok" ? "border-forest text-ink" : tone === "wine" ? "border-wine text-ink" : "border-line-2 text-ink-2")}>
            {it}
          </li>
        ))}
      </ul>
    </section>
  );
}
