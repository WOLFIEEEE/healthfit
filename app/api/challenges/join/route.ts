import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { joinChallenge } from "@/lib/healthfit/server/challenges";

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

    const { challengeId } = await request.json();

    if (!challengeId || typeof challengeId !== "string") {
      return NextResponse.json(
        { success: false, error: "challengeId is required" },
        { status: 400 }
      );
    }

    const participant = await joinChallenge(user.id, challengeId);

    return NextResponse.json({ success: true, data: participant });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to join challenge",
      },
      { status: 400 }
    );
  }
}
