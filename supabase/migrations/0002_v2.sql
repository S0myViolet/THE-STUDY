-- ============================================================================
-- THE STUDY — cloud schema, migration 0002 (V2: LEARN / TRAIN / BUILD / PROVE / REVIEW)
-- ============================================================================
--
-- Adds one table per V2 collection (src/lib/persistence/collections.ts,
-- everything from `concept_mastery` onwards), the `profiles.v2` column and the
-- four V2 preference columns. Column names are the snake_case form of every
-- field on the entity types in src/lib/v2/types.ts; the cloud adapter
-- (src/lib/persistence/supabase.ts) maps camelCase <-> snake_case
-- mechanically, so a column must exist for every field or writes fail.
--
-- Conventions (same as 0001_init.sql)
--   id          text primary key (client-generated, prefix_random)
--   user_id     uuid -> auth.users(id), cascade on delete
--   created_at  timestamptz, set by the client, default now()
--   updated_at  timestamptz, overwritten by trigger on every write
--   ISO dates   timestamptz          YYYY-MM-DD dates   date
--   arrays / nested objects / unknown values   jsonb
--   whole counts (reps, retries, versions, word counts, difficulty, level)   integer
--   measures that may be fractional (scores, minutes, milliseconds, days)   double precision
--   0..1 values carry a CHECK; enums are text + CHECK mirroring the union type.
--
-- Ownership: row level security on every table, every policy
-- `auth.uid() = user_id`, exactly as in 0001.
--
-- Idempotent: every statement is `create table if not exists`,
-- `add column if not exists`, `create index if not exists` or a drop-then-create
-- of a policy/trigger, so the file can be re-run on a project that already has
-- it. It depends on 0001_init.sql (auth users, profiles, preferences, the
-- set_updated_at function, which is re-created here defensively).
-- ============================================================================

begin;

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
-- Profile and preferences: V2 fields
-- ============================================================================

-- ProfileV2 { goals, interests, educationLevel, dailyMinutes, onboardingComplete,
--             baselineAttemptId, baselineSkipped, startedAt, v1ImportedAt }
alter table public.profiles add column if not exists v2 jsonb;

alter table public.preferences add column if not exists plan_mode text
  check (plan_mode is null or plan_mode in ('minimum', 'standard', 'deep', 'custom'));
alter table public.preferences add column if not exists custom_minutes integer
  check (custom_minutes is null or custom_minutes > 0);
alter table public.preferences add column if not exists lesson_depth text
  check (lesson_depth is null or lesson_depth in ('intuition', 'standard', 'deep', 'technical'));
alter table public.preferences add column if not exists reading_pace double precision not null default 2
  check (reading_pace > 0);

-- ============================================================================
-- Concept mastery and evidence
-- ============================================================================

create table if not exists public.concept_mastery (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  concept_id text not null,
  state text not null default 'not_started'
    check (state in ('not_started', 'exposed', 'understood', 'practicing', 'retained', 'applied', 'durable', 'fragile')),
  estimate double precision not null default 0 check (estimate >= 0 and estimate <= 1),
  evidence_confidence text not null default 'low'
    check (evidence_confidence in ('low', 'medium', 'high')),
  evidence_mass double precision not null default 0 check (evidence_mass >= 0),
  evidence_count integer not null default 0 check (evidence_count >= 0),
  counts jsonb not null default '{}'::jsonb,
  successes jsonb not null default '{}'::jsonb,
  first_exposed_at timestamptz,
  last_evidence_at timestamptz,
  last_success_at timestamptz,
  last_delayed_success_at timestamptz,
  longest_successful_delay_days double precision not null default 0 check (longest_successful_delay_days >= 0),
  consecutive_failures integer not null default 0 check (consecutive_failures >= 0),
  trend text not null default 'flat' check (trend in ('up', 'down', 'flat')),
  history jsonb not null default '[]'::jsonb
);

