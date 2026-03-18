import Link from "next/link";
import { format } from "date-fns";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { SanityImage } from "@/components/sanity/sanity-image";
import { cn } from "@/lib/utils";
import {
  getContentHref,
  getSectionForDocumentType,
} from "@/sanity/lib/content";
import type { SanityContentItem } from "@/sanity/lib/types";

type ContentCardProps = {
  item: SanityContentItem;
  priority?: boolean;
  variant?: "default" | "featured";
};

export function ContentCard({
  item,
  priority = false,
  variant = "default",
}: ContentCardProps) {
  const section = getSectionForDocumentType(item._type);
  const href = section ? getContentHref(section.key, item.slug) : "#";
  const publishedLabel = item.publishedAt
    ? format(new Date(item.publishedAt), "MMM d, yyyy")
    : "Draft";
  const featured = variant === "featured";

  return (
    <article
      className={cn(
        "group soft-panel flex h-full flex-col overflow-hidden",
        featured && "min-h-full"
      )}
    >
      <div className="relative overflow-hidden">
        <SanityImage
          image={item.featuredImage}
          alt={item.featuredImage?.alt ?? item.title}
          width={featured ? 1200 : 960}
          height={featured ? 720 : 560}
          priority={priority}
          sizes={
            featured
              ? "(min-width: 1280px) 56vw, (min-width: 768px) 66vw, 100vw"
              : "(min-width: 1280px) 28vw, (min-width: 768px) 42vw, 100vw"
          }
          className={cn(
            "w-full object-cover transition duration-700 group-hover:scale-[1.03]",
            featured ? "aspect-[16/9]" : "aspect-[16/10]"
          )}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/22 via-transparent to-transparent" />
      </div>
      <div className={cn("flex flex-1 flex-col px-6 py-6", featured && "sm:px-7 sm:py-7")}>
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
        <h3
          className={cn(
            "mt-5 font-semibold leading-tight tracking-tight text-foreground",
            featured ? "text-3xl sm:text-[2.15rem]" : "text-2xl"
          )}
        >
          {item.title}
        </h3>
        <p
          className={cn(
            "mt-3 text-muted-foreground",
            featured ? "max-w-2xl text-base leading-8" : "text-sm leading-7"
          )}
        >
          {item.excerpt}
        </p>
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
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary transition group-hover:translate-x-0.5"
        >
          Read more
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}
