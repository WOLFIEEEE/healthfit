import { CalendarClock, Sparkles } from "lucide-react";
import { ProactiveBrief } from "@/lib/healthfit/contracts";
import { DashboardStatCard } from "./dashboard-stat-card";
import { InfoTooltip } from "./info-tooltip";

type AIBriefCardProps = {
  brief: ProactiveBrief | null;
  title?: string;
};

export function AIBriefCard({
  brief,
  title = "AI daily brief",
}: AIBriefCardProps) {
  if (!brief) {
    return null;
  }

  return (
    <section className="soft-panel px-8 py-10 sm:px-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="pill">{title}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold">{brief.title}</h2>
            <InfoTooltip content={brief.summary} label="AI brief summary" />
          </div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/75 px-3 py-1 text-xs font-medium text-muted-foreground">
            <CalendarClock className="size-3.5" />
            Generated {new Date(brief.generatedAt).toLocaleDateString()}
          </div>
        </div>
        <DashboardStatCard
          icon={Sparkles}
          label="Actions ready"
          value={brief.nextActions.length}
          detail={brief.summary}
          tone="brand"
          className="w-full md:w-auto md:min-w-[14rem]"
        />
      </div>
      {brief.nextActions.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {brief.nextActions.map((action, index) => (
            <div
              key={`${brief.generatedAt}-${index}`}
              className="surface-card min-w-0 px-5 py-5"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-sm font-semibold text-primary">
                  {index + 1}
                </span>
                <InfoTooltip content={action} label={`AI action ${index + 1}`} />
              </div>
              <p className="mt-6 text-base font-semibold">Action {index + 1}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{action}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
