"use client";

import React from "react";
import { PageHeader } from "@/components/ui/primitives";

export function MemoryRoom({ slug }: { slug: string[] }) {
  return (
    <div className="page">
      <PageHeader eyebrow="memory" title="MemoryRoom" lede={"Route: /memory/" + slug.join("/")} />
    </div>
  );
}
