import { expect, test } from "@playwright/test";

test.describe("guest checkout flow", () => {
  test("paid plans can start checkout without signing in", async ({ page }) => {
    await page.route("**/checkout", async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }

      expect(route.request().postDataJSON()).toMatchObject({
        customer: {
          email: "guest@example.com",
          name: "Guest Buyer",
        },
      });

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          checkout_url: "/checkout/success?email=guest@example.com&plan=pro",
        }),
      });
    });

    await page.goto("/checkout/start?plan=pro");

    await expect(
      page.getByRole("heading", {
        name: /Checkout first\. Claim your account right after\./i,
      })
    ).toBeVisible();
    await expect(page.getByTestId("guest-checkout-form")).toBeVisible();

    await page.getByTestId("guest-checkout-name").fill("Guest Buyer");
    await page.getByTestId("guest-checkout-email").fill("guest@example.com");
    await page.getByTestId("guest-checkout-submit").click();

    await expect(page).toHaveURL(
      /\/checkout\/success\?email=guest@example\.com&plan=pro$/
    );
    await expect(
      page.getByRole("heading", {
        name: /Watch your inbox for the next step/i,
      })
    ).toBeVisible();
    await expect(page.getByText(/guest@example\.com/i)).toBeVisible();
  });
});
