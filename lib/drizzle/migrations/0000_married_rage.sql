CREATE TABLE "achievements" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"icon_emoji" text NOT NULL,
	"criteria" jsonb NOT NULL,
	"tier" text DEFAULT 'bronze' NOT NULL,
	"xp_value" integer DEFAULT 10 NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "achievements_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"audience" text DEFAULT 'members' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text DEFAULT 'onboarding' NOT NULL,
	"mobility_score" integer,
	"readiness_score" integer,
	"sleep_average_hours" real,
	"stress_score" integer,
	"energy_score" integer,
	"notes" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"recorded_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_user_id" text,
	"subject_user_id" text,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenge_participants" (
	"id" text PRIMARY KEY NOT NULL,
	"challenge_id" text NOT NULL,
	"user_id" text NOT NULL,
	"current_value" real DEFAULT 0 NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"type" text NOT NULL,
	"metric" text NOT NULL,
	"target_value" real NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_by_user_id" text,
	"rules" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "check_ins" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"period_type" text DEFAULT 'daily' NOT NULL,
	"mood_score" integer,
	"energy_score" integer,
	"stress_score" integer,
	"adherence_score" integer,
	"sleep_hours" real,
	"wins" text,
	"blockers" text,
	"notes" text,
	"ai_summary" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coach_conversations" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"safety_status" text DEFAULT 'clear' NOT NULL,
	"personality_slug" text,
	"last_message_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coach_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"safety_flags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"model" text,
	"token_count" integer,
	"prompt_snapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"structured_output" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coach_personalities" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"system_prompt_modifier" text NOT NULL,
	"avatar_emoji" text DEFAULT '🤖' NOT NULL,
	"plan_required" text DEFAULT 'pro' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "coach_personalities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "email_digest_preferences" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"frequency" text DEFAULT 'weekly' NOT NULL,
	"include_coach_summary" boolean DEFAULT true NOT NULL,
	"include_weekly_stats" boolean DEFAULT true NOT NULL,
	"include_achievements" boolean DEFAULT true NOT NULL,
	"last_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "email_digest_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "entitlements" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"plan_key" text NOT NULL,
	"source" text DEFAULT 'system' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"ai_daily_message_limit" integer DEFAULT 5 NOT NULL,
	"features" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercise_library" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"equipment" text,
	"difficulty" text,
	"instructions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"target_value" real,
	"current_value" real,
	"unit" text,
	"target_date" timestamp with time zone,
	"status" text DEFAULT 'active' NOT NULL,
	"priority" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "habit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"habit_template_id" text NOT NULL,
	"logged_for_date" date NOT NULL,
	"status" text DEFAULT 'done' NOT NULL,
	"value" real,
	"note" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "habit_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"metric_type" text DEFAULT 'boolean' NOT NULL,
	"target_value" real,
	"target_frequency" text DEFAULT 'daily' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leaderboard_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"week_key" text NOT NULL,
	"metric" text NOT NULL,
	"value" real NOT NULL,
	"rank" integer,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"meal_type" text NOT NULL,
	"title" text NOT NULL,
	"calories" integer NOT NULL,
	"protein_grams" integer DEFAULT 0 NOT NULL,
	"carbs_grams" integer DEFAULT 0 NOT NULL,
	"fat_grams" integer DEFAULT 0 NOT NULL,
	"water_ml" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"logged_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"age" integer,
	"experience_level" text,
	"activity_level" text,
	"goal_summary" text,
	"current_weight_kg" real,
	"target_weight_kg" real,
	"height_cm" real,
	"available_equipment" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"dietary_preferences" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"workout_days" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"meals_per_day" integer,
	"session_length_min" integer,
	"hydration_target_ml" integer,
	"calorie_target" integer,
	"protein_target_grams" integer,
	"carbs_target_grams" integer,
	"fat_target_grams" integer,
	"injuries_and_limitations" text,
	"onboarding_notes" text,
	"last_check_in_at" timestamp with time zone,
	"profile_photo_path" text,
	"coach_personality_slug" text,
	"referral_code" text,
	"xp_total" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"channel" text DEFAULT 'in_app' NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"action_url" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"scheduled_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "onboarding_tour_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"completed_steps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tour_completed" boolean DEFAULT false NOT NULL,
	"last_step_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "onboarding_tour_progress_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"payment_id" text PRIMARY KEY NOT NULL,
	"status" text NOT NULL,
	"total_amount" real NOT NULL,
	"currency" text NOT NULL,
	"payment_method" text,
	"payment_method_type" text,
	"user_id" text,
	"customer_id" text NOT NULL,
	"customer_name" text,
	"customer_email" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"subscription_id" text,
	"brand_id" text NOT NULL,
	"digital_product_delivered" boolean,
	"metadata" jsonb,
	"webhook_data" jsonb NOT NULL,
	"billing" jsonb NOT NULL,
	"business_id" text NOT NULL,
	"card_issuing_country" text,
	"card_last_four" text,
	"card_network" text,
	"card_type" text,
	"discount_id" text,
	"disputes" jsonb,
	"error_code" text,
	"error_message" text,
	"payment_link" text,
	"product_cart" jsonb,
	"refunds" jsonb,
	"settlement_amount" real,
	"settlement_currency" text,
	"settlement_tax" real,
	"tax" real,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "program_days" (
	"id" text PRIMARY KEY NOT NULL,
	"program_id" text NOT NULL,
	"day_of_week" integer NOT NULL,
	"title" text NOT NULL,
	"workout_focus" text,
	"meal_focus" text,
	"habit_focus" text,
	"duration_min" integer,
	"exercises" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "progress_metrics" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"metric_type" text NOT NULL,
	"value" real NOT NULL,
	"unit" text NOT NULL,
	"note" text,
	"recorded_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "public_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"display_name" text NOT NULL,
	"bio" text,
	"avatar_url" text,
	"slug" text NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"show_streaks" boolean DEFAULT true NOT NULL,
	"show_badges" boolean DEFAULT true NOT NULL,
	"show_stats" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "public_profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "public_profiles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"user_agent" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" text PRIMARY KEY NOT NULL,
	"referrer_user_id" text NOT NULL,
	"referred_email" text NOT NULL,
	"referred_user_id" text,
	"code" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"reward_granted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "referrals_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "streaks" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"category" text NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"last_active_date" date,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"subscription_id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"recurring_pre_tax_amount" real NOT NULL,
	"tax_inclusive" boolean NOT NULL,
	"currency" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"product_id" text NOT NULL,
	"quantity" integer NOT NULL,
	"trial_period_days" integer,
	"subscription_period_interval" text,
	"payment_period_interval" text,
	"subscription_period_count" integer,
	"payment_frequency_count" integer,
	"next_billing_date" timestamp with time zone,
	"previous_billing_date" timestamp with time zone,
	"customer_id" text NOT NULL,
	"customer_name" text,
	"customer_email" text NOT NULL,
	"metadata" jsonb,
	"discount_id" text,
	"cancelled_at" timestamp with time zone,
	"cancel_at_next_billing_date" boolean,
	"billing" jsonb NOT NULL,
	"on_demand" boolean,
	"addons" jsonb
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"achievement_id" text NOT NULL,
	"earned_at" timestamp with time zone NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"supabase_user_id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"full_name" text,
	"avatar_url" text,
	"role" text DEFAULT 'member' NOT NULL,
	"dodo_customer_id" text,
	"current_subscription_id" text,
	"current_plan_key" text DEFAULT 'starter' NOT NULL,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"wellness_consent_accepted" boolean DEFAULT false NOT NULL,
	"disclaimer_accepted" boolean DEFAULT false NOT NULL,
	"onboarding_tour_completed" boolean DEFAULT false NOT NULL,
	"last_active_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "weekly_programs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"week_start_date" date NOT NULL,
	"week_end_date" date NOT NULL,
	"focus" text NOT NULL,
	"summary" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"ai_generated" boolean DEFAULT false NOT NULL,
	"ai_summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"program_day_id" text,
	"workout_name" text NOT NULL,
	"duration_min" integer NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"effort_score" integer,
	"recovery_score" integer,
	"calories_burned" integer,
	"notes" text,
	"logged_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_user_id_users_supabase_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("supabase_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_supabase_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("supabase_user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_subject_user_id_users_supabase_user_id_fk" FOREIGN KEY ("subject_user_id") REFERENCES "public"."users"("supabase_user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_user_id_users_supabase_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("supabase_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_created_by_user_id_users_supabase_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("supabase_user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_user_id_users_supabase_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("supabase_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_conversations" ADD CONSTRAINT "coach_conversations_user_id_users_supabase_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("supabase_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_messages" ADD CONSTRAINT "coach_messages_conversation_id_coach_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."coach_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_messages" ADD CONSTRAINT "coach_messages_user_id_users_supabase_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("supabase_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_digest_preferences" ADD CONSTRAINT "email_digest_preferences_user_id_users_supabase_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("supabase_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_user_id_users_supabase_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("supabase_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_users_supabase_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("supabase_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit_logs" ADD CONSTRAINT "habit_logs_user_id_users_supabase_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("supabase_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit_logs" ADD CONSTRAINT "habit_logs_habit_template_id_habit_templates_id_fk" FOREIGN KEY ("habit_template_id") REFERENCES "public"."habit_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit_templates" ADD CONSTRAINT "habit_templates_user_id_users_supabase_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("supabase_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "leaderboard_entries_user_id_users_supabase_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("supabase_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_logs" ADD CONSTRAINT "meal_logs_user_id_users_supabase_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("supabase_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_profiles" ADD CONSTRAINT "member_profiles_user_id_users_supabase_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("supabase_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_supabase_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("supabase_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_tour_progress" ADD CONSTRAINT "onboarding_tour_progress_user_id_users_supabase_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("supabase_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_supabase_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("supabase_user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_days" ADD CONSTRAINT "program_days_program_id_weekly_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."weekly_programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_metrics" ADD CONSTRAINT "progress_metrics_user_id_users_supabase_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("supabase_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_profiles" ADD CONSTRAINT "public_profiles_user_id_users_supabase_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("supabase_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_supabase_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("supabase_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_user_id_users_supabase_user_id_fk" FOREIGN KEY ("referrer_user_id") REFERENCES "public"."users"("supabase_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_user_id_users_supabase_user_id_fk" FOREIGN KEY ("referred_user_id") REFERENCES "public"."users"("supabase_user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streaks" ADD CONSTRAINT "streaks_user_id_users_supabase_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("supabase_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_supabase_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("supabase_user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_supabase_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("supabase_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_programs" ADD CONSTRAINT "weekly_programs_user_id_users_supabase_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("supabase_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_user_id_users_supabase_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("supabase_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_program_day_id_program_days_id_fk" FOREIGN KEY ("program_day_id") REFERENCES "public"."program_days"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "challenge_participants_challenge_user_idx" ON "challenge_participants" USING btree ("challenge_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "habit_logs_user_habit_date_idx" ON "habit_logs" USING btree ("user_id","habit_template_id","logged_for_date");--> statement-breakpoint
CREATE UNIQUE INDEX "leaderboard_user_week_metric_idx" ON "leaderboard_entries" USING btree ("user_id","week_key","metric");--> statement-breakpoint
CREATE UNIQUE INDEX "streaks_user_category_idx" ON "streaks" USING btree ("user_id","category");--> statement-breakpoint
CREATE UNIQUE INDEX "user_achievements_user_achievement_idx" ON "user_achievements" USING btree ("user_id","achievement_id");