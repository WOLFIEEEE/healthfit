import { Activity, Droplets, Flame, Utensils } from "lucide-react";
import { eq } from "drizzle-orm";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { LogMealForm } from "@/components/dashboard/log-meal-form";
import { db } from "@/lib/drizzle/client";
import { mealLogs, memberProfiles } from "@/lib/drizzle/schema";
import { requireCurrentAppUser } from "@/lib/healthfit/server/auth";

export default async function NutritionPage() {
  const user = await requireCurrentAppUser();
  const [profile, meals] = await Promise.all([
    db.query.memberProfiles.findFirst({
      where: eq(memberProfiles.userId, user.supabaseUserId),
    }),
    db.query.mealLogs.findMany({
      where: eq(mealLogs.userId, user.supabaseUserId),
      orderBy: (table, helpers) => [helpers.desc(table.loggedAt)],
      limit: 10,
    }),
  ]);

  return (
    <div className="space-y-10">
      <section className="soft-panel grid gap-8 px-8 py-10 sm:px-10 2xl:grid-cols-[minmax(0,1.05fr)_minmax(24rem,0.95fr)] 2xl:gap-12">
        <div className="min-w-0">
          <p className="pill">Nutrition</p>
          <h1 className="mt-5 text-4xl font-semibold sm:text-5xl">
            Targets and meal logging with room to read.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
            Keep the inputs simple, but give the targets enough space so calories, macros, and hydration are easy to scan at a glance.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <DashboardStatCard
            icon={Flame}
            label="Calories"
            value={`${profile?.calorieTarget ?? 2200} kcal`}
            detail="Daily calorie target generated from your current goal setup."
            tone="brand"
          />
          <DashboardStatCard
            icon={Utensils}
            label="Protein"
            value={`${profile?.proteinTargetGrams ?? 140} g`}
            detail="Daily protein target for recovery and consistency."
          />
          <DashboardStatCard
            icon={Activity}
            label="Carbs"
            value={`${profile?.carbsTargetGrams ?? 220} g`}
            detail="Daily carbohydrate target for training support and energy."
          />
          <DashboardStatCard
            icon={Droplets}
            label="Hydration"
            value={`${profile?.hydrationTargetMl ?? 2500} ml`}
            detail="Daily hydration target reflected in habits, meal logs, and summaries."
          />
        </div>
      </section>

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1.08fr)_minmax(24rem,0.92fr)] 2xl:gap-12">
        <section className="soft-panel min-w-0 px-8 py-10 sm:px-10">
          <h2 className="text-2xl font-semibold">Recent meals</h2>
          <div className="mt-5 grid gap-4 2xl:grid-cols-2">
            {meals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No meals logged yet.</p>
            ) : (
              meals.map((meal) => (
                <div key={meal.id} className="surface-card min-w-0 px-5 py-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{meal.title}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {meal.mealType}
                      </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>{meal.calories} kcal</div>
                      <div>{meal.proteinGrams}g protein</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <LogMealForm />
      </div>
    </div>
  );
}
