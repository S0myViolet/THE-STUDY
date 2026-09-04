# Supabase setup for THE STUDY

THE STUDY works fully without any of this: with no credentials it keeps
everything on the device in IndexedDB. Follow these steps only when you want
your study to follow you across devices.

## 1. Create a project

1. Sign in at https://supabase.com and create a project (any region, free tier is fine).
2. Wait for the database to provision, then open **Project Settings -> API** and note:
   - **Project URL** (`https://<ref>.supabase.co`)
   - **anon public** key

Both are safe to ship to the browser. The anon key can only read and write rows
that row level security allows, which after the migration means: the signed-in
user's own rows and nothing else.

## 2. Apply the schema

Migrations live in `supabase/migrations/` and are plain SQL.

**Option A — Supabase CLI**

```sh
npm i -g supabase            # or: brew install supabase/tap/supabase
supabase login
supabase link --project-ref <ref>
supabase db push             # applies every file in supabase/migrations in order
```

**Option B — SQL editor**

Dashboard -> **SQL Editor** -> New query -> paste the contents of
`supabase/migrations/0001_init.sql` -> Run. The file wraps itself in a
transaction; if anything fails nothing is applied.

Either way you end up with 33 tables (one per collection in
`src/lib/persistence/collections.ts`), secondary indexes, an `updated_at`
trigger, and row level security on every table.

Verify in **Table Editor**: you should see `profiles`, `skill_evidence`,
`case_attempts`, `memory_items`, `red_threads` and the rest, each with an RLS
badge.

## 3. Configure authentication

Dashboard -> **Authentication -> Providers**:

- **Email** is on by default. Decide whether to require email confirmation
  (Authentication -> Settings -> "Confirm email"). With confirmation on,
  `signUpWithPassword` returns `needsEmailConfirmation: true` and no session
  until the link is clicked.
- Magic links use the same Email provider; no extra setup.

Dashboard -> **Authentication -> URL Configuration**:

- **Site URL**: where the app runs (`http://localhost:3000` in development,
  your deployed origin in production).
- **Redirect URLs**: add `http://localhost:3000/enter` and
  `https://<your-domain>/enter`. The auth helpers default to
  `<origin>/enter` for magic-link and confirmation redirects.

## 4. Point the app at the project

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

Restart `npm run dev`. On the next load the app boots in cloud mode:
signed out -> it sends you to `/enter?auth=1`; signed in -> every read and
write goes to Postgres under your user id.

To fall back to the device without removing the keys, set
`localStorage["the-study:force-local"] = "1"` in the browser console; the
provider then boots the local database instead.

## 5. Adding a migration later

1. Create `supabase/migrations/000N_<name>.sql` (numbers keep the order).
2. Add or alter tables; for a new collection, add the table **and** the
   matching entry in `src/lib/persistence/collections.ts` (plus its
   `LOCAL_INDEXES`) so local and cloud stay in step.
3. Every new table needs the four base columns, RLS enabled, the four
   owner-only policies and the `set_updated_at` trigger. Easiest is to copy
   the DO block at the end of `0001_init.sql` with the new table name.
4. `supabase db push` (or paste into the SQL editor).

The test `src/lib/persistence/__tests__/row-mapping.test.ts` parses
`0001_init.sql` and fails if a collection has no table or a sample entity has
a field with no column, so run `npx vitest run` after schema edits.

## What is stored, and where the trust boundary is

- The **anon key** plus a user's session JWT gives access only to rows where
  `auth.uid() = user_id`. Every policy is `to authenticated`, so an anonymous
  request with just the anon key reads nothing.
- The **service role key** bypasses RLS. It is never used by this app and
  should not be placed in any `NEXT_PUBLIC_*` variable.
- The Anthropic key is server-side only and unrelated to Supabase; AI calls
  never touch the database directly. Generated content is persisted by the
  browser through the normal adapter into `generated_content`, owned by the
  user who generated it.
