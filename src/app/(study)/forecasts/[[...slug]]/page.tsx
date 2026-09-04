"use client";

import { use } from "react";
import { ForecastsRoom } from "@/features/forecasts";

export default function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = use(params);
  return <ForecastsRoom slug={slug ?? []} />;
}
