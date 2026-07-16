import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe, mapStripeStatus } from "@/lib/stripe";
import type { SubscriptionPlan } from "@/generated/prisma/client";

function toDate(unixSeconds: number | null | undefined) {
  return unixSeconds ? new Date(unixSeconds * 1000) : null;
}

function planFromMetadata(subscription: Stripe.Subscription): SubscriptionPlan | null {
  const plan = subscription.metadata?.plan;
  return plan === "MONTHLY" || plan === "ANNUAL" ? plan : null;
}

async function upsertSubscriptionFromStripe(subscription: Stripe.Subscription, userId: string) {
  const item = subscription.items.data[0];

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      plan: planFromMetadata(subscription),
      status: mapStripeStatus(subscription.status),
      stripeCustomerId:
        typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
      stripeSubscriptionId: subscription.id,
      stripePriceId: item?.price.id,
      currentPeriodEnd: toDate(item?.current_period_end),
      trialEnd: toDate(subscription.trial_end),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    update: {
      plan: planFromMetadata(subscription),
      status: mapStripeStatus(subscription.status),
      stripePriceId: item?.price.id,
      currentPeriodEnd: toDate(item?.current_period_end),
      trialEnd: toDate(subscription.trial_end),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${(err as Error).message}` },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.client_reference_id;
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
      if (userId && subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await upsertSubscriptionFromStripe(subscription, userId);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.created": {
      const subscription = event.data.object;
      const userId = subscription.metadata?.userId;
      if (userId) {
        await upsertSubscriptionFromStripe(subscription, userId);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const userId = subscription.metadata?.userId;
      if (userId) {
        await prisma.subscription.updateMany({
          where: { userId },
          data: { status: "CANCELED", cancelAtPeriodEnd: true },
        });
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
