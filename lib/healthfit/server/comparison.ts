import { and, eq, gte, lte, count, avg } from "drizzle-orm";
import { db } from "@/lib/drizzle/client";
import {
  workoutLogs,
  mealLogs,
  habitLogs,
  habitTemplates,
  checkIns,
} from "@/lib/drizzle/schema";

export type PeriodStats = {
  workoutsCompleted: number;
  avgCalories: number;
  habitCompletionRate: number;
  consistencyScore: number;
};

export type ComparisonSnapshot = {
  current: PeriodStats;
  previous: PeriodStats;
  deltas: {
    workoutsDelta: number;
    caloriesDelta: number;
    habitRateDelta: number;
    consistencyDelta: number;
  };
};

async function getPeriodStats(
  userId: string,
  start: string,
  end: string
): Promise<PeriodStats> {
  const [workouts] = await db
    .select({ total: count() })
    .from(workoutLogs)
    .where(
      and(
        eq(workoutLogs.userId, userId),
        gte(workoutLogs.loggedAt, start),
        lte(workoutLogs.loggedAt, end)
      )
    );

  const [meals] = await db
    .select({ avgCal: avg(mealLogs.calories) })
    .from(mealLogs)
    .where(
      and(
        eq(mealLogs.userId, userId),
        gte(mealLogs.loggedAt, start),
        lte(mealLogs.loggedAt, end)
      )
    );

  const templates = await db.query.habitTemplates.findMany({
    where: eq(habitTemplates.userId, userId),
  });

  const [habitsDone] = await db
    .select({ total: count() })
    .from(habitLogs)
    .where(
      and(
        eq(habitLogs.userId, userId),
        eq(habitLogs.status, "done"),
        gte(habitLogs.createdAt, start),
        lte(habitLogs.createdAt, end)
      )
    );

  const days = Math.max(
    1,
    Math.ceil(
      (new Date(end).getTime() - new Date(start).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const habitTarget = templates.length * days;
  const habitRate = habitTarget > 0 ? Math.round((habitsDone.total / habitTarget) * 100) : 0;

  const [checkinAvg] = await db
    .select({ avgAdh: avg(checkIns.adherenceScore) })
    .from(checkIns)
    .where(
      and(
        eq(checkIns.userId, userId),
        gte(checkIns.createdAt, start),
        lte(checkIns.createdAt, end)
      )
    );

  return {
    workoutsCompleted: workouts.total ?? 0,
    avgCalories: Math.round(Number(meals.avgCal ?? 0)),
    habitCompletionRate: habitRate,
    consistencyScore: Math.round(Number(checkinAvg.avgAdh ?? 0) * 10),
  };
}

export async function getComparisonData(
  userId: string,
  currentStart: string,
  currentEnd: string,
  previousStart: string,
  previousEnd: string
): Promise<ComparisonSnapshot> {
  const [current, previous] = await Promise.all([
    getPeriodStats(userId, currentStart, currentEnd),
    getPeriodStats(userId, previousStart, previousEnd),
  ]);

  return {
    current,
    previous,
    deltas: {
      workoutsDelta: current.workoutsCompleted - previous.workoutsCompleted,
      caloriesDelta: current.avgCalories - previous.avgCalories,
      habitRateDelta: current.habitCompletionRate - previous.habitCompletionRate,
      consistencyDelta: current.consistencyScore - previous.consistencyScore,
    },
  };
}
