"use client";

import { CircleHelp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type InfoTooltipProps = {
  content: string;
  label?: string;
  className?: string;
};

export function InfoTooltip({
  content,
  label = "More details",
  className,
}: InfoTooltipProps) {
  if (!content.trim()) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-full border border-border/70 bg-white/85 text-muted-foreground transition hover:border-primary/30 hover:text-primary",
            className
          )}
        >
          <CircleHelp className="size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={8}
        className="max-w-xs rounded-2xl bg-foreground px-3 py-2 text-[11px] leading-5 text-background shadow-[0_20px_40px_-24px_rgba(14,33,28,0.75)]"
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
