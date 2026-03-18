import { db } from "@/lib/drizzle/client";
import { achievements, coachPersonalities } from "@/lib/drizzle/schema";
import { createId } from "@/lib/healthfit/ids";

const ACHIEVEMENT_SEEDS = [
  // Consistency — workout counts
  { slug: "first_workout", name: "First Workout", description: "Log your first workout", category: "milestone", iconEmoji: "💪", criteria: { type: "count", table: "workoutLogs", value: 1 }, tier: "bronze", xpValue: 10 },
  { slug: "10_workouts", name: "Double Digits", description: "Log 10 workouts", category: "milestone", iconEmoji: "🎯", criteria: { type: "count", table: "workoutLogs", value: 10 }, tier: "silver", xpValue: 25 },
  { slug: "50_workouts", name: "Half Century", description: "Log 50 workouts", category: "milestone", iconEmoji: "🥇", criteria: { type: "count", table: "workoutLogs", value: 50 }, tier: "gold", xpValue: 75 },
  { slug: "100_workouts", name: "Century Club", description: "Log 100 workouts", category: "milestone", iconEmoji: "💎", criteria: { type: "count", table: "workoutLogs", value: 100 }, tier: "platinum", xpValue: 200 },

  // Streaks
  { slug: "streak_7_workout", name: "Week Warrior", description: "7-day workout streak", category: "consistency", iconEmoji: "🔥", criteria: { type: "streak_days", category: "workout", value: 7 }, tier: "silver", xpValue: 25 },
  { slug: "streak_30_workout", name: "Month Machine", description: "30-day workout streak", category: "consistency", iconEmoji: "⚡", criteria: { type: "streak_days", category: "workout", value: 30 }, tier: "gold", xpValue: 100 },
  { slug: "streak_3_habit", name: "Habit Starter", description: "3-day habit streak", category: "consistency", iconEmoji: "🌱", criteria: { type: "streak_days", category: "habit", value: 3 }, tier: "bronze", xpValue: 10 },
  { slug: "streak_30_habit", name: "Habit Master", description: "30-day habit streak", category: "consistency", iconEmoji: "🌿", criteria: { type: "streak_days", category: "habit", value: 30 }, tier: "gold", xpValue: 100 },
  { slug: "streak_7_checkin", name: "Self Aware", description: "7-day check-in streak", category: "consistency", iconEmoji: "📋", criteria: { type: "streak_days", category: "checkin", value: 7 }, tier: "silver", xpValue: 25 },

  // Milestones
  { slug: "first_checkin", name: "First Reflection", description: "Complete your first check-in", category: "milestone", iconEmoji: "🪞", criteria: { type: "count", table: "checkIns", value: 1 }, tier: "bronze", xpValue: 10 },
  { slug: "onboarding_done", name: "Onboarded", description: "Complete the onboarding flow", category: "milestone", iconEmoji: "🚀", criteria: { type: "event", event: "onboarding_complete" }, tier: "bronze", xpValue: 20 },
  { slug: "coach_50", name: "Coach Regular", description: "Send 50 messages to your AI coach", category: "milestone", iconEmoji: "🧠", criteria: { type: "count", table: "coachMessages", value: 50 }, tier: "silver", xpValue: 30 },

  // Social
  { slug: "public_profile", name: "Social Butterfly", description: "Create a public profile", category: "social", iconEmoji: "🦋", criteria: { type: "event", event: "public_profile_created" }, tier: "bronze", xpValue: 15 },
  { slug: "first_challenge", name: "Challenger", description: "Join your first challenge", category: "social", iconEmoji: "⚔️", criteria: { type: "event", event: "challenge_joined" }, tier: "bronze", xpValue: 15 },
  { slug: "challenge_complete", name: "Champion", description: "Complete a community challenge", category: "social", iconEmoji: "👑", criteria: { type: "event", event: "challenge_completed" }, tier: "gold", xpValue: 100 },
  { slug: "first_referral", name: "Ambassador", description: "Refer someone who signs up", category: "social", iconEmoji: "🤝", criteria: { type: "count", table: "referrals", value: 1, status: "signed_up" }, tier: "silver", xpValue: 50 },
];

const PERSONALITY_SEEDS = [
  { slug: "default", name: "Balanced Coach", description: "Thoughtful and balanced — adapts to your style naturally", avatarEmoji: "🤖", planRequired: "starter", systemPromptModifier: "" },
  { slug: "motivator", name: "The Motivator", description: "High-energy and encouraging — celebrates every win", avatarEmoji: "🔥", planRequired: "pro", systemPromptModifier: "Be extra encouraging and celebratory. Use high-energy language. Celebrate every small win enthusiastically. End responses with a motivational note." },
  { slug: "analyst", name: "The Analyst", description: "Data-driven and precise — lets the numbers guide you", avatarEmoji: "📊", planRequired: "pro", systemPromptModifier: "Focus on data, metrics, and precise recommendations. Be concise and factual. Reference numbers and trends. Avoid unnecessary encouragement — let the data speak." },
  { slug: "zen", name: "The Zen Master", description: "Calm and mindful — prioritizes balance and recovery", avatarEmoji: "🧘", planRequired: "pro", systemPromptModifier: "Be calm, mindful, and emphasize balance and recovery. Use gentle, meditative language. Prioritize sustainable progress over intensity. Remind the user to breathe." },
  { slug: "drill_sergeant", name: "The Drill Sergeant", description: "Direct and demanding — holds you accountable", avatarEmoji: "💪", planRequired: "elite", systemPromptModifier: "Be direct, demanding, and no-nonsense. Push the user firmly but safely. Use short, punchy sentences. No sugarcoating — hold them accountable." },
  { slug: "supportive", name: "The Supporter", description: "Warm and empathetic — focuses on emotional wellbeing", avatarEmoji: "💚", planRequired: "pro", systemPromptModifier: "Be warm, empathetic, and patient. Prioritize emotional wellbeing. Acknowledge struggles before suggesting solutions. Never shame or pressure." },
];

export async function seedAchievements() {
  const now = new Date().toISOString();

  for (const seed of ACHIEVEMENT_SEEDS) {
    await db
      .insert(achievements)
      .values({
        id: createId("achieve"),
        ...seed,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing({ target: achievements.slug });
  }

  console.log(`Seeded ${ACHIEVEMENT_SEEDS.length} achievements`);
}

export async function seedCoachPersonalities() {
  const now = new Date().toISOString();

  for (const seed of PERSONALITY_SEEDS) {
    await db
      .insert(coachPersonalities)
      .values({
        id: createId("persona"),
        ...seed,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing({ target: coachPersonalities.slug });
  }

  console.log(`Seeded ${PERSONALITY_SEEDS.length} coach personalities`);
}

export async function seedAll() {
  await seedAchievements();
  await seedCoachPersonalities();
}
