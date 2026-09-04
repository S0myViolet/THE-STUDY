"use client";

import { use } from "react";
import { RhetoricRoom } from "@/features/rhetoric";

export default function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = use(params);
  return <RhetoricRoom slug={slug ?? []} />;
}
