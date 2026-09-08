"use client";

import React from "react";
import { ROOMS } from "@/lib/nav";
import { AssemblingRoom } from "@/features/v2/assembling";

const R = ROOMS.find((r) => r.id === "library")!;

/** Stub: replaced by the Library builder. Routes: `library/[[...slug]]`. */
export function LibraryRoom({ slug }: { slug: string[] }) {
  return <AssemblingRoom eyebrow="Library" title="Sources" lede="Books, papers and articles read with a question in hand, recalled closed-book, and connected to what you already know." slug={slug} base={R.href} archive={{ href: "/v1/archive/reading", label: "The V1 bookshelf" }} />;
}
