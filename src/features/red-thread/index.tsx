"use client";

import React from "react";
import { PageHeader } from "@/components/ui/primitives";

export function RedThreadRoom({ slug }: { slug: string[] }) {
  return (
    <div className="page">
      <PageHeader eyebrow="red-thread" title="RedThreadRoom" lede={"Route: /red-thread/" + slug.join("/")} />
    </div>
  );
}
