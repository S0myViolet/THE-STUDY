import type { CuratorMessage } from "@/lib/domain/types";
import type { KnowledgeRef } from "@/lib/curator/offline";

/**
 * Messages persist as CuratorMessage plus a few optional fields the room uses:
 * a knowledge reference for Save/Test offers, a Think First flag, and whether
 * the reply came from the offline Curator.
 */
export type CuratorMsg = CuratorMessage & {
  knowledge?: KnowledgeRef;
  thinkFirst?: boolean;
  offline?: boolean;
};

export function titleFrom(text: string): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= 64) return t;
  const cut = t.slice(0, 64);
  const sp = cut.lastIndexOf(" ");
  return (sp > 30 ? cut.slice(0, sp) : cut) + "…";
}
