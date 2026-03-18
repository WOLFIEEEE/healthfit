import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkInSchema } from "@/lib/healthfit/contracts";
import { logCheckInEntry } from "@/lib/healthfit/server/member-loggers";

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
    const summary = await logCheckInEntry({
      userId: user.id,
      ...payload,
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
