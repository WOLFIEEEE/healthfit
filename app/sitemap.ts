import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config/site";
import { resourceEntries } from "@/lib/content/resources";
import { getSitemapContentEntries } from "@/sanity/lib/api";
import { getSectionForDocumentType } from "@/sanity/lib/content";

const siteUrl = siteConfig.url.replace(/\/$/, "");
const staticRoutes: Array<{
  route: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
}> = [
  { route: "", changeFrequency: "weekly", priority: 1 },
  { route: "/insights", changeFrequency: "weekly", priority: 0.92 },
  { route: "/blog", changeFrequency: "weekly", priority: 0.85 },
  { route: "/articles", changeFrequency: "weekly", priority: 0.85 },
  { route: "/news", changeFrequency: "daily", priority: 0.82 },
  { route: "/guides", changeFrequency: "weekly", priority: 0.84 },
  { route: "/resources", changeFrequency: "weekly", priority: 0.9 },
  { route: "/privacy", changeFrequency: "monthly", priority: 0.5 },
  { route: "/terms", changeFrequency: "monthly", priority: 0.5 },
  { route: "/billing-policy", changeFrequency: "monthly", priority: 0.5 },
  { route: "/disclaimer", changeFrequency: "monthly", priority: 0.5 },
  { route: "/contact", changeFrequency: "monthly", priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sanityEntries = await getSitemapContentEntries();
  const contentRoutes: MetadataRoute.Sitemap = [];

  sanityEntries.forEach((entry) => {
    const section = getSectionForDocumentType(entry._type);

    if (!section) {
      return;
    }

    contentRoutes.push({
      url: `${siteUrl}${section.href}/${entry.slug}`,
      lastModified: entry._updatedAt ?? entry.publishedAt ?? new Date(),
      changeFrequency: section.key === "news" ? "daily" : "weekly",
      priority:
        section.key === "news"
          ? 0.78
          : section.key === "guides"
            ? 0.8
            : 0.77,
    });
  });

  return [
    ...staticRoutes.map((item) => ({
      url: `${siteUrl}${item.route}`,
      lastModified: new Date(),
      changeFrequency: item.changeFrequency,
      priority: item.priority,
    })),
    ...resourceEntries.map((resource) => ({
      url: `${siteUrl}/resources/${resource.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: resource.kind === "guide" ? 0.8 : 0.75,
    })),
    ...contentRoutes,
  ];
}
