import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exportConversation } from "@/lib/healthfit/server/coach-export";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, format: exportFormat } = body;

    if (!conversationId || !["markdown", "json"].includes(exportFormat)) {
      return NextResponse.json(
        { success: false, error: "Invalid parameters" },
        { status: 400 }
      );
    }

    const data = await exportConversation(user.id, conversationId, exportFormat);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Coach export error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export conversation" },
      { status: 500 }
    );
  }
}
