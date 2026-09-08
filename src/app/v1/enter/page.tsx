"use client";

import { StudyGate } from "@/components/shell/StudyGate";
import { Onboarding } from "@/features/onboarding";

export default function EnterPage() {
  return (
    <StudyGate requireOnboarding={false}>
      <Onboarding />
    </StudyGate>
  );
}
