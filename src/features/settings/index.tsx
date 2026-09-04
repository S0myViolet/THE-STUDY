"use client";

import React from "react";
import { PageHeader } from "@/components/ui/primitives";

export function SettingsRoom({ slug }: { slug: string[] }) {
  return (
    <div className="page">
      <PageHeader eyebrow="settings" title="SettingsRoom" lede={"Route: /settings/" + slug.join("/")} />
    </div>
  );
}
