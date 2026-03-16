import { ContentIndexPage } from "@/components/content/content-index-page";
import { hasSanityConfig } from "@/sanity/env";
import { getSectionContent } from "@/sanity/lib/api";
import { buildSectionMetadata } from "@/sanity/lib/metadata";

export const metadata = buildSectionMetadata("blog");

export default async function BlogPage() {
  const items = await getSectionContent("blog");

  return (
    <ContentIndexPage
      sectionKey="blog"
      items={items}
      showSetupState={!hasSanityConfig}
    />
  );
}
