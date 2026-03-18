"use server";

import { getDodoClient } from "@/lib/dodo-payments/client";
import { db } from "@/lib/drizzle/client";
import { subscriptions } from "@/lib/drizzle/schema";
import { requireOwnedSubscription } from "@/lib/healthfit/server/billing";
import { ServerActionRes } from "@/types/server-action";
import { eq } from "drizzle-orm";

export async function cancelSubscription(props: {
  subscriptionId: string;
}): ServerActionRes {
  try {
    const { subscription } = await requireOwnedSubscription(props.subscriptionId);

    await getDodoClient().subscriptions.update(subscription.subscriptionId, {
      cancel_at_next_billing_date: true,
    });

    await db
      .update(subscriptions)
      .set({
        cancelAtNextBillingDate: true,
      })
      .where(eq(subscriptions.subscriptionId, subscription.subscriptionId));

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
