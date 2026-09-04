"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { StudyProvider, useStudyBoot } from "@/lib/persistence/provider";
import { applyAppearance, applyReducedMotion } from "@/lib/theme";

/**
 * Boots persistence and gates the rooms behind onboarding.
 * Local mode never requires an account.
 */
export function StudyGate({ children, requireOnboarding = true }: { children: React.ReactNode; requireOnboarding?: boolean }) {
  const boot = useStudyBoot();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (boot.status === "auth-required") router.replace("/enter?auth=1");
  }, [boot.status, router]);

  useEffect(() => {
    if (boot.status !== "ready") return;
    applyAppearance(boot.value.prefs.appearance);
    applyReducedMotion(boot.value.prefs.reducedMotion);
    if (requireOnboarding && !boot.value.profile.onboardingComplete && pathname !== "/enter") {
      router.replace("/enter");
    }
  }, [boot, requireOnboarding, router, pathname]);

  if (boot.status === "loading" || boot.status === "auth-required") {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center anim-fade">
          <div className="eyebrow">The Study</div>
          <div className="mt-3 text-[13px] text-ink-3">Opening the door.</div>
        </div>
      </div>
    );
  }
  if (boot.status === "error") {
    return (
      <div className="min-h-dvh flex items-center justify-center p-8">
        <div className="max-w-md">
          <div className="eyebrow eyebrow-wine">Something is wrong with the door</div>
          <p className="mt-3 serif text-[20px]">{boot.message}</p>
          <p className="mt-2 text-[13px] text-ink-3">
            If cloud credentials are configured but unreachable, you can still enter locally from the entrance.
          </p>
          <a className="btn btn-secondary mt-5" href="/enter">
            Go to the entrance
          </a>
        </div>
      </div>
    );
  }
  if (requireOnboarding && !boot.value.profile.onboardingComplete && pathname !== "/enter") {
    return null;
  }
  return <StudyProvider value={boot.value}>{children}</StudyProvider>;
}
