import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveChallenges } from "@/lib/healthfit/server/challenges";

export async function GET() {
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

    const challenges = await getActiveChallenges();

    return NextResponse.json({ success: true, data: challenges });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch challenges",
      },
      { status: 500 }
    );
  }
}
