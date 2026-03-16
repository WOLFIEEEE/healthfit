import { expect, test } from "@playwright/test";

test.describe("public product flows", () => {
  test("homepage exposes the main marketing and editorial entry points", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        name: /Health routines that feel grounded, guided, and actually repeatable\./i,
      })
    ).toBeVisible();

    await expect(
      page.getByRole("navigation").getByRole("link", { name: "Insights" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Explore resource hub/i })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Start free/i }).first()
    ).toBeVisible();
  });

  test("resources hub and a research page render correctly", async ({ page }) => {
    await page.goto("/resources");

    await expect(
      page.getByRole("heading", {
        name: /Clean, research-backed wellness pages built from official guidance\./i,
      })
    ).toBeVisible();

    await page.goto("/resources/physical-activity-guidelines-for-adults");

    await expect(
      page.getByRole("heading", {
        name: "Physical Activity Guidelines for Adults",
      })
    ).toBeVisible();

    await expect(
      page.getByRole("heading", {
        name: /Official references used on this page/i,
      })
    ).toBeVisible();
  });

  test("insights and section pages load without crashing", async ({ page }) => {
    await page.goto("/insights");

    await expect(
      page.getByRole("heading", {
        name: /Editorial content managed directly through Sanity\./i,
      })
    ).toBeVisible();

    await page.getByRole("link", { name: "Blog" }).first().click();

    await expect(page).toHaveURL(/\/blog$/);
    await expect(
      page.getByRole("heading", {
        name: /Blog powered directly by Sanity\./i,
      })
    ).toBeVisible();

    await page.goto("/news");
    await expect(
      page.getByRole("heading", {
        name: /News powered directly by Sanity\./i,
      })
    ).toBeVisible();
  });

  test("login page still exposes the auth entry UI", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("heading", {
        name: /Welcome back/i,
      })
    ).toBeVisible();

    await expect(page.getByLabel(/Email address/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Continue with Google/i })
    ).toBeVisible();
  });
});
