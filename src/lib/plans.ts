export const TRIAL_DAYS = 3;
export const FREE_SESSIONS_PER_WEEK = 3;

export const PERSONAL_PLAN = {
  id: "PERSONAL",
  name: "Personal",
  priceLabel: "$9",
  interval: "month",
  priceId: process.env.STRIPE_PRICE_PERSONAL,
  description: "Unlimited sessions, full AI coach, daily adaptive plan.",
} as const;

export const FREE_PLAN = {
  id: "FREE",
  name: "Free",
  priceLabel: "$0",
  interval: "forever",
  description: `${FREE_SESSIONS_PER_WEEK} guided sessions / week, core body map, weekly progress.`,
} as const;
