import { describe, expect, it } from "vitest";
import { getPlanByKey } from "../../lib/config/plans";
import {
  buildCoachPromptSuggestions,
  buildMembershipIntelligence,
  buildWeeklyPerformanceBrief,
} from "../../lib/healthfit/premium";

describe("premium insights helpers", () => {
  it("builds a rising weekly brief when consistency is high", () => {
    const brief = buildWeeklyPerformanceBrief({
      goalSummary: "Build more energy and consistency",
      plannedWorkouts: 4,
      completedWorkouts: 4,
      mealsLogged: 20,
      targetMeals: 21,
      habitLogsCompleted: 15,
      habitLogsTarget: 21,
      hydrationTargetMl: 2500,
      averageDailyWaterMl: 2400,
      averageSleepHours: 7.4,
      averageStressScore: 4,
      averageEnergyScore: 8,
      averageAdherenceScore: 8,
      checkInsLogged: 3,
      aiMessagesUsed: 6,
    });

    expect(brief.momentum).toBe("rising");
    expect(brief.consistencyScore).toBeGreaterThan(70);
    expect(brief.wins.length).toBeGreaterThan(0);
  });

  it("flags locked coaching on starter plans", () => {
    const membership = buildMembershipIntelligence({
      plan: getPlanByKey("starter"),
      aiMessagesUsedToday: 0,
      aiDailyLimit: 0,
      activeGoals: 1,
      maxActiveGoals: 2,
    });

    expect(membership.aiUsage.status).toBe("locked");
    expect(membership.upgradePrompt?.toLowerCase()).toContain("upgrade");
  });

  it("creates coaching prompts that react to recovery status", () => {
    const brief = buildWeeklyPerformanceBrief({
      goalSummary: "Get leaner while keeping strength",
      plannedWorkouts: 4,
      completedWorkouts: 2,
      mealsLogged: 10,
      targetMeals: 21,
      habitLogsCompleted: 6,
      habitLogsTarget: 21,
      hydrationTargetMl: 2500,
      averageDailyWaterMl: 1200,
      averageSleepHours: 5.7,
      averageStressScore: 8,
      averageEnergyScore: 4,
      averageAdherenceScore: 5,
      checkInsLogged: 1,
      aiMessagesUsed: 4,
    });
    const membership = buildMembershipIntelligence({
      plan: getPlanByKey("pro"),
      aiMessagesUsedToday: 6,
      aiDailyLimit: 25,
      activeGoals: 4,
      maxActiveGoals: 5,
    });

    const prompts = buildCoachPromptSuggestions({
      goalSummary: "Get leaner while keeping strength",
      brief,
      membership,
    });

    expect(prompts[1]?.toLowerCase()).toContain("recovery");
    expect(prompts).toHaveLength(3);
  });
});
