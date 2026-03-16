import { notFound } from "next/navigation";
import { ContentDetailPage } from "@/components/content/content-detail-page";
import { getRelatedSectionContent, getSectionContentItem, getSectionContentSlugs } from "@/sanity/lib/api";
import { buildContentMetadata } from "@/sanity/lib/metadata";

type BlogDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const slugs = await getSectionContentSlugs("blog");

  return slugs.map((entry) => ({
    slug: entry.slug,
  }));
}

export async function generateMetadata({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const item = await getSectionContentItem("blog", slug);

  return item ? buildContentMetadata("blog", item) : {};
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const [item, relatedItems] = await Promise.all([
    getSectionContentItem("blog", slug),
    getRelatedSectionContent("blog", slug),
  ]);

  if (!item) {
    notFound();
  }

  return (
    <ContentDetailPage
      item={item}
      sectionKey="blog"
      relatedItems={relatedItems}
    />
  );
}
