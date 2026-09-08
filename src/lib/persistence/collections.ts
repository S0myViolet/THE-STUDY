import type * as T from "@/lib/domain/types";
import type * as V2 from "@/lib/v2/types";

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
  /* ---------------- V2 ---------------- */
  concept_mastery: V2.ConceptMastery;
  concept_evidence: V2.ConceptEvidence;
  lesson_sessions: V2.LessonSession;
  practice_attempts: V2.PracticeAttempt;
  error_records: V2.ErrorRecord;
  retrieval_items: V2.RetrievalItem;
  retrieval_reviews: V2.RetrievalReview;
  library_sources: V2.LibrarySource;
  reading_sessions: V2.ReadingSession;
  reading_recalls: V2.ReadingRecall;
  knowledge_nodes: V2.KnowledgeNode;
  knowledge_edges: V2.KnowledgeEdge;
  writing_entries: V2.WritingEntry;
  writing_versions: V2.WritingVersion;
  writing_feedback: V2.WritingFeedback;
  speaking_sessions: V2.SpeakingSession;
  projects: V2.Project;
  exam_attempts: V2.ExamAttempt;
  daily_plans: V2.DailyPlan;
  study_logs: V2.StudyLog;
  tutor_conversations: V2.TutorConversation;
  assistance_events: V2.AssistanceEvent;
  applications: V2.ApplicationRecord;
  generated_v2: V2.GeneratedV2;
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
  // V2
  "concept_mastery",
  "concept_evidence",
  "lesson_sessions",
  "practice_attempts",
  "error_records",
  "retrieval_items",
  "retrieval_reviews",
  "library_sources",
  "reading_sessions",
  "reading_recalls",
  "knowledge_nodes",
  "knowledge_edges",
  "writing_entries",
  "writing_versions",
  "writing_feedback",
  "speaking_sessions",
  "projects",
  "exam_attempts",
  "daily_plans",
  "study_logs",
  "tutor_conversations",
  "assistance_events",
  "applications",
  "generated_v2",
];

/** V2 collections, for migration and export grouping. */
export const V2_COLLECTIONS: CollectionName[] = COLLECTIONS.slice(COLLECTIONS.indexOf("concept_mastery"));

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
  // V2
  concept_mastery: ["conceptId", "state"],
  concept_evidence: ["conceptId", "kind"],
  lesson_sessions: ["lessonId", "status"],
  practice_attempts: ["itemId", "skill", "context"],
  error_records: ["category", "recurrenceKey"],
  retrieval_items: ["due", "mode", "conceptId"],
  retrieval_reviews: ["itemId", "conceptId"],
  library_sources: ["status", "type"],
  reading_sessions: ["sourceId", "status"],
  reading_recalls: ["sourceId"],
  knowledge_nodes: ["key", "kind"],
  knowledge_edges: ["from", "to"],
  writing_entries: ["status", "level"],
  writing_versions: ["entryId"],
  writing_feedback: ["entryId"],
  speaking_sessions: ["promptId", "mode"],
  projects: ["status", "kind"],
  exam_attempts: ["blueprintId", "kind", "status"],
  daily_plans: ["date", "status"],
  study_logs: ["date", "kind"],
  tutor_conversations: ["mode"],
  assistance_events: ["kind"],
  applications: ["kind"],
  generated_v2: ["kind", "refId"],
};
