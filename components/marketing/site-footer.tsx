import Link from "next/link";
import { BrandMark } from "@/components/healthfit/brand-mark";

const links = [
  { label: "Insights", href: "/insights" },
  { label: "Blog", href: "/blog" },
  { label: "News", href: "/news" },
  { label: "Resources", href: "/resources" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Billing policy", href: "/billing-policy" },
  { label: "Disclaimer", href: "/disclaimer" },
  { label: "Contact", href: "/contact" },
];

const productLinks = [
  { label: "Pricing", href: "/#pricing" },
  { label: "Programs", href: "/#programs" },
  { label: "Resources", href: "/resources" },
  { label: "Dashboard", href: "/dashboard/overview" },
];

export function SiteFooter() {
  return (
    <footer className="page-shell pb-10 pt-16">
      <div className="soft-panel grid gap-8 px-6 py-8 lg:grid-cols-[1.1fr_0.7fr_0.8fr]">
        <div className="space-y-3">
          <BrandMark />
          <p className="max-w-md text-sm text-muted-foreground">
            Healthfit.ai helps members build healthier routines through wellness
            guidance, adaptive planning, and accountable progress tracking.
          </p>
          <div className="surface-card max-w-md px-4 py-4 text-sm text-muted-foreground">
            Green-and-cream product system with protected member flows, billing,
            editorial growth pages, and wellness-bounded AI.
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Product</p>
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            {productLinks.map((item) => (
              <Link key={item.href} href={item.href} className="block hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Trust center</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
            {links.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
