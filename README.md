# THE STUDY

*Notice more. Understand more. Think further.*

A private intellectual training environment. It trains the faculties that make a person perceptive: observation, calibrated inference, intentional conversation, structured memory, connected knowledge, strategic thinking, reasoned judgement, calibration and rhetoric. It is not a quiz app, a habit tracker, an IQ trainer or a chat skin. Everything you do becomes evidence; the Study reads that evidence back to you as levels, trends and recurring patterns, never as a score.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

That is enough. With no configuration the Study runs entirely on this device: data lives in IndexedDB, every exercise is reviewed deterministically, and the Curator answers from the built-in knowledge base. Open the entrance at `/enter`, or look at the thirty-day demonstration profile first.

Optional configuration goes in `.env.local` (see `.env.example`):

| Variable | Effect |
| --- | --- |
| `ANTHROPIC_API_KEY` | Enables model-assisted evaluation, generation and the Curator. Used only on the server. |
| `ANTHROPIC_MODEL` | The model id for those calls. Defaults to `claude-fable-5-1`. |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Enables accounts and cloud sync. Schema in `supabase/migrations`, notes in `docs/CLOUD.md`. |

Other commands:

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm test             # vitest: engines, content validation, persistence mapping, scene determinism
npm run e2e          # playwright journeys against the dev server (bash tools/dev.sh first)
npm run build        # production build
```

## The rooms

| Room | What happens there |
| --- | --- |
| Desk | Today's file, the daily session, what is due, what has been discovered. Not a dashboard. |
| Casebook | Eleven-stage cases: enter, notice, recall, separate observation from inference, hypotheses, one question, new evidence, update, decide, explain, debrief. |
| Observation | The Glance, room scans, change detection, chronology, documents, signal and noise, what is missing, observation or story. Procedural scenes render differently every time. |
| Inference | Three stories, best explanation, missing variable, base rates, disconfirm me, anomaly, how sure, information value, the inference ladder, causal chains, fast and slow. |
| Salon | Conversations with fictional characters who reveal information only to good questions. |
| Strategy Table | Incentive maps, decision trees, second-order effects, negotiation, pre-mortems, red teams. |
| Memory Palace | Spaced retrieval, names and details, reconstruction, story chains, spatial memory, concept webs, palaces, the library. |
| Archive | Connected world knowledge with a graph, a world map, a timeline and a bookshelf. Read, explain it back, save to memory. |
| Rhetoric | One sentence, thirty seconds, three audiences, story, analogy, argument, steelman, precision, the best question, impromptu, voice. |
| Cabinet | Curiosities worth knowing and where they connect. |
| Investigations | Long questions pursued over weeks: claims, counterclaims, sources, synthesis. |
| Fieldwork | Safe real-world observation and conversation assignments, reported back. |
| Forecasts, Decisions | Predictions that meet reality; a journal that separates decision quality from outcome quality. |
| Red Thread | Recurring patterns across your mistakes, detected conservatively and retired when the evidence says so. |
| After Action | Debriefs for cases, conversations, strategy runs and sessions. |
| Profile | The evolving map of your faculties: constellation, evidence, methodology. |
| Curator | Consultation with Think First on by default. Works offline; deeper with a model. |

## How it is built

Next.js 16 (app router), React 19, TypeScript strict, Tailwind v4, Zod 4. Dexie over IndexedDB for local persistence; a Supabase adapter with the same interface for the cloud. The Anthropic SDK is used only in `src/app/api/ai/[op]/route.ts`; the browser never sees a key, and every model-assisted path has a deterministic fallback.

```
src/app/(study)/<room>/[[...slug]]/page.tsx   thin routes; each room owns its internal navigation
src/features/<room>/                          the rooms
src/lib/domain/                               faculties, subskills, error taxonomy, entity types
src/lib/persistence/                          Store interface, local (Dexie) and cloud (Supabase) adapters
src/lib/services/                             evidence (the single write path), memory, after action, notifications
src/lib/scoring/                              estimates, calibration, observation, spaced repetition, text
src/lib/adaptation/                           red thread, daily session, insights, recommendations
src/lib/scene/                                the procedural observation scene engine
src/lib/ai/                                   schemas, operations, provider (server), client (browser)
src/content/                                  authored seed content
supabase/migrations/                          cloud schema with row level security
tools/                                        dev server, screenshot and flow helpers used for visual QA
```

Every exercise result goes through `recordEvidence`, which folds it into a shrinkage estimate per subskill. Levels (Untested, Emerging, Reliable, Sharp, Advanced, Exceptional) come from value, evidence count and estimate confidence together, so a lucky afternoon cannot make anyone Exceptional. Errors are typed; the Red Thread engine looks for repeated types across sessions inside a sixty-day window and only names a pattern after three instances in two sessions.

## Principles the content keeps

No pseudoscientific mind reading. Observation is kept separate from interpretation. "I don't know yet" is sometimes the right answer and is rewarded when it is. Nobody is asked to infer protected characteristics from appearance. Cases are social situations, business decisions, historical and scientific questions, negotiations, travel and everyday ambiguity, not a murder-mystery monoculture.
