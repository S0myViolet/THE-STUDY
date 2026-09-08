"use client";

import React from "react";
import Link from "next/link";

/**
 * Shown above every /v1 room so nobody mistakes the archive for the current Study.
 * V1 rooms keep working; their evidence never feeds V2 mastery.
 */
export function V1Banner() {
  return (
    <div className="h-8 flex items-center justify-center gap-3 text-[11px] tracking-[0.12em] uppercase bg-paper-3 text-ink-2 border-b border-line px-4">
      <span>V1 archive · evidence here does not change V2 mastery</span>
      <Link href="/today" className="underline underline-offset-4 hover:text-ink">
        Back to Today
      </Link>
    </div>
  );
}
