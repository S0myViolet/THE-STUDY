# THE STUDY — Build Contracts

This file is the shared contract for everyone building THE STUDY. Read it fully before writing code or content.

## 1. What THE STUDY is

A private intellectual training environment. Tagline: *Notice more. Understand more. Think further.*
It trains real cognitive and communication abilities: observation, calibrated inference, intentional conversation, structured memory, connected knowledge, strategic thinking, reasoned judgement, calibration, rhetoric.

It is **not** a school, habit tracker, IQ trainer, flashcard app, ChatGPT skin, dashboard, spy game or detective cosplay.

### Reality standard (non-negotiable)
- Never teach pseudoscientific mind reading. No "he looked left so he lied", no crossed-arms-means-defensive, no microexpression magic, no body-language lie detection.
- Always distinguish **OBSERVATION** from **INTERPRETATION**. Statements are observation, inference or unknown.
- Never ask the user to infer protected or sensitive characteristics (race, religion, sexuality, health, disability, politics) from appearance.
- "Insufficient evidence" and "I don't know yet" are legitimate, sometimes correct, answers. Reward them when they are correct.
- Do not romanticise intuition; compare fast answers to slow analysis.
- No murder-mystery monoculture. Cases are social situations, business decisions, historical questions, scientific questions, negotiations, travel, ambiguous everyday events, information verification.

### Voice
Calm, precise, curious, slightly challenging, occasionally dry. Never sycophantic, theatrical or pseudo-mysterious. Never "agent". No emoji in the product. Copy is short. Feedback names one or two things, not ten.

### Anti-patterns (do not build)
IQ score, brain age, genius score, XP/coins/leaderboards, streak-nagging, a page called Dashboard full of stat cards, purple gradients, AI glow, glassmorphism, pill-shaped chips everywhere, cards inside cards, giant percentages, emoji, generic shadcn look, "coming soon", dead buttons, lorem ipsum.

## 2. Stack and layout

Next.js 16 (app router, Turbopack), React 19, TypeScript strict, Tailwind v4 (`@theme` tokens in `src/app/globals.css`), Zod 4, Dexie (IndexedDB) local persistence, Supabase adapter for cloud, Anthropic SDK server-side only.

```
src/app/(study)/<room>/[[...slug]]/page.tsx   thin: renders features/<room>'s root with slug[]
src/app/enter/page.tsx                        onboarding entry (no shell)
src/app/api/ai/[op]/route.ts                  the only place model calls happen
src/features/<room>/                          one directory per room; the room owns its internal routing via slug
src/lib/domain/                               faculties.ts, types.ts, errors.ts, content.ts
src/lib/persistence/                          store.ts (Store/StudyDatabase), collections.ts, local.ts, supabase.ts, provider.tsx
src/lib/services/                             evidence.ts, memory.ts, after-action.ts, notifications.ts, profile.ts, session-context.ts
src/lib/scoring/                              estimates, calibration, observation, spaced, text
src/lib/adaptation/                           red-thread.ts, session.ts, insights.ts, recommend.ts
src/lib/ai/                                   schemas.ts, ops.ts (server), provider.ts (server), client.ts (browser)
src/lib/scene/                                procedural observation scene engine
src/content/                                  seeded content modules (authored, never lorem ipsum)
src/components/ui/                            primitives.tsx, icons.tsx
src/components/shell/                         rail, mobile bar, palette, gate
tools/shot.mjs                                screenshot helper: node tools/shot.mjs <url> <out.png> [w h light|dark]
```

**Ownership rule for parallel work:** only create/modify files inside the directories assigned to you. If you need a change in a shared file (`lib/domain/types.ts`, `globals.css`, `nav.ts`, `search.ts`, etc.), do NOT edit it; describe the exact change in your final report and the integrator applies it. Exception: you may add *new* files under `src/lib/<your-room>/` or `src/components/<your-room>/` if needed.

Do not run `next build`. Do not start a second dev server; one is running at http://localhost:3000 (if it is not, you may start `npx next dev -p 3000` in the background). Verify with `npx tsc --noEmit` (must be clean) and `npx eslint src/features/<room>` and by screenshotting your pages.

## 3. Design system

Fonts: `Geist` (interface, class default), `Newsreader` (serif, class `serif` / `display` / `prose-study`), `Geist Mono` (`mono` / `numeral`). Use serif for case titles, quotes, Archive reading, editorial moments. Numbers use `numeral` (tabular).

