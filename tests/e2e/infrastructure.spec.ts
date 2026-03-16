import { expect, test } from "@playwright/test";

test.describe("public machine-readable endpoints", () => {
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
