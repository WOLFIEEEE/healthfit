"use client";

import { Dumbbell, Sparkles, ClipboardCheck, UtensilsCrossed } from "lucide-react";

type StreakDisplayProps = {
  streaks: Record<string, { current: number; longest: number }>;
  className?: string;
};

const categoryConfig: Record<string, { label: string; icon: any }> = {
  workout: { label: "Workouts", icon: Dumbbell },
  habit: { label: "Habits", icon: Sparkles },
  checkin: { label: "Check-ins", icon: ClipboardCheck },
  meal: { label: "Nutrition", icon: UtensilsCrossed },
};

export function StreakDisplay({ streaks, className }: StreakDisplayProps) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 ${className ?? ""}`}>
      {Object.entries(categoryConfig).map(([key, config]) => {
        const streak = streaks[key] ?? { current: 0, longest: 0 };
        const Icon = config.icon;
        return (
          <div
            key={key}
            className="surface-card rounded-[1.5rem] p-4 flex flex-col items-center gap-2 text-center"
          >
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
            <div className="text-2xl font-semibold tabular-nums">
              {streak.current > 0 ? `${streak.current} ` : "0"}
            </div>
            <p className="text-xs font-medium text-muted-foreground">
              {config.label}
            </p>
            <p className="text-[11px] text-muted-foreground/70">
              Best: {streak.longest}
            </p>
          </div>
        );
      })}
    </div>
  );
}
