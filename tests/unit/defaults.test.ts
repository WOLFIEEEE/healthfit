import { describe, expect, it } from "vitest";
import {
  buildCheckInSummary,
  buildInitialWeeklyProgram,
} from "../../lib/healthfit/server/defaults";

describe("default program generation", () => {
  it("creates program days for the chosen workout schedule", () => {
    const program = buildInitialWeeklyProgram({
      fullName: "Alex Runner",
      experienceLevel: "beginner",
      activityLevel: "moderate",
      primaryGoalType: "energy",
      goalSummary: "Build more stable energy and consistency.",
      workoutDays: ["Mon", "Wed", "Fri"],
      sessionLengthMin: 45,
      availableEquipment: ["Bodyweight"],
      dietaryPreferences: ["High protein"],
      mealsPerDay: 3,
      hydrationTargetMl: 2500,
      wellnessConsentAccepted: true,
      disclaimerAccepted: true,
    });

    expect(program.days).toHaveLength(3);
    expect(program.summary.toLowerCase()).toContain("energy");
  });

  it("returns a recovery-first summary for low check-in scores", () => {
    const summary = buildCheckInSummary({
      moodScore: 4,
      energyScore: 4,
      stressScore: 9,
      adherenceScore: 3,
    });

    expect(summary.toLowerCase()).toContain("recovery");
  });
});
