import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  markStepComplete,
  markTourComplete,
} from "@/lib/healthfit/server/onboarding-tour";

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
    const action = body.action;

    if (action === "step") {
      if (!body.step || typeof body.step !== "string") {
        return NextResponse.json(
          { success: false, error: "step is required" },
          { status: 400 }
        );
      }

      const progress = await markStepComplete(user.id, body.step);
      return NextResponse.json({ success: true, data: progress });
    }

    if (action === "complete") {
      const progress = await markTourComplete(user.id);
      return NextResponse.json({ success: true, data: progress });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Use 'step' or 'complete'." },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update tour progress",
      },
      { status: 400 }
    );
  }
}
