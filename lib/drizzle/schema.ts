import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const timestamps = () => ({
  createdAt: timestamp("created_at", {
    mode: "string",
    withTimezone: true,
  }).notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "string",
    withTimezone: true,
  }).notNull(),
});

export const users = pgTable("users", {
  supabaseUserId: text("supabase_user_id").primaryKey(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  role: text("role").notNull().default("member"),
  dodoCustomerId: text("dodo_customer_id"),
  currentSubscriptionId: text("current_subscription_id"),
  currentPlanKey: text("current_plan_key").notNull().default("starter"),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  wellnessConsentAccepted: boolean("wellness_consent_accepted")
    .notNull()
    .default(false),
  disclaimerAccepted: boolean("disclaimer_accepted").notNull().default(false),
  lastActiveAt: timestamp("last_active_at", {
    mode: "string",
    withTimezone: true,
  }),
  ...timestamps(),
  deletedAt: timestamp("deleted_at", {
    mode: "string",
    withTimezone: true,
  }),
});

export const memberProfiles = pgTable("member_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.supabaseUserId, { onDelete: "cascade" }),
  timezone: text("timezone").notNull().default("UTC"),
  age: integer("age"),
  experienceLevel: text("experience_level"),
  activityLevel: text("activity_level"),
  goalSummary: text("goal_summary"),
  currentWeightKg: real("current_weight_kg"),
  targetWeightKg: real("target_weight_kg"),
  heightCm: real("height_cm"),
  availableEquipment: jsonb("available_equipment").notNull().default([]),
  dietaryPreferences: jsonb("dietary_preferences").notNull().default([]),
  workoutDays: jsonb("workout_days").notNull().default([]),
  mealsPerDay: integer("meals_per_day"),
  sessionLengthMin: integer("session_length_min"),
  hydrationTargetMl: integer("hydration_target_ml"),
  calorieTarget: integer("calorie_target"),
  proteinTargetGrams: integer("protein_target_grams"),
  carbsTargetGrams: integer("carbs_target_grams"),
  fatTargetGrams: integer("fat_target_grams"),
  injuriesAndLimitations: text("injuries_and_limitations"),
  onboardingNotes: text("onboarding_notes"),
  lastCheckInAt: timestamp("last_check_in_at", {
    mode: "string",
    withTimezone: true,
  }),
  profilePhotoPath: text("profile_photo_path"),
  ...timestamps(),
});

export const goals = pgTable("goals", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.supabaseUserId, { onDelete: "cascade" }),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  targetValue: real("target_value"),
  currentValue: real("current_value"),
  unit: text("unit"),
  targetDate: timestamp("target_date", {
    mode: "string",
    withTimezone: true,
  }),
  status: text("status").notNull().default("active"),
  priority: integer("priority").notNull().default(1),
  ...timestamps(),
});

export const assessments = pgTable("assessments", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.supabaseUserId, { onDelete: "cascade" }),
  type: text("type").notNull().default("onboarding"),
  mobilityScore: integer("mobility_score"),
  readinessScore: integer("readiness_score"),
  sleepAverageHours: real("sleep_average_hours"),
  stressScore: integer("stress_score"),
  energyScore: integer("energy_score"),
  notes: text("notes"),
  metadata: jsonb("metadata").notNull().default({}),
  recordedAt: timestamp("recorded_at", {
    mode: "string",
    withTimezone: true,
  }).notNull(),
  ...timestamps(),
});

export const weeklyPrograms = pgTable("weekly_programs", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.supabaseUserId, { onDelete: "cascade" }),
  weekStartDate: date("week_start_date", { mode: "string" }).notNull(),
  weekEndDate: date("week_end_date", { mode: "string" }).notNull(),
  focus: text("focus").notNull(),
  summary: text("summary").notNull(),
  status: text("status").notNull().default("active"),
  aiGenerated: boolean("ai_generated").notNull().default(false),
  aiSummary: jsonb("ai_summary").notNull().default({}),
  ...timestamps(),
});

export const programDays = pgTable("program_days", {
  id: text("id").primaryKey(),
  programId: text("program_id")
    .notNull()
    .references(() => weeklyPrograms.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(),
  title: text("title").notNull(),
  workoutFocus: text("workout_focus"),
  mealFocus: text("meal_focus"),
  habitFocus: text("habit_focus"),
  durationMin: integer("duration_min"),
  exercises: jsonb("exercises").notNull().default([]),
  notes: text("notes"),
  ...timestamps(),
});

export const exerciseLibrary = pgTable("exercise_library", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  equipment: text("equipment"),
  difficulty: text("difficulty"),
  instructions: jsonb("instructions").notNull().default([]),
  tags: jsonb("tags").notNull().default([]),
  ...timestamps(),
});

