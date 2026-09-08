# Local mode, cloud mode, and how AI activates

THE STUDY is built so that a fresh checkout with no keys is the complete
product. Credentials add reach (your study on every device, a model reading
your reasoning), never features that are otherwise missing.

## The two persistence modes

| | Local mode | Cloud mode |
|---|---|---|
| When | No `NEXT_PUBLIC_SUPABASE_*` set, or `localStorage["the-study:force-local"] = "1"` | Both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set and a signed-in session |
| Where data lives | IndexedDB in this browser, database `the-study` (Dexie) | Postgres in your Supabase project |
| Identity | A random `local_xxxx` id kept in `localStorage["the-study:local-user"]` | `auth.users.id` (uuid) from the Supabase session |
| Sign-in | None | Email + password, or magic link (`src/lib/persistence/auth.ts`) |
| Adapter | `LocalDatabase` (`src/lib/persistence/local.ts`) | `CloudDatabase` (`src/lib/persistence/supabase.ts`) |
| Offline | Always | Reads and writes need the network; there is no sync queue |

Both adapters implement the same `StudyDatabase` interface
(`src/lib/persistence/store.ts`), and every room only ever talks to that
interface through `useStudy()` / `useStudyQuery()`. Rooms cannot tell which
mode they are in, and nothing in a room may assume a network.

### Boot sequence

`useStudyBoot()` in `src/lib/persistence/provider.tsx` decides the mode once
per page load:

1. `getSupabaseClient()` returns `null` when the env vars are absent -> local.
2. Otherwise `auth.getSession()`:
   - a session exists and force-local is not set -> `CloudDatabase(session.user.id)`
   - no session and force-local is not set -> `auth-required`, and `StudyGate`
     redirects to `/enter?auth=1`
   - force-local set -> `LocalDatabase(localUserId())`
3. `ensureProfile(db)` creates the profile and preferences rows if missing.

Signing out in cloud mode clears the Supabase session and returns to `/enter`.
It does not touch any local-mode data on the device.

### Moving data between modes

`db.exportAll()` returns `{ [collection]: rows[] }` and `db.importAll(data)`
writes it back through the normal stores, re-stamping every row with the
current `userId`. That is the route from a local study to a cloud one: export
in local mode, sign in, import. There is no automatic migration.

## How the adapter maps entities to tables

Every collection in `src/lib/persistence/collections.ts` is one Postgres
table with the same name. The cloud adapter is deliberately mechanical:

- **Field names**: `camelCase` -> `snake_case` on the way out (`toRow`),
  back again on the way in (`fromRow`). `caseId` becomes `case_id`,
  `counterEvidenceIds` becomes `counter_evidence_ids`. The two entity fields
  that collide with SQL reserved words (`from`, `to` on
  `archive_user_connections`) are quoted in the schema; PostgREST quotes
  identifiers, so the adapter needs no special case.
- **Optional fields**: `undefined` is sent as `null`; `null` columns are
  dropped when reading, so an entity round-trips to the same shape it had
  in local mode.
- **Scalars**: strings -> `text`, numbers -> `numeric` / `double precision`
  or `integer`, booleans -> `boolean`, ISO date strings -> `timestamptz`,
  `YYYY-MM-DD` strings (`DailySession.date`, `DailyPlan.date`,
  `StudyLog.date`) -> `date`.
- **Arrays and objects** (`stages`, `turns`, `history`, `items`, `source`,
  `person`, `review`, `summary`, `loci`, ...) -> `jsonb`, stored exactly as
  the entity holds them, still camelCase inside.
- **Enums** (`status`, `kind`, `mode`, `level`, `faculty`, `type`,
  `trend`, `relation`, ...) are `text` with a `CHECK (... in (...))` that
  mirrors the union type; 0..1 quantities (`score`, `confidence`, `value`,
  `strength`, `probability`, `rapport`, `coverage`, `precision`) carry a
  range check. A row that violates the domain model is refused by the
  database, not silently stored.
