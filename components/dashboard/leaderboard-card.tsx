"use client";

import { Crown, Medal } from "lucide-react";

type LeaderboardEntry = {
  userId: string;
  displayName: string;
  value: number;
  rank?: number;
  avatarUrl?: string | null;
};

type LeaderboardCardProps = {
  entries: LeaderboardEntry[];
  metric: string;
  currentUserId?: string;
};

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="size-4 text-yellow-500" />;
  if (rank === 2) return <Medal className="size-4 text-gray-400" />;
  if (rank === 3) return <Medal className="size-4 text-amber-600" />;
  return (
    <span className="text-xs font-medium text-muted-foreground w-4 text-center">
      {rank}
    </span>
  );
}

export function LeaderboardCard({
  entries,
  metric,
  currentUserId,
}: LeaderboardCardProps) {
  return (
    <div className="surface-card rounded-[1.75rem] p-6">
      <h3 className="text-base font-semibold">Leaderboard</h3>
      <p className="mt-1 text-xs text-muted-foreground capitalize">{metric}</p>

      <div className="mt-5 space-y-1">
        {entries.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No entries yet this week.
          </p>
        )}

        {entries.map((entry, index) => {
          const rank = entry.rank ?? index + 1;
          const isCurrentUser = entry.userId === currentUserId;

          return (
            <div
              key={entry.userId}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors ${
                isCurrentUser
                  ? "bg-primary/10 ring-1 ring-primary/20"
                  : "hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-center w-6">
                {getRankIcon(rank)}
              </div>

              {entry.avatarUrl ? (
                <img
                  src={entry.avatarUrl}
                  alt=""
                  className="size-8 rounded-full object-cover"
                />
              ) : (
                <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                  {entry.displayName.charAt(0).toUpperCase()}
                </div>
              )}

              <span className="flex-1 truncate text-sm font-medium">
                {entry.displayName}
                {isCurrentUser && (
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    (you)
                  </span>
                )}
              </span>

              <span className="text-sm font-semibold tabular-nums">
                {entry.value.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
