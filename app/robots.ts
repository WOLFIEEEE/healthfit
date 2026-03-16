import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/insights",
          "/blog",
          "/articles",
          "/news",
          "/guides",
          "/resources",
          "/privacy",
          "/terms",
          "/billing-policy",
          "/disclaimer",
          "/contact",
        ],
        disallow: ["/admin", "/api", "/checkout", "/dashboard", "/login", "/onboarding", "/studio"],
      },
    ],
    sitemap: `${siteConfig.url.replace(/\/$/, "")}/sitemap.xml`,
  };
}
