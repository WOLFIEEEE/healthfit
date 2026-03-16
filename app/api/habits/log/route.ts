import { format } from "date-fns";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/drizzle/client";
import { habitLogs } from "@/lib/drizzle/schema";
import { habitLogSchema } from "@/lib/healthfit/contracts";
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

    const payload = habitLogSchema.parse(await request.json());
    const now = new Date().toISOString();

    await db.insert(habitLogs).values({
      id: createId("habitlog"),
      userId: user.id,
      habitTemplateId: payload.habitTemplateId,
      loggedForDate: format(new Date(), "yyyy-MM-dd"),
      status: payload.status,
      value: payload.value,
      note: payload.note,
      createdAt: now,
      updatedAt: now,
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
