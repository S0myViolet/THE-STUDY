"use client";

import { use } from "react";
import { FieldworkRoom } from "@/features/fieldwork";

export default function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = use(params);
  return <FieldworkRoom slug={slug ?? []} />;
}
