import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import {
  hasSanityConfig,
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
  sanityStudioBasePath,
  sanityStudioTitle,
} from "./sanity/env";
import { contentStructure } from "./sanity/lib/structure";
import { schemaTypes } from "./sanity/schemaTypes";

export default defineConfig({
  name: "default",
  title: sanityStudioTitle,
  projectId: sanityProjectId || "missing-project-id",
  dataset: sanityDataset || "production",
  basePath: sanityStudioBasePath,
  plugins: [
    structureTool({
      structure: contentStructure,
    }),
    visionTool({
      defaultApiVersion: sanityApiVersion,
    }),
  ],
  schema: {
    types: schemaTypes,
  },
  document: {
    productionUrl: async (prev) =>
      hasSanityConfig
        ? prev
        : undefined,
  },
});
