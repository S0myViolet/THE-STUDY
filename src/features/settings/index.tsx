"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStudy, useStudyQuery } from "@/lib/persistence/provider";
import type { StudyDatabase } from "@/lib/persistence/store";
import { DEFAULT_READING_PACE, updatePrefs, updateProfile } from "@/lib/services/profile";
import { rebuildEstimates } from "@/lib/services/evidence";
import { applyAppearance, applyReducedMotion } from "@/lib/theme";
import { COLLECTIONS } from "@/lib/persistence/collections";
import { supabaseConfig } from "@/lib/persistence/supabase";
import { signInWithPassword, signUpWithPassword, signInWithMagicLink } from "@/lib/persistence/auth";
import { ai, useAIStatus } from "@/lib/ai/client";
import type { Appearance, ChallengeStyle, CuratorDepth, Interest, PressureMode, SessionLength } from "@/lib/domain/types";
import { FACULTIES, FACULTY_META, type FacultyId } from "@/lib/domain/faculties";
import { V1_ROOMS } from "@/lib/nav";
import { DEVELOP_GOALS, INTEREST_IDS, PLAN_MODE_MINUTES, type DevelopGoal, type InterestId, type PlanMode } from "@/lib/v2/types";
import { LESSON_DEPTHS, type LessonDepth } from "@/lib/v2/content-types";
import { V1_DATA_COLLECTIONS, hasV1Data, importV1 } from "@/lib/v2/migrate-v1";
import { Button, Dialog, Field, PageHeader, Segmented } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { cx, longDate } from "@/lib/util/format";

const SECTIONS = [
  { id: "account", label: "Account" },
  { id: "appearance", label: "Appearance" },
  { id: "study", label: "Study" },
  { id: "curator", label: "Curator" },
  { id: "data", label: "Data" },
  { id: "privacy", label: "Privacy" },
  { id: "ai", label: "AI" },
  { id: "v1", label: "V1 archive" },
] as const;
const SECTION_IDS: readonly string[] = SECTIONS.map((s) => s.id);
const V1_INTERESTS: Interest[] = ["history", "economics", "psychology", "art", "science", "technology", "business", "geopolitics", "literature", "architecture", "food", "travel", "philosophy", "music", "other"];

const PLAN_MODES: { value: PlanMode; label: string }[] = [
  { value: "minimum", label: "Minimum" },
  { value: "standard", label: "Standard" },
  { value: "deep", label: "Deep" },
  { value: "custom", label: "Custom" },
];
const DEPTH_LABEL: Record<LessonDepth, string> = { intuition: "Intuition", standard: "Standard", deep: "Deep", technical: "Technical" };
const PACES = ["1", "2", "3"] as const;
const CUSTOM_MIN = 10;
const CUSTOM_MAX = 300;

/** A demonstration seed: the function to run and where its data is best seen afterwards. */
interface Demo {
  run: (db: StudyDatabase) => Promise<unknown>;
  landing: string;
  label: string;
}

