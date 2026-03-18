"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LogWorkoutForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    workoutName: "",
    durationMin: "45",
    effortScore: "7",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="soft-panel min-w-0 px-8 py-9 sm:px-10">
      <h3 className="text-xl font-semibold">Log a workout</h3>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">
        Add the core session details fast so adherence, coach context, and progress stay current without needing a heavy training log.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Input
          placeholder="Workout name"
          value={form.workoutName}
          onChange={(event) =>
            setForm((current) => ({ ...current, workoutName: event.target.value }))
          }
          className="rounded-2xl bg-white/80 sm:col-span-2"
        />
        <Input
          type="number"
          placeholder="Duration"
          value={form.durationMin}
          onChange={(event) =>
            setForm((current) => ({ ...current, durationMin: event.target.value }))
          }
          className="rounded-2xl bg-white/80"
        />
        <Input
          type="number"
          placeholder="Effort score"
          value={form.effortScore}
          onChange={(event) =>
            setForm((current) => ({ ...current, effortScore: event.target.value }))
          }
          className="rounded-2xl bg-white/80"
        />
      </div>
      <div className="mt-5 flex flex-col items-start gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <p className="text-sm text-muted-foreground">
          Capture your session immediately so progress and adherence stay current.
        </p>
        <Button
          onClick={() =>
            startTransition(async () => {
              const response = await fetch("/api/workouts/log", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  workoutName: form.workoutName,
                  durationMin: Number(form.durationMin),
                  effortScore: Number(form.effortScore),
                  completed: true,
                }),
              });
              const payload = await response.json();
              setMessage(payload.success ? "Workout saved." : payload.error);
              if (payload.success) {
                router.refresh();
              }
            })
          }
          disabled={isPending || !form.workoutName}
          className="rounded-full"
        >
          Save workout
        </Button>
      </div>
      {message ? <p className="mt-3 text-sm text-primary">{message}</p> : null}
    </div>
  );
}
