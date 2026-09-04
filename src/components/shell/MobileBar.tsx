"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROOMS, TRAIN_ROOMS } from "@/lib/nav";
import { I } from "@/components/ui/icons";
import { cx } from "@/lib/util/format";

const MORE = ["cabinet", "investigations", "fieldwork", "forecasts", "decisions", "red-thread", "after-action", "profile", "curator", "settings"];

export function MobileBar({ onSearch }: { onSearch: () => void }) {
  const pathname = usePathname();
  const [sheet, setSheet] = useState<"train" | "more" | null>(null);
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const trainActive = TRAIN_ROOMS.some((r) => isActive(r.href));
  const moreActive = MORE.some((id) => isActive(ROOMS.find((r) => r.id === id)!.href));

  const Tab = ({ href, label, icon, active, onClick }: { href?: string; label: string; icon: React.ReactNode; active: boolean; onClick?: () => void }) => {
    const cls = cx("flex flex-col items-center justify-center gap-1 flex-1 h-full text-[10px] tracking-wider uppercase", active ? "text-ink" : "text-ink-3");
    return href ? (
      <Link href={href} className={cls} aria-current={active ? "page" : undefined} onClick={() => setSheet(null)}>
        {icon}
        {label}
      </Link>
    ) : (
      <button className={cls} onClick={onClick} aria-expanded={active}>
        {icon}
        {label}
      </button>
    );
  };

  return (
    <>
      {sheet ? (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setSheet(null)}>
          <div className="absolute inset-0 bg-[rgba(20,18,14,0.35)]" />
          <div className="absolute left-0 right-0 bottom-[64px] bg-paper-2 border-t border-line rounded-t-lg p-4 anim-unfold" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={sheet === "train" ? "Training rooms" : "More rooms"}>
            <div className="eyebrow mb-3">{sheet === "train" ? "Train" : "More"}</div>
            <ul className="grid grid-cols-2 gap-1">
              {(sheet === "train" ? TRAIN_ROOMS : MORE.map((id) => ROOMS.find((r) => r.id === id)!)).map((r) => {
                const Icon = I[r.icon];
                return (
                  <li key={r.id}>
                    <Link href={r.href} className={cx("nav-item h-11", isActive(r.href) && "bg-paper-3")} onClick={() => setSheet(null)} aria-current={isActive(r.href) ? "page" : undefined}>
                      <Icon size={15} />
                      <span>{r.label}</span>
                    </Link>
                  </li>
                );
              })}
              {sheet === "more" ? (
                <li>
                  <button className="nav-item h-11 w-full" onClick={() => { setSheet(null); onSearch(); }}>
                    <I.Search size={15} />
                    <span>Search</span>
                  </button>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      ) : null}
      <nav aria-label="Primary" className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-[64px] pb-[env(safe-area-inset-bottom)] bg-paper border-t border-line flex">
        <Tab href="/desk" label="Desk" icon={<I.Desk size={18} />} active={isActive("/desk")} />
        <Tab href="/casebook" label="Case" icon={<I.Case size={18} />} active={isActive("/casebook")} />
        <Tab label="Train" icon={<I.Eye size={18} />} active={trainActive || sheet === "train"} onClick={() => setSheet(sheet === "train" ? null : "train")} />
        <Tab href="/archive" label="Archive" icon={<I.Archive size={18} />} active={isActive("/archive")} />
        <Tab label="More" icon={<I.Menu size={18} />} active={moreActive || sheet === "more"} onClick={() => setSheet(sheet === "more" ? null : "more")} />
      </nav>
    </>
  );
}
