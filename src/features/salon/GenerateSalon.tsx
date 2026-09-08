"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useStudy } from "@/lib/persistence/provider";
import { ai, useAIStatus } from "@/lib/ai/client";
import { Button, Dialog, Field } from "@/components/ui/primitives";
import { stamp } from "@/lib/persistence/store";
import type { GeneratedContent, SalonScenario } from "@/lib/domain/types";
import { I } from "@/components/ui/icons";

const TYPE_HINT = `SalonScenario { id: string; title: string; setting: string; character: { name; role; goal; knowledge: string[]; privateMotivations: string[]; style; constraints: string[]; misconceptions: string[] }; objectives: { id; text; requiresFacts?: string[] }[]; hiddenFacts: { id; fact; triggers: string[]; guarded?: boolean }[]; opening: string; script: { match: string[]; reply: string; reveals?: string[]; rapportDelta?: number }[]; fallbackReplies: string[]; difficulty: 1-8; subskills: ("social.perspective"|"social.question_quality"|"social.incentive_recognition"|"social.ambiguity"|"social.rapport"|"social.listening"|"inference.information_value")[]; estimatedMinutes: number; origin: "generated" }`;

export function GenerateSalon() {
  const { db } = useStudy();
  const status = useAIStatus();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setError(null);
    const res = await ai.call("generateSalonScenario", { typeHint: TYPE_HINT, theme: theme || "a person withholding part of a story for an understandable reason", difficulty: 4 });
    if (!res.ok) {
      setError(res.reason === "unconfigured" ? "No model is configured." : res.message ?? "The model could not produce a scenario.");
      setBusy(false);
      return;
    }
    const s = res.data as SalonScenario;
    if (!s?.character?.name || !Array.isArray(s.hiddenFacts) || !Array.isArray(s.script)) {
      setError("The generated scenario was malformed. Try again.");
      setBusy(false);
      return;
    }
    const id = `sal-gen-${Date.now().toString(36)}`;
    const final: SalonScenario = { ...s, id, origin: "generated", fallbackReplies: s.fallbackReplies?.length ? s.fallbackReplies : ["Let me think about how to put that.", "That's not quite how I'd frame it.", "Ask me something more specific."], difficulty: (s.difficulty ?? 4) as SalonScenario["difficulty"], estimatedMinutes: s.estimatedMinutes ?? 10, subskills: s.subskills?.length ? s.subskills : ["social.question_quality", "social.perspective"] };
    await db.store("generated_content").put(stamp<GeneratedContent>(db.userId, "gen", { kind: "salon", refId: id, payload: final, model: res.model }));
    setBusy(false);
    setOpen(false);
    router.push(`/v1/salon/${id}`);
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}><I.Sparkle size={14} /> New character</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Invite someone new">
        {status.configured ? (
          <div className="space-y-4">
            <p className="text-[14px] text-ink-2">The model writes a fictional character with private motivations and hidden facts, plus a scripted fallback. The scenario is stored before you begin.</p>
            <Field label="Theme (optional)" value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="a landlord who wants to sell but hasn't told the tenants" />
            {error ? <p className="text-[13px] text-wine">{error}</p> : null}
            <div className="flex gap-3"><Button onClick={generate} disabled={busy}>{busy ? "Writing…" : "Generate"}</Button><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button></div>
          </div>
        ) : (
          <div className="space-y-4"><p className="serif text-[18px]">New characters need a model.</p><p className="text-[14px] text-ink-2">Add <span className="mono">ANTHROPIC_API_KEY</span> on the server. The eight seeded characters work fully without it, and respond from a script.</p><Button variant="secondary" onClick={() => setOpen(false)}>Close</Button></div>
        )}
      </Dialog>
    </>
  );
}
