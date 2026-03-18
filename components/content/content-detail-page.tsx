import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpenText,
  Clock3,
  ExternalLink,
  Layers3,
  NotebookPen,
  Tag,
} from "lucide-react";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { buildArticleStructuredData, buildBreadcrumbStructuredData } from "@/lib/seo/schema";
import { getPortableTextHeadings } from "@/sanity/lib/portable-text";
import { urlForImage } from "@/sanity/lib/image";
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
  const contentPath = `${section.href}/${item.slug}`;
  const publishedLabel = item.publishedAt
    ? format(new Date(item.publishedAt), "MMMM d, yyyy")
    : "Draft";
  const headingItems = getPortableTextHeadings(item.body);
  const imageUrl = item.featuredImage
    ? urlForImage(item.featuredImage)?.width(1600).height(900).url()
    : null;
  const articleStructuredData = buildArticleStructuredData({
    title: item.seo?.metaTitle ?? item.title,
    description: item.seo?.metaDescription ?? item.excerpt ?? section.description,
    path: contentPath,
    image: imageUrl,
    publishedAt: item.publishedAt,
    section: section.title,
    keywords: item.tags?.length
      ? [...item.tags, section.title.toLowerCase(), "healthfit.ai"]
      : [section.title.toLowerCase(), "healthfit.ai"],
    authorName: item.author?.name,
    sourceUrl: item.sourceUrl,
  });
  const breadcrumbStructuredData = buildBreadcrumbStructuredData([
    { name: "Home", path: "/" },
    { name: "Insights", path: "/insights" },
    { name: section.title, path: section.href },
    { name: item.title, path: contentPath },
  ]);

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
            __html: JSON.stringify(breadcrumbStructuredData),
          }}
        />

        <section className="page-shell py-12 sm:py-16">
          <Link
            href={section.href}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to {section.title.toLowerCase()}
          </Link>

          <div className="mt-6 soft-panel relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10">
            <div className="hero-grid absolute inset-0 opacity-30" />
            <div className="relative grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="pill">{section.shortLabel}</span>
                  {item.category?.title ? (
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                      {item.category.title}
                    </span>
                  ) : null}
                  {item.featured ? (
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      Featured story
                    </span>
                  ) : null}
                </div>
                <h1 className="mt-5 max-w-4xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                  {item.title}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                  {item.excerpt}
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-border/70 bg-white/80 p-5">
                    <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                      <NotebookPen className="size-4 text-primary" />
                      By {item.author?.name ?? "Healthfit.ai editorial"}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {item.author?.role ??
                        "Editorial context and wellness education for the Healthfit.ai audience."}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-border/70 bg-white/80 p-5">
                    <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                      <Clock3 className="size-4 text-primary" />
                      {item.readTimeMinutes ?? 5} minute read
                    </p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      Published {publishedLabel}
                      {item.sourceName ? ` • Source: ${item.sourceName}` : ""}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-white/80 p-3 shadow-[0_32px_70px_-45px_rgba(30,70,49,0.35)] sm:p-4">
                  <SanityImage
                    image={item.featuredImage}
                    alt={item.featuredImage?.alt ?? item.title}
                    width={1400}
                    height={880}
                    priority
                    sizes="(min-width: 1280px) 52vw, 100vw"
                    className="aspect-[16/10] w-full rounded-[1.6rem] object-cover"
                  />
                </div>
                {item.featuredImage?.caption ? (
                  <p className="px-2 text-sm leading-6 text-muted-foreground">
                    {item.featuredImage.caption}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="page-shell py-4">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_21rem]">
            <article className="space-y-8">
              {headingItems.length ? (
                <section className="soft-panel px-6 py-6 sm:px-7">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <BookOpenText className="size-4 text-primary" />
                    Inside this piece
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {headingItems.map((heading, index) => (
                      <a
                        key={heading.slug}
                        href={`#${heading.slug}`}
                        className="rounded-[1.4rem] border border-border/70 bg-white/80 px-4 py-4 transition hover:border-primary/20 hover:bg-white"
                      >
                        <div className="flex gap-3">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {index + 1}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {heading.text}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                              {heading.level === "h2" ? "Main section" : "Subsection"}
                            </p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              ) : null}

              <div className="soft-panel space-y-6 px-6 py-6 sm:px-8 sm:py-8">
                <PortableTextRenderer value={item.body} />
              </div>
            </article>

            <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
              <section className="soft-panel px-6 py-6">
                <p className="pill">About the author</p>
                <div className="mt-5 flex items-start gap-4">
                  <div className="overflow-hidden rounded-[1.4rem] bg-secondary/70">
                    {item.author?.avatar ? (
                      <SanityImage
                        image={item.author.avatar}
                        alt={item.author.avatar.alt ?? item.author.name}
                        width={96}
                        height={96}
                        sizes="96px"
                        className="size-20 object-cover"
                      />
                    ) : (
                      <div className="flex size-20 items-center justify-center text-2xl font-semibold text-primary">
                        {(item.author?.name ?? "H").charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-foreground">
                      {item.author?.name ?? "Healthfit.ai editorial team"}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.author?.role ?? "Wellness editorial"}
                    </p>
                    {item.author?.bio ? (
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        {item.author.bio}
                      </p>
                    ) : null}
                  </div>
                </div>
              </section>

              <section className="soft-panel px-6 py-6">
                <p className="pill">Story details</p>
                <div className="mt-5 space-y-4">
                  {[
                    {
                      label: "Section",
                      value: section.title,
                      icon: Layers3,
                    },
                    {
                      label: "Published",
                      value: publishedLabel,
                      icon: NotebookPen,
                    },
                    {
                      label: "Reading time",
                      value: `${item.readTimeMinutes ?? 5} min`,
                      icon: Clock3,
                    },
                  ].map((detail) => {
                    const Icon = detail.icon;

                    return (
                      <div
                        key={detail.label}
                        className="rounded-[1.4rem] border border-border/70 bg-white/80 px-4 py-4"
                      >
                        <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                          <Icon className="size-3.5 text-primary" />
                          {detail.label}
                        </p>
                        <p className="mt-2 text-base font-semibold text-foreground">
                          {detail.value}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 rounded-[1.4rem] border border-border/70 bg-white/80 px-4 py-4">
                  <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    <Tag className="size-3.5 text-primary" />
                    Topics
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

                {item.sourceUrl ? (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex w-full items-center justify-between rounded-[1.4rem] border border-border/70 bg-white/80 px-4 py-4 text-sm font-medium text-foreground transition hover:border-primary/20"
                  >
                    <span>{item.sourceName ?? "Original source"}</span>
                    <ExternalLink className="size-4 text-primary" />
                  </a>
                ) : null}
              </section>

              <section className="soft-panel px-6 py-6">
                <p className="pill">Keep exploring</p>
                <h2 className="mt-4 text-2xl font-semibold">Continue the reading flow</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Move through the rest of the {section.title.toLowerCase()} section or
                  jump back to the broader editorial hub.
                </p>
                <div className="mt-5 space-y-3">
                  <Link
                    href="/insights"
                    className="inline-flex w-full items-center justify-between rounded-[1.4rem] border border-border bg-white/80 px-4 py-3 text-sm font-medium transition hover:border-primary/20"
                  >
                    Visit insights hub
                    <ArrowUpRight className="size-4 text-primary" />
                  </Link>
                  <Link
                    href={getContentHref(sectionKey)}
                    className="inline-flex w-full items-center justify-between rounded-[1.4rem] border border-border bg-white/80 px-4 py-3 text-sm font-medium transition hover:border-primary/20"
                  >
                    Explore {section.title.toLowerCase()}
                    <ArrowUpRight className="size-4 text-primary" />
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
              {relatedItems.map((relatedItem, index) => (
                <div
                  key={relatedItem._id}
                  className={index === 0 && relatedItems.length > 2 ? "lg:col-span-2" : undefined}
                >
                  <ContentCard
                    item={relatedItem}
                    variant={
                      index === 0 && relatedItems.length > 2 ? "featured" : "default"
                    }
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
