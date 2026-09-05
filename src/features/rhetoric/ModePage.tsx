"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStudy } from "@/lib/persistence/provider";
import { stamp } from "@/lib/persistence/store";
import type { GeneratedContent, RhetoricMode, RhetoricPrompt } from "@/lib/domain/types";
import { DIFFICULTY_LABEL, SUBSKILL_IDS, subskillLabel, type SubskillId } from "@/lib/domain/faculties";
import { ai, useAIStatus } from "@/lib/ai/client";
import { Button, PageHeader } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { MODE_META, constraintLine, defaultConstraints } from "@/lib/rhetoric/modes";
import { buildTemplatePrompt } from "@/lib/rhetoric/templates";
import { ScoreMark, TopBar, useEntries } from "./shared";
import { cx, plural, shortDate } from "@/lib/util/format";

export function ModePage({ mode, prompts }: { mode: RhetoricMode; prompts: RhetoricPrompt[] }) {
  const meta = MODE_META[mode];
  const { entries } = useEntries();
  const mine = useMemo(() => entries.filter((e) => e.mode === mode), [entries, mode]);
  const byPrompt = useMemo(() => {
    const m = new Map<string, { attempts: number; best: number; last: string }>();
    for (const e of mine) {
      const cur = m.get(e.promptId) ?? { attempts: 0, best: 0, last: e.createdAt };
      cur.attempts++;
      cur.best = Math.max(cur.best, e.feedback?.score ?? 0);
      m.set(e.promptId, cur);
    }
    return m;
  }, [mine]);
  const mean = mine.length ? mine.reduce((s, e) => s + (e.feedback?.score ?? 0), 0) / mine.length : null;
  const meanWords = mine.length ? Math.round(mine.reduce((s, e) => s + e.wordCount, 0) / mine.length) : null;

  return (
    <div className="page">
      <TopBar href="/rhetoric" label="Rhetoric" />
      <PageHeader eyebrow={`${meta.title} · ${plural(prompts.length, "prompt")}`} title={meta.title} lede={meta.blurb} aside={<GeneratePrompt mode={mode} existing={prompts.length} />} />
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_240px] gap-x-10 gap-y-8">
        <ul className="divide-y divide-line border-t border-line">
          {prompts.map((p) => {
            const st = byPrompt.get(p.id);
            return (
              <li key={p.id}>
                <Link href={`/rhetoric/${mode}/${p.id}`} className="group flex items-start gap-6 py-4 -mx-3 px-3 rounded-sm hover:bg-paper-3">
                  <div className="flex-1 min-w-0">
                    <div className="serif text-[20px] text-ink group-hover:text-ink-2 leading-snug">{p.title}</div>
                    <p className="text-[13px] text-ink-2 mt-1 max-w-[64ch] line-clamp-2">{p.prompt}</p>
                    <p className="text-[11px] text-ink-4 mt-2">
                      {DIFFICULTY_LABEL[p.difficulty]}
                      {constraintLine(p) ? ` · ${constraintLine(p)}` : ""} · {p.subskills.map(subskillLabel).join(", ")}
                      {p.origin === "generated" ? " · generated" : ""}
                    </p>
                  </div>
                  <div className="text-right text-[12px] text-ink-3 shrink-0 pt-1">
                    {st ? (
                      <>
                        <ScoreMark score={st.best} ai={false} className="justify-end" />
                        <div className="text-[11px] text-ink-4 mt-0.5">
                          {plural(st.attempts, "attempt")} · {shortDate(st.last)}
                        </div>
                      </>
                    ) : (
                      <span className="text-ink-4">Not yet</span>
                    )}
                    <I.ArrowRight size={14} className="block ml-auto mt-2 text-ink-4 group-hover:text-ink" />
                  </div>
                </Link>
              </li>
            );
          })}
          {!prompts.length ? <li className="py-6 text-[13px] text-ink-3">No prompts in this mode yet. Generate one.</li> : null}
        </ul>
        <aside className="space-y-6">
          <div className="border-t border-line pt-3">
            <div className="eyebrow">The instruction</div>
            <p className="serif text-[17px] text-ink-2 mt-1 leading-snug">{meta.instruction}</p>
          </div>
          <div className="border-t border-line pt-3">
            <div className="eyebrow">Your record here</div>
            <div className="numeral text-[26px] mt-1 leading-none">{mine.length}</div>
            <div className="text-[12px] text-ink-3 mt-1.5">
              {mine.length ? `${plural(mine.length, "entry", "entries")} · mean ${Math.round((mean ?? 0) * 100)} · ${meanWords} words on average` : "No entries yet in this mode."}
            </div>
          </div>
          <p className="text-[11px] text-ink-4 border-t border-line pt-3">About {meta.minutes} minutes each. Scores are a deterministic read of structure, coverage and economy; a connected model adds a second opinion.</p>
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Generate a new prompt: model when configured, template bank otherwise */
/* ------------------------------------------------------------------ */

const VALID = new Set<string>(SUBSKILL_IDS);

function normalise(mode: RhetoricMode, raw: Partial<RhetoricPrompt>, fallback: RhetoricPrompt): RhetoricPrompt {
  const subskills = (raw.subskills ?? []).filter((s): s is SubskillId => VALID.has(s));
  const rubric = (raw.rubric ?? []).filter((r) => r && typeof r.criterion === "string" && typeof r.weight === "number");
  const weightSum = rubric.reduce((s, r) => s + r.weight, 0);
  const d = Math.round(Number(raw.difficulty ?? fallback.difficulty));
  return {
    id: fallback.id,
    mode,
    title: (raw.title ?? "").trim() || fallback.title,
    prompt: (raw.prompt ?? "").trim() || fallback.prompt,
    source: typeof raw.source === "string" && raw.source.trim() ? raw.source.trim() : mode === "precision" || mode === "steelman" ? fallback.source : undefined,
    constraints: { ...defaultConstraints(mode), ...(raw.constraints ?? {}) },
    rubric: rubric.length && weightSum > 0 ? rubric.map((r) => ({ criterion: r.criterion, weight: Math.round((r.weight / weightSum) * 100) / 100 })) : fallback.rubric,
    keyPoints: Array.isArray(raw.keyPoints) && raw.keyPoints.length ? raw.keyPoints.map((k) => String(k).toLowerCase()) : fallback.keyPoints,
    difficulty: (Number.isFinite(d) ? Math.max(1, Math.min(8, d)) : fallback.difficulty) as RhetoricPrompt["difficulty"],
    subskills: subskills.length ? subskills.slice(0, 3) : fallback.subskills,
    origin: "generated",
  };
}

export function GeneratePrompt({ mode, existing, size = "md" }: { mode: RhetoricMode; existing: number; size?: "sm" | "md" }) {
  const { db, profile } = useStudy();
  const status = useAIStatus();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setNote(null);
    const seed = Math.floor(Date.now() / 1000) + existing * 7919;
    const template = buildTemplatePrompt(mode, { seed, interests: profile.interests });
    let final = template;
    let model: string | undefined;
    if (status.configured) {
      const res = await ai.call("generateRhetoricPrompt", { mode, difficulty: 4, interests: profile.interests, subskillIds: SUBSKILL_IDS.filter((s) => s.startsWith("rhetoric.") || s.startsWith("knowledge.")).join(", ") });
      if (res.ok) {
        final = normalise(mode, res.data as Partial<RhetoricPrompt>, template);
        model = res.model;
      } else {
        setNote("The model did not answer; a template prompt was set instead.");
      }
    }
    await db.store("generated_content").put(stamp<GeneratedContent>(db.userId, "gen", { kind: "rhetoric", refId: final.id, payload: final, model }));
    setBusy(false);
    router.push(`/rhetoric/${mode}/${final.id}`);
  }

  return (
    <div className={cx("flex flex-col items-end gap-1", size === "sm" && "items-start")}>
      <Button variant="secondary" size={size === "sm" ? "sm" : "md"} onClick={generate} disabled={busy}>
        <I.Sparkle size={14} /> {busy ? "Composing…" : "New prompt"}
      </Button>
      {note ? <span className="text-[11px] text-ink-4">{note}</span> : null}
    </div>
  );
}
