"use client";

import React, { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { NavRail } from "./NavRail";
import { MobileBar } from "./MobileBar";
import { CommandPalette } from "./CommandPalette";
import { SHORTCUTS, useShortcuts } from "./useShortcuts";
import { Dialog } from "@/components/ui/primitives";
import { DemoBanner } from "./DemoBanner";
import { V1Banner } from "./V1Banner";
import { isV1Path } from "@/lib/nav";

const RAIL_KEY = "the-study:rail-collapsed";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState(false);
  const [help, setHelp] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(RAIL_KEY) === "1");
    } catch {}
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((c) => {
      try {
        localStorage.setItem(RAIL_KEY, c ? "0" : "1");
      } catch {}
      return !c;
    });
  }, []);

  useShortcuts({ openSearch: () => setSearch(true), openHelp: () => setHelp(true) });

  return (
    <div className="flex min-h-dvh">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] btn btn-sm">
        Skip to content
      </a>
      <NavRail collapsed={collapsed} onToggle={toggle} onSearch={() => setSearch(true)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <DemoBanner />
        {isV1Path(pathname) ? <V1Banner /> : null}
        <main id="main" className="flex-1 min-w-0">
          {children}
        </main>
      </div>
      <MobileBar onSearch={() => setSearch(true)} />
      <CommandPalette open={search} onClose={() => setSearch(false)} />
      <Dialog open={help} onClose={() => setHelp(false)} title="Keyboard">
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
          {SHORTCUTS.map((s) => (
            <li key={s.label} className="flex items-center justify-between gap-3 text-[13px] text-ink-2 py-1 border-b border-line">
              <span>{s.label}</span>
              <span className="flex gap-1">
                {s.keys.map((k) => (
                  <kbd key={k}>{k}</kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </Dialog>
    </div>
  );
}
