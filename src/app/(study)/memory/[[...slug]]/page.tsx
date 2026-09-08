"use client";

import { use } from "react";
import { MemoryRoom } from "@/features/v2/memory";

export default function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = use(params);
  return <MemoryRoom slug={slug ?? []} />;
}
