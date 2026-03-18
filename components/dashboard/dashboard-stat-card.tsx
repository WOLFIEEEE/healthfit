import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "./info-tooltip";

type DashboardStatTone = "default" | "brand" | "inverse" | "warning";

const cardToneClassName: Record<DashboardStatTone, string> = {
  default: "surface-card",
  brand: "surface-card brand-wash border-primary/15",
  inverse:
    "rounded-[1.5rem] border border-foreground/10 bg-foreground text-white shadow-[0_28px_70px_-40px_rgba(14,33,28,0.72)]",
  warning: "surface-card border-amber-200/70 bg-amber-50/90",
};

const iconToneClassName: Record<DashboardStatTone, string> = {
  default: "bg-primary/12 text-primary",
  brand: "bg-white/80 text-primary",
  inverse: "bg-white/12 text-white",
  warning: "bg-amber-100 text-amber-700",
};

const labelToneClassName: Record<DashboardStatTone, string> = {
  default: "text-muted-foreground",
  brand: "text-muted-foreground",
  inverse: "text-white/70",
  warning: "text-amber-800/80",
};

type DashboardStatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  detail?: string;
  caption?: string;
  tone?: DashboardStatTone;
  className?: string;
};

export function DashboardStatCard({
  icon: Icon,
  label,
  value,
  detail,
  caption,
  tone = "default",
  className,
}: DashboardStatCardProps) {
  const isInverse = tone === "inverse";

  return (
    <div
      className={cn(
        "relative min-w-0 overflow-hidden px-5 py-5",
        cardToneClassName[tone],
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "inline-flex size-11 shrink-0 items-center justify-center rounded-2xl",
            iconToneClassName[tone]
          )}
        >
          <Icon className="size-5" />
        </span>
        {detail ? (
          <InfoTooltip
            content={detail}
            className={isInverse ? "border-white/20 bg-white/10 text-white/80 hover:border-white/30 hover:text-white" : undefined}
          />
        ) : null}
      </div>
      <p className="mt-6 text-3xl font-semibold tracking-tight sm:text-[2rem]">{value}</p>
      <p className={cn("mt-2 text-sm font-medium", labelToneClassName[tone])}>{label}</p>
      {caption ? (
        <p
          className={cn(
            "mt-4 text-[11px] font-semibold uppercase tracking-[0.24em]",
            isInverse ? "text-white/50" : "text-primary/70"
          )}
        >
          {caption}
        </p>
      ) : null}
    </div>
  );
}
