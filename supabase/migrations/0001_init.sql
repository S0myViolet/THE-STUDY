-- ============================================================================
-- THE STUDY — cloud schema, migration 0001 (initial)
-- ============================================================================
--
-- One table per persisted collection (src/lib/persistence/collections.ts),
-- named exactly as the collection. Columns are the snake_case form of every
-- field on the corresponding entity type (src/lib/domain/types.ts); the cloud
-- adapter (src/lib/persistence/supabase.ts) converts camelCase <-> snake_case
-- mechanically, so a column must exist for every field or writes fail.
--
-- Conventions
--   id          text primary key (client-generated, prefix_random)
--   user_id     uuid -> auth.users(id), cascade on delete
--   created_at  timestamptz, set by the client, default now()
--   updated_at  timestamptz, overwritten by trigger on every write
--   ISO dates   timestamptz          arrays / objects   jsonb
--   0..1 values numeric + CHECK      enums              text + CHECK
--
-- Ownership: row level security is enabled on every table and every policy is
-- `auth.uid() = user_id`. A signed-in user can only see and touch their own
-- rows; the anon key alone can read nothing.
--
-- How to apply
--   Option A (CLI):   supabase link --project-ref <ref>   then   supabase db push
--   Option B (web):   Supabase Dashboard -> SQL Editor -> paste this file -> Run
-- The file is idempotent enough to re-run on an empty project; it is not a
-- rollback script. See supabase/README.md for the full setup walk-through.
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- updated_at trigger
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- Users, preferences
-- ============================================================================

create table if not exists public.profiles (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  display_name text not null default '',
  goals jsonb not null default '[]'::jsonb,
  interests jsonb not null default '[]'::jsonb,
  onboarding_complete boolean not null default false,
  baseline_complete boolean not null default false,
  is_demo boolean not null default false,
  entered_at timestamptz,
  timezone text
);

create table if not exists public.preferences (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  session_length text not null default 'standard'
    check (session_length in ('quick', 'standard', 'deep', 'immersion', 'variable')),
  preferred_faculties jsonb not null default '[]'::jsonb,
  think_first boolean not null default false,
  pressure_default text not null default 'standard'
    check (pressure_default in ('none', 'standard', 'pressure')),
  fieldwork_enabled boolean not null default true,
  curiosities_enabled boolean not null default true,
  news_enabled boolean not null default false,
  appearance text not null default 'system'
    check (appearance in ('light', 'dark', 'system')),
  curator_depth text not null default 'standard'
    check (curator_depth in ('concise', 'standard', 'deep')),
  challenge_style text not null default 'neutral'
    check (challenge_style in ('supportive', 'neutral', 'demanding')),
  reduced_motion boolean not null default false,
  sound_enabled boolean not null default false
);

-- ============================================================================
-- Evidence, estimates, errors, confidence
-- ============================================================================

create table if not exists public.skill_evidence (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  subskill text not null,
  faculty text not null
    check (faculty in ('observation', 'inference', 'memory', 'strategy', 'social', 'knowledge',
                       'rhetoric', 'quantitative', 'calibration', 'composure', 'synthesis', 'curiosity')),
  score numeric not null check (score >= 0 and score <= 1),
  difficulty integer not null check (difficulty between 1 and 8),
  weight numeric not null default 1,
  format text not null
    check (format in ('mcq', 'free', 'numeric', 'sort', 'timed', 'delayed')),
  transfer boolean not null default false,
  source jsonb not null default '{}'::jsonb,
  latency_ms integer,
  confidence numeric check (confidence is null or (confidence >= 0 and confidence <= 1)),
  correct boolean,
  session_id text,
  note text
);

create table if not exists public.skill_estimates (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  subskill text not null,
  faculty text not null
    check (faculty in ('observation', 'inference', 'memory', 'strategy', 'social', 'knowledge',
                       'rhetoric', 'quantitative', 'calibration', 'composure', 'synthesis', 'curiosity')),
  value numeric not null check (value >= 0 and value <= 1),
  evidence_count integer not null default 0,
  evidence_mass numeric not null default 0,
  estimate_confidence numeric not null default 0
    check (estimate_confidence >= 0 and estimate_confidence <= 1),
  trend text not null default 'flat' check (trend in ('up', 'down', 'flat')),
  level text not null default 'untested'
    check (level in ('untested', 'emerging', 'reliable', 'sharp', 'advanced', 'exceptional')),
  last_evidence_at timestamptz,
  history jsonb not null default '[]'::jsonb
);

