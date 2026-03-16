"use client";

import { NextStudio } from "next-sanity/studio/client-component";
import sanityConfig from "../../sanity.config";

export function StudioClient() {
  return <NextStudio config={sanityConfig} />;
}
