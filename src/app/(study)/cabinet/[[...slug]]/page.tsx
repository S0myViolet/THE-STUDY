"use client";

import { use } from "react";
import { CabinetRoom } from "@/features/cabinet";

export default function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = use(params);
  return <CabinetRoom slug={slug ?? []} />;
}
