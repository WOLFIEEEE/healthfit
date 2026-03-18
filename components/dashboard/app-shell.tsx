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
  const navGroups = [
    { label: "Workspace", items: dashboardNav },
    ...(user.role === "admin" ? [{ label: "Admin", items: adminNav }] : []),
  ];
  const workspaceNav = navGroups.flatMap((group) => group.items);
  const currentItem =
    workspaceNav.find((item) => pathname === item.href) ?? dashboardNav[0];

  return (
    <div className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:grid lg:min-h-screen lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-stretch lg:px-0 lg:py-0">
      <aside className="hidden lg:block lg:min-h-screen">
        <div className="sticky top-0 flex min-h-screen max-h-screen flex-col rounded-none border border-r-0 border-white/70 bg-[linear-gradient(180deg,rgba(255,252,244,0.96),rgba(246,250,243,0.92))] shadow-[0_30px_90px_-42px_rgba(46,114,78,0.26)] backdrop-blur-xl">
          <div className="border-b border-border/60 px-5 py-5">
            <BrandMark compact />
            <div className="mt-5 rounded-[1.35rem] border border-border/70 bg-white/80 px-4 py-4 shadow-[0_20px_40px_-32px_rgba(61,110,71,0.28)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                {user.role === "admin" ? "Admin workspace" : "Member workspace"}
              </p>
              <div className="mt-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {user.fullName}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <div className="pill shrink-0">{user.planLabel}</div>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
            {navGroups.map((group, groupIndex) => (
              <div
                key={group.label}
                className={cn(
                  groupIndex === navGroups.length - 1
                    ? undefined
                    : "mb-5 border-b border-border/60 pb-5"
                )}
              >
                <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  {group.label}
                </p>
                <div className="mt-3 space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition",
                          active
                            ? "border-primary/20 bg-white/92 text-foreground shadow-[0_18px_36px_-30px_rgba(61,110,71,0.32)]"
                            : "border-transparent text-muted-foreground hover:border-white/70 hover:bg-white/62 hover:text-foreground"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-flex size-8 shrink-0 items-center justify-center rounded-lg transition",
                            active
                              ? "bg-primary/12 text-primary"
                              : "bg-white/65 text-muted-foreground group-hover:text-foreground"
                          )}
                        >
                          <Icon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1 truncate font-medium">
                          {item.label}
                        </span>
                        <span
                          className={cn(
                            "h-5 w-px rounded-full transition",
                            active ? "bg-primary/55" : "bg-transparent group-hover:bg-border/80"
                          )}
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border/60 px-5 py-5">
            <div className="rounded-[1.35rem] border border-border/70 bg-white/78 px-4 py-4 text-xs leading-6 text-muted-foreground">
              <p className="font-medium text-foreground">Wellness-only platform</p>
              <p className="mt-1">
                Guidance here supports routines and tracking, not diagnosis or
                treatment.
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0 space-y-6 lg:space-y-0 lg:py-6 lg:pr-6 xl:pr-8">
        <div className="soft-panel flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6 lg:hidden">
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
        <div className="grid grid-cols-2 gap-2 rounded-[1.5rem] bg-white/70 p-2 shadow-[0_18px_40px_-34px_rgba(61,110,71,0.28)] sm:grid-cols-3 lg:hidden">
          {workspaceNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex min-w-0 items-center gap-2 rounded-full px-3 py-2 text-xs",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/55 text-muted-foreground"
                )}
              >
                <Icon className="size-3.5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="lg:min-h-[calc(100vh-3rem)] lg:rounded-none lg:rounded-r-[2.25rem] lg:border lg:border-white/70 lg:bg-[linear-gradient(180deg,rgba(255,252,244,0.96),rgba(246,250,243,0.92))] lg:shadow-[0_30px_90px_-42px_rgba(46,114,78,0.26)] lg:backdrop-blur-xl">
          <div className="hidden items-center justify-between gap-4 border-b border-border/60 px-8 py-5 lg:flex">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                {user.role === "admin" ? "Admin console" : "Workspace"}
              </p>
              <h1 className="mt-2 text-2xl font-semibold">{currentItem.label}</h1>
            </div>
            <div className="pill shrink-0">{user.planLabel}</div>
          </div>

          <div className="lg:px-10 lg:py-8 xl:px-12">{children}</div>
        </div>
      </div>
    </div>
  );
}
