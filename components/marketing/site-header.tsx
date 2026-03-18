"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { BrandMark } from "@/components/healthfit/brand-mark";
import { marketingNav } from "@/lib/config/navigation";
import { cn } from "@/lib/utils";

const primaryNav = marketingNav.filter((item) =>
  ["Product", "Programs", "Pricing", "Insights", "Resources"].includes(item.label)
);

function isActivePage(pathname: string, href: string) {
  if (href.startsWith("/#")) {
    return false;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";
  const elevated = !isHome || scrolled;

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "mx-auto max-w-7xl rounded-[1.6rem] border transition-all duration-300",
            elevated
              ? "border-border/70 bg-white/82 shadow-[0_20px_48px_-34px_rgba(37,77,57,0.28)] backdrop-blur-xl"
              : "border-white/14 bg-black/18 backdrop-blur-md"
          )}
        >
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
            <BrandMark compact tone={elevated ? "default" : "inverse"} />

            <nav className="hidden items-center gap-1 md:flex">
              {primaryNav.map((item) => {
                const active = isActivePage(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm transition-colors",
                      elevated
                        ? active
                          ? "bg-primary/10 text-foreground"
                          : "text-muted-foreground hover:bg-primary/8 hover:text-foreground"
                        : "text-white/72 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/login"
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  elevated
                    ? "text-muted-foreground hover:text-foreground"
                    : "text-white/75 hover:text-white"
                )}
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  elevated
                    ? "bg-foreground text-white hover:bg-primary"
                    : "bg-white text-foreground hover:bg-emerald-100"
                )}
              >
                Start free
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen((current) => !current)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              className={cn(
                "inline-flex items-center justify-center rounded-full p-2.5 transition-colors md:hidden",
                elevated
                  ? "bg-secondary/75 text-foreground"
                  : "bg-white/10 text-white"
              )}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>

          {mobileOpen ? (
            <div className="border-t border-border/60 px-4 pb-4 pt-3 md:hidden">
              <nav className="grid gap-1">
                {primaryNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-2xl px-4 py-3 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-4 grid gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full border border-border/80 px-4 py-3 text-center text-sm font-medium text-foreground"
                >
                  Sign in
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full bg-foreground px-4 py-3 text-center text-sm font-medium text-white"
                >
                  Start free
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </header>

      {!isHome ? <div aria-hidden className="h-24 sm:h-28" /> : null}
    </>
  );
}
