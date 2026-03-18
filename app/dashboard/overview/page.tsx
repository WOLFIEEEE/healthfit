import Link from "next/link";
import { AIBriefCard } from "@/components/dashboard/ai-brief-card";
import { MembershipIntelligenceCard } from "@/components/dashboard/membership-intelligence-card";
import { getDashboardSnapshot } from "@/lib/healthfit/server/dashboard";
import { requireCurrentAppUser } from "@/lib/healthfit/server/auth";
import { getPremiumExperienceSnapshot } from "@/lib/healthfit/server/premium";
import { ProgressChart } from "@/components/dashboard/progress-chart";
import { WeeklyPerformanceCard } from "@/components/dashboard/weekly-performance-card";

export default async function OverviewPage() {
  const user = await requireCurrentAppUser();
  const [snapshot, premium] = await Promise.all([
    getDashboardSnapshot(user.supabaseUserId),
    getPremiumExperienceSnapshot(user.supabaseUserId),
  ]);
  const isAdmin = snapshot.user.role === "admin";

  return (
    <div className="space-y-6">
      <section className="soft-panel grid gap-6 px-6 py-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="pill">Overview</p>
          <h1 className="mt-4 text-4xl font-semibold">
            Welcome back, {snapshot.user.fullName.split(" ")[0]}.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            {snapshot.profile.goalSummary}
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {snapshot.metrics.map((metric) => (
              <div key={metric.label} className="surface-card px-4 py-4">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="mt-2 text-3xl font-semibold">{metric.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{metric.helper}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="brand-wash rounded-[1.75rem] p-5">
          <p className="text-sm text-muted-foreground">Today&apos;s focus</p>
          <h2 className="mt-2 text-2xl font-semibold">
            {snapshot.nextWorkout?.title ?? "Recovery and consistency"}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {snapshot.nextWorkout
              ? `${snapshot.nextWorkout.focus} • ${snapshot.nextWorkout.durationMin} min • ${snapshot.nextWorkout.dayLabel}`
              : "Log a workout or complete a check-in to build your next recommendation."}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="surface-card px-4 py-4">
              <p className="text-sm text-muted-foreground">Nutrition today</p>
              <p className="mt-2 text-2xl font-semibold">
                {snapshot.todayNutrition.calories} kcal
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {snapshot.todayNutrition.protein}g protein • {snapshot.todayNutrition.waterMl}ml water
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-foreground px-4 py-4 text-white">
              <p className="text-sm text-white/70">Habits today</p>
              <p className="mt-2 text-2xl font-semibold">
                {snapshot.habits.completionRate}%
              </p>
              <p className="mt-2 text-sm text-white/70">
                {snapshot.habits.completedToday}/{snapshot.habits.totalToday} completed
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <WeeklyPerformanceCard brief={premium.weeklyBrief} />
        <MembershipIntelligenceCard membership={premium.membership} />
      </section>

      <AIBriefCard brief={snapshot.brief} />

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="soft-panel px-5 py-5">
          <p className="text-sm text-muted-foreground">Workspace status</p>
          <h2 className="mt-2 text-2xl font-semibold">{premium.membership.planName}</h2>
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <div className="surface-card px-4 py-4">
              Billing status: {snapshot.billing.status}
            </div>
            <div className="surface-card px-4 py-4">
              Next billing:{" "}
              {snapshot.billing.nextBillingDate
                ? new Date(snapshot.billing.nextBillingDate).toLocaleDateString()
                : "No renewal scheduled"}
            </div>
            <div className="surface-card px-4 py-4">
              Invoice history: {snapshot.billing.invoicesCount} entries
            </div>
          </div>
        </div>
        <div className="soft-panel px-5 py-5">
          <p className="text-sm text-muted-foreground">Plan access</p>
          <h2 className="mt-2 text-2xl font-semibold">What&apos;s unlocked right now</h2>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <div className="surface-card px-4 py-4">
              AI coach: {premium.membership.aiUsage.unlimited ? "unlimited" : premium.membership.aiUsage.limit > 0 ? "enabled" : "upgrade required"}
            </div>
            <div className="surface-card px-4 py-4">
              Active goal limit: {premium.membership.goalUsage.unlimited ? "Unlimited" : premium.membership.goalUsage.limit}
            </div>
            <div className="surface-card px-4 py-4">
              Support lane: {premium.membership.supportLane}
            </div>
          </div>
        </div>
        <div className="soft-panel px-5 py-5">
          <p className="text-sm text-muted-foreground">Quick actions</p>
          <h2 className="mt-2 text-2xl font-semibold">Move through the product faster</h2>
          <div className="mt-4 grid gap-3">
            {[
              { label: "Open coach", href: "/dashboard/coach" },
              { label: "Log workout", href: "/dashboard/workouts" },
              { label: "Update nutrition", href: "/dashboard/nutrition" },
              { label: "Manage billing", href: "/dashboard/billing" },
              ...(isAdmin ? [{ label: "Open admin", href: "/admin" }] : []),
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="surface-card px-4 py-4 text-sm font-medium text-foreground transition hover:border-primary/25 hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ProgressChart data={snapshot.progress} />
        <div className="space-y-6">
          <div className="soft-panel px-5 py-5">
            <h3 className="text-xl font-semibold">Latest check-in</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              {snapshot.checkIn?.summary ??
                "No check-in yet. Use the check-ins tab to log mood, stress, sleep, and adherence."}
            </p>
          </div>
          <div className="soft-panel px-5 py-5">
            <h3 className="text-xl font-semibold">Notifications</h3>
            <div className="mt-4 space-y-3">
              {snapshot.notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No notifications yet. Onboarding, reminders, and billing updates will appear here.
                </p>
              ) : (
                snapshot.notifications.map((notification) => (
                  <div key={notification.id} className="surface-card px-4 py-4">
                    <p className="font-medium">{notification.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {notification.body}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
