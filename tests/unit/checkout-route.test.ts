import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentAppUser: vi.fn(),
  assertPaidPlanProduct: vi.fn(),
  requireBillingUser: vi.fn(),
  lastConfig: null as null | Record<string, unknown>,
  lastRequestBody: null as null | string,
}));

vi.mock("@dodopayments/nextjs", () => ({
  Checkout: (config: Record<string, unknown>) => {
    mocks.lastConfig = config;

    return async (request: Request) => {
      mocks.lastRequestBody = await request.text();

      return new Response(
        JSON.stringify({
          session_id: "chk_123",
          checkout_url: "https://payments.example/session",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    };
  },
}));

vi.mock("@/lib/config/app-url", () => ({
  resolveAppUrl: () => "https://healthfit.example",
}));

vi.mock("@/lib/healthfit/server/auth", () => ({
  getCurrentAppUser: mocks.getCurrentAppUser,
}));

vi.mock("@/lib/healthfit/server/billing", () => ({
  assertPaidPlanProduct: mocks.assertPaidPlanProduct,
  requireBillingUser: mocks.requireBillingUser,
}));

import { POST } from "@/app/checkout/route";

describe("checkout route", () => {
  beforeEach(() => {
    process.env.DODO_PAYMENTS_API_KEY = "dodo_test_key";
    process.env.DODO_PAYMENTS_ENVIRONMENT = "test_mode";
    mocks.getCurrentAppUser.mockReset();
    mocks.assertPaidPlanProduct.mockReset();
    mocks.requireBillingUser.mockReset();
    mocks.lastConfig = null;
    mocks.lastRequestBody = null;
    mocks.assertPaidPlanProduct.mockReturnValue({
      key: "pro",
      dodoProductId: "dodo_pro",
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("allows guest checkout when customer details are provided", async () => {
    mocks.getCurrentAppUser.mockResolvedValue(null);

    const response = await POST(
      new Request("https://healthfit.example/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_cart: [
            {
              product_id: "pro",
              quantity: 1,
            },
          ],
          customer: {
            email: "Guest@Example.com",
            name: "Guest Buyer",
          },
        }),
      }) as never
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      checkout_url: "https://payments.example/session",
    });
    expect(mocks.lastConfig).toMatchObject({
      returnUrl:
        "https://healthfit.example/checkout/success?email=guest%40example.com&plan=pro",
      type: "session",
    });

    expect(JSON.parse(mocks.lastRequestBody ?? "{}")).toMatchObject({
      customer: {
        email: "guest@example.com",
        name: "Guest Buyer",
      },
      metadata: {
        checkout_flow: "guest_purchase",
        claim_redirect_url: "https://healthfit.example/api/auth/callback",
        guest_checkout: "true",
        plan_key: "pro",
      },
      return_url:
        "https://healthfit.example/checkout/success?email=guest%40example.com&plan=pro",
    });
  });

  it("requires name and email for guest checkout", async () => {
    mocks.getCurrentAppUser.mockResolvedValue(null);

    const response = await POST(
      new Request("https://healthfit.example/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_cart: [
            {
              product_id: "pro",
              quantity: 1,
            },
          ],
        }),
      }) as never
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: "Guest checkout requires name and email.",
    });
  });
});