create table if not exists public.concept_evidence (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  concept_id text not null,
  kind text not null
    check (kind in ('recognition', 'checkpoint', 'recall', 'guided', 'explain', 'independent',
                    'delayed', 'application', 'project', 'transfer', 'exam')),
  score double precision not null check (score >= 0 and score <= 1),
  correct boolean,
  difficulty integer not null check (difficulty between 1 and 8),
  scaffolded boolean not null default false,
  hints_used integer not null default 0 check (hints_used >= 0),
  delay_days double precision not null default 0 check (delay_days >= 0),
  transfer integer not null default 0 check (transfer between 0 and 3),
  confidence double precision check (confidence is null or (confidence >= 0 and confidence <= 1)),
  weight double precision not null default 1 check (weight >= 0),
  independent boolean not null default false,
  latency_ms double precision check (latency_ms is null or latency_ms >= 0),
  source jsonb not null default '{}'::jsonb,
  plan_item_id text
);

-- ============================================================================
-- Lessons
-- ============================================================================

create table if not exists public.lesson_sessions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  lesson_id text not null,
  concept_ids jsonb not null default '[]'::jsonb,
  depth text not null default 'standard'
    check (depth in ('intuition', 'standard', 'deep', 'technical')),
  step_index integer not null default 0 check (step_index >= 0),
  status text not null default 'active'
    check (status in ('active', 'completed', 'abandoned')),
  responses jsonb not null default '{}'::jsonb,
  checkpoint_score double precision check (checkpoint_score is null or (checkpoint_score >= 0 and checkpoint_score <= 1)),
  explain_back jsonb,
  transfer_score double precision check (transfer_score is null or (transfer_score >= 0 and transfer_score <= 1)),
  started_at timestamptz not null,
  completed_at timestamptz,
  minutes double precision not null default 0 check (minutes >= 0),
  plan_item_id text
);

-- ============================================================================
-- Practice and errors
-- ============================================================================

create table if not exists public.practice_attempts (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  item_id text not null,
  skill text not null
    check (skill in ('mathematics', 'probability', 'statistics', 'logic', 'causal_reasoning', 'decision_making',
                     'argument_analysis', 'writing', 'speaking', 'memory', 'research', 'programming',
                     'questioning', 'strategic_reasoning', 'knowledge', 'reading')),
  subskill text not null default '',
  concepts jsonb not null default '[]'::jsonb,
  level text not null
    check (level in ('foundation', 'basic', 'intermediate', 'advanced', 'transfer', 'synthesis')),
  difficulty integer not null check (difficulty between 1 and 8),
  format text not null
    check (format in ('numeric', 'mcq', 'multi_select', 'short', 'true_false', 'ordering', 'free')),
  -- the learner's response: number, index, indexes, text or ordering — any JSON value
  response jsonb,
  correct boolean,
  score double precision not null check (score >= 0 and score <= 1),
  confidence double precision check (confidence is null or (confidence >= 0 and confidence <= 1)),
  hints_used integer not null default 0 check (hints_used >= 0),
  solution_revealed boolean not null default false,
  retries integer not null default 0 check (retries >= 0),
  time_ms double precision not null default 0 check (time_ms >= 0),
  error_category text
    check (error_category is null or error_category in (
      'KNOWLEDGE_GAP', 'CONCEPTUAL_ERROR', 'ALGEBRA_ERROR', 'LOGIC_ERROR', 'CAUSAL_ERROR', 'BASE_RATE_NEGLECT',
      'STATISTICAL_ERROR', 'MISREAD', 'ASSUMPTION', 'OVERCONFIDENCE', 'UNDERCONFIDENCE', 'EVIDENCE_ERROR',
      'PRECISION_ERROR', 'TRANSFER_FAILURE')),
  evaluation jsonb,
  context text not null
    check (context in ('train', 'lesson', 'exam', 'baseline', 'remediation', 'transfer', 'retrieval')),
  context_ref text,
  plan_item_id text
);

create table if not exists public.error_records (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  category text not null
    check (category in (
      'KNOWLEDGE_GAP', 'CONCEPTUAL_ERROR', 'ALGEBRA_ERROR', 'LOGIC_ERROR', 'CAUSAL_ERROR', 'BASE_RATE_NEGLECT',
      'STATISTICAL_ERROR', 'MISREAD', 'ASSUMPTION', 'OVERCONFIDENCE', 'UNDERCONFIDENCE', 'EVIDENCE_ERROR',
      'PRECISION_ERROR', 'TRANSFER_FAILURE')),
  skill text not null
    check (skill in ('mathematics', 'probability', 'statistics', 'logic', 'causal_reasoning', 'decision_making',
                     'argument_analysis', 'writing', 'speaking', 'memory', 'research', 'programming',
                     'questioning', 'strategic_reasoning', 'knowledge', 'reading')),
  concepts jsonb not null default '[]'::jsonb,
  question text not null default '',
  response text not null default '',
  correct_reasoning text not null default '',
  confidence double precision check (confidence is null or (confidence >= 0 and confidence <= 1)),
  source jsonb not null default '{}'::jsonb,
  recurrence_key text not null,
  remediated_at timestamptz
);

