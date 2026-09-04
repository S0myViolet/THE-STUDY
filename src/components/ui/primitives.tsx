"use client";

import React, { useEffect, useId, useRef } from "react";
import { cx } from "@/lib/util/format";
import { LEVEL_LABEL, type Level } from "@/lib/domain/faculties";
import { I } from "./icons";

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "wine";
  size?: "sm" | "md" | "lg";
};

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      className={cx(
        "btn",
        variant === "secondary" && "btn-secondary",
        variant === "ghost" && "btn-ghost",
        variant === "wine" && "btn-wine",
        size === "sm" && "btn-sm",
        size === "lg" && "btn-lg",
        className,
      )}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Typography bits                                                     */
/* ------------------------------------------------------------------ */

export function Eyebrow({ children, tone, className }: { children: React.ReactNode; tone?: "brass" | "wine"; className?: string }) {
  return <div className={cx("eyebrow", tone === "brass" && "eyebrow-brass", tone === "wine" && "eyebrow-wine", className)}>{children}</div>;
}

export function PageHeader({
  eyebrow,
  title,
  lede,
  aside,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  lede?: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cx("flex items-end justify-between gap-6 mb-8", className)}>
      <div className="min-w-0">
        {eyebrow ? <Eyebrow className="mb-2">{eyebrow}</Eyebrow> : null}
        <h1 className="display text-[34px] md:text-[40px] text-ink">{title}</h1>
        {lede ? <p className="mt-2 text-ink-2 max-w-[60ch] text-[15px]">{lede}</p> : null}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </header>
  );
}

export function SectionTitle({ children, aside, className }: { children: React.ReactNode; aside?: React.ReactNode; className?: string }) {
  return (
    <div className={cx("flex items-baseline justify-between gap-4 mb-3", className)}>
      <div className="eyebrow">{children}</div>
      {aside}
    </div>
  );
}

export function LevelMark({ level, className }: { level: Level; className?: string }) {
  return (
    <span className={cx("level", className)} data-level={level}>
      {LEVEL_LABEL[level]}
    </span>
  );
}

