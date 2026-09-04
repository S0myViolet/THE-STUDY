"use client";

import React from "react";
import { PageHeader } from "@/components/ui/primitives";

export function DeskRoom({ slug }: { slug: string[] }) {
  return (
    <div className="page">
      <PageHeader eyebrow="desk" title="DeskRoom" lede={"Route: /desk/" + slug.join("/")} />
    </div>
  );
}
