import { BadgeCheck, ListTodo, Sparkles } from "lucide-react";
import { and, eq, gte } from "drizzle-orm";
import { subDays } from "date-fns";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { HabitChecklist } from "@/components/dashboard/habit-checklist";
import { db } from "@/lib/drizzle/client";
import { habitLogs, habitTemplates } from "@/lib/drizzle/schema";
import { requireCurrentAppUser } from "@/lib/healthfit/server/auth";

export default async function HabitsPage() {
  const user = await requireCurrentAppUser();
  const [templates, logs] = await Promise.all([
    db.query.habitTemplates.findMany({
      where: eq(habitTemplates.userId, user.supabaseUserId),
    }),
    db.query.habitLogs.findMany({
      where: and(
        eq(habitLogs.userId, user.supabaseUserId),
        gte(habitLogs.createdAt, subDays(new Date(), 1).toISOString())
      ),
    }),
  ]);
  const completedToday = templates.filter((habit) =>
    logs.some((log) => log.habitTemplateId === habit.id && log.status === "done")
  ).length;

  return (
    <div className="space-y-10">
      <section className="soft-panel grid gap-8 px-8 py-10 sm:px-10 2xl:grid-cols-[minmax(0,1.08fr)_minmax(24rem,0.92fr)] 2xl:gap-12">
        <div className="min-w-0">
          <p className="pill">Habits</p>
          <h1 className="mt-5 text-4xl font-semibold sm:text-5xl">
            Daily actions should feel clear, not compressed.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
            Track the small repeatable actions that hold the rest of the system together, with enough space to actually read and act on each one.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-1">
          <DashboardStatCard
            icon={ListTodo}
            label="Habit templates"
            value={templates.length}
            detail="Active habits currently available in your daily checklist."
            tone="brand"
          />
          <DashboardStatCard
            icon={BadgeCheck}
            label="Completed today"
            value={completedToday}
            detail="Habits marked done across the most recent daily logs."
          />
          <DashboardStatCard
            icon={Sparkles}
            label="Still open"
            value={Math.max(templates.length - completedToday, 0)}
            detail="Remaining habits you can still complete today."
          />
        </div>
      </section>

      <HabitChecklist
        habits={templates.map((habit) => ({
          id: habit.id,
          title: habit.title,
          description: habit.description,
          completed: logs.some((log) => log.habitTemplateId === habit.id && log.status === "done"),
        }))}
      />
    </div>
  );
}
