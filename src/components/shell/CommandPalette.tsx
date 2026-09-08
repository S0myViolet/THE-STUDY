"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useStudy } from "@/lib/persistence/provider";
import { KIND_LABEL, isV1Hit } from "@/lib/search";
import { search, staticIndexV2, userIndexV2, type SearchHit } from "@/lib/v2/search";
import { I } from "@/components/ui/icons";
import { applyAppearance, currentTheme } from "@/lib/theme";
import { updatePrefs } from "@/lib/services/profile";
import { cx } from "@/lib/util/format";

const SERIF_KINDS = new Set<SearchHit["kind"]>(["concept", "lesson", "path", "source", "archive", "case", "node"]);

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { db } = useStudy();
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const [userHits, setUserHits] = useState<SearchHit[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const base = useMemo(() => staticIndexV2(), []);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setIdx(0);
    userIndexV2(db).then(setUserHits).catch(() => setUserHits([]));
    setTimeout(() => inputRef.current?.focus(), 10);
  }, [open, db]);

  const hits = useMemo(() => search([...base, ...userHits], q), [base, userHits, q]);

  useEffect(() => setIdx(0), [q]);

  const go = async (h: SearchHit) => {
    onClose();
    if (h.href === "#toggle-theme") {
      const next = currentTheme() === "dark" ? "light" : "dark";
      applyAppearance(next);
      await updatePrefs(db, { appearance: next });
      return;
    }
    router.push(h.href);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center pt-[12vh] px-4" role="dialog" aria-modal="true" aria-label="Search" onClick={onClose}>
      <div className="absolute inset-0 bg-[rgba(20,18,14,0.4)]" />
      <div className="relative w-full max-w-[620px] sheet-raised overflow-hidden anim-unfold" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 h-14 border-b border-line">
          <I.Search size={16} className="text-ink-3" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setIdx((i) => Math.min(hits.length - 1, i + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setIdx((i) => Math.max(0, i - 1));
              } else if (e.key === "Enter") {
                e.preventDefault();
                if (hits[idx]) void go(hits[idx]);
              } else if (e.key === "Escape") {
                onClose();
              }
            }}
            placeholder="Search concepts, sources, projects, or type a command"
            className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-ink-4"
            aria-label="Search"
            aria-activedescendant={hits[idx] ? `hit-${hits[idx].id}` : undefined}
            aria-controls="palette-results"
            role="combobox"
            aria-expanded="true"
          />
          <kbd>Esc</kbd>
        </div>
        <ul id="palette-results" role="listbox" className="max-h-[52vh] overflow-y-auto py-2">
          {hits.length === 0 ? <li className="px-4 py-6 text-[13px] text-ink-3 text-center">Nothing in the Study matches that yet.</li> : null}
          {hits.map((h, i) => (
            <li
              key={h.id}
              id={`hit-${h.id}`}
              role="option"
              aria-selected={i === idx}
              className={cx("flex items-center gap-3 px-4 py-2.5 cursor-pointer", i === idx ? "bg-paper-3" : "hover:bg-paper-3")}
              onMouseEnter={() => setIdx(i)}
              onClick={() => void go(h)}
            >
              <span className={cx("eyebrow w-24 shrink-0", isV1Hit(h) && "text-brass")}>{isV1Hit(h) ? "V1 · " + KIND_LABEL[h.kind] : KIND_LABEL[h.kind]}</span>
              <span className="min-w-0 flex-1">
                <span className={cx("block text-[14px] truncate", SERIF_KINDS.has(h.kind) ? "serif text-[15px]" : "")}>{h.title}</span>
                {h.subtitle ? <span className="block text-[12px] text-ink-3 truncate">{h.subtitle}</span> : null}
              </span>
              {i === idx ? <I.ArrowRight size={14} className="text-ink-3" /> : null}
            </li>
          ))}
        </ul>
        <div className="px-4 h-9 flex items-center gap-4 border-t border-line text-[11px] text-ink-3">
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> navigate
          </span>
          <span>
            <kbd>↵</kbd> open
          </span>
          <span className="ml-auto">
            <kbd>?</kbd> shortcuts
          </span>
        </div>
      </div>
    </div>
  );
}
