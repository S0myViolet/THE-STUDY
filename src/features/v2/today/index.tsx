"use client";

import React from "react";
import { SECTIONS } from "@/lib/nav";
import { AssemblingRoom } from "@/features/v2/assembling";

const S = SECTIONS.find((s) => s.id === "today")!;

/** Stub: replaced by the Today builder. `/today`. */
export function TodayRoom() {
  return <AssemblingRoom eyebrow={S.eyebrow} title={S.title} lede={S.lede} base={S.href} archive={{ href: "/v1/desk", label: "The V1 Desk" }} />;
}
