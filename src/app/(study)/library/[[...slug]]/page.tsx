"use client";

import { use } from "react";
import { LibraryRoom } from "@/features/v2/library";

export default function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = use(params);
  return <LibraryRoom slug={slug ?? []} />;
}
