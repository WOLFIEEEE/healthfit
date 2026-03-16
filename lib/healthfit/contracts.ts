import { z } from "zod";

export const planKeys = ["starter", "pro", "elite"] as const;
export type PlanKey = (typeof planKeys)[number];

export const userRoles = ["member", "admin"] as const;
export type UserRole = (typeof userRoles)[number];

export type FeatureEntitlement = {
  aiCoach: boolean;
  weeklyPrograms: boolean;
  advancedAnalytics: boolean;
  premiumPrograms: boolean;
  progressPhotos: boolean;
  prioritySupport: boolean;
  customHabitTemplates: boolean;
  aiDailyMessages: number;
  maxActiveGoals: number;
};

export type PlanCatalogItem = {
  key: PlanKey;
  name: string;
  tagline: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  currency: "USD";
  featured?: boolean;
  dodoProductId?: string;
  badge?: string;
  accentClassName: string;
  entitlements: FeatureEntitlement;
  features: string[];
};

export type DashboardMetric = {
  label: string;
  value: string;
  helper: string;
};

export type WeeklyPerformanceBrief = {
  consistencyScore: number;
  momentum: "rising" | "steady" | "needs_attention";
  recoveryStatus: "strong" | "watch" | "recover";
  summary: string;
  wins: string[];
  watchouts: string[];
  nextActions: string[];
  metrics: {
    workoutCompletionPercent: number;
    habitCompletionPercent: number;
    hydrationCompletionPercent: number;
    mealConsistencyPercent: number;
    checkInsLogged: number;
    aiMessagesUsed: number;
  };
};

export type UsageMeter = {
  label: string;
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
  status: "locked" | "available" | "near_limit";
  helper: string;
};

export type MembershipIntelligence = {
  planName: string;
  planKey: PlanKey;
  valueHeadline: string;
  supportLane: "priority" | "standard";
  aiUsage: UsageMeter;
  goalUsage: UsageMeter;
  unlockedFeatures: string[];
  lockedFeatures: string[];
  upgradePrompt: string | null;
};

export type PremiumExperienceSnapshot = {
  weeklyBrief: WeeklyPerformanceBrief;
  membership: MembershipIntelligence;
  coachPrompts: string[];
};

export type DashboardSnapshot = {
  user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string | null;
    role: UserRole;
    currentPlanKey: PlanKey;
    onboardingCompleted: boolean;
  };
  onboarding: {
    completed: boolean;
    currentStep: string;
  };
  profile: {
    goalSummary: string;
    activityLevel: string;
    experienceLevel: string;
    hydrationTargetMl: number;
    macroTargets: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  };
  metrics: DashboardMetric[];
  nextWorkout: {
    title: string;
    focus: string;
    dayLabel: string;
    durationMin: number;
  } | null;
  todayNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    waterMl: number;
  };
  habits: {
    completionRate: number;
    completedToday: number;
    totalToday: number;
  };
  checkIn: {
    moodScore: number | null;
    energyScore: number | null;
    stressScore: number | null;
    sleepHours: number | null;
    summary: string | null;
  } | null;
  progress: Array<{
    date: string;
    weightKg: number | null;
    adherence: number | null;
  }>;
  billing: {
    plan: PlanKey;
    status: string;
    nextBillingDate: string | null;
    invoicesCount: number;
  };
  notifications: Array<{
    id: string;
    title: string;
    body: string;
    createdAt: string;
    readAt: string | null;
  }>;
};

export const onboardingSchema = z.object({
  fullName: z.string().trim().min(2),
  age: z.number().int().min(18).max(100).optional(),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
  activityLevel: z.enum(["low", "moderate", "high"]),
  primaryGoalType: z.enum(["fat_loss", "muscle_gain", "recomposition", "energy", "habit_consistency"]),
  goalSummary: z.string().trim().min(10).max(240),
  workoutDays: z.array(z.string()).min(3).max(7),
  sessionLengthMin: z.number().int().min(20).max(120),
  availableEquipment: z.array(z.string()).max(10),
  dietaryPreferences: z.array(z.string()).max(10),
  mealsPerDay: z.number().int().min(2).max(6),
  hydrationTargetMl: z.number().int().min(1200).max(5000),
  currentWeightKg: z.number().min(30).max(300).optional(),
  targetWeightKg: z.number().min(30).max(300).optional(),
  heightCm: z.number().min(120).max(240).optional(),
  injuriesAndLimitations: z.string().trim().max(300).optional(),
  onboardingNotes: z.string().trim().max(400).optional(),
  wellnessConsentAccepted: z.literal(true),
  disclaimerAccepted: z.literal(true),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const workoutLogSchema = z.object({
  programDayId: z.string().trim().optional(),
  workoutName: z.string().trim().min(2).max(120),
  durationMin: z.number().int().min(5).max(240),
  completed: z.boolean().default(true),
  effortScore: z.number().int().min(1).max(10).optional(),
  recoveryScore: z.number().int().min(1).max(10).optional(),
  caloriesBurned: z.number().int().min(0).max(2500).optional(),
  notes: z.string().trim().max(300).optional(),
});

export type WorkoutLogInput = z.infer<typeof workoutLogSchema>;

export const mealLogSchema = z.object({
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  title: z.string().trim().min(2).max(120),
  calories: z.number().int().min(0).max(3000),
  proteinGrams: z.number().int().min(0).max(300).default(0),
  carbsGrams: z.number().int().min(0).max(400).default(0),
  fatGrams: z.number().int().min(0).max(200).default(0),
  waterMl: z.number().int().min(0).max(4000).default(0),
  notes: z.string().trim().max(240).optional(),
});

export type MealLogInput = z.infer<typeof mealLogSchema>;

export const habitLogSchema = z.object({
  habitTemplateId: z.string().trim().min(2),
  status: z.enum(["done", "skipped"]).default("done"),
  value: z.number().min(0).max(10000).optional(),
  note: z.string().trim().max(240).optional(),
});

export type HabitLogInput = z.infer<typeof habitLogSchema>;

export const checkInSchema = z.object({
  periodType: z.enum(["daily", "weekly"]).default("daily"),
  moodScore: z.number().int().min(1).max(10),
  energyScore: z.number().int().min(1).max(10),
  stressScore: z.number().int().min(1).max(10),
  adherenceScore: z.number().int().min(1).max(10),
  sleepHours: z.number().min(0).max(16),
  wins: z.string().trim().max(240).optional(),
  blockers: z.string().trim().max(240).optional(),
  notes: z.string().trim().max(400).optional(),
});

export type CheckInInput = z.infer<typeof checkInSchema>;

export const coachMessageSchema = z.object({
  conversationId: z.string().trim().optional(),
  message: z.string().trim().min(2).max(1200),
});

export type CoachMessageInput = z.infer<typeof coachMessageSchema>;

export type CoachReply = {
  conversationId: string;
  message: string;
  safetyStatus: "clear" | "caution";
  flags: string[];
  fallbackUsed: boolean;
  structured: {
    recap: string;
    focus: string[];
    nextActions: string[];
    disclaimer: string;
  };
};

export const uploadRequestSchema = z.object({
  bucket: z.enum(["avatars", "progress-photos"]),
  extension: z.string().trim().regex(/^[a-zA-Z0-9]+$/),
});

export type UploadRequestInput = z.infer<typeof uploadRequestSchema>;
