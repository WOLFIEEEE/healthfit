import { and, eq } from "drizzle-orm";
import { getPlanByProductId } from "@/lib/config/plans";
import { db } from "@/lib/drizzle/client";
import { subscriptions } from "@/lib/drizzle/schema";
import { PlanCatalogItem } from "@/lib/healthfit/contracts";
import { getCurrentAppUser } from "@/lib/healthfit/server/auth";

export async function requireBillingUser() {
  const user = await getCurrentAppUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

export async function requireOwnedSubscription(subscriptionId: string) {
  const user = await requireBillingUser();
  const subscription = await db.query.subscriptions.findFirst({
    where: and(
      eq(subscriptions.subscriptionId, subscriptionId),
      eq(subscriptions.userId, user.supabaseUserId)
    ),
  });

  if (!subscription) {
    throw new Error("Subscription not found");
  }

  return { user, subscription };
}

export function assertPaidPlanProduct(
  productId: string
): PlanCatalogItem & { dodoProductId: string } {
  const plan = getPlanByProductId(productId);

  if (!plan?.dodoProductId || plan.monthlyPrice <= 0) {
    throw new Error("Invalid paid plan selected");
  }

  return plan as PlanCatalogItem & { dodoProductId: string };
}
