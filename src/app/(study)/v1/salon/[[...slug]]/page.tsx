"use client";

import { use } from "react";
import { SalonRoom } from "@/features/salon";

export default function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = use(params);
  return <SalonRoom slug={slug ?? []} />;
}
