"use client";

import { use } from "react";
import { AfterActionRoom } from "@/features/after-action";

export default function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = use(params);
  return <AfterActionRoom slug={slug ?? []} />;
}
