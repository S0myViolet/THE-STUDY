"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStudy, useStudyQuery } from "@/lib/persistence/provider";
import { updatePrefs, updateProfile } from "@/lib/services/profile";
import { isCloudConfigured } from "@/lib/persistence/auth";
import { seedDemo } from "@/lib/demo/seed";
import type { Goal, Interest, SessionLength } from "@/lib/domain/types";
import type { FacultyId } from "@/lib/domain/faculties";
import { FACULTY_META, LEVEL_LABEL } from "@/lib/domain/faculties";
import { facultyViews } from "@/lib/profile/derive";
import { Constellation } from "@/features/profile/Constellation";
import { CasePlayer } from "@/features/casebook/CasePlayer";
import { Button, Field, LevelMark } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { cx } from "@/lib/util/format";
import { BASELINE_CASE } from "./baseline-case";
import { Baseline } from "./Baseline";
import { AuthScreen } from "./Auth";

/* ------------------------------------------------------------------ */
/* State                                                                */
/* ------------------------------------------------------------------ */

const KEY = "the-study:onboarding";
const STEPS = ["enter", "goals", "interests", "length", "case", "baseline", "map"] as const;
type Step = (typeof STEPS)[number];

interface Draft {
  step: Step;
  name: string;
  goals: Goal[];
  interests: Interest[];
  length: SessionLength;
  baselineSkipped: boolean;
  caseSkipped: boolean;
}

const EMPTY: Draft = { step: "enter", name: "", goals: [], interests: [], length: "standard", baselineSkipped: false, caseSkipped: false };

function load(): Draft {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const d = JSON.parse(raw) as Partial<Draft>;
    return { ...EMPTY, ...d, step: STEPS.includes(d.step as Step) ? (d.step as Step) : "enter" };
  } catch {
    return EMPTY;
  }
}

function save(d: Draft) {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {}
}

const GOALS: { id: Goal; label: string; line: string; faculty?: FacultyId }[] = [
  { id: "seeing", label: "Notice more", line: "Detail, text, arrangement, what changed, what is missing.", faculty: "observation" },
  { id: "thinking", label: "Reason more carefully", line: "Alternatives, base rates, updating, knowing what you do not know.", faculty: "inference" },
  { id: "people", label: "Understand people better", line: "Questions that open things up; motives read from behaviour, not faces.", faculty: "social" },
  { id: "strategy", label: "Think further ahead", line: "Incentives, second-order effects, moves that keep options open.", faculty: "strategy" },
  { id: "memory", label: "Remember what matters", line: "Names, details, sequences, the books you read.", faculty: "memory" },
  { id: "knowledge", label: "Know how the world works", line: "History, money, places, ideas, and how they connect.", faculty: "knowledge" },
  { id: "expression", label: "Say it clearly", line: "One sentence, thirty seconds, an argument that holds.", faculty: "rhetoric" },
  { id: "everything", label: "All of it", line: "The full programme, balanced by what the evidence says you need." },
];

const INTERESTS: { id: Interest; label: string }[] = [
  { id: "history", label: "History" },
  { id: "economics", label: "Economics" },
  { id: "psychology", label: "Psychology" },
  { id: "art", label: "Art" },
  { id: "science", label: "Science" },
  { id: "technology", label: "Technology" },
  { id: "business", label: "Business" },
  { id: "geopolitics", label: "Geopolitics" },
  { id: "literature", label: "Literature" },
  { id: "architecture", label: "Architecture" },
  { id: "food", label: "Food" },
  { id: "travel", label: "Travel" },
  { id: "philosophy", label: "Philosophy" },
  { id: "music", label: "Music" },
];

const LENGTHS: { id: SessionLength; label: string; minutes: string; line: string }[] = [
  { id: "quick", label: "Quick", minutes: "10 min", line: "A glance, a question, what is due." },
  { id: "standard", label: "Standard", minutes: "20 min", line: "A case or two exercises, retention, one thing new." },
  { id: "deep", label: "Deep", minutes: "40 min", line: "A full case, a salon or strategy table, reading." },
  { id: "immersion", label: "Immersion", minutes: "60+ min", line: "Everything the day has, in sequence." },
  { id: "variable", label: "It depends", minutes: "varies", line: "The Desk asks each morning." },
];

/* ------------------------------------------------------------------ */
/* Entrance                                                             */
/* ------------------------------------------------------------------ */

