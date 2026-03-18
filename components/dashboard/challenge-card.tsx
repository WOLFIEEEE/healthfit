"use client";

import { Calendar, Target, Users, Trophy, Loader2 } from "lucide-react";
import { useState } from "react";

type ChallengeCardProps = {
  challenge: {
    id: string;
    title: string;
    description: string;
    type: string;
    metric: string;
    targetValue: number;
    startDate: string;
    endDate: string;
    participantCount?: number;
  };
  participation?: {
    currentValue: number;
    completedAt: string | null;
  } | null;
  onJoin?: (challengeId: string) => Promise<void>;
};

export function ChallengeCard({
  challenge,
  participation,
  onJoin,
}: ChallengeCardProps) {
  const [joining, setJoining] = useState(false);
  const isJoined = !!participation;
  const isCompleted = !!participation?.completedAt;
  const progress = participation
    ? Math.min(
        100,
        Math.round((participation.currentValue / challenge.targetValue) * 100)
      )
    : 0;

  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(challenge.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  );

  async function handleJoin() {
    if (!onJoin || joining) return;
    setJoining(true);
    try {
      await onJoin(challenge.id);
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="surface-card rounded-[1.75rem] p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold leading-tight truncate">
            {challenge.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {challenge.description}
          </p>
        </div>
        {isCompleted && (
          <Trophy className="size-5 shrink-0 text-yellow-500" />
        )}
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Target className="size-3.5" />
          {challenge.targetValue} {challenge.metric}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="size-3.5" />
          {daysLeft} days left
        </span>
        {challenge.participantCount !== undefined && (
          <span className="flex items-center gap-1">
            <Users className="size-3.5" />
            {challenge.participantCount} joined
          </span>
        )}
      </div>

      {isJoined && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {participation.currentValue} / {challenge.targetValue}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {!isJoined && onJoin && (
        <button
          onClick={handleJoin}
          disabled={joining}
          className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {joining && <Loader2 className="size-4 animate-spin" />}
          Join Challenge
        </button>
      )}
    </div>
  );
}
