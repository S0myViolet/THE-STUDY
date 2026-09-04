"use client";

import { use } from "react";
import { InferenceRoom } from "@/features/inference";

export default function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = use(params);
  return <InferenceRoom slug={slug ?? []} />;
}
