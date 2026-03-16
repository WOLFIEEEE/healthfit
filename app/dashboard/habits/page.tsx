import { and, eq, gte } from "drizzle-orm";
import { subDays } from "date-fns";
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

  return (
    <div className="space-y-6">
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
