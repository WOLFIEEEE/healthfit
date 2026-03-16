import { notFound } from "next/navigation";
import { ContentDetailPage } from "@/components/content/content-detail-page";
import { getRelatedSectionContent, getSectionContentItem, getSectionContentSlugs } from "@/sanity/lib/api";
import { buildContentMetadata } from "@/sanity/lib/metadata";

type NewsDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const slugs = await getSectionContentSlugs("news");

  return slugs.map((entry) => ({
    slug: entry.slug,
  }));
}

export async function generateMetadata({ params }: NewsDetailPageProps) {
  const { slug } = await params;
  const item = await getSectionContentItem("news", slug);

  return item ? buildContentMetadata("news", item) : {};
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = await params;
  const [item, relatedItems] = await Promise.all([
    getSectionContentItem("news", slug),
    getRelatedSectionContent("news", slug),
  ]);

  if (!item) {
    notFound();
  }

  return (
    <ContentDetailPage
      item={item}
      sectionKey="news"
      relatedItems={relatedItems}
    />
  );
}
