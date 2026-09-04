import type * as T from "@/lib/domain/types";

/**
 * Every persisted collection, mapped to its entity type.
 * Local mode stores each as an IndexedDB table; cloud mode maps to a Postgres table
 * with the same name in snake_case (see supabase/migrations).
 */
export interface CollectionMap {
  profiles: T.UserProfile;
  preferences: T.Preferences;
  skill_evidence: T.SkillEvidence;
  skill_estimates: T.SkillEstimate;
  error_events: T.ErrorEvent;
  confidence_entries: T.ConfidenceEntry;
  case_attempts: T.CaseAttempt;
  case_stage_attempts: T.CaseStageAttempt;
  observation_attempts: T.ObservationAttempt;
  inference_attempts: T.InferenceAttempt;
  salon_sessions: T.SalonSession;
  strategy_runs: T.StrategyRun;
  memory_items: T.MemoryItem;
  memory_reviews: T.MemoryReview;
  memory_palaces: T.MemoryPalace;
  archive_progress: T.ArchiveProgress;
  archive_notes: T.ArchiveNote;
  archive_user_connections: T.ArchiveConnection & T.Entity;
  curiosity_views: T.CuriosityView;
  reading_items: T.ReadingItem;
  rhetoric_entries: T.RhetoricEntry;
  voice_sessions: T.VoiceSession;
  decision_entries: T.DecisionEntry;
  forecasts: T.Forecast;
  field_reports: T.FieldReport;
  investigations: T.Investigation;
  red_threads: T.RedThread;
  after_actions: T.AfterAction;
  daily_sessions: T.DailySession;
  curator_conversations: T.CuratorConversation;
  notifications: T.Notification;
  milestones: T.Milestone;
  generated_content: T.GeneratedContent;
}

export type CollectionName = keyof CollectionMap;

export const COLLECTIONS: CollectionName[] = [
  "profiles",
  "preferences",
  "skill_evidence",
  "skill_estimates",
  "error_events",
  "confidence_entries",
  "case_attempts",
  "case_stage_attempts",
  "observation_attempts",
  "inference_attempts",
  "salon_sessions",
  "strategy_runs",
  "memory_items",
  "memory_reviews",
  "memory_palaces",
  "archive_progress",
  "archive_notes",
  "archive_user_connections",
  "curiosity_views",
  "reading_items",
  "rhetoric_entries",
  "voice_sessions",
  "decision_entries",
  "forecasts",
  "field_reports",
  "investigations",
  "red_threads",
  "after_actions",
  "daily_sessions",
  "curator_conversations",
  "notifications",
  "milestones",
  "generated_content",
];

/** Secondary indexes per collection for the local adapter (beyond id, userId, createdAt, updatedAt). */
export const LOCAL_INDEXES: Partial<Record<CollectionName, string[]>> = {
  skill_evidence: ["subskill", "faculty", "sessionId"],
  skill_estimates: ["subskill", "faculty"],
  error_events: ["type", "faculty"],
  confidence_entries: ["domain"],
  case_attempts: ["caseId", "status"],
  case_stage_attempts: ["attemptId", "caseId"],
  observation_attempts: ["mode", "exerciseId"],
  inference_attempts: ["mode", "challengeId"],
  salon_sessions: ["scenarioId", "status"],
  strategy_runs: ["scenarioId", "status"],
  memory_items: ["due", "kind", "palaceLocusId"],
  memory_reviews: ["itemId"],
  archive_progress: ["entryId", "status"],
  archive_notes: ["entryId"],
  archive_user_connections: ["from", "to"],
  curiosity_views: ["curiosityId"],
  reading_items: ["status"],
  rhetoric_entries: ["promptId", "mode"],
  decision_entries: ["status", "reviewDate"],
  forecasts: ["status", "resolutionDate", "category"],
  field_reports: ["assignmentId", "status"],
  investigations: ["status"],
  red_threads: ["status", "patternKey"],
  after_actions: [],
  daily_sessions: ["date", "status"],
  curator_conversations: ["mode"],
  notifications: ["read", "kind"],
  milestones: ["key"],
  generated_content: ["kind", "refId"],
};
