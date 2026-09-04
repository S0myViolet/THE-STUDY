"use client";

import React from "react";
import { PageHeader } from "@/components/ui/primitives";

export function CabinetRoom({ slug }: { slug: string[] }) {
  return (
    <div className="page">
      <PageHeader eyebrow="cabinet" title="CabinetRoom" lede={"Route: /cabinet/" + slug.join("/")} />
    </div>
  );
}
