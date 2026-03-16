import { defineType } from "sanity";
import { createSharedContentFields } from "./shared-content-fields";

export const articleType = defineType({
  name: "article",
  title: "Article",
  type: "document",
  fields: createSharedContentFields(),
  preview: {
    select: {
      title: "title",
      subtitle: "publishedAt",
      media: "featuredImage",
    },
  },
});
