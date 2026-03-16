import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/drizzle/client";
import { workoutLogs } from "@/lib/drizzle/schema";
import { workoutLogSchema } from "@/lib/healthfit/contracts";
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

    const payload = workoutLogSchema.parse(await request.json());
    const now = new Date().toISOString();

    await db.insert(workoutLogs).values({
      id: createId("workout"),
      userId: user.id,
      programDayId: payload.programDayId,
      workoutName: payload.workoutName,
      durationMin: payload.durationMin,
      completed: payload.completed,
      effortScore: payload.effortScore,
      recoveryScore: payload.recoveryScore,
      caloriesBurned: payload.caloriesBurned,
      notes: payload.notes,
      loggedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to log workout",
      },
      { status: 400 }
    );
  }
}
