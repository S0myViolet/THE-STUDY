"use client";

import React from "react";
import { SECTIONS } from "@/lib/nav";
import { AssemblingRoom } from "@/features/v2/assembling";

const S = SECTIONS.find((s) => s.id === "train")!;

/** Stub: replaced by the Train builder. Routes: `train/[[...slug]]`. */
export function TrainRoom({ slug }: { slug: string[] }) {
  return <AssemblingRoom eyebrow={S.eyebrow} title={S.title} lede={S.lede} slug={slug} base={S.href} archive={{ href: "/v1/inference", label: "V1 Inference" }} />;
}
