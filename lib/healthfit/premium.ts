import {
  MembershipIntelligence,
  PlanCatalogItem,
  WeeklyPerformanceBrief,
} from "@/lib/healthfit/contracts";

type WeeklyPerformanceInput = {
  goalSummary: string;
  plannedWorkouts: number;
  completedWorkouts: number;
  mealsLogged: number;
  targetMeals: number;
  habitLogsCompleted: number;
  habitLogsTarget: number;
  hydrationTargetMl: number;
  averageDailyWaterMl: number;
  averageSleepHours: number | null;
  averageStressScore: number | null;
  averageEnergyScore: number | null;
  averageAdherenceScore: number | null;
  checkInsLogged: number;
  aiMessagesUsed: number;
};

type MembershipIntelligenceInput = {
  plan: PlanCatalogItem;
  aiMessagesUsedToday: number;
  aiDailyLimit: number;
  activeGoals: number;
  maxActiveGoals: number;
  unlimitedAccess?: boolean;
};

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function buildUsageMeter(args: {
  label: string;
  used: number;
  limit: number;
  activeHelper: string;
  lockedHelper: string;
  unlimited?: boolean;
  unlimitedHelper?: string;
}) {
  const used = Math.max(0, args.used);
  const limit = Math.max(0, args.limit);

  if (args.unlimited) {
    return {
      label: args.label,
      used,
      limit,
      remaining: Math.max(limit - used, 0),
      percentage: 100,
      status: "available",
      helper: args.unlimitedHelper ?? "Unlimited internal access.",
      unlimited: true,
    } as const;
  }

  const remaining = limit > 0 ? Math.max(limit - used, 0) : 0;
  const percentage = limit > 0 ? clampPercent((used / limit) * 100) : 0;
  const status =
    limit <= 0 ? "locked" : percentage >= 80 ? "near_limit" : "available";

  return {
    label: args.label,
    used,
    limit,
    remaining,
    percentage,
    status,
    helper:
      limit <= 0
        ? args.lockedHelper
        : remaining === 0
          ? `${args.label} limit reached for now.`
          : `${remaining} ${args.activeHelper}`,
  } as const;
}