create table if not exists public.error_events (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  type text not null
    check (type in ('OBSERVATION_MISS', 'FALSE_OBSERVATION', 'PREMATURE_CLOSURE', 'BASE_RATE_NEGLECT',
                    'CONFIRMATION_BIAS', 'CAUSAL_ERROR', 'ASSUMPTION', 'MEMORY_FAILURE', 'CALCULATION',
                    'TIMELINE_ERROR', 'QUESTION_QUALITY', 'INFORMATION_VALUE', 'OVERCONFIDENCE',
                    'UNDERCONFIDENCE', 'STRATEGIC_SHORTSIGHTEDNESS', 'MISREAD', 'PRECISION',
                    'TRANSFER_FAILURE', 'NUMERIC_DETAIL_LOSS', 'LEADING_QUESTION', 'INSUFFICIENT_UPDATE',
                    'OVER_UPDATE', 'SPATIAL_MISS', 'CHRONOLOGY_LOSS', 'ALTERNATIVE_NEGLECT', 'VERBOSITY')),
  faculty text not null
    check (faculty in ('observation', 'inference', 'memory', 'strategy', 'social', 'knowledge',
                       'rhetoric', 'quantitative', 'calibration', 'composure', 'synthesis', 'curiosity')),
  subskill text,
  source jsonb not null default '{}'::jsonb,
  detail text not null default '',
  session_id text
);

create table if not exists public.confidence_entries (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  confidence numeric not null check (confidence >= 0 and confidence <= 1),
  correct boolean not null,
  domain text not null
    check (domain in ('observation', 'inference', 'memory', 'strategy', 'social', 'knowledge',
                      'rhetoric', 'quantitative', 'calibration', 'composure', 'synthesis', 'curiosity')),
  source jsonb not null default '{}'::jsonb,
  latency_ms integer,
  session_id text
);

-- ============================================================================
-- Cases
-- ============================================================================

create table if not exists public.case_attempts (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  case_id text not null,
  status text not null default 'active'
    check (status in ('active', 'completed', 'abandoned')),
  current_stage_index integer not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  session_id text,
  summary jsonb,
  -- lets child rows reference (id, user_id) so a stage can never belong to another user's attempt
  unique (id, user_id)
);

create table if not exists public.case_stage_attempts (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  attempt_id text not null,
  case_id text not null,
  stage_id text not null,
  stage_kind text not null
    check (stage_kind in ('enter', 'notice', 'recall', 'separate', 'hypotheses', 'question',
                          'evidence', 'update', 'decision', 'explain', 'debrief')),
  response jsonb not null default '{}'::jsonb,
  score numeric check (score is null or (score >= 0 and score <= 1)),
  latency_ms integer,
  evaluation jsonb,
  foreign key (attempt_id, user_id) references public.case_attempts (id, user_id) on delete cascade
);

-- ============================================================================
-- Observation, inference
-- ============================================================================

create table if not exists public.observation_attempts (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  mode text not null
    check (mode in ('glance', 'room_scan', 'change', 'chronology', 'document', 'signal_noise',
                    'missing', 'observation_or_story')),
  exercise_id text not null,
  exposure_seconds numeric,
  pressure text not null default 'standard'
    check (pressure in ('none', 'standard', 'pressure')),
  coverage numeric check (coverage is null or (coverage >= 0 and coverage <= 1)),
  precision numeric check (precision is null or (precision >= 0 and precision <= 1)),
  correct integer not null default 0,
  total integer not null default 0,
  false_claims integer not null default 0,
  latency_ms integer,
  details jsonb not null default '{}'::jsonb,
  session_id text
);

create table if not exists public.inference_attempts (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  mode text not null
    check (mode in ('three_stories', 'best_explanation', 'missing_variable', 'base_rate',
                    'counterfactual', 'disconfirm', 'anomaly', 'how_sure', 'information_value',
                    'ladder', 'fast_slow')),
  challenge_id text not null,
  response jsonb not null default '{}'::jsonb,
  score numeric check (score is null or (score >= 0 and score <= 1)),
  confidence numeric check (confidence is null or (confidence >= 0 and confidence <= 1)),
  correct boolean,
  latency_ms integer,
  evaluation jsonb,
  session_id text
);

