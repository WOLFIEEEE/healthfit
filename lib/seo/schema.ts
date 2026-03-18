import { siteConfig } from "@/lib/config/site";
import { siteUrl } from "./metadata";

type StructuredData = Record<string, unknown>;

function buildWebsiteEntity(input?: { description?: string }) {
  return {
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteUrl,
    description: input?.description ?? siteConfig.description,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteUrl,
    },
  };
}

function toAbsoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  if (pathOrUrl === "/") {
    return siteUrl;
  }

  return `${siteUrl}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

export function buildOrganizationStructuredData(): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteUrl,
    description: siteConfig.description,
  };
}

export function buildWebsiteStructuredData(input?: {
  description?: string;
}): StructuredData {
  return {
    "@context": "https://schema.org",
    ...buildWebsiteEntity(input),
  };
}

export function buildBreadcrumbStructuredData(
  items: Array<{ name: string; path: string }>
): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path),
    })),
  };
}

export function buildCollectionStructuredData(input: {
  name: string;
  description: string;
  path: string;
  items: Array<{ name: string; path: string }>;
}): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: toAbsoluteUrl(input.path),
    isPartOf: buildWebsiteEntity(),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: input.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: toAbsoluteUrl(item.path),
      })),
    },
  };
}

export function buildArticleStructuredData(input: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  publishedAt?: string;
  section?: string;
  keywords?: string[];
  authorName?: string | null;
  authorUrl?: string | null;
  sourceUrl?: string | null;
}): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    url: toAbsoluteUrl(input.path),
    mainEntityOfPage: toAbsoluteUrl(input.path),
    image: input.image ? [toAbsoluteUrl(input.image)] : undefined,
    datePublished: input.publishedAt,
    articleSection: input.section,
    keywords: input.keywords,
    author: input.authorName
      ? {
          "@type": "Person",
          name: input.authorName,
          url: input.authorUrl ? toAbsoluteUrl(input.authorUrl) : undefined,
        }
      : {
          "@type": "Organization",
          name: siteConfig.name,
          url: siteUrl,
        },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteUrl,
    },
    isPartOf: buildWebsiteEntity(),
    citation: input.sourceUrl ? [input.sourceUrl] : undefined,
    isAccessibleForFree: true,
  };
}
