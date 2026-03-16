export const contentSectionConfig = {
  blog: {
    documentType: "blogPost",
    title: "Blog",
    description:
      "Founder notes, product thinking, coaching philosophy, and wellness editorial from the Healthfit.ai team.",
    href: "/blog",
    shortLabel: "Blog",
  },
  articles: {
    documentType: "article",
    title: "Articles",
    description:
      "Evergreen educational articles that explain training, nutrition, recovery, and wellness topics in plain language.",
    href: "/articles",
    shortLabel: "Articles",
  },
  news: {
    documentType: "newsPost",
    title: "News",
    description:
      "Fresh health, product, and industry updates that keep members current without turning the site into a noisy feed.",
    href: "/news",
    shortLabel: "News",
  },
  guides: {
    documentType: "guide",
    title: "Guides",
    description:
      "Structured, practical guides designed to help people apply advice consistently over time.",
    href: "/guides",
    shortLabel: "Guides",
  },
} as const;

export type ContentSectionKey = keyof typeof contentSectionConfig;

export const contentSections = Object.entries(contentSectionConfig).map(
  ([key, value]) => ({
    key: key as ContentSectionKey,
    ...value,
  })
);

export const contentDocumentTypes = contentSections.map(
  (section) => section.documentType
);

export function getSectionByKey(sectionKey: ContentSectionKey) {
  return contentSections.find((section) => section.key === sectionKey)!;
}

export function getSectionForDocumentType(documentType: string) {
  return (
    contentSections.find((section) => section.documentType === documentType) ??
    null
  );
}

export function getContentHref(
  sectionKey: ContentSectionKey,
  slug?: string | null
) {
  const section = getSectionByKey(sectionKey);

  return slug ? `${section.href}/${slug}` : section.href;
}
