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
- **Scalars**: strings -> `text`, numbers -> `numeric` or `integer`,
  booleans -> `boolean`, ISO date strings -> `timestamptz`,
  `DailySession.date` (`YYYY-MM-DD`) -> `date`.
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
  same user, and deleting the parent removes its children. Looser links
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

## How row level security protects ownership

Ownership is enforced in three layers, and the database is the one that
matters.

1. **Adapter**: `CloudStore` adds `.eq("user_id", userId)` to every read,
   update and delete, and stamps `userId` onto every write. This is a
   convenience, not the guarantee.
2. **Policies**: `0001_init.sql` enables row level security on all 33 tables
   and creates four policies per table, all `to authenticated`:

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
  `ANTHROPIC_MODEL` (default `claude-fable-5-1`) and optional
  `ANTHROPIC_FAST_MODEL` for low-effort operations. Read once by `aiConfig()`
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
  covered by the same RLS, and identical in local and cloud mode.
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
`supabase/migrations/0001_init.sql`; the auth helpers are
`src/lib/persistence/auth.ts`.
