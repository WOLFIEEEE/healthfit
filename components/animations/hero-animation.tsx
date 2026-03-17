"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

export function HeroAnimation({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    tl.fromTo(
      el.querySelectorAll("[data-hero-pill]"),
      { opacity: 0, y: 20, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8 }
    )
      .fromTo(
        el.querySelectorAll("[data-hero-heading] .line-inner"),
        { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.2, stagger: 0.1 },
        "-=0.4"
      )
      .fromTo(
        el.querySelectorAll("[data-hero-text]"),
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.9 },
        "-=0.7"
      )
      .fromTo(
        el.querySelectorAll("[data-hero-cta]"),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 },
        "-=0.5"
      )
      .fromTo(
        el.querySelectorAll("[data-hero-image]"),
        { clipPath: "inset(100% 0 0 0)", opacity: 0 },
        {
          clipPath: "inset(0% 0 0 0)",
          opacity: 1,
          duration: 1.4,
          ease: "power4.inOut",
        },
        "-=1.0"
      )
      .fromTo(
        el.querySelectorAll("[data-hero-stat]"),
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.08 },
        "-=0.8"
      )
      .fromTo(
        el.querySelectorAll("[data-hero-float]"),
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.9, stagger: 0.15 },
        "-=0.6"
      );
  }, []);

  return <div ref={ref}>{children}</div>;
}

export function FloatingElement({
  children,
  className,
  amplitude = 15,
  duration = 4,
}: {
  children: React.ReactNode;
  className?: string;
  amplitude?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.to(el, {
      y: amplitude,
      duration,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });

    return () => {
      gsap.killTweensOf(el);
    };
  }, [amplitude, duration]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export function CursorFollower() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      gsap.to(el, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.8,
        ease: "power2.out",
      });
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed left-0 top-0 z-50 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 mix-blend-multiply backdrop-blur-sm"
      style={{ willChange: "transform" }}
    />
  );
}
