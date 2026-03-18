"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNav, dashboardNav } from "@/lib/config/navigation";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/healthfit/brand-mark";

type AppShellProps = {
  children: React.ReactNode;
  user: {
    fullName: string;
    email: string;
    planLabel: string;
    role: "member" | "admin";
  };
};

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();
  const workspaceNav = user.role === "admin" ? [...dashboardNav, ...adminNav] : dashboardNav;

  return (
    <div className="page-shell flex min-h-screen flex-col gap-4 py-4 sm:gap-6 sm:py-6 lg:flex-row">
      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="soft-panel sticky top-6 flex min-h-[calc(100vh-3rem)] flex-col px-5 py-5">
          <BrandMark compact />
          <div className="brand-wash mt-8 rounded-[1.5rem] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              {user.role === "admin" ? "Admin workspace" : "Member workspace"}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">
              {user.fullName}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
            <div className="pill mt-4">{user.planLabel}</div>
          </div>
          <nav className="mt-6 space-y-1">
            {workspaceNav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition",
                    active
                      ? "bg-primary text-primary-foreground shadow-[0_18px_36px_-26px_rgba(56,125,78,0.52)]"
                      : "text-muted-foreground hover:bg-white/70 hover:text-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto space-y-3">
            <div className="surface-card px-4 py-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Workspace standard</p>
              <p className="mt-2">
                Billing, coaching, progress, and settings stay in one member control
                center.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-foreground px-4 py-4 text-sm text-white">
              <p className="font-medium">Wellness reminder</p>
              <p className="mt-2 text-white/70">
                Healthfit.ai supports non-clinical wellness routines only and does
                not replace professional medical care.
              </p>
            </div>
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-1 space-y-6">
        <div className="soft-panel flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5 lg:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <BrandMark compact />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {user.fullName}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="pill shrink-0">{user.planLabel}</div>
        </div>
        <div className="flex gap-2 overflow-x-auto rounded-full bg-white/70 p-2 shadow-[0_18px_40px_-34px_rgba(61,110,71,0.28)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden">
          {workspaceNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-xs",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}
              >
                <Icon className="size-3.5" />
                {item.label}
              </Link>
            );
          })}
        </div>
        {children}
      </div>
    </div>
  );
}
