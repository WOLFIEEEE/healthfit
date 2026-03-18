import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ContentCard } from "./content-card";
import type { SanityContentItem } from "@/sanity/lib/types";

type ContentListSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  items: SanityContentItem[];
  href?: string;
};

export function ContentListSection({
  eyebrow,
  title,
  description,
  items,
  href,
}: ContentListSectionProps) {
  return (
    <section className="page-shell py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="pill">{eyebrow}</p>
          <h2 className="mt-4 text-4xl font-semibold">{title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            {description}
          </p>
        </div>
        {href ? (
          <Link
            href={href}
            className="inline-flex items-center rounded-full border border-border bg-white/80 px-5 py-3 text-sm font-medium"
          >
            Explore section
            <ArrowRight className="ml-2 size-4" />
          </Link>
        ) : null}
      </div>
      {items.length ? (
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
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
      ) : (
        <div className="mt-8 rounded-[1.75rem] border border-border/70 bg-white/80 px-6 py-8 text-sm text-muted-foreground">
          No published entries in this section yet. Add content in Sanity Studio and
          it will appear here automatically.
        </div>
      )}
    </section>
  );
}