- **References**: `case_stage_attempts.attempt_id` -> `case_attempts` and
  `memory_reviews.item_id` -> `memory_items` are composite foreign keys on
  `(id, user_id)`, so a child row can only ever point at a parent owned by the
  same user, and deleting the parent removes its children (the V2 equivalents
  are listed under migration 0002 below). Looser links
  (`red_threads.evidence_ids`, `archive_progress.memory_item_ids`,
  `sessionId` everywhere) stay plain ids or jsonb arrays, because those
  records are allowed to outlive what they point at.
- **Indexes**: each `LOCAL_INDEXES` entry becomes a `(user_id, column)`
  index, and every table has `(user_id, created_at)` for default listing.
- **Timestamps**: the client sets `createdAt`/`updatedAt` as ISO strings; a
  `set_updated_at` trigger overwrites `updated_at` with server time on every
  insert and update, so it is authoritative in cloud mode.

`Store.list()` pushes `where`, `orderBy` and `limit` into the PostgREST query
and applies `filter`/`offset` in memory, so a `list()` call behaves the same
in both modes. `count()` uses a head request with `count: "exact"`.

One known difference: Postgres returns `timestamptz` values as
`2026-09-01T09:00:00+00:00` rather than the `...Z` form the client wrote.
Both are valid ISO 8601 and sort identically; code that compares dates as
strings across the two forms should normalise with `new Date(x).toISOString()`.

## Migration 0002: the V2 tables

`supabase/migrations/0002_v2.sql` extends the schema for V2 (LEARN / TRAIN /
BUILD / PROVE / REVIEW). It depends on `0001_init.sql` and is idempotent:
every statement is `create table if not exists`, `add column if not exists`,
`create index if not exists` or a drop-then-create of a policy or trigger, so
it can be re-run on a project that already has it. Apply it the same way as
0001 (`supabase db push` applies every file in order; or paste it into the SQL
editor after 0001).

What it adds:

- **`profiles.v2 jsonb`**: the whole `ProfileV2` object (`goals`,
  `interests`, `educationLevel`, `dailyMinutes`, `onboardingComplete`,
  `baselineAttemptId`, `baselineSkipped`, `startedAt`, `v1ImportedAt`) in one
  column, because the app reads and writes it as a unit and never filters on
  its parts. A row written by V1 holds `null` there, which `fromRow` drops, so
  `profile.v2` is simply absent and `needsV2Onboarding()`
  (`src/lib/v2/profile.ts`) sends the person to `/enter`. The V1
  `onboarding_complete` flag on its own does not open the V2 rooms; it still
  opens the archived `/v1/*` rooms.
- **Preference columns** `plan_mode text`, `custom_minutes integer`,
  `lesson_depth text` (all nullable, with `check` constraints mirroring the
  union types) and `reading_pace double precision not null default 2`.
  `ensureProfile()` (`src/lib/services/profile.ts`) back-fills the defaults
  (`standard`, 60, `standard`, 2) on any preferences row that lacks a key and
  writes them through. On a project where 0002 has not been applied the write
  fails on the unknown columns; the failure is caught, and the app boots with
  the defaults held in memory, so a schema at 0001 still works until 0002 is
  run.
