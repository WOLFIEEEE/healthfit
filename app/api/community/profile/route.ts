import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { upsertPublicProfile } from "@/lib/healthfit/server/community";

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

    const body = await request.json();

    if (!body.displayName || typeof body.displayName !== "string") {
      return NextResponse.json(
        { success: false, error: "displayName is required" },
        { status: 400 }
      );
    }

    if (!body.slug || typeof body.slug !== "string") {
      return NextResponse.json(
        { success: false, error: "slug is required" },
        { status: 400 }
      );
    }

    const profile = await upsertPublicProfile(user.id, {
      displayName: body.displayName,
      bio: body.bio,
      avatarUrl: body.avatarUrl,
      slug: body.slug,
      isPublic: body.isPublic,
      showStreaks: body.showStreaks,
      showBadges: body.showBadges,
      showStats: body.showStats,
    });

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update profile",
      },
      { status: 400 }
    );
  }
}
