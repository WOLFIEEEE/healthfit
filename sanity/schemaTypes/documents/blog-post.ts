import { defineType } from "sanity";
import { createSharedContentFields } from "./shared-content-fields";

export const blogPostType = defineType({
  name: "blogPost",
  title: "Blog post",
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
