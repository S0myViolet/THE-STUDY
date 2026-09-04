"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStudy } from "@/lib/persistence/provider";
import { completeSessionItem } from "@/lib/adaptation/session";

/**
 * Rooms use this to know whether they were opened as part of a daily session,
 * and to hand control back to the Desk when the item completes.
 *
 *   const { inSession, finish } = useSessionItem();
 *   ... on completion: await finish();  // returns true if it navigated
 */
export function useSessionItem() {
  const params = useSearchParams();
  const router = useRouter();
  const { db } = useStudy();
  const sessionId = params.get("session");
  const itemId = params.get("item");
  const inSession = !!(sessionId && itemId);

  const finish = useCallback(
    async (status: "done" | "skipped" = "done") => {
      if (!sessionId || !itemId) return false;
      await completeSessionItem(db, sessionId, itemId, status);
      router.push(`/desk?session=${sessionId}`);
      return true;
    },
    [db, sessionId, itemId, router],
  );

  return { inSession, sessionId, itemId, finish };
}
