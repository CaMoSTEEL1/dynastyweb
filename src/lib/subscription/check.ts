import { createClient } from "@/lib/supabase/server";
import type { UserSubscription, PremiumFeature } from "./types";
import { isFeatureLocked } from "./types";

export async function getUserSubscription(
  userId: string
): Promise<UserSubscription> {
  const supabase = await createClient();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("tier")
    .eq("user_id", userId)
    .single();

  const { count: seasonsCount } = await supabase
    .from("seasons")
    .select("id", { count: "exact", head: true })
    .in(
      "dynasty_id",
      (
        await supabase
          .from("dynasties")
          .select("id")
          .eq("user_id", userId)
      ).data?.map((d) => d.id) ?? []
    );

  const tier = subscription?.tier === "premium" ? "premium" : "free";

  return {
    tier,
    seasonsUsed: seasonsCount ?? 0,
    maxFreeSeason: 1,
  } satisfies UserSubscription;
}

export async function checkFeatureAccess(
  userId: string,
  feature: PremiumFeature
): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  return !isFeatureLocked(feature, subscription);
}
