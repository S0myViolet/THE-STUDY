"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useStudy } from "@/lib/persistence/provider";
import { completeV2Onboarding, needsV2Onboarding } from "@/lib/v2/profile";
import { PLAN_MODE_MINUTES } from "@/lib/v2/types";
import { Button, Field } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";

/**
 * Stub for the V2 entrance (`/enter`); replaced by the onboarding builder.
 *
 * What works now: `?skip=1&name=X` completes a profile without the baseline
 * (goals ["complete"], no interests, sixty minutes a day) and goes to Today; the
 * form below does the same with a name the person types. The full entrance
 * (goals, interests, education, time, baseline, initial map, first thirty days)
 * is being assembled.
 */

const SKIP_MINUTES = 60;

export function OnboardingV2() {
  const { db, profile } = useStudy();
  const router = useRouter();
  const params = useSearchParams();
  const skip = params.get("skip") === "1";
  const again = params.get("again") === "1";
  const [name, setName] = useState(profile.displayName && profile.displayName !== "You" ? profile.displayName : "");
  const [busy, setBusy] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!skip || started.current) return;
    started.current = true;
    completeV2Onboarding(db, profile, { displayName: params.get("name") ?? undefined, goals: ["complete"], interests: [], dailyMinutes: SKIP_MINUTES, baselineSkipped: true }).then(() => router.replace("/today"));
  }, [skip, params, db, profile, router]);

  useEffect(() => {
    if (!skip && !again && !needsV2Onboarding(profile)) router.replace("/today");
  }, [skip, again, profile, router]);

  if (skip) return null;

  async function enter() {
    if (busy) return;
    setBusy(true);
    try {
      await completeV2Onboarding(db, profile, { displayName: name.trim() || undefined, goals: ["complete"], interests: [], dailyMinutes: PLAN_MODE_MINUTES.standard, baselineSkipped: true });
      router.replace("/today");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[520px] anim-place">
        <div className="eyebrow">The Study</div>
        <h1 className="display text-[40px] md:text-[52px] leading-[1.04] mt-4 text-ink">
          Learn it. Keep it.
          <br />
          Prove it.
        </h1>
        <p className="serif text-[18px] text-ink-2 mt-6 max-w-[44ch]">
          A private place to build real knowledge and real ability, measured on evidence rather than on time spent.
        </p>
        <form
          className="mt-10 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            void enter();
          }}
        >
          <Field label="What the Study should call you" placeholder="A first name is enough" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" size="lg" disabled={busy}>
              Enter the Study <I.ArrowRight size={14} />
            </Button>
            <span className="text-[12px] text-ink-3">Complete programme, {PLAN_MODE_MINUTES.standard} minutes a day. Adjustable in Settings.</span>
          </div>
        </form>
        <div className="mt-12 border-t border-line pt-5 space-y-2 text-[13px] text-ink-3">
          <p>The full entrance (goals, interests, education, time, the baseline and your first thirty days) is being assembled. This door opens the Study with the complete programme; nothing here fabricates a baseline.</p>
          <p>
            The V1 entrance and its rooms remain in the archive:{" "}
            <Link href="/v1/enter" className="underline underline-offset-4 hover:text-ink">
              /v1/enter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
