"use client";

import { use } from "react";
import { ArchiveRoom } from "@/features/archive";

export default function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = use(params);
  return <ArchiveRoom slug={slug ?? []} />;
}
