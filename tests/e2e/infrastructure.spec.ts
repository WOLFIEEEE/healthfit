import { expect, test } from "@playwright/test";

test.describe("public machine-readable endpoints", () => {
  test("protected dashboard routes redirect guests to login", async ({
    page,
  }) => {
    await page.goto("/dashboard/overview");

    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard%2Foverview$/);
    await expect(
      page.getByRole("heading", { name: /Welcome back/i })
    ).toBeVisible();
  });

  test("guest checkout requires customer details before starting payment", async ({
    request,
  }) => {
    const response = await request.post("/checkout", {
      data: {
        product_cart: [
          {
            product_id: process.env.DODO_PRO_PRODUCT_ID,
            quantity: 1,
          },
        ],
      },
    });

    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: "Guest checkout requires name and email.",
    });
  });

  test("auth callback redirects errors back to login", async ({ request }) => {
    const response = await request.get(
      "/api/auth/callback?error_description=Invalid%20login",
      {
        maxRedirects: 0,
      }
    );

    expect(response.status()).toBe(307);
    const location = response.headers().location;

    expect(location).toContain("/login?error=Invalid%20login");
  });

  test("robots.txt advertises the main crawlable sections", async ({ request }) => {
    const response = await request.get("/robots.txt");

    expect(response.ok()).toBe(true);

    const body = await response.text();

    expect(body).toContain("Sitemap:");
    expect(body).toContain("Allow: /insights");
    expect(body).toContain("Allow: /resources");
    expect(body).toContain("Disallow: /studio");
  });

  test("sitemap.xml includes both resource and editorial sections", async ({
    request,
  }) => {
    const response = await request.get("/sitemap.xml");

    expect(response.ok()).toBe(true);

    const body = await response.text();

    expect(body).toContain("/resources");
    expect(body).toContain("/insights");
    expect(body).toContain("/blog");
    expect(body).toContain("/guides");
  });
});
