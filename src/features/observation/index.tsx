"use client";

import React from "react";
import { PageHeader } from "@/components/ui/primitives";

export function ObservationRoom({ slug }: { slug: string[] }) {
  return (
    <div className="page">
      <PageHeader eyebrow="observation" title="ObservationRoom" lede={"Route: /observation/" + slug.join("/")} />
    </div>
  );
}
