import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/drizzle/client";
import { SelectUser, users } from "@/lib/drizzle/schema";
import { getAdminAuthClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { defaultPlanKey } from "@/lib/config/plans";

export function resolveUserRole(email: string) {
  const adminEmails = (process.env.HEALTHFIT_ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return adminEmails.includes(email.toLowerCase()) ? "admin" : "member";
}

export async function syncAuthMetadata(props: {
  userId: string;
  existingMetadata: Record<string, unknown>;
  role: string;
  onboardingCompleted: boolean;
}) {
  try {
    await getAdminAuthClient().updateUserById(props.userId, {
      user_metadata: {
        ...props.existingMetadata,
        onboardingCompleted: props.onboardingCompleted,
      },
      app_metadata: {
        role: props.role,
      },
    });
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

  const userRecord = await db.query.users.findFirst({
    where: eq(users.supabaseUserId, authUser.id),
  });

  if (!userRecord) return null;

  await db
    .update(users)
    .set({
      lastActiveAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(users.supabaseUserId, authUser.id));

  return {
    ...userRecord,
    lastActiveAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
