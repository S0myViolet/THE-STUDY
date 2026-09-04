import type { StudyDatabase } from "@/lib/persistence/store";
import { stamp } from "@/lib/persistence/store";
import type { Preferences, UserProfile } from "@/lib/domain/types";

export const DEFAULT_PREFS: Omit<Preferences, "id" | "userId" | "createdAt" | "updatedAt"> = {
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
};

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
    await prefStore.put(prefs);
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
