"use client";

import { use } from "react";
import { DecisionsRoom } from "@/features/decisions";

export default function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = use(params);
  return <DecisionsRoom slug={slug ?? []} />;
}