export function Trend({ trend, className }: { trend: "up" | "down" | "flat"; className?: string }) {
  const label = trend === "up" ? "Rising" : trend === "down" ? "Falling" : "Steady";
  return (
    <span className={cx("inline-flex items-center gap-1 text-[11px] text-ink-3", className)} aria-label={label} title={label}>
      {trend === "up" ? <I.Up size={12} /> : trend === "down" ? <I.Down size={12} /> : <span className="inline-block w-3 h-px bg-current" />}
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd>{children}</kbd>;
}

/* ------------------------------------------------------------------ */
/* Fields                                                              */
/* ------------------------------------------------------------------ */

export function Field({
  label,
  hint,
  className,
  serif,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string; serif?: boolean }) {
  const id = useId();
  return (
    <label className={cx("block", className)} htmlFor={id}>
      {label ? <span className="eyebrow block mb-1.5">{label}</span> : null}
      <input id={id} className={cx("field", serif && "field-serif")} {...props} />
      {hint ? <span className="block mt-1 text-[12px] text-ink-3">{hint}</span> : null}
    </label>
  );
}

export function TextArea({
  label,
  hint,
  className,
  serif,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; hint?: string; serif?: boolean }) {
  const id = useId();
  return (
    <label className={cx("block", className)} htmlFor={id}>
      {label ? <span className="eyebrow block mb-1.5">{label}</span> : null}
      <textarea id={id} className={cx("field", serif && "field-serif")} {...props} />
      {hint ? <span className="block mt-1 text-[12px] text-ink-3">{hint}</span> : null}
    </label>
  );
}

export function Select({
  label,
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  const id = useId();
  return (
    <label className={cx("block", className)} htmlFor={id}>
      {label ? <span className="eyebrow block mb-1.5">{label}</span> : null}
      <select id={id} className="field" {...props}>
        {children}
      </select>
    </label>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  label?: string;
  className?: string;
}) {
  return (
    <div className={cx("segmented", className)} role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Choice({
  selected,
  correct,
  wrong,
  label,
  detail,
  onClick,
  disabled,
  index,
}: {
  selected?: boolean;
  correct?: boolean;
  wrong?: boolean;
  label: React.ReactNode;
  detail?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  index?: number;
}) {
  return (
    <button
      type="button"
      className="choice"
      aria-pressed={!!selected}
      data-correct={correct ? "true" : undefined}
      data-wrong={wrong ? "true" : undefined}
      onClick={onClick}
      disabled={disabled}
    >
      {index !== undefined ? <span className="mono text-[11px] text-ink-3 pt-0.5 w-4 shrink-0">{String.fromCharCode(65 + index)}</span> : null}
      <span className="min-w-0">
        <span className="block text-[14px] text-ink">{label}</span>
        {detail ? <span className="block mt-1 text-[13px] text-ink-2">{detail}</span> : null}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Confidence dial: the signature calibration control                  */
/* ------------------------------------------------------------------ */

const STOPS = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99];

export function ConfidenceDial({
  value,
  onChange,
  label = "How sure are you?",
  allowUnknown,
  onUnknown,
  disabled,
  stops = STOPS,
}: {
  value: number | null; // 0..1
  onChange: (v: number) => void;
  label?: string;
  allowUnknown?: boolean;
  onUnknown?: () => void;
  disabled?: boolean;
  stops?: number[];
}) {
  const id = useId();
  const v = value === null ? null : Math.round(value * 100);
  return (
    <div className="border-t border-line pt-4">
      <div className="flex items-baseline justify-between mb-3">
        <label htmlFor={id} className="eyebrow">
          {label}
        </label>
        <span className="numeral text-[22px] text-ink" aria-live="polite">
          {v === null ? "—" : `${v}%`}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={stops[0]}
        max={stops[stops.length - 1]}
        step={1}
        value={v ?? stops[0]}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        disabled={disabled}
        className="w-full accent-[var(--ink)]"
        aria-valuetext={v === null ? "not set" : `${v} percent`}
      />
      <div className="flex justify-between mt-1">
        {stops
          .filter((s) => [50, 65, 80, 90, 99].includes(s) || stops.length <= 6)
          .map((s) => (
            <button
              key={s}
              type="button"
              className={cx("mono text-[11px] py-1 px-1 rounded-sm", v === s ? "text-ink" : "text-ink-3 hover:text-ink")}
              onClick={() => onChange(s / 100)}
              disabled={disabled}
            >
              {s}
            </button>
          ))}
      </div>
      {allowUnknown ? (
        <button type="button" className="mt-2 text-[12px] text-ink-3 underline underline-offset-4 hover:text-ink" onClick={onUnknown} disabled={disabled}>
          I don&apos;t know yet
        </button>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Timer                                                               */
/* ------------------------------------------------------------------ */

export function Countdown({ seconds, total, label }: { seconds: number; total: number; label?: string }) {
  const ratio = total > 0 ? Math.max(0, Math.min(1, seconds / total)) : 0;
  return (
    <div className="flex items-center gap-3" role="timer" aria-live="off" aria-label={label ?? "Time remaining"}>
      <span className="numeral text-[13px] text-ink-2 w-8 text-right">{Math.ceil(seconds)}s</span>
      <div className="hairline-progress w-40">
        <span style={{ width: `${ratio * 100}%` }} />
      </div>
    </div>
  );
}

export function HairlineProgress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cx("hairline-progress", className)} role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dialog                                                              */
/* ------------------------------------------------------------------ */

export function Dialog({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    else if (!open && d.open) d.close();
  }, [open]);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    d.addEventListener("cancel", onCancel);
    return () => d.removeEventListener("cancel", onCancel);
  }, [onClose]);
  return (
    <dialog
      ref={ref}
      className="study-dialog"
      style={wide ? { maxWidth: "min(94vw, 960px)" } : undefined}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-label={typeof title === "string" ? title : undefined}
    >
      <div className="p-6 md:p-8">
        {title ? (
          <div className="flex items-start justify-between gap-4 mb-5">
            <h2 className="display text-[24px]">{title}</h2>
            <button type="button" className="btn btn-ghost btn-sm -mr-2" onClick={onClose} aria-label="Close">
              <I.Close />
            </button>
          </div>
        ) : null}
        {children}
      </div>
    </dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Empty state                                                         */
/* ------------------------------------------------------------------ */

export function Empty({ title, body, action, className }: { title: React.ReactNode; body?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cx("py-14 px-6 text-center", className)}>
      <p className="serif text-[22px] text-ink leading-snug max-w-[34ch] mx-auto">{title}</p>
      {body ? <p className="mt-2 text-[14px] text-ink-3 max-w-[44ch] mx-auto">{body}</p> : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Misc                                                                */
/* ------------------------------------------------------------------ */

export function Divider({ className }: { className?: string }) {
  return <hr className={cx("my-6", className)} />;
}

export function Note({ children, tone = "neutral", className }: { children: React.ReactNode; tone?: "neutral" | "wine" | "brass" | "forest"; className?: string }) {
  const border = tone === "wine" ? "border-wine" : tone === "brass" ? "border-brass" : tone === "forest" ? "border-forest" : "border-line-2";
  return <div className={cx("border-l-2 pl-4 py-1 text-[14px] text-ink-2", border, className)}>{children}</div>;
}

export function Stat({ label, value, sub, className }: { label: string; value: React.ReactNode; sub?: React.ReactNode; className?: string }) {
  return (
    <div className={cx("min-w-0", className)}>
      <div className="eyebrow">{label}</div>
      <div className="numeral text-[24px] text-ink mt-1 leading-none">{value}</div>
      {sub ? <div className="text-[12px] text-ink-3 mt-1.5">{sub}</div> : null}
    </div>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-ink-3 text-[13px]" role="status">
      <span className="inline-block w-3 h-3 border border-ink-3 border-t-transparent rounded-full animate-spin" />
      {label}
    </div>
  );
}

export function useCountdown(total: number, running: boolean, onDone?: () => void) {
  const [left, setLeft] = React.useState(total);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  useEffect(() => {
    setLeft(total);
  }, [total]);
  useEffect(() => {
    if (!running) return;
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const elapsed = (performance.now() - start) / 1000;
      const remaining = Math.max(0, total - elapsed);
      setLeft(remaining);
      if (remaining <= 0) {
        doneRef.current?.();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, total]);
  return left;
}

export function useStopwatch(active: boolean) {
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    if (active) startRef.current = performance.now();
  }, [active]);
  return () => (startRef.current === null ? undefined : Math.round(performance.now() - startRef.current));
}