-- ============================================================================
-- Salon, strategy
-- ============================================================================

create table if not exists public.salon_sessions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  scenario_id text not null,
  status text not null default 'active' check (status in ('active', 'completed')),
  turns jsonb not null default '[]'::jsonb,
  rapport numeric not null default 0.5 check (rapport >= 0 and rapport <= 1),
  revealed_facts jsonb not null default '[]'::jsonb,
  objectives_met jsonb not null default '[]'::jsonb,
  review jsonb,
  session_id text,
  completed_at timestamptz
);

create table if not exists public.strategy_runs (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  scenario_id text not null,
  status text not null default 'active' check (status in ('active', 'completed')),
  path jsonb not null default '[]'::jsonb,
  current_node_id text not null,
  score numeric check (score is null or (score >= 0 and score <= 1)),
  debrief text,
  session_id text,
  completed_at timestamptz
);

-- ============================================================================
-- Memory
-- ============================================================================

create table if not exists public.memory_items (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  kind text not null
    check (kind in ('fact', 'concept', 'person', 'sequence', 'story', 'spatial', 'reconstruction', 'archive')),
  prompt text not null,
  answer text not null,
  accept jsonb,
  hint text,
  person jsonb,
  sequence jsonb,
  source_ref jsonb,
  palace_locus_id text,
  ease numeric not null default 2.5,
  interval_days numeric not null default 0,
  due timestamptz not null,
  reps integer not null default 0,
  lapses integer not null default 0,
  last_reviewed_at timestamptz,
  suspended boolean,
  tags jsonb,
  unique (id, user_id)
);

create table if not exists public.memory_reviews (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  item_id text not null,
  grade integer not null check (grade between 0 and 5),
  correct boolean not null,
  confidence numeric check (confidence is null or (confidence >= 0 and confidence <= 1)),
  latency_ms integer,
  interval_before numeric not null default 0,
  interval_after numeric not null default 0,
  session_id text,
  foreign key (item_id, user_id) references public.memory_items (id, user_id) on delete cascade
);

create table if not exists public.memory_palaces (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  description text,
  loci jsonb not null default '[]'::jsonb
);

-- ============================================================================
-- Archive
-- ============================================================================

create table if not exists public.archive_progress (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  entry_id text not null,
  status text not null default 'unread'
    check (status in ('unread', 'read', 'understood', 'retained')),
  read_at timestamptz,
  explained_at timestamptz,
  explanation text,
  explanation_score numeric
    check (explanation_score is null or (explanation_score >= 0 and explanation_score <= 1)),
  memory_item_ids jsonb not null default '[]'::jsonb,
  times_used integer not null default 0
);

create table if not exists public.archive_notes (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  entry_id text not null,
  text text not null default ''
);

-- "from" and "to" are reserved words in SQL; the adapter quotes identifiers so
-- the entity fields keep their names.
create table if not exists public.archive_user_connections (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  "from" text not null,
  "to" text not null,
  relation text not null
    check (relation in ('CAUSED', 'INFLUENCED', 'PRECEDED', 'CONTRASTS_WITH', 'LOCATED_IN',
                        'CREATED_BY', 'DEPENDS_ON', 'RESPONDED_TO', 'EXAMPLE_OF', 'RELATED_TO')),
  note text
);

create table if not exists public.curiosity_views (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  curiosity_id text not null,
  connected_to jsonb not null default '[]'::jsonb,
  note text
);

-- ============================================================================
-- Reading
-- ============================================================================

create table if not exists public.reading_items (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  kind text not null check (kind in ('book', 'article', 'paper', 'essay', 'report')),
  title text not null,
  author text,
  status text not null default 'up_next'
    check (status in ('reading', 'up_next', 'finished', 'reference')),
  why text,
  question text,
  key_idea text,
  argument text,
  evidence text,
  surprise text,
  disagreement text,
  connections jsonb not null default '[]'::jsonb,
  unresolved text,
  reconstruction text,
  reconstruction_at timestamptz,
  finished_at timestamptz
);

