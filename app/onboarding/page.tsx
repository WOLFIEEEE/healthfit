import type { Metadata } from "next";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { BrandMark } from "@/components/healthfit/brand-mark";
import { buildNoIndexMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Onboarding",
  description: "Member onboarding flow for Healthfit.ai.",
});

export default function OnboardingPage() {
  return (
    <main className="page-shell min-h-screen py-12 sm:py-16">
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
        <section className="soft-panel px-7 py-10 sm:px-10">
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
          <div className="mt-10 space-y-4">
            {[
              "Goal and routine capture",
              "Program generation and daily habits",
              "Wellness-only guardrails and consent",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.5rem] bg-white/70 px-5 py-5 text-sm text-muted-foreground"
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
