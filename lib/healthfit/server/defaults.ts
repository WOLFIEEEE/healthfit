import { addDays, format, startOfWeek } from "date-fns";
import { OnboardingInput } from "@/lib/healthfit/contracts";
import { createId } from "@/lib/healthfit/ids";

const weekdayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function getDefaultHabitTemplates(userId: string, now: string) {
  return [
    {
      id: createId("habit"),
      userId,
      slug: "hydrate",
      title: "Hydration target",
      description: "Hit your water target before the evening slump.",
      metricType: "number",
      targetValue: 2500,
      targetFrequency: "daily",
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: createId("habit"),
      userId,
      slug: "walk",
      title: "Movement break",
      description: "Take a 10-minute walk after a meal.",
      metricType: "boolean",
      targetFrequency: "daily",
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: createId("habit"),
      userId,
      slug: "sleep",
      title: "Consistent sleep window",
      description: "Aim for a consistent bedtime and wake time.",
      metricType: "boolean",
      targetFrequency: "daily",
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function buildInitialWeeklyProgram(input: OnboardingInput) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const selectedDays = input.workoutDays
    .slice()
    .sort(
      (left, right) =>
        weekdayMap.indexOf(left.slice(0, 3)) - weekdayMap.indexOf(right.slice(0, 3))
    );

  const focus =
    input.primaryGoalType === "fat_loss"
      ? "conditioning and consistency"
      : input.primaryGoalType === "muscle_gain"
        ? "strength and progressive overload"
        : input.primaryGoalType === "energy"
          ? "mobility, movement, and sustainable energy"
          : "balanced body composition and habits";

  const workoutSummary = `A ${selectedDays.length}-day week centered on ${focus}, ${input.sessionLengthMin}-minute sessions, and food choices that support steady recovery.`;

  const days = selectedDays.map((dayLabel, index) => {
    const dayOfWeek = weekdayMap.indexOf(dayLabel.slice(0, 3));
    const emphasis =
      index % 3 === 0
        ? "Full-body strength"
        : index % 3 === 1
          ? "Conditioning + core"
          : "Lower-impact recovery";

    return {
      id: createId("day"),
      dayOfWeek: dayOfWeek === -1 ? ((index + 1) % 7) + 1 : dayOfWeek,
      title: `${dayLabel} ${emphasis}`,
      workoutFocus: emphasis,
      mealFocus:
        input.primaryGoalType === "fat_loss"
          ? "High-protein plates with fiber-forward carbs"
          : "Protein-focused meals with recovery carbs",
      habitFocus: "Hydration, post-meal movement, and consistent sleep timing",
      durationMin: input.sessionLengthMin,
      exercises: [
        {
          name: emphasis === "Lower-impact recovery" ? "Mobility flow" : "Warm-up circuit",
          sets: 1,
          reps: "6-8 min",
        },
        {
          name: emphasis === "Full-body strength" ? "Compound movement block" : "Interval circuit",
          sets: 3,
          reps: emphasis === "Full-body strength" ? "8-12" : "30s on / 30s off",
        },
        {
          name: "Cooldown + breathing reset",
          sets: 1,
          reps: "5 min",
        },
      ],
      notes:
        input.availableEquipment.length > 0
          ? `Use available equipment: ${input.availableEquipment.join(", ")}.`
          : "Bodyweight-friendly session.",
    };
  });

  return {
    weekStartDate: format(weekStart, "yyyy-MM-dd"),
    weekEndDate: format(addDays(weekStart, 6), "yyyy-MM-dd"),
    focus,
    summary: workoutSummary,
    days,
  };
}

export function buildFallbackCoachReply(message: string, goalSummary: string) {
  const lowerMessage = message.toLowerCase();
  const focus =
    lowerMessage.includes("meal") || lowerMessage.includes("nutrition")
      ? ["prioritize protein", "keep meals simple", "log what is realistic today"]
      : lowerMessage.includes("tired") || lowerMessage.includes("sleep")
        ? ["reduce intensity", "protect sleep", "take a lighter recovery session"]
        : ["show up for the next session", "stack easy wins", "review hydration and protein"];

  return {
    recap: `You are working toward ${goalSummary || "steady wellness progress"}, and today the priority is consistency over perfection.`,
    focus,
    nextActions: [
      "Finish one small action in the next 30 minutes.",
      "Keep today's plan simple enough to complete.",
      "Log how you feel after the next workout or meal.",
    ],
    disclaimer:
      "Healthfit.ai provides wellness guidance only and cannot diagnose, treat, or replace professional medical care.",
  };
}

export function buildCheckInSummary(props: {
  moodScore: number;
  energyScore: number;
  stressScore: number;
  adherenceScore: number;
}) {
  const average =
    (props.moodScore + props.energyScore + props.adherenceScore) / 3;

  if (average >= 8 && props.stressScore <= 4) {
    return "Momentum is strong. Keep the plan steady and avoid overcomplicating the week.";
  }

  if (average <= 5 || props.stressScore >= 8) {
    return "Your check-in suggests recovery and simplicity should lead the next 24 hours. Lower the friction and aim for a lighter win.";
  }

  return "You are in a workable middle zone. Keep meals structured, show up for the next session, and protect sleep tonight.";
}
