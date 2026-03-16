"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LogWorkoutForm() {
  const [form, setForm] = useState({
    workoutName: "",
    durationMin: "45",
    effortScore: "7",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="soft-panel px-5 py-5">
      <h3 className="text-xl font-semibold">Log a workout</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Input
          placeholder="Workout name"
          value={form.workoutName}
          onChange={(event) =>
            setForm((current) => ({ ...current, workoutName: event.target.value }))
          }
          className="rounded-2xl bg-white/80"
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
      <div className="mt-4 flex items-center justify-between gap-3">
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
