import { eq } from "drizzle-orm";
import { db } from "@/lib/drizzle/client";
import {
  publicProfiles,
  streaks,
  userAchievements,
  achievements,
  type SelectPublicProfile,
} from "@/lib/drizzle/schema";
import { createId } from "@/lib/healthfit/ids";

type PublicProfileWithExtras = SelectPublicProfile & {
  streaks: Array<{
    category: string;
    currentStreak: number;
    longestStreak: number;
  }>;
  badges: Array<{
    slug: string;
    name: string;
    iconEmoji: string;
    tier: string;
    earnedAt: string;
  }>;
};

export async function getPublicProfile(
  slug: string
): Promise<PublicProfileWithExtras | null> {
  const profile = await db.query.publicProfiles.findFirst({
    where: eq(publicProfiles.slug, slug),
  });

  if (!profile || !profile.isPublic) {
    return null;
  }

  const userStreaks = profile.showStreaks
    ? await db.query.streaks.findMany({
        where: eq(streaks.userId, profile.userId),
      })
    : [];

  const userBadges = profile.showBadges
    ? await db.query.userAchievements.findMany({
        where: eq(userAchievements.userId, profile.userId),
        with: { achievement: true },
        orderBy: (ua, { desc }) => [desc(ua.earnedAt)],
      })
    : [];

  return {
    ...profile,
    streaks: userStreaks.map((s) => ({
      category: s.category,
      currentStreak: s.currentStreak,
      longestStreak: s.longestStreak,
    })),
    badges: userBadges.map((ua) => ({
      slug: ua.achievement.slug,
      name: ua.achievement.name,
      iconEmoji: ua.achievement.iconEmoji,
      tier: ua.achievement.tier,
      earnedAt: ua.earnedAt,
    })),
  };
}

export async function upsertPublicProfile(
  userId: string,
  data: {
    displayName: string;
    bio?: string;
    avatarUrl?: string;
    slug: string;
    isPublic?: boolean;
    showStreaks?: boolean;
    showBadges?: boolean;
    showStats?: boolean;
  }
): Promise<SelectPublicProfile> {
  const now = new Date().toISOString();

  const existing = await db.query.publicProfiles.findFirst({
    where: eq(publicProfiles.userId, userId),
  });

  if (existing) {
    const [updated] = await db
      .update(publicProfiles)
      .set({
        displayName: data.displayName,
        bio: data.bio ?? existing.bio,
        avatarUrl: data.avatarUrl ?? existing.avatarUrl,
        slug: data.slug,
        isPublic: data.isPublic ?? existing.isPublic,
        showStreaks: data.showStreaks ?? existing.showStreaks,
        showBadges: data.showBadges ?? existing.showBadges,
        showStats: data.showStats ?? existing.showStats,
        updatedAt: now,
      })
      .where(eq(publicProfiles.userId, userId))
      .returning();

    return updated;
  }

  const [created] = await db
    .insert(publicProfiles)
    .values({
      id: createId("pubprof"),
      userId,
      displayName: data.displayName,
      bio: data.bio ?? null,
      avatarUrl: data.avatarUrl ?? null,
      slug: data.slug,
      isPublic: data.isPublic ?? false,
      showStreaks: data.showStreaks ?? true,
      showBadges: data.showBadges ?? true,
      showStats: data.showStats ?? false,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return created;
}