-- ============================================================================
-- Rhetoric, voice
-- ============================================================================

create table if not exists public.rhetoric_entries (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  prompt_id text not null,
  mode text not null
    check (mode in ('one_sentence', 'thirty_seconds', 'three_people', 'story', 'anecdote', 'analogy',
                    'argument', 'steelman', 'precision', 'question', 'impromptu')),
  text text not null default '',
  word_count integer not null default 0,
  latency_ms integer,
  feedback jsonb,
  audio_note text,
  session_id text
);

create table if not exists public.voice_sessions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  prompt_id text,
  duration_ms integer not null default 0,
  transcript text,
  metrics jsonb
);

-- ============================================================================
-- Decisions, forecasts
-- ============================================================================

create table if not exists public.decision_entries (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  options jsonb not null default '[]'::jsonb,
  chosen text,
  current_belief text not null default '',
  expected_outcome text not null default '',
  confidence numeric not null check (confidence >= 0 and confidence <= 1),
  assumptions jsonb not null default '[]'::jsonb,
  change_mind text not null default '',
  risks jsonb not null default '[]'::jsonb,
  review_date timestamptz not null,
  status text not null default 'open' check (status in ('open', 'reviewed')),
  review jsonb
);

create table if not exists public.forecasts (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  question text not null,
  probability numeric not null check (probability >= 0 and probability <= 1),
  reasoning text not null default '',
  evidence text not null default '',
  change_mind text not null default '',
  resolution_date timestamptz not null,
  category text not null default 'other'
    check (category in ('personal', 'economics', 'technology', 'politics', 'sports', 'business', 'other')),
  status text not null default 'open' check (status in ('open', 'resolved')),
  resolved_at timestamptz,
  outcome boolean,
  brier numeric check (brier is null or (brier >= 0 and brier <= 1)),
  history jsonb not null default '[]'::jsonb
);

-- ============================================================================
-- Fieldwork, investigations
-- ============================================================================

create table if not exists public.field_reports (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  assignment_id text not null,
  status text not null default 'assigned'
    check (status in ('assigned', 'completed', 'skipped')),
  assigned_at timestamptz,
  completed_at timestamptz,
  responses jsonb not null default '{}'::jsonb,
  reflection text
);

create table if not exists public.investigations (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  question text not null default '',
  why_it_matters text not null default '',
  threads jsonb not null default '[]'::jsonb,
  sources jsonb not null default '[]'::jsonb,
  claims jsonb not null default '[]'::jsonb,
  counterclaims jsonb not null default '[]'::jsonb,
  notes jsonb not null default '[]'::jsonb,
  archive_connections jsonb not null default '[]'::jsonb,
  open_questions jsonb not null default '[]'::jsonb,
  position text,
  synthesis text,
  status text not null default 'open'
    check (status in ('open', 'synthesised', 'archived')),
  template_id text
);

-- ============================================================================
-- Red thread, after action
-- ============================================================================

-- evidence_ids / counter_evidence_ids stay jsonb arrays of ids (no FK): a thread
-- outlives the individual evidence rows it was built from.
create table if not exists public.red_threads (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  pattern_type text not null
    check (pattern_type in ('observation', 'reasoning', 'memory', 'confidence', 'conversational',
                            'strategic', 'knowledge', 'writing')),
  pattern_key text not null,
  title text not null,
  description text not null default '',
  evidence_ids jsonb not null default '[]'::jsonb,
  counter_evidence_ids jsonb not null default '[]'::jsonb,
  strength numeric not null default 0 check (strength >= 0 and strength <= 1),
  confidence text not null default 'low'
    check (confidence in ('low', 'emerging', 'moderate', 'strong')),
  status text not null default 'candidate'
    check (status in ('candidate', 'emerging', 'established', 'improving', 'resolved')),
  first_detected timestamptz not null,
  last_reinforced timestamptz not null,
  next_test text not null default '',
  target_subskill text,
  sessions_observed jsonb not null default '[]'::jsonb,
  resolved_at timestamptz
);

create table if not exists public.after_actions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source jsonb not null default '{}'::jsonb,
  title text not null,
  saw jsonb not null default '[]'::jsonb,
  missed jsonb not null default '[]'::jsonb,
  assumed jsonb not null default '[]'::jsonb,
  did_well jsonb not null default '[]'::jsonb,
  turning_point text,
  one_thing text not null default '',
  reasoning_path jsonb,
  score numeric check (score is null or (score >= 0 and score <= 1)),
  session_id text
);