-- ============================================================================
-- Retrieval (memory)
-- ============================================================================

create table if not exists public.retrieval_items (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  mode text not null
    check (mode in ('fact', 'concept', 'free_recall', 'process', 'compare', 'application', 'explanation', 'connection')),
  prompt text not null,
  answer text not null default '',
  accept jsonb,
  key_points jsonb,
  concept_id text,
  node_id text,
  source jsonb not null default '{}'::jsonb,
  ease double precision not null default 2.5 check (ease > 0),
  interval_days double precision not null default 0 check (interval_days >= 0),
  due timestamptz not null,
  reps integer not null default 0 check (reps >= 0),
  lapses integer not null default 0 check (lapses >= 0),
  stage integer not null default 0 check (stage between 0 and 4),
  last_reviewed_at timestamptz,
  suspended boolean,
  encoding text,
  tags jsonb,
  unique (id, user_id)
);

create table if not exists public.retrieval_reviews (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  item_id text not null,
  concept_id text,
  grade integer not null check (grade between 0 and 5),
  correct boolean not null,
  score double precision not null check (score >= 0 and score <= 1),
  confidence double precision check (confidence is null or (confidence >= 0 and confidence <= 1)),
  latency_ms double precision check (latency_ms is null or latency_ms >= 0),
  mode text not null
    check (mode in ('fact', 'concept', 'free_recall', 'process', 'compare', 'application', 'explanation', 'connection')),
  interval_before double precision not null default 0 check (interval_before >= 0),
  interval_after double precision not null default 0 check (interval_after >= 0),
  delay_days double precision not null default 0 check (delay_days >= 0),
  response text,
  plan_item_id text,
  foreign key (item_id, user_id) references public.retrieval_items (id, user_id) on delete cascade
);

-- ============================================================================
-- Library and reading
-- ============================================================================

create table if not exists public.library_sources (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  type text not null
    check (type in ('book', 'paper', 'article', 'report', 'lecture', 'reference')),
  title text not null,
  author text,
  year integer,
  status text not null default 'queue'
    check (status in ('queue', 'reading', 'completed', 'reference')),
  why text,
  current_question text,
  concepts jsonb not null default '[]'::jsonb,
  project_ids jsonb not null default '[]'::jsonb,
  seed_id text,
  unit_label text not null default 'chapter'
    check (unit_label in ('chapter', 'section', 'page')),
  total_units integer check (total_units is null or total_units >= 0),
  progress_unit integer check (progress_unit is null or progress_unit >= 0),
  comprehension double precision check (comprehension is null or (comprehension >= 0 and comprehension <= 1)),
  retention double precision check (retention is null or (retention >= 0 and retention <= 1)),
  connections_count integer not null default 0 check (connections_count >= 0),
  started_at timestamptz,
  completed_at timestamptz,
  notes text,
  unique (id, user_id)
);

create table if not exists public.reading_sessions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source_id text not null,
  question text,
  from_unit integer,
  to_unit integer,
  minutes double precision not null default 0 check (minutes >= 0),
  started_at timestamptz not null,
  ended_at timestamptz,
  status text not null default 'open'
    check (status in ('open', 'closed')),
  recall_id text,
  plan_item_id text,
  foreign key (source_id, user_id) references public.library_sources (id, user_id) on delete cascade
);

create table if not exists public.reading_recalls (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source_id text not null,
  session_id text not null,
  central_ideas text not null default '',
  argument text not null default '',
  evidence text not null default '',
  unclear text not null default '',
  disagree text not null default '',
  connections text not null default '',
  extracted jsonb not null default '[]'::jsonb,
  score double precision check (score is null or (score >= 0 and score <= 1)),
  feedback text,
  ai_evaluated boolean not null default false,
  retrieval_item_ids jsonb not null default '[]'::jsonb,
  foreign key (source_id, user_id) references public.library_sources (id, user_id) on delete cascade
);

-- ============================================================================
-- Knowledge graph (user additions)
-- ============================================================================

