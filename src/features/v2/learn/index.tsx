"use client";

import React from "react";
import { SECTIONS } from "@/lib/nav";
import { AssemblingRoom } from "@/features/v2/assembling";

const S = SECTIONS.find((s) => s.id === "learn")!;

/** Stub: replaced by the Learn builder. Routes: `learn/[[...slug]]`. */
export function LearnRoom({ slug }: { slug: string[] }) {
  return <AssemblingRoom eyebrow={S.eyebrow} title={S.title} lede={S.lede} slug={slug} base={S.href} archive={{ href: "/v1/archive", label: "The V1 Archive" }} />;
}
