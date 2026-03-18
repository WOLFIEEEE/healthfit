import { format, subDays } from "date-fns";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/drizzle/client";
import { streaks } from "@/lib/drizzle/schema";
import { createId } from "@/lib/healthfit/ids";

export type StreakCategory = "workout" | "habit" | "checkin" | "meal";

export type StreakSnapshot = Record<
  string,
  { current: number; longest: number }
>;

export async function updateStreaks(
  userId: string,
  category: StreakCategory
): Promise<{ currentStreak: number; longestStreak: number }> {
  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
  const now = new Date().toISOString();

  const existing = await db.query.streaks.findFirst({
    where: and(eq(streaks.userId, userId), eq(streaks.category, category)),
  });

  if (existing) {
    if (existing.lastActiveDate === today) {
      return {
        currentStreak: existing.currentStreak,
        longestStreak: existing.longestStreak,
      };
    }

    const newCurrent =
      existing.lastActiveDate === yesterday
        ? existing.currentStreak + 1
        : 1;

    const newLongest = Math.max(newCurrent, existing.longestStreak);

    await db
      .update(streaks)
      .set({
        currentStreak: newCurrent,
        longestStreak: newLongest,
        lastActiveDate: today,
        updatedAt: now,
      })
      .where(eq(streaks.id, existing.id));

    return { currentStreak: newCurrent, longestStreak: newLongest };
  }

  await db.insert(streaks).values({
    id: createId("streak"),
    userId,
    category,
    currentStreak: 1,
    longestStreak: 1,
    lastActiveDate: today,
    createdAt: now,
    updatedAt: now,
  });

  return { currentStreak: 1, longestStreak: 1 };
}

export async function getStreakSnapshot(
  userId: string
): Promise<StreakSnapshot> {
  const rows = await db.query.streaks.findMany({
    where: eq(streaks.userId, userId),
  });

  const snapshot: StreakSnapshot = {};
  for (const row of rows) {
    snapshot[row.category] = {
      current: row.currentStreak,
      longest: row.longestStreak,
    };
  }

  const categories: StreakCategory[] = ["workout", "habit", "checkin", "meal"];
  for (const cat of categories) {
    if (!snapshot[cat]) {
      snapshot[cat] = { current: 0, longest: 0 };
    }
  }

  return snapshot;
}
