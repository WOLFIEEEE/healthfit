"use client";

import { useState, useTransition } from "react";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";

type Personality = {
  slug: string;
  name: string;
  description: string;
  avatarEmoji: string;
  planRequired: string;
};

type CoachPersonalityPickerProps = {
  personalities: Personality[];
  currentSlug: string | null;
  userPlanKey: string;
};

const planRank: Record<string, number> = {
  starter: 0,
  pro: 1,
  elite: 2,
};

export function CoachPersonalityPicker({
  personalities,
  currentSlug,
  userPlanKey,
}: CoachPersonalityPickerProps) {
  const [selected, setSelected] = useState(currentSlug ?? "default");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSelect(slug: string) {
    setSelected(slug);
    startTransition(async () => {
      try {
        await fetch("/api/coach/personality", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ personalitySlug: slug }),
        });
        router.refresh();
      } catch {
        // Revert
        setSelected(currentSlug ?? "default");
      }
    });
  }

  const userRank = planRank[userPlanKey] ?? 0;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {personalities.map((p) => {
        const locked = (planRank[p.planRequired] ?? 0) > userRank;
        const isSelected = selected === p.slug;

        return (
          <button
            key={p.slug}
            onClick={() => !locked && handleSelect(p.slug)}
            disabled={locked || isPending}
            className={`surface-card rounded-[1.5rem] p-4 text-left transition ${
              isSelected
                ? "ring-2 ring-primary/30 bg-primary/5"
                : "hover:bg-secondary/50"
            } ${locked ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{p.avatarEmoji}</span>
              <div>
                <p className="text-sm font-semibold">{p.name}</p>
                {locked && (
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Lock className="size-3" />
                    Requires {p.planRequired}
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {p.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
