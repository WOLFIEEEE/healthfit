import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { createUser } from "@/actions/create-user";
import { resolveAppUrl } from "@/lib/config/app-url";
import { db } from "@/lib/drizzle/client";
import {
  assessments,
  goals,
  habitTemplates,
  memberProfiles,
  progressMetrics,
  users,
  weeklyPrograms,
  programDays,
} from "@/lib/drizzle/schema";
import { onboardingSchema } from "@/lib/healthfit/contracts";
import { createId } from "@/lib/healthfit/ids";
import { buildInitialWeeklyProgram, getDefaultHabitTemplates } from "@/lib/healthfit/server/defaults";
import { queueNotification } from "@/lib/healthfit/server/notifications";
import { sendWelcomeEmail } from "@/lib/email/flows";
import { hasResendEmailEnv } from "@/lib/email/resend";
import { syncAuthMetadata } from "@/lib/healthfit/server/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const payload = onboardingSchema.parse(await request.json());
    const userRes = await createUser();

    if (!userRes.success) {
      return NextResponse.json(
        { success: false, error: userRes.error },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date().toISOString();
    const userId = authUser.id;
    const programTemplate = buildInitialWeeklyProgram(payload);

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          fullName: payload.fullName,
          onboardingCompleted: true,
          wellnessConsentAccepted: true,
          disclaimerAccepted: true,
          updatedAt: now,
        })
        .where(eq(users.supabaseUserId, userId));

      await tx
        .insert(memberProfiles)
        .values({
          userId,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
          age: payload.age,
          experienceLevel: payload.experienceLevel,
          activityLevel: payload.activityLevel,
          goalSummary: payload.goalSummary,
          currentWeightKg: payload.currentWeightKg,
          targetWeightKg: payload.targetWeightKg,
          heightCm: payload.heightCm,
          availableEquipment: payload.availableEquipment,
          dietaryPreferences: payload.dietaryPreferences,
          workoutDays: payload.workoutDays,
          mealsPerDay: payload.mealsPerDay,
          sessionLengthMin: payload.sessionLengthMin,
          hydrationTargetMl: payload.hydrationTargetMl,
          calorieTarget:
            payload.primaryGoalType === "fat_loss"
              ? 2100
              : payload.primaryGoalType === "muscle_gain"
                ? 2600
                : 2300,
          proteinTargetGrams: 150,
          carbsTargetGrams: payload.primaryGoalType === "fat_loss" ? 180 : 240,
          fatTargetGrams: 70,
          injuriesAndLimitations: payload.injuriesAndLimitations,
          onboardingNotes: payload.onboardingNotes,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: memberProfiles.userId,
          set: {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
            age: payload.age,
            experienceLevel: payload.experienceLevel,
            activityLevel: payload.activityLevel,
            goalSummary: payload.goalSummary,
            currentWeightKg: payload.currentWeightKg,
            targetWeightKg: payload.targetWeightKg,
            heightCm: payload.heightCm,
            availableEquipment: payload.availableEquipment,
            dietaryPreferences: payload.dietaryPreferences,
            workoutDays: payload.workoutDays,
            mealsPerDay: payload.mealsPerDay,
            sessionLengthMin: payload.sessionLengthMin,
            hydrationTargetMl: payload.hydrationTargetMl,
            calorieTarget:
              payload.primaryGoalType === "fat_loss"
                ? 2100
                : payload.primaryGoalType === "muscle_gain"
                  ? 2600
                  : 2300,
            proteinTargetGrams: 150,
            carbsTargetGrams:
              payload.primaryGoalType === "fat_loss" ? 180 : 240,
            fatTargetGrams: 70,
            injuriesAndLimitations: payload.injuriesAndLimitations,
            onboardingNotes: payload.onboardingNotes,
            updatedAt: now,
          },
        });

      await tx.insert(goals).values({
        id: createId("goal"),
        userId,
        category: payload.primaryGoalType,
        title:
          payload.primaryGoalType === "fat_loss"
            ? "Reduce body fat while keeping energy stable"
            : payload.primaryGoalType === "muscle_gain"
              ? "Build strength and lean muscle"
              : payload.primaryGoalType === "energy"
                ? "Increase daily energy and recovery"
                : payload.goalSummary,
        description: payload.goalSummary,
        targetValue: payload.targetWeightKg,
        currentValue: payload.currentWeightKg,
        unit: payload.targetWeightKg ? "kg" : "score",
        status: "active",
        priority: 1,
        createdAt: now,
        updatedAt: now,
      });

      await tx.insert(assessments).values({
        id: createId("assessment"),
        userId,
        type: "onboarding",
        readinessScore:
          payload.activityLevel === "high"
            ? 8
            : payload.activityLevel === "moderate"
              ? 7
              : 6,
        energyScore: payload.activityLevel === "high" ? 8 : 6,
        stressScore: 4,
        mobilityScore:
          payload.experienceLevel === "advanced"
            ? 8
            : payload.experienceLevel === "intermediate"
              ? 7
              : 6,
        notes: payload.onboardingNotes,
        metadata: {
          goalType: payload.primaryGoalType,
          dietaryPreferences: payload.dietaryPreferences,
        },
        recordedAt: now,
        createdAt: now,
        updatedAt: now,
      });

      const existingHabits = await tx.query.habitTemplates.findMany({
        where: eq(habitTemplates.userId, userId),
        limit: 1,
      });

      if (existingHabits.length === 0) {
        await tx.insert(habitTemplates).values(
          getDefaultHabitTemplates(userId, now).map((habit) => ({
            ...habit,
            targetValue:
              habit.slug === "hydrate" ? payload.hydrationTargetMl : habit.targetValue,
          }))
        );
      }

      const programId = createId("program");
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
        weekStartDate: programTemplate.weekStartDate,
        weekEndDate: programTemplate.weekEndDate,
        focus: programTemplate.focus,
        summary: programTemplate.summary,
        status: "active",
        aiGenerated: false,
        aiSummary: {
          source: "heuristic_onboarding_generator",
        },
        createdAt: now,
        updatedAt: now,
      });

      await tx.insert(programDays).values(
        programTemplate.days.map((day) => ({
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

      if (payload.currentWeightKg) {
        await tx.insert(progressMetrics).values({
          id: createId("metric"),
          userId,
          metricType: "weight",
          value: payload.currentWeightKg,
          unit: "kg",
          note: "Baseline from onboarding",
          recordedAt: now,
          createdAt: now,
          updatedAt: now,
        });
      }

      await queueNotification({
        userId,
        type: "welcome",
        title: "Welcome to Healthfit.ai",
        body: "Your onboarding is complete. Your first weekly plan is ready.",
        metadata: {
          weekStartDate: programTemplate.weekStartDate,
        },
      });
    });

    await syncAuthMetadata({
      userId,
      existingMetadata: authUser.user_metadata ?? {},
      role: authUser.app_metadata?.role ?? "member",
      onboardingCompleted: true,
    });

    if (hasResendEmailEnv() && authUser.email) {
      try {
        await sendWelcomeEmail({
          email: authUser.email,
          fullName: payload.fullName,
          dashboardUrl: `${resolveAppUrl()}/dashboard/overview`,
          weeklyFocus: programTemplate.focus,
        });
      } catch (emailError) {
        console.error("Failed to send onboarding welcome email", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      redirectTo: "/dashboard/overview",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to complete onboarding",
      },
      { status: 400 }
    );
  }
}
