import { ProactiveBrief } from "@/lib/healthfit/contracts";

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
    <section className="soft-panel px-6 py-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="pill">{title}</p>
          <h2 className="mt-4 text-2xl font-semibold">{brief.title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            {brief.summary}
          </p>
        </div>
        <div className="rounded-full border border-border/70 bg-white/75 px-3 py-1 text-xs font-medium text-muted-foreground">
          Generated {new Date(brief.generatedAt).toLocaleDateString()}
        </div>
      </div>
      {brief.nextActions.length > 0 ? (
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {brief.nextActions.map((action) => (
            <div
              key={action}
              className="rounded-[1.5rem] bg-white/75 px-4 py-4 text-sm text-muted-foreground"
            >
              {action}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
