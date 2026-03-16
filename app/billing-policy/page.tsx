import { LegalShell } from "@/components/marketing/legal-shell";

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
