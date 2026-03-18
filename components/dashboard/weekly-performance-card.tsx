import {
  Activity,
  BadgeCheck,
  Droplets,
  HeartPulse,
  Sparkles,
  Target,
  TriangleAlert,
} from "lucide-react";
import { WeeklyPerformanceBrief } from "@/lib/healthfit/contracts";
import { cn } from "@/lib/utils";
import { DashboardStatCard } from "./dashboard-stat-card";
import { InfoTooltip } from "./info-tooltip";
import { NumberedInsightCard } from "./numbered-insight-card";

function humanizeValue(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function WeeklyPerformanceCard(props: {
  brief: WeeklyPerformanceBrief;
  className?: string;
}) {
  return (
    <section className={cn("soft-panel px-8 py-10 sm:px-10", props.className)}>
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_18rem] 2xl:items-start">
        <div className="min-w-0">
          <p className="pill">Premium weekly brief</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-semibold">Performance summary</h2>
            <InfoTooltip content={props.brief.summary} label="Weekly performance summary" />
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
            {props.brief.summary}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {humanizeValue(props.brief.momentum)}
            </span>
            <span className="rounded-full border border-border/70 bg-white/75 px-3 py-1 text-xs font-medium text-muted-foreground">
              Recovery: {humanizeValue(props.brief.recoveryStatus)}
            </span>
          </div>
        </div>
        <div className="brand-wash min-w-0 rounded-[1.75rem] px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Consistency score
          </p>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <p className="text-4xl font-semibold tracking-tight">
              {props.brief.consistencyScore}%
            </p>
            <span className="rounded-full border border-primary/15 bg-white/75 px-3 py-1 text-xs font-medium text-primary">
              {humanizeValue(props.brief.momentum)}
            </span>
          </div>
          <div className="mt-4 h-2 rounded-full bg-white/70">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${Math.max(props.brief.consistencyScore, 6)}%` }}
            />
          </div>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Recovery looks {humanizeValue(props.brief.recoveryStatus).toLowerCase()}, so the next step is consistency before intensity.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 2xl:grid-cols-4">
        {[
          {
            label: "Workout completion",
            value: `${props.brief.metrics.workoutCompletionPercent}%`,
            detail: `${props.brief.metrics.workoutCompletionPercent}% of planned workouts were completed this week.`,
            icon: Activity,
          },
          {
            label: "Habit completion",
            value: `${props.brief.metrics.habitCompletionPercent}%`,
            detail: `${props.brief.metrics.habitCompletionPercent}% of scheduled habits were completed this week.`,
            icon: BadgeCheck,
          },
          {
            label: "Hydration coverage",
            value: `${props.brief.metrics.hydrationCompletionPercent}%`,
            detail: `${props.brief.metrics.hydrationCompletionPercent}% of your hydration target was covered on average.`,
            icon: Droplets,
          },
          {
            label: "Recovery state",
            value: humanizeValue(props.brief.recoveryStatus),
            detail: `Recovery is currently marked as ${humanizeValue(props.brief.recoveryStatus).toLowerCase()}.`,
            icon: HeartPulse,
          },
        ].map((metric) => (
          <DashboardStatCard
            key={metric.label}
            icon={metric.icon}
            label={metric.label}
            value={metric.value}
            detail={metric.detail}
          />
        ))}
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
        <NumberedInsightCard
          icon={Sparkles}
          title="Wins"
          items={props.brief.wins}
          emptyLabel="No wins captured yet."
          detail="High-signal positives from this week."
        />
        <NumberedInsightCard
          icon={TriangleAlert}
          title="Watchouts"
          items={props.brief.watchouts}
          emptyLabel="No watchouts right now."
          detail="Areas that need attention before progress slows down."
        />
        <NumberedInsightCard
          icon={Target}
          title="Next actions"
          items={props.brief.nextActions}
          emptyLabel="No actions queued right now."
          detail="Suggested next moves for the coming week."
        />
      </div>
    </section>
  );
}
