import { Trophy, Users, Zap } from "lucide-react";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { LeaderboardCard } from "@/components/dashboard/leaderboard-card";
import { ChallengeCard } from "@/components/dashboard/challenge-card";
import { requireCurrentAppUser } from "@/lib/healthfit/server/auth";
import { getActiveChallenges } from "@/lib/healthfit/server/challenges";
import { db } from "@/lib/drizzle/client";
import { eq, desc } from "drizzle-orm";
import {
  leaderboardEntries,
  publicProfiles,
  challengeParticipants,
} from "@/lib/drizzle/schema";

export default async function CommunityPage() {
  const user = await requireCurrentAppUser();

  const [activeChallenges, topEntries] = await Promise.all([
    getActiveChallenges(),
    db.query.leaderboardEntries.findMany({
      orderBy: (e, { desc }) => [desc(e.value)],
      limit: 10,
      with: {
        user: {
          columns: {
            supabaseUserId: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    }),
  ]);

  // Get user participations for active challenges
  const userParticipations = await db.query.challengeParticipants.findMany({
    where: eq(challengeParticipants.userId, user.supabaseUserId),
  });

  const participationMap = new Map(
    userParticipations.map((p) => [
      p.challengeId,
      { currentValue: p.currentValue, completedAt: p.completedAt },
    ])
  );

  const leaderboardData = topEntries.map((entry, index) => ({
    userId: entry.userId,
    displayName:
      entry.user?.fullName ?? entry.user?.email?.split("@")[0] ?? "Member",
    value: entry.value,
    rank: entry.rank ?? index + 1,
    avatarUrl: entry.user?.avatarUrl ?? null,
  }));

  return (
    <div className="space-y-10">
      <section className="soft-panel grid gap-8 px-8 py-10 sm:px-10 2xl:grid-cols-[minmax(0,1.04fr)_minmax(24rem,0.96fr)] 2xl:gap-12">
        <div className="min-w-0">
          <p className="pill">Community</p>
          <h1 className="mt-5 text-4xl font-semibold sm:text-5xl">
            Together We Grow
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
            Join challenges, climb the leaderboard, and celebrate progress with
            fellow members. Every step counts.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <DashboardStatCard
            icon={Trophy}
            label="Active Challenges"
            value={`${activeChallenges.length}`}
            detail="Challenges you can join"
          />
          <DashboardStatCard
            icon={Users}
            label="Leaderboard"
            value={`${topEntries.length}`}
            detail="Members ranked this week"
          />
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold px-1">Active Challenges</h2>
          {activeChallenges.length === 0 && (
            <div className="surface-card rounded-[1.75rem] p-8 text-center">
              <Zap className="mx-auto size-8 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">
                No active challenges right now. Check back soon!
              </p>
            </div>
          )}
          {activeChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={{
                ...challenge,
                participantCount: challenge.participantCount,
              }}
              participation={participationMap.get(challenge.id) ?? null}
            />
          ))}
        </section>

        <section>
          <h2 className="text-lg font-semibold px-1 mb-4">Weekly Rankings</h2>
          <LeaderboardCard
            entries={leaderboardData}
            metric="xp earned"
            currentUserId={user.supabaseUserId}
          />
        </section>
      </div>
    </div>
  );
}
