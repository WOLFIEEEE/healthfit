import { LegalShell } from "@/components/marketing/legal-shell";

export default function DisclaimerPage() {
  return (
    <LegalShell
      title="Wellness disclaimer"
      intro="Healthfit.ai is intentionally built for wellness guidance and routine support, not medical diagnosis or treatment."
    >
      <p>
        The application can suggest workouts, meal structure, habit reminders,
        and coaching prompts, but it cannot diagnose illness, prescribe
        medication, or replace emergency or clinical care.
      </p>
      <p>
        If a member experiences severe symptoms, urgent distress, or potential
        harm, they should stop relying on the app and contact qualified
        professionals or emergency services immediately.
      </p>
      <p>
        Coach responses include guardrails and may refuse or caution on
        safety-sensitive prompts.
      </p>
    </LegalShell>
  );
}