Tokens (Tailwind color utilities): `paper`, `paper-2` (elevated), `paper-3` (sunken), `paper-4`; `ink`, `ink-2`, `ink-3`, `ink-4` (progressively lighter); `line`, `line-2`; accents `wine`, `wine-soft`, `forest`, `forest-soft`, `brass`, `brass-soft`; semantic `ok`, `warn`, `bad`. E.g. `bg-paper-2 text-ink border-line`. Dark mode is automatic via `data-theme` on `<html>`; never hardcode hex in components (except scene renderer palette).

CSS classes (globals.css): `page` (max-width column with padding), `reading-column`, `eyebrow` (+ `eyebrow-brass` / `eyebrow-wine`), `display`, `serif`, `mono`, `numeral`, `prose-study`, `sheet`, `sheet-raised`, `sunken`, `rule`, `rule-strong`, `rule-ink`, `paper-texture`, `case-edge`, `btn` (+ `btn-secondary`, `btn-ghost`, `btn-wine`, `btn-sm`, `btn-lg`), `field` (+ `field-serif`), `choice` (aria-pressed / data-correct / data-wrong), `segmented`, `mark`, `level[data-level]`, `nav-item`, `hairline-progress`, `stage`, `table`, animations `anim-place`, `anim-unfold`, `anim-fade`, `anim-close`, `anim-draw`, `stagger`.

Primitives (`@/components/ui/primitives`): `Button`, `Eyebrow`, `PageHeader`, `SectionTitle`, `LevelMark`, `Trend`, `Kbd`, `Field`, `TextArea`, `Select`, `Segmented`, `Choice`, `ConfidenceDial` (the calibration control — use it whenever a confidence is requested), `Countdown`, `HairlineProgress`, `Dialog` (native dialog, accessible), `Empty` (atmospheric empty state), `Divider`, `Note`, `Stat`, `Spinner`, hooks `useCountdown(total, running, onDone)`, `useStopwatch(active)`.
Icons: `import { I } from "@/components/ui/icons"` then `<I.Eye size={16} />`. Never emoji.

Layout rules: one obvious primary action per screen; generous whitespace; hairlines over boxes; section eyebrows in small caps; the Desk is not a dashboard. Mobile (<768px) gets its own composition, not a shrunken desktop; timed observation should go near full-screen on mobile. Keyboard: Escape closes overlays, Cmd/Ctrl+Enter submits textareas, Space advances timed steps when appropriate. Visible focus, aria labels, `role="timer"`, reduced motion respected (CSS handles it).

## 4. Data access

```ts
"use client";
import { useStudy, useStudyQuery } from "@/lib/persistence/provider";
const { db, profile, prefs } = useStudy();
const attempts = useStudyQuery((db) => db.store("case_attempts").list({ where: { status: "completed" }, orderBy: "createdAt", desc: true }), ["case_attempts"]);
// attempts.data, attempts.loading, attempts.refetch. Re-runs when the listed collections change.
```
Writes: `db.store("x").put(entity)`, `.update(id, patch)`, `.delete(id)`, `.get(id)`, `.list({ where, filter, orderBy, desc, limit })`, `.count(where)`. Create entities with `stamp<T>(db.userId, "prefix", body)` from `@/lib/persistence/store`. All entities have `id, userId, createdAt, updatedAt`. Collections are listed in `lib/persistence/collections.ts`.

Everything works in local mode with no credentials. Never assume a network.

## 5. Evidence — the single write path

Every exercise result becomes evidence via `@/lib/services/evidence`:
```ts
await recordEvidence(db, { subskill: "observation.detail", score: 0.8, difficulty: 3, format: "mcq", source: { kind: "observation", refId: exerciseId, label: "The Glance · Cafe" }, latencyMs, confidence, correct, sessionId });
await recordError(db, { type: "FALSE_OBSERVATION", subskill: "observation.precision", source, detail: "Reported a clock that was not there." });
await recordConfidence(db, { confidence: 0.8, correct: false, domain: "inference", source });  // also folds into calibration and over/under-confidence errors
```
Subskill ids and faculties: `lib/domain/faculties.ts`. Error types: `lib/domain/errors.ts`. Score is 0..1 quality, not just correctness. Difficulty 1–8. `format`: mcq | free | numeric | sort | timed | delayed. Set `transfer: true` when the task applies knowledge learned elsewhere.

After anything substantial, call `detectRedThreads(db)` from `@/lib/adaptation/red-thread` (cheap, idempotent) and write an After Action via `writeAfterAction(db, {...})` from `@/lib/services/after-action` for cases, salons, strategy runs and full sessions.

