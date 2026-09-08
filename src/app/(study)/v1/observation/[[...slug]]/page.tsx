"use client";

import { use } from "react";
import { ObservationRoom } from "@/features/observation";

export default function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = use(params);
  return <ObservationRoom slug={slug ?? []} />;
}
