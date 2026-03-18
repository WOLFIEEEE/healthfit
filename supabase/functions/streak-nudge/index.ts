// Supabase Edge Function: Streak Nudge
// Schedule: Daily 6:00 PM UTC
// Sends streak-at-risk notifications for users with active streaks.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (_req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Find users with streaks >= 3 where last active was yesterday
    const { data: atRisk, error } = await supabase
      .from("streaks")
      .select("user_id, category, current_streak")
      .gte("current_streak", 3)
      .eq("last_active_date", yesterdayStr);

    if (error) throw error;

    const now = new Date().toISOString();
    const dateKey = now.split("T")[0];

    for (const streak of atRisk ?? []) {
      const notifId = `notif-${streak.user_id}-streak_at_risk_${streak.category}-${dateKey}`;

      await supabase.from("notifications").upsert(
        {
          id: notifId,
          user_id: streak.user_id,
          type: "streak_at_risk",
          channel: "in_app",
          title: `${streak.current_streak}-day ${streak.category} streak at risk`,
          body: `Log a ${streak.category} today to keep your streak alive!`,
          status: "queued",
          metadata: {
            category: streak.category,
            currentStreak: streak.current_streak,
          },
          created_at: now,
          updated_at: now,
        },
        { onConflict: "id", ignoreDuplicates: true }
      );
    }

    console.log(`Streak nudge: ${atRisk?.length ?? 0} at-risk streaks processed`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: atRisk?.length ?? 0,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Streak nudge error:", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
