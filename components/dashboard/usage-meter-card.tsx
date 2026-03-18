import { BrainCircuit, LockKeyhole, Target } from "lucide-react";
import { UsageMeter } from "@/lib/healthfit/contracts";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "./info-tooltip";

function meterNoun(label: string) {
  if (label === "AI coach") return "messages";
  if (label === "Active goals") return "goals";
  return "uses";
}

export function UsageMeterCard(props: {
  meter: UsageMeter;
  className?: string;
}) {
  const noun = meterNoun(props.meter.label);
  const primaryValue = props.meter.unlimited
    ? "Unlimited"
    : props.meter.status === "locked"
      ? "Upgrade"
      : `${props.meter.remaining} left`;
  const secondaryValue = props.meter.unlimited
    ? `${props.meter.used} ${noun} used with no cap`
    : props.meter.limit > 0
      ? `${props.meter.used} of ${props.meter.limit} ${noun} already in use`
      : "This plan does not include this feature yet";
  const statusCopy = props.meter.unlimited
    ? "Unlimited"
    : props.meter.status === "locked"
      ? "Upgrade required"
      : props.meter.status === "near_limit"
        ? "Near limit"
        : "Available";

  return (
    <div className={cn("surface-card min-w-0 px-5 py-5", props.className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "inline-flex size-11 shrink-0 items-center justify-center rounded-2xl",
              props.meter.status === "locked"
                ? "bg-muted text-muted-foreground"
                : props.meter.status === "near_limit"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-primary/12 text-primary"
            )}
          >
            {props.meter.label === "AI coach" ? (
              <BrainCircuit className="size-5" />
            ) : props.meter.label === "Active goals" ? (
              <Target className="size-5" />
            ) : (
              <LockKeyhole className="size-5" />
            )}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{props.meter.label}</p>
            <div
              className={cn(
                "mt-1 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                props.meter.status === "locked"
                  ? "border-border/80 bg-white/80 text-muted-foreground"
                  : props.meter.status === "near_limit"
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-primary/15 bg-primary/8 text-primary/80"
              )}
            >
              {statusCopy}
            </div>
          </div>
        </div>
        <InfoTooltip content={props.meter.helper} label={`${props.meter.label} details`} />
      </div>
      <div className="mt-6">
        <p className="text-3xl font-semibold text-foreground">{primaryValue}</p>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          {secondaryValue}
        </p>
      </div>
      <div className="mt-5 h-2 rounded-full bg-secondary">
        <div
          className={cn(
            "h-2 rounded-full transition-all",
            props.meter.status === "locked"
              ? "bg-border"
              : props.meter.status === "near_limit"
                ? "bg-amber-500"
                : "bg-primary"
          )}
          style={{ width: `${props.meter.unlimited ? 100 : props.meter.percentage}%` }}
        />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>
          {props.meter.unlimited
            ? "No cap on this plan"
            : props.meter.limit > 0
              ? `${props.meter.limit} total ${noun}`
              : "Upgrade required"}
        </span>
        <span>
          {props.meter.unlimited ? "Always available" : `${props.meter.percentage}% used`}
        </span>
      </div>
    </div>
  );
}
