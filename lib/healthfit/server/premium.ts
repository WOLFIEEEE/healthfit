import { and, eq, gte } from "drizzle-orm";
import { startOfDay, subDays } from "date-fns";
import { getPlanByKey, getPlanByProductId } from "@/lib/config/plans";
import { db } from "@/lib/drizzle/client";
import {
  checkIns,
  coachMessages,
  entitlements,
  goals,
  habitLogs,
  habitTemplates,
  mealLogs,
  memberProfiles,
  subscriptions,
  users,
  weeklyPrograms,
  workoutLogs,
} from "@/lib/drizzle/schema";
import { PremiumExperienceSnapshot } from "@/lib/healthfit/contracts";
import {
  buildCoachPromptSuggestions,
  buildMembershipIntelligence,
  buildWeeklyPerformanceBrief,
} from "@/lib/healthfit/premium";

function average(values: Array<number | null | undefined>) {
  const valid = values.filter((value): value is number => typeof value === "number");
  if (valid.length === 0) {
    return null;
  }

  return Number((valid.reduce((sum, value) => sum + value, 0) / valid.length).toFixed(1));
}

export async function getPremiumExperienceSnapshot(
  userId: string
): Promise<PremiumExperienceSnapshot> {
  const user = await db.query.users.findFirst({
    where: eq(users.supabaseUserId, userId),
  });

  if (!user) {
    throw new Error("User not found");
  }

  const sevenDaysAgo = subDays(new Date(), 7).toISOString();
  const todayStart = startOfDay(new Date()).toISOString();

  const [
    profile,
    activeGoals,
    activeEntitlement,
    activeSubscription,
    latestProgram,
    weeklyWorkoutLogs,
    weeklyMealLogs,
    weeklyHabitLogs,
    memberHabitTemplates,
    weeklyCheckIns,
    weeklyCoachMessages,
    todayCoachMessages,
  ] = await Promise.all([
    db.query.memberProfiles.findFirst({
      where: eq(memberProfiles.userId, userId),
    }),
    db.query.goals.findMany({
      where: and(eq(goals.userId, userId), eq(goals.status, "active")),
    }),
    db.query.entitlements.findFirst({
      where: and(eq(entitlements.userId, userId), eq(entitlements.isActive, true)),
      orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
    }),
    user.currentSubscriptionId
      ? db.query.subscriptions.findFirst({
          where: eq(subscriptions.subscriptionId, user.currentSubscriptionId),
        })
      : Promise.resolve(null),
    db.query.weeklyPrograms.findFirst({
      where: eq(weeklyPrograms.userId, userId),
      with: {
        days: true,
      },
      orderBy: (table, helpers) => [helpers.desc(table.weekStartDate)],
    }),
    db.query.workoutLogs.findMany({
      where: and(eq(workoutLogs.userId, userId), gte(workoutLogs.loggedAt, sevenDaysAgo)),
    }),
    db.query.mealLogs.findMany({
      where: and(eq(mealLogs.userId, userId), gte(mealLogs.loggedAt, sevenDaysAgo)),
    }),
    db.query.habitLogs.findMany({
      where: and(eq(habitLogs.userId, userId), gte(habitLogs.createdAt, sevenDaysAgo)),
    }),
    db.query.habitTemplates.findMany({
      where: eq(habitTemplates.userId, userId),
    }),
    db.query.checkIns.findMany({
      where: and(eq(checkIns.userId, userId), gte(checkIns.createdAt, sevenDaysAgo)),
    }),
    db.query.coachMessages.findMany({
      where: and(
        eq(coachMessages.userId, userId),
        eq(coachMessages.role, "user"),
        gte(coachMessages.createdAt, sevenDaysAgo)
      ),
    }),
    db.query.coachMessages.findMany({
      where: and(
        eq(coachMessages.userId, userId),
        eq(coachMessages.role, "user"),
        gte(coachMessages.createdAt, todayStart)
      ),
    }),
  ]);

  const subscriptionPlan =
    getPlanByProductId(activeSubscription?.productId ?? null) ?? null;
  const fallbackPlan = getPlanByKey(user.currentPlanKey);
  const entitlementPlan = activeEntitlement
    ? getPlanByKey(activeEntitlement.planKey)
    : null;
  const plan =
    subscriptionPlan ??
    (fallbackPlan.key !== "starter" ? fallbackPlan : entitlementPlan) ??
    fallbackPlan;

  const aiDailyLimit = Math.max(
    activeEntitlement?.aiDailyMessageLimit ?? 0,
    plan.entitlements.aiDailyMessages
  );

  const plannedWorkouts =
    latestProgram?.days.length ??
    (Array.isArray(profile?.workoutDays) ? profile.workoutDays.length : 0);

  const targetMeals = (profile?.mealsPerDay ?? 3) * 7;
  const habitLogsTarget = memberHabitTemplates.length * 7;
  const averageDailyWaterMl = Math.round(
    weeklyMealLogs.reduce((sum, item) => sum + item.waterMl, 0) / 7
  );

  const weeklyBrief = buildWeeklyPerformanceBrief({
    goalSummary:
      profile?.goalSummary ?? activeGoals[0]?.title ?? "more consistency and better energy",
    plannedWorkouts,
    completedWorkouts: weeklyWorkoutLogs.filter((item) => item.completed).length,
    mealsLogged: weeklyMealLogs.length,
    targetMeals,
    habitLogsCompleted: weeklyHabitLogs.filter((item) => item.status === "done").length,
    habitLogsTarget,
    hydrationTargetMl: profile?.hydrationTargetMl ?? 2500,
    averageDailyWaterMl,
    averageSleepHours: average(weeklyCheckIns.map((item) => item.sleepHours)),
    averageStressScore: average(weeklyCheckIns.map((item) => item.stressScore)),
    averageEnergyScore: average(weeklyCheckIns.map((item) => item.energyScore)),
    averageAdherenceScore: average(weeklyCheckIns.map((item) => item.adherenceScore)),
    checkInsLogged: weeklyCheckIns.length,
    aiMessagesUsed: weeklyCoachMessages.length,
  });

  const membership = buildMembershipIntelligence({
    plan,
    aiMessagesUsedToday: todayCoachMessages.length,
    aiDailyLimit,
    activeGoals: activeGoals.length,
    maxActiveGoals: plan.entitlements.maxActiveGoals,
  });

  const coachPrompts = buildCoachPromptSuggestions({
    goalSummary:
      profile?.goalSummary ?? activeGoals[0]?.title ?? "stronger routines and better energy",
    brief: weeklyBrief,
    membership,
  });

  return {
    weeklyBrief,
    membership,
    coachPrompts,
  };
}
