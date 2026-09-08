"use client";

import React from "react";
import { ROOMS } from "@/lib/nav";
import { AssemblingRoom } from "@/features/v2/assembling";

const R = ROOMS.find((r) => r.id === "knowledge")!;

/** Stub: replaced by the Knowledge builder. Routes: `knowledge/[[...slug]]`. */
export function KnowledgeRoom({ slug }: { slug: string[] }) {
  return <AssemblingRoom eyebrow="Knowledge" title="The knowledge graph" lede="Concepts, people, places, events and institutions, and the typed connections between them across domains." slug={slug} base={R.href} archive={{ href: "/v1/archive/graph", label: "The V1 Archive graph" }} />;
}
