"use client";

import { use } from "react";
import { ReviewRoom } from "@/features/v2/review";

export default function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = use(params);
  return <ReviewRoom slug={slug ?? []} />;
}
