export const sanityApiVersion =
  process.env.SANITY_API_VERSION ?? "2026-03-17";

export const sanityProjectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";

export const sanityDataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

export const sanityStudioTitle =
  process.env.SANITY_STUDIO_PROJECT_TITLE ?? "Healthfit.ai Studio";

export const sanityStudioBasePath = "/studio";

export const sanityRevalidateSecret =
  process.env.SANITY_REVALIDATE_SECRET ?? "";

export const hasSanityConfig = Boolean(sanityProjectId && sanityDataset);
