import { eq, and, count } from "drizzle-orm";
import { db } from "@/lib/drizzle/client";
import {
  memberProfiles,
  referrals,
  type SelectReferral,
} from "@/lib/drizzle/schema";
import { createId } from "@/lib/healthfit/ids";

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "HF-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function ensureReferralCode(userId: string): Promise<string> {
  const profile = await db.query.memberProfiles.findFirst({
    where: eq(memberProfiles.userId, userId),
    columns: { referralCode: true },
  });

  if (profile?.referralCode) {
    return profile.referralCode;
  }

  const code = generateReferralCode();

  await db
    .update(memberProfiles)
    .set({
      referralCode: code,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(memberProfiles.userId, userId));

  return code;
}

type ReferralStats = {
  pending: number;
  signed_up: number;
  converted: number;
  total: number;
};

export async function getReferralStats(userId: string): Promise<ReferralStats> {
  const allReferrals = await db.query.referrals.findMany({
    where: eq(referrals.referrerUserId, userId),
    columns: { status: true },
  });

  const stats: ReferralStats = {
    pending: 0,
    signed_up: 0,
    converted: 0,
    total: allReferrals.length,
  };

  for (const r of allReferrals) {
    if (r.status === "pending") stats.pending++;
    else if (r.status === "signed_up") stats.signed_up++;
    else if (r.status === "converted") stats.converted++;
  }

  return stats;
}

export async function claimReferral(
  referredUserId: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const existingReferral = await db.query.referrals.findFirst({
    where: eq(referrals.referredUserId, referredUserId),
  });

  if (existingReferral) {
    return { success: false, error: "User has already been referred" };
  }

  const referrerProfile = await db.query.memberProfiles.findFirst({
    where: eq(memberProfiles.referralCode, code),
    columns: { userId: true },
  });

  if (!referrerProfile) {
    return { success: false, error: "Invalid referral code" };
  }

  if (referrerProfile.userId === referredUserId) {
    return { success: false, error: "Cannot refer yourself" };
  }

  const now = new Date().toISOString();

  await db.insert(referrals).values({
    id: createId("ref"),
    referrerUserId: referrerProfile.userId,
    referredEmail: "",
    referredUserId,
    code,
    status: "signed_up",
    rewardGranted: false,
    createdAt: now,
    updatedAt: now,
  });

  return { success: true };
}
