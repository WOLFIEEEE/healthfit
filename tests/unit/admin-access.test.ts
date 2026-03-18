import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getConfiguredAdminEmails,
  getAdminEmailConfigLabel,
  isAdminEmail,
} from "@/lib/config/admin";
import { resolvePlanAccess } from "@/lib/healthfit/server/access";

describe("admin access configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reads admin emails from ADMIN_EMAIL", () => {
    vi.stubEnv("ADMIN_EMAIL", "owner@example.com, Ops@Example.com ");
    vi.stubEnv("HEALTHFIT_ADMIN_EMAILS", "");

    expect(getAdminEmailConfigLabel()).toBe("ADMIN_EMAIL");
    expect(getConfiguredAdminEmails()).toEqual([
      "owner@example.com",
      "ops@example.com",
    ]);
    expect(isAdminEmail("OPS@example.com")).toBe(true);
    expect(isAdminEmail("member@example.com")).toBe(false);
  });

  it("falls back to legacy HEALTHFIT_ADMIN_EMAILS when ADMIN_EMAIL is unset", () => {
    vi.stubEnv("ADMIN_EMAIL", "");
    vi.stubEnv("HEALTHFIT_ADMIN_EMAILS", "legacy@example.com");

    expect(getAdminEmailConfigLabel()).toBe("HEALTHFIT_ADMIN_EMAILS");
    expect(isAdminEmail("legacy@example.com")).toBe(true);
  });

  it("returns unrestricted access for admin accounts", () => {
    const access = resolvePlanAccess({
      role: "admin",
      currentPlanKey: "starter",
    });

    expect(access.plan.name).toBe("Admin access");
    expect(access.planSource).toBe("admin_override");
    expect(access.isUnlimited).toBe(true);
    expect(access.aiDailyLimit).toBeGreaterThan(1000);
    expect(access.maxActiveGoals).toBeGreaterThan(1000);
    expect(access.plan.entitlements.aiCoach).toBe(true);
    expect(access.plan.entitlements.prioritySupport).toBe(true);
  });
});
