import { BadgeCheck, BrainCircuit, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { Button } from "@/components/ui/button";
import { getPlanByKey } from "@/lib/config/plans";
import { getAdminAccessPlan } from "@/lib/healthfit/server/access";
import { requireCurrentAppUser } from "@/lib/healthfit/server/auth";

export default async function SettingsPage() {
  const user = await requireCurrentAppUser();
  const plan =
    user.role === "admin" ? getAdminAccessPlan() : getPlanByKey(user.currentPlanKey);
  const displayName = user.fullName ?? user.email.split("@")[0];
  const accountState = user.onboardingCompleted
    ? "Onboarding complete"
    : "Onboarding pending";
  const accountStatusValue = user.onboardingCompleted ? "Complete" : "Pending";
  const aiCoachAccess = user.role === "admin" ? "Unlimited" : plan.entitlements.aiCoach ? "Enabled" : "Locked";
  const supportLane = plan.entitlements.prioritySupport ? "Priority" : "Standard";
  const aiCoachSummary =
    user.role === "admin"
      ? "AI coach: unlimited"
      : plan.entitlements.aiCoach
        ? "AI coach: enabled"
        : "AI coach: not included";

  return (
    <div className="space-y-10">
      <section className="soft-panel grid gap-8 px-8 py-10 sm:px-10 2xl:grid-cols-[minmax(0,1.04fr)_minmax(24rem,0.96fr)] 2xl:gap-12">
        <div className="min-w-0">
          <p className="pill">Settings</p>
          <h1 className="mt-5 text-4xl font-semibold sm:text-5xl">{displayName}</h1>
          <p className="mt-4 text-base text-muted-foreground">{user.email}</p>
          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
            <p>{accountState}</p>
            <p>{aiCoachSummary}</p>
          </div>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
            Keep trust, account state, support, and billing controls in one place without squeezing the useful account details into small cards.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="pill">{plan.name}</span>
            <span className="rounded-full border border-border/70 bg-white/75 px-3 py-1 text-xs font-medium text-muted-foreground">
              {user.role === "admin" ? "Admin workspace" : "Member workspace"}
            </span>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <DashboardStatCard
            icon={BadgeCheck}
            label="Plan access"
            value={plan.name}
            detail="Current workspace tier and entitlement set attached to this account."
            tone="brand"
          />
          <DashboardStatCard
            icon={ShieldCheck}
            label="Account state"
            value={accountStatusValue}
            detail={
              user.role === "admin"
                ? "Internal admin access bypasses standard consent and onboarding gates."
                : `Onboarding is ${user.onboardingCompleted ? "complete" : "still pending"}, wellness consent is ${user.wellnessConsentAccepted ? "accepted" : "not accepted"}, and disclaimer acceptance is ${user.disclaimerAccepted ? "recorded" : "missing"}.`
            }
          />
          <DashboardStatCard
            icon={BrainCircuit}
            label="AI coach"
            value={aiCoachAccess}
            detail={
              user.role === "admin"
                ? "Admin access keeps AI coach and internal tools available for testing."
                : plan.entitlements.aiCoach
                  ? "AI coach guidance is included in your current plan."
                  : "AI coach is not included on the current plan."
            }
          />
          <DashboardStatCard
            icon={Sparkles}
            label="Support lane"
            value={supportLane}
            detail={
              plan.entitlements.prioritySupport
                ? "Priority support is included with this plan."
                : "This account uses the standard support lane."
            }
          />
        </div>
      </section>
      <section className="soft-panel grid gap-8 px-8 py-10 sm:px-10 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] 2xl:gap-12">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold">Workspace controls</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            Keep billing, trust, support, and admin access visible from one clean account area with actions that stay easy to reach.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          <Button asChild className="rounded-full">
            <Link href="/dashboard/billing">Manage billing</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/contact">Contact support</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/privacy">Privacy policy</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/disclaimer">Wellness disclaimer</Link>
          </Button>
          {user.role === "admin" ? (
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/admin">Open admin</Link>
            </Button>
          ) : null}
        </div>
      </section>
    </div>
  );
}
