import Link from "next/link";
import { contentSections, type ContentSectionKey } from "@/sanity/lib/content";

type ContentSectionNavProps = {
  active?: ContentSectionKey | "insights";
};

export function ContentSectionNav({ active }: ContentSectionNavProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href="/insights"
        className={`rounded-full border px-4 py-2 text-sm transition ${
          active === "insights"
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-border bg-white/80 text-muted-foreground hover:text-foreground"
        }`}
      >
        All insights
      </Link>
      {contentSections.map((section) => (
        <Link
          key={section.key}
          href={section.href}
          className={`rounded-full border px-4 py-2 text-sm transition ${
            active === section.key
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-border bg-white/80 text-muted-foreground hover:text-foreground"
          }`}
        >
          {section.title}
        </Link>
      ))}
    </div>
  );
}
