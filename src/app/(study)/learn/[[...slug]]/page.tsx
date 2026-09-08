"use client";

import { use } from "react";
import { LearnRoom } from "@/features/v2/learn";

export default function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = use(params);
  return <LearnRoom slug={slug ?? []} />;
}
