"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { planCatalog } from "@/lib/config/plans";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Sparkles } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function PricingGrid(props: { ctaHref?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const cards = el.querySelectorAll("[data-pricing-card]");

    gsap.fromTo(
      cards,
      { opacity: 0, y: 60, rotateX: 8 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );

    // Hover tilt effect
    cards.forEach((card) => {
      const handleMouseMove = (e: Event) => {
        const mouseEvent = e as MouseEvent;
        const rect = (card as HTMLElement).getBoundingClientRect();
        const x = mouseEvent.clientX - rect.left;
        const y = mouseEvent.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        gsap.to(card, {
          rotateY: ((x - centerX) / centerX) * 4,
          rotateX: -((y - centerY) / centerY) * 4,
          duration: 0.4,
          ease: "power2.out",
        });
      };

      const handleMouseLeave = () => {
        gsap.to(card, {
          rotateY: 0,
          rotateX: 0,
          duration: 0.6,
          ease: "elastic.out(1, 0.4)",
        });
      };

      card.addEventListener("mousemove", handleMouseMove);
      card.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill();
      });
    };
  }, []);

  return (
    <div ref={ref} className="grid gap-6 lg:grid-cols-3" style={{ perspective: "1200px" }}>
      {planCatalog.map((plan) => {
        const yearlySavings = plan.monthlyPrice * 12 - plan.annualPrice;

        return (
          <article
            key={plan.key}
            data-pricing-card
            className={cn(
              "group relative flex flex-col overflow-hidden rounded-[2rem] border p-1 transition-all duration-500",
              plan.featured
                ? "border-primary/30 bg-gradient-to-b from-primary/5 to-transparent shadow-[0_40px_100px_-40px_rgba(46,114,78,0.3)]"
                : "border-border/50 bg-white/60 hover:border-primary/20 hover:shadow-[0_30px_80px_-30px_rgba(46,114,78,0.2)]"
            )}
            style={{ transformStyle: "preserve-3d" }}
          >
            {plan.featured && (
              <div className="absolute -top-px left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            )}

            <div className={cn(
              "rounded-[1.75rem] p-6",
              plan.featured ? "bg-gradient-to-br from-emerald-50/80 to-white" : "bg-gradient-to-br from-white to-muted/30"
            )}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {plan.tagline}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold">{plan.name}</h3>
                </div>
                {plan.featured && (
                  <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                    <Sparkles className="size-3" />
                    Popular
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  ${plan.monthlyPrice}
                </span>
                <span className="text-sm text-muted-foreground">/ month</span>
              </div>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {plan.description}
              </p>

              <Button
                asChild
                className={cn(
                  "mt-6 w-full rounded-full py-6 text-sm font-medium transition-all duration-300",
                  plan.featured
                    ? "bg-primary shadow-[0_18px_40px_-18px_rgba(56,125,78,0.6)] hover:shadow-[0_24px_50px_-12px_rgba(56,125,78,0.7)]"
                    : ""
                )}
                variant={plan.featured ? "default" : "outline"}
              >
                <Link
                  href={
                    plan.monthlyPrice === 0
                      ? props.ctaHref ?? "/login"
                      : `/checkout/start?plan=${plan.key}`
                  }
                  className="group/btn flex items-center justify-center gap-2"
                >
                  {plan.monthlyPrice === 0 ? "Start free" : "Checkout as guest"}
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </Link>
              </Button>
            </div>

            <div className="flex-1 p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                What&apos;s included
              </p>
              <ul className="mt-4 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check className="size-3 text-primary" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              {yearlySavings > 0 && (
                <div className="mt-6 rounded-xl bg-primary/5 px-4 py-3 text-xs text-primary">
                  Save ${yearlySavings}/year with annual billing
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
