"use client";

import { StudyGate } from "@/components/shell/StudyGate";
import { OnboardingV2 } from "@/features/v2/onboarding";

export default function EnterPage() {
  return (
    <StudyGate requireOnboarding={false}>
      <OnboardingV2 />
    </StudyGate>
  );
}
