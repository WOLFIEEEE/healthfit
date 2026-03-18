import { getPlanByKey, getPlanByProductId } from "@/lib/config/plans";
import { PlanCatalogItem, UserRole } from "@/lib/healthfit/contracts";

export const ADMIN_UNLIMITED_AI_DAILY_MESSAGES = 1_000_000;
export const ADMIN_UNLIMITED_ACTIVE_GOALS = 1_000_000;

export function getAdminAccessPlan(): PlanCatalogItem {
  const elitePlan = getPlanByKey("elite");

  return {
    ...elitePlan,
    name: "Admin access",
    tagline: "Internal unrestricted workspace.",
    description:
      "Internal accounts bypass member billing gates and retain access across the full product surface.",
    badge: "Internal",
    entitlements: {
      ...elitePlan.entitlements,
      aiCoach: true,
      weeklyPrograms: true,
      advancedAnalytics: true,
      premiumPrograms: true,
      progressPhotos: true,
      prioritySupport: true,
      customHabitTemplates: true,
      aiDailyMessages: ADMIN_UNLIMITED_AI_DAILY_MESSAGES,
      maxActiveGoals: ADMIN_UNLIMITED_ACTIVE_GOALS,
    },
    features: [
      ...elitePlan.features,
      "Unlimited internal access",
      "Admin visibility across the workspace",
    ],
  };
}

export function resolvePlanAccess(args: {
  role: UserRole | string;
  currentPlanKey: string | null | undefined;
  activeEntitlementPlanKey?: string | null;
  activeEntitlementAiDailyLimit?: number | null;
  activeSubscriptionProductId?: string | null;
}) {
  if (args.role === "admin") {
    const plan = getAdminAccessPlan();

    return {
      plan,
      planSource: "admin_override",
      aiDailyLimit: ADMIN_UNLIMITED_AI_DAILY_MESSAGES,
      maxActiveGoals: ADMIN_UNLIMITED_ACTIVE_GOALS,
      isUnlimited: true,
      isAdminOverride: true,
    } as const;
  }

  const subscriptionPlan =
    getPlanByProductId(args.activeSubscriptionProductId ?? null) ?? null;
  const fallbackPlan = getPlanByKey(args.currentPlanKey);
  const entitlementPlan = args.activeEntitlementPlanKey
    ? getPlanByKey(args.activeEntitlementPlanKey)
    : null;
  const plan =
    subscriptionPlan ??
    (fallbackPlan.key !== "starter" ? fallbackPlan : entitlementPlan) ??
    fallbackPlan;

  let planSource = "assigned_default";

  if (subscriptionPlan) {
    planSource = "subscription";
  } else if (entitlementPlan) {
    planSource = "entitlement";
  }

  return {
    plan,
    planSource,
    aiDailyLimit: Math.max(
      args.activeEntitlementAiDailyLimit ?? 0,
      plan.entitlements.aiDailyMessages
    ),
    maxActiveGoals: plan.entitlements.maxActiveGoals,
    isUnlimited: false,
    isAdminOverride: false,
  } as const;
}