export function Onboarding() {
  const { db, profile } = useStudy();
  const router = useRouter();
  const params = useSearchParams();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [auth, setAuth] = useState(false);
  const [busy, setBusy] = useState(false);

  // Restore where the person left off.
  useEffect(() => {
    const d = load();
    if (!d.name && profile.displayName && profile.displayName !== "You") d.name = profile.displayName;
    const step = params.get("step");
    if (params.get("again") === "1" && STEPS.includes(step as Step)) d.step = step as Step;
    setDraft(d);
    setHydrated(true);
    setAuth(params.get("auth") === "1");
  }, [params, profile.displayName]);

  // Test hook and a shortcut for returning users: /enter?skip=1&name=...
  useEffect(() => {
    if (params.get("skip") === "1") {
      updateProfile(db, { onboardingComplete: true, displayName: params.get("name") ?? profile.displayName }).then(() => router.replace("/v1/desk"));
    }
  }, [params, db, router, profile.displayName]);

  // Already through the door: back to the Desk.
  useEffect(() => {
    if (hydrated && profile.onboardingComplete && params.get("auth") !== "1" && params.get("again") !== "1") router.replace("/v1/desk");
  }, [hydrated, profile.onboardingComplete, params, router]);

  function go(step: Step, patch: Partial<Draft> = {}) {
    const next = { ...draft, ...patch, step };
    setDraft(next);
    save(next);
    window.scrollTo({ top: 0 });
  }

  async function finish() {
    if (busy) return;
    setBusy(true);
    const returning = params.get("again") === "1";
    const goals = draft.goals.length ? draft.goals : profile.goals;
    const preferred = Array.from(new Set(goals.flatMap((g) => GOALS.find((x) => x.id === g)?.faculty ?? [])));
    await updateProfile(db, {
      displayName: draft.name.trim() || profile.displayName || "You",
      goals,
      interests: draft.interests.length ? draft.interests : profile.interests,
      onboardingComplete: true,
      baselineComplete: profile.baselineComplete || !draft.baselineSkipped,
      enteredAt: profile.onboardingComplete ? profile.enteredAt : new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    if (!returning) await updatePrefs(db, { sessionLength: draft.length, preferredFaculties: preferred as FacultyId[] });
    try {
      localStorage.removeItem(KEY);
    } catch {}
    router.replace("/v1/desk");
  }

  async function demonstration() {
    if (busy) return;
    setBusy(true);
    await seedDemo(db);
    try {
      localStorage.removeItem(KEY);
    } catch {}
    router.replace("/v1/desk");
  }

  if (!hydrated || params.get("skip") === "1") return null;

  if (auth) {
    return (
      <Frame>
        <AuthScreen embedded onBack={() => { setAuth(false); router.replace("/v1/enter"); }} />
      </Frame>
    );
  }

  const index = STEPS.indexOf(draft.step);

  return (
    <Frame step={index} total={STEPS.length} wide={draft.step === "case" || draft.step === "baseline" || draft.step === "map"}>
      <div key={draft.step} className="anim-place">
        {draft.step === "enter" ? (
          <section className="text-center py-10 md:py-20">
            <div className="eyebrow">The Study</div>
            <h1 className="display text-[44px] md:text-[64px] leading-[1.02] mt-5 text-ink">
              Notice more.
              <br />
              Understand more.
              <br />
              Think further.
            </h1>
            <p className="serif text-[18px] md:text-[20px] text-ink-2 mt-8 max-w-[46ch] mx-auto">
              A private place to train the faculties that make a person perceptive: seeing, reasoning, remembering, asking, deciding, saying it well.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4">
              <Button size="lg" onClick={() => go("goals")}>
                Enter <I.ArrowRight size={14} />
              </Button>
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] text-ink-3">
                {isCloudConfigured() ? (
                  <button type="button" className="hover:text-ink" onClick={() => setAuth(true)}>
                    Sign in to sync across devices
                  </button>
                ) : null}
                <button type="button" className="hover:text-ink" onClick={demonstration} disabled={busy}>
                  {busy ? "Preparing the demonstration" : "Look at a thirty-day demonstration first"}
                </button>
              </div>
            </div>
            <p className="mt-16 text-[12px] text-ink-4">Everything stays on this device unless you choose otherwise.</p>
          </section>
        ) : null}

        {draft.step === "goals" ? (
          <section>
            <Heading eyebrow="First" title="What do you want to be better at?" lede="Choose as many as are true. The Study weights the programme toward them and lets the evidence adjust it." />
            <Field label="What should the Study call you?" placeholder="A first name is enough" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="max-w-xs mt-6" autoFocus />
            <ul className="mt-8 divide-y divide-line">
              {GOALS.map((g) => {
                const on = draft.goals.includes(g.id);
                return (
                  <li key={g.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      className="w-full text-left py-4 flex items-start gap-4 group"
                      onClick={() => setDraft({ ...draft, goals: on ? draft.goals.filter((x) => x !== g.id) : g.id === "everything" ? ["everything"] : [...draft.goals.filter((x) => x !== "everything"), g.id] })}
                    >
                      <span className={cx("mt-1.5 w-3 h-3 shrink-0 border transition-colors", on ? "bg-ink border-ink" : "border-line-2 group-hover:border-ink-3")} aria-hidden />
                      <span>
                        <span className={cx("block serif text-[20px] leading-tight", on ? "text-ink" : "text-ink-2 group-hover:text-ink")}>{g.label}</span>
                        <span className="block text-[13px] text-ink-3 mt-1">{g.line}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <Nav onBack={() => go("enter")} onNext={() => go("interests")} nextDisabled={draft.goals.length === 0} />
          </section>
        ) : null}

        {draft.step === "interests" ? (
          <section>
            <Heading eyebrow="Second" title="What are you curious about?" lede="Cases, Archive reading and curiosities lean toward these. Pick a few; you can change them in Settings." />
            <div className="mt-8 flex flex-wrap gap-2">
              {INTERESTS.map((it) => {
                const on = draft.interests.includes(it.id);
                return (
                  <button key={it.id} type="button" aria-pressed={on} className={cx("px-3 py-2 text-[14px] border transition-colors", on ? "bg-ink text-paper border-ink" : "border-line-2 text-ink-2 hover:border-ink-3 hover:text-ink")} onClick={() => setDraft({ ...draft, interests: on ? draft.interests.filter((x) => x !== it.id) : [...draft.interests, it.id] })}>
                    {it.label}
                  </button>
                );
              })}
            </div>
            <Nav onBack={() => go("goals")} onNext={() => go("length")} nextDisabled={draft.interests.length === 0} />
          </section>
        ) : null}

        {draft.step === "length" ? (
          <section>
            <Heading eyebrow="Third" title="How long is a session?" lede="A default, not a rule. The Desk builds each day to fit." />
            <ul className="mt-8 divide-y divide-line">
              {LENGTHS.map((l) => {
                const on = draft.length === l.id;
                return (
                  <li key={l.id}>
                    <button type="button" aria-pressed={on} className="w-full text-left py-4 flex items-baseline gap-4 group" onClick={() => setDraft({ ...draft, length: l.id })}>
                      <span className={cx("numeral text-[12px] w-16 shrink-0", on ? "text-ink" : "text-ink-3")}>{l.minutes}</span>
                      <span>
                        <span className={cx("block serif text-[20px] leading-tight", on ? "text-ink" : "text-ink-2 group-hover:text-ink")}>{l.label}</span>
                        <span className="block text-[13px] text-ink-3 mt-1">{l.line}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <Nav onBack={() => go("interests")} onNext={() => go("case")} nextLabel="Begin the first case" />
          </section>
        ) : null}

        {draft.step === "case" ? (
          <section>
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="eyebrow eyebrow-wine">Your first case</div>
              <button type="button" className="text-[12px] text-ink-3 hover:text-ink" onClick={() => go("baseline", { caseSkipped: true })}>
                Skip the case for now
              </button>
            </div>
            <CasePlayer kase={BASELINE_CASE} sourceKind="baseline" onComplete={() => go("baseline")} />
          </section>
        ) : null}

        {draft.step === "baseline" ? <Baseline onDone={() => go("map", { baselineSkipped: false })} onSkip={() => go("map", { baselineSkipped: true })} /> : null}

        {draft.step === "map" ? <FirstMap name={draft.name} skipped={draft.baselineSkipped && draft.caseSkipped} onEnter={finish} busy={busy} /> : null}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Screen 7: the first map                                              */
/* ------------------------------------------------------------------ */

function FirstMap({ name, skipped, onEnter, busy }: { name: string; skipped: boolean; onEnter: () => void; busy: boolean }) {
  const estimates = useStudyQuery((db) => db.store("skill_estimates").list(), ["skill_estimates"]);
  const views = useMemo(() => facultyViews(estimates.data ?? []), [estimates.data]);
  const [selected, setSelected] = useState<FacultyId | null>(null);
  const tested = views.filter((v) => v.evidenceCount > 0);
  const active = selected ? views.find((v) => v.id === selected) : undefined;
  const first = name.trim() ? name.trim().split(/\s+/)[0] : "";

  return (
    <section>
      <Heading eyebrow="The first map" title={first ? `${first}, this is where you start.` : "This is where you start."} lede="This is a starting estimate based on limited evidence. The Study will revise it as it learns how you think." />
      {skipped || tested.length === 0 ? (
        <div className="mt-8 sheet p-6 max-w-[62ch]">
          <p className="serif text-[19px] text-ink">Every faculty is untested. That is an honest map, not an empty one.</p>
          <p className="mt-2 text-[14px] text-ink-2">The first case and the baseline are waiting on the Desk whenever you want them. Everything you do from here becomes evidence.</p>
        </div>
      ) : (
        <div className="mt-6 md:grid md:grid-cols-[1fr_280px] md:gap-8 items-start">
          <Constellation views={views} selected={selected} onSelect={(id) => setSelected((s) => (s === id ? null : id))} />
          <div className="mt-6 md:mt-0">
            {active ? (
              <div className="sheet p-5 anim-fade">
                <div className="eyebrow">{active.label}</div>
                <p className="serif text-[18px] text-ink mt-1">{FACULTY_META[active.id].question}</p>
                <div className="mt-3 flex items-center gap-3 text-[13px] text-ink-2">
                  <LevelMark level={active.level} />
                  <span className="numeral">n = {active.evidenceCount}</span>
                </div>
                <p className="mt-2 text-[13px] text-ink-3">{active.evidenceCount === 0 ? "No evidence yet." : `Estimate confidence: ${active.confidenceLabel.toLowerCase()}.`}</p>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {views.map((v) => (
                  <li key={v.id} className="py-2.5 flex items-center justify-between gap-3">
                    <button type="button" className="text-[14px] text-ink-2 hover:text-ink text-left" onClick={() => setSelected(v.id)}>
                      {v.label}
                    </button>
                    <span className="flex items-center gap-3">
                      <span className="text-[12px] text-ink-3">{LEVEL_LABEL[v.level]}</span>
                      <span className="numeral text-[11px] text-ink-4 w-8 text-right">{v.evidenceCount ? `n=${v.evidenceCount}` : ""}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      <div className="mt-10 flex items-center justify-between">
        <span className="text-[12px] text-ink-4">Levels are words, not scores. Evidence counts are shown so you know how much to trust them.</span>
        <Button size="lg" onClick={onEnter} disabled={busy}>
          Enter the Study <I.ArrowRight size={14} />
        </Button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Chrome                                                               */
/* ------------------------------------------------------------------ */

function Frame({ children, step, total, wide }: { children: React.ReactNode; step?: number; total?: number; wide?: boolean }) {
  return (
    <div className="min-h-dvh paper-texture">
      <div className={cx("mx-auto px-5 md:px-8 py-6 md:py-10", wide ? "max-w-[980px]" : "max-w-[720px]")}>
        {step !== undefined && total !== undefined && step > 0 ? (
          <div className="flex items-center justify-between mb-8 text-[11px] text-ink-4">
            <span className="eyebrow">The Study</span>
            <span className="numeral">
              {step + 1} of {total}
            </span>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}

function Heading({ eyebrow, title, lede }: { eyebrow: string; title: string; lede?: string }) {
  return (
    <header>
      <div className="eyebrow eyebrow-wine">{eyebrow}</div>
      <h1 className="display text-[32px] md:text-[40px] mt-2 text-ink leading-tight">{title}</h1>
      {lede ? <p className="mt-3 text-[15px] text-ink-2 max-w-[60ch]">{lede}</p> : null}
    </header>
  );
}

function Nav({ onBack, onNext, nextDisabled, nextLabel = "Continue" }: { onBack: () => void; onNext: () => void; nextDisabled?: boolean; nextLabel?: string }) {
  return (
    <div className="mt-10 flex items-center justify-between">
      <button type="button" className="text-[13px] text-ink-3 hover:text-ink inline-flex items-center gap-1" onClick={onBack}>
        <I.ArrowLeft size={12} /> Back
      </button>
      <Button onClick={onNext} disabled={nextDisabled}>
        {nextLabel} <I.ArrowRight size={14} />
      </Button>
    </div>
  );
}
