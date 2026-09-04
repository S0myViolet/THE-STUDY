"use client";

import { use } from "react";
import { SettingsRoom } from "@/features/settings";

export default function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = use(params);
  return <SettingsRoom slug={slug ?? []} />;
}
