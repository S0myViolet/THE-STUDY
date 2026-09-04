"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRIMARY_ROOMS, ROOMS } from "@/lib/nav";
import { I } from "@/components/ui/icons";
import { cx } from "@/lib/util/format";

const SECOND = ["red-thread", "profile", "forecasts", "decisions"];

export function NavRail({
  collapsed,
  onToggle,
  onSearch,
}: {
  collapsed: boolean;
  onToggle: () => void;
  onSearch: () => void;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const second = SECOND.map((id) => ROOMS.find((r) => r.id === id)!);
  const settings = ROOMS.find((r) => r.id === "settings")!;
  const curator = ROOMS.find((r) => r.id === "curator")!;

  return (
    <nav
      aria-label="Rooms"
      className={cx("hidden md:flex flex-col h-dvh sticky top-0 shrink-0 border-r border-line bg-paper transition-[width] duration-200", collapsed ? "w-[64px]" : "w-[232px]")}
    >
      <div className={cx("flex items-center h-16 px-4", collapsed ? "justify-center" : "justify-between")}>
        <Link href="/desk" className="flex items-center gap-2.5 min-w-0" aria-label="The Study, home">
          <span className="w-6 h-6 rounded-[3px] bg-ink flex items-center justify-center shrink-0">
            <span className="block w-3 h-[1.5px] bg-paper" />
          </span>
          {!collapsed ? <span className="serif text-[17px] tracking-tight text-ink">The Study</span> : null}
        </Link>
        {!collapsed ? (
          <button className="btn btn-ghost btn-sm -mr-2" onClick={onToggle} aria-label="Collapse navigation" title="Collapse">
            <I.Collapse size={14} />
          </button>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto px-2.5 pb-4">
        <ul className="space-y-0.5">
          {PRIMARY_ROOMS.map((r) => {
            const Icon = I[r.icon];
            return (
              <li key={r.id}>
                <Link href={r.href} className={cx("nav-item", collapsed && "justify-center px-0")} aria-current={isActive(r.href) ? "page" : undefined} title={collapsed ? r.label : undefined}>
                  <Icon size={15} />
                  {!collapsed ? <span>{r.label}</span> : null}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="my-3 mx-3 rule" />
        <ul className="space-y-0.5">
          {second.map((r) => {
            const Icon = I[r.icon];
            return (
              <li key={r.id}>
                <Link href={r.href} className={cx("nav-item", collapsed && "justify-center px-0")} aria-current={isActive(r.href) ? "page" : undefined} title={collapsed ? r.label : undefined}>
                  <Icon size={15} />
                  {!collapsed ? <span>{r.label}</span> : null}
                </Link>
              </li>
            );
          })}
          <li>
            <Link href={curator.href} className={cx("nav-item", collapsed && "justify-center px-0")} aria-current={isActive(curator.href) ? "page" : undefined} title={collapsed ? curator.label : undefined}>
              <I.Curator size={15} />
              {!collapsed ? <span>{curator.label}</span> : null}
            </Link>
          </li>
        </ul>
      </div>

      <div className="px-2.5 pb-4 space-y-0.5 border-t border-line pt-3">
        <button className={cx("nav-item w-full", collapsed && "justify-center px-0")} onClick={onSearch} title="Search (⌘K)">
          <I.Search size={15} />
          {!collapsed ? (
            <span className="flex-1 flex items-center justify-between">
              <span>Search</span>
              <kbd>⌘K</kbd>
            </span>
          ) : null}
        </button>
        <Link href={settings.href} className={cx("nav-item", collapsed && "justify-center px-0")} aria-current={isActive(settings.href) ? "page" : undefined} title={collapsed ? "Settings" : undefined}>
          <I.Settings size={15} />
          {!collapsed ? <span>Settings</span> : null}
        </Link>
        {collapsed ? (
          <button className="nav-item w-full justify-center px-0" onClick={onToggle} aria-label="Expand navigation" title="Expand">
            <I.Expand size={14} />
          </button>
        ) : null}
      </div>
    </nav>
  );
}
