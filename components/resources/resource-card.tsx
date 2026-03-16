import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import type { ResourceEntry } from "@/lib/content/resources";

type ResourceCardProps = {
  resource: ResourceEntry;
};

export function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <article className="soft-panel flex h-full flex-col px-6 py-6">
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
        <span className="pill">{resource.kind === "guide" ? "Guide" : "Article"}</span>
        <span className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground">
          {resource.category}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-white/70 px-3 py-1 text-muted-foreground">
          <Clock3 className="size-3.5" />
          {resource.readingMinutes} min
        </span>
      </div>
      <div className="mt-5 flex-1">
        <h3 className="text-2xl font-semibold leading-tight">{resource.title}</h3>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          {resource.description}
        </p>
        <div className="mt-5 rounded-[1.5rem] border border-border/70 bg-white/80 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Key stat
          </p>
          <div className="mt-2 text-2xl font-semibold">{resource.hero.statValue}</div>
          <p className="mt-1 text-sm text-muted-foreground">{resource.hero.statLabel}</p>
        </div>
        <ul className="mt-5 space-y-3 text-sm leading-6 text-muted-foreground">
          {resource.summaryPoints.slice(0, 2).map((point) => (
            <li key={point} className="flex gap-3">
              <span className="mt-2 size-2 rounded-full bg-primary/70" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
      <Link
        href={`/resources/${resource.slug}`}
        className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary"
      >
        Read {resource.kind}
        <ArrowUpRight className="size-4" />
      </Link>
    </article>
  );
}
