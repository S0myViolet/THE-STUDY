"use client";

import React from "react";
import { ROOMS } from "@/lib/nav";
import { AssemblingRoom } from "@/features/v2/assembling";

const R = ROOMS.find((r) => r.id === "curator")!;

/** Stub: replaced by the Curator builder. Routes: `curator/[[...slug]]`. */
export function CuratorRoom({ slug }: { slug: string[] }) {
  return <AssemblingRoom eyebrow="Curator" title="The Curator" lede="A tutor that asks for your attempt first. It teaches, questions, critiques, debates and researches, and marks what it suggests as its own." slug={slug} base={R.href} archive={{ href: "/v1/curator", label: "The V1 Curator" }} />;
}
