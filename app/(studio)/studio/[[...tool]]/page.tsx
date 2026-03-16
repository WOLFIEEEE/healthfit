import { metadata, viewport } from "next-sanity/studio";
import { ContentSetupState } from "@/components/content/content-setup-state";
import { StudioClient } from "@/components/sanity/studio-client";
import { hasSanityConfig } from "@/sanity/env";

export { metadata, viewport };

export default function StudioPage() {
  if (!hasSanityConfig) {
    return (
      <div className="page-shell py-10">
        <ContentSetupState
          title="Connect your Sanity project before opening Studio"
          description="The embedded Studio route is ready, but it needs a Sanity project ID and dataset before editors can log in and manage content."
          showStudioLink={false}
        />
      </div>
    );
  }

  return <StudioClient />;
}
