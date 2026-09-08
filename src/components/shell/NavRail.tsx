"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROOMS, SECTIONS, isV1Path, type Room } from "@/lib/nav";
import { I } from "@/components/ui/icons";
import { cx } from "@/lib/util/format";

const RAIL_ROOMS = ROOMS.filter((r) => r.id !== "settings");

function Item({ room, collapsed, active }: { room: Room; collapsed: boolean; active: boolean }) {
  const Icon = I[room.icon];
  return (
    <li>
      <Link href={room.href} className={cx("nav-item", collapsed && "justify-center px-0")} aria-current={active ? "page" : undefined} title={collapsed ? room.label : undefined}>
        <Icon size={15} />
        {!collapsed ? <span>{room.label}</span> : null}
      </Link>
    </li>
  );
}

/**
 * Desktop navigation: the six sections, a hairline, the secondary rooms, and at the
 * bottom search and settings. The V1 archive is deliberately absent; it is reached
 * from Settings and the palette. When the reader is inside /v1, a quiet marker shows it.
 */
export function NavRail({ collapsed, onToggle, onSearch }: { collapsed: boolean; onToggle: () => void; onSearch: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const settings = ROOMS.find((r) => r.id === "settings")!;
  const inArchive = isV1Path(pathname);

  return (
    <nav aria-label="Sections and rooms" className={cx("hidden md:flex flex-col h-dvh sticky top-0 shrink-0 border-r border-line bg-paper transition-[width] duration-200", collapsed ? "w-[64px]" : "w-[232px]")}>
      <div className={cx("flex items-center h-16 px-4", collapsed ? "justify-center" : "justify-between")}>
        <Link href="/today" className="flex items-center gap-2.5 min-w-0" aria-label="The Study, home">
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
        <ul className="space-y-0.5" aria-label="Sections">
          {SECTIONS.map((s) => (
            <Item key={s.id} room={s} collapsed={collapsed} active={isActive(s.href)} />
          ))}
        </ul>
        <div className="my-3 mx-3 rule" />
        <ul className="space-y-0.5" aria-label="Rooms">
          {RAIL_ROOMS.map((r) => (
            <Item key={r.id} room={r} collapsed={collapsed} active={isActive(r.href)} />
          ))}
        </ul>
        {inArchive ? (
          <div className={cx("mt-4 mx-3 pt-3 border-t border-line", collapsed && "mx-1")}>
            <Link href="/settings/v1" className={cx("flex items-center gap-2 text-[11px] tracking-[0.12em] uppercase text-brass hover:text-ink", collapsed && "justify-center")} title="You are in the V1 archive">
              <I.Archive size={13} />
              {!collapsed ? <span>V1 archive</span> : null}
            </Link>
          </div>
        ) : null}
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
