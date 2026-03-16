import "server-only";
import { createClient } from "next-sanity";
import {
  hasSanityConfig,
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
} from "../env";

export const sanityClient = hasSanityConfig
  ? createClient({
      projectId: sanityProjectId,
      dataset: sanityDataset,
      apiVersion: sanityApiVersion,
      useCdn: true,
      perspective: "published",
      stega: false,
    })
  : null;

type SanityFetchOptions<T> = {
  query: string;
  params?: Record<string, string | number | boolean | null>;
  tags?: string[];
  fallback: T;
};

export async function sanityFetch<T>({
  query,
  params = {},
  tags = [],
  fallback,
}: SanityFetchOptions<T>): Promise<T> {
  if (!sanityClient) {
    return fallback;
  }

  return sanityClient.fetch<T>(query, params, {
    cache: "force-cache",
    next: {
      tags: Array.from(new Set(["sanity", ...tags])),
    },
  });
}
