import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { HomeContent } from "@/components/marketing/home-content";
import { GsapProvider } from "@/components/animations/gsap-provider";
import { getFeaturedResources } from "@/lib/content/resources";
import { getContentHubData } from "@/sanity/lib/api";

export default async function Home() {
  const { settings, featured } = await getContentHubData();
  const featuredResources = getFeaturedResources();

  return (
    <div className="min-h-screen">
      <GsapProvider>
        <SiteHeader />
        <main>
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