- **One table per V2 collection**, named as in `V2_COLLECTIONS`:

  | Table | Entity | Notes |
  |---|---|---|
  | `concept_mastery` | `ConceptMastery` | `counts`, `successes`, `history` jsonb; `state`, `trend`, `evidence_confidence` are checked enums |
  | `concept_evidence` | `ConceptEvidence` | one row per evidence event; `source` jsonb |
  | `lesson_sessions` | `LessonSession` | `responses`, `explain_back` jsonb |
  | `practice_attempts` | `PracticeAttempt` | `response` is jsonb of any shape (number, index, indexes, text, ordering); `evaluation` jsonb |
  | `error_records` | `ErrorRecord` | `recurrence_key` indexed for recurrence detection |
  | `retrieval_items` | `RetrievalItem` | the scheduling columns of `memory_items` plus `stage` (0..4), `encoding`, `key_points` |
  | `retrieval_reviews` | `RetrievalReview` | FK -> `retrieval_items` |
  | `library_sources` | `LibrarySource` | `concepts`, `project_ids` jsonb |
  | `reading_sessions` | `ReadingSession` | FK -> `library_sources` |
  | `reading_recalls` | `ReadingRecall` | `extracted`, `retrieval_item_ids` jsonb; FK -> `library_sources` |
  | `knowledge_nodes` | `KnowledgeNode` | `key` is the graph slug (indexed); seed nodes live in content, not here |
  | `knowledge_edges` | `KnowledgeEdge` | `"from"`, `"to"` quoted, as on `archive_user_connections` |
  | `writing_entries` | `WritingEntry` | `context_ref` jsonb |
  | `writing_versions` | `WritingVersion` | FK -> `writing_entries` |
  | `writing_feedback` | `WritingFeedback` | `scores`, `passages`, `metrics` jsonb; FK -> `writing_entries` |
  | `speaking_sessions` | `SpeakingSession` | `metrics`, `rubric_scores` jsonb |
  | `projects` | `Project` | sources, notes, claims, evidence, counterarguments, milestones, retrospective all jsonb |
  | `exam_attempts` | `ExamAttempt` | `form` (the frozen items and passages), `responses`, `result` jsonb |
  | `daily_plans` | `DailyPlan` | `items`, `signals` jsonb; `date` is a `date` |
  | `study_logs` | `StudyLog` | `date` is a `date` |
  | `tutor_conversations` | `TutorConversation` | `messages`, `context_ref` jsonb |
  | `assistance_events` | `AssistanceEvent` | `source`, `concept_ids` jsonb |
  | `applications` | `ApplicationRecord` | `concept_ids` jsonb |
  | `generated_v2` | `GeneratedV2` | validated model output; `payload` jsonb |

The conventions of 0001 hold, with these refinements:

- Numbers that are whole by definition (`reps`, `lapses`, `retries`,
  `version`, `word_count`, `difficulty`, `level`, `stage`, `grade`,
  `step_index`, `section_index`, `hints_used`, counts) are `integer`; measures
  that may be fractional (`score`, `estimate`, `weight`, `ease`, `minutes`,
  `*_ms`, `*_days`, `overall`) are `double precision`. Range checks mirror the
  type comments: 0..1 scores and confidences, difficulty 1..8, transfer 0..3,
  stage 0..4, grade 0..5, writing level 1..7.
- Composite foreign keys on `(id, user_id)`, all `on delete cascade`:
  `retrieval_reviews.item_id -> retrieval_items`, `reading_sessions.source_id`
  and `reading_recalls.source_id -> library_sources`,
  `writing_versions.entry_id` and `writing_feedback.entry_id ->
  writing_entries`. Write the parent before the child; `importAll()` already
  walks `COLLECTIONS` in that order. Every other link (`concept_id`,
  `item_id` on practice attempts, `plan_item_id`, `context_ref`, `source`)
  is a plain id or jsonb and may outlive its target.
- Every V2 table gets the same `(user_id, created_at)` index, `set_updated_at`
  trigger and four owner-only policies as the V1 tables: the loop at the end
  of the file is the one from 0001, run over the 24 V2 table names.
  `LOCAL_INDEXES` entries become `(user_id, column)` indexes as before.

The row-mapping test (`src/lib/persistence/__tests__/row-mapping.test.ts`)
parses every file in `supabase/migrations/` (`create table` bodies and
`alter table ... add column` statements) and checks that every collection has
exactly one table, that a fully populated sample entity for each V2
collection has a column for every field, that the `LOCAL_INDEXES` columns are
indexed, and that every table is inside a policy loop. When you add a field
to an entity type, add the column in a new migration and the field to the
sample; the test fails until both are done.

V1 data is imported into V2 by the app, not by SQL (`src/lib/v2/migrate-v1.ts`):
at the end of the V2 entrance, V1 `memory_items` of kind fact, concept or
archive are copied into `retrieval_items` (`source = { kind: "v1", refId }`,
id `ri_v1_<memoryItemId>`, scheduling copied, stage 0) and
`profile.v2.v1ImportedAt` is stamped. The import is idempotent and never
writes `concept_mastery`; V1 evidence stays in its own tables as history.

## How row level security protects ownership

Ownership is enforced in three layers, and the database is the one that
matters.