export function buildWeeklyPerformanceBrief(
  input: WeeklyPerformanceInput
): WeeklyPerformanceBrief {
  const workoutCompletionPercent =
    input.plannedWorkouts > 0
      ? clampPercent((input.completedWorkouts / input.plannedWorkouts) * 100)
      : input.completedWorkouts > 0
        ? 100
        : 0;
  const mealConsistencyPercent =
    input.targetMeals > 0
      ? clampPercent((input.mealsLogged / input.targetMeals) * 100)
      : input.mealsLogged > 0
        ? 100
        : 0;
  const habitCompletionPercent =
    input.habitLogsTarget > 0
      ? clampPercent((input.habitLogsCompleted / input.habitLogsTarget) * 100)
      : 0;
  const hydrationCompletionPercent =
    input.hydrationTargetMl > 0
      ? clampPercent((input.averageDailyWaterMl / input.hydrationTargetMl) * 100)
      : 0;
  const adherencePercent = input.averageAdherenceScore
    ? clampPercent(input.averageAdherenceScore * 10)
    : clampPercent(
        workoutCompletionPercent * 0.45 +
          habitCompletionPercent * 0.3 +
          hydrationCompletionPercent * 0.25
      );

  const consistencyScore = clampPercent(
    workoutCompletionPercent * 0.35 +
      habitCompletionPercent * 0.2 +
      hydrationCompletionPercent * 0.15 +
      mealConsistencyPercent * 0.1 +
      adherencePercent * 0.2
  );

  const momentum =
    consistencyScore >= 78
      ? "rising"
      : consistencyScore >= 58
        ? "steady"
        : "needs_attention";

  const recoveryStatus =
    (input.averageSleepHours !== null && input.averageSleepHours < 6) ||
    (input.averageStressScore !== null && input.averageStressScore >= 8) ||
    (input.averageEnergyScore !== null && input.averageEnergyScore <= 4)
      ? "recover"
      : (input.averageSleepHours !== null && input.averageSleepHours < 7) ||
          (input.averageStressScore !== null && input.averageStressScore >= 6) ||
          (input.averageEnergyScore !== null && input.averageEnergyScore <= 6)
        ? "watch"
        : "strong";

  const wins: string[] = [];
  const watchouts: string[] = [];
  const nextActions: string[] = [];

  if (workoutCompletionPercent >= 80) {
    wins.push(
      `You completed ${input.completedWorkouts}/${Math.max(input.plannedWorkouts, 1)} planned workouts this week.`
    );
  }
  if (habitCompletionPercent >= 70) {
    wins.push("Your habit follow-through stayed consistent across the week.");
  }
  if (hydrationCompletionPercent >= 90) {
    wins.push("Hydration stayed close to target, which supports recovery and energy.");
  }
  if (input.checkInsLogged >= 2) {
    wins.push("You kept the coach informed with regular check-ins.");
  }
  if (input.averageAdherenceScore !== null && input.averageAdherenceScore >= 7) {
    wins.push("Your self-reported adherence suggests the routine is staying realistic.");
  }

  if (workoutCompletionPercent < 60) {
    watchouts.push("Workout completion dropped below the level that usually drives visible progress.");
    nextActions.push("Trim the next week down to the easiest sessions you can complete consistently.");
  }
  if (habitCompletionPercent < 60) {
    watchouts.push("Habit execution is uneven, which can make the whole plan feel harder than it needs to.");
    nextActions.push("Choose one anchor habit to protect every day before adding anything else.");
  }
  if (mealConsistencyPercent < 60) {
    watchouts.push("Meal logging is too sparse to coach nutrition precisely right now.");
    nextActions.push("Log at least your main meals for the next seven days so nutrition guidance stays accurate.");
  }
  if (hydrationCompletionPercent < 75) {
    watchouts.push("Hydration is lagging behind target and may be dragging down energy.");
    nextActions.push("Pair water with existing routines like the first meal, training, and late afternoon.");
  }
  if (recoveryStatus === "recover") {
    watchouts.push("Recovery markers suggest the next week should emphasize pacing, sleep, and lower friction.");
    nextActions.push("Ask the coach for a recovery-first week that protects consistency without pushing volume.");
  } else if (recoveryStatus === "watch") {
    watchouts.push("Recovery looks usable but not fully topped up, so load management matters.");
    nextActions.push("Keep one lower-intensity day in the plan and watch sleep closely.");
  }
  if (input.checkInsLogged === 0) {
    watchouts.push("No check-ins were logged this week, which reduces coaching context.");
    nextActions.push("Complete a check-in early in the week so adjustments can happen sooner.");
  }

  if (wins.length === 0) {
    wins.push("You kept the account active, which gives us a baseline to improve from next week.");
  }

  if (watchouts.length === 0) {
    watchouts.push("No major risk flags surfaced this week.");
  }

  if (nextActions.length === 0) {
    nextActions.push("Keep the current structure, then ask the coach where to progress first.");
  }

  const momentumCopy =
    momentum === "rising"
      ? "Momentum is building."
      : momentum === "steady"
        ? "Momentum is stable."
        : "Momentum needs attention.";
  const recoveryCopy =
    recoveryStatus === "strong"
      ? "Recovery signals look strong enough to keep progressing."
      : recoveryStatus === "watch"
        ? "Recovery needs watching before load increases."
        : "Recovery should lead the next set of decisions.";

  return {
    consistencyScore,
    momentum,
    recoveryStatus,
    summary: `${momentumCopy} ${recoveryCopy} Focus remains on ${input.goalSummary.toLowerCase()}.`,
    wins: wins.slice(0, 3),
    watchouts: watchouts.slice(0, 3),
    nextActions: nextActions.slice(0, 3),
    metrics: {
      workoutCompletionPercent,
      habitCompletionPercent,
      hydrationCompletionPercent,
      mealConsistencyPercent,
      checkInsLogged: input.checkInsLogged,
      aiMessagesUsed: input.aiMessagesUsed,
    },
  };
}

function featureLabelMap(plan: PlanCatalogItem) {
  return [
    { label: "AI coach guidance", enabled: plan.entitlements.aiCoach },
    { label: "Weekly programs", enabled: plan.entitlements.weeklyPrograms },
    { label: "Advanced analytics", enabled: plan.entitlements.advancedAnalytics },
    { label: "Premium programs", enabled: plan.entitlements.premiumPrograms },
    { label: "Progress photos", enabled: plan.entitlements.progressPhotos },
    { label: "Priority support", enabled: plan.entitlements.prioritySupport },
    {
      label: "Custom habit templates",
      enabled: plan.entitlements.customHabitTemplates,
    },
  ];
}

