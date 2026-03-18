import { Award, Sparkles, Star } from "lucide-react";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { AchievementGrid } from "@/components/dashboard/achievement-grid";
import { requireCurrentAppUser } from "@/lib/healthfit/server/auth";
import {
  getAllAchievements,
  getUserAchievements,
} from "@/lib/healthfit/server/achievements";
import { db } from "@/lib/drizzle/client";
import { eq } from "drizzle-orm";
import { memberProfiles } from "@/lib/drizzle/schema";

export default async function AchievementsPage() {
  const user = await requireCurrentAppUser();

  const [allAchievements, earned, profile] = await Promise.all([
    getAllAchievements(),
    getUserAchievements(user.supabaseUserId),
    db.query.memberProfiles.findFirst({
      where: eq(memberProfiles.userId, user.supabaseUserId),
      columns: { xpTotal: true },
    }),
  ]);

  const xpTotal = profile?.xpTotal ?? 0;
  const earnedCount = earned.length;
  const totalCount = allAchievements.length;

  const earnedList = earned.map((ua) => ({
    achievementId: ua.achievementId,
    earnedAt: ua.earnedAt,
  }));

  const availableList = allAchievements.map((a) => ({
    id: a.id,
    slug: a.slug,
    name: a.name,
    description: a.description,
    iconEmoji: a.iconEmoji,
    tier: a.tier,
    xpValue: a.xpValue,
  }));

  return (
    <div className="space-y-10">
      <section className="soft-panel grid gap-8 px-8 py-10 sm:px-10 2xl:grid-cols-[minmax(0,1.04fr)_minmax(24rem,0.96fr)] 2xl:gap-12">
        <div className="min-w-0">
          <p className="pill">Achievements</p>
          <h1 className="mt-5 text-4xl font-semibold sm:text-5xl">
            Your Badges
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
            Earn badges by hitting milestones, maintaining streaks, and
            completing challenges. Each badge grants XP toward your profile
            level.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="pill">{xpTotal.toLocaleString()} XP earned</span>
            <span className="rounded-full border border-border/70 bg-white/75 px-3 py-1 text-xs font-medium text-muted-foreground">
              {earnedCount} of {totalCount} unlocked
            </span>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <DashboardStatCard
            icon={Sparkles}
            label="Total XP"
            value={xpTotal.toLocaleString()}
            detail="Lifetime experience points"
          />
          <DashboardStatCard
            icon={Award}
            label="Badges Earned"
            value={`${earnedCount}`}
            detail={`Out of ${totalCount} available`}
          />
          <DashboardStatCard
            icon={Star}
            label="Completion"
            value={
              totalCount > 0
                ? `${Math.round((earnedCount / totalCount) * 100)}%`
                : "0%"
            }
            detail="Badge collection progress"
          />
        </div>
      </section>

      <section className="soft-panel px-8 py-10 sm:px-10">
        <AchievementGrid earned={earnedList} available={availableList} />
      </section>
    </div>
  );
}
