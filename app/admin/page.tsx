import { requireAdminUser } from "@/lib/healthfit/server/auth";
import { getAdminSnapshot } from "@/lib/healthfit/server/dashboard";
import Link from "next/link";

export default async function AdminPage() {
  await requireAdminUser();
  const snapshot = await getAdminSnapshot();

  return (
    <div className="page-shell min-h-screen py-8">
      <div className="space-y-6">
        <section className="soft-panel px-6 py-6">
          <p className="pill">Admin</p>
          <h1 className="mt-4 text-4xl font-semibold">Operations console</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            Review member records, subscription state, safety-flagged coach
            conversations, and operational events in one place.
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
        </section>
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="soft-panel px-5 py-5">
            <h2 className="text-2xl font-semibold">Members</h2>
            <div className="mt-4 space-y-3">
              {snapshot.members.map((member) => (
                <div key={member.supabaseUserId} className="rounded-[1.5rem] bg-white/75 px-4 py-4">
                  <p className="font-medium">{member.fullName ?? member.email}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {member.currentPlanKey} • {member.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="soft-panel px-5 py-5">
            <h2 className="text-2xl font-semibold">Subscriptions</h2>
            <div className="mt-4 space-y-3">
              {snapshot.subscriptions.map((subscription) => (
                <div key={subscription.subscriptionId} className="rounded-[1.5rem] bg-white/75 px-4 py-4">
                  <p className="font-medium capitalize">{subscription.status}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {subscription.customerEmail}
                  </p>
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
                  <div key={conversation.id} className="rounded-[1.5rem] bg-white/75 px-4 py-4">
                    <p className="font-medium">{conversation.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {conversation.safetyStatus}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
