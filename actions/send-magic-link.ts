"use server";

import { createClient } from "@/lib/supabase/server";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";

export async function sendMagicLink(
  _previousState: { success: true; data: string } | { success: false; error: string } | null,
  formData: FormData
) {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { success: false as const, error: "Email is required" };
  }

  if (!hasSupabasePublicEnv()) {
    return {
      success: false as const,
      error: "Authentication is not configured for this environment yet.",
    };
  }

  const supabase = await createClient();
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/api/auth/callback`,
    },
  });

  if (error) {
    return { success: false as const, error: error.message };
  }

  return {
    success: true as const,
    data: "Magic link sent. Check your inbox to continue.",
  };
}
