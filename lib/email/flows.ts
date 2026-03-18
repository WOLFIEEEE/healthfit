import { sendResendEmail } from "@/lib/email/resend";
import {
  renderMagicLinkEmail,
  renderPurchaseInviteEmail,
  renderWelcomeEmail,
} from "@/lib/email/templates";

export async function sendMagicLinkEmail(props: {
  email: string;
  magicLink: string;
  nextPath?: string | null;
}) {
  const emailContent = renderMagicLinkEmail({
    magicLink: props.magicLink,
    nextPath: props.nextPath,
  });

  return sendResendEmail({
    to: props.email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
    tags: [
      {
        name: "flow",
        value: "magic-link",
      },
    ],
  });
}

export async function sendWelcomeEmail(props: {
  email: string;
  fullName: string;
  dashboardUrl: string;
  weeklyFocus: string;
}) {
  const emailContent = renderWelcomeEmail({
    fullName: props.fullName,
    dashboardUrl: props.dashboardUrl,
    weeklyFocus: props.weeklyFocus,
  });

  return sendResendEmail({
    to: props.email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
    tags: [
      {
        name: "flow",
        value: "welcome",
      },
    ],
  });
}

export async function sendPurchaseInviteEmail(props: {
  email: string;
  fullName: string;
  planName: string;
  claimUrl: string;
  existingAccount?: boolean;
}) {
  const emailContent = renderPurchaseInviteEmail({
    fullName: props.fullName,
    planName: props.planName,
    claimUrl: props.claimUrl,
    existingAccount: props.existingAccount,
  });

  return sendResendEmail({
    to: props.email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
    tags: [
      {
        name: "flow",
        value: "purchase-invite",
      },
      {
        name: "plan",
        value: props.planName.toLowerCase(),
      },
    ],
  });
}
