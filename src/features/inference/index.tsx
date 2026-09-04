"use client";

import React from "react";
import { PageHeader } from "@/components/ui/primitives";

export function InferenceRoom({ slug }: { slug: string[] }) {
  return (
    <div className="page">
      <PageHeader eyebrow="inference" title="InferenceRoom" lede={"Route: /inference/" + slug.join("/")} />
    </div>
  );
}
