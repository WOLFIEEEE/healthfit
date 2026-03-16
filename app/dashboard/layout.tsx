import { AppShell } from "@/components/dashboard/app-shell";
import { getPlanByKey } from "@/lib/config/plans";
import { requireCurrentAppUser } from "@/lib/healthfit/server/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireCurrentAppUser();
  const plan = getPlanByKey(user.currentPlanKey);

  return (
    <AppShell
      user={{
        fullName: user.fullName ?? user.email.split("@")[0],
        email: user.email,
        planLabel: plan.name,
      }}
    >
      {children}
    </AppShell>
  );
}
