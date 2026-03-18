import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/drizzle/client";
import { emailDigestPreferences } from "@/lib/drizzle/schema";
import { createId } from "@/lib/healthfit/ids";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const now = new Date().toISOString();

    const frequency = body.frequency ?? "weekly";
    const includeCoachSummary = body.includeCoachSummary ?? true;
    const includeWeeklyStats = body.includeWeeklyStats ?? true;
    const includeAchievements = body.includeAchievements ?? true;

    const existing = await db.query.emailDigestPreferences.findFirst({
      where: eq(emailDigestPreferences.userId, user.id),
    });

    if (existing) {
      const [updated] = await db
        .update(emailDigestPreferences)
        .set({
          frequency,
          includeCoachSummary,
          includeWeeklyStats,
          includeAchievements,
          updatedAt: now,
        })
        .where(eq(emailDigestPreferences.userId, user.id))
        .returning();

      return NextResponse.json({ success: true, data: updated });
    }

    const [created] = await db
      .insert(emailDigestPreferences)
      .values({
        id: createId("edpref"),
        userId: user.id,
        frequency,
        includeCoachSummary,
        includeWeeklyStats,
        includeAchievements,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to save preferences",
      },
      { status: 400 }
    );
  }
}
