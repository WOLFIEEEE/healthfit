import Link from "next/link";
import { marketingNav } from "@/lib/config/navigation";
import { BrandMark } from "@/components/healthfit/brand-mark";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="page-shell sticky top-0 z-40 pt-4">
      <div className="soft-panel flex items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-4">
          <BrandMark compact />
          <div className="hidden rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-xs font-medium text-primary xl:inline-flex">
            Green wellness SaaS
          </div>
        </div>
        <nav className="hidden items-center gap-6 md:flex">
          {marketingNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "rounded-full px-4 text-sm text-foreground hover:bg-primary/8"
            )}
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className={cn(
              buttonVariants(),
              "rounded-full px-4 text-sm shadow-[0_18px_36px_-22px_rgba(56,125,78,0.45)]"
            )}
          >
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}
