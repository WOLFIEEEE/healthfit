import { addDays, format, startOfWeek } from "date-fns";
import { eq } from "drizzle-orm";
import { db } from "@/lib/drizzle/client";
import { programDays, weeklyPrograms } from "@/lib/drizzle/schema";
import { createId } from "@/lib/healthfit/ids";
import {
  buildCoachMemorySnapshot,
  CoachMemorySnapshot,
} from "@/lib/healthfit/server/coach-intelligence";
import { queueNotification } from "@/lib/healthfit/server/notifications";

const weekdayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type AdaptiveMode =
  | "recovery_reset"
  | "consistency_reset"
  | "steady_build"
  | "progressive_build";

type AdaptivePlanDraft = {
  mode: AdaptiveMode;
  title: string;
  reason: string;
  focus: string;
  summary: string;
  nextActions: string[];
  days: Array<{
    id: string;
    dayOfWeek: number;
    title: string;
    workoutFocus: string;
    mealFocus: string;
    habitFocus: string;
    durationMin: number;
    exercises: Array<{
      name: string;
      sets: number;
      reps: string;
    }>;
    notes: string;
  }>;
};

function determineAdaptiveMode(memory: CoachMemorySnapshot): AdaptiveMode {
  if (memory.weeklyBrief.recoveryStatus === "recover") {
    return "recovery_reset";
  }

  if (memory.weeklyBrief.momentum === "needs_attention") {
    return "consistency_reset";
  }

  if (
    memory.weeklyBrief.momentum === "rising" &&
    memory.weeklyBrief.recoveryStatus === "strong"
  ) {
    return "progressive_build";
  }

  return "steady_build";
}

function sortWorkoutDays(days: string[]) {
  return days
    .slice()
    .sort(
      (left, right) =>
        weekdayMap.indexOf(left.slice(0, 3)) - weekdayMap.indexOf(right.slice(0, 3))
    );
}

function buildModeConfig(mode: AdaptiveMode) {
  switch (mode) {
    case "recovery_reset":
      return {
        title: "Recovery reset",
        focus: "lower-friction sessions, sleep support, and sustainable energy",
        summary:
          "This adaptive week reduces training friction and emphasizes lower-intensity movement, sleep, hydration, and easy wins.",
        reason:
          "Recovery signals suggest the next week should get simpler before training load rises again.",
        sessionAdjustment: -10,
        emphases: [
          "Mobility + circulation",
          "Full-body foundation",
          "Low-impact conditioning",
        ],
      };
    case "consistency_reset":
      return {
        title: "Consistency reset",
        focus: "smaller sessions, cleaner structure, and easier follow-through",
        summary:
          "This adaptive week trims complexity and rebuilds momentum with easier sessions and clearer anchors.",
        reason:
          "Recent follow-through suggests the plan should get easier to complete before it gets harder.",
        sessionAdjustment: -5,
        emphases: [
          "Full-body reset",
          "Conditioning + core",
          "Lower-friction strength",
        ],
      };
    case "progressive_build":
      return {
        title: "Progressive build",
        focus: "stable recovery with a small performance push",
        summary:
          "This adaptive week keeps the current routine but adds a little more structure and progression where recovery allows it.",
        reason:
          "Momentum and recovery are strong enough to progress the next week without a major overhaul.",
        sessionAdjustment: 5,
        emphases: [
          "Strength progression",
          "Conditioning + core",
          "Accessory + stability",
        ],
      };
    default:
      return {
        title: "Steady build",
        focus: "solid execution, habit stability, and repeatable training quality",
        summary:
          "This adaptive week keeps the plan steady while reinforcing the habits already driving progress.",
        reason:
          "Your current signals support a steady week with better execution rather than a drastic reset.",
        sessionAdjustment: 0,
        emphases: [
          "Full-body strength",
          "Conditioning + core",
          "Lower-impact recovery",
        ],
      };
  }
}

function buildExercisesForFocus(focus: string, mode: AdaptiveMode) {
  if (focus.includes("Mobility")) {
    return [
      { name: "Dynamic mobility flow", sets: 1, reps: "8 min" },
      { name: "Zone 2 walk or bike", sets: 1, reps: "15-20 min" },
      { name: "Breathing + cooldown reset", sets: 1, reps: "5 min" },
    ];
  }

  if (focus.includes("Conditioning")) {
    return [
      { name: "Warm-up circuit", sets: 1, reps: "6 min" },
      {
        name: mode === "recovery_reset" ? "Low-impact intervals" : "Interval circuit",
        sets: 3,
        reps: "30s on / 30s off",
      },
      { name: "Core finisher", sets: 2, reps: "45s each" },
    ];
  }

  return [
    { name: "Warm-up + activation", sets: 1, reps: "6 min" },
    {
      name: mode === "progressive_build" ? "Progressive strength block" : "Compound strength block",
      sets: 3,
      reps: "6-10",
    },
    { name: "Cooldown + breathing reset", sets: 1, reps: "5 min" },
  ];
}

