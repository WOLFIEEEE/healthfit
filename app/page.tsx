import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  CreditCard,
  HeartPulse,
  LayoutDashboard,
  LifeBuoy,
  NotebookText,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { ContentListSection } from "@/components/content/content-list-section";
import { PricingGrid } from "@/components/marketing/pricing-grid";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { BrandMark } from "@/components/healthfit/brand-mark";
import { ResourceCard } from "@/components/resources/resource-card";
import { getFeaturedResources } from "@/lib/content/resources";
import { getContentHubData } from "@/sanity/lib/api";

const highlights = [
  {
    title: "Adaptive coaching",
    copy:
      "Healthfit.ai combines workouts, nutrition, habits, and check-ins in one system so guidance stays connected.",
    icon: Sparkles,
  },
  {
    title: "Progress you can feel",
    copy:
      "Track adherence, energy, hydration, meals, and trend lines instead of relying on motivation alone.",
    icon: Target,
  },
  {
    title: "Wellness-first safety",
    copy:
      "The product stays in the wellness lane with explicit non-clinical boundaries and caution prompts for sensitive topics.",
    icon: ShieldCheck,
  },
];

const platformLayers = [
  {
    title: "Member control center",
    copy:
      "Protected routes, onboarding gating, and a unified dashboard shell give members one place to manage their routine.",
    icon: LayoutDashboard,
  },
  {
    title: "Billing and entitlements",
    copy:
      "Starter, Pro, and Elite stay visible through plan cards, invoice history, and role-aware upgrade paths.",
    icon: CreditCard,
  },
  {
    title: "Editorial growth engine",
    copy:
      "Blog posts, articles, news, and guides publish through Sanity so growth content can scale without code deploys.",
    icon: NotebookText,
  },
  {
    title: "Lifecycle support",
    copy:
      "Notifications, trust pages, and admin review surfaces make the product feel managed as membership grows.",
    icon: BellRing,
  },
];

const workspaceSignals = [
  "Plan visibility, invoices, and billing controls stay inside the member account.",
  "Google sign-in, magic links, and protected dashboard routing keep the workspace polished.",
  "Sanity-backed editorial sections give the product a clean SEO and content growth layer.",
  "Admin, notifications, and safety-aware AI responses support operations behind the scenes.",
];

const featuredResources = getFeaturedResources();

