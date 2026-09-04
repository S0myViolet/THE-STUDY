"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStudy } from "@/lib/persistence/provider";
import { updateProfile } from "@/lib/services/profile";
import { Button } from "@/components/ui/primitives";

/** Temporary entrance; the full onboarding sequence replaces this file. */
export function Onboarding() {
  const { db, profile } = useStudy();
  const router = useRouter();
  const params = useSearchParams();
  useEffect(() => {
    if (params.get("skip") === "1") {
      updateProfile(db, { onboardingComplete: true, displayName: params.get("name") ?? profile.displayName }).then(() => router.replace("/desk"));
    }
  }, [params, db, router, profile.displayName]);
  return (
    <div className="min-h-dvh flex items-center justify-center p-8">
      <div className="text-center">
        <div className="eyebrow">The Study</div>
        <p className="display text-[40px] mt-4">Notice more.<br />Understand more.<br />Think further.</p>
        <Button size="lg" className="mt-8" onClick={() => updateProfile(db, { onboardingComplete: true }).then(() => router.replace("/desk"))}>Enter</Button>
      </div>
    </div>
  );
}
