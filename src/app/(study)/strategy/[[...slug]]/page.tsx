"use client";

import { use } from "react";
import { StrategyRoom } from "@/features/strategy";

export default function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = use(params);
  return <StrategyRoom slug={slug ?? []} />;
}
