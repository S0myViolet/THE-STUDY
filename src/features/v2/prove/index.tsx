"use client";

import React from "react";
import { SECTIONS } from "@/lib/nav";
import { AssemblingRoom } from "@/features/v2/assembling";

const S = SECTIONS.find((s) => s.id === "prove")!;

/** Stub: replaced by the Prove builder. Routes: `prove/[[...slug]]`. */
export function ProveRoom({ slug }: { slug: string[] }) {
  return <AssemblingRoom eyebrow={S.eyebrow} title={S.title} lede={S.lede} slug={slug} base={S.href} archive={{ href: "/v1/casebook", label: "The V1 Casebook" }} />;
}
