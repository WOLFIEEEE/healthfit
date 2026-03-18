import Link from "next/link";
import { BrandMark } from "@/components/healthfit/brand-mark";

const platformLinks = [
  { label: "Product", href: "/#product" },
  { label: "Programs", href: "/#programs" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Sign in", href: "/login" },
];

const editorialLinks = [
  { label: "Insights", href: "/insights" },
  { label: "Resources", href: "/resources" },
  { label: "Blog", href: "/blog" },
  { label: "News", href: "/news" },
];

const trustLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Billing policy", href: "/billing-policy" },
  { label: "Disclaimer", href: "/disclaimer" },
  { label: "Contact", href: "/contact" },
];

function FooterColumn(props: {
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
        {props.title}
      </p>
      <div className="mt-4 space-y-3">
        {props.links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-[linear-gradient(180deg,rgba(255,252,247,0),rgba(246,250,243,0.92))]">
      <div className="page-shell pb-10 pt-16 sm:pt-20">
        <section className="rounded-[1.9rem] border border-border/70 bg-white/76 px-6 py-7 shadow-[0_24px_70px_-48px_rgba(41,84,59,0.28)] backdrop-blur-sm sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                Minimal wellness workspace
              </p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
                A calmer way to run your routines.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
                Healthfit.ai brings workouts, meals, habits, check-ins, and AI
                guidance into one clean system without making the experience feel
                crowded.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-full bg-foreground px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-primary"
              >
                Start free
              </Link>
              <Link
                href="/resources"
                className="rounded-full border border-border/80 bg-white px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:text-primary"
              >
                Browse resources
              </Link>
            </div>
          </div>
        </section>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.35fr_0.7fr_0.7fr_0.8fr]">
          <div className="max-w-sm">
            <BrandMark />
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Wellness-first coaching, adaptive planning, and progress tracking
              for members who want one dependable place to keep their routine on track.
            </p>
          </div>
          <FooterColumn title="Platform" links={platformLinks} />
          <FooterColumn title="Editorial" links={editorialLinks} />
          <FooterColumn title="Trust" links={trustLinks} />
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Healthfit.ai. Wellness guidance only.</p>
          <div className="flex flex-wrap items-center gap-4">
            <span>Non-clinical support only</span>
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              Privacy
            </Link>
            <Link href="/contact" className="transition-colors hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
