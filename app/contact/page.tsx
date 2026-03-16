import { LegalShell } from "@/components/marketing/legal-shell";

export default function ContactPage() {
  return (
    <LegalShell
      title="Contact"
      intro="Use this page as the contact and support destination for the Healthfit.ai SaaS experience."
    >
      <p>
        Support inbox: <a href="mailto:support@healthfit.ai" className="text-primary">support@healthfit.ai</a>
      </p>
      <p>
        Sales or partnerships: <a href="mailto:hello@healthfit.ai" className="text-primary">hello@healthfit.ai</a>
      </p>
      <p>
        Production deployments should connect this page to a real support
        workflow, ticketing process, or transactional email provider.
      </p>
    </LegalShell>
  );
}
