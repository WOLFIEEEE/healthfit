import { Activity, CalendarClock, Dumbbell, Sparkles } from "lucide-react";
import { eq } from "drizzle-orm";
import { AdaptiveProgramCard } from "@/components/dashboard/adaptive-program-card";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { LogWorkoutForm } from "@/components/dashboard/log-workout-form";
import { db } from "@/lib/drizzle/client";
import { weeklyPrograms, workoutLogs } from "@/lib/drizzle/schema";
import { requireCurrentAppUser } from "@/lib/healthfit/server/auth";
import { getAdaptivePlanningSnapshot } from "@/lib/healthfit/server/adaptive-planning";

export default async function WorkoutsPage() {
  const user = await requireCurrentAppUser();
  const [program, logs, adaptivePlan] = await Promise.all([
    db.query.weeklyPrograms.findFirst({
      where: eq(weeklyPrograms.userId, user.supabaseUserId),
      with: {
        days: true,
      },
      orderBy: (table, helpers) => [helpers.desc(table.weekStartDate)],
    }),
    db.query.workoutLogs.findMany({
      where: eq(workoutLogs.userId, user.supabaseUserId),
      orderBy: (table, helpers) => [helpers.desc(table.loggedAt)],
      limit: 8,
    }),
    getAdaptivePlanningSnapshot(user.supabaseUserId),
  ]);
  const completedSessions = logs.filter((log) => log.completed).length;

  return (
    <div className="space-y-10">
      <section className="soft-panel grid gap-8 px-8 py-10 sm:px-10 2xl:grid-cols-[minmax(0,1.08fr)_minmax(24rem,0.92fr)] 2xl:gap-12">
        <div className="min-w-0">
          <p className="pill">Workouts</p>
          <h1 className="mt-5 text-4xl font-semibold sm:text-5xl">
            Training built to stay useful, not crowded.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
            {program?.summary ??
              "Complete onboarding to generate your first weekly program and start logging sessions."}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <DashboardStatCard
            icon={CalendarClock}
            label="Program days"
            value={program?.days?.length ?? 0}
            detail="Planned sessions in the latest active weekly program."
            tone="brand"
          />
          <DashboardStatCard
            icon={Activity}
            label="Recent logs"
            value={logs.length}
            detail="Recent training entries available in the dashboard."
          />
          <DashboardStatCard
            icon={Dumbbell}
            label="Completed"
            value={completedSessions}
            detail="Completed sessions across the most recent workout log entries."
          />
          <DashboardStatCard
            icon={Sparkles}
            label="Adaptive mode"
            value={adaptivePlan.mode}
            detail={adaptivePlan.reason}
          />
        </div>
      </section>

      <AdaptiveProgramCard
        mode={adaptivePlan.mode}
        reason={adaptivePlan.reason}
        summary={adaptivePlan.summary}
        focus={adaptivePlan.focus}
        nextActions={adaptivePlan.nextActions}
        shouldPromptReplan={adaptivePlan.shouldPromptReplan}
      />

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1.1fr)_minmax(24rem,0.9fr)] 2xl:gap-12">
        <section className="soft-panel min-w-0 px-8 py-10 sm:px-10">
          <p className="pill">Current plan</p>
          <h2 className="mt-4 text-3xl font-semibold">Your weekly training flow</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
            {program?.days?.length ? (
              program.days.map((day) => (
                <article
                  key={day.id}
                  className="surface-card min-w-0 px-5 py-6"
                >
                  <p className="text-sm text-muted-foreground">{day.workoutFocus}</p>
                  <h3 className="mt-2 text-2xl font-semibold">{day.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {day.notes}
                  </p>
                  <p className="mt-4 text-sm text-foreground">
                    {day.durationMin ?? 45} minute session
                  </p>
                </article>
              ))
            ) : (
              <div className="surface-card px-5 py-6 text-sm text-muted-foreground md:col-span-2 2xl:col-span-3">
                No weekly program is active yet. Finish onboarding or rebuild your week with AI to populate this space.
              </div>
            )}
          </div>
        </section>

        <LogWorkoutForm />
      </div>

      <section className="soft-panel px-8 py-10 sm:px-10">
        <h2 className="text-2xl font-semibold">Recent sessions</h2>
        <div className="mt-5 grid gap-4 2xl:grid-cols-2">
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No workouts logged yet.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="surface-card min-w-0 px-5 py-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{log.workoutName}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(log.loggedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>{log.durationMin} min</div>
                    <div>Effort {log.effortScore ?? "n/a"}/10</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
