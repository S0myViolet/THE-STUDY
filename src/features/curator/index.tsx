"use client";

import React from "react";
import { Consultation } from "./Consultation";

/**
 * /curator                  a new consultation (?mode=<CuratorMode> preselects, ?q=<text> prefills)
 * /curator/<conversationId> resume a consultation
 */
export function CuratorRoom({ slug }: { slug: string[] }) {
  const id = slug[0];
  return <Consultation key={id ?? "new"} conversationId={id} />;
}