create table if not exists public.knowledge_nodes (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  key text not null,
  kind text not null
    check (kind in ('concept', 'person', 'place', 'event', 'institution', 'book', 'theory', 'technology', 'movement')),
  title text not null,
  domain_id text
    check (domain_id is null or domain_id in (
      'mathematics', 'probability', 'statistics', 'logic', 'causal_reasoning', 'decision_science', 'economics',
      'history', 'geography', 'psychology', 'philosophy', 'science', 'computer_science', 'ai', 'business',
      'finance', 'politics', 'law', 'art', 'literature', 'culture', 'communication')),
  summary text not null default '',
  concept_id text,
  source jsonb,
  year integer,
  tags jsonb
);

create table if not exists public.knowledge_edges (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  "from" text not null,
  "to" text not null,
  relation text not null
    check (relation in ('CAUSES', 'INFLUENCED', 'PRECEDED', 'DEPENDS_ON', 'CONTRASTS_WITH', 'LOCATED_IN',
                        'PART_OF', 'EXAMPLE_OF', 'RESPONDED_TO', 'CREATED_BY', 'RELATED_TO')),
  note text,
  origin text not null default 'user'
    check (origin in ('user', 'ai', 'reading', 'project'))
);

-- ============================================================================
-- Writing and speaking
-- ============================================================================

create table if not exists public.writing_entries (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  prompt_id text,
  level integer not null check (level between 1 and 7),
  title text not null default '',
  prompt text not null default '',
  status text not null default 'draft'
    check (status in ('draft', 'submitted', 'reviewed')),
  current_version integer not null default 0 check (current_version >= 0),
  concepts jsonb not null default '[]'::jsonb,
  word_count integer not null default 0 check (word_count >= 0),
  latest_feedback_id text,
  context_ref jsonb,
  time_ms double precision not null default 0 check (time_ms >= 0),
  plan_item_id text,
  unique (id, user_id)
);

create table if not exists public.writing_versions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  entry_id text not null,
  version integer not null check (version >= 0),
  text text not null default '',
  word_count integer not null default 0 check (word_count >= 0),
  foreign key (entry_id, user_id) references public.writing_entries (id, user_id) on delete cascade
);

create table if not exists public.writing_feedback (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  entry_id text not null,
  version integer not null check (version >= 0),
  scores jsonb not null default '{}'::jsonb,
  overall double precision not null check (overall >= 0 and overall <= 1),
  passages jsonb not null default '[]'::jsonb,
  strengths jsonb not null default '[]'::jsonb,
  improvements jsonb not null default '[]'::jsonb,
  metrics jsonb not null default '{}'::jsonb,
  ai_evaluated boolean not null default false,
  foreign key (entry_id, user_id) references public.writing_entries (id, user_id) on delete cascade
);

create table if not exists public.speaking_sessions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  prompt_id text not null,
  mode text not null
    check (mode in ('explain_60', 'explain_180', 'impromptu', 'debate', 'story', 'analogy', 'argument', 'questioning')),
  duration_ms double precision not null default 0 check (duration_ms >= 0),
  transcript text,
  transcript_source text
    check (transcript_source is null or transcript_source in ('typed', 'browser', 'model')),
  metrics jsonb not null default '{}'::jsonb,
  rubric_scores jsonb,
  overall double precision check (overall is null or (overall >= 0 and overall <= 1)),
  feedback text,
  ai_evaluated boolean not null default false,
  recorded boolean not null default false,
  concepts jsonb not null default '[]'::jsonb,
  plan_item_id text
);

-- ============================================================================
-- Build: projects
-- ============================================================================

create table if not exists public.projects (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  kind text not null
    check (kind in ('investigation', 'model', 'essay', 'software', 'explanation', 'analysis', 'presentation')),
  title text not null,
  question text not null default '',
  why_it_matters text not null default '',
  what_i_think_now text not null default '',
  required_concepts jsonb not null default '[]'::jsonb,
  applied_concepts jsonb not null default '[]'::jsonb,
  sources jsonb not null default '[]'::jsonb,
  notes jsonb not null default '[]'::jsonb,
  claims jsonb not null default '[]'::jsonb,
  evidence jsonb not null default '[]'::jsonb,
  counterarguments jsonb not null default '[]'::jsonb,
  open_questions jsonb not null default '[]'::jsonb,
  milestones jsonb not null default '[]'::jsonb,
  final_output text,
  retrospective jsonb,
  status text not null default 'open'
    check (status in ('open', 'completed', 'archived')),
  template_id text,
  started_at timestamptz not null,
  completed_at timestamptz
);

