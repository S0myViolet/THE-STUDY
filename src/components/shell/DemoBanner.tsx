"use client";

import React from "react";
import Link from "next/link";
import { useStudy } from "@/lib/persistence/provider";

/** Demo profiles are always labelled. Never show demo data as if it belonged to a real user. */
export function DemoBanner() {
  const { profile, mode } = useStudy();
  if (!profile.isDemo) return null;
  return (
    <div className="h-8 flex items-center justify-center gap-3 text-[11px] tracking-[0.12em] uppercase bg-brass-soft text-ink-2 border-b border-line px-4">
      <span>Demonstration profile · {mode === "local" ? "local" : "cloud"} data</span>
      <Link href="/settings#data" className="underline underline-offset-4 hover:text-ink">
        Replace with your own
      </Link>
    </div>
  );
}
