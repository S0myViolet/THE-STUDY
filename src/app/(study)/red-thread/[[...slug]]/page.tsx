"use client";

import { use } from "react";
import { RedThreadRoom } from "@/features/red-thread";

export default function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = use(params);
  return <RedThreadRoom slug={slug ?? []} />;
}
