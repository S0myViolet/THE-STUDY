"use client";

import React from "react";
import Link from "next/link";
import { I } from "@/components/ui/icons";

const LINK = /\[([^\]]+)\]\((\/[^)\s]*)\)/g;

const LINK_STYLE = `.rich-link{color:var(--ink);text-decoration:underline;text-decoration-color:var(--ink-3);text-underline-offset:4px;transition:text-decoration-color 120ms ease}.rich-link:hover{text-decoration-color:var(--ink)}`;

/** Paragraphs separated by blank lines; single newlines break; [label](/href) become real links. */
export function RichText({ text, className, streaming }: { text: string; className?: string; streaming?: boolean }) {
  const paras = text.split(/\n{2,}/).filter((p) => p.trim().length);
  return (
    <div className={className}>
      <style>{LINK_STYLE}</style>
      {paras.map((p, i) => (
        <p key={i} style={i ? { marginTop: "0.75em" } : undefined}>
          {renderInline(p)}
          {streaming && i === paras.length - 1 ? <span className="inline-block w-[2px] h-[1em] align-[-0.15em] bg-ink-3 ml-0.5 animate-pulse" aria-hidden /> : null}
        </p>
      ))}
      {streaming && !paras.length ? <span className="inline-block w-[2px] h-[1em] bg-ink-3 animate-pulse" aria-hidden /> : null}
    </div>
  );
}

function renderInline(p: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const lines = p.split("\n");
  lines.forEach((line, li) => {
    let last = 0;
    let m: RegExpExecArray | null;
    const re = new RegExp(LINK.source, "g");
    while ((m = re.exec(line))) {
      if (m.index > last) out.push(line.slice(last, m.index));
      out.push(
        <Link key={`${li}-${m.index}`} href={m[2]} className="rich-link">
          {m[1]}
          <I.ArrowRight size={12} className="inline-block ml-1 align-[-1px]" />
        </Link>,
      );
      last = m.index + m[0].length;
    }
    if (last < line.length) out.push(line.slice(last));
    if (li < lines.length - 1) out.push(<br key={`br-${li}`} />);
  });
  return out;
}
