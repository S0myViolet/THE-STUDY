"use client";

import { use } from "react";
import { KnowledgeRoom } from "@/features/v2/knowledge";

export default function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = use(params);
  return <KnowledgeRoom slug={slug ?? []} />;
}
