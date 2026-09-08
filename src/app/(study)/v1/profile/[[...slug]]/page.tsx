"use client";

import { use } from "react";
import { ProfileRoom } from "@/features/profile";

export default function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = use(params);
  return <ProfileRoom slug={slug ?? []} />;
}
