import { and, eq, gte } from "drizzle-orm";
import { differenceInCalendarDays, subDays } from "date-fns";
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
  users,
  weeklyPrograms,
  workoutLogs,
} from "@/lib/drizzle/schema";
import {
  CoachAction,
  CoachContextSnapshot,
  ProactiveBrief,
  WeeklyPerformanceBrief,
} from "@/lib/healthfit/contracts";
import { buildWeeklyPerformanceBrief } from "@/lib/healthfit/premium";
import { resolvePlanAccess } from "@/lib/healthfit/server/access";

export type CoachMemorySnapshot = {
  userId: string;
  planName: string;
  currentPlanKey: string;
  goalSummary: string;
  activityLevel: string;
  experienceLevel: string;
  workoutDays: string[];
  availableEquipment: string[];
  sessionLengthMin: number;
  currentFocus: string;
  currentProgramSummary: string;
  activeGoalTitles: string[];
  weeklyBrief: WeeklyPerformanceBrief;
  latestCheckInSummary: string | null;
  daysSinceLastCheckIn: number | null;
  checkInStale: boolean;
  recentWorkoutNames: string[];
  recentMealTitles: string[];
  recentConversationTurns: Array<{
    role: string;
    content: string;
  }>;
  habitSlugs: string[];
  promptContext: string;
};

function average(values: Array<number | null | undefined>) {
  const valid = values.filter((value): value is number => typeof value === "number");

  if (valid.length === 0) {
    return null;
  }

  return Number(
    (valid.reduce((sum, value) => sum + value, 0) / valid.length).toFixed(1)
  );
}

function buildCurrentFocus(brief: WeeklyPerformanceBrief) {
  if (brief.recoveryStatus === "recover") {
    return "reduce friction, protect sleep, and keep movement light";
  }

  if (brief.momentum === "needs_attention") {
    return "reset consistency with smaller wins and easier follow-through";
  }

  if (brief.momentum === "rising") {
    return "build on momentum without sacrificing recovery";
  }

  return "stay steady and reinforce the habits that are already working";
}

