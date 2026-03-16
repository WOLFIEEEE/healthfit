"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { changePlan } from "@/actions/change-plan";
import { cancelSubscription } from "@/actions/cancel-subscription";
import { restoreSubscription } from "@/actions/restore-subscription";
import { planCatalog } from "@/lib/config/plans";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BillingPlanGridProps = {
  currentPlanKey: string;
  currentSubscriptionId?: string | null;
  currentCancelAtNextBillingDate?: boolean | null;
  user: {
    email: string;
    fullName: string;
  };
};

export function BillingPlanGrid({
  currentPlanKey,
  currentSubscriptionId,
  currentCancelAtNextBillingDate,
  user,
}: BillingPlanGridProps) {
  const [isPending, startTransition] = useTransition();

  const handlePlanSelection = (productId: string | undefined, planKey: string) => {
    if (!productId) {
      toast.error("This plan is not yet mapped to a Dodo product.");
      return;
    }

    startTransition(async () => {
      if (currentSubscriptionId) {
        const response = await changePlan({
          subscriptionId: currentSubscriptionId,
          productId,
        });

        if (!response.success) {
          toast.error(response.error);
          return;
        }

        toast.success("Plan updated successfully.");
        window.location.reload();
        return;
      }

      const response = await fetch("/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_cart: [
            {
              product_id: productId,
              quantity: 1,
            },
          ],
          customer: {
            email: user.email,
            name: user.fullName,
          },
          return_url: `${window.location.origin}/dashboard/billing`,
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.checkout_url) {
        toast.error(payload.error ?? "Failed to start checkout.");
        return;
      }

      window.location.href = payload.checkout_url;
    });
  };

  const handleSubscriptionAction = (kind: "cancel" | "restore") => {
    if (!currentSubscriptionId) return;

    startTransition(async () => {
      const action =
        kind === "cancel"
          ? await cancelSubscription({ subscriptionId: currentSubscriptionId })
          : await restoreSubscription({ subscriptionId: currentSubscriptionId });

      if (!action.success) {
        toast.error(action.error);
        return;
      }

      toast.success(
        kind === "cancel"
          ? "Subscription will end at the next billing date."
          : "Subscription restored."
      );
      window.location.reload();
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-3">
        {planCatalog.map((plan) => (
          <article
            key={plan.key}
            className={cn(
              "soft-panel flex flex-col px-6 py-6",
              plan.key === currentPlanKey && "ring-2 ring-primary/30"
            )}
          >
            <div className={cn("rounded-[1.5rem] bg-gradient-to-br p-5", plan.accentClassName)}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                  <h3 className="mt-2 text-3xl font-semibold">{plan.name}</h3>
                </div>
                {plan.badge ? <div className="pill">{plan.badge}</div> : null}
              </div>
              <div className="mt-6 flex items-end gap-2">
                <span className="text-4xl font-semibold">${plan.monthlyPrice}</span>
                <span className="pb-1 text-sm text-muted-foreground">/ month</span>
              </div>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              className="mt-6 rounded-full"
              variant={plan.key === currentPlanKey ? "outline" : "default"}
              disabled={isPending || plan.key === currentPlanKey || plan.monthlyPrice === 0}
              onClick={() => handlePlanSelection(plan.dodoProductId, plan.key)}
            >
              {plan.key === currentPlanKey
                ? "Current plan"
                : currentSubscriptionId
                  ? `Switch to ${plan.name}`
                  : `Choose ${plan.name}`}
            </Button>
          </article>
        ))}
      </div>

      {currentSubscriptionId ? (
        <div className="soft-panel flex flex-wrap items-center justify-between gap-3 px-6 py-5">
          <div>
            <h3 className="text-xl font-semibold">Subscription controls</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your renewal status without leaving the dashboard.
            </p>
          </div>
          {currentCancelAtNextBillingDate ? (
            <Button
              variant="outline"
              className="rounded-full"
              disabled={isPending}
              onClick={() => handleSubscriptionAction("restore")}
            >
              Restore subscription
            </Button>
          ) : (
            <Button
              variant="outline"
              className="rounded-full"
              disabled={isPending}
              onClick={() => handleSubscriptionAction("cancel")}
            >
              Cancel at period end
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
