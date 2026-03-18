import { createImageUrlBuilder } from "@sanity/image-url";
import {
  hasSanityConfig,
  sanityDataset,
  sanityProjectId,
} from "../env";

const imageBuilder = hasSanityConfig
  ? createImageUrlBuilder({
      projectId: sanityProjectId,
      dataset: sanityDataset,
    })
  : null;

type ImageSource = Parameters<
  ReturnType<typeof createImageUrlBuilder>["image"]
>[0];

export function urlForImage(source: ImageSource) {
  if (!imageBuilder) {
    return null;
  }

  return imageBuilder.image(source).auto("format").fit("max");
}
