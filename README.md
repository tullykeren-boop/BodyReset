# LetReSet

A movement coach for desk workers: short guided routines for how your body
**and your head** actually feel through the workday. A Next.js (App Router,
TypeScript, Tailwind) app.

Physical and mental concerns are treated as equals. A stiff neck and a stressed
afternoon are both things the app has real content for, tracks over time, and
can build a two-minute routine around on the spot.

Users sign up, answer a short onboarding flow (workday type, physical areas via
an interactive body map, mental concerns, time available, goal), and get a daily
plan of three short routines. At any point they can tap **"How are you right
now?"** to get a routine matched to their present state instead of their
onboarding answers. A guided player walks them through each practice with a
timer, animated demonstrations, and a breath pacer for breathwork, then captures
before/after readings on whichever scale fits the concern. Movement reminders
(installable PWA + web push) nudge them during work hours. Free accounts get
3 routines/week; a Personal plan (Stripe, 3-day trial) unlocks unlimited.

## Stack

- Next.js 16 (App Router, Turbopack, Server Actions — note `src/proxy.ts`, not `middleware.ts`)
- TypeScript + Tailwind CSS 4 (CSS-first tokens in `src/app/globals.css`)
- PostgreSQL via Prisma 7 (`@prisma/adapter-pg`)
- Custom email/password auth (bcrypt + signed JWT session cookie via `jose`)
- Claude API (`@anthropic-ai/sdk`) for the AI coach
- Web push (`web-push` + VAPID) for movement reminders
- Stripe Checkout + Billing Portal + webhooks
- Vitest for unit tests

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in the values:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL` — a Postgres connection string.
   - `AUTH_SECRET` — random string used to sign session cookies (`openssl rand -base64 32`).
   - `ANTHROPIC_API_KEY` — from [console.anthropic.com](https://console.anthropic.com/), to power the AI coach with real replies.
   - `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `NEXT_PUBLIC_VAPID_PUBLIC_KEY` — generate with `npx web-push generate-vapid-keys`.
   - `CRON_SECRET` — shared secret your scheduler sends to the reminder dispatch endpoint.
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — from your [Stripe test dashboard](https://dashboard.stripe.com/test/apikeys).
   - `STRIPE_PRICE_PERSONAL` — price ID for the Personal plan.

   Every integration degrades gracefully. Without an Anthropic key the coach
   falls back to rule-based replies; without VAPID keys the reminders screen
   explains that push is unconfigured; without Stripe keys billing shows a
   "not configured" notice.

3. Push the schema and seed the database:

   ```bash
   npm run db:push
   npm run db:seed
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

### Movement reminders

Reminders need a scheduler outside the app. Point a cron job or queue worker at
the dispatch endpoint every few minutes:

```bash
curl -X POST https://your-host/api/reminders/dispatch \
  -H "Authorization: Bearer $CRON_SECRET"
```

It checks every user's schedule (work-hours window, weekdays, interval, quiet
snooze, timezone) and sends only those due. Dead push endpoints are pruned
automatically.

### Stripe webhook (local dev)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the printed signing secret into `STRIPE_WEBHOOK_SECRET`.

## Data model

`prisma/schema.prisma` defines one taxonomy covering both halves of the product.
Several models carry `@@map` to their original table names, so the rename from
the earlier physical-only schema cost no data.

- **Concern** (`@@map("BodyArea")`) — anything a routine can target, with a
  `kind` of `PHYSICAL` (neck, shoulders, upper/lower back, wrists, hips) or
  `MENTAL` (stress, anxiety, focus, energy, mood, eye strain, restlessness).
  Each declares the `IntensityScale` its readings are taken on.
- **Mechanism** (`@@map("MuscleGroup")`) — what a practice acts on. Deliberately
  has **no** `kind`: that is what lets `stress` route to `upper-back` (the
  trapezius holds stress) and `neck` route to `parasympathetic-downshift`,
  without either side needing a special case.
- **ConcernMechanism** — relevance, 0–100.
- **Practice** (`@@map("Exercise")`) — one movement, breath, gaze, somatic or
  cognitive item, with `modality`, `posture`, `discreet`, `exertion` and an
  optional `breathPattern`.
- **PracticeConcern** — a *sparse* signed override on top of mechanism routing,
  for the cases routing is too coarse for ("box breathing is for anxiety
  specifically") and for hard exclusions.
- **DailyPlan** / **PlannedSession** / **PlannedSessionItem** — the day's
  routines. **PlannedSessionConcern** records what each was built *for*, rather
  than reverse-engineering it at read time.
- **SessionFeedback** — `intensityBefore`/`intensityAfter` on a named scale, so
  a stress session and a back session share one progress axis.
- **StateLog** — a point-in-time "how I actually feel" reading, from a check-in
  or the instant routine builder.
- **ReminderSchedule** / **PushSubscription** — the nudge loop.
- **CheckIn**, **CoachMessage**, **Subscription** — as before.

`prisma/seed-data/` seeds 13 concerns, 23 mechanisms, and **58 practices**
(the original 33 physical, plus 25 breathwork, gaze, somatic, mindfulness and
cognitive practices).

## How routines get built

`src/lib/routine-scorer.ts` is the single scorer behind daily plans, coach
suggestions, and the instant `/now` flow.

- Mechanism routing is the base; the sparse `PracticeConcern` table is a signed
  additive override on top.
- Later-ranked concerns are damped, so "stressed **and** neck tight" leads with
  stress.
- `discreet`, `exertion` and `equipment` are **hard filters** — a floor stretch
  can never be suggested to someone on a video call.
- `packRoutine` fills to the real target in seconds and applies a per-modality
  diminishing return, so a stress request returns a designed arc (breath →
  release → settle) rather than five breathing drills in a row.
- Past feedback feeds a per-practice affinity term, so the app adapts to the
  person instead of re-deriving the same routine forever.
- Jitter is seeded, so plans are reproducible and testable but still rotate
  day to day.

`src/lib/intensity.ts` normalises every scale onto one "burden" axis where lower
is always better, which is what lets one trend line cover pain, stress, energy
and focus. Pain readings pass through unchanged, so pre-existing charts are
unaffected.

`src/lib/coach.ts` grounds the AI coach in the user's stored concerns, streak
and feedback, and suggests routines by concern *slug* rather than a fuzzy name
match.

## Useful scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | Lint |
| `npm test` | Run unit tests |
| `npm run db:push` | Push the Prisma schema to the database |
| `npm run db:seed` | Seed concerns, mechanisms, and practices |
| `npm run db:studio` | Open Prisma Studio |
