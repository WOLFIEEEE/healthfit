import { defineType } from "sanity";
import { createSharedContentFields } from "./shared-content-fields";

export const newsPostType = defineType({
  name: "newsPost",
  title: "News post",
  type: "document",
  fields: createSharedContentFields({ includeSourceFields: true }),
  preview: {
    select: {
      title: "title",
      subtitle: "sourceName",
      media: "featuredImage",
    },
  },
});
