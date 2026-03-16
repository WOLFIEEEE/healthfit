import type { TypedObject } from "sanity";

export type SanityImageAsset = {
  _ref?: string;
  _type?: "reference";
};

export type SanityImage = {
  _type?: "image";
  asset?: SanityImageAsset;
  alt?: string;
  caption?: string;
};

export type SanityAuthor = {
  name: string;
  slug?: string;
  role?: string;
  bio?: string;
  avatar?: SanityImage;
};

export type SanityCategory = {
  title: string;
  slug?: string;
  description?: string;
};

export type SanitySeo = {
  metaTitle?: string;
  metaDescription?: string;
  noIndex?: boolean;
};

export type SanityContentItem = {
  _id: string;
  _type: string;
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt?: string;
  featured?: boolean;
  readTimeMinutes?: number;
  tags?: string[];
  sourceName?: string;
  sourceUrl?: string;
  featuredImage?: SanityImage;
  author?: SanityAuthor | null;
  category?: SanityCategory | null;
  seo?: SanitySeo | null;
  body?: TypedObject[];
};

export type SanitySiteSettings = {
  siteTitle?: string;
  siteDescription?: string;
  contentHubEyebrow?: string;
  contentHubHeading?: string;
  contentHubDescription?: string;
  featuredContent?: SanityContentItem[];
  editorialCtaTitle?: string;
  editorialCtaDescription?: string;
  editorialCtaHref?: string;
};

export type SanityContentHubData = {
  settings: SanitySiteSettings | null;
  latest: SanityContentItem[];
  featured: SanityContentItem[];
};
