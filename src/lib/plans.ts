export const TRIAL_DAYS = 3;

export const PLANS = {
  MONTHLY: {
    id: "MONTHLY",
    name: "Monthly",
    priceLabel: "$9",
    interval: "month",
    priceId: process.env.STRIPE_PRICE_MONTHLY,
    description: "Full access, billed every month.",
  },
  ANNUAL: {
    id: "ANNUAL",
    name: "Annual",
    priceLabel: "$79",
    interval: "year",
    priceId: process.env.STRIPE_PRICE_ANNUAL,
    description: "Full access, billed once a year. Save 27%.",
  },
} as const;

export type PlanId = keyof typeof PLANS;
