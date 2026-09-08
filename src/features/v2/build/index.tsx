"use client";

import React from "react";
import { SECTIONS } from "@/lib/nav";
import { AssemblingRoom } from "@/features/v2/assembling";

const S = SECTIONS.find((s) => s.id === "build")!;

/** Stub: replaced by the Build builder. Routes: `build/[[...slug]]`. */
export function BuildRoom({ slug }: { slug: string[] }) {
  return <AssemblingRoom eyebrow={S.eyebrow} title={S.title} lede={S.lede} slug={slug} base={S.href} archive={{ href: "/v1/investigations", label: "V1 Investigations" }} />;
}
