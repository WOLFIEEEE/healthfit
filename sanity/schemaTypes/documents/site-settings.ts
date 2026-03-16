import { defineArrayMember, defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "siteTitle",
      title: "Site title",
      type: "string",
    }),
    defineField({
      name: "siteDescription",
      title: "Site description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "contentHubEyebrow",
      title: "Content hub eyebrow",
      type: "string",
    }),
    defineField({
      name: "contentHubHeading",
      title: "Content hub heading",
      type: "string",
    }),
    defineField({
      name: "contentHubDescription",
      title: "Content hub description",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "featuredContent",
      title: "Featured content",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [
            { type: "blogPost" },
            { type: "article" },
            { type: "newsPost" },
            { type: "guide" },
          ],
        }),
      ],
    }),
    defineField({
      name: "editorialCtaTitle",
      title: "Editorial CTA title",
      type: "string",
    }),
    defineField({
      name: "editorialCtaDescription",
      title: "Editorial CTA description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "editorialCtaHref",
      title: "Editorial CTA link",
      type: "string",
    }),
  ],
  preview: {
    prepare: () => ({
      title: "Site settings",
      subtitle: "Global editorial and hub configuration",
    }),
  },
});
