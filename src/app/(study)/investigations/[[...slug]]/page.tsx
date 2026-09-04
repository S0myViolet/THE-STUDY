"use client";

import { use } from "react";
import { InvestigationsRoom } from "@/features/investigations";

export default function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = use(params);
  return <InvestigationsRoom slug={slug ?? []} />;
}
