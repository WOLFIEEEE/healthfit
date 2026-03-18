import Link from "next/link";
import { ArrowRight, CircleCheckBig, Mail, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/healthfit/brand-mark";
import { getPlanByKey } from "@/lib/config/plans";

export default async function CheckoutSuccessPage(props: {
  searchParams: Promise<{
    email?: string;
    plan?: string;
  }>;
}) {
  const { email, plan } = await props.searchParams;
  const resolvedPlan = getPlanByKey(plan);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f5f8f3_0%,#edf3ec_100%)]">
      <div className="page-shell flex min-h-screen flex-col py-6 sm:py-8">
        <BrandMark />

        <div className="mx-auto flex w-full max-w-3xl flex-1 items-center py-10">
          <section className="w-full rounded-[2.4rem] border border-border/70 bg-white/95 px-6 py-8 text-center shadow-[0_40px_100px_-50px_rgba(33,77,57,0.32)] sm:px-10 sm:py-12">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
              <CircleCheckBig className="size-8 text-primary" />
            </div>

            <p className="mt-6 text-xs font-medium uppercase tracking-[0.3em] text-primary/70">
              Checkout returned
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Watch your inbox for the next step
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              If your {resolvedPlan.name} checkout completed successfully, we&apos;re
              sending the account access email to{" "}
              <span className="font-medium text-foreground">
                {email ?? "the address you entered"}
              </span>
              . Open that message to claim your Healthfit.ai workspace and move
              into onboarding.
            </p>

            <div className="mt-8 grid gap-4 rounded-[1.8rem] border border-border/70 bg-stone-50/70 p-5 text-left sm:grid-cols-3">
              {[
                {
                  icon: Mail,
                  title: "Email delivery",
                  body: "Most access emails land within a few minutes. Check spam or promotions if you do not see it right away.",
                },
                {
                  icon: ShieldCheck,
                  title: "Secure access",
                  body: "Use the same inbox you entered at checkout so the membership attaches to the right account.",
                },
                {
                  icon: CircleCheckBig,
                  title: "What happens next",
                  body: "Claim the account, finish onboarding, and your paid plan will already be available inside the app.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="rounded-[1.4rem] bg-white px-4 py-4">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/8">
                      <Icon className="size-4 text-primary" />
                    </div>
                    <h2 className="mt-4 text-base font-semibold text-foreground">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-border/80 bg-white px-5 py-3 text-sm font-medium text-foreground transition hover:border-primary/20"
              >
                Go to login
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Return home
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
