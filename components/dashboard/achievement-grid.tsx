"use client";

import { AchievementCard } from "@/components/dashboard/achievement-card";

type Achievement = {
  id: string;
  slug: string;
  name: string;
  description: string;
  iconEmoji: string;
  tier: string;
  xpValue: number;
};

type EarnedAchievement = {
  achievementId: string;
  earnedAt: string;
};

type AchievementGridProps = {
  earned: EarnedAchievement[];
  available: Achievement[];
};

export function AchievementGrid({ earned, available }: AchievementGridProps) {
  const earnedMap = new Map(
    earned.map((e) => [e.achievementId, e.earnedAt])
  );

  const sorted = [...available].sort((a, b) => {
    const aEarned = earnedMap.has(a.id);
    const bEarned = earnedMap.has(b.id);
    if (aEarned !== bEarned) return aEarned ? -1 : 1;

    const tierOrder: Record<string, number> = {
      platinum: 0,
      gold: 1,
      silver: 2,
      bronze: 3,
    };
    return (tierOrder[a.tier] ?? 4) - (tierOrder[b.tier] ?? 4);
  });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {sorted.map((achievement) => {
        const isEarned = earnedMap.has(achievement.id);
        const earnedAt = earnedMap.get(achievement.id) ?? null;

        return (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            earned={isEarned}
            earnedAt={earnedAt}
          />
        );
      })}

      {available.length === 0 && (
        <p className="col-span-full text-center text-sm text-muted-foreground py-12">
          No achievements available yet. Keep going!
        </p>
      )}
    </div>
  );
}
