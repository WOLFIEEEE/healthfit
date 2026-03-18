import { CalendarClock, HeartPulse, MoonStar, Sparkles } from "lucide-react";
import { eq } from "drizzle-orm";
import { CheckInForm } from "@/components/dashboard/check-in-form";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { db } from "@/lib/drizzle/client";
import { checkIns } from "@/lib/drizzle/schema";
import { requireCurrentAppUser } from "@/lib/healthfit/server/auth";

export default async function CheckInsPage() {
  const user = await requireCurrentAppUser();
  const recentCheckIns = await db.query.checkIns.findMany({
    where: eq(checkIns.userId, user.supabaseUserId),
    orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
    limit: 8,
  });
  const latestCheckIn = recentCheckIns[0] ?? null;

  return (
    <div className="space-y-10">
      <section className="soft-panel grid gap-8 px-8 py-10 sm:px-10 2xl:grid-cols-[minmax(0,1.08fr)_minmax(24rem,0.92fr)] 2xl:gap-12">
        <div className="min-w-0">
          <p className="pill">Check-ins</p>
          <h1 className="mt-5 text-4xl font-semibold sm:text-5xl">
            Reflection space that stays readable.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
            Check-ins feed your weekly recap, coach context, and recovery guidance, so this page should feel calm and easy to use every day.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <DashboardStatCard
            icon={CalendarClock}
            label="Recent check-ins"
            value={recentCheckIns.length}
            detail="Recent reflection entries currently available in the dashboard."
            tone="brand"
          />
          <DashboardStatCard
            icon={HeartPulse}
            label="Latest energy"
            value={latestCheckIn?.energyScore ?? "n/a"}
            detail="Energy score from your most recent check-in."
          />
          <DashboardStatCard
            icon={MoonStar}
            label="Latest sleep"
            value={
              latestCheckIn?.sleepHours !== null && latestCheckIn?.sleepHours !== undefined
                ? `${latestCheckIn.sleepHours} h`
                : "n/a"
            }
            detail="Sleep hours from your most recent check-in."
          />
          <DashboardStatCard
            icon={Sparkles}
            label="Coach summary"
            value={latestCheckIn ? "Ready" : "Pending"}
            detail={
              latestCheckIn?.aiSummary ??
              "Your first reflection will generate a summary that appears here."
            }
          />
        </div>
      </section>

      <div className="grid gap-10 xl:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] 2xl:gap-12">
        <CheckInForm />
        <section className="soft-panel min-w-0 px-8 py-10 sm:px-10">
          <h2 className="text-2xl font-semibold">Recent reflections</h2>
          <div className="mt-5 grid gap-4 2xl:grid-cols-2">
            {recentCheckIns.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No check-ins yet. Your summaries will appear here after the first one.
              </p>
            ) : (
              recentCheckIns.map((checkIn) => (
                <div key={checkIn.id} className="surface-card min-w-0 px-5 py-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-medium">
                      {new Date(checkIn.createdAt).toLocaleDateString()}
                    </p>
                    <div className="text-sm text-muted-foreground">
                      Mood {checkIn.moodScore} • Energy {checkIn.energyScore} • Adherence{" "}
                      {checkIn.adherenceScore}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {checkIn.aiSummary}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
