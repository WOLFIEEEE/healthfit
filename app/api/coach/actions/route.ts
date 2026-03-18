import { NextResponse } from "next/server";
import { coachActionSchema } from "@/lib/healthfit/contracts";
import { executeCoachAction } from "@/lib/healthfit/server/coach-actions";
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

    return NextResponse.json({
      success: true,
      data: await executeCoachAction(user.id, action),
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
