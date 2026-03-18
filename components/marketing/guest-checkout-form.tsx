"use client";

import Link from "next/link";
import { type FormEvent, useState, useTransition } from "react";
import { ArrowRight, Check, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type GuestCheckoutPlan = {
  key: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  dodoProductId: string;
  features: string[];
};

type GuestCheckoutFormProps = {
  plans: GuestCheckoutPlan[];
  initialPlanKey: string;
};

export function GuestCheckoutForm({
  plans,
  initialPlanKey,
}: GuestCheckoutFormProps) {
  const [selectedPlanKey, setSelectedPlanKey] = useState(initialPlanKey);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedPlan =
    plans.find((plan) => plan.key === selectedPlanKey) ?? plans[0] ?? null;

  const yearlySavings =
    selectedPlan?.monthlyPrice && selectedPlan.annualPrice
      ? selectedPlan.monthlyPrice * 12 - selectedPlan.annualPrice
      : 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!selectedPlan?.dodoProductId) {
      setError("This plan is not ready for checkout yet.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_cart: [
              {
                product_id: selectedPlan.dodoProductId,
                quantity: 1,
              },
            ],
            customer: {
              email,
              name: fullName,
            },
          }),
        });

        const payload = response.headers
          .get("content-type")
          ?.includes("application/json")
          ? ((await response.json()) as {
              checkout_url?: string;
              error?: string;
            })
          : { error: await response.text() };

        if (!response.ok || !payload.checkout_url) {
          setError(payload.error ?? "Failed to start checkout.");
          return;
        }

        window.location.assign(payload.checkout_url);
      } catch (submissionError) {
        setError(
          submissionError instanceof Error
            ? submissionError.message
            : "Failed to start checkout."
        );
      }
    });
  };

  if (!selectedPlan) {
    return (
      <div className="rounded-[2rem] border border-border/70 bg-white/90 p-6 shadow-[0_30px_80px_-40px_rgba(33,77,57,0.28)]">
        <h2 className="text-2xl font-semibold text-foreground">
          Checkout is not available yet
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          We could not find an active paid plan in this environment. Sign in or
          contact support and we&apos;ll help you finish setup.
        </p>
      </div>
    );
  }

  return (
    <form
      className="rounded-[2rem] border border-border/70 bg-white/95 p-6 shadow-[0_30px_80px_-40px_rgba(33,77,57,0.28)] sm:p-8"
      onSubmit={handleSubmit}
      data-testid="guest-checkout-form"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="pill">Guest checkout</p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Finish your membership setup
          </h2>
        </div>
        <div className="rounded-full border border-primary/15 bg-primary/6 px-3 py-2 text-xs font-medium text-primary">
          No account needed upfront
        </div>
      </div>

      <p className="mt-4 text-sm leading-7 text-muted-foreground">
        Complete checkout first. After payment, we&apos;ll email you a secure
        access link so you can claim your Healthfit.ai workspace and continue
        into onboarding.
      </p>

      <div className="mt-7 space-y-4">
        <Label htmlFor="guest-checkout-name">Full name</Label>
        <Input
          id="guest-checkout-name"
          data-testid="guest-checkout-name"
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          autoComplete="name"
          placeholder="Enter your full name"
          className="h-11 rounded-2xl border-border/80 bg-stone-50/70"
          required
        />
      </div>

      <div className="mt-5 space-y-4">
        <Label htmlFor="guest-checkout-email">Email address</Label>
        <Input
          id="guest-checkout-email"
          data-testid="guest-checkout-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          placeholder="you@example.com"
          className="h-11 rounded-2xl border-border/80 bg-stone-50/70"
          required
        />
      </div>

      <div className="mt-7">
        <p className="text-sm font-medium text-foreground">Choose your plan</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {plans.map((plan) => {
            const isSelected = plan.key === selectedPlanKey;

            return (
              <button
                key={plan.key}
                type="button"
                data-testid={`guest-checkout-plan-${plan.key}`}
                className={cn(
                  "rounded-[1.5rem] border px-5 py-5 text-left transition-all",
                  isSelected
                    ? "border-primary/40 bg-primary/6 shadow-[0_18px_50px_-32px_rgba(33,77,57,0.4)]"
                    : "border-border/70 bg-stone-50/70 hover:border-primary/20 hover:bg-white"
                )}
                onClick={() => setSelectedPlanKey(plan.key)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-foreground">
                      {plan.name}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-medium",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    ${plan.monthlyPrice}/mo
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-border/70 bg-stone-50/80 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              {selectedPlan.name} membership
            </p>
            <div className="mt-1 flex items-end gap-2">
              <span className="text-3xl font-semibold tracking-tight text-foreground">
                ${selectedPlan.monthlyPrice}
              </span>
              <span className="pb-1 text-sm text-muted-foreground">
                / month
              </span>
            </div>
          </div>
          {yearlySavings > 0 ? (
            <p className="text-sm text-primary">
              Annual option saves ${yearlySavings}/year inside billing later on.
            </p>
          ) : null}
        </div>

        <div className="mt-5 grid gap-3">
          {selectedPlan.features.slice(0, 4).map((feature) => (
            <div
              key={feature}
              className="flex items-start gap-3 text-sm leading-6 text-muted-foreground"
            >
              <div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Check className="size-3 text-primary" />
              </div>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Button
        type="submit"
        data-testid="guest-checkout-submit"
        className="mt-6 h-11 w-full rounded-full text-sm font-medium"
        disabled={isPending}
      >
        <LockKeyhole className="size-4" />
        {isPending ? "Preparing secure checkout..." : "Continue to secure checkout"}
        <ArrowRight className="size-4" />
      </Button>

      <div className="mt-6 flex flex-col gap-4 text-sm leading-6 text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in instead
          </Link>
        </p>
        <p>Your purchase email will be sent to the address above.</p>
      </div>
    </form>
  );
}
