import { Activity, Droplets, Gauge, Sparkles } from "lucide-react";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { getDashboardSnapshot } from "@/lib/healthfit/server/dashboard";
import { requireCurrentAppUser } from "@/lib/healthfit/server/auth";
import { ProgressChart } from "@/components/dashboard/progress-chart";

export default async function ProgressPage() {
  const user = await requireCurrentAppUser();
  const snapshot = await getDashboardSnapshot(user.supabaseUserId);

  return (
    <div className="space-y-10">
      <section className="soft-panel grid gap-8 px-8 py-10 sm:px-10 2xl:grid-cols-[minmax(0,1.08fr)_minmax(24rem,0.92fr)] 2xl:gap-12">
        <div className="min-w-0">
          <p className="pill">Progress</p>
          <h1 className="mt-5 text-4xl font-semibold sm:text-5xl">
            Trends should have enough space to tell the story.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
            Review the broader signal from weight, adherence, hydration, and plan state without squeezing the useful context into tiny blocks.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <DashboardStatCard
            icon={Activity}
            label="Data points"
            value={snapshot.progress.length}
            detail="Entries currently visible in the progress chart."
            tone="brand"
          />
          <DashboardStatCard
            icon={Sparkles}
            label="Goal summary"
            value="Active"
            detail={snapshot.profile.goalSummary}
          />
          <DashboardStatCard
            icon={Droplets}
            label="Hydration target"
            value={`${snapshot.profile.hydrationTargetMl} ml`}
            detail="Hydration target from your active onboarding profile."
          />
          <DashboardStatCard
            icon={Gauge}
            label="Plan status"
            value={snapshot.billing.status}
            detail="Current workspace and billing state reflected in the dashboard."
          />
        </div>
      </section>

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1.16fr)_minmax(22rem,0.84fr)] 2xl:gap-12">
        <ProgressChart data={snapshot.progress} />
        <section className="soft-panel px-8 py-10 sm:px-10">
          <p className="pill">Snapshot</p>
          <h2 className="mt-4 text-2xl font-semibold">What the recent trend is saying</h2>
          <div className="mt-6 grid gap-4">
            <div className="surface-card px-5 py-5">
              <p className="text-sm text-muted-foreground">Goal summary</p>
              <p className="mt-2 text-xl font-semibold">{snapshot.profile.goalSummary}</p>
            </div>
            <div className="surface-card px-5 py-5">
              <p className="text-sm text-muted-foreground">Hydration target</p>
              <p className="mt-2 text-xl font-semibold">
                {snapshot.profile.hydrationTargetMl} ml
              </p>
            </div>
            <div className="surface-card px-5 py-5">
              <p className="text-sm text-muted-foreground">Plan status</p>
              <p className="mt-2 text-xl font-semibold capitalize">
                {snapshot.billing.status}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
