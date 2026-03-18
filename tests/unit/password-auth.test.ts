import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  generateLink: vi.fn(),
  sendSignupConfirmationEmail: vi.fn(),
  ensureAppUserRecord: vi.fn(),
  redirect: vi.fn(),
  hasSupabasePublicEnv: vi.fn(),
  hasSupabaseAdminEnv: vi.fn(),
  hasResendEmailEnv: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("@/actions/create-user", () => ({
  ensureAppUserRecord: mocks.ensureAppUserRecord,
}));

vi.mock("@/lib/config/app-url", () => ({
  resolveAppUrl: () => "https://healthfit.example",
}));

vi.mock("@/lib/email/flows", () => ({
  sendSignupConfirmationEmail: mocks.sendSignupConfirmationEmail,
}));

vi.mock("@/lib/email/resend", () => ({
  hasResendEmailEnv: mocks.hasResendEmailEnv,
}));

vi.mock("@/lib/supabase/admin", () => ({
  getAdminAuthClient: () => ({
    generateLink: mocks.generateLink,
  }),
}));

vi.mock("@/lib/supabase/env", () => ({
  hasSupabasePublicEnv: mocks.hasSupabasePublicEnv,
  hasSupabaseAdminEnv: mocks.hasSupabaseAdminEnv,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      signInWithPassword: mocks.signInWithPassword,
      signUp: mocks.signUp,
    },
  }),
}));

import {
  signInWithPassword,
  signUpWithPassword,
} from "@/actions/password-auth";

describe("password auth actions", () => {
  beforeEach(() => {
    mocks.signInWithPassword.mockReset();
    mocks.signUp.mockReset();
    mocks.generateLink.mockReset();
    mocks.sendSignupConfirmationEmail.mockReset();
    mocks.ensureAppUserRecord.mockReset();
    mocks.redirect.mockReset();
    mocks.hasSupabasePublicEnv.mockReset();
    mocks.hasSupabaseAdminEnv.mockReset();
    mocks.hasResendEmailEnv.mockReset();
    mocks.hasSupabasePublicEnv.mockReturnValue(true);
    mocks.hasSupabaseAdminEnv.mockReturnValue(false);
    mocks.hasResendEmailEnv.mockReturnValue(false);
    mocks.redirect.mockImplementation((path: string) => {
      throw new Error(`REDIRECT:${path}`);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("signs in with password and redirects through the shared post-auth path", async () => {
    mocks.signInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: "user_123",
          email: "member@example.com",
          user_metadata: {},
        },
      },
      error: null,
    });
    mocks.ensureAppUserRecord.mockResolvedValue({
      success: true,
      data: {
        userId: "user_123",
        onboardingCompleted: false,
      },
    });

    const formData = new FormData();
    formData.set("email", "member@example.com");
    formData.set("password", "SuperSecret123");
    formData.set("next", "/dashboard/billing");

    await expect(signInWithPassword(null, formData)).rejects.toThrow(
      "REDIRECT:/dashboard/billing"
    );

    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: "member@example.com",
      password: "SuperSecret123",
    });
    expect(mocks.ensureAppUserRecord).toHaveBeenCalled();
  });

  it("creates a password account and returns a confirmation message when email verification is required", async () => {
    mocks.signUp.mockResolvedValue({
      data: {
        session: null,
        user: {
          id: "user_signup",
        },
      },
      error: null,
    });

    const formData = new FormData();
    formData.set("fullName", "New Member");
    formData.set("email", "new@example.com");
    formData.set("password", "SuperSecret123");
    formData.set("confirmPassword", "SuperSecret123");
    formData.set("next", "/dashboard/coach");

    const result = await signUpWithPassword(null, formData);

    expect(result).toEqual({
      success: true,
      data: "Account created. Check your email to confirm your address, then sign in with your password.",
    });
    expect(mocks.signUp).toHaveBeenCalledWith({
      email: "new@example.com",
      password: "SuperSecret123",
      options: {
        emailRedirectTo:
          "https://healthfit.example/api/auth/callback?next=%2Fdashboard%2Fcoach",
        data: {
          full_name: "New Member",
        },
      },
    });
    expect(mocks.ensureAppUserRecord).not.toHaveBeenCalled();
  });

  it("uses the custom Resend confirmation flow when email delivery and admin auth are configured", async () => {
    mocks.hasSupabaseAdminEnv.mockReturnValue(true);
    mocks.hasResendEmailEnv.mockReturnValue(true);
    mocks.generateLink.mockResolvedValue({
      data: {
        properties: {
          hashed_token: "hashed-signup-token",
          verification_type: "signup",
        },
      },
      error: null,
    });
    mocks.sendSignupConfirmationEmail.mockResolvedValue({ id: "email_123" });

    const formData = new FormData();
    formData.set("fullName", "New Member");
    formData.set("email", "new@example.com");
    formData.set("password", "SuperSecret123");
    formData.set("confirmPassword", "SuperSecret123");
    formData.set("next", "/dashboard/coach");

    const result = await signUpWithPassword(null, formData);

    expect(result).toEqual({
      success: true,
      data: "Account created. Check your email to confirm your address and finish signing in.",
    });
    expect(mocks.generateLink).toHaveBeenCalledWith({
      type: "signup",
      email: "new@example.com",
      password: "SuperSecret123",
      options: {
        data: {
          full_name: "New Member",
        },
        redirectTo:
          "https://healthfit.example/api/auth/callback?next=%2Fdashboard%2Fcoach",
      },
    });
    expect(mocks.sendSignupConfirmationEmail).toHaveBeenCalledWith({
      email: "new@example.com",
      fullName: "New Member",
      confirmationLink:
        "https://healthfit.example/api/auth/callback?token_hash=hashed-signup-token&type=signup&next=%2Fdashboard%2Fcoach",
      nextPath: "/dashboard/coach",
    });
    expect(mocks.signUp).not.toHaveBeenCalled();
  });

  it("rejects mismatched passwords during sign-up", async () => {
    const formData = new FormData();
    formData.set("fullName", "New Member");
    formData.set("email", "new@example.com");
    formData.set("password", "SuperSecret123");
    formData.set("confirmPassword", "DifferentSecret123");

    const result = await signUpWithPassword(null, formData);

    expect(result).toEqual({
      success: false,
      error: "Passwords do not match.",
    });
    expect(mocks.signUp).not.toHaveBeenCalled();
  });
});
