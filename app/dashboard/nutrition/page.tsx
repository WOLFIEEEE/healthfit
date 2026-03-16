import { eq } from "drizzle-orm";
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
    <div className="space-y-6">
      <section className="soft-panel grid gap-4 px-6 py-6 md:grid-cols-4">
        {[
          ["Calories", `${profile?.calorieTarget ?? 2200} kcal`],
          ["Protein", `${profile?.proteinTargetGrams ?? 140} g`],
          ["Carbs", `${profile?.carbsTargetGrams ?? 220} g`],
          ["Hydration", `${profile?.hydrationTargetMl ?? 2500} ml`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[1.5rem] bg-white/75 px-4 py-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </section>
      <LogMealForm />
      <section className="soft-panel px-6 py-6">
        <h2 className="text-2xl font-semibold">Recent meals</h2>
        <div className="mt-4 grid gap-3">
          {meals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No meals logged yet.</p>
          ) : (
            meals.map((meal) => (
              <div key={meal.id} className="rounded-[1.5rem] bg-white/75 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
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
    </div>
  );
}
