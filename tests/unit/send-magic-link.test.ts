import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  signInWithOtp: vi.fn(),
  generateLink: vi.fn(),
  sendMagicLinkEmail: vi.fn(),
  hasResendEmailEnv: vi.fn(),
  hasSupabaseAdminEnv: vi.fn(),
}));

vi.mock("@/lib/config/app-url", () => ({
  resolveAppUrl: () => "https://healthfit.example",
}));

vi.mock("@/lib/supabase/env", () => ({
  hasSupabasePublicEnv: () => true,
  hasSupabaseAdminEnv: mocks.hasSupabaseAdminEnv,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      signInWithOtp: mocks.signInWithOtp,
    },
  }),
}));

vi.mock("@/lib/supabase/admin", () => ({
  getAdminAuthClient: () => ({
    generateLink: mocks.generateLink,
  }),
}));

vi.mock("@/lib/email/resend", () => ({
  hasResendEmailEnv: mocks.hasResendEmailEnv,
}));

vi.mock("@/lib/email/flows", () => ({
  sendMagicLinkEmail: mocks.sendMagicLinkEmail,
}));

import { sendMagicLink } from "@/actions/send-magic-link";

describe("sendMagicLink", () => {
  beforeEach(() => {
    mocks.signInWithOtp.mockReset();
    mocks.generateLink.mockReset();
    mocks.sendMagicLinkEmail.mockReset();
    mocks.hasResendEmailEnv.mockReset();
    mocks.hasSupabaseAdminEnv.mockReset();
    mocks.hasSupabaseAdminEnv.mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("uses Resend with an admin-generated magic link when email sending is configured", async () => {
    mocks.hasResendEmailEnv.mockReturnValue(true);
    mocks.generateLink.mockResolvedValue({
      data: {
        properties: {
          hashed_token: "hashed-token",
          verification_type: "magiclink",
        },
      },
      error: null,
    });
    mocks.sendMagicLinkEmail.mockResolvedValue({ id: "email_123" });

    const formData = new FormData();
    formData.set("email", "member@example.com");
    formData.set("next", "/dashboard/coach");

    const result = await sendMagicLink(null, formData);

    expect(result).toEqual({
      success: true,
      data: "Sign-in email sent. Check your inbox to continue.",
    });
    expect(mocks.generateLink).toHaveBeenCalledWith({
      type: "magiclink",
      email: "member@example.com",
    });
    expect(mocks.sendMagicLinkEmail).toHaveBeenCalledWith({
      email: "member@example.com",
      magicLink:
        "https://healthfit.example/api/auth/callback?token_hash=hashed-token&type=magiclink&next=%2Fdashboard%2Fcoach",
      nextPath: "/dashboard/coach",
    });
    expect(mocks.signInWithOtp).not.toHaveBeenCalled();
  });

  it("falls back to Supabase email delivery when Resend is not configured", async () => {
    mocks.hasResendEmailEnv.mockReturnValue(false);
    mocks.signInWithOtp.mockResolvedValue({ error: null });

    const formData = new FormData();
    formData.set("email", "member@example.com");
    formData.set("next", "/dashboard/billing");

    const result = await sendMagicLink(null, formData);

    expect(result).toEqual({
      success: true,
      data: "Sign-in email sent. Check your inbox to continue.",
    });
    expect(mocks.signInWithOtp).toHaveBeenCalledWith({
      email: "member@example.com",
      options: {
        emailRedirectTo:
          "https://healthfit.example/api/auth/callback?next=%2Fdashboard%2Fbilling",
      },
    });
    expect(mocks.generateLink).not.toHaveBeenCalled();
  });

  it("falls back to Supabase email delivery when admin auth is unavailable", async () => {
    mocks.hasResendEmailEnv.mockReturnValue(true);
    mocks.hasSupabaseAdminEnv.mockReturnValue(false);
    mocks.signInWithOtp.mockResolvedValue({ error: null });

    const formData = new FormData();
    formData.set("email", "member@example.com");

    const result = await sendMagicLink(null, formData);

    expect(result).toEqual({
      success: true,
      data: "Sign-in email sent. Check your inbox to continue.",
    });
    expect(mocks.signInWithOtp).toHaveBeenCalled();
    expect(mocks.generateLink).not.toHaveBeenCalled();
  });
});
