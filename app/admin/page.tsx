import type { Metadata } from "next";
import Link from "next/link";
import { buildNoIndexMetadata } from "@/lib/seo/metadata";
import { requireAdminUser } from "@/lib/healthfit/server/auth";
import { getAdminSnapshot } from "@/lib/healthfit/server/dashboard";
import { getAdminEmailConfigLabel } from "@/lib/config/admin";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Admin Console",
  description: "Internal Healthfit.ai admin operations console.",
});

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString();
}

function formatPlanSource(value: string) {
  switch (value) {
    case "admin_override":
      return "Admin override";
    case "subscription":
      return "Subscription";
    case "system":
      return "System entitlement";
    case "e2e_test":
      return "Manual entitlement";
    case "assigned_default":
      return "Assigned default";
    default:
      return value.replaceAll("_", " ");
  }
}

export default async function AdminPage() {
  await requireAdminUser();
  const snapshot = await getAdminSnapshot();

  return (
    <div className="page-shell min-h-screen py-8">
      <div className="space-y-6">
        <section className="soft-panel px-6 py-6">
          <p className="pill">Admin</p>
          <h1 className="mt-4 text-4xl font-semibold">Operations console</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            Review assigned plan state, effective member access, subscription
            health, onboarding progress, safety flags, and operational events in
            one place.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/studio"
              className="rounded-full border border-border bg-white/80 px-4 py-3 text-sm font-medium"
            >
              Open Sanity Studio
            </Link>
            <Link
              href="/insights"
              className="rounded-full border border-border bg-white/80 px-4 py-3 text-sm font-medium"
            >
              View public content hub
            </Link>
          </div>
          <div className="mt-5 rounded-[1.5rem] border border-border/70 bg-white/75 px-4 py-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Admin access policy</p>
            <p className="mt-2">
              Role assignment is synced from <span className="font-medium text-foreground">{getAdminEmailConfigLabel()}</span>.
              Internal admin accounts bypass member billing gates, onboarding locks,
              and daily usage caps.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {snapshot.adminPolicy.configuredEmails.length === 0 ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  No admin email configured
                </span>
              ) : (
                snapshot.adminPolicy.configuredEmails.map((email) => (
                  <span
                    key={email}
                    className="rounded-full border border-border/70 bg-secondary/70 px-3 py-1 text-xs font-medium text-foreground"
                  >
                    {email}
                  </span>
                ))
              )}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Admin accounts in app: {snapshot.adminPolicy.adminCount}
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            {
              label: "Total members",
              value: snapshot.summary.totalMembers,
              helper: "All member accounts in the app",
            },
            {
              label: "Onboarded",
              value: snapshot.summary.onboardedMembers,
              helper: "Finished onboarding and plan setup",
            },
            {
              label: "Paid access",
              value: snapshot.summary.paidMembers,
              helper: "Effective plan above Starter",
            },
            {
              label: "Safety caution threads",
              value: snapshot.summary.cautionConversations,
              helper: "Coach conversations marked caution",
            },
            {
              label: "Pending cancellations",
              value: snapshot.summary.pendingCancellations,
              helper: "Subscriptions ending at next billing date",
            },
          ].map((item) => (
            <div key={item.label} className="soft-panel px-5 py-5">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold">{item.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.helper}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
          <div className="min-w-0 soft-panel px-5 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold">Plan exceptions</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Members whose assigned plan, effective access, cancellation
                  state, or safety lane may need admin review.
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {snapshot.planExceptions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No plan or safety exceptions right now.
                </p>
              ) : (
                snapshot.planExceptions.map((member) => (
                  <div
                    key={member.supabaseUserId}
                    className="rounded-[1.5rem] border border-border/70 bg-white/80 px-4 py-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{member.fullName}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {member.planMismatch ? (
                          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                            Plan mismatch
                          </span>
                        ) : null}
                        {member.cancelAtNextBillingDate ? (
                          <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                            Cancellation pending
                          </span>
                        ) : null}
                        {member.cautionConversationCount > 0 ? (
                          <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
                            {member.cautionConversationCount} caution threads
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-[1.25rem] bg-secondary/60 px-3 py-3 text-sm text-muted-foreground">
                        Assigned plan:{" "}
                        <span className="font-medium text-foreground">
                          {member.assignedPlan}
                        </span>
                      </div>
                      <div className="rounded-[1.25rem] bg-secondary/60 px-3 py-3 text-sm text-muted-foreground">
                        Effective access:{" "}
                        <span className="font-medium text-foreground">
                          {member.effectivePlan}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="min-w-0 soft-panel px-5 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold">Member access view</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Compare assigned plan, actual access source, billing state,
                  onboarding completion, and the latest wellness signals.
                </p>
              </div>
            </div>
            <div className="mt-5 min-w-0 overflow-hidden rounded-[1.5rem] border border-border/70">
              <div className="overflow-x-auto">
                <table className="min-w-[78rem] w-full text-sm">
                  <thead className="bg-secondary/70 text-left text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Member</th>
                      <th className="px-4 py-3 font-medium">Assigned plan</th>
                      <th className="px-4 py-3 font-medium">Effective access</th>
                      <th className="px-4 py-3 font-medium">Source</th>
                      <th className="px-4 py-3 font-medium">Billing</th>
                      <th className="px-4 py-3 font-medium">Onboarding</th>
                      <th className="px-4 py-3 font-medium">AI limit</th>
                      <th className="px-4 py-3 font-medium">Last active</th>
                      <th className="px-4 py-3 font-medium">Attention</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 bg-white/75">
                    {snapshot.members.map((member) => (
                      <tr key={member.supabaseUserId}>
                        <td className="px-4 py-4 align-top">
                          <p className="font-medium">{member.fullName}</p>
                          <p className="mt-1 text-muted-foreground">{member.email}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {member.activeGoalSummary ?? "No goal summary yet"}
                          </p>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <p className="font-medium">{member.assignedPlan}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {member.assignedPlanKey}
                          </p>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <p className="font-medium">{member.effectivePlan}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {member.planMismatch ? "Does not match assigned plan" : "In sync"}
                          </p>
                        </td>
                        <td className="px-4 py-4 align-top capitalize">
                          {formatPlanSource(member.planSource)}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <p className="font-medium capitalize">{member.billingStatus}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {member.nextBillingDate
                              ? `Next ${new Date(member.nextBillingDate).toLocaleDateString()}`
                              : "No renewal scheduled"}
                          </p>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <p className="font-medium">
                            {member.onboardingCompleted ? "Complete" : "Pending"}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Check-in: {formatDate(member.lastCheckInAt)}
                          </p>
                        </td>
                        <td className="px-4 py-4 align-top">
                          {member.aiDailyLimit} / day
                        </td>
                        <td className="px-4 py-4 align-top">
                          {formatDate(member.lastActiveAt)}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-wrap gap-2">
                            {member.planMismatch ? (
                              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                                Plan mismatch
                              </span>
                            ) : null}
                            {member.cancelAtNextBillingDate ? (
                              <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
                                Cancellation
                              </span>
                            ) : null}
                            {member.cautionConversationCount > 0 ? (
                              <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
                                {member.cautionConversationCount} caution
                              </span>
                            ) : null}
                            {!member.needsAttention ? (
                              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                Healthy
                              </span>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="soft-panel px-5 py-5">
            <h2 className="text-2xl font-semibold">Subscriptions</h2>
            <div className="mt-4 space-y-3">
              {snapshot.subscriptions.map((subscription) => (
                <div
                  key={subscription.subscriptionId}
                  className="rounded-[1.5rem] bg-white/75 px-4 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{subscription.plan}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {subscription.customerEmail}
                      </p>
                    </div>
                    <span className="rounded-full border border-border/70 bg-secondary/70 px-3 py-1 text-xs font-medium capitalize text-foreground">
                      {subscription.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {subscription.currency} {Number(subscription.recurringPreTaxAmount).toFixed(2)}
                    {subscription.nextBillingDate
                      ? ` • Next billing ${new Date(subscription.nextBillingDate).toLocaleDateString()}`
                      : " • No next billing date"}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Subscription ID: {subscription.subscriptionId}
                  </p>
                  {subscription.cancelAtNextBillingDate ? (
                    <p className="mt-2 text-xs font-medium text-sky-700">
                      Scheduled to cancel at period end
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="soft-panel px-5 py-5">
            <h2 className="text-2xl font-semibold">Flagged conversations</h2>
            <div className="mt-4 space-y-3">
              {snapshot.flaggedConversations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No caution flags at the moment.
                </p>
              ) : (
                snapshot.flaggedConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="rounded-[1.5rem] bg-white/75 px-4 py-4"
                  >
                    <p className="font-medium">{conversation.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {conversation.memberName}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {conversation.safetyStatus} • Updated {formatDate(conversation.updatedAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="soft-panel px-5 py-5">
            <h2 className="text-2xl font-semibold">Operational feed</h2>
            <div className="mt-4 space-y-3">
              {snapshot.operationalFeed.map((event) => (
                <div key={event.id} className="rounded-[1.5rem] bg-white/75 px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {event.memberName}
                      </p>
                    </div>
                    <span className="rounded-full border border-border/70 bg-secondary/70 px-3 py-1 text-xs font-medium text-foreground">
                      {event.type}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {event.body}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {formatDate(event.createdAt)} • {event.status}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
