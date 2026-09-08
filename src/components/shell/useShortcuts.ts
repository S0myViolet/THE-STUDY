"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CHORDS, chordTarget } from "@/lib/nav";

function isEditable(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

/**
 * Global keyboard controls.
 *  Cmd/Ctrl+K   search and commands
 *  g then <key> go to a section or room (see CHORDS in src/lib/nav)
 *  ?            shortcut reference
 *  Escape       handled by overlays themselves
 * Chords are ignored while an exam surface is open (`data-exam` on the root), so a
 * stray key never leaves an attempt.
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
      if (document.documentElement.hasAttribute("data-exam")) return;
      const now = Date.now();
      if (pending.current && now - pending.current.at < 1200 && pending.current.key === "g") {
        const href = chordTarget(e.key.toLowerCase());
        pending.current = null;
        if (href) {
          e.preventDefault();
          router.push(href);
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
  ...CHORDS.map((c) => ({ keys: ["G", c.key.toUpperCase()], label: c.label })),
  { keys: ["Space"], label: "Advance a timed challenge" },
  { keys: ["⌘", "Enter"], label: "Submit a response" },
  { keys: ["Esc"], label: "Close overlay" },
  { keys: ["?"], label: "This reference" },
];
