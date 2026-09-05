"use client";

import React, { useState } from "react";
import { isCloudConfigured, signInWithMagicLink, signInWithPassword, signUpWithPassword } from "@/lib/persistence/auth";
import { Button, Field } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import { cx } from "@/lib/util/format";

type Mode = "signin" | "signup" | "link";

/**
 * Cloud sign-in. Rendered by the gate when Supabase is configured and there is
 * no session, and from the entrance when the user chooses to sync. Local mode
 * never requires this.
 */
export function AuthScreen({ onBack, embedded }: { onBack?: () => void; embedded?: boolean }) {
  const configured = isCloudConfigured();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "bad"; text: string } | null>(null);

  function continueLocally() {
    try {
      localStorage.setItem("the-study:force-local", "1");
    } catch {}
    window.location.href = "/enter";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage(null);
    try {
      if (mode === "signin") {
        const r = await signInWithPassword(email, password);
        if (!r.ok) setMessage({ tone: "bad", text: r.error ?? "Something went wrong." });
        else {
          try {
            localStorage.removeItem("the-study:force-local");
          } catch {}
          window.location.href = "/enter";
        }
      } else if (mode === "signup") {
        const r = await signUpWithPassword(email, password);
        if (!r.ok) setMessage({ tone: "bad", text: r.error ?? "Something went wrong." });
        else if (r.needsEmailConfirmation) setMessage({ tone: "ok", text: "Check your inbox. The confirmation link brings you back here." });
        else {
          try {
            localStorage.removeItem("the-study:force-local");
          } catch {}
          window.location.href = "/enter";
        }
      } else {
        const r = await signInWithMagicLink(email);
        if (!r.ok) setMessage({ tone: "bad", text: r.error ?? "Something went wrong." });
        else setMessage({ tone: "ok", text: "A sign-in link is on its way. It brings you back here." });
      }
    } finally {
      setBusy(false);
    }
  }

  const body = (
    <div className="w-full max-w-sm">
      <div className="eyebrow">The Study</div>
      <h1 className="display text-[30px] mt-2 text-ink">{configured ? "Your study, on every device" : "Cloud sync is not configured"}</h1>
      {configured ? (
        <>
          <div className="segmented mt-6" role="tablist" aria-label="Sign-in method">
            {(
              [
                ["signin", "Sign in"],
                ["signup", "Create account"],
                ["link", "Email a link"],
              ] as [Mode, string][]
            ).map(([m, label]) => (
              <button key={m} type="button" role="tab" aria-selected={mode === m} aria-pressed={mode === m} onClick={() => setMode(m)}>
                {label}
              </button>
            ))}
          </div>
          <form className="mt-6 space-y-4" onSubmit={submit}>
            <Field label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            {mode !== "link" ? <Field label="Password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} hint={mode === "signup" ? "At least eight characters." : undefined} /> : null}
            {message ? <p className={cx("text-[13px]", message.tone === "ok" ? "text-forest" : "text-wine")}>{message.text}</p> : null}
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "One moment" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create the account" : "Send the link"}
            </Button>
          </form>
        </>
      ) : (
        <p className="mt-4 text-[14px] text-ink-2">
          Set <span className="mono">NEXT_PUBLIC_SUPABASE_URL</span> and <span className="mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</span> to enable accounts. Until then the Study lives entirely on this device.
        </p>
      )}
      <div className="mt-8 flex items-center justify-between text-[12px] text-ink-3">
        {onBack ? (
          <button type="button" className="inline-flex items-center gap-1 hover:text-ink" onClick={onBack}>
            <I.ArrowLeft size={12} /> Back
          </button>
        ) : (
          <span />
        )}
        <button type="button" className="hover:text-ink underline-offset-2 hover:underline" onClick={continueLocally}>
          Continue on this device only
        </button>
      </div>
    </div>
  );

  if (embedded) return body;
  return <div className="min-h-dvh flex items-center justify-center p-6 paper-texture">{body}</div>;
}
