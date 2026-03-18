import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/drizzle/client";
import { coachPersonalities, memberProfiles } from "@/lib/drizzle/schema";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { personalitySlug } = await request.json();

    if (!personalitySlug) {
      return NextResponse.json(
        { success: false, error: "Missing personalitySlug" },
        { status: 400 }
      );
    }

    const personality = await db.query.coachPersonalities.findFirst({
      where: eq(coachPersonalities.slug, personalitySlug),
    });

    if (!personality) {
      return NextResponse.json(
        { success: false, error: "Personality not found" },
        { status: 404 }
      );
    }

    await db
      .update(memberProfiles)
      .set({
        coachPersonalitySlug: personalitySlug,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(memberProfiles.userId, user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Coach personality error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update personality" },
      { status: 500 }
    );
  }
}
