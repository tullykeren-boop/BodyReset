import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { TRIAL_DAYS, PLANS } from "@/lib/plans";

export default async function Home() {
  const [targetAreas, user] = await Promise.all([
    prisma.targetArea.findMany({ orderBy: { sortOrder: "asc" } }),
    getCurrentUser(),
  ]);

  const ctaHref = user ? "/target-area" : "/signup";

  return (
    <div className="flex flex-1 flex-col">
      <section className="border-b border-neutral-200 bg-gradient-to-b from-teal-50 to-white px-4 py-20 dark:border-neutral-800 dark:from-neutral-950 dark:to-black">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-800 dark:bg-teal-900 dark:text-teal-200">
            {TRIAL_DAYS}-day free trial · cancel anytime
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
            A short routine for the spot that hurts.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-neutral-600 dark:text-neutral-400">
            Tell us where it hurts and how much time you have. We&apos;ll build a
            focused 3-6 exercise routine and walk you through it, one rep at a time.
          </p>
          <Link
            href={ctaHref}
            className="mt-8 rounded-full bg-teal-600 px-8 py-3 text-base font-semibold text-white transition hover:bg-teal-700"
          >
            {user ? "Build a routine" : "Start your free trial"}
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-16">
        <h2 className="text-center text-2xl font-semibold tracking-tight">
          Pick where it hurts
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {targetAreas.map((area) => (
            <div
              key={area.id}
              className="rounded-xl border border-neutral-200 p-5 text-center dark:border-neutral-800"
            >
              <p className="font-medium">{area.name}</p>
              <p className="mt-1 text-sm text-neutral-500">{area.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-neutral-50 px-4 py-16 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Simple pricing</h2>
          <p className="mt-2 text-neutral-500">
            Every plan includes a {TRIAL_DAYS}-day free trial.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {Object.values(PLANS).map((plan) => (
              <div
                key={plan.id}
                className="rounded-2xl border border-neutral-200 bg-white p-6 text-left dark:border-neutral-800 dark:bg-black"
              >
                <p className="font-medium">{plan.name}</p>
                <p className="mt-2 text-3xl font-semibold">
                  {plan.priceLabel}
                  <span className="text-base font-normal text-neutral-500">
                    /{plan.interval}
                  </span>
                </p>
                <p className="mt-2 text-sm text-neutral-500">{plan.description}</p>
              </div>
            ))}
          </div>
          <Link
            href={ctaHref}
            className="mt-8 inline-block rounded-full bg-teal-600 px-8 py-3 text-base font-semibold text-white transition hover:bg-teal-700"
          >
            {user ? "Build a routine" : "Start your free trial"}
          </Link>
        </div>
      </section>
    </div>
  );
}
