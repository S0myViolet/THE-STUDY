"use client";

import React from "react";
import { PageHeader } from "@/components/ui/primitives";

export function AfterActionRoom({ slug }: { slug: string[] }) {
  return (
    <div className="page">
      <PageHeader eyebrow="after-action" title="AfterActionRoom" lede={"Route: /after-action/" + slug.join("/")} />
    </div>
  );
}