-- ============================================================================
-- Prove: exams (the form is frozen before the learner answers)
-- ============================================================================

create table if not exists public.exam_attempts (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  blueprint_id text not null,
  kind text not null
    check (kind in ('weekly', 'monthly', 'quarterly', 'baseline', 'transfer')),
  title text not null default '',
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed', 'abandoned')),
  started_at timestamptz not null,
  completed_at timestamptz,
  time_limit_minutes integer not null default 0 check (time_limit_minutes >= 0),
  form jsonb not null default '{}'::jsonb,
  responses jsonb not null default '{}'::jsonb,
  section_index integer not null default 0 check (section_index >= 0),
  result jsonb,
  plan_item_id text
);

-- ============================================================================
-- Today: plans and time
-- ============================================================================

create table if not exists public.daily_plans (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  date date not null,
  mode text not null default 'standard'
    check (mode in ('minimum', 'standard', 'deep', 'custom')),
  minutes double precision not null default 0 check (minutes >= 0),
  items jsonb not null default '[]'::jsonb,
  narrative text,
  signals jsonb not null default '{}'::jsonb,
  status text not null default 'planned'
    check (status in ('planned', 'active', 'completed')),
  started_at timestamptz,
  completed_at timestamptz
);

create table if not exists public.study_logs (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  date date not null,
  kind text not null
    check (kind in ('learn', 'train', 'recall', 'read', 'create', 'project', 'prove', 'remediate',
                    'transfer', 'explore', 'write', 'speak', 'other')),
  ref_id text,
  minutes double precision not null default 0 check (minutes >= 0),
  plan_item_id text
);

-- ============================================================================
-- Curator (tutor) and assistance
-- ============================================================================

create table if not exists public.tutor_conversations (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null default '',
  mode text not null default 'teach'
    check (mode in ('teach', 'socratic', 'practice', 'critique', 'debate', 'research', 'review', 'plan', 'explain')),
  messages jsonb not null default '[]'::jsonb,
  context_ref jsonb,
  concept_ids jsonb not null default '[]'::jsonb,
  independent_attempts integer not null default 0 check (independent_attempts >= 0),
  direct_answer_requests integer not null default 0 check (direct_answer_requests >= 0)
);

create table if not exists public.assistance_events (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  kind text not null
    check (kind in ('independent_attempt', 'hint', 'solution_reveal', 'direct_answer', 'revision')),
  source jsonb not null default '{}'::jsonb,
  concept_ids jsonb
);

-- ============================================================================
-- Real-world application
-- ============================================================================

create table if not exists public.applications (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  kind text not null
    check (kind in ('explained_to_someone', 'real_prediction', 'analysed_article', 'wrote_analysis',
                    'researched_history', 'used_in_project', 'recognised_mechanism', 'other')),
  title text not null,
  description text not null default '',
  concept_ids jsonb not null default '[]'::jsonb,
  reflection text,
  self_rating double precision check (self_rating is null or (self_rating >= 0 and self_rating <= 1))
);

-- ============================================================================
-- Generated content (model output validated and persisted)
-- ============================================================================

create table if not exists public.generated_v2 (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  kind text not null
    check (kind in ('lesson', 'item', 'exam_item', 'transfer', 'writing_prompt', 'speaking_prompt')),
  ref_id text not null,
  payload jsonb not null default '{}'::jsonb,
  model text,
  concept_ids jsonb not null default '[]'::jsonb
);

-- ============================================================================
-- Indexes mirroring LOCAL_INDEXES for the V2 collections
-- ============================================================================

create index if not exists concept_mastery_concept_id_idx on public.concept_mastery (user_id, concept_id);
create index if not exists concept_mastery_state_idx on public.concept_mastery (user_id, state);

create index if not exists concept_evidence_concept_id_idx on public.concept_evidence (user_id, concept_id);
create index if not exists concept_evidence_kind_idx on public.concept_evidence (user_id, kind);

create index if not exists lesson_sessions_lesson_id_idx on public.lesson_sessions (user_id, lesson_id);
create index if not exists lesson_sessions_status_idx on public.lesson_sessions (user_id, status);

