function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderButton(label: string, href: string) {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top: 28px;">
      <tr>
        <td style="border-radius: 999px; background: #214d39;">
          <a href="${escapeHtml(href)}" style="display: inline-block; padding: 14px 24px; font-size: 14px; font-weight: 600; line-height: 1; color: #ffffff; text-decoration: none;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>
  `;
}

function renderStatCards(items: Array<{ label: string; value: string }>) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 28px;">
      <tr>
        ${items
          .map(
            (item) => `
              <td width="${Math.floor(100 / items.length)}%" valign="top" style="padding-right: 10px;">
                <div style="border: 1px solid #d9e4da; border-radius: 20px; background: #f7fbf6; padding: 16px;">
                  <div style="font-size: 11px; line-height: 1.5; letter-spacing: 0.18em; text-transform: uppercase; color: #6b7d74;">
                    ${escapeHtml(item.label)}
                  </div>
                  <div style="margin-top: 8px; font-size: 16px; font-weight: 600; line-height: 1.4; color: #214d39;">
                    ${escapeHtml(item.value)}
                  </div>
                </div>
              </td>
            `
          )
          .join("")}
      </tr>
    </table>
  `;
}

function renderBulletList(items: string[]) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 28px;">
      ${items
        .map(
          (item) => `
            <tr>
              <td valign="top" style="padding: 0 12px 10px 0; width: 18px;">
                <div style="margin-top: 9px; height: 8px; width: 8px; border-radius: 999px; background: #4a8b63;"></div>
              </td>
              <td style="padding: 0 0 10px; font-size: 14px; line-height: 1.75; color: #40544a;">
                ${escapeHtml(item)}
              </td>
            </tr>
          `
        )
        .join("")}
    </table>
  `;
}

function renderEmailFrame(props: {
  preheader: string;
  eyebrow: string;
  title: string;
  intro: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  ctaHint: string;
  footer: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(props.title)}</title>
  </head>
  <body style="margin: 0; padding: 0; background: #f3f7f2; color: #214d39; font-family: Arial, Helvetica, sans-serif;">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
      ${escapeHtml(props.preheader)}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: #f3f7f2;">
      <tr>
        <td align="center" style="padding: 28px 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 620px;">
            <tr>
              <td style="padding: 0 10px 16px;">
                <div style="display: inline-flex; align-items: center;">
                  <span style="display: inline-block; height: 16px; width: 16px; border-radius: 999px; border: 4px solid #ffffff; background: linear-gradient(135deg, #2f704d, #8fc26a); box-shadow: 0 0 0 8px #4a8b63;"></span>
                  <span style="display: inline-block; margin-left: 16px; font-size: 21px; font-weight: 600; letter-spacing: -0.03em; color: #214d39;">
                    Healthfit.ai
                  </span>
                </div>
              </td>
            </tr>
            <tr>
              <td style="border: 1px solid #d9e4da; border-radius: 28px; background: #ffffff; padding: 32px 28px; box-shadow: 0 24px 60px -42px rgba(33, 77, 57, 0.28);">
                <div style="display: inline-block; border-radius: 999px; background: #edf6ef; border: 1px solid #cfe0d2; padding: 7px 12px; font-size: 11px; line-height: 1; letter-spacing: 0.18em; text-transform: uppercase; color: #4a6b5a;">
                  ${escapeHtml(props.eyebrow)}
                </div>
                <h1 style="margin: 18px 0 0; font-size: 34px; line-height: 1.08; letter-spacing: -0.04em; color: #214d39;">
                  ${escapeHtml(props.title)}
                </h1>
                <p style="margin: 16px 0 0; font-size: 15px; line-height: 1.85; color: #51665b;">
                  ${escapeHtml(props.intro)}
                </p>
                ${props.body}
                ${renderButton(props.ctaLabel, props.ctaHref)}
                <p style="margin: 16px 0 0; font-size: 12px; line-height: 1.8; color: #6b7d74;">
                  ${escapeHtml(props.ctaHint)}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px 10px 0; font-size: 12px; line-height: 1.8; color: #6b7d74;">
                ${escapeHtml(props.footer)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function renderMagicLinkEmail(props: {
  magicLink: string;
  nextPath?: string | null;
}) {
  const subject = "Your Healthfit.ai sign-in link";
  const destination = props.nextPath ?? "/dashboard/overview";
  const body = `
    ${renderStatCards([
      { label: "Destination", value: destination },
      { label: "Access", value: "Secure magic link" },
      { label: "Workspace", value: "Coach, tracking, billing" },
    ])}
    ${renderBulletList([
      "This sign-in link is meant just for you and should not be forwarded.",
      "If you started from a protected page, this link will take you back there after authentication.",
      "If you did not request this email, you can safely ignore it.",
    ])}
  `;

  const html = renderEmailFrame({
    preheader: "Open your Healthfit.ai workspace with one secure sign-in link.",
    eyebrow: "Secure sign in",
    title: "Open your member workspace",
    intro:
      "Use the secure link below to sign in to Healthfit.ai and continue with your routines, coach, progress, and billing.",
    body,
    ctaLabel: "Sign in to Healthfit.ai",
    ctaHref: props.magicLink,
    ctaHint: "For security, this link works for a limited time and should only be used by the person who requested it.",
    footer:
      "Healthfit.ai provides wellness guidance only and does not replace professional medical care.",
  });

  const text = [
    "Healthfit.ai",
    "",
    "Open your member workspace",
    "Use the secure link below to sign in to Healthfit.ai and continue with your routines, coach, progress, and billing.",
    "",
    `Destination: ${destination}`,
    `Sign-in link: ${props.magicLink}`,
    "",
    "This link is meant just for you and expires soon. If you did not request it, you can ignore this email.",
    "",
    "Healthfit.ai provides wellness guidance only and does not replace professional medical care.",
  ].join("\n");

  return { subject, html, text };
}

export function renderSignupConfirmationEmail(props: {
  fullName: string;
  confirmationLink: string;
  nextPath?: string | null;
}) {
  const firstName = props.fullName.trim().split(/\s+/)[0] ?? "there";
  const subject = "Confirm your Healthfit.ai account";
  const destination = props.nextPath ?? "/onboarding";
  const body = `
    ${renderStatCards([
      { label: "Destination", value: destination },
      { label: "Access", value: "Password account" },
      { label: "Next step", value: "Confirm and continue" },
    ])}
    ${renderBulletList([
      "Confirm your email to activate your password-based Healthfit.ai account.",
      "After confirmation, you will continue into onboarding or the page you originally requested.",
      "If you did not try to create this account, you can ignore this email.",
    ])}
  `;

  const html = renderEmailFrame({
    preheader: "Confirm your email to activate your Healthfit.ai account.",
    eyebrow: "Create account",
    title: `Welcome, ${firstName}. Confirm your account.`,
    intro:
      "Use the secure link below to verify your email and finish setting up your Healthfit.ai password account.",
    body,
    ctaLabel: "Confirm your account",
    ctaHref: props.confirmationLink,
    ctaHint:
      "For security, this confirmation link expires soon and should only be used by the person who created the account.",
    footer:
      "Healthfit.ai provides wellness guidance only and does not replace professional medical care.",
  });

  const text = [
    "Healthfit.ai",
    "",
    `Welcome, ${firstName}. Confirm your account.`,
    "Use the secure link below to verify your email and finish setting up your Healthfit.ai password account.",
    "",
    `Destination: ${destination}`,
    `Confirmation link: ${props.confirmationLink}`,
    "",
    "If you did not try to create this account, you can ignore this email.",
    "",
    "Healthfit.ai provides wellness guidance only and does not replace professional medical care.",
  ].join("\n");

  return { subject, html, text };
}

export function renderWelcomeEmail(props: {
  fullName: string;
  dashboardUrl: string;
  weeklyFocus: string;
}) {
  const firstName = props.fullName.trim().split(/\s+/)[0] ?? "there";
  const subject = "Your Healthfit.ai plan is ready";
  const body = `
    ${renderStatCards([
      { label: "Primary focus", value: props.weeklyFocus },
      { label: "Workspace", value: "Overview, coach, workouts" },
      { label: "Status", value: "Ready to start" },
    ])}
    ${renderBulletList([
      "Review your overview to see your daily brief and the current plan direction.",
      "Open workouts to follow your weekly structure and rebuild your week when life changes.",
      "Use coach, meals, habits, and check-ins together so guidance stays grounded in real behavior.",
    ])}
  `;

  const html = renderEmailFrame({
    preheader: "Your first Healthfit.ai plan is ready to review.",
    eyebrow: "Onboarding complete",
    title: `Welcome, ${firstName}. Your plan is ready.`,
    intro:
      "Your Healthfit.ai workspace is now set up with your first weekly structure, goal context, and wellness guardrails.",
    body,
    ctaLabel: "Open your dashboard",
    ctaHref: props.dashboardUrl,
    ctaHint: "You can log workouts, meals, habits, and check-ins from the same workspace to keep the plan accurate.",
    footer:
      "Healthfit.ai provides wellness guidance only and does not diagnose, treat, or replace licensed care.",
  });

  const text = [
    "Healthfit.ai",
    "",
    `Welcome, ${firstName}. Your plan is ready.`,
    "Your workspace is now set up with your first weekly structure, goal context, and wellness guardrails.",
    "",
    `Primary focus: ${props.weeklyFocus}`,
    `Open your dashboard: ${props.dashboardUrl}`,
    "",
    "Review your overview, follow your workouts, and keep the coach grounded with check-ins and logs.",
    "",
    "Healthfit.ai provides wellness guidance only and does not diagnose, treat, or replace licensed care.",
  ].join("\n");

  return { subject, html, text };
}

export function renderPurchaseInviteEmail(props: {
  fullName: string;
  planName: string;
  claimUrl: string;
  existingAccount?: boolean;
}) {
  const firstName = props.fullName.trim().split(/\s+/)[0] ?? "there";
  const existingAccount = props.existingAccount ?? false;
  const subject = existingAccount
    ? `Your ${props.planName} membership is ready`
    : `Claim your new ${props.planName} membership`;
  const body = `
    ${renderStatCards([
      { label: "Plan", value: props.planName },
      { label: "Access", value: existingAccount ? "Secure sign-in link" : "Secure invite link" },
      { label: "Next step", value: "Claim your workspace" },
    ])}
    ${renderBulletList([
      "Open the secure link below from the same inbox you used at checkout.",
      existingAccount
        ? "You will land back inside your member workspace with the upgraded plan attached."
        : "You will create and claim your Healthfit.ai account after the link verifies your email.",
      "Once inside, complete onboarding so your coach, weekly plan, and dashboard reflect the right context.",
    ])}
  `;

  const html = renderEmailFrame({
    preheader: `Your ${props.planName} membership is ready to claim.`,
    eyebrow: existingAccount ? "Membership ready" : "Claim your account",
    title: existingAccount
      ? `Welcome back, ${firstName}. Your membership is live.`
      : `${firstName}, your membership is waiting.`,
    intro: existingAccount
      ? "Your checkout completed and the upgraded membership has been attached to your Healthfit.ai workspace."
      : "Your checkout completed. Use the secure link below to claim your Healthfit.ai account and continue into onboarding.",
    body,
    ctaLabel: existingAccount ? "Open your workspace" : "Claim your account",
    ctaHref: props.claimUrl,
    ctaHint:
      "For security, use this link from the inbox that completed checkout. If you did not make this purchase, contact support.",
    footer:
      "Healthfit.ai provides wellness guidance only and does not diagnose, treat, or replace licensed care.",
  });

  const text = [
    "Healthfit.ai",
    "",
    existingAccount
      ? `Welcome back, ${firstName}. Your membership is live.`
      : `${firstName}, your membership is waiting.`,
    existingAccount
      ? "Your upgraded membership has been attached to your Healthfit.ai workspace."
      : "Your checkout completed. Use the secure link below to claim your Healthfit.ai account.",
    "",
    `Plan: ${props.planName}`,
    `Claim link: ${props.claimUrl}`,
    "",
    "Open the link from the same inbox you used at checkout, then complete onboarding so your workspace is ready.",
    "",
    "Healthfit.ai provides wellness guidance only and does not diagnose, treat, or replace licensed care.",
  ].join("\n");

  return { subject, html, text };
}
