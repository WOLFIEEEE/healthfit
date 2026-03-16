import { ContentIndexPage } from "@/components/content/content-index-page";
import { hasSanityConfig } from "@/sanity/env";
import { getSectionContent } from "@/sanity/lib/api";
import { buildSectionMetadata } from "@/sanity/lib/metadata";

export const metadata = buildSectionMetadata("news");

export default async function NewsPage() {
  const items = await getSectionContent("news");

  return (
    <ContentIndexPage
      sectionKey="news"
      items={items}
      showSetupState={!hasSanityConfig}
    />
  );
}
