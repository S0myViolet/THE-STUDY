"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROOMS, SECTIONS, isV1Path, type Room } from "@/lib/nav";
import { I } from "@/components/ui/icons";
import { cx } from "@/lib/util/format";

const TABS = ["today", "learn", "train", "prove"] as const;
const SHEET_SECTIONS = SECTIONS.filter((s) => !(TABS as readonly string[]).includes(s.id));
const SHEET_ROOMS = ROOMS.filter((r) => r.id !== "settings");
const SETTINGS = ROOMS.find((r) => r.id === "settings")!;

function Tab({ href, label, icon, active, onClick, onNavigate }: { href?: string; label: string; icon: React.ReactNode; active: boolean; onClick?: () => void; onNavigate?: () => void }) {
  const cls = cx("flex flex-col items-center justify-center gap-1 flex-1 h-full text-[10px] tracking-wider uppercase", active ? "text-ink" : "text-ink-3");
  return href ? (
    <Link href={href} className={cls} aria-current={active ? "page" : undefined} onClick={onNavigate}>
      {icon}
      {label}
    </Link>
  ) : (
    <button className={cls} onClick={onClick} aria-expanded={active}>
      {icon}
      {label}
    </button>
  );
}

function SheetLink({ room, active, onNavigate }: { room: Room; active: boolean; onNavigate: () => void }) {
  const Icon = I[room.icon];
  return (
    <li>
      <Link href={room.href} className={cx("nav-item h-11", active && "bg-paper-3")} onClick={onNavigate} aria-current={active ? "page" : undefined}>
        <Icon size={15} />
        <span>{room.label}</span>
      </Link>
    </li>
  );
}

/**
 * Mobile navigation: Today, Learn, Train, Prove and a More sheet holding Build,
 * Review, the secondary rooms, search and settings.
 */
export function MobileBar({ onSearch }: { onSearch: () => void }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const tabs = TABS.map((id) => SECTIONS.find((s) => s.id === id)!);
  const moreActive = SHEET_SECTIONS.some((s) => isActive(s.href)) || SHEET_ROOMS.some((r) => isActive(r.href)) || isActive(SETTINGS.href) || isV1Path(pathname);
  const close = () => setOpen(false);

  return (
    <>
      {open ? (
        <div className="md:hidden fixed inset-0 z-40" onClick={close}>
          <div className="absolute inset-0 bg-[rgba(20,18,14,0.35)]" />
          <div className="absolute left-0 right-0 bottom-[64px] max-h-[70dvh] overflow-y-auto bg-paper-2 border-t border-line rounded-t-lg p-4 anim-unfold" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="More">
            <div className="eyebrow mb-2">Sections</div>
            <ul className="grid grid-cols-2 gap-1">
              {SHEET_SECTIONS.map((s) => (
                <SheetLink key={s.id} room={s} active={isActive(s.href)} onNavigate={close} />
              ))}
            </ul>
            <div className="eyebrow mt-4 mb-2">Rooms</div>
            <ul className="grid grid-cols-2 gap-1">
              {SHEET_ROOMS.map((r) => (
                <SheetLink key={r.id} room={r} active={isActive(r.href)} onNavigate={close} />
              ))}
              <li>
                <button
                  className="nav-item h-11 w-full"
                  onClick={() => {
                    close();
                    onSearch();
                  }}
                >
                  <I.Search size={15} />
                  <span>Search</span>
                </button>
              </li>
              <SheetLink room={SETTINGS} active={isActive(SETTINGS.href)} onNavigate={close} />
            </ul>
            {isV1Path(pathname) ? (
              <p className="mt-4 text-[11px] tracking-[0.12em] uppercase text-brass">
                You are in the V1 archive.{" "}
                <Link href="/settings/v1" className="underline underline-offset-4" onClick={close}>
                  All V1 rooms
                </Link>
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
      <nav aria-label="Primary" className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-[64px] pb-[env(safe-area-inset-bottom)] bg-paper border-t border-line flex">
        {tabs.map((s) => {
          const Icon = I[s.icon];
          return <Tab key={s.id} href={s.href} label={s.label} icon={<Icon size={18} />} active={isActive(s.href)} onNavigate={close} />;
        })}
        <Tab label="More" icon={<I.Menu size={18} />} active={moreActive || open} onClick={() => setOpen((o) => !o)} />
      </nav>
    </>
  );
}
