import { eq } from "drizzle-orm";
import { db } from "@/lib/drizzle/client";
import {
  onboardingTourProgress,
  users,
  type SelectOnboardingTourProgress,
} from "@/lib/drizzle/schema";
import { createId } from "@/lib/healthfit/ids";

export async function getTourProgress(
  userId: string
): Promise<SelectOnboardingTourProgress> {
  const existing = await db.query.onboardingTourProgress.findFirst({
    where: eq(onboardingTourProgress.userId, userId),
  });

  if (existing) return existing;

  const now = new Date().toISOString();

  const [created] = await db
    .insert(onboardingTourProgress)
    .values({
      id: createId("tour"),
      userId,
      completedSteps: [],
      tourCompleted: false,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return created;
}

export async function markStepComplete(
  userId: string,
  step: string
): Promise<SelectOnboardingTourProgress> {
  const progress = await getTourProgress(userId);
  const currentSteps = (progress.completedSteps as string[]) ?? [];

  if (currentSteps.includes(step)) {
    return progress;
  }

  const updatedSteps = [...currentSteps, step];
  const now = new Date().toISOString();

  const [updated] = await db
    .update(onboardingTourProgress)
    .set({
      completedSteps: updatedSteps,
      lastStepAt: now,
      updatedAt: now,
    })
    .where(eq(onboardingTourProgress.userId, userId))
    .returning();

  return updated;
}

export async function markTourComplete(
  userId: string
): Promise<SelectOnboardingTourProgress> {
  const now = new Date().toISOString();

  const [updated] = await db
    .update(onboardingTourProgress)
    .set({
      tourCompleted: true,
      lastStepAt: now,
      updatedAt: now,
    })
    .where(eq(onboardingTourProgress.userId, userId))
    .returning();

  await db
    .update(users)
    .set({
      onboardingTourCompleted: true,
      updatedAt: now,
    })
    .where(eq(users.supabaseUserId, userId));

  return updated;
}
