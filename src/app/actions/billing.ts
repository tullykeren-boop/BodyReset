"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { PERSONAL_PLAN, TRIAL_DAYS } from "@/lib/plans";

export type BillingFormState = { error?: string } | undefined;

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function startCheckout(): Promise<BillingFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (!isStripeConfigured()) {
    return { error: "Billing is not configured yet. Add your Stripe keys to enable checkout." };
  }
  if (!PERSONAL_PLAN.priceId) {
    return { error: "Missing Stripe price ID for the Personal plan." };
  }

  const stripe = getStripe();

  let stripeCustomerId = user.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId: user.id },
    });
    stripeCustomerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId },
    });
  }

  const appUrl = getAppUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    client_reference_id: user.id,
    line_items: [{ price: PERSONAL_PLAN.priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: TRIAL_DAYS,
      metadata: { userId: user.id, plan: "PERSONAL" },
    },
    success_url: `${appUrl}/billing?success=1`,
    cancel_url: `${appUrl}/billing?canceled=1`,
  });

  if (!session.url) {
    return { error: "Could not start checkout. Please try again." };
  }

  redirect(session.url);
}

export async function openBillingPortal() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isStripeConfigured() || !user.stripeCustomerId) {
    redirect("/billing");
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId!,
    return_url: `${getAppUrl()}/billing`,
  });

  redirect(session.url);
}
