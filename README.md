# Reset

A Next.js (App Router, TypeScript, Tailwind) app that generates short, targeted
exercise routines based on where a user is feeling pain or tightness.

Users sign up, pick a target body area, answer a short intake (issue type +
time available), and get a generated 3-6 exercise routine pulled from a seeded
Postgres database. A sequential workout player walks them through it with
per-exercise timers, and a dashboard tracks past routines and streaks. Access
is gated behind a Stripe subscription (monthly or annual) with a 3-day free
trial.

## Stack

- Next.js 16 (App Router, Turbopack, Server Actions)
- TypeScript + Tailwind CSS 4
- PostgreSQL via Prisma 7 (`@prisma/adapter-pg`)
- Custom email/password auth (bcrypt + signed JWT session cookie via `jose`)
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
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — from your [Stripe test dashboard](https://dashboard.stripe.com/test/apikeys).
   - `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ANNUAL` — price IDs for two recurring Prices you create in Stripe (test mode).

   Without Stripe keys configured, the app still runs — the billing page shows
   a "not configured" notice instead of crashing, and checkout attempts return
   a friendly error.

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

- **TargetArea** — a body area a user can select (lower back, knees,
  shoulders, neck, hips, wrists).
- **MuscleGroup** — a muscle group, linked to target areas
  (`TargetAreaMuscleGroup`, weighted primary/secondary) and to exercises
  (`ExerciseMuscleGroup`, primary/secondary).
- **Exercise** — a single movement, tagged with the issue types it suits
  (`PAIN`, `STIFFNESS`, `WEAKNESS`, `MOBILITY`) and a default duration.
- **Routine** / **RoutineExercise** — a generated, ordered set of exercises
  for a user, target area, issue type, and time budget.
- **Subscription** — mirrors the user's Stripe subscription state.

`prisma/seed-data.ts` seeds 6 target areas, 17 muscle groups, and ~38
exercises with realistic instructions. `src/lib/routine-generator.ts` scores
candidate exercises against the target area's muscle groups and the user's
issue type, then picks 3-6 of them depending on time available (5/10/15/20
min).

## Useful scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | Lint |
| `npm run db:push` | Push the Prisma schema to the database |
| `npm run db:migrate` | Create/apply a migration |
| `npm run db:seed` | Seed target areas, muscle groups, and exercises |
| `npm run db:studio` | Open Prisma Studio |
