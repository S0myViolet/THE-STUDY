"use client";

import React from "react";
import { ROOMS } from "@/lib/nav";
import { AssemblingRoom } from "@/features/v2/assembling";

const R = ROOMS.find((r) => r.id === "writing")!;

/** Stub: replaced by the Writing builder. Routes: `writing/[[...slug]]`. */
export function WritingRoom({ slug }: { slug: string[] }) {
  return <AssemblingRoom eyebrow="Writing" title="Writing" lede="Seven levels, from explaining clearly to developing an original thesis, with feedback anchored to the exact passage." slug={slug} base={R.href} archive={{ href: "/v1/rhetoric", label: "V1 Rhetoric" }} />;
}
