"use client";

import { use } from "react";
import { WritingRoom } from "@/features/v2/writing";

export default function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = use(params);
  return <WritingRoom slug={slug ?? []} />;
}
