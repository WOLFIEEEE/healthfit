import "server-only";
import {
  featuredContentFeedQuery,
  getRelatedSectionItemsQuery,
  getSectionItemQuery,
  getSectionListQuery,
  getSectionSlugsQuery,
  latestContentFeedQuery,
  siteSettingsQuery,
  sitemapContentQuery,
} from "./queries";
import { sanityFetch } from "./client";
import type {
  SanityContentHubData,
  SanityContentItem,
  SanitySiteSettings,
} from "./types";
import type { ContentSectionKey } from "./content";

export async function getSectionContent(
  sectionKey: ContentSectionKey,
  limit = 12
) {
  return sanityFetch<SanityContentItem[]>({
    query: getSectionListQuery(sectionKey, limit),
    tags: [`sanity:${sectionKey}`],
    fallback: [],
  });
}

export async function getSectionContentSlugs(sectionKey: ContentSectionKey) {
  return sanityFetch<Array<{ slug: string }>>({
    query: getSectionSlugsQuery(sectionKey),
    tags: [`sanity:${sectionKey}`],
    fallback: [],
  });
}

export async function getSectionContentItem(
  sectionKey: ContentSectionKey,
  slug: string
) {
  return sanityFetch<SanityContentItem | null>({
    query: getSectionItemQuery(sectionKey),
    params: { slug },
    tags: [`sanity:${sectionKey}`, `sanity:${sectionKey}:${slug}`],
    fallback: null,
  });
}

export async function getRelatedSectionContent(
  sectionKey: ContentSectionKey,
  slug: string,
  limit = 3
) {
  return sanityFetch<SanityContentItem[]>({
    query: getRelatedSectionItemsQuery(sectionKey, limit),
    params: { slug },
    tags: [`sanity:${sectionKey}`],
    fallback: [],
  });
}

export async function getLatestContentFeed() {
  return sanityFetch<SanityContentItem[]>({
    query: latestContentFeedQuery,
    tags: ["sanity:insights"],
    fallback: [],
  });
}

export async function getFeaturedContentFeed() {
  return sanityFetch<SanityContentItem[]>({
    query: featuredContentFeedQuery,
    tags: ["sanity:insights"],
    fallback: [],
  });
}

export async function getSiteSettings() {
  return sanityFetch<SanitySiteSettings | null>({
    query: siteSettingsQuery,
    tags: ["sanity:settings"],
    fallback: null,
  });
}

export async function getContentHubData(): Promise<SanityContentHubData> {
  const [settings, latest, featured] = await Promise.all([
    getSiteSettings(),
    getLatestContentFeed(),
    getFeaturedContentFeed(),
  ]);

  return {
    settings,
    latest,
    featured: settings?.featuredContent?.length
      ? settings.featuredContent.slice(0, 6)
      : featured,
  };
}

export async function getSitemapContentEntries() {
  return sanityFetch<
    Array<{
      _type: string;
      slug: string;
      publishedAt?: string;
      _updatedAt?: string;
    }>
  >({
    query: sitemapContentQuery,
    tags: ["sanity:insights"],
    fallback: [],
  });
}
