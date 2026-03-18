import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getComparisonData } from "@/lib/healthfit/server/comparison";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const currentStart = searchParams.get("currentStart");
    const currentEnd = searchParams.get("currentEnd");
    const previousStart = searchParams.get("previousStart");
    const previousEnd = searchParams.get("previousEnd");

    if (!currentStart || !currentEnd || !previousStart || !previousEnd) {
      return NextResponse.json(
        { success: false, error: "Missing date parameters" },
        { status: 400 }
      );
    }

    const data = await getComparisonData(
      user.id,
      currentStart,
      currentEnd,
      previousStart,
      previousEnd
    );

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Comparison API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load comparison data" },
      { status: 500 }
    );
  }
}
