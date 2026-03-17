"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BrandMark } from "@/components/healthfit/brand-mark";
import { ArrowUpRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const productLinks = [
  { label: "Pricing", href: "/#pricing" },
  { label: "Programs", href: "/#programs" },
  { label: "Resources", href: "/resources" },
  { label: "Dashboard", href: "/dashboard/overview" },
];

const insightLinks = [
  { label: "Insights", href: "/insights" },
  { label: "Blog", href: "/blog" },
  { label: "News", href: "/news" },
  { label: "Resources", href: "/resources" },
];

const trustLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Billing policy", href: "/billing-policy" },
  { label: "Disclaimer", href: "/disclaimer" },
  { label: "Contact", href: "/contact" },
];

export function SiteFooter() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.fromTo(
      el.querySelectorAll("[data-footer-col]"),
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill();
      });
    };
  }, []);

  return (
    <footer ref={ref} className="page-shell pb-10 pt-20">
      {/* Top CTA bar */}
      <div className="mb-12 overflow-hidden rounded-[2rem] bg-foreground p-8 sm:p-12">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Ready to build a healthier routine?
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-7 text-white/60">
              Join thousands of members using Healthfit.ai to track, improve, and
              maintain their wellness goals.
            </p>
          </div>
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-foreground transition-all duration-300 hover:bg-primary hover:text-white hover:shadow-[0_20px_50px_-12px_rgba(56,125,78,0.5)]"
          >
            Get started today
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* Footer grid */}
      <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr_0.7fr_0.7fr]">
        <div data-footer-col>
          <BrandMark />
          <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
            Healthfit.ai helps members build healthier routines through wellness
            guidance, adaptive planning, and accountable progress tracking.
          </p>
        </div>

        <div data-footer-col>
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Product
          </p>
          <div className="mt-5 space-y-3">
            {productLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
              >
                {item.label}
                <ArrowUpRight className="size-3 opacity-0 transition-all duration-200 group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </div>

        <div data-footer-col>
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Insights
          </p>
          <div className="mt-5 space-y-3">
            {insightLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
              >
                {item.label}
                <ArrowUpRight className="size-3 opacity-0 transition-all duration-200 group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </div>

        <div data-footer-col>
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Trust center
          </p>
          <div className="mt-5 space-y-3">
            {trustLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
              >
                {item.label}
                <ArrowUpRight className="size-3 opacity-0 transition-all duration-200 group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 sm:flex-row">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Healthfit.ai. Wellness guidance only.
        </p>
        <div className="flex items-center gap-6">
          <span className="inline-flex size-2 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-xs text-muted-foreground">All systems operational</span>
        </div>
      </div>
    </footer>
  );
}
