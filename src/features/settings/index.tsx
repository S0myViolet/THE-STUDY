"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStudy, useStudyQuery } from "@/lib/persistence/provider";
import type { StudyDatabase } from "@/lib/persistence/store";
import { updatePrefs, updateProfile } from "@/lib/services/profile";
import { rebuildEstimates } from "@/lib/services/evidence";
import { applyAppearance, applyReducedMotion } from "@/lib/theme";
import { COLLECTIONS } from "@/lib/persistence/collections";
import { supabaseConfig } from "@/lib/persistence/supabase";
import { signInWithPassword, signUpWithPassword, signInWithMagicLink } from "@/lib/persistence/auth";
import { ai, useAIStatus } from "@/lib/ai/client";
import type { Appearance, ChallengeStyle, CuratorDepth, Interest, PressureMode, SessionLength } from "@/lib/domain/types";
import { FACULTIES, FACULTY_META, type FacultyId } from "@/lib/domain/faculties";
import { Button, Dialog, Field, PageHeader, Segmented } from "@/components/ui/primitives";
import { cx } from "@/lib/util/format";

const SECTIONS = ["account", "appearance", "study", "curator", "data", "privacy", "ai"] as const;
const INTERESTS: Interest[] = ["history", "economics", "psychology", "art", "science", "technology", "business", "geopolitics", "literature", "architecture", "food", "travel", "philosophy", "music", "other"];

