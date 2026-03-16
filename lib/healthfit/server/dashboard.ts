import { and, desc, eq, gte } from "drizzle-orm";
import { subDays } from "date-fns";
import { getPlanByProductId, getPlanByKey } from "@/lib/config/plans";
import {
  assessments,
  checkIns,
  coachConversations,
  coachMessages,
  entitlements,
  goals,
  habitLogs,
  habitTemplates,
  mealLogs,
  memberProfiles,
  notifications,
  payments,
  progressMetrics,
  programDays,
  subscriptions,
  users,
  weeklyPrograms,
  workoutLogs,
} from "@/lib/drizzle/schema";
import { db } from "@/lib/drizzle/client";
import { DashboardSnapshot, PlanKey } from "@/lib/healthfit/contracts";

function numberOrDefault(value: number | null | undefined, fallback: number) {
  return typeof value === "number" ? value : fallback;
}

export async function getDashboardSnapshot(userId: string): Promise<DashboardSnapshot> {
  const [
    user,
    profile,
    activeGoals,
    recentAssessment,
    latestProgram,
    latestCheckIn,
    recentProgress,
    todayWorkoutLogs,
    todayMealLogs,
    habits,
    todayHabitLogs,
    unreadNotifications,
    latestConversation,
  ] = await Promise.all([
    db.query.users.findFirst({
      where: eq(users.supabaseUserId, userId),
    }),
    db.query.memberProfiles.findFirst({
      where: eq(memberProfiles.userId, userId),
    }),
    db.query.goals.findMany({
      where: and(eq(goals.userId, userId), eq(goals.status, "active")),
      orderBy: (table, helpers) => [helpers.asc(table.priority)],
      limit: 3,
    }),
    db.query.assessments.findFirst({
      where: eq(assessments.userId, userId),
      orderBy: (table, helpers) => [helpers.desc(table.recordedAt)],
    }),
    db.query.weeklyPrograms.findFirst({
      where: eq(weeklyPrograms.userId, userId),
      with: {
        days: true,
      },
      orderBy: (table, helpers) => [helpers.desc(table.weekStartDate)],
    }),
    db.query.checkIns.findFirst({
      where: eq(checkIns.userId, userId),
      orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
    }),
    db.query.progressMetrics.findMany({
      where: eq(progressMetrics.userId, userId),
      orderBy: (table, helpers) => [helpers.desc(table.recordedAt)],
      limit: 8,
    }),
    db.query.workoutLogs.findMany({
      where: and(
        eq(workoutLogs.userId, userId),
        gte(workoutLogs.loggedAt, subDays(new Date(), 1).toISOString())
      ),
      orderBy: (table, helpers) => [helpers.desc(table.loggedAt)],
      limit: 4,
    }),
    db.query.mealLogs.findMany({
      where: and(
        eq(mealLogs.userId, userId),
        gte(mealLogs.loggedAt, subDays(new Date(), 1).toISOString())
      ),
      orderBy: (table, helpers) => [helpers.desc(table.loggedAt)],
      limit: 10,
    }),
    db.query.habitTemplates.findMany({
      where: eq(habitTemplates.userId, userId),
      orderBy: (table, helpers) => [helpers.asc(table.title)],
    }),
    db.query.habitLogs.findMany({
      where: and(
        eq(habitLogs.userId, userId),
        gte(habitLogs.createdAt, subDays(new Date(), 1).toISOString())
      ),
      orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
      limit: 12,
    }),
    db.query.notifications.findMany({
      where: eq(notifications.userId, userId),
      orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
      limit: 5,
    }),
    db.query.coachConversations.findFirst({
      where: eq(coachConversations.userId, userId),
      orderBy: (table, helpers) => [helpers.desc(table.lastMessageAt)],
    }),
  ]);

  if (!user) {
    throw new Error("User not found");
  }

  const activeSubscription = user.currentSubscriptionId
    ? await db.query.subscriptions.findFirst({
        where: eq(subscriptions.subscriptionId, user.currentSubscriptionId),
      })
    : null;

  const invoiceCount = user.dodoCustomerId
    ? await db.query.payments.findMany({
        where: eq(payments.customerId, user.dodoCustomerId),
      }).then((records) => records.length)
    : 0;

  const activeEntitlement =
    (await db.query.entitlements.findFirst({
      where: and(eq(entitlements.userId, userId), eq(entitlements.isActive, true)),
      orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
    })) ?? null;

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

  const todayNutrition = todayMealLogs.reduce(
    (accumulator, meal) => ({
      calories: accumulator.calories + meal.calories,
      protein: accumulator.protein + meal.proteinGrams,
      carbs: accumulator.carbs + meal.carbsGrams,
      fat: accumulator.fat + meal.fatGrams,
      waterMl: accumulator.waterMl + meal.waterMl,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, waterMl: 0 }
  );

  const habitCompletionRate =
    habits.length === 0
      ? 0
      : Math.round((todayHabitLogs.length / habits.length) * 100);

  const nextWorkout =
    latestProgram?.days
      ?.slice()
      .sort((left, right) => left.dayOfWeek - right.dayOfWeek)
      .find(() => true) ?? null;

  const currentWeightPoint =
    recentProgress.find((metric) => metric.metricType === "weight") ?? null;
  const adherencePoint =
    recentProgress.find((metric) => metric.metricType === "adherence") ?? null;

  return {
    user: {
      id: user.supabaseUserId,
      email: user.email,
      fullName: user.fullName ?? user.email.split("@")[0],
      avatarUrl: user.avatarUrl,
      role: user.role as "member" | "admin",
      currentPlanKey: plan.key as PlanKey,
      onboardingCompleted: user.onboardingCompleted,
    },
    onboarding: {
      completed: user.onboardingCompleted,
      currentStep: user.onboardingCompleted ? "complete" : "profile",
    },
    profile: {
      goalSummary:
        profile?.goalSummary ??
        activeGoals[0]?.title ??
        "Build a stronger, more sustainable routine.",
      activityLevel: profile?.activityLevel ?? "moderate",
      experienceLevel: profile?.experienceLevel ?? "beginner",
      hydrationTargetMl: profile?.hydrationTargetMl ?? 2500,
      macroTargets: {
        calories: numberOrDefault(profile?.calorieTarget, 2200),
        protein: numberOrDefault(profile?.proteinTargetGrams, 140),
        carbs: numberOrDefault(profile?.carbsTargetGrams, 220),
        fat: numberOrDefault(profile?.fatTargetGrams, 70),
      },
    },
    metrics: [
      {
        label: "Plan",
        value: plan.name,
        helper: plan.tagline,
      },
      {
        label: "Active goals",
        value: `${activeGoals.length}`,
        helper: activeGoals[0]?.title ?? "Create your first milestone",
      },
      {
        label: "Readiness",
        value: `${numberOrDefault(recentAssessment?.readinessScore, 7)}/10`,
        helper: "Updated from your latest assessment",
      },
      {
        label: "Today's workouts",
        value: `${todayWorkoutLogs.length}`,
        helper: "Counted from the last 24 hours",
      },
    ],
    nextWorkout: nextWorkout
      ? {
          title: nextWorkout.title,
          focus: nextWorkout.workoutFocus ?? "Movement session",
          dayLabel: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
            nextWorkout.dayOfWeek
          ],
          durationMin: nextWorkout.durationMin ?? 45,
        }
      : null,
    todayNutrition,
    habits: {
      completionRate: habitCompletionRate,
      completedToday: todayHabitLogs.length,
      totalToday: habits.length,
    },
    checkIn: latestCheckIn
      ? {
          moodScore: latestCheckIn.moodScore,
          energyScore: latestCheckIn.energyScore,
          stressScore: latestCheckIn.stressScore,
          sleepHours: latestCheckIn.sleepHours,
          summary: latestCheckIn.aiSummary,
        }
      : null,
    progress: recentProgress
      .slice()
      .reverse()
      .map((metric) => ({
        date: metric.recordedAt,
        weightKg: metric.metricType === "weight" ? metric.value : currentWeightPoint?.value ?? null,
        adherence:
          metric.metricType === "adherence"
            ? metric.value
            : adherencePoint?.value ?? null,
      })),
    billing: {
      plan: plan.key,
      status: activeSubscription?.status ?? "starter",
      nextBillingDate: activeSubscription?.nextBillingDate ?? null,
      invoicesCount: invoiceCount,
    },
    notifications: unreadNotifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      body: notification.body,
      createdAt: notification.createdAt,
      readAt: notification.readAt,
    })),
  };
}