export function buildMembershipIntelligence(
  input: MembershipIntelligenceInput
): MembershipIntelligence {
  const aiUsage = buildUsageMeter({
    label: "AI coach",
    used: input.aiMessagesUsedToday,
    limit: input.aiDailyLimit,
    activeHelper: "messages remaining today",
    lockedHelper: "Upgrade to Pro or Elite to unlock coaching messages.",
    unlimited: input.unlimitedAccess,
    unlimitedHelper: "Unlimited AI access for internal admin accounts.",
  });

  const goalUsage = buildUsageMeter({
    label: "Active goals",
    used: input.activeGoals,
    limit: input.maxActiveGoals,
    activeHelper: "goal slots left on your plan",
    lockedHelper: "No active goal slots are available on this plan.",
    unlimited: input.unlimitedAccess,
    unlimitedHelper: "Unlimited active-goal capacity for internal admin accounts.",
  });

  const features = featureLabelMap(input.plan);
  const unlockedFeatures = features
    .filter((feature) => feature.enabled)
    .map((feature) => feature.label);
  const lockedFeatures = features
    .filter((feature) => !feature.enabled)
    .map((feature) => feature.label);

  if (input.unlimitedAccess) {
    return {
      planName: input.plan.name,
      planKey: input.plan.key,
      valueHeadline:
        "Admin access keeps every member feature unlocked without billing or daily usage caps.",
      supportLane: "priority",
      aiUsage,
      goalUsage,
      unlockedFeatures: features.map((feature) => feature.label),
      lockedFeatures: [],
      upgradePrompt: null,
    };
  }

  let upgradePrompt: string | null = null;
  if (aiUsage.status === "locked") {
    upgradePrompt = "Upgrade to Pro to unlock the AI coach and daily guidance.";
  } else if (aiUsage.status === "near_limit") {
    upgradePrompt = `You are using most of your ${input.plan.name} AI allowance.`;
  } else if (goalUsage.status === "near_limit") {
    upgradePrompt = "You are close to your active goal limit on the current plan.";
  } else if (lockedFeatures.length > 0 && input.plan.key === "starter") {
    upgradePrompt = `Pro unlocks ${lockedFeatures[0].toLowerCase()} and deeper coaching context.`;
  } else if (lockedFeatures.length > 0 && input.plan.key === "pro") {
    upgradePrompt = `Elite adds ${lockedFeatures[0].toLowerCase()} and higher usage limits.`;
  }

  const valueHeadline =
    input.plan.key === "starter"
      ? "Starter keeps your wellness system organized and ready for growth."
      : input.plan.key === "pro"
        ? "Pro turns routine tracking into active coaching, analytics, and daily accountability."
        : "Elite gives ambitious members premium programs, higher AI capacity, and priority support.";

  return {
    planName: input.plan.name,
    planKey: input.plan.key,
    valueHeadline,
    supportLane: input.plan.entitlements.prioritySupport ? "priority" : "standard",
    aiUsage,
    goalUsage,
    unlockedFeatures,
    lockedFeatures,
    upgradePrompt,
  };
}

export function buildCoachPromptSuggestions(args: {
  goalSummary: string;
  brief: WeeklyPerformanceBrief;
  membership: MembershipIntelligence;
}) {
  if (args.membership.aiUsage.limit <= 0) {
    return [
      "Upgrade to Pro or Elite to unlock personalized AI coaching prompts.",
      "Use the progress and overview pages to keep your tracking complete in the meantime.",
    ];
  }

  const prompts = [
    `Based on my goal of ${args.goalSummary.toLowerCase()}, what should be my top focus for the next 7 days?`,
  ];

  if (args.brief.recoveryStatus === "recover") {
    prompts.push(
      "I had a low-recovery week. How should I scale training and nutrition without losing momentum?"
    );
  } else if (args.brief.recoveryStatus === "watch") {
    prompts.push(
      "My recovery looks mixed. Help me adjust intensity while keeping progress steady."
    );
  } else {
    prompts.push(
      "Recovery looks solid. Where should I progress first without making the plan harder to sustain?"
    );
  }

  if (args.brief.metrics.hydrationCompletionPercent < 75) {
    prompts.push(
      "Give me a hydration plan that fits around my current routine and training times."
    );
  } else if (args.brief.metrics.mealConsistencyPercent < 70) {
    prompts.push(
      "Help me simplify meal logging and protein planning so nutrition stays easier to follow."
    );
  } else {
    prompts.push(
      "Use my current consistency data to suggest one workout, one nutrition, and one habit upgrade."
    );
  }

  return prompts.slice(0, 3);
}
