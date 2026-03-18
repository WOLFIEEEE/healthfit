import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { buildCollectionStructuredData } from "@/lib/seo/schema";
import { contentSections, type ContentSectionKey } from "@/sanity/lib/content";
import type { SanityContentItem } from "@/sanity/lib/types";
import { ContentCard } from "./content-card";
import { ContentSectionNav } from "./content-section-nav";
import { ContentSetupState } from "./content-setup-state";

type ContentIndexPageProps = {
  sectionKey: ContentSectionKey;
  items: SanityContentItem[];
  showSetupState?: boolean;
};

export function ContentIndexPage({
  sectionKey,
  items,
  showSetupState = false,
}: ContentIndexPageProps) {
  const section = contentSections.find((entry) => entry.key === sectionKey)!;
  const collectionStructuredData = buildCollectionStructuredData({
    name: `${section.title} | Healthfit.ai`,
    description: section.description,
    path: section.href,
    items: items.map((item) => ({
      name: item.title,
      path: `${section.href}/${item.slug}`,
    })),
  });
  const latestPublishedItem = items.find((item) => item.publishedAt);

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
            <div className="hero-grid absolute inset-0 opacity-35" />
            <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
              <div className="space-y-6">
                <p className="pill">{section.title}</p>
                <h1 className="max-w-4xl text-4xl font-semibold leading-[1.02] sm:text-5xl lg:text-6xl">
                  Rich editorial pages for every {section.title.toLowerCase()} story.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                  {section.description}
                </p>
                <ContentSectionNav active={sectionKey} />
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {[
                  {
                    label: "Published entries",
                    value: String(items.length),
                  },
                  {
                    label: "Featured stories",
                    value: String(items.filter((item) => item.featured).length),
                  },
                  {
                    label: "Latest publish date",
                    value: latestPublishedItem?.publishedAt
                      ? new Date(latestPublishedItem.publishedAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )
                      : "Coming soon",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[1.5rem] border border-border/70 bg-white/80 p-5"
                  >
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="page-shell py-4">
          {showSetupState ? (
            <ContentSetupState
              title={`Connect Sanity to publish ${section.title.toLowerCase()}`}
              description={`Once the Sanity project ID, dataset, and revalidation secret are configured, editors can publish new ${section.title.toLowerCase()} here from the embedded studio.`}
            />
          ) : items.length === 0 ? (
            <ContentSetupState
              title={`Your ${section.title.toLowerCase()} section is ready`}
              description={`Sanity is connected, but this section does not have published entries yet. Add content in Studio and it will appear here automatically.`}
            />
          ) : (
            <div className="grid gap-5 lg:grid-cols-3">
              {items.map((item, index) => (
                <div
                  key={item._id}
                  className={index === 0 && items.length > 2 ? "lg:col-span-2" : undefined}
                >
                  <ContentCard
                    item={item}
                    priority={index === 0}
                    variant={index === 0 && items.length > 2 ? "featured" : "default"}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
