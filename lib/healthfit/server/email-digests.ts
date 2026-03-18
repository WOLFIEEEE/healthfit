import { eq, and, lte, or } from "drizzle-orm";
import { db } from "@/lib/drizzle/client";
import {
  emailDigestPreferences,
  users,
  type SelectEmailDigestPreference,
} from "@/lib/drizzle/schema";
import { subDays, subWeeks } from "date-fns";

export async function getDigestPreferences(
  userId: string
): Promise<SelectEmailDigestPreference | null> {
  return (
    (await db.query.emailDigestPreferences.findFirst({
      where: eq(emailDigestPreferences.userId, userId),
    })) ?? null
  );
}

export async function updateDigestPreferences(
  userId: string,
  prefs: {
    frequency?: string;
    includeCoachSummary?: boolean;
    includeWeeklyStats?: boolean;
    includeAchievements?: boolean;
  }
): Promise<void> {
  const now = new Date().toISOString();
  const existing = await getDigestPreferences(userId);

  if (existing) {
    await db
      .update(emailDigestPreferences)
      .set({ ...prefs, updatedAt: now })
      .where(eq(emailDigestPreferences.userId, userId));
  } else {
    const { createId } = await import("@/lib/healthfit/ids");
    await db.insert(emailDigestPreferences).values({
      id: createId("digest"),
      userId,
      frequency: prefs.frequency ?? "weekly",
      includeCoachSummary: prefs.includeCoachSummary ?? true,
      includeWeeklyStats: prefs.includeWeeklyStats ?? true,
      includeAchievements: prefs.includeAchievements ?? true,
      createdAt: now,
      updatedAt: now,
    });
  }
}

export async function getUsersNeedingDigest(
  frequency: "daily" | "weekly"
): Promise<Array<{ userId: string; email: string; fullName: string | null }>> {
  const cutoff =
    frequency === "daily"
      ? subDays(new Date(), 1).toISOString()
      : subWeeks(new Date(), 1).toISOString();

  const prefs = await db.query.emailDigestPreferences.findMany({
    where: and(
      eq(emailDigestPreferences.frequency, frequency),
      or(
        lte(emailDigestPreferences.lastSentAt, cutoff),
        eq(emailDigestPreferences.lastSentAt, null as any)
      )
    ),
  });

  if (prefs.length === 0) return [];

  const userIds = prefs.map((p) => p.userId);
  const userRows = await Promise.all(
    userIds.map((id) =>
      db.query.users.findFirst({
        where: eq(users.supabaseUserId, id),
        columns: { supabaseUserId: true, email: true, fullName: true },
      })
    )
  );

  return userRows
    .filter((u): u is NonNullable<typeof u> => u !== undefined)
    .map((u) => ({
      userId: u.supabaseUserId,
      email: u.email,
      fullName: u.fullName,
    }));
}

export async function markDigestSent(userId: string): Promise<void> {
  await db
    .update(emailDigestPreferences)
    .set({
      lastSentAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(emailDigestPreferences.userId, userId));
}
