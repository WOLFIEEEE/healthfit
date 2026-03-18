"use client";

import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const workoutDayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const equipmentOptions = [
  "Bodyweight",
  "Dumbbells",
  "Resistance bands",
  "Kettlebell",
  "Gym access",
  "Bike",
];
const dietaryOptions = [
  "High protein",
  "Vegetarian",
  "Vegan",
  "Low carb",
  "Mediterranean",
  "Dairy free",
];

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    age: "",
    experienceLevel: "beginner",
    activityLevel: "moderate",
    primaryGoalType: "fat_loss",
    goalSummary: "",
    workoutDays: ["Mon", "Wed", "Fri"],
    sessionLengthMin: "45",
    availableEquipment: ["Bodyweight"],
    dietaryPreferences: ["High protein"],
    mealsPerDay: "3",
    hydrationTargetMl: "2500",
    currentWeightKg: "",
    targetWeightKg: "",
    heightCm: "",
    injuriesAndLimitations: "",
    onboardingNotes: "",
    wellnessConsentAccepted: true,
    disclaimerAccepted: true,
  });

  const steps = useMemo(
    () => [
      {
        title: "Identity and intent",
        copy: "Tell Healthfit.ai who you are and what you want to improve.",
      },
      {
        title: "Routine setup",
        copy: "Define your weekly cadence, equipment, and training bandwidth.",
      },
      {
        title: "Nutrition and health context",
        copy: "Set the context that will guide targets and safe wellness prompts.",
      },
    ],
    []
  );

  const toggleValue = (field: "workoutDays" | "availableEquipment" | "dietaryPreferences", value: string) => {
    setForm((current) => {
      const values = current[field];
      const nextValues = values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value];

      return {
        ...current,
        [field]: nextValues,
      };
    });
  };

  const submit = () => {
    setLoading(true);
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          age: form.age ? Number(form.age) : undefined,
          sessionLengthMin: Number(form.sessionLengthMin),
          mealsPerDay: Number(form.mealsPerDay),
          hydrationTargetMl: Number(form.hydrationTargetMl),
          currentWeightKg: form.currentWeightKg
            ? Number(form.currentWeightKg)
            : undefined,
          targetWeightKg: form.targetWeightKg
            ? Number(form.targetWeightKg)
            : undefined,
          heightCm: form.heightCm ? Number(form.heightCm) : undefined,
        }),
      });

      const payload = await response.json();
      setLoading(false);

      if (!response.ok || !payload.success) {
        setError(payload.error ?? "Onboarding failed");
        return;
      }

      router.push(payload.redirectTo ?? "/dashboard/overview");
      router.refresh();
    });
  };

  return (
    <div className="soft-panel px-7 py-8 sm:px-10">
      <div className="flex flex-wrap gap-3.5">
        {steps.map((item, index) => (
          <button
            key={item.title}
            type="button"
            onClick={() => setStep(index)}
            className={cn(
              "rounded-full px-4 py-2 text-sm transition",
              step === index
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            )}
          >
            0{index + 1}. {item.title}
          </button>
        ))}
      </div>
      <div className="mt-7">
        <p className="pill">{steps[step].title}</p>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          {steps[step].copy}
        </p>
      </div>

      {step === 0 ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Input
            placeholder="Full name"
            value={form.fullName}
            onChange={(event) =>
              setForm((current) => ({ ...current, fullName: event.target.value }))
            }
            className="rounded-2xl bg-white/80"
          />
          <Input
            type="number"
            placeholder="Age (optional)"
            value={form.age}
            onChange={(event) =>
              setForm((current) => ({ ...current, age: event.target.value }))
            }
            className="rounded-2xl bg-white/80"
          />
          <div className="grid gap-3">
            <label className="text-sm font-medium">Experience level</label>
            <div className="flex flex-wrap gap-2.5">
              {["beginner", "intermediate", "advanced"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    setForm((current) => ({ ...current, experienceLevel: option }))
                  }
                  className={cn(
                    "rounded-full px-4 py-2 text-sm capitalize",
                    form.experienceLevel === option
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-3">
            <label className="text-sm font-medium">Activity level</label>
            <div className="flex flex-wrap gap-2.5">
              {["low", "moderate", "high"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    setForm((current) => ({ ...current, activityLevel: option }))
                  }
                  className={cn(
                    "rounded-full px-4 py-2 text-sm capitalize",
                    form.activityLevel === option
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 md:col-span-2">
            <label className="text-sm font-medium">Primary goal</label>
            <div className="flex flex-wrap gap-2.5">
              {[
                ["fat_loss", "Fat loss"],
                ["muscle_gain", "Muscle gain"],
                ["recomposition", "Body recomposition"],
                ["energy", "Energy"],
                ["habit_consistency", "Habit consistency"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setForm((current) => ({ ...current, primaryGoalType: value }))
                  }
                  className={cn(
                    "rounded-full px-4 py-2 text-sm",
                    form.primaryGoalType === value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <Textarea
            placeholder="Describe the result you want from Healthfit.ai."
            value={form.goalSummary}
            onChange={(event) =>
              setForm((current) => ({ ...current, goalSummary: event.target.value }))
            }
            className="rounded-[1.5rem] bg-white/80 md:col-span-2"
          />
        </div>
      ) : null}

      {step === 1 ? (
        <div className="mt-8 grid gap-5">
          <div className="grid gap-3">
            <label className="text-sm font-medium">Workout days</label>
            <div className="flex flex-wrap gap-2.5">
              {workoutDayOptions.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleValue("workoutDays", day)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm",
                    form.workoutDays.includes(day)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              type="number"
              placeholder="Session length (minutes)"
              value={form.sessionLengthMin}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  sessionLengthMin: event.target.value,
                }))
              }
              className="rounded-2xl bg-white/80"
            />
            <Input
              type="number"
              placeholder="Meals per day"
              value={form.mealsPerDay}
              onChange={(event) =>
                setForm((current) => ({ ...current, mealsPerDay: event.target.value }))
              }
              className="rounded-2xl bg-white/80"
            />
          </div>
          <div className="grid gap-3">
            <label className="text-sm font-medium">Available equipment</label>
            <div className="flex flex-wrap gap-2.5">
              {equipmentOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleValue("availableEquipment", option)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm",
                    form.availableEquipment.includes(option)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mt-8 grid gap-5">
          <div className="grid gap-3">
            <label className="text-sm font-medium">Dietary preferences</label>
            <div className="flex flex-wrap gap-2.5">
              {dietaryOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleValue("dietaryPreferences", option)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm",
                    form.dietaryPreferences.includes(option)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <Input
              type="number"
              placeholder="Hydration target (ml)"
              value={form.hydrationTargetMl}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  hydrationTargetMl: event.target.value,
                }))
              }
              className="rounded-2xl bg-white/80"
            />
            <Input
              type="number"
              placeholder="Current weight (kg)"
              value={form.currentWeightKg}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  currentWeightKg: event.target.value,
                }))
              }
              className="rounded-2xl bg-white/80"
            />
            <Input
              type="number"
              placeholder="Target weight (kg)"
              value={form.targetWeightKg}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  targetWeightKg: event.target.value,
                }))
              }
              className="rounded-2xl bg-white/80"
            />
          </div>
          <Input
            type="number"
            placeholder="Height (cm)"
            value={form.heightCm}
            onChange={(event) =>
              setForm((current) => ({ ...current, heightCm: event.target.value }))
            }
            className="rounded-2xl bg-white/80"
          />
          <Textarea
            placeholder="Any limitations, pain, or recovery considerations?"
            value={form.injuriesAndLimitations}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                injuriesAndLimitations: event.target.value,
              }))
            }
            className="rounded-[1.5rem] bg-white/80"
          />
          <Textarea
            placeholder="Anything else your coach should know?"
            value={form.onboardingNotes}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                onboardingNotes: event.target.value,
              }))
            }
            className="rounded-[1.5rem] bg-white/80"
          />
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-xl text-xs leading-6 text-muted-foreground">
          By continuing, you confirm this is a wellness product, not a medical
          service, and that you will seek qualified professional care for urgent
          or clinical concerns.
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => setStep((current) => Math.max(0, current - 1))}
            disabled={step === 0 || loading}
          >
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button
              type="button"
              className="rounded-full"
              onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              className="rounded-full"
              onClick={submit}
              disabled={loading || !form.fullName || !form.goalSummary}
            >
              {loading ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}
              Finish onboarding
            </Button>
          )}
        </div>
      </div>
      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
