import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mealLogSchema } from "@/lib/healthfit/contracts";
import { logMealEntry } from "@/lib/healthfit/server/member-loggers";

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
    await logMealEntry({
      userId: user.id,
      mealType: payload.mealType,
      title: payload.title,
      calories: payload.calories,
      proteinGrams: payload.proteinGrams,
      carbsGrams: payload.carbsGrams,
      fatGrams: payload.fatGrams,
      waterMl: payload.waterMl,
      notes: payload.notes,
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
