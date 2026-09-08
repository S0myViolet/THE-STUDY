"use client";

import React from "react";
import { ROOMS } from "@/lib/nav";
import { AssemblingRoom } from "@/features/v2/assembling";

const R = ROOMS.find((r) => r.id === "speaking")!;

/** Stub: replaced by the Speaking builder. Routes: `speaking/[[...slug]]`. */
export function SpeakingRoom({ slug }: { slug: string[] }) {
  return <AssemblingRoom eyebrow="Speaking" title="Speaking" lede="Sixty seconds to explain, three minutes to argue: timed, transcribed and reviewed against a rubric." slug={slug} base={R.href} archive={{ href: "/v1/rhetoric/voice", label: "V1 Rhetoric voice" }} />;
}
