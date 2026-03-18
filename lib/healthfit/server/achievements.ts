import { eq, and, count, notInArray } from "drizzle-orm";
import { db } from "@/lib/drizzle/client";
import {
  achievements,
  userAchievements,
  streaks,
  workoutLogs,
  checkIns,
  coachMessages,
  memberProfiles,
  referrals,
  type SelectAchievement,
} from "@/lib/drizzle/schema";
import { createId } from "@/lib/healthfit/ids";
import { queueNotification } from "@/lib/healthfit/server/notifications";

type AchievementCriteria = {
  type: "streak_days" | "count" | "event";
  table?: string;
  category?: string;
  value?: number;
  event?: string;
  status?: string;
};

type AwardedAchievement = {
  slug: string;
  name: string;
  iconEmoji: string;
};

export async function checkAndAwardAchievements(
  userId: string,
  eventName?: string
): Promise<AwardedAchievement[]> {
  const allAchievements = await db.query.achievements.findMany();

  const earnedRows = await db.query.userAchievements.findMany({
    where: eq(userAchievements.userId, userId),
    columns: { achievementId: true },
  });
  const earnedIds = new Set(earnedRows.map((r) => r.achievementId));

  const unearned = allAchievements.filter((a) => !earnedIds.has(a.id));
  if (unearned.length === 0) return [];

  const awarded: AwardedAchievement[] = [];

  for (const achievement of unearned) {
    const criteria = achievement.criteria as AchievementCriteria;
    const met = await evaluateCriteria(userId, criteria, eventName);

    if (met) {
      const now = new Date().toISOString();

      await db.insert(userAchievements).values({
        id: createId("uachieve"),
        userId,
        achievementId: achievement.id,
        earnedAt: now,
        createdAt: now,
        updatedAt: now,
      });

      await db
        .update(memberProfiles)
        .set({
          xpTotal: (
            await db.query.memberProfiles.findFirst({
              where: eq(memberProfiles.userId, userId),
              columns: { xpTotal: true },
            })
          )
            ? undefined
            : 0,
        })
        .where(eq(memberProfiles.userId, userId));

      // Increment XP using raw SQL-like approach
      const profile = await db.query.memberProfiles.findFirst({
        where: eq(memberProfiles.userId, userId),
        columns: { xpTotal: true },
      });

      if (profile) {
        await db
          .update(memberProfiles)
          .set({
            xpTotal: (profile.xpTotal ?? 0) + achievement.xpValue,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(memberProfiles.userId, userId));
      }

      await queueNotification({
        userId,
        type: "achievement_earned",
        title: `${achievement.iconEmoji} Badge earned!`,
        body: `You unlocked "${achievement.name}" — ${achievement.description}`,
        metadata: {
          achievementSlug: achievement.slug,
          tier: achievement.tier,
          xpValue: achievement.xpValue,
        },
      });

      awarded.push({
        slug: achievement.slug,
        name: achievement.name,
        iconEmoji: achievement.iconEmoji,
      });
    }
  }

  return awarded;
}

async function evaluateCriteria(
  userId: string,
  criteria: AchievementCriteria,
  eventName?: string
): Promise<boolean> {
  switch (criteria.type) {
    case "streak_days": {
      if (!criteria.category || !criteria.value) return false;
      const streak = await db.query.streaks.findFirst({
        where: and(
          eq(streaks.userId, userId),
          eq(streaks.category, criteria.category)
        ),
      });
      return (streak?.currentStreak ?? 0) >= criteria.value;
    }

    case "count": {
      if (!criteria.table || !criteria.value) return false;
      const total = await getTableCount(userId, criteria.table, criteria.status);
      return total >= criteria.value;
    }

    case "event": {
      if (!criteria.event) return false;
      return eventName === criteria.event;
    }

    default:
      return false;
  }
}

async function getTableCount(
  userId: string,
  table: string,
  status?: string
): Promise<number> {
  const tableMap: Record<string, { table: any; userIdCol: any }> = {
    workoutLogs: { table: workoutLogs, userIdCol: workoutLogs.userId },
    checkIns: { table: checkIns, userIdCol: checkIns.userId },
    coachMessages: { table: coachMessages, userIdCol: coachMessages.userId },
    referrals: { table: referrals, userIdCol: referrals.referrerUserId },
  };

  const entry = tableMap[table];
  if (!entry) return 0;

  const conditions = [eq(entry.userIdCol, userId)];

  if (table === "referrals" && status) {
    conditions.push(eq(referrals.status, status));
  }

  const [result] = await db
    .select({ total: count() })
    .from(entry.table)
    .where(and(...conditions));

  return result?.total ?? 0;
}

export async function getUserAchievements(userId: string) {
  return db.query.userAchievements.findMany({
    where: eq(userAchievements.userId, userId),
    with: { achievement: true },
    orderBy: (ua, { desc }) => [desc(ua.earnedAt)],
  });
}

export async function getAllAchievements(): Promise<SelectAchievement[]> {
  return db.query.achievements.findMany({
    orderBy: (a, { asc }) => [asc(a.tier), asc(a.name)],
  });
}
