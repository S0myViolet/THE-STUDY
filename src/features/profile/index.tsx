"use client";

import React from "react";
import { PageHeader } from "@/components/ui/primitives";

export function ProfileRoom({ slug }: { slug: string[] }) {
  return (
    <div className="page">
      <PageHeader eyebrow="profile" title="ProfileRoom" lede={"Route: /profile/" + slug.join("/")} />
    </div>
  );
}
