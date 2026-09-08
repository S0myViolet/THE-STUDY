"use client";

import { use } from "react";
import { ProveRoom } from "@/features/v2/prove";

export default function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = use(params);
  return <ProveRoom slug={slug ?? []} />;
}
