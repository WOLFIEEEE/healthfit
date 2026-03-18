import { eq, and, count, gte, lte, desc } from "drizzle-orm";
import { db } from "@/lib/drizzle/client";
import {
  challenges,
  challengeParticipants,
  type SelectChallenge,
  type SelectChallengeParticipant,
} from "@/lib/drizzle/schema";
import { createId } from "@/lib/healthfit/ids";

type ChallengeWithCount = SelectChallenge & {
  participantCount: number;
};

export async function getActiveChallenges(): Promise<ChallengeWithCount[]> {
  const now = new Date().toISOString();

  const activeChallenges = await db.query.challenges.findMany({
    where: and(
      eq(challenges.status, "active"),
      lte(challenges.startDate, now),
      gte(challenges.endDate, now)
    ),
    orderBy: (c, { desc }) => [desc(c.createdAt)],
  });

  const result: ChallengeWithCount[] = [];

  for (const challenge of activeChallenges) {
    const [countResult] = await db
      .select({ total: count() })
      .from(challengeParticipants)
      .where(eq(challengeParticipants.challengeId, challenge.id));

    result.push({
      ...challenge,
      participantCount: countResult?.total ?? 0,
    });
  }

  return result;
}

type ChallengeDetail = SelectChallenge & {
  participants: Array<
    SelectChallengeParticipant & {
      displayName?: string;
    }
  >;
};

export async function getChallengeDetail(
  challengeId: string
): Promise<ChallengeDetail | null> {
  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
    with: {
      participants: {
        orderBy: (p, { desc }) => [desc(p.currentValue)],
      },
    },
  });

  if (!challenge) return null;

  return {
    ...challenge,
    participants: challenge.participants ?? [],
  };
}

export async function joinChallenge(
  userId: string,
  challengeId: string
): Promise<SelectChallengeParticipant> {
  const now = new Date().toISOString();

  const existing = await db.query.challengeParticipants.findFirst({
    where: and(
      eq(challengeParticipants.challengeId, challengeId),
      eq(challengeParticipants.userId, userId)
    ),
  });

  if (existing) {
    return existing;
  }

  const [participant] = await db
    .insert(challengeParticipants)
    .values({
      id: createId("cpart"),
      challengeId,
      userId,
      currentValue: 0,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return participant;
}

export async function updateChallengeProgress(
  userId: string,
  challengeId: string,
  increment: number
): Promise<{ currentValue: number; completed: boolean }> {
  const now = new Date().toISOString();

  const participant = await db.query.challengeParticipants.findFirst({
    where: and(
      eq(challengeParticipants.challengeId, challengeId),
      eq(challengeParticipants.userId, userId)
    ),
  });

  if (!participant) {
    throw new Error("Not a participant of this challenge");
  }

  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
  });

  if (!challenge) {
    throw new Error("Challenge not found");
  }

  const newValue = participant.currentValue + increment;
  const completed = newValue >= challenge.targetValue;

  await db
    .update(challengeParticipants)
    .set({
      currentValue: newValue,
      completedAt: completed && !participant.completedAt ? now : participant.completedAt,
      updatedAt: now,
    })
    .where(eq(challengeParticipants.id, participant.id));

  return { currentValue: newValue, completed };
}
