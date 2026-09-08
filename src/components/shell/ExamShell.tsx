"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button, Dialog } from "@/components/ui/primitives";
import { formatClock } from "@/components/ui/v2";
import { I } from "@/components/ui/icons";
import { cx } from "@/lib/util/format";

/**
 * The examination surface used by Prove. It covers the whole viewport (rail and
 * mobile bar included) with a quiet header: title, section label, a countdown and
 * a "Leave" control that asks before it does anything. While mounted the root
 * element carries `data-exam`, which silences the g-chords in `useShortcuts`.
 *
 * The clock is derived from `startedAt` and `totalSeconds`, so a reload shows the
 * true remaining time; `onExpire` fires once when it reaches zero.
 */
export function ExamShell({
  title,
  section,
  startedAt,
  totalSeconds,
  onExpire,
  onLeave,
  leaveLabel = "Leave",
  confirmTitle = "Leave the exam?",
  confirmBody = "Unanswered items are scored as missing and this attempt cannot be resumed.",
  footer,
  children,
  className,
}: {
  title: React.ReactNode;
  /** Current section label, e.g. "Section 2 of 4 · Probability". */
  section?: React.ReactNode;
  /** ISO time or epoch ms; with `totalSeconds` it drives the countdown. Omit for untimed work. */
  startedAt?: string | number;
  totalSeconds?: number;
  onExpire?: () => void;
  onLeave: () => void;
  leaveLabel?: string;
  confirmTitle?: string;
  confirmBody?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const [confirm, setConfirm] = useState(false);
  const remaining = useExamClock(startedAt, totalSeconds, onExpire);

  useEffect(() => {
    document.documentElement.setAttribute("data-exam", "true");
    return () => document.documentElement.removeAttribute("data-exam");
  }, []);

  const timed = remaining !== null && totalSeconds !== undefined && totalSeconds > 0;
  const ratio = timed ? Math.max(0, Math.min(1, remaining / totalSeconds)) : 0;
  const late = timed && ratio <= 0.1 && remaining > 0;

  return (
    <div className={cx("exam fixed inset-0 z-[80] overflow-y-auto", className)} role="region" aria-label="Examination">
      <header className="exam-head">
        <div className="min-w-0">
          <div className="serif text-[17px] text-ink truncate">{title}</div>
          {section ? <div className="eyebrow mt-0.5 truncate">{section}</div> : null}
        </div>
        <div className="flex items-center gap-4 shrink-0">
          {timed ? (
            <div className="flex items-center gap-3" role="timer" aria-live="off" aria-label="Time remaining">
              <span className={cx("numeral text-[13px]", late ? "text-wine" : "text-ink-2")}>{formatClock(remaining)}</span>
              <div className="hairline-progress w-24 hidden sm:block">
                <span style={{ width: `${ratio * 100}%`, background: late ? "var(--wine)" : undefined }} />
              </div>
            </div>
          ) : null}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirm(true)}>
            <I.Leave size={14} />
            {leaveLabel}
          </button>
        </div>
      </header>
      <div className="exam-body">{children}</div>
      {footer ? <div className="exam-foot">{footer}</div> : null}
      <Dialog open={confirm} onClose={() => setConfirm(false)} title={confirmTitle}>
        <p className="text-[14px] text-ink-2">{confirmBody}</p>
        <div className="mt-5 flex gap-3">
          <Button
            variant="wine"
            onClick={() => {
              setConfirm(false);
              onLeave();
            }}
          >
            {leaveLabel}
          </Button>
          <Button variant="ghost" onClick={() => setConfirm(false)}>
            Stay
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

/** Seconds remaining, recomputed each second from the persisted start; null when untimed. */
export function useExamClock(startedAt: string | number | undefined, totalSeconds: number | undefined, onExpire?: () => void): number | null {
  const compute = () => {
    if (startedAt === undefined || totalSeconds === undefined) return null;
    const start = typeof startedAt === "number" ? startedAt : new Date(startedAt).getTime();
    if (!Number.isFinite(start)) return null;
    return Math.max(0, totalSeconds - (Date.now() - start) / 1000);
  };
  const [remaining, setRemaining] = useState<number | null>(compute);
  const expired = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    expired.current = false;
    const tick = () => {
      const r = compute();
      setRemaining(r);
      if (r !== null && r <= 0 && !expired.current) {
        expired.current = true;
        onExpireRef.current?.();
      }
    };
    tick();
    if (startedAt === undefined || totalSeconds === undefined) return;
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt, totalSeconds]);

  return remaining;
}
