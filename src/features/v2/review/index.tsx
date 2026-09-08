"use client";

import React from "react";
import { SECTIONS } from "@/lib/nav";
import { AssemblingRoom } from "@/features/v2/assembling";

const S = SECTIONS.find((s) => s.id === "review")!;

/** Stub: replaced by the Review builder. Routes: `review/[[...slug]]`. */
export function ReviewRoom({ slug }: { slug: string[] }) {
  return <AssemblingRoom eyebrow={S.eyebrow} title={S.title} lede={S.lede} slug={slug} base={S.href} archive={{ href: "/v1/profile", label: "The V1 Profile" }} />;
}