export default async function Home() {
  const { settings, featured } = await getContentHubData();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="page-shell relative overflow-hidden py-16 sm:py-20">
          <div className="hero-grid absolute inset-x-4 inset-y-6 rounded-[2rem] opacity-60" />
          <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="space-y-7">
              <div className="pill">Consumer AI wellness SaaS</div>
              <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">
                Health routines that feel grounded, guided, and actually
                repeatable.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                Healthfit.ai gives members a clean home for weekly workouts,
                meal targets, habit consistency, AI coaching, and progress
                check-ins without pretending to be a medical service.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-[0_24px_42px_-22px_rgba(21,123,115,0.8)]"
                >
                  Start free
                  <ArrowRight className="ml-2 size-4" />
                </Link>
                <Link
                  href="#pricing"
                  className="inline-flex items-center rounded-full border border-border bg-white/70 px-5 py-3 text-sm font-medium"
                >
                  Explore plans
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["7-day", "guided onboarding-to-program experience"],
                  ["3 layers", "workouts, nutrition, and habits in one loop"],
                  ["SaaS-ready", "billing, CMS, and admin flows already connected"],
                ].map(([stat, label]) => (
                  <div key={stat} className="soft-panel px-4 py-4">
                    <div className="text-2xl font-semibold">{stat}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="soft-panel relative overflow-hidden px-6 py-6">
              <div className="brand-wash rounded-[1.75rem] p-5">
                <BrandMark />
                <div className="mt-6 grid gap-4">
                  <div className="surface-card p-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      Weekly focus
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">
                      Strength, recovery, and steady energy.
                    </h2>
                    <p className="mt-3 text-sm text-muted-foreground">
                      This week balances 3 training sessions, hydration nudges,
                      and simple high-protein plates.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[1.5rem] bg-foreground px-4 py-4 text-white">
                      <div className="flex items-center gap-2 text-white/70">
                        <HeartPulse className="size-4" />
                        Readiness
                      </div>
                      <div className="mt-3 text-4xl font-semibold">8.1</div>
                      <p className="mt-2 text-sm text-white/70">
                        Based on check-ins, sleep, and adherence.
                      </p>
                    </div>
                    <div className="surface-card px-4 py-4">
                      <p className="text-sm text-muted-foreground">
                        Workspace wins
                      </p>
                      <ul className="mt-3 space-y-2 text-sm text-foreground">
                        <li>Structured workouts and meal logging</li>
                        <li>Plan-aware billing and entitlements</li>
                        <li>Editorial engine and trust center</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="product" className="page-shell py-10">
          <div className="flex flex-col gap-4">
            <p className="pill">Product system</p>
            <h2 className="section-title">
              Built for members who want a complete wellness operating system.
            </h2>
            <p className="section-copy">
              The product combines onboarding, adaptive weekly programs, manual
              nutrition tracking, habit loops, check-ins, billing, and a
              wellness-bounded AI coach inside one clean dashboard.
            </p>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="soft-panel px-6 py-6">
                  <div className="inline-flex rounded-2xl bg-secondary p-3 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {item.copy}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="programs" className="page-shell py-10">
          <div className="soft-panel grid gap-6 px-6 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div>
              <p className="pill">Member journey</p>
              <h2 className="mt-5 text-4xl font-semibold">
                From onboarding to coaching, each step feeds the next.
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Healthfit.ai starts with goals, routines, and guardrails, then
                turns those inputs into a weekly plan, daily logging flow, and a
                coach context that stays grounded in your actual behavior.
              </p>
            </div>
            <div className="grid gap-4">
              {[
                "Onboarding captures goals, equipment, schedule, macros, and limitations.",
                "A weekly program translates that into training days, meal focus, and habit anchors.",
                "Logs and check-ins keep the dashboard, coach context, and progress trends current.",
                "Billing and entitlements unlock higher-touch coaching without changing the core product loop.",
              ].map((item, index) => (
                <div
                  key={item}
                  className="rounded-[1.5rem] border border-border/70 bg-white/80 px-4 py-4 text-sm text-muted-foreground"
                >
                  <span className="mr-2 font-semibold text-foreground">0{index + 1}</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="platform" className="page-shell py-10">
          <div className="flex flex-col gap-4">
            <p className="pill">Platform layer</p>
            <h2 className="section-title">
              Built to feel like a real SaaS product, not a one-page wellness app.
            </h2>
            <p className="section-copy">
              Healthfit.ai already has the foundations serious SaaS products need:
              account structure, billing, content publishing, trust pages, and
              operational surfaces that can grow with usage.
            </p>
          </div>
          <div className="mt-8 grid gap-5 xl:grid-cols-4">
            {platformLayers.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="soft-panel px-6 py-6">
                  <div className="inline-flex rounded-2xl bg-secondary p-3 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {item.copy}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="page-shell py-10">
          <div className="soft-panel grid gap-6 px-6 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
            <div>
              <p className="pill">Professional feel</p>
              <h2 className="mt-5 text-4xl font-semibold">
                The cleanest SaaS experiences make account state obvious.
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                That means members should immediately understand their plan,
                support lane, next action, and where product content lives.
                Healthfit.ai is now closer to that standard across both public
                and logged-in screens.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/dashboard/overview"
                  className="inline-flex items-center rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
                >
                  Open member workspace
                  <ArrowRight className="ml-2 size-4" />
                </Link>
                <Link
                  href="/insights"
                  className="inline-flex items-center rounded-full border border-border bg-white/70 px-5 py-3 text-sm font-medium"
                >
                  View content engine
                </Link>
              </div>
            </div>
            <div className="grid gap-4">
              {workspaceSignals.map((item) => (
                <div key={item} className="surface-card px-4 py-4 text-sm text-muted-foreground">
                  {item}
                </div>
              ))}
              <div className="brand-wash rounded-[1.5rem] px-4 py-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-3 text-foreground">
                  <LifeBuoy className="size-4 text-primary" />
                  <span className="font-medium">Support, trust, and growth stay connected.</span>
                </div>
                <p className="mt-3 leading-7">
                  Instead of separating marketing, billing, editorial, and member
                  workflows, the product now presents them as one coherent system.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="page-shell py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="pill">Resources</p>
              <h2 className="mt-4 text-4xl font-semibold">
                Research-backed public pages people can actually trust.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                Our public library covers movement, nutrition, recovery, and habit
                topics using official guidance from CDC, NIH, USDA, FDA, and HHS.
              </p>
            </div>
            <Link
              href="/resources"
              className="inline-flex items-center rounded-full border border-border bg-white/80 px-5 py-3 text-sm font-medium"
            >
              Explore resource hub
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {featuredResources.map((resource) => (
              <ResourceCard key={resource.slug} resource={resource} />
            ))}
          </div>
        </section>

        {featured.length ? (
          <ContentListSection
            eyebrow={settings?.contentHubEyebrow ?? "Editorial"}
            title={
              settings?.contentHubHeading ??
              "Blog, articles, news, and guides now flow directly from Sanity."
            }
            description={
              settings?.contentHubDescription ??
              "Healthfit.ai now has a dedicated editorial layer with separate content types and an embedded Studio so the public site can grow without hardcoded pages."
            }
            items={featured.slice(0, 3)}
            href="/insights"
          />
        ) : null}

        <section id="pricing" className="page-shell py-10">
          <div className="mb-8">
            <p className="pill">Pricing</p>
            <h2 className="mt-4 text-4xl font-semibold">
              Upgrade from simple tracking to high-touch coaching.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
              Starter keeps the core dashboard accessible. Pro and Elite add AI
              guidance, deeper analytics, and premium program support.
            </p>
          </div>
          <PricingGrid />
        </section>

        <section id="trust" className="page-shell py-10">
          <div className="soft-panel grid gap-6 px-6 py-8 lg:grid-cols-2">
            <div>
              <p className="pill">Trust and safety</p>
              <h2 className="mt-5 text-4xl font-semibold">
                Designed for wellness, not diagnosis.
              </h2>
            </div>
            <div className="space-y-4 text-sm leading-7 text-muted-foreground">
              <p>
                Healthfit.ai provides wellness guidance only. The product is
                intentionally opinionated about guardrails: no diagnosis, no
                treatment claims, and caution messaging for urgent or
                safety-sensitive prompts.
              </p>
              <p>
                Members still get a polished SaaS experience with onboarding,
                progress tracking, billing, admin tooling, legal pages, and a
                data model built for accountability.
              </p>
            </div>
          </div>
        </section>

        <section className="page-shell py-10">
          <div className="soft-panel brand-wash grid gap-6 px-6 py-8 lg:grid-cols-[1fr_0.9fr] lg:px-8">
            <div>
              <p className="pill">Next level polish</p>
              <h2 className="mt-5 text-4xl font-semibold">
                More SaaS-friendly additions we can keep layering in next.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                The most valuable next steps are usage meters, member lifecycle
                emails, deeper analytics, saved coach prompts, richer support
                tooling, and stronger admin reporting across the member base.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Usage meters for AI coaching and active goals",
                "Saved templates for meals, workouts, and check-ins",
                "Lifecycle email automation for nudges and plan changes",
                "Support inbox, announcement center, and health score reporting",
              ].map((item) => (
                <div key={item} className="surface-card px-4 py-4 text-sm text-muted-foreground">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
