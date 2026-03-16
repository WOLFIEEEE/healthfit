import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";
import { urlForImage } from "./image";
import { getSectionByKey, type ContentSectionKey } from "./content";
import type { SanityContentItem } from "./types";

const siteUrl = siteConfig.url.replace(/\/$/, "");

export function buildSectionMetadata(sectionKey: ContentSectionKey): Metadata {
  const section = getSectionByKey(sectionKey);

  return {
    title: section.title,
    description: section.description,
    alternates: {
      canonical: section.href,
    },
    openGraph: {
      title: `${section.title} | ${siteConfig.name}`,
      description: section.description,
      url: `${siteUrl}${section.href}`,
      type: "website",
    },
  };
}

export function buildContentMetadata(
  sectionKey: ContentSectionKey,
  item: SanityContentItem
): Metadata {
  const section = getSectionByKey(sectionKey);
  const imageUrl = item.featuredImage
    ? urlForImage(item.featuredImage)?.width(1200).height(630).url()
    : null;
  const title = item.seo?.metaTitle ?? item.title;
  const description = item.seo?.metaDescription ?? item.excerpt ?? section.description;

  return {
    title,
    description,
    robots: item.seo?.noIndex ? { index: false, follow: true } : undefined,
    alternates: {
      canonical: `${section.href}/${item.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}${section.href}/${item.slug}`,
      type: "article",
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
  };
}
