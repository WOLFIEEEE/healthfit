"use client";

import { useState, useTransition, useEffect } from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

type PeriodStats = {
  workoutsCompleted: number;
  avgCalories: number;
  habitCompletionRate: number;
  consistencyScore: number;
};

type ComparisonData = {
  current: PeriodStats;
  previous: PeriodStats;
  deltas: {
    workoutsDelta: number;
    caloriesDelta: number;
    habitRateDelta: number;
    consistencyDelta: number;
  };
};

type ComparisonCardProps = {
  className?: string;
};

const metrics = [
  { key: "workoutsCompleted", deltaKey: "workoutsDelta", label: "Workouts", unit: "" },
  { key: "avgCalories", deltaKey: "caloriesDelta", label: "Avg calories", unit: "kcal" },
  { key: "habitCompletionRate", deltaKey: "habitRateDelta", label: "Habit rate", unit: "%" },
  { key: "consistencyScore", deltaKey: "consistencyDelta", label: "Consistency", unit: "%" },
] as const;

export function ComparisonCard({ className }: ComparisonCardProps) {
  const [data, setData] = useState<ComparisonData | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const startOfPrevWeek = new Date(startOfWeek);
        startOfPrevWeek.setDate(startOfPrevWeek.getDate() - 7);

        const params = new URLSearchParams({
          currentStart: startOfWeek.toISOString(),
          currentEnd: now.toISOString(),
          previousStart: startOfPrevWeek.toISOString(),
          previousEnd: startOfWeek.toISOString(),
        });

        const res = await fetch(`/api/dashboard/comparison?${params}`);
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch {
        // Silently fail — comparison is supplementary
      }
    });
  }, []);

  if (!data && !isPending) return null;

  return (
    <div className={`surface-card rounded-[1.5rem] p-5 ${className ?? ""}`}>
      <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
        This week vs last week
      </h3>
      {isPending && !data ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : data ? (
        <div className="space-y-3">
          {metrics.map(({ key, deltaKey, label, unit }) => {
            const current = data.current[key as keyof PeriodStats];
            const previous = data.previous[key as keyof PeriodStats];
            const delta = data.deltas[deltaKey as keyof ComparisonData["deltas"]];
            const isPositive = delta > 0;
            const isNeutral = delta === 0;

            return (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <div className="flex items-center gap-3">
                  <span className="tabular-nums font-medium">
                    {Math.round(current)}{unit}
                  </span>
                  <span className="text-muted-foreground/60 tabular-nums text-xs">
                    vs {Math.round(previous)}{unit}
                  </span>
                  <span
                    className={`flex items-center gap-0.5 text-xs font-medium ${
                      isNeutral
                        ? "text-muted-foreground"
                        : isPositive
                          ? "text-emerald-600"
                          : "text-red-500"
                    }`}
                  >
                    {isNeutral ? (
                      <Minus className="size-3" />
                    ) : isPositive ? (
                      <ArrowUp className="size-3" />
                    ) : (
                      <ArrowDown className="size-3" />
                    )}
                    {Math.abs(delta)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
