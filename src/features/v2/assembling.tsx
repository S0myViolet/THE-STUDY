"use client";

import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";

/**
 * The placeholder body every V2 room stub renders while its engines and content are
 * being built. Feature builders replace each `src/features/v2/<room>/index.tsx`; once
 * none of them import this file, delete it.
 */
export function AssemblingRoom({
  eyebrow,
  title,
  lede,
  slug,
  base,
  archive,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  /** The route segments after the room, so a deep link is acknowledged rather than lost. */
  slug?: string[];
  /** The room's index href, e.g. "/learn". */
  base: string;
  /** Where the equivalent V1 room lives, when there is one. */
  archive?: { href: string; label: string };
}) {
  const deep = slug && slug.length ? `${base}/${slug.join("/")}` : null;
  return (
    <div className="page">
      <PageHeader eyebrow={eyebrow} title={title} lede={lede} />
      <div className="max-w-[60ch] space-y-4 text-[14px] text-ink-2">
        <p>This room is being assembled. The shell, navigation and search are in place; its engines and content arrive with the next build.</p>
        {deep ? (
          <p className="text-ink-3">
            You opened <span className="mono text-[12px] text-ink-2">{deep}</span>. That address is reserved and will resolve once the room is complete.
          </p>
        ) : null}
        {archive ? (
          <p>
            Until then the V1 room remains in the archive:{" "}
            <Link href={archive.href} className="underline underline-offset-4 hover:text-ink inline-flex items-center gap-1">
              {archive.label} <I.ArrowRight size={12} />
            </Link>
          </p>
        ) : null}
        <p>
          <Link href="/today" className="underline underline-offset-4 hover:text-ink">
            Back to Today
          </Link>
        </p>
      </div>
    </div>
  );
}
