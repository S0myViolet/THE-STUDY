"use client";

import React from "react";
import type { CuratorMode } from "@/lib/domain/types";
import { CURATOR_MODES } from "@/lib/curator/modes";
import { cx } from "@/lib/util/format";

/** Desktop: a vertical list with one-line descriptions. Mobile: a horizontal scroller. */
export function ModeRail({ value, onChange, disabled }: { value: CuratorMode; onChange: (m: CuratorMode) => void; disabled?: boolean }) {
  return (
    <nav aria-label="Curator mode">
      <ul className="hidden lg:block space-y-0.5">
        {CURATOR_MODES.map((m) => {
          const active = m.id === value;
          return (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => onChange(m.id)}
                disabled={disabled}
                aria-pressed={active}
                className={cx("nav-item w-full text-left !h-auto !py-2 flex-col !items-start gap-0.5 relative", active && "text-ink before:absolute before:left-0 before:top-2.5 before:bottom-2.5 before:w-[2px] before:bg-wine")}
              >
                <span className={cx("eyebrow", active ? "text-ink" : "text-ink-3")}>{m.label}</span>
                <span className={cx("text-[12px] leading-snug", active ? "text-ink-2" : "text-ink-4")}>{m.description}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="lg:hidden -mx-[18px] px-[18px] overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        <div className="flex gap-1 w-max">
          {CURATOR_MODES.map((m) => {
            const active = m.id === value;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onChange(m.id)}
                disabled={disabled}
                aria-pressed={active}
                className={cx("eyebrow px-2.5 py-2 border-b-2 whitespace-nowrap transition-colors", active ? "text-ink border-wine" : "text-ink-3 border-transparent")}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