export function SettingsRoom({ slug }: { slug: string[] }) {
  const { db, profile, prefs, mode, signOut } = useStudy();
  const router = useRouter();
  const [name, setName] = useState(profile.displayName);
  const [wipe, setWipe] = useState(false);
  const [wipeText, setWipeText] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [demo, setDemo] = useState<Demo | null>(null);
  /** The minutes field while it is being edited; null shows the saved preference. */
  const [customDraft, setCustomDraft] = useState<string | null>(null);
  const [imported, setImported] = useState<number | null>(null);
  const aiStatus = useAIStatus();
  const [aiTest, setAiTest] = useState<string | null>(null);
  const counts = useStudyQuery(async (db) => Promise.all(COLLECTIONS.map(async (c) => [c, await db.store(c).count()] as const)), [...COLLECTIONS]);
  const v1Present = useStudyQuery((db) => hasV1Data(db), V1_DATA_COLLECTIONS);
  const cloud = supabaseConfig();
  const [auth, setAuth] = useState({ email: "", password: "", msg: "" });

  useEffect(() => {
    // The V1 seed ships with the archive; it writes thirty days of V1 rooms, so it lands on the V1 Desk.
    import("@/lib/demo/seed")
      .then((m) => setDemo({ run: m.seedDemo, landing: "/v1/desk", label: "Load the V1 demonstration profile" }))
      .catch(() => setDemo(null));
  }, []);

  useEffect(() => {
    const target = slug[0] && SECTION_IDS.includes(slug[0]) ? slug[0] : typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
    if (target) document.getElementById(target)?.scrollIntoView({ block: "start" });
  }, [slug]);

  const set = (patch: Parameters<typeof updatePrefs>[1]) => updatePrefs(db, patch);
  const v2 = profile.v2;
  const planMode: PlanMode = prefs.planMode ?? "standard";
  const plannedMinutes = planMode === "custom" ? (prefs.customMinutes ?? v2?.dailyMinutes ?? PLAN_MODE_MINUTES.standard) : PLAN_MODE_MINUTES[planMode];
  const pace = String(Math.min(3, Math.max(1, Math.round(prefs.readingPace ?? DEFAULT_READING_PACE)))) as (typeof PACES)[number];
  const customMinutes = customDraft ?? String(prefs.customMinutes ?? PLAN_MODE_MINUTES.standard);

  function commitCustomMinutes() {
    const n = Math.round(Number(customDraft));
    setCustomDraft(null);
    if (customDraft === null || !Number.isFinite(n)) return;
    const clamped = Math.min(CUSTOM_MAX, Math.max(CUSTOM_MIN, n));
    if (clamped !== prefs.customMinutes) void set({ customMinutes: clamped });
  }

  function toggleGoal(goal: DevelopGoal) {
    if (!v2) return;
    const has = v2.goals.includes(goal);
    if (has && v2.goals.length === 1) return;
    void updateProfile(db, { v2: { ...v2, goals: has ? v2.goals.filter((g) => g !== goal) : [...v2.goals, goal] } });
  }

  function toggleInterest(interest: InterestId) {
    if (!v2) return;
    const has = v2.interests.includes(interest);
    void updateProfile(db, { v2: { ...v2, interests: has ? v2.interests.filter((i) => i !== interest) : [...v2.interests, interest] } });
  }

  async function exportAll() {
    setBusy("export");
    const data = await db.exportAll();
    const blob = new Blob([JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), data }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `the-study-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    setBusy(null);
  }

  async function importFile(file: File) {
    setBusy("import");
    try {
      const json = JSON.parse(await file.text());
      await db.importAll(json.data ?? json);
      await rebuildEstimates(db);
    } finally {
      setBusy(null);
    }
  }

  async function loadDemo() {
    if (!demo) return;
    setBusy("demo");
    try {
      await demo.run(db);
    } finally {
      setBusy(null);
    }
    router.push(demo.landing);
  }

  async function importArchive() {
    setBusy("import-v1");
    try {
      const r = await importV1(db, profile);
      setImported(r.retrievalItems);
    } finally {
      setBusy(null);
    }
  }

  async function doWipe() {
    setBusy("wipe");
    await db.wipe();
    for (const k of Object.keys(localStorage)) if (k.startsWith("the-study:")) localStorage.removeItem(k);
    // A full load, not a client navigation: the wiped database must not survive in memory.
    window.location.href = new URL("/enter", window.location.origin).toString();
  }

  return (
    <div className="page">
      <PageHeader eyebrow="Settings" title="The Study, arranged" />
      <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-10">
        <nav className="md:sticky md:top-8 self-start" aria-label="Sections">
          <ul className="flex md:flex-col gap-1 overflow-x-auto">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="nav-item whitespace-nowrap">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-14 max-w-[640px]">
          <Section id="account" title="Account">
            <p className="text-[14px] text-ink-2">{mode === "local" ? "You are in the local Study. Data lives in this browser, in IndexedDB. Export it to keep it; connect a cloud database to sync it." : "You are signed in. Data is stored in your cloud database under your account only."}</p>
            <div className="flex gap-3 items-end">
              <Field label="What the Study calls you" value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
              <Button variant="secondary" onClick={() => updateProfile(db, { displayName: name.trim() })}>
                Save
              </Button>
            </div>
            {cloud ? (
              mode === "cloud" ? (
                <Button variant="secondary" onClick={signOut}>
                  Sign out
                </Button>
              ) : (
                <div className="sheet p-4 space-y-3">
                  <div className="eyebrow">Cloud account</div>
                  <Field label="Email" type="email" value={auth.email} onChange={(e) => setAuth({ ...auth, email: e.target.value })} />
                  <Field label="Password" type="password" value={auth.password} onChange={(e) => setAuth({ ...auth, password: e.target.value })} />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={async () => {
                        const r = await signInWithPassword(auth.email, auth.password);
                        setAuth({ ...auth, msg: r.ok ? "Signed in. Reloading." : (r.error ?? "") });
                        if (r.ok) {
                          localStorage.removeItem("the-study:force-local");
                          window.location.reload();
                        }
                      }}
                    >
                      Sign in
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async () => {
                        const r = await signUpWithPassword(auth.email, auth.password);
                        setAuth({ ...auth, msg: r.ok ? "Account created. Check your email if confirmation is required." : (r.error ?? "") });
                      }}
                    >
                      Create account
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        const r = await signInWithMagicLink(auth.email);
                        setAuth({ ...auth, msg: r.ok ? "Magic link sent." : (r.error ?? "") });
                      }}
                    >
                      Magic link
                    </Button>
                  </div>
                  {auth.msg ? <p className="text-[12px] text-ink-3">{auth.msg}</p> : null}
                </div>
              )
            ) : (
              <p className="text-[12px] text-ink-4">No cloud database is configured. See docs/CLOUD.md to add Supabase credentials; the local Study works fully without one.</p>
            )}
          </Section>

          <Section id="appearance" title="Appearance">
            <Row label="Theme">
              <Segmented
                value={prefs.appearance}
                onChange={(v: Appearance) => {
                  applyAppearance(v);
                  void set({ appearance: v });
                }}
                options={[
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                  { value: "system", label: "System" },
                ]}
              />
            </Row>
            <Toggle
              label="Reduced motion"
              checked={prefs.reducedMotion}
              onChange={(v) => {
                applyReducedMotion(v);
                void set({ reducedMotion: v });
              }}
            />
            <Toggle label="Interface sound" hint="Reserved for optional interface sound. Silent by default; nothing is audible yet." checked={prefs.soundEnabled} onChange={(v) => set({ soundEnabled: v })} />
          </Section>

          <Section id="study" title="Study">
            <Row label="Daily plan">
              <Segmented value={planMode} onChange={(v: PlanMode) => set({ planMode: v })} options={PLAN_MODES} label="Daily plan" />
            </Row>
            {planMode === "custom" ? (
              <div className="flex items-end gap-3">
                <Field label="Minutes a day" type="number" inputMode="numeric" min={CUSTOM_MIN} max={CUSTOM_MAX} step={5} value={customMinutes} onChange={(e) => setCustomDraft(e.target.value)} onBlur={commitCustomMinutes} onKeyDown={(e) => e.key === "Enter" && commitCustomMinutes()} className="w-40" hint={`Between ${CUSTOM_MIN} and ${CUSTOM_MAX}.`} />
              </div>
            ) : null}
            <p className="text-[12px] text-ink-3">
              Today is planned for {plannedMinutes} minutes. Minimum is {PLAN_MODE_MINUTES.minimum}, standard {PLAN_MODE_MINUTES.standard}, deep {PLAN_MODE_MINUTES.deep}; the plan itself is generated from your learning state each day.
            </p>
            <Row label="Lesson depth">
              <Segmented value={prefs.lessonDepth ?? "standard"} onChange={(v: LessonDepth) => set({ lessonDepth: v })} options={LESSON_DEPTHS.map((d) => ({ value: d, label: DEPTH_LABEL[d] }))} label="Lesson depth" />
            </Row>
            <Row label="Reading pace">
              <Segmented value={pace} onChange={(v: (typeof PACES)[number]) => set({ readingPace: Number(v) })} options={PACES.map((p) => ({ value: p, label: `${p}×` }))} label="Reading pace" />
            </Row>
            <p className="text-[12px] text-ink-3">Every timed exposure to material (memory study in exams, the timed stages of transfer cases) is multiplied by the reading pace. Two is the default.</p>
            <Toggle label="Think First" hint="The Curator asks for your attempt before reasoning for you." checked={prefs.thinkFirst} onChange={(v) => set({ thinkFirst: v })} />
            <div>
              <div className="eyebrow mb-2">Develop</div>
              {v2 ? (
                <div className="flex flex-wrap gap-2">
                  {DEVELOP_GOALS.map((g) => (
                    <Chip key={g.id} on={v2.goals.includes(g.id)} onClick={() => toggleGoal(g.id)} title={g.note}>
                      {g.label}
                    </Chip>
                  ))}
                </div>
              ) : (
                <EntranceNote />
              )}
              {v2 ? <p className="mt-2 text-[12px] text-ink-3">At least one. Goals weight which domains the plan advances first; they never change what counts as evidence.</p> : null}
            </div>
            <div>
              <div className="eyebrow mb-2">Interests</div>
              {v2 ? (
                <div className="flex flex-wrap gap-2">
                  {INTEREST_IDS.map((i) => (
                    <Chip key={i} on={v2.interests.includes(i)} onClick={() => toggleInterest(i)}>
                      {i === "ai" ? "AI" : i}
                    </Chip>
                  ))}
                </div>
              ) : null}
            </div>
            {v2 ? (
              <p className="text-[12px] text-ink-3">
                In the Study since {longDate(v2.startedAt)}.{" "}
                {v2.baselineAttemptId ? "The baseline is on record." : "No baseline yet."}{" "}
                <Link href="/enter?again=1" className="underline underline-offset-4 hover:text-ink">
                  Return to the entrance
                </Link>
              </p>
            ) : null}

            <Sub title="V1 rooms">
              <p className="text-[12px] text-ink-3">These settings only affect the archived rooms under /v1.</p>
              <Row label="Default session length">
                <Segmented
                  value={prefs.sessionLength}
                  onChange={(v: SessionLength) => set({ sessionLength: v })}
                  options={[
                    { value: "quick", label: "Quick" },
                    { value: "standard", label: "Standard" },
                    { value: "deep", label: "Deep" },
                    { value: "immersion", label: "Immersion" },
                    { value: "variable", label: "Variable" },
                  ]}
                />
              </Row>
              <div>
                <div className="eyebrow mb-2">Preferred faculties</div>
                <div className="flex flex-wrap gap-2">
                  {FACULTIES.map((f) => (
                    <Chip key={f} on={prefs.preferredFaculties.includes(f)} onClick={() => set({ preferredFaculties: prefs.preferredFaculties.includes(f) ? prefs.preferredFaculties.filter((x) => x !== f) : [...prefs.preferredFaculties, f as FacultyId] })}>
                      {FACULTY_META[f].label}
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <div className="eyebrow mb-2">V1 interests</div>
                <div className="flex flex-wrap gap-2">
                  {V1_INTERESTS.map((i) => (
                    <Chip key={i} on={profile.interests.includes(i)} onClick={() => updateProfile(db, { interests: profile.interests.includes(i) ? profile.interests.filter((x) => x !== i) : [...profile.interests, i] })}>
                      {i}
                    </Chip>
                  ))}
                </div>
              </div>
              <Row label="Pressure mode default">
                <Segmented
                  value={prefs.pressureDefault}
                  onChange={(v: PressureMode) => set({ pressureDefault: v })}
                  options={[
                    { value: "none", label: "No timer" },
                    { value: "standard", label: "Standard" },
                    { value: "pressure", label: "Pressure" },
                  ]}
                />
              </Row>
              <Toggle label="Fieldwork" checked={prefs.fieldworkEnabled} onChange={(v) => set({ fieldworkEnabled: v })} />
              <Toggle label="Curiosities" checked={prefs.curiositiesEnabled} onChange={(v) => set({ curiositiesEnabled: v })} />
              <Toggle label="News intelligence" hint="Activates when a search integration is configured. Reasoning about current events, not headlines." checked={prefs.newsEnabled} onChange={(v) => set({ newsEnabled: v })} />
            </Sub>
          </Section>

          <Section id="curator" title="Curator">
            <Row label="Depth">
              <Segmented
                value={prefs.curatorDepth}
                onChange={(v: CuratorDepth) => set({ curatorDepth: v })}
                options={[
                  { value: "concise", label: "Concise" },
                  { value: "standard", label: "Standard" },
                  { value: "deep", label: "Deep" },
                ]}
              />
            </Row>
            <Row label="Challenge style">
              <Segmented
                value={prefs.challengeStyle}
                onChange={(v: ChallengeStyle) => set({ challengeStyle: v })}
                options={[
                  { value: "supportive", label: "Supportive" },
                  { value: "neutral", label: "Neutral" },
                  { value: "demanding", label: "Demanding" },
                ]}
              />
            </Row>
            <p className="text-[12px] text-ink-4">Default is demanding, but fair.</p>
          </Section>

          <Section id="data" title="Data">
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={exportAll} disabled={busy === "export"}>
                Export everything
              </Button>
              <label className="btn btn-secondary cursor-pointer">
                Import JSON
                <input type="file" accept="application/json" className="sr-only" onChange={(e) => e.target.files?.[0] && importFile(e.target.files[0])} />
              </label>
              <Button variant="secondary" disabled={!demo || busy === "demo"} onClick={loadDemo}>
                {demo ? demo.label : "Demonstration profile is being prepared"}
              </Button>
              <Button variant="ghost" className="text-wine" onClick={() => setWipe(true)}>
                Wipe this Study
              </Button>
            </div>
            <p className="text-[12px] text-ink-3">The demonstration profile replaces your data with thirty days of fictional usage, clearly labelled. Export first if you want to keep what is here. Your name, goals and preferences stay.</p>
            <table className="table">
              <thead>
                <tr>
                  <th>Collection</th>
                  <th className="text-right">Rows</th>
                </tr>
              </thead>
              <tbody>
                {(counts.data ?? [])
                  .filter(([, n]) => n > 0)
                  .map(([c, n]) => (
                    <tr key={c}>
                      <td className="mono text-[12px]">{c}</td>
                      <td className="numeral text-right">{n}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </Section>

          <Section id="privacy" title="Privacy">
            <div className="prose-study text-[16px] space-y-3">
              <p>The Study may hold your thoughts, decisions, social reflections, writing, forecasts and weaknesses. It treats all of it as private. In local mode nothing leaves this browser. In cloud mode every row is owned by your account and protected by row-level security; no other user&apos;s content is ever used for your prompts.</p>
              <p>Audio from speaking practice is never stored unless a transcription service is explicitly configured; it lives in memory for the length of the exercise.</p>
              <p>Fieldwork never asks you to photograph, follow or record anyone. People-memory exercises use fictional characters; if you keep notes about a real acquaintance, keep to ordinary details they volunteered. No dossiers on strangers.</p>
              <p>The Salon uses fictional scenarios unless you deliberately bring your own situation to the Curator.</p>
            </div>
          </Section>

          <Section id="ai" title="AI">
            <p className="text-[14px] text-ink-2">{aiStatus.loading ? "Checking." : aiStatus.configured ? `A model is connected: ${aiStatus.model}. Requests are made server-side; the key never reaches the browser.` : "No model is connected. Everything seeded works without one, and every model-assisted path falls back to a deterministic one."}</p>
            <div className="text-[13px] text-ink-2 space-y-1">
              <p>
                <span className="mono">ANTHROPIC_API_KEY</span> — server-side only.
              </p>
              <p>
                <span className="mono">ANTHROPIC_MODEL</span> — the model to use; <span className="mono">ANTHROPIC_FAST_MODEL</span> for low-effort classification. Both default on the server.
              </p>
              <p>Activates: generated lessons and practice items, model-marked writing, explanations and speaking, the Curator&apos;s full range. In the archive: generated cases, live Salon characters, free moves at the Strategy Table.</p>
              <p>Exams never use a model while you are answering.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  setAiTest("…");
                  const r = await ai.call("classifyQuestion", { question: "Is it raining?" });
                  setAiTest(r.ok ? `Connected. The model classified a test question as "${r.data.type}".` : r.reason === "unconfigured" ? "Unconfigured: no key on the server." : `Error: ${r.message ?? r.reason}`);
                }}
              >
                Test connection
              </Button>
              {aiTest ? <span className="text-[12px] text-ink-3">{aiTest}</span> : null}
            </div>
          </Section>

          <Section id="v1" title="V1 archive">
            <p className="text-[14px] text-ink-2">The first Study — cases, observation, the Salon, the Strategy Table, the Red Thread — is kept whole under /v1. Its rooms still work and still keep their own records, which Review shows only as history. Nothing done there changes V2 mastery.</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1" aria-label="V1 rooms">
              {V1_ROOMS.map((r) => {
                const Icon = I[r.icon];
                return (
                  <li key={r.id}>
                    <Link href={r.href} className="group flex items-start gap-3 py-2.5 px-2 -mx-2 rounded-sm hover:bg-paper-3">
                      <Icon size={15} className="mt-1 shrink-0 text-ink-3 group-hover:text-ink" />
                      <span className="min-w-0">
                        <span className="block text-[14px] text-ink">{r.label}</span>
                        <span className="block text-[12px] text-ink-3 leading-snug">{r.description}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="space-y-2">
              <div className="eyebrow">Carry over</div>
              {v1Present.data ? (
                <>
                  <p className="text-[13px] text-ink-2">V1 memory items (facts, concepts and archive prompts) can join V2 retrieval, keeping their schedule. Skill estimates and red threads stay where they are: V2 mastery is built only on V2 evidence.</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="secondary" size="sm" disabled={busy === "import-v1"} onClick={importArchive}>
                      Bring V1 memory items into Memory
                    </Button>
                    {imported !== null ? <span className="text-[12px] text-ink-3">{imported === 0 ? "Nothing new to import; everything is already in Memory." : `${imported} retrieval ${imported === 1 ? "item" : "items"} imported.`}</span> : v2?.v1ImportedAt ? <span className="text-[12px] text-ink-3">Last imported {longDate(v2.v1ImportedAt)}. Running again adds only new items.</span> : null}
                  </div>
                </>
              ) : (
                <p className="text-[13px] text-ink-3">{v1Present.loading ? "Checking for V1 records." : "No V1 records in this Study."}</p>
              )}
            </div>
          </Section>
        </div>
      </div>
      <Dialog open={wipe} onClose={() => setWipe(false)} title="Wipe this Study">
        <p className="text-[14px] text-ink-2">Every concept, attempt, note, project, forecast and estimate in this Study — V2 and the V1 archive — will be deleted. This cannot be undone. Type WIPE to confirm.</p>
        <Field className="mt-4" value={wipeText} onChange={(e) => setWipeText(e.target.value)} aria-label="Type WIPE to confirm" />
        <div className="mt-4 flex gap-3">
          <Button variant="wine" disabled={wipeText !== "WIPE" || busy === "wipe"} onClick={doWipe}>
            Wipe
          </Button>
          <Button variant="ghost" onClick={() => setWipe(false)}>
            Keep it
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

function EntranceNote() {
  return (
    <p className="text-[13px] text-ink-3">
      Goals and interests are set at the entrance.{" "}
      <Link href="/enter" className="underline underline-offset-4 hover:text-ink">
        Go to the entrance
      </Link>
    </p>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-8">
      <h2 className="display text-[26px] mb-4 border-b border-line pb-2">{title}</h2>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pt-4 border-t border-line space-y-5">
      <h3 className="eyebrow">{title}</h3>
      {children}
    </div>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-[14px]">{label}</span>
      {children}
    </div>
  );
}
function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start justify-between gap-4 cursor-pointer">
      <span>
        <span className="text-[14px] block">{label}</span>
        {hint ? <span className="text-[12px] text-ink-3 block">{hint}</span> : null}
      </span>
      <span className={cx("relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors", checked ? "bg-ink border-ink" : "bg-paper-3 border-line-2")}>
        <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className={cx("inline-block h-3.5 w-3.5 rounded-full transition-transform", checked ? "translate-x-[18px] bg-paper" : "translate-x-[3px] bg-ink-3")} />
      </span>
    </label>
  );
}
function Chip({ on, onClick, title, children }: { on: boolean; onClick: () => void; title?: string; children: React.ReactNode }) {
  return (
    <button type="button" className="choice !w-auto !py-1.5 !px-3 text-[13px] capitalize" aria-pressed={on} onClick={onClick} title={title}>
      {children}
    </button>
  );
}
