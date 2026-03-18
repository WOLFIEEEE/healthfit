import type { Metadata } from "next";
import { LegalShell } from "@/components/marketing/legal-shell";
import { buildPublicMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPublicMetadata({
  title: "Billing Policy",
  description:
    "Understand Healthfit.ai subscription billing, plan changes, renewals, and policy expectations.",
  path: "/billing-policy",
  keywords: ["healthfit.ai billing policy", "subscription billing policy"],
});

export default function BillingPolicyPage() {
  return (
    <LegalShell
      title="Billing policy"
      intro="This policy outlines subscription expectations for Starter, Pro, and Elite plans."
    >
      <p>
        Starter is intended as the free baseline plan. Paid plans unlock AI
        coaching, higher usage limits, and premium features based on the
        entitlement map configured in the application.
      </p>
      <p>
        Recurring billing, plan changes, cancellations, invoice history, and
        webhook-based subscription sync are handled by Dodo Payments in this
        codebase.
      </p>
      <p>
        Before launch, plan pricing, refund windows, taxes, and support
        handling should be reviewed with the live business policy.
      </p>
    </LegalShell>
  );
}