export const workoutLogs = pgTable("workout_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.supabaseUserId, { onDelete: "cascade" }),
  programDayId: text("program_day_id").references(() => programDays.id, {
    onDelete: "set null",
  }),
  workoutName: text("workout_name").notNull(),
  durationMin: integer("duration_min").notNull(),
  completed: boolean("completed").notNull().default(false),
  effortScore: integer("effort_score"),
  recoveryScore: integer("recovery_score"),
  caloriesBurned: integer("calories_burned"),
  notes: text("notes"),
  loggedAt: timestamp("logged_at", {
    mode: "string",
    withTimezone: true,
  }).notNull(),
  ...timestamps(),
});

export const mealLogs = pgTable("meal_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.supabaseUserId, { onDelete: "cascade" }),
  mealType: text("meal_type").notNull(),
  title: text("title").notNull(),
  calories: integer("calories").notNull(),
  proteinGrams: integer("protein_grams").notNull().default(0),
  carbsGrams: integer("carbs_grams").notNull().default(0),
  fatGrams: integer("fat_grams").notNull().default(0),
  waterMl: integer("water_ml").notNull().default(0),
  notes: text("notes"),
  loggedAt: timestamp("logged_at", {
    mode: "string",
    withTimezone: true,
  }).notNull(),
  ...timestamps(),
});

export const habitTemplates = pgTable("habit_templates", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.supabaseUserId, {
    onDelete: "cascade",
  }),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  metricType: text("metric_type").notNull().default("boolean"),
  targetValue: real("target_value"),
  targetFrequency: text("target_frequency").notNull().default("daily"),
  isDefault: boolean("is_default").notNull().default(false),
  ...timestamps(),
});

export const habitLogs = pgTable(
  "habit_logs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.supabaseUserId, { onDelete: "cascade" }),
    habitTemplateId: text("habit_template_id")
      .notNull()
      .references(() => habitTemplates.id, { onDelete: "cascade" }),
    loggedForDate: date("logged_for_date", { mode: "string" }).notNull(),
    status: text("status").notNull().default("done"),
    value: real("value"),
    note: text("note"),
    ...timestamps(),
  },
  (table) => ({
    userHabitDateIdx: uniqueIndex("habit_logs_user_habit_date_idx").on(
      table.userId,
      table.habitTemplateId,
      table.loggedForDate
    ),
  })
);

export const checkIns = pgTable("check_ins", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.supabaseUserId, { onDelete: "cascade" }),
  periodType: text("period_type").notNull().default("daily"),
  moodScore: integer("mood_score"),
  energyScore: integer("energy_score"),
  stressScore: integer("stress_score"),
  adherenceScore: integer("adherence_score"),
  sleepHours: real("sleep_hours"),
  wins: text("wins"),
  blockers: text("blockers"),
  notes: text("notes"),
  aiSummary: text("ai_summary"),
  ...timestamps(),
});

export const progressMetrics = pgTable("progress_metrics", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.supabaseUserId, { onDelete: "cascade" }),
  metricType: text("metric_type").notNull(),
  value: real("value").notNull(),
  unit: text("unit").notNull(),
  note: text("note"),
  recordedAt: timestamp("recorded_at", {
    mode: "string",
    withTimezone: true,
  }).notNull(),
  ...timestamps(),
});

export const coachConversations = pgTable("coach_conversations", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.supabaseUserId, { onDelete: "cascade" }),
  title: text("title").notNull(),
  safetyStatus: text("safety_status").notNull().default("clear"),
  lastMessageAt: timestamp("last_message_at", {
    mode: "string",
    withTimezone: true,
  }),
  ...timestamps(),
});

export const coachMessages = pgTable("coach_messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => coachConversations.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.supabaseUserId, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  safetyFlags: jsonb("safety_flags").notNull().default([]),
  model: text("model"),
  tokenCount: integer("token_count"),
  promptSnapshot: jsonb("prompt_snapshot").notNull().default({}),
  structuredOutput: jsonb("structured_output").notNull().default({}),
  ...timestamps(),
});

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.supabaseUserId, { onDelete: "cascade" }),
  channel: text("channel").notNull().default("in_app"),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull().default("queued"),
  metadata: jsonb("metadata").notNull().default({}),
  scheduledAt: timestamp("scheduled_at", {
    mode: "string",
    withTimezone: true,
  }),
  sentAt: timestamp("sent_at", {
    mode: "string",
    withTimezone: true,
  }),
  readAt: timestamp("read_at", {
    mode: "string",
    withTimezone: true,
  }),
  ...timestamps(),
});

