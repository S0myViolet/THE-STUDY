"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useStudy } from "@/lib/persistence/provider";
import { ai, useAIStatus } from "@/lib/ai/client";
import { Button, Dialog, Segmented } from "@/components/ui/primitives";
import { stamp } from "@/lib/persistence/store";
import type { CaseDefinition, GeneratedContent } from "@/lib/domain/types";
import { SUBSKILL_IDS, FACULTIES, FACULTY_META, type FacultyId } from "@/lib/domain/faculties";
import { I } from "@/components/ui/icons";

/**
 * AI case generation. The case logic is generated and persisted BEFORE play begins
 * so evaluation cannot drift after the user has answered.
 */
export function GenerateCase({ existing }: { existing: CaseDefinition[] }) {
  const { db, profile } = useStudy();
  const status = useAIStatus();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<"3" | "4" | "5" | "6">("4");
  const [faculty, setFaculty] = useState<FacultyId>("inference");

  async function generate() {
    setBusy(true);
    setError(null);
    const res = await ai.call("generateCase", {
      difficulty: Number(difficulty),
      minutes: 25,
      faculties: ["observation", faculty, "calibration"],
      interests: profile.interests,
      avoidSettings: existing.slice(-6).map((c) => c.setting),
      subskillIds: SUBSKILL_IDS.join(", "),
    });
    if (!res.ok) {
      setError(res.reason === "unconfigured" ? "No model is configured. Add ANTHROPIC_API_KEY to enable generated cases." : res.message ?? "The model could not produce a valid case.");
      setBusy(false);
      return;
    }
    const kase = res.data as CaseDefinition;
    const valid = await ai.call("validateCase", { case: kase });
    if (valid.ok && !valid.data.valid) {
      setError(`The generated case failed validation: ${valid.data.problems.slice(0, 2).join("; ")}. Try again.`);
      setBusy(false);
      return;
    }
    const nextNumber = String(9000 + existing.filter((c) => c.origin === "generated").length + 1);
    const id = `case-gen-${Date.now().toString(36)}`;
    const finalCase: CaseDefinition = { ...kase, id, number: nextNumber, origin: "generated" };
    const gc = stamp<GeneratedContent>(db.userId, "gen", { kind: "case", refId: id, payload: finalCase, model: res.model });
    await db.store("generated_content").put(gc);
    setBusy(false);
    setOpen(false);
    router.push(`/v1/casebook/${id}`);
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <I.Sparkle size={14} /> New case
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Generate a case">
        {status.configured ? (
          <div className="space-y-5">
            <p className="text-[14px] text-ink-2">The model writes a complete case — evidence, rubric, question values, decision qualities — and the Study validates and stores it before you begin. The answer key never changes once you have started.</p>
            <div>
              <div className="eyebrow mb-2">Difficulty</div>
              <Segmented value={difficulty} onChange={setDifficulty} options={[{ value: "3", label: "Multi-step" }, { value: "4", label: "Ambiguous" }, { value: "5", label: "Complex" }, { value: "6", label: "Adversarial" }]} />
            </div>
            <div>
              <div className="eyebrow mb-2">Emphasis</div>
              <div className="flex flex-wrap gap-2">
                {FACULTIES.filter((f) => ["inference", "social", "strategy", "memory", "knowledge"].includes(f)).map((f) => (
                  <button key={f} className="choice !w-auto !py-1.5 !px-3 text-[13px]" aria-pressed={faculty === f} onClick={() => setFaculty(f)}>
                    {FACULTY_META[f].label}
                  </button>
                ))}
              </div>
            </div>
            {error ? <p className="text-[13px] text-wine">{error}</p> : null}
            <div className="flex gap-3">
              <Button onClick={generate} disabled={busy}>{busy ? "Writing the file…" : "Generate"}</Button>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="serif text-[18px]">Generated cases need a model.</p>
            <p className="text-[14px] text-ink-2">Add <span className="mono">ANTHROPIC_API_KEY</span> (and optionally <span className="mono">ANTHROPIC_MODEL</span>) to the server environment. The seeded Casebook works fully without it.</p>
            <Button variant="secondary" onClick={() => setOpen(false)}>Close</Button>
          </div>
        )}
      </Dialog>
    </>
  );
}
