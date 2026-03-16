export type SubscriptionTier = "free" | "premium";

export interface UserSubscription {
  tier: SubscriptionTier;
  seasonsUsed: number;
  maxFreeSeason: 1;
}

export const PREMIUM_FEATURES = [
  "social",
  "press-conference",
  "shows",
  "recruiting",
  "offseason",
  "nil",
  "carousel",
] as const;

export type PremiumFeature = (typeof PREMIUM_FEATURES)[number];

export function isFeatureLocked(
  feature: PremiumFeature,
  subscription: UserSubscription
): boolean {
  if (subscription.tier === "premium") return false;
  return subscription.seasonsUsed > subscription.maxFreeSeason;
}
