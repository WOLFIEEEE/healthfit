import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "./info-tooltip";

type NumberedInsightCardProps = {
  icon: LucideIcon;
  title: string;
  items: string[];
  emptyLabel: string;
  detail?: string;
  className?: string;
};

export function NumberedInsightCard({
  icon: Icon,
  title,
  items,
  emptyLabel,
  detail,
  className,
}: NumberedInsightCardProps) {
  const countLabel =
    items.length === 0 ? "No items" : items.length === 1 ? "1 item" : `${items.length} items`;

  return (
    <div className={cn("surface-card min-w-0 px-5 py-6", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold">{title}</h3>
              <span className="rounded-full border border-border/70 bg-white/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {countLabel}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {items.length === 0
                ? "Nothing to review here right now."
                : items.length === 1
                  ? "One clear item worth keeping visible."
                  : "A short list that stays easy to scan."}
            </p>
          </div>
        </div>
        {detail ? <InfoTooltip content={detail} label={`${title} details`} /> : null}
      </div>

      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-[1.25rem] border border-dashed border-border/80 bg-white/55 px-4 py-4 text-sm text-muted-foreground">
            {emptyLabel}
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={`${title}-${index}`}
              className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-start gap-3 rounded-[1.25rem] border border-border/70 bg-white/78 px-3 py-3.5"
            >
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/12 text-sm font-semibold text-primary">
                {index + 1}
              </span>
              <p className="min-w-0 text-sm font-medium leading-6 text-foreground">
                {item}
              </p>
              <InfoTooltip
                content={item}
                label={`${title} ${index + 1}`}
                className="self-start"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
