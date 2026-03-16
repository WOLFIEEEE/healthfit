"use server";

import { eq } from "drizzle-orm";
import { createDodoCustomer } from "@/actions/create-dodo-customer";
import { getUser } from "@/actions/get-user";
import { getPlanByKey } from "@/lib/config/plans";
import { db } from "@/lib/drizzle/client";
import { entitlements, users } from "@/lib/drizzle/schema";
import { buildUserDefaults, resolveUserRole, syncAuthMetadata } from "@/lib/healthfit/server/auth";
import { createId } from "@/lib/healthfit/ids";
import { ServerActionRes } from "@/types/server-action";

type CreateUserResult = {
  userId: string;
  onboardingCompleted: boolean;
};

export async function createUser(): ServerActionRes<CreateUserResult> {
  const userRes = await getUser();

  if (!userRes.success) {
    return { success: false, error: "User not found" };
  }

  const authUser = userRes.data;
  const now = new Date().toISOString();
  const role = resolveUserRole(authUser.email!);
  const plan = getPlanByKey("starter");
  const existingUser = await db.query.users.findFirst({
    where: eq(users.supabaseUserId, authUser.id),
  });

  if (existingUser) {
    await db
      .update(users)
      .set({
        email: authUser.email!,
        fullName: authUser.user_metadata.full_name ?? authUser.user_metadata.name,
        avatarUrl:
          authUser.user_metadata.avatar_url ?? authUser.user_metadata.picture,
        role,
        updatedAt: now,
        lastActiveAt: now,
      })
      .where(eq(users.supabaseUserId, authUser.id));

    await syncAuthMetadata({
      userId: authUser.id,
      existingMetadata: authUser.user_metadata ?? {},
      role,
      onboardingCompleted: existingUser.onboardingCompleted,
    });

    return {
      success: true,
      data: {
        userId: authUser.id,
        onboardingCompleted: existingUser.onboardingCompleted,
      },
    };
  }

  let dodoCustomerId: string | null = null;
  if (process.env.DODO_PAYMENTS_API_KEY) {
    const dodoCustomerRes = await createDodoCustomer({
      email: authUser.email!,
      name: authUser.user_metadata.full_name ?? authUser.user_metadata.name,
    });
    if (dodoCustomerRes.success) {
      dodoCustomerId = dodoCustomerRes.data.customer_id;
    }
  }

  await db.insert(users).values({
    supabaseUserId: authUser.id,
    email: authUser.email!,
    fullName: authUser.user_metadata.full_name ?? authUser.user_metadata.name,
    avatarUrl:
      authUser.user_metadata.avatar_url ?? authUser.user_metadata.picture,
    dodoCustomerId,
    lastActiveAt: now,
    ...buildUserDefaults(),
    role,
  });

  await db.insert(entitlements).values({
    id: createId("ent"),
    userId: authUser.id,
    planKey: "starter",
    source: "system",
    isActive: true,
    aiDailyMessageLimit: plan.entitlements.aiDailyMessages,
    features: plan.entitlements,
    createdAt: now,
    updatedAt: now,
  });

  await syncAuthMetadata({
    userId: authUser.id,
    existingMetadata: authUser.user_metadata ?? {},
    role,
    onboardingCompleted: false,
  });

  return {
    success: true,
    data: {
      userId: authUser.id,
      onboardingCompleted: false,
    },
  };
}
