import type { Metadata } from "next";
import { AppShell } from "@/components/dashboard/app-shell";
import { buildNoIndexMetadata } from "@/lib/seo/metadata";
import { requireCurrentAppUser } from "@/lib/healthfit/server/auth";
import { getAdminAccessPlan } from "@/lib/healthfit/server/access";
import { getPlanByKey } from "@/lib/config/plans";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Member Dashboard",
  description: "Authenticated Healthfit.ai member workspace.",
});

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireCurrentAppUser();
  const plan =
    user.role === "admin" ? getAdminAccessPlan() : getPlanByKey(user.currentPlanKey);

  return (
    <AppShell
      user={{
        fullName: user.fullName ?? user.email.split("@")[0],
        email: user.email,
        planLabel: plan.name,
        role: user.role as "member" | "admin",
      }}
    >
      {children}
    </AppShell>
  );
}
