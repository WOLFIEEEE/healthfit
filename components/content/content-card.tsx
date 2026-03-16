import Link from "next/link";
import { format } from "date-fns";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { SanityImage } from "@/components/sanity/sanity-image";
import {
  getContentHref,
  getSectionForDocumentType,
} from "@/sanity/lib/content";
import type { SanityContentItem } from "@/sanity/lib/types";

type ContentCardProps = {
  item: SanityContentItem;
  priority?: boolean;
};

export function ContentCard({ item, priority = false }: ContentCardProps) {
  const section = getSectionForDocumentType(item._type);
  const href = section ? getContentHref(section.key, item.slug) : "#";
  const publishedLabel = item.publishedAt
    ? format(new Date(item.publishedAt), "MMM d, yyyy")
    : "Draft";

  return (
    <article className="soft-panel flex h-full flex-col overflow-hidden">
      <SanityImage
        image={item.featuredImage}
        alt={item.featuredImage?.alt ?? item.title}
        width={960}
        height={560}
        priority={priority}
        sizes="(min-width: 1280px) 28vw, (min-width: 768px) 42vw, 100vw"
        className="aspect-[16/10] w-full object-cover"
      />
      <div className="flex flex-1 flex-col px-6 py-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          {section ? <span className="pill">{section.shortLabel}</span> : null}
          {item.category?.title ? (
            <span className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground">
              {item.category.title}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-white/70 px-3 py-1 text-muted-foreground">
            <Clock3 className="size-3.5" />
            {item.readTimeMinutes ?? 5} min
          </span>
        </div>
        <h3 className="mt-5 text-2xl font-semibold leading-tight">{item.title}</h3>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.excerpt}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>{publishedLabel}</span>
          {item.author?.name ? (
            <>
              <span className="size-1 rounded-full bg-border" />
              <span>{item.author.name}</span>
            </>
          ) : null}
          {item.sourceName ? (
            <>
              <span className="size-1 rounded-full bg-border" />
              <span>{item.sourceName}</span>
            </>
          ) : null}
        </div>
        <Link
          href={href}
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary"
        >
          Read more
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}
