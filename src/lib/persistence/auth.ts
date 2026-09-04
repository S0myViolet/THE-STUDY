"use client";

import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { getSupabaseClient, supabaseConfig } from "./supabase";

/**
 * Authentication helpers for cloud mode.
 *
 * Thin wrappers over `@supabase/supabase-js` auth that never throw and always
 * return `{ ok, error? }`. When Supabase is not configured every call is a
 * quiet no-op with a clear reason, so screens can offer cloud sign-in without
 * ever assuming a network or credentials (local mode remains fully functional).
 */

export const AUTH_UNCONFIGURED =
  "Cloud sign-in is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY; until then THE STUDY keeps everything on this device.";

export interface AuthResult {
  ok: boolean;
  error?: string;
}

export interface SignInResult extends AuthResult {
  userId?: string;
  session?: Session | null;
}

export interface SignUpResult extends AuthResult {
  userId?: string;
  session?: Session | null;
  /** True when the project requires the user to confirm their email before a session exists. */
  needsEmailConfirmation?: boolean;
}

export interface SessionResult extends AuthResult {
  session: Session | null;
  userId?: string;
}

export interface AuthSubscription extends AuthResult {
  unsubscribe: () => void;
}

export type AuthListener = (event: AuthChangeEvent, session: Session | null) => void;

/** True when the environment carries Supabase credentials (cloud mode is possible). */
export function isCloudConfigured(): boolean {
  return supabaseConfig() !== null;
}

function unconfigured(): AuthResult {
  return { ok: false, error: AUTH_UNCONFIGURED };
}

function message(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "object" && e && "message" in e && typeof (e as { message: unknown }).message === "string")
    return (e as { message: string }).message;
  return String(e);
}

/** Default landing page after magic-link and confirmation redirects. */
function defaultRedirect(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}/enter`;
}

/** Sign in with email and password. */
export async function signInWithPassword(email: string, password: string): Promise<SignInResult> {
  const client = getSupabaseClient();
  if (!client) return unconfigured();
  try {
    const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { ok: false, error: error.message };
    return { ok: true, userId: data.user?.id, session: data.session };
  } catch (e) {
    return { ok: false, error: message(e) };
  }
}

/**
 * Create an account with email and password. Depending on project settings the
 * user may need to confirm their email before a session exists; in that case
 * `needsEmailConfirmation` is true and `session` is null.
 */
export async function signUpWithPassword(
  email: string,
  password: string,
  opts: { emailRedirectTo?: string; displayName?: string } = {},
): Promise<SignUpResult> {
  const client = getSupabaseClient();
  if (!client) return unconfigured();
  try {
    const { data, error } = await client.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: opts.emailRedirectTo ?? defaultRedirect(),
        data: opts.displayName ? { display_name: opts.displayName } : undefined,
      },
    });
    if (error) return { ok: false, error: error.message };
    return {
      ok: true,
      userId: data.user?.id,
      session: data.session,
      needsEmailConfirmation: !data.session,
    };
  } catch (e) {
    return { ok: false, error: message(e) };
  }
}

/** Send a one-time sign-in link to the address. Creates the account if it does not exist. */
export async function signInWithMagicLink(
  email: string,
  opts: { emailRedirectTo?: string; createUser?: boolean } = {},
): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) return unconfigured();
  try {
    const { error } = await client.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: opts.emailRedirectTo ?? defaultRedirect(),
        shouldCreateUser: opts.createUser ?? true,
      },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: message(e) };
  }
}

/** End the current session. Local data on the device is untouched. */
export async function signOut(): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) return unconfigured();
  try {
    const { error } = await client.auth.signOut();
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: message(e) };
  }
}

/** The current session, if any. `ok: true` with `session: null` means signed out. */
export async function getSession(): Promise<SessionResult> {
  const client = getSupabaseClient();
  if (!client) return { ...unconfigured(), session: null };
  try {
    const { data, error } = await client.auth.getSession();
    if (error) return { ok: false, error: error.message, session: null };
    return { ok: true, session: data.session, userId: data.session?.user.id };
  } catch (e) {
    return { ok: false, error: message(e), session: null };
  }
}

/**
 * Subscribe to auth changes (sign in, sign out, token refresh). Returns an
 * `unsubscribe` function; when unconfigured the listener is never called and
 * `unsubscribe` is a no-op.
 */
export function onAuthStateChange(listener: AuthListener): AuthSubscription {
  const client = getSupabaseClient();
  if (!client) return { ...unconfigured(), unsubscribe: () => {} };
  try {
    const { data } = client.auth.onAuthStateChange((event, session) => listener(event, session));
    return { ok: true, unsubscribe: () => data.subscription.unsubscribe() };
  } catch (e) {
    return { ok: false, error: message(e), unsubscribe: () => {} };
  }
}

export const auth = {
  isCloudConfigured,
  signInWithPassword,
  signUpWithPassword,
  signInWithMagicLink,
  signOut,
  getSession,
  onAuthStateChange,
};
