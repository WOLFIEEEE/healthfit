import { PlanCatalogItem, PlanKey } from "@/lib/healthfit/contracts";

const starterProductId = process.env.DODO_STARTER_PRODUCT_ID;
const proProductId = process.env.DODO_PRO_PRODUCT_ID;
const eliteProductId = process.env.DODO_ELITE_PRODUCT_ID;

export const planCatalog: PlanCatalogItem[] = [
  {
    key: "starter",
    name: "Starter",
    tagline: "Build your baseline and stay consistent.",
    description:
      "Track workouts, meals, habits, hydration, and weekly progress with a clean wellness dashboard.",
    monthlyPrice: 0,
    annualPrice: 0,
    currency: "USD",
    badge: "Best for getting started",
    accentClassName: "from-white via-emerald-50 to-lime-50",
    dodoProductId: starterProductId,
    entitlements: {
      aiCoach: false,
      weeklyPrograms: true,
      advancedAnalytics: false,
      premiumPrograms: false,
      progressPhotos: false,
      prioritySupport: false,
      customHabitTemplates: true,
      aiDailyMessages: 0,
      maxActiveGoals: 2,
    },
    features: [
      "Goal-based onboarding",
      "Workout and meal logging",
      "Hydration and habit tracking",
      "Weekly dashboard and milestones",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    tagline: "Your everyday AI health and fitness coach.",
    description:
      "Unlock adaptive coaching, weekly programs, personalized nutrition guidance, and richer accountability.",
    monthlyPrice: 29,
    annualPrice: 290,
    currency: "USD",
    featured: true,
    badge: "Most popular",
    accentClassName: "from-emerald-100 via-white to-stone-50",
    dodoProductId: proProductId,
    entitlements: {
      aiCoach: true,
      weeklyPrograms: true,
      advancedAnalytics: true,
      premiumPrograms: false,
      progressPhotos: true,
      prioritySupport: false,
      customHabitTemplates: true,
      aiDailyMessages: 25,
      maxActiveGoals: 5,
    },
    features: [
      "AI coach chat",
      "Adaptive weekly programs",
      "Macro guidance and meal ideas",
      "Advanced progress analytics",
    ],
  },
  {
    key: "elite",
    name: "Elite",
    tagline: "Premium guidance for ambitious routines.",
    description:
      "Go deeper with higher AI limits, premium programming, advanced insights, and white-glove support.",
    monthlyPrice: 79,
    annualPrice: 790,
    currency: "USD",
    badge: "Performance tier",
    accentClassName: "from-emerald-200 via-emerald-50 to-stone-50",
    dodoProductId: eliteProductId,
    entitlements: {
      aiCoach: true,
      weeklyPrograms: true,
      advancedAnalytics: true,
      premiumPrograms: true,
      progressPhotos: true,
      prioritySupport: true,
      customHabitTemplates: true,
      aiDailyMessages: 100,
      maxActiveGoals: 10,
    },
    features: [
      "Everything in Pro",
      "Premium transformation programs",
      "Higher AI message limits",
      "Priority support and concierge nudges",
    ],
  },
];

export const defaultPlanKey: PlanKey = "starter";

export function getPlanByKey(planKey: PlanKey | string | null | undefined) {
  return planCatalog.find((plan) => plan.key === planKey) ?? planCatalog[0];
}

export function getPlanByProductId(productId: string | null | undefined) {
  if (!productId) return null;
  return planCatalog.find((plan) => plan.dodoProductId === productId) ?? null;
}
