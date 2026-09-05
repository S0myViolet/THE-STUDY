"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ArchiveHeader } from "./shared";

const Graph = dynamic(() => import("./Graph"), {
  ssr: false,
  loading: () => (
    <div className="page">
      <ArchiveHeader eyebrow="The Archive · Graph" title="What connects to what" />
      <div className="stage" style={{ aspectRatio: "960 / 620" }} aria-hidden />
    </div>
  ),
});

export function GraphPage() {
  return <Graph />;
}
