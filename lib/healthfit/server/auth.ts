import type { User } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/drizzle/client";
import { isAdminEmail } from "@/lib/config/admin";
import { SelectUser, users } from "@/lib/drizzle/schema";
import { getAdminAuthClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { defaultPlanKey } from "@/lib/config/plans";

export function resolveUserRole(email: string) {
  return isAdminEmail(email) ? "admin" : "member";
}

async function withTimeout<T>(
  task: Promise<T>,
  timeoutMs: number,
  errorMessage: string
) {
  return await Promise.race([
    task,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
    }),
  ]);
}

function getAuthUserRole(authUser: User) {
  return typeof authUser.app_metadata?.role === "string"
    ? authUser.app_metadata.role
    : resolveUserRole(authUser.email ?? "");
}

function getAuthUserFullName(authUser: User) {
  return authUser.user_metadata.full_name ?? authUser.user_metadata.name ?? null;
}

function getAuthUserAvatarUrl(authUser: User) {
  return authUser.user_metadata.avatar_url ?? authUser.user_metadata.picture ?? null;
}

function getAuthUserOnboardingCompleted(authUser: User, role: string) {
  return (
    role === "admin" ||
    authUser.user_metadata.onboardingCompleted === true ||
    authUser.user_metadata.onboarding_completed === true
  );
}

async function queryCurrentUserRecord(userId: string) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await db.query.users.findFirst({
        where: eq(users.supabaseUserId, userId),
      });
    } catch (error) {
      lastError = error;

      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
    }
  }

  throw lastError;
}

async function upsertCurrentUserFromAuth(authUser: User): Promise<SelectUser | null> {
  if (!authUser.email) {
    return null;
  }

  const now = new Date().toISOString();
  const role = getAuthUserRole(authUser);
  const onboardingCompleted = getAuthUserOnboardingCompleted(authUser, role);

  const [userRecord] = await db
    .insert(users)
    .values({
      supabaseUserId: authUser.id,
      email: authUser.email,
      fullName: getAuthUserFullName(authUser),
      avatarUrl: getAuthUserAvatarUrl(authUser),
      lastActiveAt: now,
      ...buildUserDefaults(),
      role,
      onboardingCompleted,
      wellnessConsentAccepted: onboardingCompleted,
      disclaimerAccepted: onboardingCompleted,
    })
    .onConflictDoUpdate({
      target: users.supabaseUserId,
      set: {
        email: authUser.email,
        fullName: getAuthUserFullName(authUser),
        avatarUrl: getAuthUserAvatarUrl(authUser),
        role,
        onboardingCompleted,
        lastActiveAt: now,
        updatedAt: now,
      },
    })
    .returning();

  await syncAuthMetadata({
    userId: authUser.id,
    existingMetadata: authUser.user_metadata ?? {},
    role,
    onboardingCompleted:
      onboardingCompleted || userRecord?.onboardingCompleted || false,
  });

  return userRecord ?? null;
}

async function touchCurrentUserLastActive(userId: string, now: string) {
  try {
    await db
      .update(users)
      .set({
        lastActiveAt: now,
        updatedAt: now,
      })
      .where(eq(users.supabaseUserId, userId));
  } catch (error) {
    console.error("Failed to update last active timestamp", error);
  }
}

export async function syncAuthMetadata(props: {
  userId: string;
  existingMetadata: Record<string, unknown>;
  role: string;
  onboardingCompleted: boolean;
}) {
  try {
    await withTimeout(
      getAdminAuthClient().updateUserById(props.userId, {
        user_metadata: {
          ...props.existingMetadata,
          onboardingCompleted: props.onboardingCompleted,
        },
        app_metadata: {
          role: props.role,
        },
      }),
      5_000,
      "Timed out while syncing auth metadata"
    );
  } catch (error) {
    console.error("Failed to sync auth metadata", error);
  }
}

export async function getCurrentAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getCurrentAppUser(): Promise<SelectUser | null> {
  const authUser = await getCurrentAuthUser();

  if (!authUser) return null;

  let userRecord: SelectUser | null = null;

  try {
    userRecord = (await queryCurrentUserRecord(authUser.id)) ?? null;
  } catch (error) {
    console.error("Failed to query current app user", error);
  }

  if (!userRecord) {
    try {
      userRecord = await upsertCurrentUserFromAuth(authUser);
    } catch (error) {
      console.error("Failed to upsert current app user from auth context", error);
      throw error;
    }
  }

  if (!userRecord) return null;

  const now = new Date().toISOString();
  await touchCurrentUserLastActive(authUser.id, now);

  return {
    ...userRecord,
    lastActiveAt: now,
    updatedAt: now,
  };
}

export async function requireCurrentAppUser() {
  const user = await getCurrentAppUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdminUser() {
  const user = await requireCurrentAppUser();

  if (user.role !== "admin") {
    redirect("/dashboard/overview");
  }

  return user;
}

export function buildUserDefaults() {
  const now = new Date().toISOString();

  return {
    role: "member" as const,
    currentPlanKey: defaultPlanKey,
    onboardingCompleted: false,
    wellnessConsentAccepted: false,
    disclaimerAccepted: false,
    createdAt: now,
    updatedAt: now,
  };
}
