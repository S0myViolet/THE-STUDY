"use client";

import React from "react";
import Link from "next/link";
import { cx } from "@/lib/util/format";

export function ProfileNav({ current }: { current: "map" | "evidence" | "methodology" }) {
  const item = (key: typeof current, href: string, label: string) => (
    <Link href={href} aria-current={current === key ? "page" : undefined} className={cx("eyebrow py-1 border-b-2 transition-colors", current === key ? "text-ink border-ink" : "border-transparent hover:text-ink")}>
      {label}
    </Link>
  );
  return (
    <nav aria-label="Profile sections" className="flex items-center gap-6 mb-8 border-b border-line">
      {item("map", "/v1/profile", "Capability map")}
      {item("evidence", "/v1/profile/evidence", "Evidence")}
      {item("methodology", "/v1/profile/methodology", "Methodology")}
    </nav>
  );
}
