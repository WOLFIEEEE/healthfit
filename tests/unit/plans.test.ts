import { describe, expect, it } from "vitest";
import { getPlanByKey, getPlanByProductId, planCatalog } from "../../lib/config/plans";

describe("plan catalog", () => {
  it("returns starter as the fallback plan", () => {
    expect(getPlanByKey("unknown").key).toBe("starter");
  });

  it("keeps paid plan AI limits above zero", () => {
    const paidPlans = planCatalog.filter((plan) => plan.monthlyPrice > 0);
    expect(paidPlans.every((plan) => plan.entitlements.aiDailyMessages > 0)).toBe(
      true
    );
  });

  it("returns null for unmapped product ids", () => {
    expect(getPlanByProductId("does-not-exist")).toBeNull();
  });
});
