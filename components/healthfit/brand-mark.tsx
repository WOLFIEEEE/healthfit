import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandMark(props: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-3", props.className)}
    >
      <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-lime-200 shadow-[0_16px_36px_-18px_rgba(52,131,77,0.56)]">
        <div className="h-6 w-6 rounded-full border-[3px] border-white/90" />
        <div className="absolute h-3 w-3 rounded-full bg-white/95" />
      </div>
      <div className="space-y-0.5">
        <div className="font-[var(--font-display)] text-xl leading-none tracking-tight text-foreground">
          Healthfit.ai
        </div>
        {!props.compact && (
          <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
            Wellness coaching system
          </div>
        )}
      </div>
    </Link>
  );
}
