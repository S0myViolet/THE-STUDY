"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { StudyDatabase } from "./store";
import type { CollectionName } from "./collections";
import { changeBus } from "./events";
import { LocalDatabase } from "./local";
import { CloudDatabase, getSupabaseClient } from "./supabase";
import type { Preferences, UserProfile } from "@/lib/domain/types";
import { ensureProfile } from "@/lib/services/profile";

export interface StudyContextValue {
  db: StudyDatabase;
  profile: UserProfile;
  prefs: Preferences;
  refreshProfile: () => Promise<void>;
  mode: "local" | "cloud";
  signOut: () => Promise<void>;
}

const StudyContext = createContext<StudyContextValue | null>(null);

const LOCAL_USER_KEY = "the-study:local-user";

export function localUserId(): string {
  if (typeof window === "undefined") return "local";
  let id = window.localStorage.getItem(LOCAL_USER_KEY);
  if (!id) {
    id = "local_" + Math.random().toString(36).slice(2, 10);
    window.localStorage.setItem(LOCAL_USER_KEY, id);
  }
  return id;
}

export type StudyBoot =
  | { status: "loading" }
  | { status: "auth-required"; mode: "cloud" }
  | { status: "ready"; value: StudyContextValue }
  | { status: "error"; message: string };

/**
 * Boots the database: cloud when Supabase is configured and a session exists,
 * otherwise a fully functional local study in IndexedDB.
 */
export function useStudyBoot(): StudyBoot {
  const [boot, setBoot] = useState<StudyBoot>({ status: "loading" });

  const init = useCallback(async () => {
    try {
      const supa = getSupabaseClient();
      let db: StudyDatabase;
      let mode: "local" | "cloud" = "local";
      let signOut = async () => {};
      if (supa) {
        const { data } = await supa.auth.getSession();
        const forceLocal = typeof window !== "undefined" && window.localStorage.getItem("the-study:force-local") === "1";
        if (data.session && !forceLocal) {
          db = new CloudDatabase(supa, data.session.user.id);
          mode = "cloud";
          signOut = async () => {
            await supa.auth.signOut();
            window.location.href = "/enter";
          };
        } else if (!forceLocal) {
          setBoot({ status: "auth-required", mode: "cloud" });
          return;
        } else {
          db = new LocalDatabase(localUserId());
        }
      } else {
        db = new LocalDatabase(localUserId());
      }
      const { profile, prefs } = await ensureProfile(db);
      const value: StudyContextValue = {
        db,
        profile,
        prefs,
        mode,
        signOut,
        refreshProfile: async () => {
          const next = await ensureProfile(db);
          setBoot((b) => (b.status === "ready" ? { status: "ready", value: { ...b.value, profile: next.profile, prefs: next.prefs } } : b));
        },
      };
      setBoot({ status: "ready", value });
    } catch (e) {
      setBoot({ status: "error", message: e instanceof Error ? e.message : String(e) });
    }
  }, []);

  useEffect(() => {
    void init();
  }, [init]);

  // keep profile/prefs fresh when they change
  useEffect(() => {
    return changeBus.subscribe((c) => {
      if (c === "profiles" || c === "preferences") {
        setBoot((b) => {
          if (b.status !== "ready") return b;
          void b.value.refreshProfile();
          return b;
        });
      }
    });
  }, []);

  return boot;
}

export function StudyProvider({ value, children }: { value: StudyContextValue; children: React.ReactNode }) {
  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy(): StudyContextValue {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error("useStudy must be used inside StudyProvider");
  return ctx;
}

export function useDb(): StudyDatabase {
  return useStudy().db;
}

export interface QueryState<T> {
  data: T | undefined;
  loading: boolean;
  error?: string;
  refetch: () => void;
}

/**
 * Run an async query against the database and re-run it when any of the listed
 * collections change. Deps behave like useEffect deps.
 */
export function useStudyQuery<T>(
  fn: (db: StudyDatabase) => Promise<T>,
  collections: CollectionName[],
  deps: React.DependencyList = [],
): QueryState<T> {
  const { db } = useStudy();
  const [state, setState] = useState<{ data: T | undefined; loading: boolean; error?: string }>({ data: undefined, loading: true });
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const [tick, setTick] = useState(0);
  const collKey = collections.join("|");

  useEffect(() => {
    let cancelled = false;
    fnRef
      .current(db)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false });
      })
      .catch((e) => {
        if (!cancelled) setState((s) => ({ data: s.data, loading: false, error: e instanceof Error ? e.message : String(e) }));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, tick, ...deps]);

  useEffect(() => {
    const set = new Set(collKey.split("|").filter(Boolean));
    return changeBus.subscribe((c) => {
      if (set.has(c)) setTick((t) => t + 1);
    });
  }, [collKey]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  return useMemo(() => ({ ...state, refetch }), [state, refetch]);
}