Memory: `createMemoryItem(db, {...})`, `dueMemoryItems(db)`, `reviewMemoryItem(db, { item, correct, latencyMs, confidence })` in `@/lib/services/memory`.
Notifications/milestones: `notify(db, {...})`, `reachMilestone(db, key)` in `@/lib/services/notifications`.

## 6. Daily session integration

Rooms may be opened as a session item: `?session=<id>&item=<id>`. Use:
```ts
import { useSessionItem } from "@/lib/services/session-context";
const { inSession, finish } = useSessionItem();
// when the exercise completes: if (await finish()) return;  // navigates back to /desk
```
Show a discreet "Part of today's session" mark when `inSession`. Engine: `lib/adaptation/session.ts`.

## 7. AI usage

Browser: `import { ai, useAIStatus } from "@/lib/ai/client"`. `const r = await ai.call("evaluateReasoning", { task, groundTruth, response })` → `{ ok: true, data }` or `{ ok: false, reason }`. Streaming for `curatorRespond` and `continueSalonConversation`: `ai.stream(op, input, (chunk, full) => ...)`.
**Every AI path must have a deterministic fallback** (rubrics, keyword coverage via `keyPointCoverage` in `lib/scoring/text.ts`, option quality values, scripted replies). The product must be genuinely useful with no key. When AI is unavailable, say so quietly ("Deterministic review — connect a model in Settings for a deeper read"), never a broken state. Persist generated content into `generated_content` before use. Never call AI during navigation or rendering; only on explicit user actions.

## 8. Content conventions

- Ids: kebab-case, stable, prefixed by kind (`case-`, `gl-`, `ts-`, `arc-`...). Archive entry ids are the canonical concept keys used in `conceptLinks`, `connects`, `archiveRef`.
- Quality bar: real reasoning, ambiguity, plausible alternatives, useful knowledge, good writing. No trick riddles, no trivia for its own sake, no lorem ipsum, no filler. Facts must be accurate; where contested, say so.
- Every exercise carries `difficulty` (1 Introductory … 8 Synthesis) and `subskills`.
- Keywords for deterministic matching are lower-case, specific, 2–6 per item, including synonyms.

### Archive entry ids (canonical; 36)
history: `printing-press`(technology), `rosetta-stone`(object), `ottoman-empire`(institution), `venetian-republic`(institution), `silk-road`(concept), `renaissance`(movement), `the-reformation`(movement), `black-death`(event), `napoleon-bonaparte`(person), `mongol-empire`(institution), `hanseatic-league`(institution), `ming-dynasty`(institution), `peace-of-westphalia`(event)
geography: `istanbul`(place), `bosporus`(place), `suez-canal`(place), `dubai`(place)
economics: `bretton-woods`(event), `central-banks`(concept), `inflation`(concept), `fiat-money`(concept), `gold-standard`(concept), `game-theory`(concept), `prisoners-dilemma`(concept)
business: `containerization`(technology), `double-entry-bookkeeping`(technology), `dutch-east-india-company`(institution), `english-auction`(concept)
law/politics: `diplomatic-immunity`(concept), `magna-carta`(work)
science/philosophy/psychology: `bayes-theorem`(concept), `falsifiability`(concept), `base-rate-fallacy`(concept), `availability-heuristic`(concept)
art/literature/music/food: `impressionism`(movement), `the-odyssey`(work), `johann-sebastian-bach`(person), `michelin-guide`(institution), `coffeehouses`(concept)
Paths (kind `path`, `pathEntries`): `how-money-works`, `why-istanbul`, `reading-evidence`.

### Scene templates (procedural, `lib/scene`)
Ids: `desk`, `cafe`, `hotel-lobby`, `office`, `bookshelf`, `train-compartment`, `restaurant-table`, `airport-board`, `street`, `study`. Reference as `{ template: "cafe", seed: 4021 }`. Seeds are any positive integer; the same template+seed always renders identically.

## 9. Levels and numbers

User-facing: levels (Untested, Emerging, Reliable, Sharp, Advanced, Exceptional), trends, evidence counts, history. Numbers are shown with context (`72% · n = 48`). Never present a single intelligence score. Use `LevelMark`, `Trend`, `Stat`.

## 10. Reporting

Finish with a short report: files created, what is functional, what fallbacks exist, any shared-file changes you need the integrator to apply (exact diffs), and known gaps. Do not claim something works that you did not run.
