// Supabase Edge Function: Challenge Status
// Schedule: Hourly
// Transitions challenge status based on start/end dates.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (_req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date().toISOString();

    // Activate upcoming challenges that have started
    const { count: activated } = await supabase
      .from("challenges")
      .update({ status: "active", updated_at: now })
      .eq("status", "upcoming")
      .lte("start_date", now);

    // Complete active challenges that have ended
    const { count: completed } = await supabase
      .from("challenges")
      .update({ status: "completed", updated_at: now })
      .eq("status", "active")
      .lte("end_date", now);

    console.log(
      `Challenge status: ${activated ?? 0} activated, ${completed ?? 0} completed`
    );

    return new Response(
      JSON.stringify({
        success: true,
        activated: activated ?? 0,
        completed: completed ?? 0,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Challenge status error:", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
