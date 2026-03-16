import type { StructureResolver } from "sanity/structure";

export const contentStructure: StructureResolver = (S) =>
  S.list()
    .title("Healthfit.ai Content")
    .items([
      S.listItem()
        .title("Blog")
        .child(S.documentTypeList("blogPost").title("Blog posts")),
      S.listItem()
        .title("Articles")
        .child(S.documentTypeList("article").title("Articles")),
      S.listItem()
        .title("News")
        .child(S.documentTypeList("newsPost").title("News")),
      S.listItem()
        .title("Guides")
        .child(S.documentTypeList("guide").title("Guides")),
      S.divider(),
      S.listItem()
        .title("Authors")
        .child(S.documentTypeList("author").title("Authors")),
      S.listItem()
        .title("Categories")
        .child(S.documentTypeList("category").title("Categories")),
      S.divider(),
      S.listItem()
        .title("Site settings")
        .child(
          S.document().schemaType("siteSettings").documentId("siteSettings")
        ),
    ]);
