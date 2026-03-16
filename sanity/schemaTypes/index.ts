import { articleType } from "./documents/article";
import { authorType } from "./documents/author";
import { blogPostType } from "./documents/blog-post";
import { categoryType } from "./documents/category";
import { guideType } from "./documents/guide";
import { newsPostType } from "./documents/news-post";
import { siteSettingsType } from "./documents/site-settings";
import { seoType } from "./objects/seo";

export const schemaTypes = [
  articleType,
  authorType,
  blogPostType,
  categoryType,
  guideType,
  newsPostType,
  siteSettingsType,
  seoType,
];
