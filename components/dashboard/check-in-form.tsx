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
    <div className="soft-panel min-w-0 px-8 py-9 sm:px-10">
      <h3 className="text-xl font-semibold">Daily check-in</h3>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">
        Keep the signal lightweight enough to finish in a minute, but open enough for the coach and weekly recap to react properly.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
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
        className="mt-4 rounded-[1.5rem] bg-white/80"
      />
      <div className="mt-5 flex flex-col items-start gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
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
