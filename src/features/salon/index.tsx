"use client";

import React from "react";
import { PageHeader } from "@/components/ui/primitives";

export function SalonRoom({ slug }: { slug: string[] }) {
  return (
    <div className="page">
      <PageHeader eyebrow="salon" title="SalonRoom" lede={"Route: /salon/" + slug.join("/")} />
    </div>
  );
}
