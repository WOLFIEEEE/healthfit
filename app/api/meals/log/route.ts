import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/drizzle/client";
import { mealLogs } from "@/lib/drizzle/schema";
import { mealLogSchema } from "@/lib/healthfit/contracts";
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

    const payload = mealLogSchema.parse(await request.json());
    const now = new Date().toISOString();

    await db.insert(mealLogs).values({
      id: createId("meal"),
      userId: user.id,
      mealType: payload.mealType,
      title: payload.title,
      calories: payload.calories,
      proteinGrams: payload.proteinGrams,
      carbsGrams: payload.carbsGrams,
      fatGrams: payload.fatGrams,
      waterMl: payload.waterMl,
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
        error: error instanceof Error ? error.message : "Failed to log meal",
      },
      { status: 400 }
    );
  }
}
