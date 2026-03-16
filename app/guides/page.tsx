import { ContentIndexPage } from "@/components/content/content-index-page";
import { hasSanityConfig } from "@/sanity/env";
import { getSectionContent } from "@/sanity/lib/api";
import { buildSectionMetadata } from "@/sanity/lib/metadata";

export const metadata = buildSectionMetadata("guides");

export default async function GuidesPage() {
  const items = await getSectionContent("guides");

  return (
    <ContentIndexPage
      sectionKey="guides"
      items={items}
      showSetupState={!hasSanityConfig}
    />
  );
}
