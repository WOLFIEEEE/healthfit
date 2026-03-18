import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";

export const siteUrl = siteConfig.url.replace(/\/$/, "");
export const defaultOgImage = `${siteUrl}/opengraph-image.png`;

type PublicMetadataInput = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  type?: "website" | "article";
  image?: string | null;
  noIndex?: boolean;
};

function resolveAbsoluteUrl(pathOrUrl?: string | null) {
  if (!pathOrUrl) {
    return undefined;
  }

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  if (pathOrUrl === "/") {
    return siteUrl;
  }

  return `${siteUrl}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

export function buildPublicMetadata({
  title,
  description,
  path,
  keywords,
  type = "website",
  image,
  noIndex = false,
}: PublicMetadataInput): Metadata {
  const resolvedPath = noIndex ? undefined : path ?? "/";
  const absoluteUrl = resolveAbsoluteUrl(resolvedPath);
  const resolvedImage = resolveAbsoluteUrl(image) ?? defaultOgImage;

  return {
    title,
    description,
    keywords,
    alternates: resolvedPath ? { canonical: resolvedPath } : undefined,
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : undefined,
    openGraph: {
      title,
      description,
      url: absoluteUrl,
      siteName: siteConfig.name,
      type,
      locale: "en_US",
      images: [
        {
          url: resolvedImage,
          width: 1200,
          height: 630,
          alt: `${title} | ${siteConfig.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [resolvedImage],
    },
    category: "health",
  };
}

export function buildNoIndexMetadata(input: {
  title: string;
  description: string;
}): Metadata {
  return buildPublicMetadata({
    ...input,
    path: undefined,
    noIndex: true,
  });
}
