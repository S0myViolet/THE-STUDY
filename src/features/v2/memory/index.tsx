"use client";

import React from "react";
import { ROOMS } from "@/lib/nav";
import { AssemblingRoom } from "@/features/v2/assembling";

const R = ROOMS.find((r) => r.id === "memory")!;

/** Stub: replaced by the Memory builder. Routes: `memory/[[...slug]]`. */
export function MemoryRoom({ slug }: { slug: string[] }) {
  return <AssemblingRoom eyebrow="Memory" title="Retrieval" lede="Spaced retrieval adapted to your performance, staged from recall to application to reconstruction, and the techniques that make material stick." slug={slug} base={R.href} archive={{ href: "/v1/memory", label: "The V1 Memory Palace" }} />;
}
