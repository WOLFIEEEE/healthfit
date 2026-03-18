type GoalProgressCardProps = {
  goals: Array<{
    id: string;
    title: string;
    category: string;
    currentValue: number | null;
    targetValue: number | null;
    unit: string | null;
    status: string;
  }>;
  className?: string;
};

export function GoalProgressCard({ goals, className }: GoalProgressCardProps) {
  if (goals.length === 0) {
    return (
      <div className={`soft-panel rounded-[1.75rem] p-6 ${className ?? ""}`}>
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Goal progress
        </h3>
        <p className="mt-3 text-sm text-muted-foreground">
          No active goals yet. Set goals in your profile to track progress here.
        </p>
      </div>
    );
  }

  return (
    <div className={`soft-panel rounded-[1.75rem] p-6 ${className ?? ""}`}>
      <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-5">
        Goal progress
      </h3>
      <div className="space-y-5">
        {goals.map((goal) => {
          const current = goal.currentValue ?? 0;
          const target = goal.targetValue ?? 1;
          const pct = Math.min(Math.round((current / target) * 100), 100);
          const barColor =
            pct >= 70
              ? "bg-primary"
              : pct >= 40
                ? "bg-amber-500"
                : "bg-red-400";

          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium truncate">{goal.title}</span>
                <span className="pill text-[10px]">{goal.category}</span>
              </div>
              <div className="h-2 rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full transition-all ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground tabular-nums">
                {current} / {target} {goal.unit ?? ""}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
