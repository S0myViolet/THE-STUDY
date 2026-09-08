"use client";

import { use } from "react";
import { BuildRoom } from "@/features/v2/build";

export default function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = use(params);
  return <BuildRoom slug={slug ?? []} />;
}
