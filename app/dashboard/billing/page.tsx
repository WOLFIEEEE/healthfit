import { BadgeCheck, CalendarClock, ReceiptText, WalletCards } from "lucide-react";
import { BillingPlanGrid } from "@/components/dashboard/billing-plan-grid";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { MembershipIntelligenceCard } from "@/components/dashboard/membership-intelligence-card";
import { getPlanByProductId, getPlanByKey } from "@/lib/config/plans";
import { getBillingSnapshot } from "@/lib/healthfit/server/dashboard";
import { requireCurrentAppUser } from "@/lib/healthfit/server/auth";
import { getPremiumExperienceSnapshot } from "@/lib/healthfit/server/premium";

function humanizeValue(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default async function BillingPage() {
  const user = await requireCurrentAppUser();
  const [billing, premium] = await Promise.all([
    getBillingSnapshot(user.supabaseUserId),
    getPremiumExperienceSnapshot(user.supabaseUserId),
  ]);
  const subscriptionPlan =
    getPlanByProductId(billing.subscription?.productId ?? null) ??
    getPlanByKey(user.currentPlanKey);
  const currentPlanName =
    user.role === "admin" ? premium.membership.planName : subscriptionPlan.name;
  const currentPlanKey =
    user.role === "admin" ? premium.membership.planKey : subscriptionPlan.key;
  const subscriptionStatus =
    user.role === "admin"
      ? "admin override"
      : billing.subscription?.status ?? "starter";

  return (
    <div className="space-y-10">
      <section className="soft-panel grid gap-8 px-8 py-10 sm:px-10 2xl:grid-cols-[minmax(0,1.04fr)_minmax(24rem,0.96fr)] 2xl:gap-12">
        <div className="min-w-0">
          <p className="pill">Billing</p>
          <h1 className="mt-5 text-4xl font-semibold sm:text-5xl">
            Plan access without the cramped pricing-table feel.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
            Review subscription state, compare plans, and scan invoice history in a layout that gives the pricing and access details proper breathing room.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <DashboardStatCard
            icon={WalletCards}
            label="Current plan"
            value={currentPlanName}
            detail="Current plan and entitlement bundle attached to this workspace."
            tone="brand"
          />
          <DashboardStatCard
            icon={BadgeCheck}
            label="Subscription status"
            value={humanizeValue(subscriptionStatus)}
            detail={
              user.role === "admin"
                ? "Admin workspaces bypass live billing and checkout requirements."
                : "Current subscription lifecycle state coming from the active Dodo subscription."
            }
          />
          <DashboardStatCard
            icon={CalendarClock}
            label="Next billing"
            value={
              user.role === "admin"
                ? "Not required"
                : billing.subscription?.nextBillingDate
                  ? new Date(billing.subscription.nextBillingDate).toLocaleDateString()
                  : "Free plan"
            }
            detail={
              user.role === "admin"
                ? "Internal admin accounts do not require a billing renewal schedule."
                : billing.subscription?.nextBillingDate
                  ? `Next billing date is ${new Date(billing.subscription.nextBillingDate).toLocaleDateString()}.`
                  : "No paid renewal is scheduled for this workspace right now."
            }
          />
          <DashboardStatCard
            icon={ReceiptText}
            label="Invoice history"
            value={billing.invoices.length}
            detail="Recorded invoice and payment entries currently available on this account."
          />
        </div>
      </section>

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1.14fr)_minmax(22rem,0.86fr)] 2xl:gap-12">
        <section className="soft-panel min-w-0 px-8 py-10 sm:px-10">
          <h2 className="text-2xl font-semibold sm:text-3xl">Plan options</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
            Dodo powers the subscription lifecycle, while Healthfit.ai controls entitlements and product access.
          </p>
          <div className="mt-6">
            <BillingPlanGrid
              currentPlanKey={currentPlanKey}
              currentSubscriptionId={billing.subscription?.subscriptionId}
              currentCancelAtNextBillingDate={
                billing.subscription?.cancelAtNextBillingDate
              }
              isAdmin={user.role === "admin"}
              user={{
                email: billing.user.email,
                fullName:
                  billing.user.fullName ?? billing.user.email.split("@")[0],
              }}
            />
          </div>
        </section>

        <MembershipIntelligenceCard membership={premium.membership} />
      </div>

      <section className="soft-panel px-8 py-10 sm:px-10">
        <h2 className="text-2xl font-semibold">Invoice history</h2>
        <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-border/70">
          <div className="overflow-x-auto">
            <table className="min-w-[40rem] w-full divide-y divide-border/70 text-sm">
              <thead className="bg-secondary/70 text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 bg-white/70">
                {billing.invoices.length === 0 ? (
                  <tr>
                    <td className="px-4 py-4 text-muted-foreground" colSpan={4}>
                      No invoices yet.
                    </td>
                  </tr>
                ) : (
                  billing.invoices.map((invoice) => (
                    <tr key={invoice.paymentId}>
                      <td className="px-4 py-4">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        {invoice.currency} {Number(invoice.totalAmount) / 100}
                      </td>
                      <td className="px-4 py-4 capitalize">{invoice.status}</td>
                      <td className="px-4 py-4">
                        {invoice.cardNetwork
                          ? `${invoice.cardNetwork} ${invoice.cardLastFour ?? ""}`
                          : invoice.paymentMethod ?? "n/a"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
