import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getPlanByKey } from "@/lib/config/plans";
import { requireCurrentAppUser } from "@/lib/healthfit/server/auth";

export default async function SettingsPage() {
  const user = await requireCurrentAppUser();
  const plan = getPlanByKey(user.currentPlanKey);

  return (
    <div className="space-y-6">
      <section className="soft-panel grid gap-4 px-6 py-6 lg:grid-cols-3">
        <div className="surface-card px-4 py-4">
          <p className="text-sm text-muted-foreground">Member profile</p>
          <h1 className="mt-2 text-3xl font-semibold">
            {user.fullName ?? user.email.split("@")[0]}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
          <div className="pill mt-4">{plan.name}</div>
        </div>
        <div className="surface-card px-4 py-4">
          <p className="text-sm text-muted-foreground">Account state</p>
          <p className="mt-2 text-xl font-semibold">
            {user.onboardingCompleted ? "Onboarding complete" : "Onboarding pending"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Consent accepted: {user.wellnessConsentAccepted ? "yes" : "no"}
          </p>
        </div>
        <div className="surface-card px-4 py-4">
          <p className="text-sm text-muted-foreground">Support lane</p>
          <p className="mt-2 text-xl font-semibold">
            {plan.entitlements.prioritySupport ? "Priority support" : "Standard support"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            AI coach: {plan.entitlements.aiCoach ? "enabled" : "not included"}
          </p>
        </div>
      </section>
      <section className="soft-panel px-6 py-6">
        <h2 className="text-2xl font-semibold">Workspace controls</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Keep billing, trust, support, and admin access visible from one clean
          account area.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
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
