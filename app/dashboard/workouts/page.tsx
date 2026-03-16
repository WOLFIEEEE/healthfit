import { desc, eq } from "drizzle-orm";
import { LogWorkoutForm } from "@/components/dashboard/log-workout-form";
import { db } from "@/lib/drizzle/client";
import { weeklyPrograms, workoutLogs } from "@/lib/drizzle/schema";
import { requireCurrentAppUser } from "@/lib/healthfit/server/auth";

export default async function WorkoutsPage() {
  const user = await requireCurrentAppUser();
  const [program, logs] = await Promise.all([
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
  ]);

  return (
    <div className="space-y-6">
      <section className="soft-panel px-6 py-6">
        <p className="pill">Workouts</p>
        <h1 className="mt-4 text-4xl font-semibold">Your weekly training flow</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
          {program?.summary ??
            "Complete onboarding to generate your first weekly program and start logging sessions."}
        </p>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {program?.days?.map((day) => (
            <article key={day.id} className="rounded-[1.5rem] bg-white/75 px-4 py-4">
              <p className="text-sm text-muted-foreground">{day.workoutFocus}</p>
              <h2 className="mt-2 text-2xl font-semibold">{day.title}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{day.notes}</p>
              <p className="mt-4 text-sm text-foreground">
                {day.durationMin ?? 45} minute session
              </p>
            </article>
          ))}
        </div>
      </section>
      <LogWorkoutForm />
      <section className="soft-panel px-6 py-6">
        <h2 className="text-2xl font-semibold">Recent sessions</h2>
        <div className="mt-4 grid gap-3">
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No workouts logged yet.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="rounded-[1.5rem] bg-white/75 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
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
