import { NextResponse } from "next/server";
import { coachActionSchema } from "@/lib/healthfit/contracts";
import { logMealEntry, logWorkoutEntry, upsertHabitLog } from "@/lib/healthfit/server/member-loggers";
import { replanMemberWeek } from "@/lib/healthfit/server/adaptive-planning";
import { createClient } from "@/lib/supabase/server";

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

    const action = coachActionSchema.parse(await request.json());

    if (action.type === "navigate") {
      return NextResponse.json({
        success: true,
        data: {
          message: "Navigation actions are handled in the client.",
          href: action.href,
        },
      });
    }

    if (action.type === "log_workout") {
      await logWorkoutEntry({
        userId: user.id,
        ...action.payload,
        completed: true,
      });

      return NextResponse.json({
        success: true,
        data: {
          message: "Workout saved from the AI coach.",
        },
      });
    }

    if (action.type === "log_meal") {
      await logMealEntry({
        userId: user.id,
        ...action.payload,
      });

      return NextResponse.json({
        success: true,
        data: {
          message: "Meal saved from the AI coach.",
        },
      });
    }

    if (action.type === "log_habit") {
      const habitTemplate = await upsertHabitLog({
        userId: user.id,
        habitSlug: action.payload.habitSlug,
        status: action.payload.status,
        note: action.payload.note,
      });

      return NextResponse.json({
        success: true,
        data: {
          message: `${habitTemplate.title} updated from the AI coach.`,
        },
      });
    }

    const plan = await replanMemberWeek(user.id);

    return NextResponse.json({
      success: true,
      data: {
        message: `${plan.mode} has been generated and your weekly program is refreshed.`,
        plan,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to execute coach action",
      },
      { status: 400 }
    );
  }
}
