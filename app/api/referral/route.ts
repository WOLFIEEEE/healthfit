import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  ensureReferralCode,
  getReferralStats,
} from "@/lib/healthfit/server/referrals";

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

    const [code, stats] = await Promise.all([
      ensureReferralCode(user.id),
      getReferralStats(user.id),
    ]);

    return NextResponse.json({ success: true, data: { code, stats } });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch referral data",
      },
      { status: 500 }
    );
  }
}

export async function POST() {
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

    const code = await ensureReferralCode(user.id);

    return NextResponse.json({ success: true, data: { code } });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate referral code",
      },
      { status: 400 }
    );
  }
}