create index if not exists practice_attempts_item_id_idx on public.practice_attempts (user_id, item_id);
create index if not exists practice_attempts_skill_idx on public.practice_attempts (user_id, skill);
create index if not exists practice_attempts_context_idx on public.practice_attempts (user_id, context);

create index if not exists error_records_category_idx on public.error_records (user_id, category);
create index if not exists error_records_recurrence_key_idx on public.error_records (user_id, recurrence_key);

create index if not exists retrieval_items_due_idx on public.retrieval_items (user_id, due);
create index if not exists retrieval_items_mode_idx on public.retrieval_items (user_id, mode);
create index if not exists retrieval_items_concept_id_idx on public.retrieval_items (user_id, concept_id);

create index if not exists retrieval_reviews_item_id_idx on public.retrieval_reviews (user_id, item_id);
create index if not exists retrieval_reviews_concept_id_idx on public.retrieval_reviews (user_id, concept_id);

create index if not exists library_sources_status_idx on public.library_sources (user_id, status);
create index if not exists library_sources_type_idx on public.library_sources (user_id, type);

create index if not exists reading_sessions_source_id_idx on public.reading_sessions (user_id, source_id);
create index if not exists reading_sessions_status_idx on public.reading_sessions (user_id, status);

create index if not exists reading_recalls_source_id_idx on public.reading_recalls (user_id, source_id);

create index if not exists knowledge_nodes_key_idx on public.knowledge_nodes (user_id, key);
create index if not exists knowledge_nodes_kind_idx on public.knowledge_nodes (user_id, kind);

create index if not exists knowledge_edges_from_idx on public.knowledge_edges (user_id, "from");
create index if not exists knowledge_edges_to_idx on public.knowledge_edges (user_id, "to");

create index if not exists writing_entries_status_idx on public.writing_entries (user_id, status);
create index if not exists writing_entries_level_idx on public.writing_entries (user_id, level);

create index if not exists writing_versions_entry_id_idx on public.writing_versions (user_id, entry_id);

create index if not exists writing_feedback_entry_id_idx on public.writing_feedback (user_id, entry_id);

create index if not exists speaking_sessions_prompt_id_idx on public.speaking_sessions (user_id, prompt_id);
create index if not exists speaking_sessions_mode_idx on public.speaking_sessions (user_id, mode);

create index if not exists projects_status_idx on public.projects (user_id, status);
create index if not exists projects_kind_idx on public.projects (user_id, kind);

create index if not exists exam_attempts_blueprint_id_idx on public.exam_attempts (user_id, blueprint_id);
create index if not exists exam_attempts_kind_idx on public.exam_attempts (user_id, kind);
create index if not exists exam_attempts_status_idx on public.exam_attempts (user_id, status);

create index if not exists daily_plans_date_idx on public.daily_plans (user_id, date);
create index if not exists daily_plans_status_idx on public.daily_plans (user_id, status);

create index if not exists study_logs_date_idx on public.study_logs (user_id, date);
create index if not exists study_logs_kind_idx on public.study_logs (user_id, kind);

create index if not exists tutor_conversations_mode_idx on public.tutor_conversations (user_id, mode);

create index if not exists assistance_events_kind_idx on public.assistance_events (user_id, kind);

create index if not exists applications_kind_idx on public.applications (user_id, kind);

create index if not exists generated_v2_kind_idx on public.generated_v2 (user_id, kind);
create index if not exists generated_v2_ref_id_idx on public.generated_v2 (user_id, ref_id);

-- ============================================================================
-- Per-table: (user_id, created_at) index, updated_at trigger, row level security
-- (the same loop as 0001_init.sql, over the V2 tables)
-- ============================================================================

do $$
declare
  t text;
  tables text[] := array[
    'concept_mastery', 'concept_evidence',
    'lesson_sessions',
    'practice_attempts', 'error_records',
    'retrieval_items', 'retrieval_reviews',
    'library_sources', 'reading_sessions', 'reading_recalls',
    'knowledge_nodes', 'knowledge_edges',
    'writing_entries', 'writing_versions', 'writing_feedback', 'speaking_sessions',
    'projects', 'exam_attempts',
    'daily_plans', 'study_logs',
    'tutor_conversations', 'assistance_events',
    'applications', 'generated_v2'
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
