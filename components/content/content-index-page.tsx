import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
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

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="page-shell py-16 sm:py-20">
          <div className="soft-panel relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10">
            <div className="hero-grid absolute inset-0 opacity-35" />
            <div className="relative space-y-6">
              <p className="pill">{section.title}</p>
              <h1 className="max-w-4xl text-4xl font-semibold leading-[1.02] sm:text-5xl lg:text-6xl">
                {section.title} powered directly by Sanity.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                {section.description}
              </p>
              <ContentSectionNav active={sectionKey} />
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
                <ContentCard key={item._id} item={item} priority={index === 0} />
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
