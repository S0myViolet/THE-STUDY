"use client";

import React from "react";
import { PageHeader } from "@/components/ui/primitives";

export function ArchiveRoom({ slug }: { slug: string[] }) {
  return (
    <div className="page">
      <PageHeader eyebrow="archive" title="ArchiveRoom" lede={"Route: /archive/" + slug.join("/")} />
    </div>
  );
}
