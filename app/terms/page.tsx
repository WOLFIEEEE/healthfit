import type { Metadata } from "next";
import { LegalShell } from "@/components/marketing/legal-shell";
import { buildPublicMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPublicMetadata({
  title: "Terms of Service",
  description:
    "Review the Healthfit.ai terms for subscriptions, wellness usage, and account responsibilities.",
  path: "/terms",
  keywords: ["healthfit.ai terms", "wellness software terms"],
});

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of service"
      intro="These terms frame Healthfit.ai as a wellness software product, not a clinical care service."
    >
      <p>
        Healthfit.ai provides software for tracking fitness, nutrition, habits,
        goals, and wellness-oriented coaching prompts.
      </p>
      <p>
        Members remain responsible for the decisions they make using the
        product, and they should not use the app as a substitute for licensed
        medical care.
      </p>
      <p>
        Subscription billing, invoices, cancellations, and renewals are handled
        through the configured payment provider integration.
      </p>
    </LegalShell>
  );
}
