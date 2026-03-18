import { Checkout } from "@dodopayments/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resolveAppUrl } from "@/lib/config/app-url";
import { DodoPaymentsEnvironment } from "@/lib/dodo-payments/client";
import { getCurrentAppUser } from "@/lib/healthfit/server/auth";
import { assertPaidPlanProduct, requireBillingUser } from "@/lib/healthfit/server/billing";

const checkoutCustomerSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  name: z.string().trim().min(2).max(120),
});

const checkoutSessionSchema = z.object({
  product_cart: z
    .array(
      z.object({
        product_id: z.string().min(1),
        quantity: z.coerce.number().int().positive().default(1),
      })
    )
    .length(1),
  customer: checkoutCustomerSchema.optional(),
});

function createCheckoutHandler(type: "session" | "static", returnUrl: string) {
  if (!process.env.DODO_PAYMENTS_API_KEY) {
    throw new Error("Dodo Payments is not configured");
  }

  return Checkout({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    returnUrl,
    environment:
      (process.env
        .DODO_PAYMENTS_ENVIRONMENT as DodoPaymentsEnvironment | undefined) ??
      "test_mode",
    type,
  });
}

function buildCustomerName(user: {
  fullName: string | null;
  email: string;
}) {
  return user.fullName?.trim() || user.email.split("@")[0];
}

function buildGuestCheckoutReturnUrl(props: {
  email: string;
  planKey: string;
}) {
  const url = new URL("/checkout/success", resolveAppUrl());
  url.searchParams.set("email", props.email);
  url.searchParams.set("plan", props.planKey);

  return url.toString();
}

function buildCheckoutMetadata(props: {
  appUrl: string;
  customer: { email: string; name: string };
  planKey: string;
  flow: "member_billing" | "guest_purchase";
}) {
  return {
    app_url: props.appUrl,
    claim_redirect_url: `${props.appUrl}/api/auth/callback`,
    checkout_flow: props.flow,
    customer_email: props.customer.email,
    customer_name: props.customer.name,
    plan_key: props.planKey,
    guest_checkout: props.flow === "guest_purchase" ? "true" : "false",
  };
}

function errorStatus(message: string) {
  if (message === "Unauthorized") {
    return 401;
  }

  if (message === "Dodo Payments is not configured") {
    return 503;
  }

  return 400;
}

function errorResponse(error: unknown, fallbackMessage: string) {
  const message = error instanceof Error ? error.message : fallbackMessage;

  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: errorStatus(message) }
  );
}

async function normalizeCheckoutResponse(response: Response) {
  if (response.ok) {
    return response;
  }

  return NextResponse.json(
    {
      success: false,
      error: await response.text(),
    },
    { status: response.status }
  );
}

export const GET = async (req: NextRequest) => {
  try {
    const user = await requireBillingUser();
    const productId = req.nextUrl.searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          error: "productId is required",
        },
        { status: 400 }
      );
    }

    const plan = assertPaidPlanProduct(productId);
    const checkoutUrl = new URL(req.url);
    checkoutUrl.search = new URLSearchParams({
      productId: plan.dodoProductId,
      quantity: "1",
      fullName: buildCustomerName(user),
      email: user.email,
    }).toString();

    const handler = createCheckoutHandler(
      "static",
      `${resolveAppUrl()}/dashboard/billing`
    );
    const checkoutRequest = new Request(checkoutUrl, {
      method: "GET",
    }) as unknown as NextRequest;

    return normalizeCheckoutResponse(await handler(checkoutRequest));
  } catch (error) {
    return errorResponse(error, "Failed to start checkout");
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const user = await getCurrentAppUser();
    const parsedBody = checkoutSessionSchema.safeParse(await req.json());

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid checkout payload",
        },
        { status: 400 }
      );
    }

    const [item] = parsedBody.data.product_cart;
    const plan = assertPaidPlanProduct(item.product_id);
    const customer = user
      ? {
          email: user.email,
          name: buildCustomerName(user),
        }
      : parsedBody.data.customer;

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          error: "Guest checkout requires name and email.",
        },
        { status: 400 }
      );
    }

    const appUrl = resolveAppUrl();
    const returnUrl = user
      ? `${appUrl}/dashboard/billing`
      : buildGuestCheckoutReturnUrl({
          email: customer.email,
          planKey: plan.key,
        });
    const handler = createCheckoutHandler("session", returnUrl);
    const checkoutRequest = new Request(req.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_cart: [
          {
            product_id: plan.dodoProductId,
            quantity: item.quantity,
          },
        ],
        customer,
        metadata: buildCheckoutMetadata({
          appUrl,
          customer,
          planKey: plan.key,
          flow: user ? "member_billing" : "guest_purchase",
        }),
        return_url: returnUrl,
      }),
    }) as unknown as NextRequest;

    return normalizeCheckoutResponse(await handler(checkoutRequest));
  } catch (error) {
    return errorResponse(error, "Failed to start checkout");
  }
};
