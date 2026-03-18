"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type AdaptiveProgramCardProps = {
  mode: string;
  reason: string;
  summary: string;
  focus: string;
  nextActions: string[];
  shouldPromptReplan: boolean;
};

export function AdaptiveProgramCard({
  mode,
  reason,
  summary,
  focus,
  nextActions,
  shouldPromptReplan,
}: AdaptiveProgramCardProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <section className="soft-panel px-6 py-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="pill">Adaptive planning</p>
          <h2 className="mt-4 text-2xl font-semibold">{mode}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            {summary}
          </p>
        </div>
        <div
          className={
            shouldPromptReplan
              ? "rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              : "rounded-full border border-border/70 bg-white/75 px-3 py-1 text-xs font-medium text-muted-foreground"
          }
        >
          {shouldPromptReplan ? "AI recommends a refresh" : "Plan looks steady"}
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.5rem] bg-white/75 px-4 py-4">
          <p className="text-sm text-muted-foreground">Why this matters</p>
          <p className="mt-2 text-sm leading-7 text-foreground">{reason}</p>
          <p className="mt-4 text-sm text-muted-foreground">Current AI focus</p>
          <p className="mt-2 text-sm leading-7 text-foreground">{focus}</p>
        </div>
        <div className="rounded-[1.5rem] bg-white/75 px-4 py-4">
          <p className="text-sm text-muted-foreground">What the replanner will reinforce</p>
          <div className="mt-3 grid gap-2">
            {nextActions.map((action) => (
              <div
                key={action}
                className="rounded-2xl border border-border/60 px-3 py-3 text-sm text-foreground"
              >
                {action}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Rebuild the active week from your latest adherence, recovery, and coach context.
        </p>
        <Button
          className="rounded-full"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              setFeedback(null);
              const response = await fetch("/api/programs/replan", {
                method: "POST",
              });
              const payload = await response.json();

              if (!response.ok || !payload.success) {
                setFeedback(payload.error ?? "Failed to rebuild the week.");
                return;
              }

              setFeedback(payload.data.message ?? "Weekly program refreshed.");
              router.refresh();
            })
          }
        >
          {isPending ? "Rebuilding..." : "Rebuild this week with AI"}
        </Button>
      </div>

      {feedback ? <p className="mt-3 text-sm text-primary">{feedback}</p> : null}
    </section>
  );
}
