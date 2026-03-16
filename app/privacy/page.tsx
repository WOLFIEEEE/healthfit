import { LegalShell } from "@/components/marketing/legal-shell";

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy policy"
      intro="This page explains how Healthfit.ai handles account, billing, and wellness data for the consumer SaaS experience implemented in this repository."
    >
      <p>
        Healthfit.ai stores account details, onboarding responses, workouts,
        meals, habits, check-ins, coach messages, subscription state, and
        operational logs so the application can personalize guidance and keep
        the product functioning.
      </p>
      <p>
        The product is designed for wellness use only. Sensitive or urgent
        medical questions should be directed to qualified professionals rather
        than the application.
      </p>
      <p>
        Members can request deletion, and the product should support export and
        account removal workflows before production launch.
      </p>
    </LegalShell>
  );
}
