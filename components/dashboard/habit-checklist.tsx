"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";

type HabitChecklistProps = {
  habits: Array<{
    id: string;
    title: string;
    description: string | null;
    completed: boolean;
  }>;
};

export function HabitChecklist({ habits }: HabitChecklistProps) {
  const router = useRouter();
  const [items, setItems] = useState(habits);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="soft-panel min-w-0 px-8 py-9 sm:px-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-xl font-semibold">Daily habits</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Mark the repeatable actions that keep your routine stable.
          </p>
        </div>
        {isPending ? <div className="pill">Saving</div> : null}
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {items.length === 0 ? (
          <div className="surface-card px-5 py-5 text-sm text-muted-foreground">
            No habits are active yet. Create a simple anchor habit to make this page useful fast.
          </div>
        ) : (
          items.map((habit) => (
            <button
              key={habit.id}
              type="button"
              onClick={() =>
                startTransition(async () => {
                  const nextCompleted = !habit.completed;
                  setItems((current) =>
                    current.map((item) =>
                      item.id === habit.id ? { ...item, completed: nextCompleted } : item
                    )
                  );
                  const response = await fetch("/api/habits/log", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      habitTemplateId: habit.id,
                      status: nextCompleted ? "done" : "skipped",
                    }),
                  });
                  const payload = await response.json();

                  if (!response.ok || !payload.success) {
                    setItems((current) =>
                      current.map((item) =>
                        item.id === habit.id ? { ...item, completed: habit.completed } : item
                      )
                    );
                    return;
                  }

                  router.refresh();
                })
              }
              className={cn(
                "flex min-w-0 items-start gap-4 rounded-[1.5rem] border px-5 py-5 text-left transition",
                habit.completed
                  ? "border-primary/30 bg-primary/6"
                  : "border-border/70 bg-white/80"
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs",
                  habit.completed
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground"
                )}
              >
                {habit.completed ? "✓" : ""}
              </div>
              <div className="min-w-0">
                <p className="font-medium">{habit.title}</p>
                <p className="mt-1 text-sm leading-7 text-muted-foreground">
                  {habit.description}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
