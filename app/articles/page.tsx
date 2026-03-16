import { ContentIndexPage } from "@/components/content/content-index-page";
import { hasSanityConfig } from "@/sanity/env";
import { getSectionContent } from "@/sanity/lib/api";
import { buildSectionMetadata } from "@/sanity/lib/metadata";

export const metadata = buildSectionMetadata("articles");

export default async function ArticlesPage() {
  const items = await getSectionContent("articles");

  return (
    <ContentIndexPage
      sectionKey="articles"
      items={items}
      showSetupState={!hasSanityConfig}
    />
  );
}
