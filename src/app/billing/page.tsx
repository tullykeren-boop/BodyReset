import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isStripeConfigured } from "@/lib/stripe";
import { openBillingPortal } from "@/app/actions/billing";
import { hasUnlimitedAccess } from "@/lib/billing";
import { PERSONAL_PLAN, TRIAL_DAYS } from "@/lib/plans";
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
  const active = hasUnlimitedAccess(subscription);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16">
      <div className="mb-10 text-center">
        <h1 className="font-display text-2xl tracking-tight">Billing</h1>
        <p className="mt-2 text-ink-soft">
          {active
            ? "Manage your LetReSet subscription."
            : `Start your ${TRIAL_DAYS}-day free trial for unlimited sessions.`}
        </p>
      </div>

      {success && (
        <p className="mb-6 rounded-lg bg-[#E4EAE1] px-4 py-3 text-center text-sm text-moss-deep">
          You&apos;re all set! Your free trial has started.
        </p>
      )}
      {canceled && (
        <p className="mb-6 rounded-lg bg-[#F5E7CF] px-4 py-3 text-center text-sm text-[#8A6423]">
          Checkout was canceled. You can try again whenever you&apos;re ready.
        </p>
      )}

      {!isStripeConfigured() && (
        <p className="mb-6 rounded-lg bg-white/70 px-4 py-3 text-center text-sm text-ink-soft">
          Stripe is not configured for this environment yet — add your API keys and price ID to
          the <code>.env</code> file to enable checkout.
        </p>
      )}

      {active && subscription ? (
        <div className="rounded-2xl border border-mist bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{PERSONAL_PLAN.name} plan</p>
              <p className="mt-1 text-sm text-ink-soft">
                Status: {STATUS_LABELS[subscription.status] ?? subscription.status}
              </p>
            </div>
            <span className="rounded-full bg-[#E4EAE1] px-3 py-1 text-xs font-medium text-moss-deep">
              {STATUS_LABELS[subscription.status] ?? subscription.status}
            </span>
          </div>

          {subscription.status === "TRIALING" && subscription.trialEnd && (
            <p className="mt-4 text-sm text-ink-soft">
              Your trial ends on {dateFormatter.format(subscription.trialEnd)}.
            </p>
          )}
          {subscription.currentPeriodEnd && (
            <p className="mt-1 text-sm text-ink-soft">
              {subscription.cancelAtPeriodEnd ? "Access ends" : "Renews"} on{" "}
              {dateFormatter.format(subscription.currentPeriodEnd)}.
            </p>
          )}

          <form action={openBillingPortal} className="mt-6">
            <button
              type="submit"
              className="rounded-full border border-mist px-6 py-2.5 text-sm font-semibold hover:bg-white"
            >
              Manage billing
            </button>
          </form>
        </div>
      ) : (
        <PlanForm />
      )}

      <p className="mt-10 text-center text-xs text-ink-soft/70">
        Bringing LetReSet to your whole team?{" "}
        <a href="mailto:teams@resetapp.com" className="font-medium text-moss-deep hover:underline">
          Talk to us about Teams
        </a>
        .
      </p>
    </div>
  );
}
