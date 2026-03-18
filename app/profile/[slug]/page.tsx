import { notFound } from "next/navigation";
import { Award, Flame } from "lucide-react";
import { getPublicProfile } from "@/lib/healthfit/server/community";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PublicProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const profile = await getPublicProfile(slug);

  if (!profile) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="surface-card rounded-[1.75rem] p-8 text-center">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="mx-auto size-24 rounded-full object-cover ring-4 ring-primary/10"
            />
          ) : (
            <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
              {profile.displayName.charAt(0).toUpperCase()}
            </div>
          )}

          <h1 className="mt-5 text-2xl font-semibold">
            {profile.displayName}
          </h1>

          {profile.bio && (
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              {profile.bio}
            </p>
          )}
        </div>

        {profile.streaks.length > 0 && (
          <section className="mt-8">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Flame className="size-5 text-orange-500" />
              Streaks
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {profile.streaks.map((streak) => (
                <div
                  key={streak.category}
                  className="surface-card rounded-[1.75rem] p-4 text-center"
                >
                  <p className="text-2xl font-semibold tabular-nums">
                    {streak.currentStreak}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground capitalize">
                    {streak.category}
                  </p>
                  <p className="text-[11px] text-muted-foreground/70">
                    Best: {streak.longestStreak}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {profile.badges.length > 0 && (
          <section className="mt-8">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Award className="size-5 text-primary" />
              Badges
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {profile.badges.map((badge) => (
                <div
                  key={badge.slug}
                  className="surface-card rounded-[1.75rem] p-4 text-center"
                >
                  <div className="text-3xl">{badge.iconEmoji}</div>
                  <p className="mt-2 text-xs font-medium leading-tight">
                    {badge.name}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground capitalize">
                    {badge.tier}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
