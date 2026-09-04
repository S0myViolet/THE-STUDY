"use client";

import { use } from "react";
import { CasebookRoom } from "@/features/casebook";

export default function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = use(params);
  return <CasebookRoom slug={slug ?? []} />;
}
