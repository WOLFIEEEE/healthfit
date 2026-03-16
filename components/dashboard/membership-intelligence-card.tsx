import Link from "next/link";
import { MembershipIntelligence } from "@/lib/healthfit/contracts";
import { cn } from "@/lib/utils";
import { UsageMeterCard } from "./usage-meter-card";

export function MembershipIntelligenceCard(props: {
  membership: MembershipIntelligence;
  className?: string;
}) {
  return (
    <section className={cn("soft-panel px-6 py-6", props.className)}>
      <p className="pill">Membership intelligence</p>
      <h2 className="mt-4 text-3xl font-semibold">{props.membership.planName}</h2>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        {props.membership.valueHeadline}
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <UsageMeterCard meter={props.membership.aiUsage} />
        <UsageMeterCard meter={props.membership.goalUsage} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="surface-card px-4 py-4">
          <p className="text-sm font-medium text-foreground">Unlocked now</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {props.membership.unlockedFeatures.map((item) => (
              <span
                key={item}
                className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="surface-card px-4 py-4">
          <p className="text-sm font-medium text-foreground">Locked or upgrade-only</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {props.membership.lockedFeatures.length === 0 ? (
              <span className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Everything in current catalog unlocked
              </span>
            ) : (
              props.membership.lockedFeatures.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-border bg-white/70 px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {item}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-border/70 bg-white/70 px-4 py-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            Support lane: {props.membership.supportLane}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {props.membership.upgradePrompt ?? "Your current plan has healthy room for the next step."}
          </p>
        </div>
        <Link
          href="/dashboard/billing"
          className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Review plan
        </Link>
      </div>
    </section>
  );
}
