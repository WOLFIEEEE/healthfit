import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { BrandMark } from "@/components/healthfit/brand-mark";

export default function OnboardingPage() {
  return (
    <main className="page-shell min-h-screen py-10">
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="soft-panel px-6 py-8 sm:px-8">
          <BrandMark />
          <p className="pill mt-8">Step into Healthfit.ai</p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight">
            Let&apos;s build a plan that matches your real life.
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            This onboarding flow sets your weekly structure, coaching context,
            nutrition targets, and safety boundaries. It usually takes less than
            five minutes.
          </p>
          <div className="mt-8 space-y-3">
            {[
              "Goal and routine capture",
              "Program generation and daily habits",
              "Wellness-only guardrails and consent",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.5rem] bg-white/70 px-4 py-4 text-sm text-muted-foreground"
              >
                {item}
              </div>
            ))}
          </div>
        </section>
        <OnboardingForm />
      </div>
    </main>
  );
}
