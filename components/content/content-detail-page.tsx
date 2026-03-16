import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { PortableTextRenderer } from "@/components/sanity/portable-text";
import { SanityImage } from "@/components/sanity/sanity-image";
import { getContentHref, getSectionByKey, type ContentSectionKey } from "@/sanity/lib/content";
import type { SanityContentItem } from "@/sanity/lib/types";
import { ContentCard } from "./content-card";

type ContentDetailPageProps = {
  item: SanityContentItem;
  sectionKey: ContentSectionKey;
  relatedItems: SanityContentItem[];
};

export function ContentDetailPage({
  item,
  sectionKey,
  relatedItems,
}: ContentDetailPageProps) {
  const section = getSectionByKey(sectionKey);
  const publishedLabel = item.publishedAt
    ? format(new Date(item.publishedAt), "MMMM d, yyyy")
    : "Draft";

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="page-shell py-12 sm:py-16">
          <Link
            href={section.href}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to {section.title.toLowerCase()}
          </Link>

          <div className="mt-6 soft-panel px-6 py-8 sm:px-8 sm:py-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="pill">{section.shortLabel}</span>
              {item.category?.title ? (
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                  {item.category.title}
                </span>
              ) : null}
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl">
              {item.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              {item.excerpt}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>{publishedLabel}</span>
              {item.author?.name ? (
                <>
                  <span className="size-1 rounded-full bg-border" />
                  <span>{item.author.name}</span>
                </>
              ) : null}
              {item.readTimeMinutes ? (
                <>
                  <span className="size-1 rounded-full bg-border" />
                  <span>{item.readTimeMinutes} min read</span>
                </>
              ) : null}
              {item.sourceUrl ? (
                <>
                  <span className="size-1 rounded-full bg-border" />
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary"
                  >
                    {item.sourceName ?? "Source"}
                    <ExternalLink className="size-3.5" />
                  </a>
                </>
              ) : null}
            </div>
          </div>
        </section>

        <section className="page-shell py-4">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <article className="space-y-8">
              <SanityImage
                image={item.featuredImage}
                alt={item.featuredImage?.alt ?? item.title}
                width={1280}
                height={760}
                priority
                sizes="(min-width: 1024px) 64vw, 100vw"
                className="w-full rounded-[2rem] object-cover"
              />
              <div className="soft-panel space-y-6 px-6 py-6">
                <PortableTextRenderer value={item.body} />
              </div>
            </article>

            <aside className="space-y-8">
              <section className="soft-panel px-6 py-6">
                <p className="pill">At a glance</p>
                <div className="mt-5 grid gap-4">
                  <div className="rounded-[1.5rem] border border-border/70 bg-white/80 p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Section
                    </p>
                    <p className="mt-2 text-lg font-semibold">{section.title}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-border/70 bg-white/80 p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Author
                    </p>
                    <p className="mt-2 text-lg font-semibold">
                      {item.author?.name ?? "Healthfit.ai editorial team"}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-border/70 bg-white/80 p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Tags
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.tags?.length ? (
                        item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No tags yet</span>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <section className="soft-panel px-6 py-6">
                <p className="pill">Editorial flow</p>
                <h2 className="mt-4 text-3xl font-semibold">Continue reading</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Move through the rest of the {section.title.toLowerCase()} section or
                  head back to the full insights hub.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/insights"
                    className="rounded-full border border-border bg-white/80 px-4 py-3 text-sm font-medium"
                  >
                    Visit insights hub
                  </Link>
                  <Link
                    href={getContentHref(sectionKey)}
                    className="rounded-full border border-border bg-white/80 px-4 py-3 text-sm font-medium"
                  >
                    Explore {section.title.toLowerCase()}
                  </Link>
                </div>
              </section>
            </aside>
          </div>
        </section>

        {relatedItems.length ? (
          <section className="page-shell py-12">
            <div className="flex flex-col gap-4">
              <p className="pill">Related reading</p>
              <h2 className="section-title">More from {section.title.toLowerCase()}</h2>
              <p className="section-copy">
                Editors can curate or publish more entries directly from Sanity, and
                they will flow into this section automatically.
              </p>
            </div>
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {relatedItems.map((relatedItem) => (
                <ContentCard key={relatedItem._id} item={relatedItem} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
