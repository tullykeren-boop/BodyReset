# ReSet

An AI-powered Workday Recovery Coach: a Next.js (App Router, TypeScript,
Tailwind) app that helps desk workers prevent and relieve workday physical
discomfort in a few minutes, without leaving their day.

Users sign up, answer a short onboarding flow (workday type, pain areas via an
interactive body map, time available, goal), and get a daily plan of three
short recovery sessions (Morning / Midday / End of Day) generated from a
seeded Postgres database. A guided session player walks them through each
exercise with a timer, captures before/after pain feedback, and a dashboard
tracks a recovery score, streak, and progress over time. An AI coach (backed
by the Claude API) reacts to how the user says they're feeling and can spin
up an ad-hoc session on the spot. Free accounts get 3 sessions/week; a
Personal plan (Stripe, 3-day free trial) unlocks unlimited sessions.

## Stack

- Next.js 16 (App Router, Turbopack, Server Actions)
- TypeScript + Tailwind CSS 4
- PostgreSQL via Prisma 7 (`@prisma/adapter-pg`)
- Custom email/password auth (bcrypt + signed JWT session cookie via `jose`)
- Claude API (`@anthropic-ai/sdk`) for the AI coach
- Stripe Checkout + Billing Portal + webhooks

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in the values (a local `.env` with a
   dev database URL and auth secret is already provided for convenience):

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL` — a Postgres connection string.
   - `AUTH_SECRET` — random string used to sign session cookies (`openssl rand -base64 32`).
   - `ANTHROPIC_API_KEY` — from [console.anthropic.com](https://console.anthropic.com/), to power the AI coach with real replies.
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — from your [Stripe test dashboard](https://dashboard.stripe.com/test/apikeys).
   - `STRIPE_PRICE_PERSONAL` — price ID for the Personal plan (create a recurring Price in test mode).

   Without an Anthropic key, the coach falls back to a lightweight rule-based
   reply instead of crashing. Without Stripe keys, the billing page shows a
   "not configured" notice and checkout attempts return a friendly error.

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

### Stripe webhook (local dev)

Use the [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward events to
the local webhook route:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the printed webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

## Data model

`prisma/schema.prisma` defines:

- **Profile** — a user's onboarding answers (workday type, time available,
  goal) plus their selected **BodyArea**(s) via `ProfilePainArea`.
- **BodyArea** — a body area a user can select (neck, shoulders, upper back,
  lower back, wrists, hips).
- **MuscleGroup** — linked to body areas (`BodyAreaMuscleGroup`, weighted
  primary/secondary) and to exercises (`ExerciseMuscleGroup`,
  primary/secondary).
- **Exercise** — a single movement, tagged with the onboarding goals it suits
  (`REDUCE_PAIN`, `PREVENT`, `MOBILITY`, `ENERGY`) and a default duration.
- **DailyPlan** / **PlannedSession** / **PlannedSessionExercise** — the three
  generated sessions (Morning/Midday/Evening, plus ad-hoc coach-suggested
  ones) for a user on a given day.
- **SessionFeedback** — before/after pain and follow-up questions captured
  after each session.
- **CheckIn** — the daily "how's your body feeling" mood check-in.
- **CoachMessage** — the persisted AI coach conversation history.
- **Subscription** — mirrors the user's Stripe subscription state.

`prisma/seed-data.ts` seeds 6 body areas, 15 muscle groups, and 33 exercises
with realistic instructions. `src/lib/daily-plan-generator.ts` scores
candidate exercises against the user's pain areas and goal, then builds three
sessions sized off their available time. `src/lib/coach.ts` grounds the AI
coach's replies in the user's actual stored profile, streak, and feedback —
never fabricated details like calendar data.

## Useful scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | Lint |
| `npm run db:push` | Push the Prisma schema to the database |
| `npm run db:migrate` | Create/apply a migration |
| `npm run db:seed` | Seed body areas, muscle groups, and exercises |
| `npm run db:studio` | Open Prisma Studio |
