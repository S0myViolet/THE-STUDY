"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ROOMS } from "@/lib/nav";

function isEditable(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

/**
 * Global keyboard controls.
 *  Cmd/Ctrl+K   search
 *  g then <key> go to room
 *  ?            shortcut reference
 *  Escape       handled by overlays themselves
 */
export function useShortcuts(handlers: { openSearch: () => void; openHelp: () => void }) {
  const router = useRouter();
  const pending = useRef<{ key: string; at: number } | null>(null);
  const h = useRef(handlers);
  h.current = handlers;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        h.current.openSearch();
        return;
      }
      if (isEditable(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "?") {
        e.preventDefault();
        h.current.openHelp();
        return;
      }
      const now = Date.now();
      if (pending.current && now - pending.current.at < 1200 && pending.current.key === "g") {
        const room = ROOMS.find((r) => r.key === e.key.toLowerCase());
        pending.current = null;
        if (room) {
          e.preventDefault();
          router.push(room.href);
        }
        return;
      }
      if (e.key.toLowerCase() === "g") {
        pending.current = { key: "g", at: now };
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);
}

export const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["⌘", "K"], label: "Search and commands" },
  { keys: ["G", "D"], label: "Desk" },
  { keys: ["G", "C"], label: "Casebook" },
  { keys: ["G", "O"], label: "Observation" },
  { keys: ["G", "I"], label: "Inference" },
  { keys: ["G", "S"], label: "Salon" },
  { keys: ["G", "T"], label: "Strategy" },
  { keys: ["G", "M"], label: "Memory" },
  { keys: ["G", "A"], label: "Archive" },
  { keys: ["G", "R"], label: "Rhetoric" },
  { keys: ["G", "X"], label: "Red Thread" },
  { keys: ["G", "U"], label: "Profile" },
  { keys: ["Space"], label: "Advance a timed challenge" },
  { keys: ["⌘", "Enter"], label: "Submit a response" },
  { keys: ["Esc"], label: "Close overlay" },
  { keys: ["?"], label: "This reference" },
];