export function SettingsRoom({ slug }: { slug: string[] }) {
  const { db, profile, prefs, mode, signOut } = useStudy();
  const router = useRouter();
  const [name, setName] = useState(profile.displayName);
  const [wipe, setWipe] = useState(false);
  const [wipeText, setWipeText] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [demoAvailable, setDemoAvailable] = useState<null | ((db: StudyDatabase) => Promise<unknown>)>(null);
  const aiStatus = useAIStatus();
  const [aiTest, setAiTest] = useState<string | null>(null);
  const counts = useStudyQuery(async (db) => Promise.all(COLLECTIONS.map(async (c) => [c, await db.store(c).count()] as const)), [...COLLECTIONS]);
  const cloud = supabaseConfig();
  const [auth, setAuth] = useState({ email: "", password: "", msg: "" });

  useEffect(() => {
    import("@/lib/demo/seed").then((m) => setDemoAvailable(() => m.seedDemo)).catch(() => setDemoAvailable(null));
  }, []);

  useEffect(() => {
    const target = slug[0] && (SECTIONS as readonly string[]).includes(slug[0]) ? slug[0] : typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
    if (target) document.getElementById(target)?.scrollIntoView({ block: "start" });
  }, [slug]);

  const set = (patch: Parameters<typeof updatePrefs>[1]) => updatePrefs(db, patch);

  async function exportAll() {
    setBusy("export");
    const data = await db.exportAll();
    const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), data }, null, 2)], { type: "application/json" });
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

  async function doWipe() {
    setBusy("wipe");
    await db.wipe();
    for (const k of Object.keys(localStorage)) if (k.startsWith("the-study:")) localStorage.removeItem(k);
    window.location.href = "/enter";
  }

  return (
    <div className="page">
      <PageHeader eyebrow="Settings" title="The Study, arranged" />
      <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-10">
        <nav className="md:sticky md:top-8 self-start" aria-label="Sections">
          <ul className="flex md:flex-col gap-1 overflow-x-auto">{SECTIONS.map((s) => <li key={s}><a href={`#${s}`} className="nav-item capitalize">{s}</a></li>)}</ul>
        </nav>
        <div className="space-y-14 max-w-[640px]">
          <Section id="account" title="Account">
            <p className="text-[14px] text-ink-2">{mode === "local" ? "You are in the local Study. Data lives in this browser, in IndexedDB. Export it to keep it; connect a cloud database to sync it." : "You are signed in. Data is stored in your cloud database under your account only."}</p>
            <div className="flex gap-3 items-end"><Field label="What the Study calls you" value={name} onChange={(e) => setName(e.target.value)} className="flex-1" /><Button variant="secondary" onClick={() => updateProfile(db, { displayName: name.trim() })}>Save</Button></div>
            {cloud ? (
              mode === "cloud" ? <Button variant="secondary" onClick={signOut}>Sign out</Button> : (
                <div className="sheet p-4 space-y-3">
                  <div className="eyebrow">Cloud account</div>
                  <Field label="Email" type="email" value={auth.email} onChange={(e) => setAuth({ ...auth, email: e.target.value })} />
                  <Field label="Password" type="password" value={auth.password} onChange={(e) => setAuth({ ...auth, password: e.target.value })} />
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={async () => { const r = await signInWithPassword(auth.email, auth.password); setAuth({ ...auth, msg: r.ok ? "Signed in. Reloading." : r.error ?? "" }); if (r.ok) { localStorage.removeItem("the-study:force-local"); window.location.reload(); } }}>Sign in</Button>
                    <Button size="sm" variant="secondary" onClick={async () => { const r = await signUpWithPassword(auth.email, auth.password); setAuth({ ...auth, msg: r.ok ? "Account created. Check your email if confirmation is required." : r.error ?? "" }); }}>Create account</Button>
                    <Button size="sm" variant="ghost" onClick={async () => { const r = await signInWithMagicLink(auth.email); setAuth({ ...auth, msg: r.ok ? "Magic link sent." : r.error ?? "" }); }}>Magic link</Button>
                  </div>
                  {auth.msg ? <p className="text-[12px] text-ink-3">{auth.msg}</p> : null}
                </div>
              )
            ) : <p className="text-[12px] text-ink-4">No cloud database is configured. See docs/CLOUD.md to add Supabase credentials; the local Study works fully without one.</p>}
          </Section>

          <Section id="appearance" title="Appearance">
            <Row label="Theme"><Segmented value={prefs.appearance} onChange={(v: Appearance) => { applyAppearance(v); void set({ appearance: v }); }} options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }, { value: "system", label: "System" }]} /></Row>
            <Toggle label="Reduced motion" checked={prefs.reducedMotion} onChange={(v) => { applyReducedMotion(v); void set({ reducedMotion: v }); }} />
            <Toggle label="Interface sound" hint="Reserved for optional interface sound. Silent by default; nothing is audible yet." checked={prefs.soundEnabled} onChange={(v) => set({ soundEnabled: v })} />
          </Section>

          <Section id="study" title="Study">
            <Row label="Default session length"><Segmented value={prefs.sessionLength} onChange={(v: SessionLength) => set({ sessionLength: v })} options={[{ value: "quick", label: "Quick" }, { value: "standard", label: "Standard" }, { value: "deep", label: "Deep" }, { value: "immersion", label: "Immersion" }, { value: "variable", label: "Variable" }]} /></Row>
            <div><div className="eyebrow mb-2">Preferred faculties</div><div className="flex flex-wrap gap-2">{FACULTIES.map((f) => <Chip key={f} on={prefs.preferredFaculties.includes(f)} onClick={() => set({ preferredFaculties: prefs.preferredFaculties.includes(f) ? prefs.preferredFaculties.filter((x) => x !== f) : [...prefs.preferredFaculties, f as FacultyId] })}>{FACULTY_META[f].label}</Chip>)}</div></div>
            <div><div className="eyebrow mb-2">Current interests</div><div className="flex flex-wrap gap-2">{INTERESTS.map((i) => <Chip key={i} on={profile.interests.includes(i)} onClick={() => updateProfile(db, { interests: profile.interests.includes(i) ? profile.interests.filter((x) => x !== i) : [...profile.interests, i] })}>{i}</Chip>)}</div></div>
            <Toggle label="Think First" hint="The Curator asks for your attempt before reasoning for you." checked={prefs.thinkFirst} onChange={(v) => set({ thinkFirst: v })} />
            <Row label="Pressure mode default"><Segmented value={prefs.pressureDefault} onChange={(v: PressureMode) => set({ pressureDefault: v })} options={[{ value: "none", label: "No timer" }, { value: "standard", label: "Standard" }, { value: "pressure", label: "Pressure" }]} /></Row>
            <Toggle label="Fieldwork" checked={prefs.fieldworkEnabled} onChange={(v) => set({ fieldworkEnabled: v })} />
            <Toggle label="Curiosities" checked={prefs.curiositiesEnabled} onChange={(v) => set({ curiositiesEnabled: v })} />
            <Toggle label="News intelligence" hint="Activates when a search integration is configured. Reasoning about current events, not headlines." checked={prefs.newsEnabled} onChange={(v) => set({ newsEnabled: v })} />
          </Section>

          <Section id="curator" title="Curator">
            <Row label="Depth"><Segmented value={prefs.curatorDepth} onChange={(v: CuratorDepth) => set({ curatorDepth: v })} options={[{ value: "concise", label: "Concise" }, { value: "standard", label: "Standard" }, { value: "deep", label: "Deep" }]} /></Row>
            <Row label="Challenge style"><Segmented value={prefs.challengeStyle} onChange={(v: ChallengeStyle) => set({ challengeStyle: v })} options={[{ value: "supportive", label: "Supportive" }, { value: "neutral", label: "Neutral" }, { value: "demanding", label: "Demanding" }]} /></Row>
            <p className="text-[12px] text-ink-4">Default is demanding, but fair.</p>
          </Section>

          <Section id="data" title="Data">
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={exportAll} disabled={busy === "export"}>Export everything</Button>
              <label className="btn btn-secondary cursor-pointer">Import JSON<input type="file" accept="application/json" className="sr-only" onChange={(e) => e.target.files?.[0] && importFile(e.target.files[0])} /></label>
              <Button variant="secondary" disabled={!demoAvailable || busy === "demo"} onClick={async () => { if (!demoAvailable) return; setBusy("demo"); await demoAvailable(db); setBusy(null); router.push("/desk"); }}>{demoAvailable ? "Load the demonstration profile" : "Demonstration profile is being prepared"}</Button>
              <Button variant="ghost" className="text-wine" onClick={() => setWipe(true)}>Wipe this Study</Button>
            </div>
            <p className="text-[12px] text-ink-3">The demonstration profile replaces your data with thirty days of fictional usage, clearly labelled. Export first if you want to keep what is here.</p>
            <table className="table">
              <thead><tr><th>Collection</th><th className="text-right">Rows</th></tr></thead>
              <tbody>{(counts.data ?? []).filter(([, n]) => n > 0).map(([c, n]) => <tr key={c}><td className="mono text-[12px]">{c}</td><td className="numeral text-right">{n}</td></tr>)}</tbody>
            </table>
          </Section>

          <Section id="privacy" title="Privacy">
            <div className="prose-study text-[16px] space-y-3">
              <p>The Study may hold your thoughts, decisions, social reflections, writing, forecasts and weaknesses. It treats all of it as private. In local mode nothing leaves this browser. In cloud mode every row is owned by your account and protected by row-level security; no other user&apos;s content is ever used for your prompts.</p>
              <p>Audio from voice practice is never stored unless a transcription service is explicitly configured; it lives in memory for the length of the exercise.</p>
              <p>Fieldwork never asks you to photograph, follow or record anyone. People-memory exercises use fictional characters; if you keep notes about a real acquaintance, keep to ordinary details they volunteered. No dossiers on strangers.</p>
              <p>The Salon uses fictional scenarios unless you deliberately bring your own situation to the Curator.</p>
            </div>
          </Section>

          <Section id="ai" title="AI">
            <p className="text-[14px] text-ink-2">{aiStatus.loading ? "Checking." : aiStatus.configured ? `A model is connected: ${aiStatus.model}. Requests are made server-side; the key never reaches the browser.` : "No model is connected. Everything seeded works without one."}</p>
            <div className="text-[13px] text-ink-2 space-y-1">
              <p><span className="mono">ANTHROPIC_API_KEY</span> — server-side only.</p>
              <p><span className="mono">ANTHROPIC_MODEL</span> — defaults to claude-fable-5-1; <span className="mono">ANTHROPIC_FAST_MODEL</span> for low-effort classification.</p>
              <p>Activates: generated cases, live Salon characters, free moves at the Strategy Table, deeper reasoning reviews, the Curator&apos;s full range, Archive entries from a question.</p>
            </div>
            <div className="flex items-center gap-3"><Button variant="secondary" size="sm" onClick={async () => { setAiTest("…"); const r = await ai.call("classifyQuestion", { question: "Is it raining?" }); setAiTest(r.ok ? `Connected. The model classified a test question as "${r.data.type}".` : r.reason === "unconfigured" ? "Unconfigured: no key on the server." : `Error: ${r.message ?? r.reason}`); }}>Test connection</Button>{aiTest ? <span className="text-[12px] text-ink-3">{aiTest}</span> : null}</div>
          </Section>
        </div>
      </div>
      <Dialog open={wipe} onClose={() => setWipe(false)} title="Wipe this Study">
        <p className="text-[14px] text-ink-2">Every case, note, forecast and estimate in this Study will be deleted. This cannot be undone. Type WIPE to confirm.</p>
        <Field className="mt-4" value={wipeText} onChange={(e) => setWipeText(e.target.value)} aria-label="Type WIPE to confirm" />
        <div className="mt-4 flex gap-3"><Button variant="wine" disabled={wipeText !== "WIPE" || busy === "wipe"} onClick={doWipe}>Wipe</Button><Button variant="ghost" onClick={() => setWipe(false)}>Keep it</Button></div>
      </Dialog>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return <section id={id} className="scroll-mt-8"><h2 className="display text-[26px] mb-4 border-b border-line pb-2">{title}</h2><div className="space-y-5">{children}</div></section>;
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center justify-between gap-3"><span className="text-[14px]">{label}</span>{children}</div>;
}
function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start justify-between gap-4 cursor-pointer">
      <span><span className="text-[14px] block">{label}</span>{hint ? <span className="text-[12px] text-ink-3 block">{hint}</span> : null}</span>
      <span className={cx("relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors", checked ? "bg-ink border-ink" : "bg-paper-3 border-line-2")}>
        <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className={cx("inline-block h-3.5 w-3.5 rounded-full transition-transform", checked ? "translate-x-[18px] bg-paper" : "translate-x-[3px] bg-ink-3")} />
      </span>
    </label>
  );
}
function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" className="choice !w-auto !py-1.5 !px-3 text-[13px] capitalize" aria-pressed={on} onClick={onClick}>{children}</button>;
}
