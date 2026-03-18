// @ts-expect-error Deno edge runtime dependency is resolved remotely.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";
// @ts-expect-error Deno edge runtime dependency is resolved remotely.
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

type PlanKey = "starter" | "pro" | "elite";

type PublicUserRow = {
  supabase_user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  dodo_customer_id: string | null;
  current_subscription_id: string | null;
  current_plan_key: string;
  onboarding_completed: boolean;
  wellness_consent_accepted: boolean;
  disclaimer_accepted: boolean;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  // @ts-expect-error Deno.env is available in the edge runtime.
  Deno.env.get("SUPABASE_URL")!,
  // @ts-expect-error Deno.env is available in the edge runtime.
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const planEntitlements = {
  starter: {
    aiCoach: false,
    weeklyPrograms: true,
    advancedAnalytics: false,
    premiumPrograms: false,
    progressPhotos: false,
    prioritySupport: false,
    customHabitTemplates: true,
    aiDailyMessages: 0,
    maxActiveGoals: 2,
  },
  pro: {
    aiCoach: true,
    weeklyPrograms: true,
    advancedAnalytics: true,
    premiumPrograms: false,
    progressPhotos: true,
    prioritySupport: false,
    customHabitTemplates: true,
    aiDailyMessages: 25,
    maxActiveGoals: 5,
  },
  elite: {
    aiCoach: true,
    weeklyPrograms: true,
    advancedAnalytics: true,
    premiumPrograms: true,
    progressPhotos: true,
    prioritySupport: true,
    customHabitTemplates: true,
    aiDailyMessages: 100,
    maxActiveGoals: 10,
  },
} as const;

// @ts-expect-error Deno.serve is available in the edge runtime.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  // @ts-expect-error Deno.env is available in the edge runtime.
  const dodoWebhookSecret = Deno.env.get("DODO_WEBHOOK_SECRET");

  if (!dodoWebhookSecret) {
    console.error("DODO_WEBHOOK_SECRET is not set.");
    return new Response("Server configuration error", {
      status: 500,
      headers: corsHeaders,
    });
  }

  const webhook = new Webhook(dodoWebhookSecret);
  const rawBody = await req.text();
  const event = JSON.parse(rawBody);
  const webhookHeaders = {
    "webhook-id": req.headers.get("webhook-id") || "",
    "webhook-signature": req.headers.get("webhook-signature") || "",
    "webhook-timestamp": req.headers.get("webhook-timestamp") || "",
  };

  console.info(`Received ${event.type} event`);

  try {
    await webhook.verify(rawBody, webhookHeaders);
  } catch (error) {
    console.error("Webhook verification failed:", error.message);
    return new Response("Invalid webhook signature", {
      status: 400,
      headers: corsHeaders,
    });
  }

  try {
    switch (event.type) {
      case "payment.succeeded":
      case "payment.failed":
      case "payment.processing":
      case "payment.cancelled":
        await managePayment(event);
        break;

      case "subscription.active":
        if (isGuestCheckoutEvent(event)) {
          await provisionGuestCheckoutAccess(event);
        }

        await manageSubscription(event);
        await syncMembershipAccess({
          dodoCustomerId: event.data.customer.customer_id,
          customerEmail: event.data.customer.email,
          customerName: event.data.customer.name,
          subscriptionId: event.data.subscription_id,
          productId: event.data.product_id,
        });
        break;

      case "subscription.plan_changed":
        await manageSubscription(event);
        await syncMembershipAccess({
          dodoCustomerId: event.data.customer.customer_id,
          customerEmail: event.data.customer.email,
          customerName: event.data.customer.name,
          subscriptionId: event.data.subscription_id,
          productId: event.data.product_id,
        });
        break;

      case "subscription.renewed":
      case "subscription.on_hold":
        await manageSubscription(event);
        break;

      case "subscription.cancelled":
      case "subscription.expired":
      case "subscription.failed":
        await manageSubscription(event);
        await downgradeMembershipAccess({
          dodoCustomerId: event.data.customer.customer_id,
          customerEmail: event.data.customer.email,
        });
        break;

      default:
        console.warn(`Unhandled event type: ${event.type}`);
        return new Response("Unhandled event type", {
          status: 200,
          headers: corsHeaders,
        });
    }
  } catch (error) {
    console.error("Error processing webhook:", error.message);
    return new Response("Error processing webhook", {
      status: 500,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeName(name: string | null | undefined, email: string) {
  const normalized = name?.trim();
  return normalized && normalized.length > 0 ? normalized : email.split("@")[0];
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function readMetadataValue(
  metadata: Record<string, unknown> | null | undefined,
  key: string
) {
  const value = metadata?.[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function isGuestCheckoutEvent(event: any) {
  const checkoutFlow = readMetadataValue(event.data.metadata, "checkout_flow");
  const guestCheckout = readMetadataValue(event.data.metadata, "guest_checkout");

  return checkoutFlow === "guest_purchase" || guestCheckout === "true";
}

function resolveClaimRedirectUrl(metadata: Record<string, unknown> | null | undefined) {
  const explicitRedirect = readMetadataValue(metadata, "claim_redirect_url");

  if (explicitRedirect) {
    return explicitRedirect;
  }

  const appUrl =
    readMetadataValue(metadata, "app_url") ??
    // @ts-expect-error Deno.env is available in the edge runtime.
    Deno.env.get("NEXT_PUBLIC_APP_URL") ??
    // @ts-expect-error Deno.env is available in the edge runtime.
    Deno.env.get("APP_URL");

  if (!appUrl) {
    return null;
  }

  return `${appUrl.replace(/\/+$/, "")}/api/auth/callback`;
}

function hasResendEmailEnv() {
  // @ts-expect-error Deno.env is available in the edge runtime.
  return Boolean(Deno.env.get("RESEND_API_KEY"));
}

function resolveResendFromEmail() {
  // @ts-expect-error Deno.env is available in the edge runtime.
  return Deno.env.get("RESEND_FROM_EMAIL") || "Healthfit.ai <onboarding@resend.dev>";
}

function resolveAdminEmails() {
  const envValues = [
    // @ts-expect-error Deno.env is available in the edge runtime.
    Deno.env.get("ADMIN_EMAIL"),
    // @ts-expect-error Deno.env is available in the edge runtime.
    Deno.env.get("HEALTHFIT_ADMIN_EMAILS"),
  ];

  return envValues
    .filter((value): value is string => Boolean(value))
    .flatMap((value) => value.split(","))
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

function resolveUserRole(email: string, existingRole?: string | null) {
  if (existingRole === "admin") {
    return "admin";
  }

  return resolveAdminEmails().includes(normalizeEmail(email)) ? "admin" : "member";
}

function resolvePlanKey(productId: string | null | undefined): PlanKey {
  // @ts-expect-error Deno.env is available in the edge runtime.
  if (productId === Deno.env.get("DODO_ELITE_PRODUCT_ID")) {
    return "elite";
  }

  // @ts-expect-error Deno.env is available in the edge runtime.
  if (productId === Deno.env.get("DODO_PRO_PRODUCT_ID")) {
    return "pro";
  }

  return "starter";
}

function resolvePlanName(planKey: PlanKey) {
  if (planKey === "elite") {
    return "Elite";
  }

  if (planKey === "pro") {
    return "Pro";
  }

  return "Starter";
}

function isMissingUserErrorMessage(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("not found") ||
    normalized.includes("not exist") ||
    normalized.includes("not registered")
  );
}

function buildPurchaseAccessEmail(props: {
  fullName: string;
  planName: string;
  claimUrl: string;
  existingAccount: boolean;
}) {
  const firstName = props.fullName.trim().split(/\s+/)[0] || "there";
  const subject = props.existingAccount
    ? `Your ${props.planName} membership is ready`
    : `Claim your new ${props.planName} membership`;
  const title = props.existingAccount
    ? `Welcome back, ${firstName}. Your membership is live.`
    : `${firstName}, your membership is waiting.`;
  const intro = props.existingAccount
    ? "Your purchase completed and the upgraded plan is attached to your Healthfit.ai workspace."
    : "Your purchase completed. Use the secure link below to claim your Healthfit.ai account and continue into onboarding.";
  const actionLabel = props.existingAccount
    ? "Open your workspace"
    : "Claim your account";

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f3f7f2;color:#214d39;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center" style="padding:28px 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;">
            <tr>
              <td style="padding:0 10px 16px;">
                <div style="display:inline-flex;align-items:center;">
                  <span style="display:inline-block;height:16px;width:16px;border-radius:999px;border:4px solid #ffffff;background:linear-gradient(135deg,#2f704d,#8fc26a);box-shadow:0 0 0 8px #4a8b63;"></span>
                  <span style="display:inline-block;margin-left:16px;font-size:21px;font-weight:600;letter-spacing:-0.03em;color:#214d39;">
                    Healthfit.ai
                  </span>
                </div>
              </td>
            </tr>
            <tr>
              <td style="border:1px solid #d9e4da;border-radius:28px;background:#ffffff;padding:32px 28px;box-shadow:0 24px 60px -42px rgba(33,77,57,0.28);">
                <div style="display:inline-block;border-radius:999px;background:#edf6ef;border:1px solid #cfe0d2;padding:7px 12px;font-size:11px;line-height:1;letter-spacing:0.18em;text-transform:uppercase;color:#4a6b5a;">
                  ${props.existingAccount ? "Membership ready" : "Claim your account"}
                </div>
                <h1 style="margin:18px 0 0;font-size:34px;line-height:1.08;letter-spacing:-0.04em;color:#214d39;">
                  ${escapeHtml(title)}
                </h1>
                <p style="margin:16px 0 0;font-size:15px;line-height:1.85;color:#51665b;">
                  ${escapeHtml(intro)}
                </p>
                <div style="margin-top:28px;border:1px solid #d9e4da;border-radius:20px;background:#f7fbf6;padding:16px;">
                  <div style="font-size:11px;line-height:1.5;letter-spacing:0.18em;text-transform:uppercase;color:#6b7d74;">
                    Plan
                  </div>
                  <div style="margin-top:8px;font-size:18px;font-weight:600;line-height:1.4;color:#214d39;">
                    ${escapeHtml(props.planName)}
                  </div>
                </div>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:28px;">
                  <tr>
                    <td style="border-radius:999px;background:#214d39;">
                      <a href="${escapeHtml(props.claimUrl)}" style="display:inline-block;padding:14px 24px;font-size:14px;font-weight:600;line-height:1;color:#ffffff;text-decoration:none;">
                        ${escapeHtml(actionLabel)}
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:16px 0 0;font-size:12px;line-height:1.8;color:#6b7d74;">
                  Open the secure link from the same inbox you used at checkout. If you did not make this purchase, contact support.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 10px 0;font-size:12px;line-height:1.8;color:#6b7d74;">
                Healthfit.ai provides wellness guidance only and does not diagnose, treat, or replace licensed care.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    "Healthfit.ai",
    "",
    title,
    intro,
    "",
    `Plan: ${props.planName}`,
    `Access link: ${props.claimUrl}`,
    "",
    "Open the secure link from the same inbox you used at checkout.",
    "",
    "Healthfit.ai provides wellness guidance only and does not diagnose, treat, or replace licensed care.",
  ].join("\n");

  return { subject, html, text };
}

async function sendPurchaseAccessEmail(props: {
  email: string;
  fullName: string;
  planName: string;
  claimUrl: string;
  existingAccount: boolean;
}) {
  if (!hasResendEmailEnv()) {
    throw new Error("RESEND_API_KEY is required to send branded purchase email.");
  }

  const emailContent = buildPurchaseAccessEmail({
    fullName: props.fullName,
    planName: props.planName,
    claimUrl: props.claimUrl,
    existingAccount: props.existingAccount,
  });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      // @ts-expect-error Deno.env is available in the edge runtime.
      Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resolveResendFromEmail(),
      to: [props.email],
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      // @ts-expect-error Deno.env is available in the edge runtime.
      reply_to: Deno.env.get("RESEND_REPLY_TO_EMAIL") || undefined,
      tags: [
        { name: "flow", value: "purchase-invite" },
        { name: "plan", value: props.planName.toLowerCase() },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

async function findPublicUserByCustomerOrEmail(props: {
  dodoCustomerId?: string | null;
  customerEmail?: string | null;
}) {
  if (props.dodoCustomerId) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("dodo_customer_id", props.dodoCustomerId)
      .maybeSingle<PublicUserRow>();

    if (error) {
      throw error;
    }

    if (data) {
      return data;
    }
  }

  const normalizedEmail = props.customerEmail ? normalizeEmail(props.customerEmail) : null;

  if (!normalizedEmail) {
    return null;
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .ilike("email", normalizedEmail)
    .maybeSingle<PublicUserRow>();

  if (error) {
    throw error;
  }

  return data ?? null;
}

async function getUserIdFromCustomerId(
  dodoCustomerId: string,
  customerEmail?: string | null
) {
  const user = await findPublicUserByCustomerOrEmail({
    dodoCustomerId,
    customerEmail,
  });

  return user?.supabase_user_id ?? null;
}

async function syncAuthMetadata(props: {
  userId: string;
  fullName: string;
  role: string;
  onboardingCompleted: boolean;
}) {
  const { error } = await supabase.auth.admin.updateUserById(props.userId, {
    user_metadata: {
      full_name: props.fullName,
      onboardingCompleted: props.onboardingCompleted,
    },
    app_metadata: {
      role: props.role,
    },
  });

  if (error) {
    throw error;
  }
}

async function upsertPurchaseUser(props: {
  userId: string;
  email: string;
  fullName: string;
  dodoCustomerId: string;
  subscriptionId: string;
  planKey: PlanKey;
  existingUser: PublicUserRow | null;
}) {
  const now = new Date().toISOString();
  const role = resolveUserRole(props.email, props.existingUser?.role);
  const isAdmin = role === "admin";
  const onboardingCompleted = isAdmin
    ? true
    : props.existingUser?.onboarding_completed ?? false;
  const wellnessConsentAccepted = isAdmin
    ? true
    : props.existingUser?.wellness_consent_accepted ?? false;
  const disclaimerAccepted = isAdmin
    ? true
    : props.existingUser?.disclaimer_accepted ?? false;

  if (props.existingUser) {
    const { error } = await supabase
      .from("users")
      .update({
        email: props.email,
        full_name: props.fullName,
        role,
        dodo_customer_id: props.dodoCustomerId,
        current_subscription_id: props.subscriptionId,
        current_plan_key: props.planKey,
        onboarding_completed: onboardingCompleted,
        wellness_consent_accepted: wellnessConsentAccepted,
        disclaimer_accepted: disclaimerAccepted,
        updated_at: now,
      })
      .eq("supabase_user_id", props.userId);

    if (error) {
      throw error;
    }
  } else {
    const { error } = await supabase.from("users").insert({
      supabase_user_id: props.userId,
      email: props.email,
      full_name: props.fullName,
      avatar_url: null,
      role,
      dodo_customer_id: props.dodoCustomerId,
      current_subscription_id: props.subscriptionId,
      current_plan_key: props.planKey,
      onboarding_completed: onboardingCompleted,
      wellness_consent_accepted: wellnessConsentAccepted,
      disclaimer_accepted: disclaimerAccepted,
      last_active_at: now,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    });

    if (error) {
      throw error;
    }
  }

  await syncAuthMetadata({
    userId: props.userId,
    fullName: props.fullName,
    role,
    onboardingCompleted,
  });
}

async function syncEntitlementForPlan(props: {
  userId: string;
  planKey: PlanKey;
  source: string;
}) {
  const now = new Date().toISOString();
  const features = planEntitlements[props.planKey];

  const { error: deactivateError } = await supabase
    .from("entitlements")
    .update({
      is_active: false,
      updated_at: now,
    })
    .eq("user_id", props.userId)
    .eq("is_active", true);

  if (deactivateError) {
    throw deactivateError;
  }

  const { data: existingRows, error: existingError } = await supabase
    .from("entitlements")
    .select("id")
    .eq("user_id", props.userId)
    .eq("plan_key", props.planKey)
    .order("created_at", { ascending: false })
    .limit(1);

  if (existingError) {
    throw existingError;
  }

  const existingRow = existingRows?.[0];

  if (existingRow?.id) {
    const { error } = await supabase
      .from("entitlements")
      .update({
        plan_key: props.planKey,
        source: props.source,
        is_active: true,
        ai_daily_message_limit: features.aiDailyMessages,
        features,
        expires_at: null,
        updated_at: now,
      })
      .eq("id", existingRow.id);

    if (error) {
      throw error;
    }

    return;
  }

  const { error } = await supabase.from("entitlements").insert({
    id: `ent_${crypto.randomUUID()}`,
    user_id: props.userId,
    plan_key: props.planKey,
    source: props.source,
    is_active: true,
    ai_daily_message_limit: features.aiDailyMessages,
    features,
    expires_at: null,
    created_at: now,
    updated_at: now,
  });

  if (error) {
    throw error;
  }
}

async function attachBillingRecordsToUser(props: {
  userId: string;
  dodoCustomerId: string;
}) {
  const { error: paymentsError } = await supabase
    .from("payments")
    .update({ user_id: props.userId })
    .eq("customer_id", props.dodoCustomerId)
    .is("user_id", null);

  if (paymentsError) {
    throw paymentsError;
  }

  const { error: subscriptionsError } = await supabase
    .from("subscriptions")
    .update({ user_id: props.userId })
    .eq("customer_id", props.dodoCustomerId)
    .is("user_id", null);

  if (subscriptionsError) {
    throw subscriptionsError;
  }
}

async function syncMembershipAccess(props: {
  dodoCustomerId: string;
  customerEmail?: string | null;
  customerName?: string | null;
  subscriptionId: string;
  productId: string;
}) {
  const normalizedEmail = props.customerEmail
    ? normalizeEmail(props.customerEmail)
    : null;
  const existingUser = await findPublicUserByCustomerOrEmail({
    dodoCustomerId: props.dodoCustomerId,
    customerEmail: normalizedEmail,
  });

  if (!existingUser || !normalizedEmail) {
    console.warn(
      `No public user found to sync billing access for customer ${props.dodoCustomerId}.`
    );
    return;
  }

  const planKey = resolvePlanKey(props.productId);
  const fullName = normalizeName(props.customerName, normalizedEmail);

  await upsertPurchaseUser({
    userId: existingUser.supabase_user_id,
    email: normalizedEmail,
    fullName,
    dodoCustomerId: props.dodoCustomerId,
    subscriptionId: props.subscriptionId,
    planKey,
    existingUser,
  });
  await syncEntitlementForPlan({
    userId: existingUser.supabase_user_id,
    planKey,
    source: "billing",
  });
  await attachBillingRecordsToUser({
    userId: existingUser.supabase_user_id,
    dodoCustomerId: props.dodoCustomerId,
  });
}

async function downgradeMembershipAccess(props: {
  dodoCustomerId: string;
  customerEmail?: string | null;
}) {
  const existingUser = await findPublicUserByCustomerOrEmail({
    dodoCustomerId: props.dodoCustomerId,
    customerEmail: props.customerEmail,
  });

  if (!existingUser) {
    console.warn(
      `No public user found to downgrade for customer ${props.dodoCustomerId}.`
    );
    return;
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("users")
    .update({
      current_subscription_id: null,
      current_plan_key: "starter",
      updated_at: now,
    })
    .eq("supabase_user_id", existingUser.supabase_user_id);

  if (error) {
    throw error;
  }

  await syncEntitlementForPlan({
    userId: existingUser.supabase_user_id,
    planKey: "starter",
    source: "billing",
  });
}

async function generateMagicLink(props: {
  email: string;
  fullName: string;
  redirectTo: string | null;
}) {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: props.email,
    options: {
      data: {
        full_name: props.fullName,
      },
      redirectTo: props.redirectTo ?? undefined,
    },
  });

  if (error) {
    if (isMissingUserErrorMessage(error.message)) {
      return null;
    }

    throw error;
  }

  if (!data.user?.id) {
    throw new Error("Magic link generation did not return a user id.");
  }

  return {
    userId: data.user.id,
    claimUrl: data.properties.action_link,
  };
}

async function generateInviteLink(props: {
  email: string;
  fullName: string;
  redirectTo: string | null;
}) {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "invite",
    email: props.email,
    options: {
      data: {
        full_name: props.fullName,
      },
      redirectTo: props.redirectTo ?? undefined,
    },
  });

  if (error) {
    throw error;
  }

  if (!data.user?.id) {
    throw new Error("Invite link generation did not return a user id.");
  }

  return {
    userId: data.user.id,
    claimUrl: data.properties.action_link,
  };
}

async function sendSupabaseInvite(props: {
  email: string;
  fullName: string;
  redirectTo: string | null;
}) {
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(
    props.email,
    {
      data: {
        full_name: props.fullName,
      },
      redirectTo: props.redirectTo ?? undefined,
    }
  );

  if (error) {
    throw error;
  }

  if (!data.user?.id) {
    throw new Error("Invite flow did not return a user id.");
  }

  return {
    userId: data.user.id,
  };
}

async function sendSupabaseMagicLink(props: {
  email: string;
  redirectTo: string | null;
}) {
  const { error } = await supabase.auth.signInWithOtp({
    email: props.email,
    options: {
      emailRedirectTo: props.redirectTo ?? undefined,
    },
  });

  if (error) {
    throw error;
  }
}

async function provisionGuestCheckoutAccess(event: any) {
  const email = normalizeEmail(event.data.customer.email);
  const fullName = normalizeName(event.data.customer.name, email);
  const dodoCustomerId = event.data.customer.customer_id;
  const subscriptionId = event.data.subscription_id;
  const planKey = resolvePlanKey(event.data.product_id);
  const planName = resolvePlanName(planKey);
  const redirectTo = resolveClaimRedirectUrl(event.data.metadata);
  const existingUser = await findPublicUserByCustomerOrEmail({
    dodoCustomerId,
    customerEmail: email,
  });

  let userId = existingUser?.supabase_user_id ?? null;
  let claimUrl: string | null = null;
  let existingAccount = Boolean(userId);
  let emailAlreadyDispatched = false;

  if (!userId) {
    const magicLinkResult = await generateMagicLink({
      email,
      fullName,
      redirectTo,
    });

    if (magicLinkResult) {
      userId = magicLinkResult.userId;
      existingAccount = true;

      if (hasResendEmailEnv()) {
        claimUrl = magicLinkResult.claimUrl;
      } else {
        await sendSupabaseMagicLink({
          email,
          redirectTo,
        });
        emailAlreadyDispatched = true;
      }
    }
  }

  if (!userId) {
    if (hasResendEmailEnv()) {
      const inviteResult = await generateInviteLink({
        email,
        fullName,
        redirectTo,
      });

      userId = inviteResult.userId;
      claimUrl = inviteResult.claimUrl;
      existingAccount = false;
    } else {
      const inviteResult = await sendSupabaseInvite({
        email,
        fullName,
        redirectTo,
      });

      userId = inviteResult.userId;
      existingAccount = false;
      emailAlreadyDispatched = true;
    }
  } else if (!emailAlreadyDispatched) {
    if (hasResendEmailEnv()) {
      const magicLinkResult = await generateMagicLink({
        email,
        fullName,
        redirectTo,
      });

      if (!magicLinkResult) {
        throw new Error("Unable to generate a magic link for the purchased member.");
      }

      claimUrl = magicLinkResult.claimUrl;
    } else {
      await sendSupabaseMagicLink({
        email,
        redirectTo,
      });
      emailAlreadyDispatched = true;
    }
  }

  if (!userId) {
    throw new Error("Unable to provision account access for guest checkout.");
  }

  await upsertPurchaseUser({
    userId,
    email,
    fullName,
    dodoCustomerId,
    subscriptionId,
    planKey,
    existingUser,
  });
  await syncEntitlementForPlan({
    userId,
    planKey,
    source: "billing_guest_checkout",
  });
  await attachBillingRecordsToUser({
    userId,
    dodoCustomerId,
  });

  if (!emailAlreadyDispatched && claimUrl) {
    try {
      await sendPurchaseAccessEmail({
        email,
        fullName,
        planName,
        claimUrl,
        existingAccount,
      });
    } catch (error) {
      console.error("Branded purchase email failed, falling back to Supabase:", error.message);
      await sendSupabaseMagicLink({
        email,
        redirectTo,
      });
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function managePayment(event: any) {
  const userId = await getUserIdFromCustomerId(
    event.data.customer.customer_id,
    event.data.customer.email
  );
  const data = {
    payment_id: event.data.payment_id,
    brand_id: event.data.brand_id,
    created_at: event.data.created_at,
    currency: event.data.currency,
    metadata: event.data.metadata,
    payment_method: event.data.payment_method,
    payment_method_type: event.data.payment_method_type,
    status: event.data.status,
    subscription_id: event.data.subscription_id,
    total_amount: event.data.total_amount,
    user_id: userId,
    customer_email: event.data.customer.email,
    customer_name: event.data.customer.name,
    customer_id: event.data.customer.customer_id,
    webhook_data: event,
    billing: event.data.billing,
    business_id: event.data.business_id,
    card_issuing_country: event.data.card_issuing_country,
    card_last_four: event.data.card_last_four,
    card_network: event.data.card_network,
    card_type: event.data.card_type,
    discount_id: event.data.discount_id,
    disputes: event.data.disputes,
    error_code: event.data.error_code,
    error_message: event.data.error_message,
    payment_link: event.data.payment_link,
    product_cart: event.data.product_cart,
    refunds: event.data.refunds,
    settlement_amount: event.data.settlement_amount,
    settlement_currency: event.data.settlement_currency,
    settlement_tax: event.data.settlement_tax,
    tax: event.data.tax,
    updated_at: event.data.updated_at,
  };

  const { error } = await supabase.from("payments").upsert(data, {
    onConflict: "payment_id",
  });

  if (error) {
    throw error;
  }

  console.log(`Payment ${data.payment_id} upserted successfully.`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function manageSubscription(event: any) {
  const userId = await getUserIdFromCustomerId(
    event.data.customer.customer_id,
    event.data.customer.email
  );
  const data = {
    subscription_id: event.data.subscription_id,
    user_id: userId,
    addons: event.data.addons,
    billing: event.data.billing,
    cancel_at_next_billing_date: event.data.cancel_at_next_billing_date,
    cancelled_at: event.data.cancelled_at,
    created_at: event.data.created_at,
    currency: event.data.currency,
    customer_email: event.data.customer.email,
    customer_name: event.data.customer.name,
    customer_id: event.data.customer.customer_id,
    discount_id: event.data.discount_id,
    metadata: event.data.metadata,
    next_billing_date: event.data.next_billing_date,
    on_demand: event.data.on_demand,
    payment_frequency_count: event.data.payment_frequency_count,
    payment_period_interval: event.data.payment_frequency_interval,
    previous_billing_date: event.data.previous_billing_date,
    product_id: event.data.product_id,
    quantity: event.data.quantity,
    recurring_pre_tax_amount: event.data.recurring_pre_tax_amount,
    status: event.data.status,
    subscription_period_count: event.data.subscription_period_count,
    subscription_period_interval: event.data.subscription_period_interval,
    tax_inclusive: event.data.tax_inclusive,
    trial_period_days: event.data.trial_period_days,
  };

  const { error } = await supabase.from("subscriptions").upsert(data, {
    onConflict: "subscription_id",
  });

  if (error) {
    throw error;
  }

  console.log(`Subscription ${data.subscription_id} upserted successfully.`);
}
