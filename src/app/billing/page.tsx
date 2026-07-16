import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isStripeConfigured } from "@/lib/stripe";
import { openBillingPortal } from "@/app/actions/billing";
import { hasActiveAccess } from "@/lib/billing";
import { PLANS, TRIAL_DAYS } from "@/lib/plans";
import { PlanForm } from "./plan-form";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

const STATUS_LABELS: Record<string, string> = {
  TRIALING: "Free trial",
  ACTIVE: "Active",
  PAST_DUE: "Past due",
  CANCELED: "Canceled",
  INCOMPLETE: "Incomplete",
  UNPAID: "Unpaid",
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const { success, canceled } = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const subscription = user.subscription;
  const active = hasActiveAccess(subscription);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="mt-2 text-neutral-500">
          {active
            ? "Manage your Body Reset subscription."
            : `Start your ${TRIAL_DAYS}-day free trial to build routines.`}
        </p>
      </div>

      {success && (
        <p className="mb-6 rounded-lg bg-teal-50 px-4 py-3 text-center text-sm text-teal-800 dark:bg-teal-950 dark:text-teal-200">
          You&apos;re all set! Your free trial has started.
        </p>
      )}
      {canceled && (
        <p className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-center text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Checkout was canceled. You can try again whenever you&apos;re ready.
        </p>
      )}

      {!isStripeConfigured() && (
        <p className="mb-6 rounded-lg bg-neutral-100 px-4 py-3 text-center text-sm text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
          Stripe is not configured for this environment yet — add your API keys and price IDs to
          the <code>.env</code> file to enable checkout.
        </p>
      )}

      {active && subscription ? (
        <div className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {subscription.plan ? PLANS[subscription.plan].name : "Plan"} plan
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Status: {STATUS_LABELS[subscription.status] ?? subscription.status}
              </p>
            </div>
            <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-800 dark:bg-teal-900 dark:text-teal-200">
              {STATUS_LABELS[subscription.status] ?? subscription.status}
            </span>
          </div>

          {subscription.status === "TRIALING" && subscription.trialEnd && (
            <p className="mt-4 text-sm text-neutral-500">
              Your trial ends on {dateFormatter.format(subscription.trialEnd)}.
            </p>
          )}
          {subscription.currentPeriodEnd && (
            <p className="mt-1 text-sm text-neutral-500">
              {subscription.cancelAtPeriodEnd ? "Access ends" : "Renews"} on{" "}
              {dateFormatter.format(subscription.currentPeriodEnd)}.
            </p>
          )}

          <form action={openBillingPortal} className="mt-6">
            <button
              type="submit"
              className="rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-semibold hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
            >
              Manage billing
            </button>
          </form>
        </div>
      ) : (
        <PlanForm />
      )}
    </div>
  );
}
