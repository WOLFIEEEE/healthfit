"use server";

import { getDodoClient } from "@/lib/dodo-payments/client";
import {
  assertPaidPlanProduct,
  requireOwnedSubscription,
} from "@/lib/healthfit/server/billing";
import { ServerActionRes } from "@/types/server-action";

export async function changePlan(props: {
  subscriptionId: string;
  productId: string;
}): ServerActionRes {
  try {
    const targetPlan = assertPaidPlanProduct(props.productId);
    const { subscription } = await requireOwnedSubscription(props.subscriptionId);

    await getDodoClient().subscriptions.changePlan(subscription.subscriptionId, {
      product_id: targetPlan.dodoProductId,
      proration_billing_mode: "prorated_immediately",
      quantity: 1,
    });
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
