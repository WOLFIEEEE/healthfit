import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { habitLogSchema } from "@/lib/healthfit/contracts";
import { upsertHabitLog } from "@/lib/healthfit/server/member-loggers";

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

    const payload = habitLogSchema.parse(await request.json());
    await upsertHabitLog({
      userId: user.id,
      habitTemplateId: payload.habitTemplateId,
      status: payload.status,
      value: payload.value,
      note: payload.note,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to log habit",
      },
      { status: 400 }
    );
  }
}
