import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandMark(props: {
  className?: string;
  compact?: boolean;
  tone?: "default" | "inverse";
}) {
  const tone = props.tone ?? "default";

  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2.5", props.className)}
    >
      <div className="relative flex h-10 w-10 items-center justify-center rounded-[1.15rem] bg-gradient-to-br from-emerald-600 via-emerald-500 to-lime-200 shadow-[0_16px_32px_-22px_rgba(52,131,77,0.5)]">
        <div className="h-6 w-6 rounded-full border-[3px] border-white/90" />
        <div className="absolute h-3 w-3 rounded-full bg-white/95" />
      </div>
      <div className="space-y-0.5">
        <div
          className={cn(
            "font-[var(--font-display)] text-xl leading-none tracking-tight",
            tone === "inverse" ? "text-white" : "text-foreground"
          )}
        >
          Healthfit.ai
        </div>
        {!props.compact && (
          <div
            className={cn(
              "text-[11px] uppercase tracking-[0.24em]",
              tone === "inverse" ? "text-white/58" : "text-muted-foreground"
            )}
          >
            Wellness coaching system
          </div>
        )}
      </div>
    </Link>
  );
}
