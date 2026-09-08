import type { StudyDatabase } from "@/lib/persistence/store";
import { stamp } from "@/lib/persistence/store";
import type { Entity, Preferences, UserProfile } from "@/lib/domain/types";

/** Every preference with a value, V1 and V2 alike. */
export type PreferenceDefaults = Required<Omit<Preferences, keyof Entity>>;

/** Multiplier applied to every timed exposure to material when the person has not chosen one. */
export const DEFAULT_READING_PACE = 2;

export const DEFAULT_PREFS: PreferenceDefaults = {
  sessionLength: "standard",
  preferredFaculties: [],
  thinkFirst: true,
  pressureDefault: "standard",
  fieldworkEnabled: true,
  curiositiesEnabled: true,
  newsEnabled: false,
  appearance: "system",
  curatorDepth: "standard",
  challengeStyle: "demanding",
  reducedMotion: false,
  soundEnabled: false,
  /* ---- V2 ---- */
  planMode: "standard",
  customMinutes: 60,
  lessonDepth: "standard",
  readingPace: DEFAULT_READING_PACE,
};

/** Preference keys introduced with V2 (migration 0002). A cloud schema without 0002 has no columns for them. */
const V2_PREF_KEYS = ["planMode", "customMinutes", "lessonDepth", "readingPace"] as const satisfies readonly (keyof PreferenceDefaults)[];

type PrefKey = keyof PreferenceDefaults;

/** The subset of DEFAULT_PREFS whose keys are absent (undefined) on `prefs`. */
function missingPreferenceKeys(prefs: Preferences): Partial<PreferenceDefaults> {
  const patch: Partial<PreferenceDefaults> = {};
  for (const key of Object.keys(DEFAULT_PREFS) as PrefKey[]) {
    if (prefs[key] === undefined) (patch as Record<string, unknown>)[key] = DEFAULT_PREFS[key];
  }
  return patch;
}

function withoutV2Keys(prefs: Preferences): Preferences {
  const copy: Record<string, unknown> = { ...prefs };
  for (const key of V2_PREF_KEYS) delete copy[key];
  return copy as unknown as Preferences;
}

/**
 * Loads (or creates) the profile and preferences rows and back-fills any
 * preference key that a row written by an earlier version lacks.
 *
 * The back-fill is written through so later reads see it, but a failed write
 * is not fatal: a cloud project that has 0001 applied but not 0002 has no
 * columns for the V2 preferences, and the app must still boot there with the
 * defaults held in memory.
 */
export async function ensureProfile(db: StudyDatabase): Promise<{ profile: UserProfile; prefs: Preferences }> {
  const profiles = db.store("profiles");
  let profile = (await profiles.list({ limit: 1 }))[0];
  if (!profile) {
    profile = stamp<UserProfile>(db.userId, "profile", {
      displayName: "",
      goals: [],
      interests: [],
      onboardingComplete: false,
      baselineComplete: false,
      isDemo: false,
      enteredAt: new Date().toISOString(),
      timezone: typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined,
    });
    await profiles.put(profile);
  }

  const prefStore = db.store("preferences");
  let prefs = (await prefStore.list({ limit: 1 }))[0];
  if (!prefs) {
    prefs = stamp<Preferences>(db.userId, "prefs", DEFAULT_PREFS);
    try {
      await prefStore.put(prefs);
    } catch (firstError) {
      // Schema without the V2 columns: persist the V1 shape, keep the V2 defaults in memory.
      const v1 = withoutV2Keys(prefs);
      try {
        await prefStore.put(v1);
      } catch {
        throw firstError;
      }
      prefs = { ...v1, ...missingPreferenceKeys(v1) };
    }
    return { profile, prefs };
  }

  const patch = missingPreferenceKeys(prefs);
  if (Object.keys(patch).length) {
    try {
      prefs = (await prefStore.update(prefs.id, patch)) ?? { ...prefs, ...patch };
    } catch {
      prefs = { ...prefs, ...patch };
    }
  }
  return { profile, prefs };
}

export async function updateProfile(db: StudyDatabase, patch: Partial<UserProfile>): Promise<UserProfile> {
  const { profile } = await ensureProfile(db);
  return (await db.store("profiles").update(profile.id, patch)) ?? profile;
}

export async function updatePrefs(db: StudyDatabase, patch: Partial<Preferences>): Promise<Preferences> {
  const { prefs } = await ensureProfile(db);
  return (await db.store("preferences").update(prefs.id, patch)) ?? prefs;
}

/* ------------------------------------------------------------------ */
/* Reading pace                                                          */
/* ------------------------------------------------------------------ */

/**
 * The person's reading pace: a multiplier on every timed exposure to material
 * (memory study in the baseline, timed passages, transfer cases). Defaults to 2,
 * so every exposure is doubled unless they have chosen otherwise.
 */
export function readingPaceOf(prefs: Pick<Preferences, "readingPace"> | null | undefined): number {
  const pace = prefs?.readingPace;
  return typeof pace === "number" && Number.isFinite(pace) && pace > 0 ? pace : DEFAULT_READING_PACE;
}

/** Seconds of exposure after the pace is applied, rounded to whole seconds (never below zero). */
export function paced(seconds: number, pace: number = DEFAULT_READING_PACE): number {
  const p = Number.isFinite(pace) && pace > 0 ? pace : DEFAULT_READING_PACE;
  const s = Number.isFinite(seconds) ? seconds : 0;
  return Math.max(0, Math.round(s * p));
}
