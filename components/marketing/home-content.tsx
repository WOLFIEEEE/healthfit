"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  BellRing,
  CreditCard,
  HeartPulse,
  LayoutDashboard,
  NotebookText,
  ShieldCheck,
  Sparkles,
  Target,
  Activity,
  Dumbbell,
  Apple,
  Brain,
  ChevronRight,
} from "lucide-react";
import { PricingGrid } from "@/components/marketing/pricing-grid";
import { MagneticButton } from "@/components/animations/magnetic-button";
import { HeroAnimation } from "@/components/animations/hero-animation";
import { HeroVideo } from "@/components/animations/hero-video";
import {
  Reveal,
  StaggerReveal,
  TextReveal,
  ImageReveal,
  CountUp,
  ParallaxImage,
  ScaleReveal,
} from "@/components/animations/reveal";

const highlights = [
  {
    title: "Adaptive coaching",
    copy: "Workouts, nutrition, habits, and check-ins in one system so guidance stays connected.",
    icon: Sparkles,
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
  },
  {
    title: "Progress you can feel",
    copy: "Track adherence, energy, hydration, meals, and trend lines instead of relying on motivation.",
    icon: Target,
    image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80",
  },
  {
    title: "Wellness-first safety",
    copy: "Staying in the wellness lane with non-clinical boundaries and caution prompts for sensitive topics.",
    icon: ShieldCheck,
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
  },
];

const platformLayers = [
  {
    title: "Member control center",
    copy: "Protected routes, onboarding gating, and a unified dashboard shell.",
    icon: LayoutDashboard,
  },
  {
    title: "Billing & entitlements",
    copy: "Starter, Pro, and Elite with plan cards, invoice history, and upgrade paths.",
    icon: CreditCard,
  },
  {
    title: "Editorial engine",
    copy: "Blog, articles, news, and guides publish through Sanity without code deploys.",
    icon: NotebookText,
  },
  {
    title: "Lifecycle support",
    copy: "Notifications, trust pages, and admin surfaces for growing membership.",
    icon: BellRing,
  },
];

const journeySteps = [
  {
    num: "01",
    title: "Set your foundation",
    copy: "Onboarding captures goals, equipment, schedule, macros, and limitations.",
    image: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=600&q=80",
  },
  {
    num: "02",
    title: "Follow your program",
    copy: "A weekly program translates inputs into training days, meal focus, and habit anchors.",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80",
  },
  {
    num: "03",
    title: "Track and reflect",
    copy: "Logs and check-ins keep the dashboard, coach context, and progress trends current.",
    image: "https://images.unsplash.com/photo-1486218119243-13883505764c?w=600&q=80",
  },
  {
    num: "04",
    title: "Level up",
    copy: "Billing and entitlements unlock higher-touch coaching without changing the core loop.",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80",
  },
];

const stats = [
  { value: 7, suffix: "-day", label: "Guided onboarding experience" },
  { value: 3, suffix: " layers", label: "Workouts, nutrition & habits" },
  { value: 100, suffix: "%", label: "SaaS-ready infrastructure" },
];

type ContentItem = {
  _type: string;
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt?: string;
};

