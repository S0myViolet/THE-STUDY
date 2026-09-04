"use client";

import React from "react";
import { PageHeader } from "@/components/ui/primitives";

export function InvestigationsRoom({ slug }: { slug: string[] }) {
  return (
    <div className="page">
      <PageHeader eyebrow="investigations" title="InvestigationsRoom" lede={"Route: /investigations/" + slug.join("/")} />
    </div>
  );
}