-- ============================================================================
-- Sessions, curator
-- ============================================================================

create table if not exists public.daily_sessions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  date date not null,
  length text not null default 'standard'
    check (length in ('quick', 'standard', 'deep', 'immersion', 'variable')),
  items jsonb not null default '[]'::jsonb,
  status text not null default 'planned'
    check (status in ('planned', 'active', 'completed')),
  started_at timestamptz,
  completed_at timestamptz,
  current_index integer not null default 0
);

create table if not exists public.curator_conversations (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null default '',
  mode text not null
    check (mode in ('observe', 'reason', 'question', 'teach', 'challenge', 'debate', 'strategize',
                    'review', 'explore', 'remember')),
  messages jsonb not null default '[]'::jsonb,
  context_ref jsonb,
  independent_attempts integer not null default 0
);

-- ============================================================================
-- Notifications, milestones, generated content
-- ============================================================================

create table if not exists public.notifications (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  kind text not null
    check (kind in ('memory_due', 'forecast_resolvable', 'decision_review', 'thread_detected',
                    'thread_improved', 'connection_discovered', 'investigation_reminder', 'milestone')),
  title text not null,
  body text not null default '',
  href text,
  read boolean not null default false
);

create table if not exists public.milestones (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  key text not null,
  title text not null,
  description text not null default '',
  reached_at timestamptz not null
);

create table if not exists public.generated_content (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  kind text not null
    check (kind in ('case', 'salon', 'strategy', 'archive', 'curiosity', 'rhetoric')),
  ref_id text not null,
  payload jsonb,
  model text
);

-- ============================================================================
-- Secondary indexes (mirror LOCAL_INDEXES in collections.ts). Every query is
-- scoped by user_id first, so each index leads with it.
-- ============================================================================

create index if not exists skill_evidence_subskill_idx on public.skill_evidence (user_id, subskill);
create index if not exists skill_evidence_faculty_idx on public.skill_evidence (user_id, faculty);
create index if not exists skill_evidence_session_id_idx on public.skill_evidence (user_id, session_id);

create index if not exists skill_estimates_subskill_idx on public.skill_estimates (user_id, subskill);
create index if not exists skill_estimates_faculty_idx on public.skill_estimates (user_id, faculty);

create index if not exists error_events_type_idx on public.error_events (user_id, type);
create index if not exists error_events_faculty_idx on public.error_events (user_id, faculty);

create index if not exists confidence_entries_domain_idx on public.confidence_entries (user_id, domain);

create index if not exists case_attempts_case_id_idx on public.case_attempts (user_id, case_id);
create index if not exists case_attempts_status_idx on public.case_attempts (user_id, status);

create index if not exists case_stage_attempts_attempt_id_idx on public.case_stage_attempts (user_id, attempt_id);
create index if not exists case_stage_attempts_case_id_idx on public.case_stage_attempts (user_id, case_id);

create index if not exists observation_attempts_mode_idx on public.observation_attempts (user_id, mode);
create index if not exists observation_attempts_exercise_id_idx on public.observation_attempts (user_id, exercise_id);

create index if not exists inference_attempts_mode_idx on public.inference_attempts (user_id, mode);
create index if not exists inference_attempts_challenge_id_idx on public.inference_attempts (user_id, challenge_id);

create index if not exists salon_sessions_scenario_id_idx on public.salon_sessions (user_id, scenario_id);
create index if not exists salon_sessions_status_idx on public.salon_sessions (user_id, status);

create index if not exists strategy_runs_scenario_id_idx on public.strategy_runs (user_id, scenario_id);
create index if not exists strategy_runs_status_idx on public.strategy_runs (user_id, status);

create index if not exists memory_items_due_idx on public.memory_items (user_id, due);
create index if not exists memory_items_kind_idx on public.memory_items (user_id, kind);
create index if not exists memory_items_palace_locus_id_idx on public.memory_items (user_id, palace_locus_id);

create index if not exists memory_reviews_item_id_idx on public.memory_reviews (user_id, item_id);

