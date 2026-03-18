import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { replanMemberWeek } from "@/lib/healthfit/server/adaptive-planning";

export async function POST() {
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

    const program = await replanMemberWeek(user.id);

    return NextResponse.json({
      success: true,
      data: program,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to rebuild weekly program",
      },
      { status: 400 }
    );
  }
}
