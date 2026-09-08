"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { UserProfile } from "@/lib/domain/types";
import { StudyProvider, useStudyBoot } from "@/lib/persistence/provider";
import { applyAppearance, applyReducedMotion } from "@/lib/theme";
import { needsV2Onboarding } from "@/lib/v2/profile";
import { AuthScreen } from "@/features/onboarding/Auth";

/** The V2 entrance and the archived V1 entrance are always reachable, onboarded or not. */
export const ENTRANCE_PATHS = ["/enter", "/v1/enter"] as const;

export function isEntrancePath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return ENTRANCE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isV1Path(pathname: string | null | undefined): boolean {
  return pathname === "/v1" || (pathname?.startsWith("/v1/") ?? false);
}

/**
 * Whether the profile may enter `pathname`. V2 rooms need the V2 entrance
 * (`profile.v2.onboardingComplete`); the archived V1 rooms accept either
 * entrance, so a V1 demo profile or an older account still reaches `/v1/*`.
 */
export function onboardingSatisfied(profile: Pick<UserProfile, "v2" | "onboardingComplete">, pathname: string | null | undefined): boolean {
  if (!needsV2Onboarding(profile)) return true;
  return isV1Path(pathname) && profile.onboardingComplete === true;
}

/**
 * Boots persistence and gates the rooms behind onboarding.
 * Local mode never requires an account.
 */
export function StudyGate({ children, requireOnboarding = true }: { children: React.ReactNode; requireOnboarding?: boolean }) {
  const boot = useStudyBoot();
  const router = useRouter();
  const pathname = usePathname();
  const entrance = isEntrancePath(pathname);

  useEffect(() => {
    if (boot.status === "auth-required" && !entrance) router.replace("/enter?auth=1");
  }, [boot.status, router, entrance]);

  const gated = boot.status === "ready" && requireOnboarding && !entrance && !onboardingSatisfied(boot.value.profile, pathname);

  useEffect(() => {
    if (boot.status !== "ready") return;
    applyAppearance(boot.value.prefs.appearance);
    applyReducedMotion(boot.value.prefs.reducedMotion);
    if (gated) router.replace("/enter");
  }, [boot, gated, router]);

  if (boot.status === "auth-required" && entrance) {
    return <AuthScreen />;
  }
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
  if (gated) {
    return null;
  }
  return <StudyProvider value={boot.value}>{children}</StudyProvider>;
}
