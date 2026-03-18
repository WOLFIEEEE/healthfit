import { describe, expect, it } from "vitest";
import {
  buildCoachActions,
  buildCoachContextSnapshot,
  buildProactiveBrief,
  CoachMemorySnapshot,
} from "@/lib/healthfit/server/coach-intelligence";

function createMemory(
  overrides: Partial<CoachMemorySnapshot> = {}
): CoachMemorySnapshot {
  return {
    userId: "user_123",
    planName: "Pro",
    currentPlanKey: "pro",
    goalSummary: "build consistency and improve energy",
    activityLevel: "moderate",
    experienceLevel: "beginner",
    workoutDays: ["Mon", "Wed", "Fri"],
    availableEquipment: ["Bodyweight", "Dumbbells"],
    sessionLengthMin: 45,
    currentFocus: "reduce friction and keep recovery strong",
    currentProgramSummary: "A stable week with three sessions.",
    activeGoalTitles: ["Build consistency"],
    weeklyBrief: {
      consistencyScore: 54,
      momentum: "needs_attention",
      recoveryStatus: "recover",
      summary: "Momentum needs attention and recovery should lead the next decisions.",
      wins: ["You logged back into the app and kept some structure in place."],
      watchouts: ["Hydration and workouts both slipped this week."],
      nextActions: [
        "Protect sleep and hydration first.",
        "Trim the next week down to easy wins.",
      ],
      metrics: {
        workoutCompletionPercent: 40,
        habitCompletionPercent: 45,
        hydrationCompletionPercent: 50,
        mealConsistencyPercent: 35,
        checkInsLogged: 0,
        aiMessagesUsed: 2,
      },
    },
    latestCheckInSummary: "Recovery and simplicity should lead the next 24 hours.",
    daysSinceLastCheckIn: 3,
    checkInStale: true,
    recentWorkoutNames: ["Lower body", "Upper body"],
    recentMealTitles: ["Chicken bowl"],
    recentConversationTurns: [
      {
        role: "user",
        content: "I am feeling flat and need a reset.",
      },
    ],
    habitSlugs: ["hydrate", "sleep"],
    promptContext: "Context block",
    ...overrides,
  };
}

describe("coach intelligence", () => {
  it("builds a context snapshot with the right tone badges", () => {
    const context = buildCoachContextSnapshot(createMemory());

    expect(context.recoveryStatus).toBe("recover");
    expect(context.momentum).toBe("needs_attention");
    expect(context.badges).toContainEqual({
      label: "Recovery",
      value: "recover",
      tone: "attention",
    });
    expect(context.badges).toContainEqual({
      label: "Check-in",
      value: "needs refresh",
      tone: "attention",
    });
  });

  it("returns actionable recovery and replanning actions for clear coach replies", () => {
    const actions = buildCoachActions({
      memory: createMemory(),
      message: "I trained legs yesterday and need a recovery plan.",
      safetyStatus: "clear",
    });

    expect(actions.map((action) => action.type)).toContain("log_workout");
    expect(actions.map((action) => action.type)).toContain("navigate");
    expect(actions.map((action) => action.type)).toContain("replan_week");
  });

  it("keeps caution flows focused on safety and check-ins", () => {
    const actions = buildCoachActions({
      memory: createMemory(),
      message: "I have chest pain while training.",
      safetyStatus: "caution",
    });

    expect(actions).toEqual([
      expect.objectContaining({
        type: "navigate",
        href: "/dashboard/check-ins",
      }),
      expect.objectContaining({
        type: "replan_week",
      }),
    ]);
  });

  it("builds a recovery-first proactive brief with follow-up actions", () => {
    const brief = buildProactiveBrief(createMemory());

    expect(brief.title).toBe("Recovery-first AI brief");
    expect(brief.summary).toMatch(/Current focus/);
    expect(brief.nextActions).toContain(
      "Complete a fresh check-in so coaching stays accurate."
    );
  });
});
