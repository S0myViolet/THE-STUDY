"use client";

import React from "react";
import { PageHeader } from "@/components/ui/primitives";

export function ForecastsRoom({ slug }: { slug: string[] }) {
  return (
    <div className="page">
      <PageHeader eyebrow="forecasts" title="ForecastsRoom" lede={"Route: /forecasts/" + slug.join("/")} />
    </div>
  );
}
