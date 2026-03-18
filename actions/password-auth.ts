"use server";

import { redirect } from "next/navigation";
import { ensureAppUserRecord } from "@/actions/create-user";
import { buildMagicLinkCallbackUrl } from "@/lib/auth/magic-links";
import { resolvePostAuthPath } from "@/lib/auth/post-auth";
import { resolveAppUrl } from "@/lib/config/app-url";
import { sendSignupConfirmationEmail } from "@/lib/email/flows";
import { hasResendEmailEnv } from "@/lib/email/resend";
import { getAdminAuthClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminEnv, hasSupabasePublicEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type PasswordAuthState =
  | { success: true; data: string }
  | { success: false; error: string }
  | null;

function readValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function signInWithPassword(
  _previousState: PasswordAuthState,
  formData: FormData
) {
  const email = readValue(formData, "email");
  const password = String(formData.get("password") ?? "");
  const nextPath = readValue(formData, "next");

  if (!email || !password) {
    return {
      success: false as const,
      error: "Email and password are required.",
    };
  }

  if (!hasSupabasePublicEnv()) {
    return {
      success: false as const,
      error: "Authentication is not configured for this environment yet.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return {
      success: false as const,
      error: error?.message ?? "Unable to sign in with that email and password.",
    };
  }

  const appUserResult = await ensureAppUserRecord(data.user);

  if (!appUserResult.success) {
    return {
      success: false as const,
      error: appUserResult.error,
    };
  }

  redirect(resolvePostAuthPath(nextPath, appUserResult.data.onboardingCompleted));
}

export async function signUpWithPassword(
  _previousState: PasswordAuthState,
  formData: FormData
) {
  const fullName = readValue(formData, "fullName");
  const email = readValue(formData, "email");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const nextPath = readValue(formData, "next");

  if (!fullName || !email || !password || !confirmPassword) {
    return {
      success: false as const,
      error: "Full name, email, and password are required.",
    };
  }

  if (password.length < 8) {
    return {
      success: false as const,
      error: "Use at least 8 characters for your password.",
    };
  }

  if (password !== confirmPassword) {
    return {
      success: false as const,
      error: "Passwords do not match.",
    };
  }

  if (!hasSupabasePublicEnv()) {
    return {
      success: false as const,
      error: "Authentication is not configured for this environment yet.",
    };
  }

  const supabase = await createClient();
  const callbackUrl = new URL("/api/auth/callback", resolveAppUrl());

  if (nextPath) {
    callbackUrl.searchParams.set("next", nextPath);
  }

  if (hasResendEmailEnv() && hasSupabaseAdminEnv()) {
    try {
      const adminAuth = getAdminAuthClient();
      const { data, error } = await adminAuth.generateLink({
        type: "signup",
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          redirectTo: callbackUrl.toString(),
        },
      });

      if (error || !data.properties?.hashed_token) {
        return {
          success: false as const,
          error: error?.message ?? "Failed to generate the confirmation email.",
        };
      }

      const confirmationLink = buildMagicLinkCallbackUrl({
        origin: resolveAppUrl(),
        tokenHash: data.properties.hashed_token,
        type: data.properties.verification_type ?? "signup",
        next: nextPath,
      });

      await sendSignupConfirmationEmail({
        email,
        fullName,
        confirmationLink,
        nextPath,
      });

      return {
        success: true as const,
        data: "Account created. Check your email to confirm your address and finish signing in.",
      };
    } catch (error) {
      return {
        success: false as const,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create the account confirmation email.",
      };
    }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: callbackUrl.toString(),
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return {
      success: false as const,
      error: error.message,
    };
  }

  if (data.session && data.user) {
    const appUserResult = await ensureAppUserRecord(data.user);

    if (!appUserResult.success) {
      return {
        success: false as const,
        error: appUserResult.error,
      };
    }

    redirect(resolvePostAuthPath(nextPath, appUserResult.data.onboardingCompleted));
  }

  return {
    success: true as const,
    data: "Account created. Check your email to confirm your address, then sign in with your password.",
  };
}