function buildAdaptivePlanDraft(memory: CoachMemorySnapshot): AdaptivePlanDraft {
  const mode = determineAdaptiveMode(memory);
  const config = buildModeConfig(mode);
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const selectedDays = sortWorkoutDays(
    memory.workoutDays.length > 0 ? memory.workoutDays : ["Mon", "Wed", "Fri"]
  );
  const durationMin = Math.max(25, memory.sessionLengthMin + config.sessionAdjustment);

  return {
    mode,
    title: config.title,
    reason: config.reason,
    focus: config.focus,
    summary: `${config.summary} Current coaching focus: ${memory.currentFocus}.`,
    nextActions: memory.weeklyBrief.nextActions.slice(0, 3),
    days: selectedDays.map((dayLabel, index) => {
      const focus = config.emphases[index % config.emphases.length];
      const dayOfWeek = weekdayMap.indexOf(dayLabel.slice(0, 3));

      return {
        id: createId("day"),
        dayOfWeek: dayOfWeek === -1 ? ((index + 1) % 7) + 1 : dayOfWeek,
        title: `${dayLabel} ${focus}`,
        workoutFocus: focus,
        mealFocus:
          mode === "recovery_reset"
            ? "Protein-forward meals with easier digestion and steady hydration"
            : "Protein-forward meals with recovery carbs and simple structure",
        habitFocus:
          mode === "consistency_reset"
            ? "Anchor hydration, a post-meal walk, and one low-friction habit every day"
            : "Hydration, post-meal movement, and a consistent sleep window",
        durationMin,
        exercises: buildExercisesForFocus(focus, mode),
        notes:
          memory.availableEquipment.length > 0
            ? `Use available equipment: ${memory.availableEquipment.join(", ")}. ${config.reason}`
            : config.reason,
      };
    }),
  };
}

export async function getAdaptivePlanningSnapshot(userId: string) {
  const memory = await buildCoachMemorySnapshot(userId);
  const draft = buildAdaptivePlanDraft(memory);

  return {
    mode: draft.title,
    reason: draft.reason,
    summary: draft.summary,
    focus: draft.focus,
    nextActions: draft.nextActions,
    shouldPromptReplan:
      memory.weeklyBrief.momentum === "needs_attention" ||
      memory.weeklyBrief.recoveryStatus === "recover",
  };
}

export async function replanMemberWeek(userId: string) {
  const memory = await buildCoachMemorySnapshot(userId);
  const draft = buildAdaptivePlanDraft(memory);
  const now = new Date().toISOString();
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const programId = createId("program");

  await db.transaction(async (tx) => {
    await tx
      .update(weeklyPrograms)
      .set({
        status: "archived",
        updatedAt: now,
      })
      .where(eq(weeklyPrograms.userId, userId));

    await tx.insert(weeklyPrograms).values({
      id: programId,
      userId,
      weekStartDate: format(weekStart, "yyyy-MM-dd"),
      weekEndDate: format(addDays(weekStart, 6), "yyyy-MM-dd"),
      focus: draft.focus,
      summary: draft.summary,
      status: "active",
      aiGenerated: true,
      aiSummary: {
        source: "adaptive_replanner",
        mode: draft.mode,
        reason: draft.reason,
        nextActions: draft.nextActions,
        generatedAt: now,
        momentum: memory.weeklyBrief.momentum,
        recoveryStatus: memory.weeklyBrief.recoveryStatus,
        consistencyScore: memory.weeklyBrief.consistencyScore,
      },
      createdAt: now,
      updatedAt: now,
    });

    await tx.insert(programDays).values(
      draft.days.map((day) => ({
        id: day.id,
        programId,
        dayOfWeek: day.dayOfWeek,
        title: day.title,
        workoutFocus: day.workoutFocus,
        mealFocus: day.mealFocus,
        habitFocus: day.habitFocus,
        durationMin: day.durationMin,
        exercises: day.exercises,
        notes: day.notes,
        createdAt: now,
        updatedAt: now,
      }))
    );
  });

  await queueNotification({
    userId,
    type: "weekly_replan_ready",
    title: `${draft.title} week is ready`,
    body: draft.summary,
    metadata: {
      mode: draft.mode,
      reason: draft.reason,
      focus: draft.focus,
      nextActions: draft.nextActions,
    },
  });

  return {
    programId,
    mode: draft.title,
    reason: draft.reason,
    summary: draft.summary,
    focus: draft.focus,
    nextActions: draft.nextActions,
  };
}
