import { BillingPlanGrid } from "@/components/dashboard/billing-plan-grid";
import { MembershipIntelligenceCard } from "@/components/dashboard/membership-intelligence-card";
import { getPlanByProductId, getPlanByKey } from "@/lib/config/plans";
import { getBillingSnapshot } from "@/lib/healthfit/server/dashboard";
import { requireCurrentAppUser } from "@/lib/healthfit/server/auth";
import { getPremiumExperienceSnapshot } from "@/lib/healthfit/server/premium";

export default async function BillingPage() {
  const user = await requireCurrentAppUser();
  const [billing, premium] = await Promise.all([
    getBillingSnapshot(user.supabaseUserId),
    getPremiumExperienceSnapshot(user.supabaseUserId),
  ]);
  const currentPlan =
    getPlanByProductId(billing.subscription?.productId ?? null) ??
    getPlanByKey(user.currentPlanKey);

  return (
    <div className="space-y-6">
      <section className="soft-panel grid gap-4 px-6 py-6 md:grid-cols-3">
        <div className="rounded-[1.5rem] bg-white/75 px-4 py-4">
          <p className="text-sm text-muted-foreground">Current plan</p>
          <p className="mt-2 text-2xl font-semibold">{currentPlan.name}</p>
        </div>
        <div className="rounded-[1.5rem] bg-white/75 px-4 py-4">
          <p className="text-sm text-muted-foreground">Subscription status</p>
          <p className="mt-2 text-2xl font-semibold capitalize">
            {billing.subscription?.status ?? "starter"}
          </p>
        </div>
        <div className="rounded-[1.5rem] bg-white/75 px-4 py-4">
          <p className="text-sm text-muted-foreground">Next billing date</p>
          <p className="mt-2 text-2xl font-semibold">
            {billing.subscription?.nextBillingDate
              ? new Date(billing.subscription.nextBillingDate).toLocaleDateString()
              : "Free plan"}
          </p>
        </div>
      </section>

      <MembershipIntelligenceCard membership={premium.membership} />

      <section className="soft-panel px-6 py-6">
        <h2 className="text-3xl font-semibold">Plan options</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
          Dodo powers the subscription lifecycle, while Healthfit.ai controls
          entitlements and product access.
        </p>
        <div className="mt-6">
          <BillingPlanGrid
            currentPlanKey={currentPlan.key}
            currentSubscriptionId={billing.subscription?.subscriptionId}
            currentCancelAtNextBillingDate={
              billing.subscription?.cancelAtNextBillingDate
            }
            user={{
              email: billing.user.email,
              fullName:
                billing.user.fullName ?? billing.user.email.split("@")[0],
            }}
          />
        </div>
      </section>

      <section className="soft-panel px-6 py-6">
        <h2 className="text-2xl font-semibold">Invoice history</h2>
        <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-border/70">
          <table className="min-w-full divide-y divide-border/70 text-sm">
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
      </section>
    </div>
  );
}
