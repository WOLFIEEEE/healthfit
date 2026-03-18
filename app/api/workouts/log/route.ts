import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { workoutLogSchema } from "@/lib/healthfit/contracts";
import { logWorkoutEntry } from "@/lib/healthfit/server/member-loggers";

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
    await logWorkoutEntry({
      userId: user.id,
      programDayId: payload.programDayId,
      workoutName: payload.workoutName,
      durationMin: payload.durationMin,
      completed: payload.completed,
      effortScore: payload.effortScore,
      recoveryScore: payload.recoveryScore,
      caloriesBurned: payload.caloriesBurned,
      notes: payload.notes,
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