export const entitlements = pgTable("entitlements", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.supabaseUserId, { onDelete: "cascade" }),
  planKey: text("plan_key").notNull(),
  source: text("source").notNull().default("system"),
  isActive: boolean("is_active").notNull().default(true),
  aiDailyMessageLimit: integer("ai_daily_message_limit").notNull().default(5),
  features: jsonb("features").notNull().default({}),
  expiresAt: timestamp("expires_at", {
    mode: "string",
    withTimezone: true,
  }),
  ...timestamps(),
});

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  actorUserId: text("actor_user_id").references(() => users.supabaseUserId, {
    onDelete: "set null",
  }),
  subjectUserId: text("subject_user_id").references(() => users.supabaseUserId, {
    onDelete: "set null",
  }),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id"),
  metadata: jsonb("metadata").notNull().default({}),
  ...timestamps(),
});

export const announcements = pgTable("announcements", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  audience: text("audience").notNull().default("members"),
  status: text("status").notNull().default("draft"),
  publishedAt: timestamp("published_at", {
    mode: "string",
    withTimezone: true,
  }),
  ...timestamps(),
});

export const subscriptions = pgTable("subscriptions", {
  subscriptionId: text("subscription_id").primaryKey().notNull(),
  userId: text("user_id").references(() => users.supabaseUserId, {
    onDelete: "set null",
  }),
  recurringPreTaxAmount: real("recurring_pre_tax_amount").notNull(),
  taxInclusive: boolean("tax_inclusive").notNull(),
  currency: text("currency").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", {
    mode: "string",
    withTimezone: true,
  }).notNull(),
  productId: text("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  trialPeriodDays: integer("trial_period_days"),
  subscriptionPeriodInterval: text("subscription_period_interval"),
  paymentPeriodInterval: text("payment_period_interval"),
  subscriptionPeriodCount: integer("subscription_period_count"),
  paymentFrequencyCount: integer("payment_frequency_count"),
  nextBillingDate: timestamp("next_billing_date", {
    mode: "string",
    withTimezone: true,
  }),
  previousBillingDate: timestamp("previous_billing_date", {
    mode: "string",
    withTimezone: true,
  }),
  customerId: text("customer_id").notNull(),
  customerName: text("customer_name"),
  customerEmail: text("customer_email").notNull(),
  metadata: jsonb("metadata"),
  discountId: text("discount_id"),
  cancelledAt: timestamp("cancelled_at", {
    mode: "string",
    withTimezone: true,
  }),
  cancelAtNextBillingDate: boolean("cancel_at_next_billing_date"),
  billing: jsonb("billing").notNull(),
  onDemand: boolean("on_demand"),
  addons: jsonb("addons"),
});

export const payments = pgTable("payments", {
  paymentId: text("payment_id").primaryKey(),
  status: text("status").notNull(),
  totalAmount: real("total_amount").notNull(),
  currency: text("currency").notNull(),
  paymentMethod: text("payment_method"),
  paymentMethodType: text("payment_method_type"),
  userId: text("user_id").references(() => users.supabaseUserId, {
    onDelete: "set null",
  }),
  customerId: text("customer_id").notNull(),
  customerName: text("customer_name"),
  customerEmail: text("customer_email").notNull(),
  createdAt: timestamp("created_at", {
    mode: "string",
    withTimezone: true,
  }).notNull(),
  subscriptionId: text("subscription_id"),
  brandId: text("brand_id").notNull(),
  digitalProductDelivered: boolean("digital_product_delivered"),
  metadata: jsonb("metadata"),
  webhookData: jsonb("webhook_data").notNull(),
  billing: jsonb("billing").notNull(),
  businessId: text("business_id").notNull(),
  cardIssuingCountry: text("card_issuing_country"),
  cardLastFour: text("card_last_four"),
  cardNetwork: text("card_network"),
  cardType: text("card_type"),
  discountId: text("discount_id"),
  disputes: jsonb("disputes"),
  errorCode: text("error_code"),
  errorMessage: text("error_message"),
  paymentLink: text("payment_link"),
  productCart: jsonb("product_cart"),
  refunds: jsonb("refunds"),
  settlementAmount: real("settlement_amount"),
  settlementCurrency: text("settlement_currency"),
  settlementTax: real("settlement_tax"),
  tax: real("tax"),
  updatedAt: timestamp("updated_at", { mode: "string", withTimezone: true }),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  memberProfile: one(memberProfiles, {
    fields: [users.supabaseUserId],
    references: [memberProfiles.userId],
  }),
  goals: many(goals),
  assessments: many(assessments),
  programs: many(weeklyPrograms),
  workoutLogs: many(workoutLogs),
  mealLogs: many(mealLogs),
  habitTemplates: many(habitTemplates),
  habitLogs: many(habitLogs),
  checkIns: many(checkIns),
  progressMetrics: many(progressMetrics),
  coachConversations: many(coachConversations),
  coachMessages: many(coachMessages),
  notifications: many(notifications),
  entitlements: many(entitlements),
  subscriptions: many(subscriptions),
  payments: many(payments),
  currentSubscription: one(subscriptions, {
    fields: [users.currentSubscriptionId],
    references: [subscriptions.subscriptionId],
  }),
}));

