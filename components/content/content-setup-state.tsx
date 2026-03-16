import Link from "next/link";

type ContentSetupStateProps = {
  title: string;
  description: string;
  showStudioLink?: boolean;
};

export function ContentSetupState({
  title,
  description,
  showStudioLink = true,
}: ContentSetupStateProps) {
  return (
    <section className="soft-panel px-6 py-8">
      <p className="pill">Sanity connection needed</p>
      <h2 className="mt-5 text-3xl font-semibold">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
        {description}
      </p>
      <div className="mt-6 rounded-[1.5rem] border border-border/70 bg-white/80 p-5">
        <p className="text-sm font-medium text-foreground">Required environment variables</p>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li><code>NEXT_PUBLIC_SANITY_PROJECT_ID</code></li>
          <li><code>NEXT_PUBLIC_SANITY_DATASET</code></li>
          <li><code>SANITY_API_VERSION</code></li>
          <li><code>SANITY_REVALIDATE_SECRET</code></li>
        </ul>
      </div>
      {showStudioLink ? (
        <Link
          href="/studio"
          className="mt-6 inline-flex rounded-full border border-border bg-white/80 px-4 py-3 text-sm font-medium"
        >
          Open studio route
        </Link>
      ) : null}
    </section>
  );
}
