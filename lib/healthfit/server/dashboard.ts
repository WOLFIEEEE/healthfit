import { and, eq, gte } from "drizzle-orm";
import { subDays } from "date-fns";
import { getPlanByProductId, getPlanByKey } from "@/lib/config/plans";
import { getConfiguredAdminEmails } from "@/lib/config/admin";
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
  subscriptions,
  users,
  weeklyPrograms,
  workoutLogs,
} from "@/lib/drizzle/schema";
import { db } from "@/lib/drizzle/client";
import {
  coachActionsSchema,
  coachContextSchema,
  DashboardSnapshot,
  PlanKey,
} from "@/lib/healthfit/contracts";
import {
  buildCoachContextSnapshot,
  buildCoachMemorySnapshot,
} from "@/lib/healthfit/server/coach-intelligence";
import { resolvePlanAccess } from "@/lib/healthfit/server/access";
import { ensureProactiveInsights } from "@/lib/healthfit/server/proactive-insights";

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
  ]);

  if (!user) {
    throw new Error("User not found");
  }

  const hasOnboardingArtifacts = Boolean(
    profile || activeGoals.length > 0 || recentAssessment || latestProgram
  );

  let brief = await ensureProactiveInsights(userId);

  if (!brief && (user.onboardingCompleted || hasOnboardingArtifacts)) {
    const memory = await buildCoachMemorySnapshot(userId);
    brief = await ensureProactiveInsights(userId, memory);
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

  const access = resolvePlanAccess({
    role: user.role,
    currentPlanKey: user.currentPlanKey,
    activeEntitlementPlanKey: activeEntitlement?.planKey ?? null,
    activeEntitlementAiDailyLimit: activeEntitlement?.aiDailyMessageLimit ?? null,
    activeSubscriptionProductId: activeSubscription?.productId ?? null,
  });
  const plan = access.plan;

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
      status: activeSubscription?.status ?? (user.role === "admin" ? "admin_access" : "starter"),
      nextBillingDate: activeSubscription?.nextBillingDate ?? null,
      invoicesCount: invoiceCount,
    },
    brief,
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
  const memory = await buildCoachMemorySnapshot(userId);
  const [brief, conversations, recentMessages] = await Promise.all([
    ensureProactiveInsights(userId, memory),
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
    brief,
    context: buildCoachContextSnapshot(memory),
    conversations,
    recentMessages: recentMessages.slice().reverse().map((message) => {
      const structuredOutput =
        typeof message.structuredOutput === "object" &&
        message.structuredOutput !== null
          ? (message.structuredOutput as Record<string, unknown>)
          : {};

      return {
        ...message,
        actions: coachActionsSchema.safeParse(structuredOutput.actions).data ?? [],
        context: coachContextSchema.safeParse(structuredOutput.context).data,
      };
    }),
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
  const [allUsers, activeEntitlementRows, allFlaggedConversations, recentSubscriptions, announcementsList] =
    await Promise.all([
      db.query.users.findMany({
        orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
        with: {
          memberProfile: {
            columns: {
              goalSummary: true,
              lastCheckInAt: true,
            },
          },
          currentSubscription: true,
        },
      }),
      db.query.entitlements.findMany({
        where: eq(entitlements.isActive, true),
        orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
      }),
      db.query.coachConversations.findMany({
        where: eq(coachConversations.safetyStatus, "caution"),
        orderBy: (table, helpers) => [helpers.desc(table.updatedAt)],
        with: {
          user: {
            columns: {
              supabaseUserId: true,
              email: true,
              fullName: true,
              currentPlanKey: true,
            },
          },
        },
      }),
      db.query.subscriptions.findMany({
        orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
        limit: 24,
      }),
      db.query.notifications.findMany({
        orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
        limit: 24,
        with: {
          user: {
            columns: {
              supabaseUserId: true,
              email: true,
              fullName: true,
            },
          },
        },
      }),
    ]);

  const members = allUsers.filter((user) => user.role === "member");
  const activeEntitlementsByUser = new Map<string, (typeof activeEntitlementRows)[number]>();

  activeEntitlementRows.forEach((entitlement) => {
    if (!activeEntitlementsByUser.has(entitlement.userId)) {
      activeEntitlementsByUser.set(entitlement.userId, entitlement);
    }
  });

  const cautionConversationCountByUser = new Map<string, number>();

  allFlaggedConversations.forEach((conversation) => {
    cautionConversationCountByUser.set(
      conversation.userId,
      (cautionConversationCountByUser.get(conversation.userId) ?? 0) + 1
    );
  });

  const memberRows = members
    .map((user) => {
      const activeEntitlement = activeEntitlementsByUser.get(user.supabaseUserId) ?? null;
      const assignedPlan = getPlanByKey(user.currentPlanKey);
      const access = resolvePlanAccess({
        role: user.role,
        currentPlanKey: user.currentPlanKey,
        activeEntitlementPlanKey: activeEntitlement?.planKey ?? null,
        activeEntitlementAiDailyLimit: activeEntitlement?.aiDailyMessageLimit ?? null,
        activeSubscriptionProductId: user.currentSubscription?.productId ?? null,
      });
      const effectivePlan = access.plan;
      const planSource =
        access.planSource === "entitlement"
          ? (activeEntitlement?.source ?? "entitlement")
          : access.planSource;

      const cautionConversationCount =
        cautionConversationCountByUser.get(user.supabaseUserId) ?? 0;
      const needsAttention =
        !user.onboardingCompleted ||
        cautionConversationCount > 0 ||
        Boolean(user.currentSubscription?.cancelAtNextBillingDate);

      return {
        supabaseUserId: user.supabaseUserId,
        fullName: user.fullName ?? user.email.split("@")[0],
        email: user.email,
        role: user.role,
        assignedPlan: assignedPlan.name,
        assignedPlanKey: assignedPlan.key,
        effectivePlan: effectivePlan.name,
        effectivePlanKey: effectivePlan.key,
        planSource,
        planMismatch: assignedPlan.key !== effectivePlan.key,
        billingStatus: user.currentSubscription?.status ?? "starter",
        nextBillingDate: user.currentSubscription?.nextBillingDate ?? null,
        cancelAtNextBillingDate:
          user.currentSubscription?.cancelAtNextBillingDate ?? false,
        onboardingCompleted: user.onboardingCompleted,
        lastActiveAt: user.lastActiveAt,
        lastCheckInAt: user.memberProfile?.lastCheckInAt ?? null,
        aiDailyLimit:
          access.aiDailyLimit,
        activeGoalSummary: user.memberProfile?.goalSummary ?? null,
        cautionConversationCount,
        needsAttention,
      };
    })
    .sort((left, right) => {
      if (left.needsAttention !== right.needsAttention) {
        return left.needsAttention ? -1 : 1;
      }

      const leftLastActive = left.lastActiveAt ? new Date(left.lastActiveAt).getTime() : 0;
      const rightLastActive = right.lastActiveAt ? new Date(right.lastActiveAt).getTime() : 0;

      return rightLastActive - leftLastActive;
    });

  const planExceptions = memberRows
    .filter(
      (member) =>
        member.planMismatch ||
        member.cancelAtNextBillingDate ||
        member.cautionConversationCount > 0
    )
    .slice(0, 8);

  return {
    summary: {
      totalMembers: members.length,
      onboardedMembers: memberRows.filter((member) => member.onboardingCompleted).length,
      paidMembers: memberRows.filter((member) => member.effectivePlanKey !== "starter")
        .length,
      cautionConversations: allFlaggedConversations.length,
      pendingCancellations: memberRows.filter((member) => member.cancelAtNextBillingDate)
        .length,
    },
    adminPolicy: {
      adminCount: allUsers.filter((user) => user.role === "admin").length,
      configuredEmails: getConfiguredAdminEmails(),
    },
    members: memberRows.slice(0, 24),
    subscriptions: recentSubscriptions.map((subscription) => ({
      ...subscription,
      plan:
        getPlanByProductId(subscription.productId)?.name ??
        subscription.productId,
    })),
    flaggedConversations: allFlaggedConversations.slice(0, 12).map((conversation) => ({
      id: conversation.id,
      title: conversation.title,
      safetyStatus: conversation.safetyStatus,
      updatedAt: conversation.updatedAt,
      memberName:
        conversation.user?.fullName ??
        conversation.user?.email ??
        conversation.userId,
      memberEmail: conversation.user?.email ?? null,
    })),
    planExceptions,
    operationalFeed: announcementsList.map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      body: item.body,
      createdAt: item.createdAt,
      status: item.status,
      memberName: item.user?.fullName ?? item.user?.email ?? "System",
      memberEmail: item.user?.email ?? null,
    })),
  };
}
