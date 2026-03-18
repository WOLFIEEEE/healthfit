import {
  BarChart3,
  BrainCircuit,
  ClipboardCheck,
  CreditCard,
  Dumbbell,
  Home,
  Settings,
  Shield,
  Sparkles,
  Trophy,
  Users,
  UtensilsCrossed,
} from "lucide-react";

export const marketingNav = [
  { label: "Product", href: "/#product" },
  { label: "Programs", href: "/#programs" },
  { label: "Platform", href: "/#platform" },
  { label: "Insights", href: "/insights" },
  { label: "Resources", href: "/resources" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Trust", href: "/#trust" },
];

export const dashboardNav = [
  { label: "Overview", href: "/dashboard/overview", icon: Home },
  { label: "Coach", href: "/dashboard/coach", icon: BrainCircuit },
  { label: "Workouts", href: "/dashboard/workouts", icon: Dumbbell },
  { label: "Nutrition", href: "/dashboard/nutrition", icon: UtensilsCrossed },
  { label: "Habits", href: "/dashboard/habits", icon: Sparkles },
  { label: "Check-ins", href: "/dashboard/check-ins", icon: ClipboardCheck },
  { label: "Progress", href: "/dashboard/progress", icon: BarChart3 },
  { label: "Achievements", href: "/dashboard/achievements", icon: Trophy },
  { label: "Community", href: "/dashboard/community", icon: Users },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export const adminNav = [
  { label: "Admin", href: "/admin", icon: Shield },
];
