"use client";

import React from "react";
import { PageHeader } from "@/components/ui/primitives";

export function FieldworkRoom({ slug }: { slug: string[] }) {
  return (
    <div className="page">
      <PageHeader eyebrow="fieldwork" title="FieldworkRoom" lede={"Route: /fieldwork/" + slug.join("/")} />
    </div>
  );
}
