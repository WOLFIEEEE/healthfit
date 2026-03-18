import { describe, expect, it } from "vitest";
import {
  buildMagicLinkCallbackUrl,
  resolveSafeNextPath,
} from "@/lib/auth/magic-links";
import {
  renderMagicLinkEmail,
  renderPurchaseInviteEmail,
  renderSignupConfirmationEmail,
  renderWelcomeEmail,
} from "@/lib/email/templates";

describe("magic link helpers", () => {
  it("keeps safe internal next paths", () => {
    expect(resolveSafeNextPath("/dashboard/billing")).toBe("/dashboard/billing");
  });

  it("rejects external or protocol-relative next paths", () => {
    expect(resolveSafeNextPath("https://evil.example")).toBeNull();
    expect(resolveSafeNextPath("//evil.example")).toBeNull();
  });

  it("builds a callback url with a safe next path only", () => {
    expect(
      buildMagicLinkCallbackUrl({
        origin: "https://healthfit.example",
        tokenHash: "hashed-token",
        type: "magiclink",
        next: "/dashboard/coach",
      })
    ).toBe(
      "https://healthfit.example/api/auth/callback?token_hash=hashed-token&type=magiclink&next=%2Fdashboard%2Fcoach"
    );

    expect(
      buildMagicLinkCallbackUrl({
        origin: "https://healthfit.example",
        tokenHash: "hashed-token",
        type: "magiclink",
        next: "https://evil.example",
      })
    ).toBe(
      "https://healthfit.example/api/auth/callback?token_hash=hashed-token&type=magiclink"
    );
  });
});

describe("email templates", () => {
  it("renders the branded magic-link email content", () => {
    const email = renderMagicLinkEmail({
      magicLink: "https://healthfit.example/api/auth/callback?token_hash=abc&type=magiclink",
      nextPath: "/dashboard/coach",
    });

    expect(email.subject).toBe("Your Healthfit.ai sign-in link");
    expect(email.html).toContain("Healthfit.ai");
    expect(email.html).toContain("Secure sign in");
    expect(email.html).toContain("Sign in to Healthfit.ai");
    expect(email.html).toContain("#214d39");
    expect(email.text).toContain("/dashboard/coach");
  });

  it("renders the branded welcome email content", () => {
    const email = renderWelcomeEmail({
      fullName: "Codex Member",
      dashboardUrl: "https://healthfit.example/dashboard/overview",
      weeklyFocus: "Build consistency with three low-friction sessions",
    });

    expect(email.subject).toBe("Your Healthfit.ai plan is ready");
    expect(email.html).toContain("Welcome, Codex.");
    expect(email.html).toContain("Open your dashboard");
    expect(email.text).toContain("Build consistency with three low-friction sessions");
  });

  it("renders the branded signup confirmation email content", () => {
    const email = renderSignupConfirmationEmail({
      fullName: "Codex Member",
      confirmationLink:
        "https://healthfit.example/api/auth/callback?token_hash=abc&type=signup",
      nextPath: "/onboarding",
    });

    expect(email.subject).toBe("Confirm your Healthfit.ai account");
    expect(email.html).toContain("Confirm your account");
    expect(email.html).toContain("Create account");
    expect(email.text).toContain("/onboarding");
    expect(email.text).toContain("token_hash=abc");
  });

  it("renders the branded purchase invite email content", () => {
    const email = renderPurchaseInviteEmail({
      fullName: "Codex Member",
      planName: "Pro",
      claimUrl: "https://healthfit.example/api/auth/callback?token_hash=abc&type=invite",
      existingAccount: false,
    });

    expect(email.subject).toBe("Claim your new Pro membership");
    expect(email.html).toContain("Claim your account");
    expect(email.html).toContain("Healthfit.ai");
    expect(email.text).toContain("Plan: Pro");
    expect(email.text).toContain("token_hash=abc");
  });
});
