"use client";

import { useEffect, useState } from "react";
import type { OpName, OpOutput } from "./schemas";

/**
 * Browser-side AI client. Every room checks `ok` and falls back to deterministic
 * evaluation when the provider is unconfigured or unavailable.
 */
export type AIResult<T> = { ok: true; data: T; model?: string } | { ok: false; reason: "unconfigured" | "model_error" | "network" | "bad_request" | "unknown_op"; message?: string };

export async function call<K extends OpName>(op: K, input: Record<string, unknown>): Promise<AIResult<OpOutput<K>>> {
  try {
    const res = await fetch(`/api/ai/${op}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ input }) });
    const json = (await res.json()) as AIResult<OpOutput<K>>;
    return json;
  } catch (e) {
    return { ok: false, reason: "network", message: e instanceof Error ? e.message : String(e) };
  }
}

export async function stream(op: "curatorRespond" | "continueSalonConversation", input: Record<string, unknown>, onChunk: (text: string, full: string) => void): Promise<AIResult<string>> {
  try {
    const res = await fetch(`/api/ai/${op}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ input, stream: true }) });
    const ct = res.headers.get("Content-Type") ?? "";
    if (ct.includes("application/json")) {
      const json = (await res.json()) as AIResult<string>;
      return json;
    }
    const reader = res.body?.getReader();
    if (!reader) return { ok: false, reason: "network" };
    const decoder = new TextDecoder();
    let full = "";
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      full += text;
      onChunk(text, full);
    }
    if (full.includes("[error:")) return { ok: false, reason: "model_error", message: full };
    return { ok: true, data: full };
  } catch (e) {
    return { ok: false, reason: "network", message: e instanceof Error ? e.message : String(e) };
  }
}

export interface AIStatus {
  configured: boolean;
  model: string | null;
  provider: string | null;
  loading: boolean;
}

let cached: Omit<AIStatus, "loading"> | null = null;
let inflight: Promise<Omit<AIStatus, "loading">> | null = null;

export async function getStatus(): Promise<Omit<AIStatus, "loading">> {
  if (cached) return cached;
  if (!inflight) {
    inflight = fetch("/api/ai/status")
      .then((r) => r.json())
      .then((j) => {
        cached = j as Omit<AIStatus, "loading">;
        return cached;
      })
      .catch(() => {
        cached = { configured: false, model: null, provider: null };
        return cached;
      });
  }
  return inflight;
}

export function useAIStatus(): AIStatus {
  const [s, setS] = useState<AIStatus>(cached ? { ...cached, loading: false } : { configured: false, model: null, provider: null, loading: true });
  useEffect(() => {
    let alive = true;
    getStatus().then((st) => alive && setS({ ...st, loading: false }));
    return () => {
      alive = false;
    };
  }, []);
  return s;
}

export const ai = { call, stream, getStatus };
