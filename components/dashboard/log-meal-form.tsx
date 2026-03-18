"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LogMealForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    calories: "550",
    proteinGrams: "35",
    carbsGrams: "45",
    fatGrams: "18",
    waterMl: "500",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="soft-panel min-w-0 px-8 py-9 sm:px-10">
      <h3 className="text-xl font-semibold">Log a meal</h3>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">
        Capture the main meal details quickly so nutrition targets and daily summaries stay useful without turning this into a food diary wall.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Input
          placeholder="Meal title"
          value={form.title}
          onChange={(event) =>
            setForm((current) => ({ ...current, title: event.target.value }))
          }
          className="rounded-2xl bg-white/80 sm:col-span-2"
        />
        {[
          ["Calories", "calories"],
          ["Protein (g)", "proteinGrams"],
          ["Carbs (g)", "carbsGrams"],
          ["Fat (g)", "fatGrams"],
          ["Water (ml)", "waterMl"],
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
      <div className="mt-5 flex flex-col items-start gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <p className="text-sm text-muted-foreground">
          Manual food logging keeps v1 simple while still powering targets and
          weekly insights.
        </p>
        <Button
          onClick={() =>
            startTransition(async () => {
              const response = await fetch("/api/meals/log", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  mealType: "lunch",
                  title: form.title,
                  calories: Number(form.calories),
                  proteinGrams: Number(form.proteinGrams),
                  carbsGrams: Number(form.carbsGrams),
                  fatGrams: Number(form.fatGrams),
                  waterMl: Number(form.waterMl),
                }),
              });
              const payload = await response.json();
              setMessage(payload.success ? "Meal saved." : payload.error);
              if (payload.success) {
                router.refresh();
              }
            })
          }
          disabled={isPending || !form.title}
          className="rounded-full"
        >
          Save meal
        </Button>
      </div>
      {message ? <p className="mt-3 text-sm text-primary">{message}</p> : null}
    </div>
  );
}
