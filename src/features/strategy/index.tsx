"use client";

import React from "react";
import { PageHeader } from "@/components/ui/primitives";

export function StrategyRoom({ slug }: { slug: string[] }) {
  return (
    <div className="page">
      <PageHeader eyebrow="strategy" title="StrategyRoom" lede={"Route: /strategy/" + slug.join("/")} />
    </div>
  );
}
