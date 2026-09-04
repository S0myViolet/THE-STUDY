"use client";

import React from "react";
import { PageHeader } from "@/components/ui/primitives";

export function DecisionsRoom({ slug }: { slug: string[] }) {
  return (
    <div className="page">
      <PageHeader eyebrow="decisions" title="DecisionsRoom" lede={"Route: /decisions/" + slug.join("/")} />
    </div>
  );
}
