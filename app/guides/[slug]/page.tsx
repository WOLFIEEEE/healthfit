import { notFound } from "next/navigation";
import { ContentDetailPage } from "@/components/content/content-detail-page";
import { getRelatedSectionContent, getSectionContentItem, getSectionContentSlugs } from "@/sanity/lib/api";
import { buildContentMetadata } from "@/sanity/lib/metadata";

type GuideDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const slugs = await getSectionContentSlugs("guides");

  return slugs.map((entry) => ({
    slug: entry.slug,
  }));
}

export async function generateMetadata({ params }: GuideDetailPageProps) {
  const { slug } = await params;
  const item = await getSectionContentItem("guides", slug);

  return item ? buildContentMetadata("guides", item) : {};
}

export default async function GuideDetailPage({ params }: GuideDetailPageProps) {
  const { slug } = await params;
  const [item, relatedItems] = await Promise.all([
    getSectionContentItem("guides", slug),
    getRelatedSectionContent("guides", slug),
  ]);

  if (!item) {
    notFound();
  }

  return (
    <ContentDetailPage
      item={item}
      sectionKey="guides"
      relatedItems={relatedItems}
    />
  );
}
