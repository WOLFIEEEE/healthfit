import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { GuestCheckoutForm } from "@/components/marketing/guest-checkout-form";
import { BrandMark } from "@/components/healthfit/brand-mark";
import { planCatalog } from "@/lib/config/plans";
import { buildNoIndexMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Checkout",
  description: "Guest checkout flow for Healthfit.ai paid plans.",
});

export default async function GuestCheckoutPage(props: {
  searchParams: Promise<{
    plan?: string;
  }>;
}) {
  const { plan } = await props.searchParams;
  const paidPlans = planCatalog
    .filter((item) => item.monthlyPrice > 0 && item.dodoProductId)
    .map((item) => ({
      key: item.key,
      name: item.name,
      description: item.description,
      monthlyPrice: item.monthlyPrice,
      annualPrice: item.annualPrice,
      dodoProductId: item.dodoProductId as string,
      features: item.features,
    }));
  const initialPlanKey =
    paidPlans.find((item) => item.key === plan)?.key ?? paidPlans[0]?.key ?? "";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f4f7f2_0%,#eef3ec_52%,#f8faf7_100%)]">
      <div className="page-shell py-6 sm:py-8 lg:py-10">
        <div className="flex items-center justify-between gap-4">
          <BrandMark />
          <Link
            href="/#pricing"
            className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/80 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/20 hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to pricing
          </Link>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.02fr_1fr] lg:items-start">
          <section className="rounded-[2.2rem] border border-border/60 bg-[#23412f] px-7 py-9 text-white shadow-[0_40px_100px_-50px_rgba(20,43,31,0.85)] sm:px-10 sm:py-11">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-emerald-200/70">
              Smooth purchase flow
            </p>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Checkout first. Claim your account right after.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
              This flow is built for people who want to start with payment and
              create their account from the email we send after checkout. Your
              workspace is activated once the purchase clears.
            </p>

            <div className="mt-10 grid gap-5">
              {[
                {
                  icon: Sparkles,
                  title: "Start without signing up",
                  body: "Choose your paid plan and enter the name and email that should own the membership.",
                },
                {
                  icon: Mail,
                  title: "Get a secure access email",
                  body: "After payment, we send a clean invitation or access link to the same inbox so you can claim the workspace.",
                },
                {
                  icon: ShieldCheck,
                  title: "Complete onboarding after purchase",
                  body: "Your plan is attached to the account before you log in, so onboarding happens inside the paid experience.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-[1.6rem] border border-white/10 bg-white/6 px-6 py-6 backdrop-blur-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                        <Icon className="size-5 text-emerald-200" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">{item.title}</h2>
                        <p className="mt-2 text-sm leading-7 text-white/70">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <GuestCheckoutForm plans={paidPlans} initialPlanKey={initialPlanKey} />
        </div>
      </div>
    </main>
  );
}
