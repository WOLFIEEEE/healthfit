import { WeeklyPerformanceBrief } from "@/lib/healthfit/contracts";
import { cn } from "@/lib/utils";

export function WeeklyPerformanceCard(props: {
  brief: WeeklyPerformanceBrief;
  className?: string;
}) {
  return (
    <section className={cn("soft-panel px-6 py-6", props.className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="pill">Premium weekly brief</p>
          <h2 className="mt-4 text-3xl font-semibold">Performance summary</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            {props.brief.summary}
          </p>
        </div>
        <div className="brand-wash rounded-[1.5rem] px-5 py-4 text-right">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Consistency
          </p>
          <p className="mt-2 text-4xl font-semibold">{props.brief.consistencyScore}</p>
          <p className="mt-1 text-sm capitalize text-muted-foreground">
            {props.brief.momentum.replace("_", " ")}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {[
          ["Workout completion", `${props.brief.metrics.workoutCompletionPercent}%`],
          ["Habit completion", `${props.brief.metrics.habitCompletionPercent}%`],
          ["Hydration coverage", `${props.brief.metrics.hydrationCompletionPercent}%`],
          ["Recovery state", props.brief.recoveryStatus],
        ].map(([label, value]) => (
          <div key={label} className="surface-card px-4 py-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-xl font-semibold capitalize">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="surface-card px-4 py-4">
          <h3 className="text-lg font-semibold">Wins</h3>
          <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground">
            {props.brief.wins.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>
        <div className="surface-card px-4 py-4">
          <h3 className="text-lg font-semibold">Watchouts</h3>
          <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground">
            {props.brief.watchouts.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>
        <div className="surface-card px-4 py-4">
          <h3 className="text-lg font-semibold">Next actions</h3>
          <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground">
            {props.brief.nextActions.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
