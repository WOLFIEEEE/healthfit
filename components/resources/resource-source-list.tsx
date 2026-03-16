import type { ResearchSource } from "@/lib/content/resources";

type ResourceSourceListProps = {
  sources: ResearchSource[];
};

export function ResourceSourceList({ sources }: ResourceSourceListProps) {
  return (
    <section className="soft-panel px-6 py-6">
      <div className="flex flex-col gap-2">
        <p className="pill">Sources reviewed</p>
        <h2 className="text-3xl font-semibold">Official references used on this page</h2>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
          Every claim on this page is grounded in the public guidance linked below.
        </p>
      </div>
      <div className="mt-6 grid gap-4">
        {sources.map((source) => (
          <article
            key={source.id}
            className="rounded-[1.5rem] border border-border/70 bg-white/80 p-5"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
              <span>{source.publisher}</span>
              <span className="size-1 rounded-full bg-border" />
              <span>{source.updated}</span>
            </div>
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block text-lg font-semibold leading-tight text-foreground transition hover:text-primary"
            >
              {source.title}
            </a>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{source.notes}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
