import Link from "next/link";
import { LifeBuoy, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { MembershipIntelligence } from "@/lib/healthfit/contracts";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "./info-tooltip";
import { NumberedInsightCard } from "./numbered-insight-card";
import { UsageMeterCard } from "./usage-meter-card";

function humanizeValue(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function MembershipIntelligenceCard(props: {
  membership: MembershipIntelligence;
  className?: string;
}) {
  const internalAccess = Boolean(props.membership.aiUsage.unlimited);

  return (
    <section className={cn("soft-panel px-8 py-10 sm:px-10", props.className)}>
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_18rem] 2xl:items-start">
        <div className="min-w-0">
          <p className="pill">Membership intelligence</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-semibold">{props.membership.planName}</h2>
            <InfoTooltip content={props.membership.valueHeadline} label="Membership overview" />
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
            {props.membership.valueHeadline}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {props.membership.unlockedFeatures.length} unlocked
            </span>
            <span className="rounded-full border border-border/70 bg-white/75 px-3 py-1 text-xs font-medium text-muted-foreground">
              {props.membership.lockedFeatures.length === 0
                ? "Nothing hidden"
                : `${props.membership.lockedFeatures.length} upgrade-only`}
            </span>
          </div>
        </div>
        <div className="brand-wash min-w-0 rounded-[1.75rem] px-6 py-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Support lane
              </p>
              <p className="mt-4 text-3xl font-semibold tracking-tight">
                {humanizeValue(props.membership.supportLane)}
              </p>
            </div>
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-primary shadow-[0_18px_42px_-28px_rgba(46,114,78,0.4)]">
              <LifeBuoy className="size-5" />
            </span>
          </div>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            {internalAccess
              ? "Internal admin accounts bypass billing gates, feature locks, and daily usage caps."
              : props.membership.upgradePrompt ??
                "Your current plan has healthy room for the next step."}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        <UsageMeterCard meter={props.membership.aiUsage} />
        <UsageMeterCard meter={props.membership.goalUsage} />
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        <NumberedInsightCard
          icon={ShieldCheck}
          title="Unlocked now"
          items={props.membership.unlockedFeatures}
          emptyLabel="No unlocked features are available yet."
          detail={props.membership.unlockedFeatures.join(" • ")}
        />
        <NumberedInsightCard
          icon={LockKeyhole}
          title="Locked or upgrade-only"
          items={props.membership.lockedFeatures}
          emptyLabel="Everything in the current catalog is visible on this plan."
          detail={
            props.membership.lockedFeatures.length === 0
              ? "Everything in the current catalog is already visible on this plan."
              : props.membership.lockedFeatures.join(" • ")
          }
        />
      </div>

      <div className="mt-8 flex flex-col items-start gap-4 rounded-[1.5rem] border border-border/70 bg-white/70 px-5 py-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <Sparkles className="size-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Plan actions</p>
            <p className="mt-1 text-xs uppercase tracking-[0.24em] text-muted-foreground">
              {internalAccess ? "All tools open" : "Billing and upgrades"}
            </p>
          </div>
        </div>
        <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-start">
          <InfoTooltip
            content={
              internalAccess
                ? "Open the admin workspace to manage unrestricted access."
                : props.membership.upgradePrompt ??
                  "Review plan details and billing options when you want more access."
            }
            label="Plan action details"
          />
          <Link
            href={internalAccess ? "/admin" : "/dashboard/billing"}
            className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            {internalAccess ? "Open admin" : "Review plan"}
          </Link>
        </div>
      </div>
    </section>
  );
}
