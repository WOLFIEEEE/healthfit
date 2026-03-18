import type { Metadata } from "next";
import { NextStudioLayout } from "next-sanity/studio";
import { buildNoIndexMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Sanity Studio",
  description: "Internal editorial studio for Healthfit.ai.",
});

export default NextStudioLayout;
