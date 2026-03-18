type SendResendEmailProps = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  from?: string;
  replyTo?: string | string[];
  tags?: Array<{
    name: string;
    value: string;
  }>;
};

type ResendErrorResponse = {
  error?: string;
  message?: string;
  name?: string;
};

type ResendEmailResponse = {
  id: string;
};

function resolveResendFromEmail() {
  if (process.env.RESEND_FROM_EMAIL) {
    return process.env.RESEND_FROM_EMAIL;
  }

  if (process.env.NODE_ENV !== "production") {
    return "Healthfit.ai <onboarding@resend.dev>";
  }

  throw new Error("RESEND_FROM_EMAIL is required when using Resend in production.");
}

export function hasResendEmailEnv() {
  return typeof process.env.RESEND_API_KEY === "string" && process.env.RESEND_API_KEY.length > 0;
}

export async function sendResendEmail(props: SendResendEmailProps) {
  if (!hasResendEmailEnv()) {
    throw new Error("RESEND_API_KEY is required to send email through Resend.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: props.from ?? resolveResendFromEmail(),
      to: Array.isArray(props.to) ? props.to : [props.to],
      subject: props.subject,
      html: props.html,
      text: props.text,
      reply_to: props.replyTo ?? process.env.RESEND_REPLY_TO_EMAIL,
      tags: props.tags,
    }),
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? ((await response.json()) as ResendEmailResponse | ResendErrorResponse)
    : null;

  if (!response.ok) {
    const message =
      payload && "message" in payload && payload.message
        ? payload.message
        : payload && "error" in payload && payload.error
          ? payload.error
          : "Failed to send email through Resend.";

    throw new Error(message);
  }

  return payload as ResendEmailResponse;
}