create index if not exists archive_progress_entry_id_idx on public.archive_progress (user_id, entry_id);
create index if not exists archive_progress_status_idx on public.archive_progress (user_id, status);

create index if not exists archive_notes_entry_id_idx on public.archive_notes (user_id, entry_id);

create index if not exists archive_user_connections_from_idx on public.archive_user_connections (user_id, "from");
create index if not exists archive_user_connections_to_idx on public.archive_user_connections (user_id, "to");

create index if not exists curiosity_views_curiosity_id_idx on public.curiosity_views (user_id, curiosity_id);

create index if not exists reading_items_status_idx on public.reading_items (user_id, status);

create index if not exists rhetoric_entries_prompt_id_idx on public.rhetoric_entries (user_id, prompt_id);
create index if not exists rhetoric_entries_mode_idx on public.rhetoric_entries (user_id, mode);

create index if not exists decision_entries_status_idx on public.decision_entries (user_id, status);
create index if not exists decision_entries_review_date_idx on public.decision_entries (user_id, review_date);

create index if not exists forecasts_status_idx on public.forecasts (user_id, status);
create index if not exists forecasts_resolution_date_idx on public.forecasts (user_id, resolution_date);
create index if not exists forecasts_category_idx on public.forecasts (user_id, category);

create index if not exists field_reports_assignment_id_idx on public.field_reports (user_id, assignment_id);
create index if not exists field_reports_status_idx on public.field_reports (user_id, status);

create index if not exists investigations_status_idx on public.investigations (user_id, status);

create index if not exists red_threads_status_idx on public.red_threads (user_id, status);
create index if not exists red_threads_pattern_key_idx on public.red_threads (user_id, pattern_key);

create index if not exists daily_sessions_date_idx on public.daily_sessions (user_id, date);
create index if not exists daily_sessions_status_idx on public.daily_sessions (user_id, status);

create index if not exists curator_conversations_mode_idx on public.curator_conversations (user_id, mode);

create index if not exists notifications_read_idx on public.notifications (user_id, read);
create index if not exists notifications_kind_idx on public.notifications (user_id, kind);

create index if not exists milestones_key_idx on public.milestones (user_id, key);

create index if not exists generated_content_kind_idx on public.generated_content (user_id, kind);
create index if not exists generated_content_ref_id_idx on public.generated_content (user_id, ref_id);

-- ============================================================================
-- Per-table: (user_id, created_at) index, updated_at trigger, row level security
-- ============================================================================

do $$
declare
  t text;
  tables text[] := array[
    'profiles', 'preferences',
    'skill_evidence', 'skill_estimates', 'error_events', 'confidence_entries',
    'case_attempts', 'case_stage_attempts',
    'observation_attempts', 'inference_attempts',
    'salon_sessions', 'strategy_runs',
    'memory_items', 'memory_reviews', 'memory_palaces',
    'archive_progress', 'archive_notes', 'archive_user_connections', 'curiosity_views',
    'reading_items', 'rhetoric_entries', 'voice_sessions',
    'decision_entries', 'forecasts',
    'field_reports', 'investigations',
    'red_threads', 'after_actions',
    'daily_sessions', 'curator_conversations',
    'notifications', 'milestones', 'generated_content'
  ];
begin
  foreach t in array tables loop
    -- default listing order
    execute format('create index if not exists %I on public.%I (user_id, created_at)', t || '_user_created_idx', t);

    -- updated_at is server-authoritative
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before insert or update on public.%I for each row execute function public.set_updated_at()', t);

    -- ownership: a row is visible and writable only to the user who owns it
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists %I on public.%I', t || '_select_own', t);
    execute format('create policy %I on public.%I for select to authenticated using (auth.uid() = user_id)', t || '_select_own', t);

    execute format('drop policy if exists %I on public.%I', t || '_insert_own', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (auth.uid() = user_id)', t || '_insert_own', t);

    execute format('drop policy if exists %I on public.%I', t || '_update_own', t);
    execute format('create policy %I on public.%I for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)', t || '_update_own', t);

    execute format('drop policy if exists %I on public.%I', t || '_delete_own', t);
    execute format('create policy %I on public.%I for delete to authenticated using (auth.uid() = user_id)', t || '_delete_own', t);
  end loop;
end
$$;

commit;
