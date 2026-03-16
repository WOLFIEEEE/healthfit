import { notFound } from "next/navigation";
import { ContentDetailPage } from "@/components/content/content-detail-page";
import { getRelatedSectionContent, getSectionContentItem, getSectionContentSlugs } from "@/sanity/lib/api";
import { buildContentMetadata } from "@/sanity/lib/metadata";

type ArticleDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const slugs = await getSectionContentSlugs("articles");

  return slugs.map((entry) => ({
    slug: entry.slug,
  }));
}

export async function generateMetadata({ params }: ArticleDetailPageProps) {
  const { slug } = await params;
  const item = await getSectionContentItem("articles", slug);

  return item ? buildContentMetadata("articles", item) : {};
}

export default async function ArticleDetailPage({
  params,
}: ArticleDetailPageProps) {
  const { slug } = await params;
  const [item, relatedItems] = await Promise.all([
    getSectionContentItem("articles", slug),
    getRelatedSectionContent("articles", slug),
  ]);

  if (!item) {
    notFound();
  }

  return (
    <ContentDetailPage
      item={item}
      sectionKey="articles"
      relatedItems={relatedItems}
    />
  );
}
