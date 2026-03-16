import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, BookOpenText, Clock3, ShieldCheck } from "lucide-react";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { ResourceCard } from "@/components/resources/resource-card";
import { ResourceSourceList } from "@/components/resources/resource-source-list";
import { siteConfig } from "@/lib/config/site";
import {
  getRelatedResources,
  getResourceBySlug,
  getSourceById,
  getSourcesForResource,
  resourceEntries,
} from "@/lib/content/resources";

type ResourcePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const siteUrl = siteConfig.url.replace(/\/$/, "");

export const dynamicParams = false;

export function generateStaticParams() {
  return resourceEntries.map((resource) => ({
    slug: resource.slug,
  }));
}

export async function generateMetadata({
  params,
}: ResourcePageProps): Promise<Metadata> {
  const { slug } = await params;
  const resource = getResourceBySlug(slug);

  if (!resource) {
    return {};
  }

  return {
    title: resource.seoTitle,
    description: resource.description,
    keywords: resource.keywords,
    alternates: {
      canonical: `/resources/${resource.slug}`,
    },
    openGraph: {
      title: resource.seoTitle,
      description: resource.description,
      url: `${siteUrl}/resources/${resource.slug}`,
      type: "article",
    },
  };
}

export default async function ResourcePage({ params }: ResourcePageProps) {
  const { slug } = await params;
  const resource = getResourceBySlug(slug);

  if (!resource) {
    notFound();
  }

  const relatedResources = getRelatedResources(resource);
  const sources = getSourcesForResource(resource);
  const resourceUrl = `${siteUrl}/resources/${resource.slug}`;

  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: resource.title,
    description: resource.description,
    mainEntityOfPage: resourceUrl,
    url: resourceUrl,
    isAccessibleForFree: true,
    articleSection: resource.category,
    keywords: resource.keywords,
    author: {
      "@type": "Organization",
      name: "Healthfit.ai Research Team",
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteUrl,
    },
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteUrl,
    },
    citation: sources.map((source) => source.url),
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: resource.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Resources",
        item: `${siteUrl}/resources`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: resource.title,
        item: resourceUrl,
      },
    ],
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(articleStructuredData),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqStructuredData),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbStructuredData),
          }}
        />

        <section className="page-shell py-12 sm:py-16">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to resources
          </Link>

          <div className="mt-6 soft-panel relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10">
            <div className="hero-grid absolute inset-0 opacity-35" />
            <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="pill">{resource.hero.eyebrow}</span>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                    {resource.category}
                  </span>
                </div>
                <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl">
                  {resource.title}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                  {resource.hero.summary}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-[1.5rem] border border-border/70 bg-white/80 p-5">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Key stat
                  </p>
                  <div className="mt-3 text-3xl font-semibold">{resource.hero.statValue}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{resource.hero.statLabel}</p>
                </div>
                <div className="rounded-[1.5rem] border border-border/70 bg-white/80 p-5">
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                    <Clock3 className="size-4 text-primary" />
                    {resource.readingMinutes} minute read
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    Built from official sources linked below and written as
                    wellness education, not medical advice.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-border/70 bg-white/80 p-5">
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                    <ShieldCheck className="size-4 text-primary" />
                    Wellness scope
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    This page summarizes public guidance and does not diagnose,
                    treat, or replace professional care.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="page-shell py-4">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_0.05fr_1fr]">
            <article className="space-y-8">
              <section className="soft-panel px-6 py-6">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <BookOpenText className="size-4 text-primary" />
                  What this page covers
                </div>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                  {resource.summaryPoints.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span className="mt-2 size-2 rounded-full bg-primary/70" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {resource.sections.map((section) => {
                const sectionSources = section.sourceIds
                  .map((sourceId) => getSourceById(sourceId))
                  .filter(
                    (
                      source
                    ): source is NonNullable<ReturnType<typeof getSourceById>> =>
                      Boolean(source)
                  );

                return (
                  <section key={section.title} className="soft-panel px-6 py-6">
                    <h2 className="text-3xl font-semibold">{section.title}</h2>
                    <div className="mt-5 space-y-5 text-base leading-8 text-muted-foreground">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                    {section.bullets?.length ? (
                      <ul className="mt-5 space-y-3 text-sm leading-7 text-muted-foreground">
                        {section.bullets.map((bullet) => (
                          <li key={bullet} className="flex gap-3">
                            <span className="mt-2 size-2 rounded-full bg-primary/70" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <div className="mt-6 flex flex-wrap gap-2">
                      {sectionSources.map((source) => (
                        <a
                          key={`${section.title}-${source.id}`}
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-2 text-xs font-medium text-muted-foreground transition hover:text-foreground"
                        >
                          {source.publisher}
                          <ArrowUpRight className="size-3.5" />
                        </a>
                      ))}
                    </div>
                  </section>
                );
              })}
            </article>

            <div />

            <aside className="space-y-8">
              <ResourceSourceList sources={sources} />

              <section className="soft-panel px-6 py-6">
                <p className="pill">FAQ</p>
                <h2 className="mt-4 text-3xl font-semibold">Common questions</h2>
                <div className="mt-6 space-y-4">
                  {resource.faq.map((item) => (
                    <details
                      key={item.question}
                      className="rounded-[1.5rem] border border-border/70 bg-white/80 p-5"
                    >
                      <summary className="cursor-pointer list-none text-lg font-semibold">
                        {item.question}
                      </summary>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        {item.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </section>

        <section className="page-shell py-12">
          <div className="flex flex-col gap-4">
            <p className="pill">Related reading</p>
            <h2 className="section-title">More research-backed pages</h2>
            <p className="section-copy">
              Continue with nearby topics in the same wellness area.
            </p>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {relatedResources.map((relatedResource) => (
              <ResourceCard key={relatedResource.slug} resource={relatedResource} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
