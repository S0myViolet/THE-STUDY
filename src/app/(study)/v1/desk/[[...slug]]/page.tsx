"use client";

import { use } from "react";
import { DeskRoom } from "@/features/desk";

export default function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = use(params);
  return <DeskRoom slug={slug ?? []} />;
}
