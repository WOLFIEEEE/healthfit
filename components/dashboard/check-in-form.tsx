"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CheckInForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    moodScore: "7",
    energyScore: "7",
    stressScore: "4",
    adherenceScore: "8",
    sleepHours: "7.5",
    wins: "",
    blockers: "",
    notes: "",
  });
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="soft-panel px-5 py-5">
      <h3 className="text-xl font-semibold">Daily check-in</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-5">
        {[
          ["Mood", "moodScore"],
          ["Energy", "energyScore"],
          ["Stress", "stressScore"],
          ["Adherence", "adherenceScore"],
          ["Sleep hours", "sleepHours"],
        ].map(([label, field]) => (
          <Input
            key={field}
            type="number"
            placeholder={label}
            value={form[field as keyof typeof form]}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                [field]: event.target.value,
              }))
            }
            className="rounded-2xl bg-white/80"
          />
        ))}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Textarea
          placeholder="Wins from today"
          value={form.wins}
          onChange={(event) =>
            setForm((current) => ({ ...current, wins: event.target.value }))
          }
          className="rounded-[1.5rem] bg-white/80"
        />
        <Textarea
          placeholder="Blockers or friction"
          value={form.blockers}
          onChange={(event) =>
            setForm((current) => ({ ...current, blockers: event.target.value }))
          }
          className="rounded-[1.5rem] bg-white/80"
        />
      </div>
      <Textarea
        placeholder="Anything else to remember for tomorrow"
        value={form.notes}
        onChange={(event) =>
          setForm((current) => ({ ...current, notes: event.target.value }))
        }
        className="mt-3 rounded-[1.5rem] bg-white/80"
      />
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Check-ins power your weekly recap, adherence trends, and coach context.
        </p>
        <Button
          onClick={() =>
            startTransition(async () => {
              const response = await fetch("/api/check-ins", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  periodType: "daily",
                  moodScore: Number(form.moodScore),
                  energyScore: Number(form.energyScore),
                  stressScore: Number(form.stressScore),
                  adherenceScore: Number(form.adherenceScore),
                  sleepHours: Number(form.sleepHours),
                  wins: form.wins,
                  blockers: form.blockers,
                  notes: form.notes,
                }),
              });
              const payload = await response.json();
              setResponseMessage(
                payload.success ? payload.summary ?? "Check-in saved." : payload.error
              );
              if (payload.success) {
                router.refresh();
              }
            })
          }
          disabled={isPending}
          className="rounded-full"
        >
          Save check-in
        </Button>
      </div>
      {responseMessage ? (
        <p className="mt-3 text-sm text-primary">{responseMessage}</p>
      ) : null}
    </div>
  );
}
