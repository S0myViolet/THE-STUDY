"use client";

import { use } from "react";
import { SpeakingRoom } from "@/features/v2/speaking";

export default function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = use(params);
  return <SpeakingRoom slug={slug ?? []} />;
}