export const memberProfilesRelations = relations(memberProfiles, ({ one }) => ({
  user: one(users, {
    fields: [memberProfiles.userId],
    references: [users.supabaseUserId],
  }),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.supabaseUserId],
  }),
}));

export const assessmentsRelations = relations(assessments, ({ one }) => ({
  user: one(users, {
    fields: [assessments.userId],
    references: [users.supabaseUserId],
  }),
}));

export const weeklyProgramsRelations = relations(weeklyPrograms, ({ many, one }) => ({
  user: one(users, {
    fields: [weeklyPrograms.userId],
    references: [users.supabaseUserId],
  }),
  days: many(programDays),
}));

export const programDaysRelations = relations(programDays, ({ one, many }) => ({
  program: one(weeklyPrograms, {
    fields: [programDays.programId],
    references: [weeklyPrograms.id],
  }),
  workoutLogs: many(workoutLogs),
}));

export const workoutLogsRelations = relations(workoutLogs, ({ one }) => ({
  user: one(users, {
    fields: [workoutLogs.userId],
    references: [users.supabaseUserId],
  }),
  programDay: one(programDays, {
    fields: [workoutLogs.programDayId],
    references: [programDays.id],
  }),
}));

export const mealLogsRelations = relations(mealLogs, ({ one }) => ({
  user: one(users, {
    fields: [mealLogs.userId],
    references: [users.supabaseUserId],
  }),
}));

export const habitTemplatesRelations = relations(habitTemplates, ({ many, one }) => ({
  user: one(users, {
    fields: [habitTemplates.userId],
    references: [users.supabaseUserId],
  }),
  logs: many(habitLogs),
}));

export const habitLogsRelations = relations(habitLogs, ({ one }) => ({
  user: one(users, {
    fields: [habitLogs.userId],
    references: [users.supabaseUserId],
  }),
  habitTemplate: one(habitTemplates, {
    fields: [habitLogs.habitTemplateId],
    references: [habitTemplates.id],
  }),
}));

export const checkInsRelations = relations(checkIns, ({ one }) => ({
  user: one(users, {
    fields: [checkIns.userId],
    references: [users.supabaseUserId],
  }),
}));

export const progressMetricsRelations = relations(progressMetrics, ({ one }) => ({
  user: one(users, {
    fields: [progressMetrics.userId],
    references: [users.supabaseUserId],
  }),
}));

export const coachConversationsRelations = relations(
  coachConversations,
  ({ many, one }) => ({
    user: one(users, {
      fields: [coachConversations.userId],
      references: [users.supabaseUserId],
    }),
    messages: many(coachMessages),
  })
);

export const coachMessagesRelations = relations(coachMessages, ({ one }) => ({
  conversation: one(coachConversations, {
    fields: [coachMessages.conversationId],
    references: [coachConversations.id],
  }),
  user: one(users, {
    fields: [coachMessages.userId],
    references: [users.supabaseUserId],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.supabaseUserId],
  }),
}));

export const entitlementsRelations = relations(entitlements, ({ one }) => ({
  user: one(users, {
    fields: [entitlements.userId],
    references: [users.supabaseUserId],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.supabaseUserId],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.supabaseUserId],
  }),
}));

export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SelectMemberProfile = typeof memberProfiles.$inferSelect;
export type SelectGoal = typeof goals.$inferSelect;
export type SelectAssessment = typeof assessments.$inferSelect;
export type SelectWeeklyProgram = typeof weeklyPrograms.$inferSelect;
export type SelectProgramDay = typeof programDays.$inferSelect;
export type SelectExercise = typeof exerciseLibrary.$inferSelect;
export type SelectWorkoutLog = typeof workoutLogs.$inferSelect;
export type SelectMealLog = typeof mealLogs.$inferSelect;
export type SelectHabitTemplate = typeof habitTemplates.$inferSelect;
export type SelectHabitLog = typeof habitLogs.$inferSelect;
export type SelectCheckIn = typeof checkIns.$inferSelect;
export type SelectProgressMetric = typeof progressMetrics.$inferSelect;
export type SelectCoachConversation = typeof coachConversations.$inferSelect;
export type SelectCoachMessage = typeof coachMessages.$inferSelect;
export type SelectNotification = typeof notifications.$inferSelect;
export type SelectEntitlement = typeof entitlements.$inferSelect;
export type SelectAuditLog = typeof auditLogs.$inferSelect;
export type SelectAnnouncement = typeof announcements.$inferSelect;
export type SelectSubscription = typeof subscriptions.$inferSelect;
export type SelectPayment = typeof payments.$inferSelect;
