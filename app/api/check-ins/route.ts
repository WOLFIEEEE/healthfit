import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/drizzle/client";
import { checkIns, memberProfiles, progressMetrics } from "@/lib/drizzle/schema";
import { checkInSchema } from "@/lib/healthfit/contracts";
import { createId } from "@/lib/healthfit/ids";
import { buildCheckInSummary } from "@/lib/healthfit/server/defaults";
import { queueNotification } from "@/lib/healthfit/server/notifications";

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

    const payload = checkInSchema.parse(await request.json());
    const now = new Date().toISOString();
    const summary = buildCheckInSummary(payload);

    await db.insert(checkIns).values({
      id: createId("checkin"),
      userId: user.id,
      periodType: payload.periodType,
      moodScore: payload.moodScore,
      energyScore: payload.energyScore,
      stressScore: payload.stressScore,
      adherenceScore: payload.adherenceScore,
      sleepHours: payload.sleepHours,
      wins: payload.wins,
      blockers: payload.blockers,
      notes: payload.notes,
      aiSummary: summary,
      createdAt: now,
      updatedAt: now,
    });

    await db
      .update(memberProfiles)
      .set({
        lastCheckInAt: now,
        updatedAt: now,
      })
      .where(eq(memberProfiles.userId, user.id));

    await db.insert(progressMetrics).values({
      id: createId("metric"),
      userId: user.id,
      metricType: "adherence",
      value: payload.adherenceScore,
      unit: "score",
      note: "Generated from check-in",
      recordedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    await queueNotification({
      userId: user.id,
      type: "checkin_saved",
      title: "Check-in saved",
      body: "Your latest wellness check-in has been captured.",
    });

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to save check-in",
      },
      { status: 400 }
    );
  }
}
