import Link from "next/link";
import {
  Activity,
  BadgeCheck,
  BrainCircuit,
  CalendarClock,
  Dumbbell,
  Flame,
  Gauge,
  ReceiptText,
  Sparkles,
  Target,
  WalletCards,
  Zap,
} from "lucide-react";
import { AIBriefCard } from "@/components/dashboard/ai-brief-card";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { InfoTooltip } from "@/components/dashboard/info-tooltip";
import { MembershipIntelligenceCard } from "@/components/dashboard/membership-intelligence-card";
import { getDashboardSnapshot } from "@/lib/healthfit/server/dashboard";
import { requireCurrentAppUser } from "@/lib/healthfit/server/auth";
import { getPremiumExperienceSnapshot } from "@/lib/healthfit/server/premium";
import { ProgressChart } from "@/components/dashboard/progress-chart";
import { WeeklyPerformanceCard } from "@/components/dashboard/weekly-performance-card";

function humanizeValue(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function overviewMetricIcon(label: string) {
  switch (label) {
    case "Plan":
      return Sparkles;
    case "Active goals":
      return Target;
    case "Readiness":
      return Gauge;
    case "Today's workouts":
      return Dumbbell;
    default:
      return Activity;
  }
}

export default async function OverviewPage() {
  const user = await requireCurrentAppUser();
  const [snapshot, premium] = await Promise.all([
    getDashboardSnapshot(user.supabaseUserId),
    getPremiumExperienceSnapshot(user.supabaseUserId),
  ]);
  const isAdmin = snapshot.user.role === "admin";
  const nextWorkoutDetails = snapshot.nextWorkout
    ? `${snapshot.nextWorkout.focus} • ${snapshot.nextWorkout.durationMin} min • ${snapshot.nextWorkout.dayLabel}`
    : "Log a workout or complete a check-in to build your next recommendation.";
  const nutritionDetail = [
    `${snapshot.todayNutrition.protein}g protein`,
    `${snapshot.todayNutrition.carbs}g carbs`,
    `${snapshot.todayNutrition.fat}g fat`,
    `${snapshot.todayNutrition.waterMl}ml water`,
  ].join(" • ");
  const habitsDetail =
    snapshot.habits.totalToday > 0
      ? `${snapshot.habits.completedToday}/${snapshot.habits.totalToday} habits completed today`
      : "No habits scheduled yet for today.";
  const aiCoachValue = premium.membership.aiUsage.unlimited
    ? "Unlimited"
    : premium.membership.aiUsage.limit > 0
      ? "Enabled"
      : "Locked";
  const goalLimitValue = premium.membership.goalUsage.unlimited
    ? "Unlimited"
    : `${premium.membership.goalUsage.limit}`;

  return (
    <div className="space-y-10">
      <section className="soft-panel grid gap-10 px-8 py-10 sm:px-10 xl:grid-cols-[minmax(0,1.12fr)_minmax(22rem,0.88fr)] 2xl:gap-12">
        <div className="min-w-0">
          <p className="pill">Overview</p>
          <h1 className="mt-5 text-4xl font-semibold sm:text-5xl">
            Welcome back, {snapshot.user.fullName.split(" ")[0]}.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            {snapshot.profile.goalSummary}
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
            {snapshot.metrics.map((metric) => (
              <DashboardStatCard
                key={metric.label}
                icon={overviewMetricIcon(metric.label)}
                label={metric.label}
                value={metric.value}
                detail={metric.helper}
              />
            ))}
          </div>
        </div>
        <div className="brand-wash min-w-0 rounded-[1.75rem] p-7 sm:p-8 xl:p-9">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Today&apos;s focus
              </p>
              <div className="mt-4 flex items-start gap-4">
                <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-primary shadow-[0_18px_42px_-28px_rgba(46,114,78,0.4)]">
                  <CalendarClock className="size-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-2xl font-semibold">
                    {snapshot.nextWorkout?.title ?? "Recovery and consistency"}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">{nextWorkoutDetails}</p>
                </div>
              </div>
            </div>
            <InfoTooltip content={nextWorkoutDetails} label="Today's focus details" />
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <DashboardStatCard
              icon={Flame}
              label="Nutrition today"
              value={`${snapshot.todayNutrition.calories} kcal`}
              detail={nutritionDetail}
              tone="brand"
            />
            <DashboardStatCard
              icon={BadgeCheck}
              label="Habits today"
              value={`${snapshot.habits.completionRate}%`}
              detail={habitsDetail}
              tone="inverse"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-10 2xl:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.92fr)] 2xl:gap-12">
        <WeeklyPerformanceCard brief={premium.weeklyBrief} />
        <MembershipIntelligenceCard membership={premium.membership} />
      </section>

      <AIBriefCard brief={snapshot.brief} />

      <section className="grid gap-8 2xl:grid-cols-3">
        <div className="soft-panel px-7 py-8">
          <p className="text-sm text-muted-foreground">Workspace status</p>
          <h2 className="mt-2 text-2xl font-semibold">{premium.membership.planName}</h2>
          <div className="mt-5 grid gap-4">
            <DashboardStatCard
              icon={WalletCards}
              label="Billing status"
              value={humanizeValue(snapshot.billing.status)}
              detail="Current billing state for this workspace."
            />
            <DashboardStatCard
              icon={CalendarClock}
              label="Next billing"
              value={
                snapshot.billing.nextBillingDate
                  ? new Date(snapshot.billing.nextBillingDate).toLocaleDateString()
                  : "No renewal"
              }
              detail={
                snapshot.billing.nextBillingDate
                  ? `Next charge scheduled for ${new Date(snapshot.billing.nextBillingDate).toLocaleDateString()}.`
                  : "There is no renewal scheduled on this account right now."
              }
            />
            <DashboardStatCard
              icon={ReceiptText}
              label="Invoice history"
              value={`${snapshot.billing.invoicesCount}`}
              detail="Recorded billing entries attached to this workspace."
            />
          </div>
        </div>
        <div className="soft-panel px-7 py-8">
          <p className="text-sm text-muted-foreground">Plan access</p>
          <h2 className="mt-2 text-2xl font-semibold">What&apos;s unlocked right now</h2>
          <div className="mt-5 grid gap-4">
            <DashboardStatCard
              icon={BrainCircuit}
              label="AI coach"
              value={aiCoachValue}
              detail={premium.membership.aiUsage.helper}
            />
            <DashboardStatCard
              icon={Target}
              label="Active goal limit"
              value={goalLimitValue}
              detail={premium.membership.goalUsage.helper}
            />
            <DashboardStatCard
              icon={Zap}
              label="Support lane"
              value={humanizeValue(premium.membership.supportLane)}
              detail={
                premium.membership.upgradePrompt ??
                "Your current plan is organized and ready for the next step when you need it."
              }
            />
          </div>
        </div>
        <div className="soft-panel px-7 py-8">
          <p className="text-sm text-muted-foreground">Quick actions</p>
          <h2 className="mt-2 text-2xl font-semibold">Move through the product faster</h2>
          <div className="mt-5 grid gap-4">
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
                className="surface-card px-5 py-4 text-sm font-medium text-foreground transition hover:border-primary/25 hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-10 2xl:grid-cols-[minmax(0,1.18fr)_minmax(22rem,0.82fr)] 2xl:gap-12">
        <ProgressChart data={snapshot.progress} />
        <div className="space-y-8">
          <div className="soft-panel px-6 py-6">
            <h3 className="text-xl font-semibold">Latest check-in</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              {snapshot.checkIn?.summary ??
                "No check-in yet. Use the check-ins tab to log mood, stress, sleep, and adherence."}
            </p>
          </div>
          <div className="soft-panel px-6 py-6">
            <h3 className="text-xl font-semibold">Notifications</h3>
            <div className="mt-5 space-y-4">
              {snapshot.notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No notifications yet. Onboarding, reminders, and billing updates will appear here.
                </p>
              ) : (
                snapshot.notifications.map((notification) => (
                  <div key={notification.id} className="surface-card px-5 py-5">
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
