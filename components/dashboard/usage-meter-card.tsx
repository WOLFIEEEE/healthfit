import { UsageMeter } from "@/lib/healthfit/contracts";
import { cn } from "@/lib/utils";

export function UsageMeterCard(props: {
  meter: UsageMeter;
  className?: string;
}) {
  return (
    <div className={cn("surface-card px-4 py-4", props.className)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">{props.meter.label}</p>
          <p className="mt-1 text-xs text-muted-foreground">{props.meter.helper}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-foreground">
            {props.meter.unlimited
              ? `${props.meter.used} used`
              : props.meter.limit > 0
                ? `${props.meter.used}/${props.meter.limit}`
                : "Locked"}
          </p>
          <p
            className={cn(
              "text-xs font-medium",
              props.meter.status === "locked"
                ? "text-muted-foreground"
                : props.meter.status === "near_limit"
                  ? "text-amber-700"
                  : "text-primary"
            )}
          >
            {props.meter.unlimited
              ? "Unlimited"
              : props.meter.status === "locked"
              ? "Upgrade required"
              : props.meter.status === "near_limit"
                ? "Near limit"
                : "Available"}
          </p>
        </div>
      </div>
      <div className="mt-4 h-2 rounded-full bg-secondary">
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
    </div>
  );
}
