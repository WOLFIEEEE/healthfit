import { defineType } from "sanity";
import { createSharedContentFields } from "./shared-content-fields";

export const guideType = defineType({
  name: "guide",
  title: "Guide",
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
