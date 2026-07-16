import "server-only";
import Stripe from "stripe";
import type { SubscriptionStatus } from "@/generated/prisma/client";

let stripeClient: Stripe | null = null;

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

const STATUS_MAP: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
  trialing: "TRIALING",
  active: "ACTIVE",
  past_due: "PAST_DUE",
  canceled: "CANCELED",
  incomplete: "INCOMPLETE",
  incomplete_expired: "CANCELED",
  unpaid: "UNPAID",
  paused: "CANCELED",
};

export function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  return STATUS_MAP[status] ?? "INCOMPLETE";
}
