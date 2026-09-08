/**
 * THE STUDY V2 — profile helpers: the onboarding gate, completing the entrance,
 * the plan mode a daily budget implies, and where the person is in the first month.
 */
import type { Goal, Interest, Preferences, UserProfile } from "@/lib/domain/types";
import type { StudyDatabase } from "@/lib/persistence/store";
import { nowIso } from "@/lib/persistence/store";
import { updatePrefs, updateProfile } from "@/lib/services/profile";
import { hasV1Data, importV1 } from "./migrate-v1";
import { PLAN_MODE_MINUTES, type DevelopGoal, type EducationLevel, type InterestId, type PlanMode, type ProfileV2 } from "./types";

/** A person needs the V2 entrance until `profile.v2.onboardingComplete` is true. The V1 flag alone is not enough. */
export function needsV2Onboarding(profile: Pick<UserProfile, "v2"> | null | undefined): boolean {
  return profile?.v2?.onboardingComplete !== true;
}

export interface CompleteV2OnboardingInput {
  displayName?: string;
  goals: DevelopGoal[];
  interests: InterestId[];
  educationLevel?: EducationLevel;
  dailyMinutes: number;
  baselineAttemptId?: string;
  baselineSkipped?: boolean;
}

export interface CompleteV2OnboardingResult {
  profile: UserProfile;
  /** Present when V1 data existed and the import ran. */
  imported?: { retrievalItems: number };
}

/** V2 goals expressed in V1 terms, so the archived rooms still read a sensible profile. */
const V1_GOAL_FOR: Record<DevelopGoal, Goal> = {
  knowledge: "knowledge",
  reasoning: "thinking",
  quantitative: "thinking",
  communication: "expression",
  strategy: "strategy",
  memory: "memory",
  complete: "everything",
};

const V1_INTERESTS = new Set<Interest>(["history", "economics", "psychology", "art", "science", "technology", "business", "geopolitics", "literature", "architecture", "food", "travel", "philosophy", "music", "other"]);

function v1GoalsFrom(goals: DevelopGoal[]): Goal[] {
  const out: Goal[] = [];
  for (const g of goals) {
    const v1 = V1_GOAL_FOR[g];
    if (v1 && !out.includes(v1)) out.push(v1);
  }
  return out;
}

function v1InterestsFrom(interests: InterestId[]): Interest[] {
  const out: Interest[] = [];
  for (const i of interests) if (V1_INTERESTS.has(i as Interest) && !out.includes(i as Interest)) out.push(i as Interest);
  return out;
}

function uniq<T>(xs: T[]): T[] {
  return Array.from(new Set(xs));
}

/**
 * Finishes the V2 entrance: writes `profile.v2` (keeping `startedAt` and
 * `v1ImportedAt` from an earlier pass), marks both the V2 and the V1
 * onboarding flags complete, fills empty V1 goals/interests from the V2
 * answers, sets the default plan mode from the daily budget, and imports V1
 * memory items when V1 data exists.
 */
export async function completeV2Onboarding(db: StudyDatabase, profile: UserProfile, input: CompleteV2OnboardingInput): Promise<CompleteV2OnboardingResult> {
  const now = nowIso();
  const dailyMinutes = sanitiseMinutes(input.dailyMinutes);
  const previous = profile.v2;
  const v2: ProfileV2 = {
    goals: uniq(input.goals),
    interests: uniq(input.interests),
    dailyMinutes,
    onboardingComplete: true,
    startedAt: previous?.startedAt ?? now,
  };
  if (input.educationLevel) v2.educationLevel = input.educationLevel;
  if (input.baselineAttemptId) v2.baselineAttemptId = input.baselineAttemptId;
  else if (previous?.baselineAttemptId) v2.baselineAttemptId = previous.baselineAttemptId;
  if (input.baselineSkipped !== undefined) v2.baselineSkipped = input.baselineSkipped;
  else if (previous?.baselineSkipped !== undefined) v2.baselineSkipped = previous.baselineSkipped;
  if (previous?.v1ImportedAt) v2.v1ImportedAt = previous.v1ImportedAt;

  const patch: Partial<UserProfile> = { v2, onboardingComplete: true };
  const displayName = input.displayName?.trim();
  if (displayName) patch.displayName = displayName;
  if (!profile.enteredAt) patch.enteredAt = now;
  if (!profile.goals?.length) patch.goals = v1GoalsFrom(v2.goals);
  if (!profile.interests?.length) patch.interests = v1InterestsFrom(v2.interests);
  if (v2.baselineAttemptId && !profile.baselineComplete) patch.baselineComplete = true;

  let updated = await updateProfile(db, patch);

  const planMode = recommendedPlanMode(dailyMinutes);
  try {
    await updatePrefs(db, planMode === "custom" ? { planMode, customMinutes: dailyMinutes } : { planMode });
  } catch {
    // A cloud schema without 0002 has no plan_mode column; the entrance still completes.
  }

  let imported: { retrievalItems: number } | undefined;
  if (await hasV1Data(db)) {
    imported = await importV1(db, updated);
    updated = (await db.store("profiles").get(updated.id)) ?? updated;
  }
  return { profile: updated, imported };
}

function sanitiseMinutes(minutes: number): number {
  if (!Number.isFinite(minutes) || minutes <= 0) return PLAN_MODE_MINUTES.standard;
  return Math.round(minutes);
}

/** A preset is recommended when the budget is within this many minutes of it; otherwise the mode is custom. */
export const PLAN_MODE_TOLERANCE_MINUTES = 15;

/** The plan mode a daily budget implies: the nearest preset within tolerance, else "custom". */
export function recommendedPlanMode(dailyMinutes: number): PlanMode {
  const minutes = sanitiseMinutes(dailyMinutes);
  let best: { mode: PlanMode; distance: number } | undefined;
  for (const [mode, preset] of Object.entries(PLAN_MODE_MINUTES) as [Exclude<PlanMode, "custom">, number][]) {
    const distance = Math.abs(minutes - preset);
    if (!best || distance < best.distance) best = { mode, distance };
  }
  return best && best.distance <= PLAN_MODE_TOLERANCE_MINUTES ? best.mode : "custom";
}

/** Minutes the profile's daily budget resolves to, honouring a custom preference first. */
export function dailyMinutesOf(profile: Pick<UserProfile, "v2"> | null | undefined, prefs?: Pick<Preferences, "planMode" | "customMinutes"> | null): number {
  if (prefs?.planMode === "custom" && prefs.customMinutes && prefs.customMinutes > 0) return Math.round(prefs.customMinutes);
  if (prefs?.planMode && prefs.planMode !== "custom") return PLAN_MODE_MINUTES[prefs.planMode];
  const v2 = profile?.v2?.dailyMinutes;
  return typeof v2 === "number" && v2 > 0 ? Math.round(v2) : PLAN_MODE_MINUTES.standard;
}

const DAY_MS = 86_400_000;

/**
 * Which week of the first month the person is in (1..4), counted from
 * `profile.v2.startedAt`; undefined before the entrance or after day 28.
 */
export function firstMonthWeek(profile: Pick<UserProfile, "v2"> | null | undefined, now: Date = new Date()): 1 | 2 | 3 | 4 | undefined {
  const startedAt = profile?.v2?.startedAt;
  if (!startedAt) return undefined;
  const start = new Date(startedAt).getTime();
  if (!Number.isFinite(start)) return undefined;
  const day = Math.floor((now.getTime() - start) / DAY_MS);
  if (day < 0) return 1;
  if (day >= 28) return undefined;
  return (Math.floor(day / 7) + 1) as 1 | 2 | 3 | 4;
}
