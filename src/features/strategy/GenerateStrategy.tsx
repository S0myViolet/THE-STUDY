"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useStudy } from "@/lib/persistence/provider";
import { ai, useAIStatus } from "@/lib/ai/client";
import { Button, Dialog, Field, Segmented } from "@/components/ui/primitives";
import { stamp } from "@/lib/persistence/store";
import type { GeneratedContent, StrategyScenario } from "@/lib/domain/types";
import { I } from "@/components/ui/icons";

const TYPE_HINT = `StrategyScenario { id; title; mode: "three_moves"|"counterparty"|"incentive_map"|"option_value"|"red_team"|"premortem"|"second_order"|"negotiation"|"story"; setting; summary; actors: { name; goals: string[]; constraints: string[]; leverage: string[]; fears: string[]; alternatives: string[] }[]; rootNodeId; nodes: { id; situation; moves: { id; text; quality: 0..1; consequence; counterpartyReply?; nextNodeId?; errorType?: "STRATEGIC_SHORTSIGHTEDNESS"|"PREMATURE_CLOSURE"|"ASSUMPTION"|"OVERCONFIDENCE"|"CONFIRMATION_BIAS"; reveals? }[]; terminal?: boolean; debrief?: string }[]; difficulty: 1-8; subskills: ("strategy.second_order"|"strategy.incentives"|"strategy.planning"|"strategy.optionality"|"strategy.adversarial"|"strategy.negotiation")[]; estimatedMinutes; conceptLinks: string[]; origin: "generated" }`;

export function GenerateStrategy() {
  const { db } = useStudy();
  const status = useAIStatus();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState("");
  const [mode, setMode] = useState<StrategyScenario["mode"]>("story");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setError(null);
    const res = await ai.call("generateStrategyScenario", { typeHint: TYPE_HINT, mode, theme: theme || "a small organisation facing a decision with incomplete information", difficulty: 4 });
    if (!res.ok) { setError(res.reason === "unconfigured" ? "No model is configured." : res.message ?? "The model could not produce a scenario."); setBusy(false); return; }
    const s = res.data as StrategyScenario;
    const ids = new Set((s.nodes ?? []).map((n) => n.id));
    const valid = s?.nodes?.length >= 3 && ids.has(s.rootNodeId) && s.nodes.every((n) => n.moves.every((m) => !m.nextNodeId || ids.has(m.nextNodeId)));
    if (!valid) { setError("The generated tree was not fully connected. Try again."); setBusy(false); return; }
    const id = `st-gen-${Date.now().toString(36)}`;
    const final: StrategyScenario = { ...s, id, origin: "generated", mode, difficulty: (s.difficulty ?? 4) as StrategyScenario["difficulty"], estimatedMinutes: s.estimatedMinutes ?? 10, conceptLinks: s.conceptLinks ?? [], subskills: s.subskills?.length ? s.subskills : ["strategy.second_order"] };
    await db.store("generated_content").put(stamp<GeneratedContent>(db.userId, "gen", { kind: "strategy", refId: id, payload: final, model: res.model }));
    setBusy(false);
    setOpen(false);
    router.push(`/v1/strategy/${id}`);
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}><I.Sparkle size={14} /> New scenario</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Set a new table">
        {status.configured ? (
          <div className="space-y-4">
            <Segmented value={mode} onChange={setMode} label="Mode" options={[{ value: "story", label: "Story" }, { value: "negotiation", label: "Negotiation" }, { value: "option_value", label: "Option value" }, { value: "second_order", label: "Second order" }]} />
            <Field label="Theme (optional)" value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="a museum deciding whether to sell a painting" />
            {error ? <p className="text-[13px] text-wine">{error}</p> : null}
            <div className="flex gap-3"><Button onClick={generate} disabled={busy}>{busy ? "Building the tree…" : "Generate"}</Button><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button></div>
          </div>
        ) : (
          <div className="space-y-4"><p className="serif text-[18px]">New scenarios need a model.</p><p className="text-[14px] text-ink-2">The ten seeded scenarios work fully without one.</p><Button variant="secondary" onClick={() => setOpen(false)}>Close</Button></div>
        )}
      </Dialog>
    </>
  );
}