export async function getCoachSnapshot(userId: string) {
  const [conversations, recentMessages] = await Promise.all([
    db.query.coachConversations.findMany({
      where: eq(coachConversations.userId, userId),
      orderBy: (table, helpers) => [helpers.desc(table.lastMessageAt)],
      limit: 6,
    }),
    db.query.coachMessages.findMany({
      where: eq(coachMessages.userId, userId),
      orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
      limit: 20,
    }),
  ]);

  return {
    conversations,
    recentMessages: recentMessages.slice().reverse(),
  };
}

export async function getBillingSnapshot(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.supabaseUserId, userId),
  });

  if (!user) {
    throw new Error("User not found");
  }

  const [subscription, invoices] = await Promise.all([
    user.currentSubscriptionId
      ? db.query.subscriptions.findFirst({
          where: eq(subscriptions.subscriptionId, user.currentSubscriptionId),
        })
      : Promise.resolve(null),
    user.dodoCustomerId
      ? db.query.payments.findMany({
          where: eq(payments.customerId, user.dodoCustomerId),
          orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
          limit: 12,
        })
      : Promise.resolve([]),
  ]);

  return {
    user,
    subscription,
    invoices,
  };
}

export async function getAdminSnapshot() {
  const [memberCount, activeSubscriptions, flaggedConversations, announcementsList] =
    await Promise.all([
      db.query.users.findMany({
        orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
        limit: 12,
      }),
      db.query.subscriptions.findMany({
        orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
        limit: 12,
      }),
      db.query.coachConversations.findMany({
        where: eq(coachConversations.safetyStatus, "caution"),
        orderBy: (table, helpers) => [helpers.desc(table.updatedAt)],
        limit: 12,
      }),
      db.query.notifications.findMany({
        orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
        limit: 12,
      }),
    ]);

  return {
    members: memberCount,
    subscriptions: activeSubscriptions,
    flaggedConversations,
    operationalFeed: announcementsList,
  };
}
