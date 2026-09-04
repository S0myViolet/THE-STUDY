"use client";

import React from "react";
import { PageHeader } from "@/components/ui/primitives";

export function CuratorRoom({ slug }: { slug: string[] }) {
  return (
    <div className="page">
      <PageHeader eyebrow="curator" title="CuratorRoom" lede={"Route: /curator/" + slug.join("/")} />
    </div>
  );
}
