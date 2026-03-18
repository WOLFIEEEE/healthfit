import type { Metadata } from "next";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { HomeContent } from "@/components/marketing/home-content";
import { GsapProvider } from "@/components/animations/gsap-provider";
import { getFeaturedResources } from "@/lib/content/resources";
import { buildPublicMetadata } from "@/lib/seo/metadata";
import {
  buildOrganizationStructuredData,
  buildWebsiteStructuredData,
} from "@/lib/seo/schema";
import { getContentHubData } from "@/sanity/lib/api";

const homeDescription =
  "Healthfit.ai brings AI coaching, workouts, meals, habits, and check-ins into one wellness-first member workspace.";

export const metadata: Metadata = buildPublicMetadata({
  title: "AI Fitness, Nutrition, and Wellness Coaching",
  description: homeDescription,
  path: "/",
  keywords: [
    "ai fitness coach",
    "wellness app",
    "nutrition and workout tracking",
    "habit coach",
    "healthfit.ai",
  ],
});

export default async function Home() {
  const { settings, featured } = await getContentHubData();
  const featuredResources = getFeaturedResources();
  const websiteStructuredData = buildWebsiteStructuredData({
    description: homeDescription,
  });
  const organizationStructuredData = buildOrganizationStructuredData();
  const softwareStructuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Healthfit.ai",
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description: homeDescription,
  };

  return (
    <div className="min-h-screen">
      <GsapProvider>
        <SiteHeader />
        <main>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(websiteStructuredData),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(organizationStructuredData),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(softwareStructuredData),
            }}
          />
          <HomeContent
            featured={featured}
            settings={settings}
            featuredResources={featuredResources}
          />
        </main>
        <SiteFooter />
      </GsapProvider>
    </div>
  );
}
