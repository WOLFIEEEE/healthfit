import Link from "next/link";
import { planCatalog } from "@/lib/config/plans";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function PricingGrid(props: { ctaHref?: string }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {planCatalog.map((plan) => {
        const yearlySavings = plan.monthlyPrice * 12 - plan.annualPrice;

        return (
          <article
            key={plan.key}
            className={cn(
              "soft-panel flex flex-col px-6 py-6",
              plan.featured && "ring-2 ring-primary/25"
            )}
          >
            <div className={cn("rounded-[1.5rem] bg-gradient-to-br p-5", plan.accentClassName)}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                  <h3 className="mt-2 text-3xl font-semibold">{plan.name}</h3>
                </div>
                {plan.badge ? <div className="pill">{plan.badge}</div> : null}
              </div>
              <div className="mt-6 flex items-end gap-2">
                <span className="text-4xl font-semibold">${plan.monthlyPrice}</span>
                <span className="pb-1 text-sm text-muted-foreground">/ month</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {plan.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full border border-primary/15 bg-white/65 px-3 py-1">
                  {plan.entitlements.maxActiveGoals} active goals
                </span>
                <span className="rounded-full border border-primary/15 bg-white/65 px-3 py-1">
                  {plan.entitlements.aiDailyMessages > 0
                    ? `${plan.entitlements.aiDailyMessages} AI messages/day`
                    : "Manual tracking focus"}
                </span>
                <span className="rounded-full border border-primary/15 bg-white/65 px-3 py-1">
                  {plan.entitlements.prioritySupport ? "Priority support" : "Standard support"}
                </span>
              </div>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-6 surface-card px-4 py-4 text-sm text-muted-foreground">
              {plan.monthlyPrice === 0
                ? "Start on the free tier and upgrade only when you want AI coaching and deeper analytics."
                : yearlySavings > 0
                  ? `Annual billing saves $${yearlySavings} compared with paying month to month.`
                  : `Annual billing is available at $${plan.annualPrice} per year.`}
            </div>
            <Button
              asChild
              className="mt-6 rounded-full"
              variant={plan.featured ? "default" : "outline"}
            >
              <Link href={props.ctaHref ?? "/login"}>
                {plan.monthlyPrice === 0 ? "Start free" : "Choose plan"}
              </Link>
            </Button>
          </article>
        );
      })}
    </div>
  );
}
