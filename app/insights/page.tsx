import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ContentListSection } from "@/components/content/content-list-section";
import { ContentSectionNav } from "@/components/content/content-section-nav";
import { ContentSetupState } from "@/components/content/content-setup-state";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { hasSanityConfig } from "@/sanity/env";
import { getContentHubData, getSectionContent } from "@/sanity/lib/api";
import { contentSections } from "@/sanity/lib/content";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Healthfit.ai editorial content powered by Sanity across blog posts, articles, news, and guides.",
  alternates: {
    canonical: "/insights",
  },
};

export default async function InsightsPage() {
  const [{ settings, featured, latest }, blogItems, articleItems, newsItems, guideItems] =
    await Promise.all([
      getContentHubData(),
      getSectionContent("blog", 3),
      getSectionContent("articles", 3),
      getSectionContent("news", 3),
      getSectionContent("guides", 3),
    ]);

  const showcaseTitle =
    settings?.contentHubHeading ?? "Editorial content managed directly through Sanity.";
  const showcaseDescription =
    settings?.contentHubDescription ??
    "This hub pulls from separate blog, article, news, and guide schemas so Healthfit.ai can publish cleanly across different editorial formats.";

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="page-shell py-16 sm:py-20">
          <div className="soft-panel relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10">
            <div className="hero-grid absolute inset-0 opacity-35" />
            <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <p className="pill">{settings?.contentHubEyebrow ?? "Sanity content hub"}</p>
                <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] sm:text-6xl">
                  {showcaseTitle}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                  {showcaseDescription}
                </p>
                <div className="mt-6">
                  <ContentSectionNav active="insights" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {contentSections.map((section) => (
                  <Link
                    key={section.key}
                    href={section.href}
                    className="rounded-[1.5rem] border border-border/70 bg-white/80 p-5 transition hover:border-primary/25 hover:bg-white"
                  >
                    <p className="text-sm font-medium text-foreground">{section.title}</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {section.description}
                    </p>
                    <span className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                      Explore
                      <ArrowRight className="ml-2 size-4" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {!hasSanityConfig ? (
          <section className="page-shell py-4">
            <ContentSetupState
              title="Sanity is wired but still needs project credentials"
              description="Once the Sanity environment variables are added, this hub will start pulling live editorial content directly from Studio."
            />
          </section>
        ) : (
          <>
            {featured.length ? (
              <ContentListSection
                eyebrow="Featured"
                title="Featured editorial picks"
                description="Use the Site settings document in Sanity to hand-pick featured entries, or let the featured flag drive this section."
                items={featured.slice(0, 3)}
              />
            ) : null}

            {latest.length ? (
              <ContentListSection
                eyebrow="Latest"
                title="Latest across all sections"
                description="A single feed that blends posts from blog, articles, news, and guides."
                items={latest.slice(0, 3)}
              />
            ) : null}

            <ContentListSection
              eyebrow="Blog"
              title="From the Healthfit.ai blog"
              description="Product thinking, team notes, and editorial perspectives."
              items={blogItems}
              href="/blog"
            />

            <ContentListSection
              eyebrow="Articles"
              title="Educational articles"
              description="Evergreen content focused on clarity and practical understanding."
              items={articleItems}
              href="/articles"
            />

            <ContentListSection
              eyebrow="News"
              title="Recent news and updates"
              description="Timely updates that editors can publish quickly without mixing them into evergreen sections."
              items={newsItems}
              href="/news"
            />

            <ContentListSection
              eyebrow="Guides"
              title="Actionable guides"
              description="Step-by-step pieces meant to help members apply routines and decisions over time."
              items={guideItems}
              href="/guides"
            />
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
