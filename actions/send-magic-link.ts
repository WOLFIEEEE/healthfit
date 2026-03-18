"use server";

import { buildMagicLinkCallbackUrl, resolveSafeNextPath } from "@/lib/auth/magic-links";
import { sendMagicLinkEmail } from "@/lib/email/flows";
import { hasResendEmailEnv } from "@/lib/email/resend";
import { resolveAppUrl } from "@/lib/config/app-url";
import { getAdminAuthClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseAdminEnv, hasSupabasePublicEnv } from "@/lib/supabase/env";

export async function sendMagicLink(
  _previousState: { success: true; data: string } | { success: false; error: string } | null,
  formData: FormData
) {
  const email = String(formData.get("email") ?? "").trim();
  const nextPath = resolveSafeNextPath(String(formData.get("next") ?? ""));

  if (!email) {
    return { success: false as const, error: "Email is required" };
  }

  if (!hasSupabasePublicEnv()) {
    return {
      success: false as const,
      error: "Authentication is not configured for this environment yet.",
    };
  }

  const origin = resolveAppUrl();

  if (hasResendEmailEnv() && hasSupabaseAdminEnv()) {
    try {
      const adminAuth = getAdminAuthClient();
      const { data, error } = await adminAuth.generateLink({
        type: "magiclink",
        email,
      });

      if (error || !data.properties?.hashed_token) {
        return {
          success: false as const,
          error: error?.message ?? "Failed to generate a secure sign-in link.",
        };
      }

      const magicLink = buildMagicLinkCallbackUrl({
        origin,
        tokenHash: data.properties.hashed_token,
        type: data.properties.verification_type ?? "magiclink",
        next: nextPath,
      });
      await sendMagicLinkEmail({
        email,
        magicLink,
        nextPath,
      });

      return {
        success: true as const,
        data: "Sign-in email sent. Check your inbox to continue.",
      };
    } catch (error) {
      return {
        success: false as const,
        error:
          error instanceof Error
            ? error.message
            : "Failed to send the sign-in email.",
      };
    }
  }

  const supabase = await createClient();
  const callbackUrl = new URL("/api/auth/callback", origin);

  if (nextPath) {
    callbackUrl.searchParams.set("next", nextPath);
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    return { success: false as const, error: error.message };
  }

  return {
    success: true as const,
    data: "Sign-in email sent. Check your inbox to continue.",
  };
}
