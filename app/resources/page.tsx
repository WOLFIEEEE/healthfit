import type { Metadata } from "next";
import { FileText, Library, ShieldCheck } from "lucide-react";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { ResourceCard } from "@/components/resources/resource-card";
import { siteConfig } from "@/lib/config/site";
import {
  getFeaturedResources,
  getResourcesByCategory,
  getResourcesByKind,
  researchSources,
  resourceCategories,
  resourceEntries,
} from "@/lib/content/resources";

const guides = getResourcesByKind("guide");
const articles = getResourcesByKind("article");
const featuredResources = getFeaturedResources();
const siteUrl = siteConfig.url.replace(/\/$/, "");
const resourcesDescription =
  "Research-backed public health guides and articles built from CDC, NIH, USDA, FDA, and HHS guidance.";

export const metadata: Metadata = {
  title: "Health Resources",
  description: resourcesDescription,
  keywords: [
    "health resources",
    "evidence based wellness articles",
    "cdc nutrition and fitness guidance",
    "research backed health guides",
  ],
  alternates: {
    canonical: "/resources",
  },
  openGraph: {
    title: "Healthfit.ai Resources",
    description: resourcesDescription,
    url: `${siteUrl}/resources`,
    type: "website",
  },
};

const collectionStructuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Healthfit.ai Resources",
  description: resourcesDescription,
  url: `${siteUrl}/resources`,
  isPartOf: {
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteUrl,
  },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: resourceEntries.map((resource, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}/resources/${resource.slug}`,
      name: resource.title,
    })),
  },
};

export default function ResourcesPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(collectionStructuredData),
          }}
        />

        <section className="page-shell py-16 sm:py-20">
          <div className="soft-panel relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10">
            <div className="hero-grid absolute inset-0 opacity-40" />
            <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div>
                <p className="pill">Public health resource hub</p>
                <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.02] sm:text-5xl lg:text-6xl">
                  Clean, research-backed wellness pages built from official guidance.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                  This library summarizes public guidance from CDC, NIH, USDA, FDA,
                  and HHS. The goal is clarity, not hype: practical health
                  education grounded in the source material linked on every page.
                </p>
              </div>
              <div className="grid gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-1">
                {[
                  {
                    icon: Library,
                    label: "Research pages",
                    value: String(resourceEntries.length),
                  },
                  {
                    icon: FileText,
                    label: "Custom articles",
                    value: String(articles.length),
                  },
                  {
                    icon: ShieldCheck,
                    label: "Official sources reviewed",
                    value: String(researchSources.length),
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="rounded-[1.5rem] border border-border/70 bg-white/80 p-5"
                    >
                      <div className="inline-flex rounded-2xl bg-secondary p-3 text-primary">
                        <Icon className="size-5" />
                      </div>
                      <div className="mt-4 text-3xl font-semibold">{item.value}</div>
                      <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="page-shell py-4">
          <div className="flex flex-wrap gap-3">
            {resourceCategories.map((category) => (
              <div
                key={category}
                className="rounded-full border border-border bg-white/80 px-4 py-2 text-sm text-muted-foreground"
              >
                <span className="font-medium text-foreground">{category}</span>
                <span className="ml-2">
                  {getResourcesByCategory(category).length} pages
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="page-shell py-10">
          <div className="flex flex-col gap-4">
            <p className="pill">Featured reads</p>
            <h2 className="section-title">Start with foundational wellness topics</h2>
            <p className="section-copy">
              These pages cover clear public-health topics around activity, sleep,
              hydration, and everyday eating patterns.
            </p>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {featuredResources.map((resource) => (
              <ResourceCard key={resource.slug} resource={resource} />
            ))}
          </div>
        </section>

        <section className="page-shell py-10">
          <div className="flex flex-col gap-4">
            <p className="pill">Guides</p>
            <h2 className="section-title">Research-backed guides</h2>
            <p className="section-copy">
              Structured summaries of official guidance, organized for quick reading
              and backed by the underlying source pages.
            </p>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {guides.map((resource) => (
              <ResourceCard key={resource.slug} resource={resource} />
            ))}
          </div>
        </section>

        <section className="page-shell py-10">
          <div className="flex flex-col gap-4">
            <p className="pill">Custom articles</p>
            <h2 className="section-title">Synthesized articles built from multiple sources</h2>
            <p className="section-copy">
              These pieces combine related public-health guidance into one useful,
              source-linked article without adding unsupported claims.
            </p>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {articles.map((resource) => (
              <ResourceCard key={resource.slug} resource={resource} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
