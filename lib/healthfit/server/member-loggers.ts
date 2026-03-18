import { format } from "date-fns";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/drizzle/client";
import {
  checkIns,
  habitLogs,
  habitTemplates,
  mealLogs,
  memberProfiles,
  progressMetrics,
  workoutLogs,
} from "@/lib/drizzle/schema";
import { createId } from "@/lib/healthfit/ids";
import { buildCheckInSummary } from "@/lib/healthfit/server/defaults";
import { queueNotification } from "@/lib/healthfit/server/notifications";

export async function logWorkoutEntry(props: {
  userId: string;
  workoutName: string;
  durationMin: number;
  effortScore?: number;
  recoveryScore?: number;
  caloriesBurned?: number;
  notes?: string;
  programDayId?: string;
  completed?: boolean;
}) {
  const now = new Date().toISOString();

  await db.insert(workoutLogs).values({
    id: createId("workout"),
    userId: props.userId,
    programDayId: props.programDayId,
    workoutName: props.workoutName,
    durationMin: props.durationMin,
    completed: props.completed ?? true,
    effortScore: props.effortScore,
    recoveryScore: props.recoveryScore,
    caloriesBurned: props.caloriesBurned,
    notes: props.notes,
    loggedAt: now,
    createdAt: now,
    updatedAt: now,
  });
}

export async function logMealEntry(props: {
  userId: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  title: string;
  calories: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
  waterMl?: number;
  notes?: string;
}) {
  const now = new Date().toISOString();

  await db.insert(mealLogs).values({
    id: createId("meal"),
    userId: props.userId,
    mealType: props.mealType,
    title: props.title,
    calories: props.calories,
    proteinGrams: props.proteinGrams ?? 0,
    carbsGrams: props.carbsGrams ?? 0,
    fatGrams: props.fatGrams ?? 0,
    waterMl: props.waterMl ?? 0,
    notes: props.notes,
    loggedAt: now,
    createdAt: now,
    updatedAt: now,
  });
}

export async function upsertHabitLog(props: {
  userId: string;
  habitTemplateId?: string;
  habitSlug?: string;
  status: "done" | "skipped";
  value?: number;
  note?: string;
}) {
  const habitTemplate =
    props.habitTemplateId
      ? await db.query.habitTemplates.findFirst({
          where: and(
            eq(habitTemplates.id, props.habitTemplateId),
            eq(habitTemplates.userId, props.userId)
          ),
        })
      : props.habitSlug
        ? await db.query.habitTemplates.findFirst({
            where: and(
              eq(habitTemplates.slug, props.habitSlug),
              eq(habitTemplates.userId, props.userId)
            ),
          })
        : null;

  if (!habitTemplate) {
    throw new Error("Habit template not found");
  }

  const now = new Date().toISOString();
  const loggedForDate = format(new Date(), "yyyy-MM-dd");

  await db
    .insert(habitLogs)
    .values({
      id: createId("habitlog"),
      userId: props.userId,
      habitTemplateId: habitTemplate.id,
      loggedForDate,
      status: props.status,
      value: props.value,
      note: props.note,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [habitLogs.userId, habitLogs.habitTemplateId, habitLogs.loggedForDate],
      set: {
        status: props.status,
        value: props.value,
        note: props.note,
        updatedAt: now,
      },
    });

  return habitTemplate;
}

export async function logCheckInEntry(props: {
  userId: string;
  periodType?: "daily" | "weekly";
  moodScore: number;
  energyScore: number;
  stressScore: number;
  adherenceScore: number;
  sleepHours: number;
  wins?: string;
  blockers?: string;
  notes?: string;
}) {
  const now = new Date().toISOString();
  const summary = buildCheckInSummary({
    moodScore: props.moodScore,
    energyScore: props.energyScore,
    stressScore: props.stressScore,
    adherenceScore: props.adherenceScore,
  });

  await db.insert(checkIns).values({
    id: createId("checkin"),
    userId: props.userId,
    periodType: props.periodType ?? "daily",
    moodScore: props.moodScore,
    energyScore: props.energyScore,
    stressScore: props.stressScore,
    adherenceScore: props.adherenceScore,
    sleepHours: props.sleepHours,
    wins: props.wins,
    blockers: props.blockers,
    notes: props.notes,
    aiSummary: summary,
    createdAt: now,
    updatedAt: now,
  });

  await db
    .update(memberProfiles)
    .set({
      lastCheckInAt: now,
      updatedAt: now,
    })
    .where(eq(memberProfiles.userId, props.userId));

  await db.insert(progressMetrics).values({
    id: createId("metric"),
    userId: props.userId,
    metricType: "adherence",
    value: props.adherenceScore,
    unit: "score",
    note: "Generated from check-in",
    recordedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  await queueNotification({
    userId: props.userId,
    type: "checkin_saved",
    title: "Check-in saved",
    body: "Your latest wellness check-in has been captured.",
  });

  return summary;
}