export function HomeContent({
  featured,
  settings,
  featuredResources,
}: {
  featured: ContentItem[];
  settings: { contentHubEyebrow?: string; contentHubHeading?: string; contentHubDescription?: string } | null;
  featuredResources: Array<{ slug: string; title: string; description: string; category: string; [key: string]: unknown }>;
}) {
  return (
    <>
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative h-screen overflow-hidden">
        {/* Video background + controls */}
        <HeroVideo />
        {/* Gradient — heavier at bottom where text lives */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

        <HeroAnimation>
          <div className="page-shell relative flex h-screen flex-col justify-end pb-14 sm:pb-20">
            {/* Bottom-anchored content */}
            <div>
              <div
                data-hero-pill
                className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm"
              >
                Wellness SaaS
              </div>

              <div data-hero-heading className="mt-5">
                <div className="overflow-hidden">
                  <h1 className="line-inner font-[var(--font-display)] text-5xl font-bold leading-[1.0] tracking-tight text-white sm:text-7xl md:text-8xl lg:text-9xl">
                    Health routines
                  </h1>
                </div>
                <div className="overflow-hidden">
                  <h1 className="line-inner font-[var(--font-display)] text-5xl font-bold leading-[1.0] tracking-tight text-white sm:text-7xl md:text-8xl lg:text-9xl">
                    that feel{" "}
                    <span className="text-emerald-400">grounded.</span>
                  </h1>
                </div>
              </div>

              {/* Bottom row: subtext + CTAs left, stats right */}
              <div className="mt-6 flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
                <div className="max-w-md">
                  <p
                    data-hero-text
                    className="text-sm leading-relaxed text-white/50 sm:text-base"
                  >
                    Workouts, nutrition, habits, AI coaching, and progress
                    check-ins — all in one clean dashboard.
                  </p>

                  <div className="mt-5 flex items-center gap-3">
                    <MagneticButton>
                      <Link
                        href="/login"
                        data-hero-cta
                        className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:bg-emerald-400 hover:text-white"
                      >
                        Start free
                        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    </MagneticButton>
                    <Link
                      href="#product"
                      data-hero-cta
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white/70 transition-all duration-300 hover:border-white/40 hover:text-white"
                    >
                      Learn more
                    </Link>
                  </div>
                </div>

                {/* Stats — right side */}
                <div className="flex items-center gap-8">
                  {stats.map((stat, i) => (
                    <div key={stat.label} data-hero-stat className="text-left">
                      <div className="text-xl font-semibold text-white sm:text-2xl">
                        <CountUp
                          end={stat.value}
                          suffix={stat.suffix}
                          duration={2 + i * 0.3}
                        />
                      </div>
                      <p className="mt-0.5 text-[11px] uppercase tracking-wider text-white/40">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </HeroAnimation>
      </section>

      {/* ═══════════════ PRODUCT HIGHLIGHTS ═══════════════ */}
      <section id="product" className="page-shell py-20">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <Reveal>
              <p className="pill">Product system</p>
            </Reveal>
            <TextReveal className="mt-4" delay={0.1}>
              <h2 className="text-4xl font-semibold leading-tight sm:text-5xl">
                A complete wellness operating system
              </h2>
            </TextReveal>
            <Reveal delay={0.2}>
              <p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground sm:text-base">
                Onboarding, adaptive weekly programs, nutrition tracking, habit
                loops, check-ins, billing, and a wellness-bounded AI coach
                inside one clean dashboard.
              </p>
            </Reveal>

            <StaggerReveal className="mt-10 space-y-4" staggerDelay={0.1}>
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="group flex gap-5 rounded-2xl border border-border/40 bg-white/60 p-5 transition-all duration-500 hover:border-primary/20 hover:bg-white hover:shadow-[0_20px_60px_-30px_rgba(46,114,78,0.2)]"
                  >
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.copy}
                      </p>
                    </div>
                  </div>
                );
              })}
            </StaggerReveal>
          </div>

          <div className="relative">
            <ImageReveal
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=85"
              alt="Wellness tracking"
              className="aspect-[4/5] rounded-[2rem]"
            />
            <Reveal delay={0.5} y={30}>
              <div className="absolute -bottom-6 -left-6 rounded-2xl border border-border/50 bg-white/90 px-6 py-5 shadow-xl backdrop-blur-xl sm:-left-12">
                <div className="flex items-center gap-4">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50">
                    <Activity className="size-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Weekly adherence</p>
                    <p className="text-3xl font-semibold">94%</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════ IMAGE BREAK - FULL WIDTH ═══════════════ */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <ParallaxImage
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80"
          alt="Fitness lifestyle"
          className="absolute inset-0"
          speed={0.2}
        />
        <div className="absolute inset-0 bg-foreground/40" />
        <div className="relative flex h-full items-center justify-center">
          <Reveal>
            <div className="text-center">
              <h2 className="text-4xl font-semibold text-white sm:text-6xl">
                Your routine, elevated.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm text-white/70 sm:text-base">
                Every feature designed to make health routines feel guided,
                grounded, and genuinely repeatable.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════ MEMBER JOURNEY ═══════════════ */}
      <section id="programs" className="page-shell py-20">
        <div className="text-center">
          <Reveal>
            <p className="pill mx-auto">Member journey</p>
          </Reveal>
          <TextReveal className="mt-4" delay={0.1}>
            <h2 className="text-4xl font-semibold sm:text-5xl">
              From onboarding to coaching
            </h2>
          </TextReveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Each step feeds the next. Start with goals, turn them into a
              weekly plan, log daily, and let the coach context stay grounded in
              your actual behavior.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {journeySteps.map((step, i) => (
            <Reveal key={step.num} delay={i * 0.1}>
              <div className="group relative overflow-hidden rounded-[2rem] bg-white transition-all duration-500 hover-lift">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
                    {step.num}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {step.copy}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════ PLATFORM LAYERS ═══════════════ */}
      <section id="platform" className="py-20">
        <div className="page-shell">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <ImageReveal
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80"
                  alt="SaaS dashboard"
                  className="col-span-2 aspect-[16/9] rounded-[2rem]"
                />
                <ImageReveal
                  src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&q=80"
                  alt="Health tracking"
                  className="aspect-square rounded-[2rem]"
                  delay={0.2}
                />
                <ImageReveal
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80"
                  alt="Workout routine"
                  className="aspect-square rounded-[2rem]"
                  delay={0.3}
                />
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <Reveal>
                <p className="pill">Platform layer</p>
              </Reveal>
              <TextReveal className="mt-4" delay={0.1}>
                <h2 className="text-4xl font-semibold leading-tight sm:text-5xl">
                  Built like a real SaaS product
                </h2>
              </TextReveal>
              <Reveal delay={0.2}>
                <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                  Account structure, billing, content publishing, trust pages,
                  and operational surfaces that can grow with usage.
                </p>
              </Reveal>

              <StaggerReveal className="mt-10 grid gap-4 sm:grid-cols-2" staggerDelay={0.1}>
                {platformLayers.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="group rounded-2xl border border-border/40 bg-white/60 p-5 transition-all duration-400 hover:border-primary/20 hover:bg-white hover:shadow-[0_16px_40px_-20px_rgba(46,114,78,0.18)]"
                    >
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/8 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                        <Icon className="size-5" />
                      </div>
                      <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.copy}
                      </p>
                    </div>
                  );
                })}
              </StaggerReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ BIG IMAGE + QUOTE ═══════════════ */}
      <section className="page-shell py-10">
        <ScaleReveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-foreground p-8 sm:p-14">
            <div className="absolute inset-0 opacity-20">
              <Image
                src="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=70"
                alt="Background"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-3xl font-semibold text-white sm:text-5xl">
                  Designed for wellness,
                  <br />
                  not diagnosis.
                </h2>
                <p className="mt-6 max-w-md text-sm leading-7 text-white/60">
                  The product is intentionally opinionated about guardrails: no
                  diagnosis, no treatment claims, and caution messaging for
                  safety-sensitive prompts.
                </p>
                <MagneticButton className="mt-8">
                  <Link
                    href="/login"
                    className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-foreground transition-all duration-300 hover:bg-primary hover:text-white"
                  >
                    Join the wellness community
                    <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </MagneticButton>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: HeartPulse, label: "Wellness-bounded AI", value: "100%" },
                  { icon: ShieldCheck, label: "Safety guardrails", value: "Active" },
                  { icon: Brain, label: "Coach sessions/day", value: "25-100" },
                  { icon: Activity, label: "Progress tracking", value: "Real-time" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
                    >
                      <Icon className="size-5 text-emerald-400" />
                      <p className="mt-3 text-2xl font-semibold text-white">
                        {item.value}
                      </p>
                      <p className="mt-1 text-xs text-white/50">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ScaleReveal>
      </section>

      {/* ═══════════════ RESOURCES ═══════════════ */}
      <section className="page-shell py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Reveal>
              <p className="pill">Resources</p>
            </Reveal>
            <TextReveal className="mt-4" delay={0.1}>
              <h2 className="text-4xl font-semibold">
                Research-backed wellness guidance
              </h2>
            </TextReveal>
            <Reveal delay={0.2}>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                Our public library covers movement, nutrition, recovery, and
                habit topics using official guidance from CDC, NIH, USDA, FDA,
                and HHS.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.3}>
            <Link
              href="/resources"
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-5 py-3 text-sm font-medium transition-all duration-300 hover:border-primary/30 hover:bg-white"
            >
              Explore resource hub
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        <StaggerReveal className="mt-10 grid gap-6 lg:grid-cols-3" staggerDelay={0.12}>
          {featuredResources.map((resource) => (
            <Link
              key={resource.slug}
              href={`/resources/${resource.slug}`}
              className="group overflow-hidden rounded-[2rem] border border-border/40 bg-white/60 transition-all duration-500 hover-lift"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={
                    resource.category === "Movement"
                      ? "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&q=80"
                      : resource.category === "Nutrition"
                        ? "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80"
                        : "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&q=80"
                  }
                  alt={resource.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                  {resource.category}
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold transition-colors group-hover:text-primary">
                  {resource.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {resource.description}
                </p>
              </div>
            </Link>
          ))}
        </StaggerReveal>
      </section>

      {/* ═══════════════ EDITORIAL ═══════════════ */}
      {featured.length > 0 && (
        <section className="page-shell py-10">
          <Reveal>
            <p className="pill">
              {settings?.contentHubEyebrow ?? "Editorial"}
            </p>
          </Reveal>
          <TextReveal className="mt-4" delay={0.1}>
            <h2 className="text-4xl font-semibold">
              {settings?.contentHubHeading ?? "Stories, insights, and updates"}
            </h2>
          </TextReveal>
          <Reveal delay={0.2}>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
              {settings?.contentHubDescription ??
                "A dedicated editorial layer with separate content types, flowing directly from our CMS."}
            </p>
          </Reveal>
          <StaggerReveal className="mt-10 grid gap-6 lg:grid-cols-3" staggerDelay={0.12}>
            {featured.slice(0, 3).map((item) => (
              <Link
                key={item.slug}
                href={`/${item._type === "post" ? "blog" : item._type === "article" ? "articles" : item._type === "newsItem" ? "news" : "guides"}/${item.slug}`}
                className="group rounded-[2rem] border border-border/40 bg-white/60 p-5 transition-all duration-500 hover-lift"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {item._type === "post" ? "Blog" : item._type === "article" ? "Article" : item._type === "newsItem" ? "News" : "Guide"}
                  </span>
                  {item.publishedAt && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.publishedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-lg font-semibold transition-colors group-hover:text-primary">
                  {item.title}
                </h3>
                {item.excerpt && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {item.excerpt}
                  </p>
                )}
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Read more
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </StaggerReveal>
          <Reveal delay={0.3}>
            <div className="mt-8 text-center">
              <Link
                href="/insights"
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium transition-all hover:border-primary/30 hover:bg-white"
              >
                View all content
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </Reveal>
        </section>
      )}

      {/* ═══════════════ PRICING ═══════════════ */}
      <section id="pricing" className="page-shell py-20">
        <div className="text-center">
          <Reveal>
            <p className="pill mx-auto">Pricing</p>
          </Reveal>
          <TextReveal className="mt-4" delay={0.1}>
            <h2 className="text-4xl font-semibold sm:text-5xl">
              Simple, transparent pricing
            </h2>
          </TextReveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              Starter keeps the core dashboard accessible. Pro and Elite add AI
              guidance, deeper analytics, and premium program support.
            </p>
          </Reveal>
        </div>
        <div className="mt-14">
          <PricingGrid />
        </div>
      </section>

      {/* ═══════════════ BOTTOM IMAGE BANNER ═══════════════ */}
      <section className="page-shell py-10">
        <ScaleReveal>
          <div className="relative overflow-hidden rounded-[2.5rem]">
            <Image
              src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&q=80"
              alt="Community wellness"
              width={1200}
              height={500}
              className="h-[400px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
            <div className="absolute inset-0 flex items-center px-8 sm:px-14">
              <div className="max-w-lg">
                <h2 className="text-3xl font-semibold text-white sm:text-5xl">
                  More polish layering in next.
                </h2>
                <p className="mt-4 text-sm leading-7 text-white/70">
                  Usage meters, lifecycle emails, deeper analytics, saved coach
                  prompts, richer support tooling, and stronger admin reporting.
                </p>
                <MagneticButton className="mt-6">
                  <Link
                    href="/login"
                    className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-primary hover:text-white"
                  >
                    Get early access
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </MagneticButton>
              </div>
            </div>
          </div>
        </ScaleReveal>
      </section>
    </>
  );
}
