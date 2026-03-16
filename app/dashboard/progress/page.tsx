import { getDashboardSnapshot } from "@/lib/healthfit/server/dashboard";
import { requireCurrentAppUser } from "@/lib/healthfit/server/auth";
import { ProgressChart } from "@/components/dashboard/progress-chart";

export default async function ProgressPage() {
  const user = await requireCurrentAppUser();
  const snapshot = await getDashboardSnapshot(user.supabaseUserId);

  return (
    <div className="space-y-6">
      <ProgressChart data={snapshot.progress} />
      <section className="soft-panel grid gap-4 px-6 py-6 md:grid-cols-3">
        <div className="rounded-[1.5rem] bg-white/75 px-4 py-4">
          <p className="text-sm text-muted-foreground">Goal summary</p>
          <p className="mt-2 text-xl font-semibold">{snapshot.profile.goalSummary}</p>
        </div>
        <div className="rounded-[1.5rem] bg-white/75 px-4 py-4">
          <p className="text-sm text-muted-foreground">Hydration target</p>
          <p className="mt-2 text-xl font-semibold">
            {snapshot.profile.hydrationTargetMl} ml
          </p>
        </div>
        <div className="rounded-[1.5rem] bg-white/75 px-4 py-4">
          <p className="text-sm text-muted-foreground">Plan status</p>
          <p className="mt-2 text-xl font-semibold capitalize">
            {snapshot.billing.status}
          </p>
        </div>
      </section>
    </div>
  );
}