function truncate(text: string, maxLength = 140) {
  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 1)}…`;
}

export async function buildCoachMemorySnapshot(
  userId: string
): Promise<CoachMemorySnapshot> {
  const sevenDaysAgo = subDays(new Date(), 7).toISOString();

  const [
    user,
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
    recentConversationTurns,
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
      limit: 5,
    }),
    db.query.entitlements.findFirst({
      where: and(eq(entitlements.userId, userId), eq(entitlements.isActive, true)),
      orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
    }),
    db.query.users.findFirst({
      where: eq(users.supabaseUserId, userId),
      columns: {
        currentSubscriptionId: true,
      },
      with: {
        currentSubscription: true,
      },
    }).then((record) => record?.currentSubscription ?? null),
    db.query.weeklyPrograms.findFirst({
      where: eq(weeklyPrograms.userId, userId),
      with: {
        days: true,
      },
      orderBy: (table, helpers) => [helpers.desc(table.weekStartDate)],
    }),
    db.query.workoutLogs.findMany({
      where: and(eq(workoutLogs.userId, userId), gte(workoutLogs.loggedAt, sevenDaysAgo)),
      orderBy: (table, helpers) => [helpers.desc(table.loggedAt)],
    }),
    db.query.mealLogs.findMany({
      where: and(eq(mealLogs.userId, userId), gte(mealLogs.loggedAt, sevenDaysAgo)),
      orderBy: (table, helpers) => [helpers.desc(table.loggedAt)],
    }),
    db.query.habitLogs.findMany({
      where: and(eq(habitLogs.userId, userId), gte(habitLogs.createdAt, sevenDaysAgo)),
      orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
    }),
    db.query.habitTemplates.findMany({
      where: eq(habitTemplates.userId, userId),
      orderBy: (table, helpers) => [helpers.asc(table.title)],
    }),
    db.query.checkIns.findMany({
      where: and(eq(checkIns.userId, userId), gte(checkIns.createdAt, sevenDaysAgo)),
      orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
    }),
    db.query.coachMessages.findMany({
      where: eq(coachMessages.userId, userId),
      orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
      limit: 6,
    }),
  ]);

  if (!user) {
    throw new Error("User not found");
  }

  const plan = resolvePlanAccess({
    role: user.role,
    currentPlanKey: user.currentPlanKey,
    activeEntitlementPlanKey: activeEntitlement?.planKey ?? null,
    activeSubscriptionProductId: activeSubscription?.productId ?? null,
  }).plan;

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
      profile?.goalSummary ??
      activeGoals[0]?.title ??
      "more consistency and better energy",
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
    aiMessagesUsed: recentConversationTurns.filter((item) => item.role === "user").length,
  });

  const latestCheckIn = weeklyCheckIns[0] ?? null;
  const daysSinceLastCheckIn = latestCheckIn
    ? differenceInCalendarDays(new Date(), new Date(latestCheckIn.createdAt))
    : null;
  const currentFocus = buildCurrentFocus(weeklyBrief);
  const activeGoalTitles = activeGoals.map((goal) => goal.title);
  const recentWorkoutNames = Array.from(
    new Set(weeklyWorkoutLogs.map((item) => item.workoutName))
  ).slice(0, 3);
  const recentMealTitles = weeklyMealLogs
    .slice(0, 3)
    .map((item) => item.title);
  const promptContext = [
    `Plan: ${plan.name}`,
    `Goal summary: ${profile?.goalSummary ?? activeGoals[0]?.title ?? "steady wellness progress"}`,
    `Current weekly focus: ${latestProgram?.focus ?? "build a stable routine"}`,
    `Current shift: ${currentFocus}`,
    `Momentum: ${weeklyBrief.momentum}`,
    `Recovery: ${weeklyBrief.recoveryStatus}`,
    `Consistency score: ${weeklyBrief.consistencyScore}/100`,
    `Recent wins: ${weeklyBrief.wins.join("; ")}`,
    `Watchouts: ${weeklyBrief.watchouts.join("; ")}`,
    `Latest check-in: ${latestCheckIn?.aiSummary ?? "No recent check-in recorded."}`,
    `Recent workouts: ${recentWorkoutNames.join(", ") || "No workouts logged in the last week."}`,
    `Recent meals: ${recentMealTitles.join(", ") || "Meal logging is sparse right now."}`,
    `Recent conversation: ${
      recentConversationTurns.length > 0
        ? recentConversationTurns
            .slice()
            .reverse()
            .map((item) => `${item.role}: ${truncate(item.content)}`)
            .join(" | ")
        : "No prior coach history."
    }`,
  ].join("\n");

  return {
    userId,
    planName: plan.name,
    currentPlanKey: plan.key,
    goalSummary:
      profile?.goalSummary ??
      activeGoals[0]?.title ??
      "build a stronger, more sustainable routine",
    activityLevel: profile?.activityLevel ?? "moderate",
    experienceLevel: profile?.experienceLevel ?? "beginner",
    workoutDays: Array.isArray(profile?.workoutDays)
      ? profile.workoutDays.filter((value): value is string => typeof value === "string")
      : ["Mon", "Wed", "Fri"],
    availableEquipment: Array.isArray(profile?.availableEquipment)
      ? profile.availableEquipment.filter(
          (value): value is string => typeof value === "string"
        )
      : ["Bodyweight"],
    sessionLengthMin: profile?.sessionLengthMin ?? 45,
    currentFocus,
    currentProgramSummary:
      latestProgram?.summary ?? "No active weekly program is available yet.",
    activeGoalTitles,
    weeklyBrief,
    latestCheckInSummary: latestCheckIn?.aiSummary ?? null,
    daysSinceLastCheckIn,
    checkInStale: daysSinceLastCheckIn === null || daysSinceLastCheckIn >= 2,
    recentWorkoutNames,
    recentMealTitles,
    recentConversationTurns: recentConversationTurns.slice().reverse().map((item) => ({
      role: item.role,
      content: truncate(item.content, 180),
    })),
    habitSlugs: memberHabitTemplates
      .map((item) => item.slug)
      .filter((slug): slug is string => Boolean(slug)),
    promptContext,
  };
}

export function buildCoachContextSnapshot(
  memory: CoachMemorySnapshot
): CoachContextSnapshot {
  return {
    summary: `${memory.planName} member focused on ${memory.goalSummary.toLowerCase()}. ${memory.weeklyBrief.summary}`,
    currentFocus: memory.currentFocus,
    momentum: memory.weeklyBrief.momentum,
    recoveryStatus: memory.weeklyBrief.recoveryStatus,
    recentWins: memory.weeklyBrief.wins,
    watchouts: memory.weeklyBrief.watchouts,
    nextShift: memory.weeklyBrief.nextActions[0] ?? "Keep the next step small and easy to complete.",
    badges: [
      {
        label: "Plan",
        value: memory.planName,
        tone: "neutral",
      },
      {
        label: "Momentum",
        value: memory.weeklyBrief.momentum.replace("_", " "),
        tone:
          memory.weeklyBrief.momentum === "rising"
            ? "positive"
            : memory.weeklyBrief.momentum === "needs_attention"
              ? "attention"
              : "neutral",
      },
      {
        label: "Recovery",
        value: memory.weeklyBrief.recoveryStatus,
        tone:
          memory.weeklyBrief.recoveryStatus === "strong"
            ? "positive"
            : memory.weeklyBrief.recoveryStatus === "recover"
              ? "attention"
              : "neutral",
      },
      {
        label: "Check-in",
        value: memory.checkInStale ? "needs refresh" : "current",
        tone: memory.checkInStale ? "attention" : "positive",
      },
    ],
  };
}

export function buildProactiveBrief(
  memory: CoachMemorySnapshot
): ProactiveBrief {
  const title =
    memory.weeklyBrief.recoveryStatus === "recover"
      ? "Recovery-first AI brief"
      : memory.weeklyBrief.momentum === "needs_attention"
        ? "AI reset brief"
        : "Today's AI brief";

  const nextActions = Array.from(
    new Set([
      ...memory.weeklyBrief.nextActions,
      ...(memory.checkInStale ? ["Complete a fresh check-in so coaching stays accurate."] : []),
    ])
  ).slice(0, 3);

  return {
    title,
    summary: `${memory.weeklyBrief.summary} Current focus: ${memory.currentFocus}.`,
    nextActions,
    generatedAt: new Date().toISOString(),
  };
}

function buildHydrationAction(): CoachAction {
  return {
    id: "coach-log-hydrate",
    type: "log_habit",
    label: "Mark hydration habit",
    description: "Record a hydration win right now so the coach sees momentum.",
    payload: {
      habitSlug: "hydrate",
      status: "done",
      note: "Completed from AI coach action.",
    },
  };
}

function buildRecoveryWorkoutAction(): CoachAction {
  return {
    id: "coach-log-recovery-workout",
    type: "log_workout",
    label: "Log a recovery session",
    description: "Save a low-friction recovery workout without leaving the coach.",
    payload: {
      workoutName: "Recovery walk + mobility reset",
      durationMin: 25,
      effortScore: 4,
      notes: "Added from AI coach action for a recovery-focused day.",
    },
  };
}

function buildProteinMealAction(): CoachAction {
  return {
    id: "coach-log-protein-meal",
    type: "log_meal",
    label: "Log a protein-first meal",
    description: "Capture an easy recovery meal to keep nutrition guidance current.",
    payload: {
      mealType: "lunch",
      title: "Protein-forward recovery plate",
      calories: 550,
      proteinGrams: 40,
      carbsGrams: 45,
      fatGrams: 18,
      waterMl: 500,
      notes: "Added from AI coach action.",
    },
  };
}

export function buildCoachActions(props: {
  memory: CoachMemorySnapshot;
  message: string;
  safetyStatus: "clear" | "caution";
}): CoachAction[] {
  const lowerMessage = props.message.toLowerCase();
  const actions: CoachAction[] = [];

  if (props.safetyStatus === "caution") {
    actions.push({
      id: "coach-open-checkin",
      type: "navigate",
      label: "Open check-in",
      description: "Capture how you feel so the next guidance reflects your latest status.",
      href: "/dashboard/check-ins",
    });

    if (
      props.memory.weeklyBrief.recoveryStatus === "recover" ||
      props.memory.weeklyBrief.momentum === "needs_attention"
    ) {
      actions.push({
        id: "coach-replan-recovery-week",
        type: "replan_week",
        label: "Rebuild this week with AI",
        description: "Shift the active plan toward lower friction and better recovery.",
        payload: {
          mode: "recovery",
        },
      });
    }

    return actions;
  }

  if (
    /workout|train|session|exercise|recovery|legs|run|lift|mobility/.test(lowerMessage) ||
    props.memory.weeklyBrief.recoveryStatus !== "strong"
  ) {
    actions.push(buildRecoveryWorkoutAction());
  }

  if (props.memory.checkInStale) {
    actions.push({
      id: "coach-open-checkin",
      type: "navigate",
      label: "Refresh your check-in",
      description: "Give the coach a current read on mood, energy, stress, and sleep.",
      href: "/dashboard/check-ins",
    });
  }

  if (
    props.memory.weeklyBrief.momentum === "needs_attention" ||
    props.memory.weeklyBrief.recoveryStatus === "recover"
  ) {
    actions.push({
      id: "coach-replan-week",
      type: "replan_week",
      label: "Rebuild this week with AI",
      description: "Generate a lighter and more adaptive week from your latest data.",
    });
  }

  if (
    /meal|nutrition|protein|food|eat|hydration|water/.test(lowerMessage) ||
    props.memory.weeklyBrief.metrics.mealConsistencyPercent < 60
  ) {
    actions.push(buildProteinMealAction());
  }

  if (
    props.memory.weeklyBrief.metrics.hydrationCompletionPercent < 75 &&
    props.memory.habitSlugs.includes("hydrate")
  ) {
    actions.push(buildHydrationAction());
  }

  if (actions.length === 0) {
    actions.push({
      id: "coach-open-workouts",
      type: "navigate",
      label: "Open workouts",
      description: "Use your latest guidance inside the weekly training view.",
      href: "/dashboard/workouts",
    });
    actions.push({
      id: "coach-open-nutrition",
      type: "navigate",
      label: "Open nutrition",
      description: "Keep meal logging current so the coach has better signal.",
      href: "/dashboard/nutrition",
    });
  }

  return Array.from(new Map(actions.map((action) => [action.id, action])).values()).slice(
    0,
    3
  );
}

export function buildCoachPromptContext(memory: CoachMemorySnapshot) {
  return memory.promptContext;
}
