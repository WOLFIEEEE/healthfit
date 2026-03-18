import type { Metadata } from "next";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import { urlForImage } from "./image";
import { getSectionByKey, type ContentSectionKey } from "./content";
import type { SanityContentItem } from "./types";

export function buildSectionMetadata(sectionKey: ContentSectionKey): Metadata {
  const section = getSectionByKey(sectionKey);

  return buildPublicMetadata({
    title: section.title,
    description: section.description,
    path: section.href,
    keywords: [
      `${section.title.toLowerCase()} health content`,
      `${section.title.toLowerCase()} wellness`,
      "healthfit.ai insights",
    ],
  });
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

  return buildPublicMetadata({
    title,
    description,
    path: `${section.href}/${item.slug}`,
    type: "article",
    image: imageUrl,
    keywords: item.tags?.length
      ? [...item.tags, section.title.toLowerCase(), "healthfit.ai"]
      : [section.title.toLowerCase(), "healthfit.ai"],
    noIndex: Boolean(item.seo?.noIndex),
  });
}
