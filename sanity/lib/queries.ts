import { defineQuery } from "next-sanity";
import {
  contentDocumentTypes,
  contentSectionConfig,
  type ContentSectionKey,
} from "./content";

const contentListProjection = `
  _id,
  _type,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  featured,
  readTimeMinutes,
  tags,
  sourceName,
  sourceUrl,
  featuredImage{
    alt,
    caption,
    asset
  },
  author->{
    name,
    "slug": slug.current,
    role,
    bio,
    avatar{
      alt,
      asset
    }
  },
  category->{
    title,
    "slug": slug.current,
    description
  },
  seo{
    metaTitle,
    metaDescription,
    noIndex
  }
`;

const contentDetailProjection = `
  ${contentListProjection},
  body
`;

function publishedOrder(limit: number) {
  return `| order(coalesce(publishedAt, _updatedAt) desc)[0...${limit}]`;
}

export function getSectionListQuery(sectionKey: ContentSectionKey, limit = 12) {
  const documentType = contentSectionConfig[sectionKey].documentType;

  return defineQuery(`
    *[_type == "${documentType}"] ${publishedOrder(limit)} {
      ${contentListProjection}
    }
  `);
}

export function getSectionSlugsQuery(sectionKey: ContentSectionKey) {
  const documentType = contentSectionConfig[sectionKey].documentType;

  return defineQuery(`
    *[_type == "${documentType}" && defined(slug.current)] {
      "slug": slug.current
    }
  `);
}

export function getSectionItemQuery(sectionKey: ContentSectionKey) {
  const documentType = contentSectionConfig[sectionKey].documentType;

  return defineQuery(`
    *[_type == "${documentType}" && slug.current == $slug][0] {
      ${contentDetailProjection}
    }
  `);
}

export function getRelatedSectionItemsQuery(sectionKey: ContentSectionKey, limit = 3) {
  const documentType = contentSectionConfig[sectionKey].documentType;

  return defineQuery(`
    *[_type == "${documentType}" && slug.current != $slug] ${publishedOrder(limit)} {
      ${contentListProjection}
    }
  `);
}

export const latestContentFeedQuery = defineQuery(`
  *[_type in ${JSON.stringify(contentDocumentTypes)}] ${publishedOrder(12)} {
    ${contentListProjection}
  }
`);

export const featuredContentFeedQuery = defineQuery(`
  *[_type in ${JSON.stringify(contentDocumentTypes)} && featured == true] ${publishedOrder(6)} {
    ${contentListProjection}
  }
`);

export const siteSettingsQuery = defineQuery(`
  *[_type == "siteSettings"][0]{
    siteTitle,
    siteDescription,
    contentHubEyebrow,
    contentHubHeading,
    contentHubDescription,
    editorialCtaTitle,
    editorialCtaDescription,
    editorialCtaHref,
    featuredContent[]->{
      ${contentListProjection}
    }
  }
`);

export const sitemapContentQuery = defineQuery(`
  *[_type in ${JSON.stringify(contentDocumentTypes)} && defined(slug.current)]{
    _type,
    "slug": slug.current,
    publishedAt,
    _updatedAt
  }
`);