1. **Adapter**: `CloudStore` adds `.eq("user_id", userId)` to every read,
   update and delete, and stamps `userId` onto every write. This is a
   convenience, not the guarantee.
2. **Policies**: `0001_init.sql` (the 33 V1 tables) and `0002_v2.sql` (the
   24 V2 tables) enable row level security on every table and create four
   policies per table, all `to authenticated`:

   ```sql
   for select using (auth.uid() = user_id)
   for insert with check (auth.uid() = user_id)
   for update using (auth.uid() = user_id) with check (auth.uid() = user_id)
   for delete using (auth.uid() = user_id)
   ```

   `auth.uid()` is read from the JWT Supabase attaches to each request. An
   anonymous request (anon key, no session) matches no policy and sees an
   empty table. A signed-in user who hand-crafts a request for another
   user's id gets no rows, and an insert claiming a different `user_id` is
   rejected by the `with check`. The `with check` on update also stops a
   user from re-assigning a row they own to someone else.
3. **Foreign keys**: the composite `(id, user_id)` references above mean the
   database itself refuses a stage attempt or memory review that points at
   another user's parent row, even though that parent is invisible to the
   caller anyway.

`user_id` references `auth.users(id) on delete cascade`, so deleting the
account in Supabase removes every row it owned.

The anon key is safe to ship precisely because of these policies. The
service-role key bypasses them and must never appear in a `NEXT_PUBLIC_*`
variable or in client code.

## How AI activates

AI is a server-side add-on that sits beside persistence, not inside it.

- **Configuration**: `ANTHROPIC_API_KEY` (required to enable),
  `ANTHROPIC_MODEL` (optional; the default is set in `provider.ts`) and
  optional `ANTHROPIC_FAST_MODEL` for low-effort operations. Read once by `aiConfig()`
  in `src/lib/ai/provider.ts`, which is marked `server-only`; the key can
  never reach the browser bundle.
- **Single entry point**: every model call goes through
  `POST /api/ai/[op]` (`src/app/api/ai/[op]/route.ts`). The route looks the
  op up in `OPS`, validates input, and either returns
  `{ ok: true, data, model }` or `{ ok: false, reason }`. Streaming ops
  (`curatorRespond`, `continueSalonConversation`) return `text/plain` chunks.
- **Discovery**: the browser calls `GET /api/ai/status` once and caches
  `{ configured, model, provider }`; `useAIStatus()` exposes it so screens
  can offer a deeper read only when one exists.
- **Fallbacks are mandatory**: when the key is missing the route answers
  `{ ok: false, reason: "unconfigured" }` with HTTP 200, and every room falls
  back to its deterministic evaluation (rubrics, keyword coverage, option
  quality values, scripted replies), labelling the result
  "Deterministic review". A model error or network failure takes the same
  path. Nothing in the product breaks or waits on a model.
- **Persistence of generated content**: when a model produces a case, salon,
  strategy scenario, archive entry, curiosity or rhetoric prompt, the browser
  stores it in `generated_content` (`kind`, `refId`, `payload`, `model`)
  through the ordinary adapter before using it, so it is owned by the user,
  covered by the same RLS, and identical in local and cloud mode. V2 does the
  same for generated lessons, items, transfer challenges and prompts in
  `generated_v2` (plus `conceptIds`), after validating them against the
  content schema; exam items are never generated once an exam has started.
- **Never during navigation or render**: AI runs only on explicit user
  actions. Opening a room, listing attempts or booting the app never calls a
  model, which is also why cloud mode and AI are independent switches: you
  can have either, both, or neither.

## Quick reference

```
no keys                       -> local mode, deterministic review
NEXT_PUBLIC_SUPABASE_*        -> cloud mode after sign-in, deterministic review
ANTHROPIC_API_KEY             -> local mode, model-backed review
all three                     -> cloud mode, model-backed review
```

Setup steps for the Supabase side are in `supabase/README.md`; the schema is
`supabase/migrations/0001_init.sql` (V1) followed by
`supabase/migrations/0002_v2.sql` (V2); the auth helpers are
`src/lib/persistence/auth.ts`.
