"use client";

import React from "react";
import { PageHeader } from "@/components/ui/primitives";

export function RhetoricRoom({ slug }: { slug: string[] }) {
  return (
    <div className="page">
      <PageHeader eyebrow="rhetoric" title="RhetoricRoom" lede={"Route: /rhetoric/" + slug.join("/")} />
    </div>
  );
}
