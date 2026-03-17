"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { marketingNav } from "@/lib/config/navigation";
import { BrandMark } from "@/components/healthfit/brand-mark";
import { MagneticButton } from "@/components/animations/magnetic-button";
import { Menu, X } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const header = headerRef.current;
    const inner = innerRef.current;
    if (!header || !inner) return;

    // Entrance — fade in from top
    gsap.fromTo(
      inner,
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, delay: 0.3, ease: "power3.out" }
    );

    // On scroll: switch from transparent to solid
    ScrollTrigger.create({
      start: "top -100",
      onEnter: () => setScrolled(true),
      onLeaveBack: () => setScrolled(false),
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8"
    >
      <div
        ref={innerRef}
        className={`mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-[1.75rem] px-5 py-3.5 transition-all duration-500 ${
          scrolled
            ? "border border-border/40 bg-white/85 shadow-[0_8px_40px_-12px_rgba(46,114,78,0.12)] backdrop-blur-xl"
            : "border border-transparent bg-transparent"
        }`}
      >
        {/* Logo — adapt color to scroll state */}
        <div className="flex items-center gap-4">
          <div
            className={`transition-opacity duration-500 ${
              scrolled ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <BrandMark compact />
          </div>
          <div
            className={`absolute transition-opacity duration-500 ${
              scrolled ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <Link
              href="/"
              className="font-[var(--font-display)] text-lg font-semibold tracking-tight text-white"
            >
              Healthfit.ai
            </Link>
          </div>
        </div>

        {/* Nav links */}
        <nav className="hidden items-center gap-1 md:flex">
          {marketingNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-2 text-sm transition-all duration-300 ${
                scrolled
                  ? "text-muted-foreground hover:bg-primary/8 hover:text-foreground"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-2">
          <MagneticButton>
            <Link
              href="/login"
              className={`hidden rounded-full px-4 py-2.5 text-sm font-medium transition-colors sm:inline-flex ${
                scrolled
                  ? "text-foreground hover:text-primary"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Sign in
            </Link>
          </MagneticButton>
          <MagneticButton>
            <Link
              href="/login"
              className="group relative inline-flex items-center overflow-hidden rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-[0_18px_36px_-22px_rgba(56,125,78,0.45)] transition-all duration-300 hover:shadow-[0_24px_50px_-16px_rgba(56,125,78,0.6)]"
            >
              <span className="relative z-10">Start free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-emerald-400 to-primary opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </Link>
          </MagneticButton>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`inline-flex items-center justify-center rounded-xl p-2 md:hidden ${
              scrolled ? "text-foreground" : "text-white"
            }`}
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="mx-auto mt-2 max-w-7xl rounded-[1.75rem] border border-border/40 bg-white/90 p-4 shadow-lg backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-1">
            {marketingNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-sm text-muted-foreground transition hover:bg-primary/8 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
