"use client";

import React from "react";
import { PageHeader } from "@/components/ui/primitives";

export function CasebookRoom({ slug }: { slug: string[] }) {
  return (
    <div className="page">
      <PageHeader eyebrow="casebook" title="CasebookRoom" lede={"Route: /casebook/" + slug.join("/")} />
    </div>
  );
}
