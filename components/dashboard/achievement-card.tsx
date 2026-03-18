"use client";

import { Award } from "lucide-react";

type AchievementCardProps = {
  achievement: {
    slug: string;
    name: string;
    description: string;
    iconEmoji: string;
    tier: string;
    xpValue: number;
  };
  earned: boolean;
  earnedAt?: string | null;
};

const tierBorderColors: Record<string, string> = {
  bronze: "border-amber-600/60",
  silver: "border-gray-400/60",
  gold: "border-yellow-400/60",
  platinum: "border-purple-400/60",
};

const tierBgColors: Record<string, string> = {
  bronze: "bg-amber-50",
  silver: "bg-gray-50",
  gold: "bg-yellow-50",
  platinum: "bg-purple-50",
};

export function AchievementCard({
  achievement,
  earned,
  earnedAt,
}: AchievementCardProps) {
  const borderColor = tierBorderColors[achievement.tier] ?? "border-border/70";
  const bgColor = tierBgColors[achievement.tier] ?? "bg-muted/30";

  return (
    <div
      className={`surface-card rounded-[1.75rem] border-2 p-5 flex flex-col items-center gap-3 text-center transition-all ${borderColor} ${
        earned ? bgColor : "grayscale opacity-50"
      }`}
    >
      <div className="text-4xl">{achievement.iconEmoji}</div>

      <h3 className="text-sm font-semibold leading-tight">{achievement.name}</h3>

      <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
        {achievement.description}
      </p>

      <div className="flex items-center gap-1.5 mt-auto">
        <Award className="size-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          {achievement.xpValue} XP
        </span>
      </div>

      {earned && earnedAt && (
        <p className="text-[11px] text-muted-foreground/70">
          Earned {new Date(earnedAt).toLocaleDateString()}
        </p>
      )}

      {!earned && (
        <span className="pill text-[10px]">Locked</span>
      )}
    </div>
  );
}
