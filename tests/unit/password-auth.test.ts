import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  ensureAppUserRecord: vi.fn(),
  redirect: vi.fn(),
  hasSupabasePublicEnv: vi.fn(),
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

vi.mock("@/lib/supabase/env", () => ({
  hasSupabasePublicEnv: mocks.hasSupabasePublicEnv,
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
    mocks.ensureAppUserRecord.mockReset();
    mocks.redirect.mockReset();
    mocks.hasSupabasePublicEnv.mockReset();
    mocks.hasSupabasePublicEnv.mockReturnValue(true);
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
