"use client";

import { use } from "react";
import { TrainRoom } from "@/features/v2/train";

export default function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = use(params);
  return <TrainRoom slug={slug ?? []} />;
}
