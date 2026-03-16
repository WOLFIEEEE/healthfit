"use server";

import { ServerActionRes } from "@/types/server-action";
import { DashboardSnapshot } from "@/lib/healthfit/contracts";
import { getDashboardSnapshot } from "@/lib/healthfit/server/dashboard";
import { requireCurrentAppUser } from "@/lib/healthfit/server/auth";

export async function getDashboardSnapshotAction(): ServerActionRes<DashboardSnapshot> {
  try {
    const user = await requireCurrentAppUser();
    const snapshot = await getDashboardSnapshot(user.supabaseUserId);
    return { success: true, data: snapshot };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to load dashboard",
    };
  }
}
