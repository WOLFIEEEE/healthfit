import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow } from "./support/layout";

const viewports = [
  { label: "320x568", width: 320, height: 568 },
  { label: "390x844", width: 390, height: 844 },
  { label: "768x1024", width: 768, height: 1024 },
];

const pageChecks = [
  {
    url: "/",
    heading: { role: "heading" as const, name: /^Health routines$/i },
  },
  {
    url: "/resources",
    heading: {
      role: "heading" as const,
      name: /Clean, research-backed wellness pages built from official guidance\./i,
    },
  },
  {
    url: "/resources/physical-activity-guidelines-for-adults",
    heading: {
      role: "heading" as const,
      name: /Physical Activity Guidelines for Adults/i,
    },
  },
  {
    url: "/insights",
    heading: {
      role: "heading" as const,
      name: /Editorial content managed directly through Sanity\./i,
    },
  },
  {
    url: "/login",
    heading: { role: "heading" as const, name: /Welcome back/i },
  },
];

test.describe("responsive public layouts", () => {
  for (const viewport of viewports) {
    test(`public pages fit without horizontal overflow at ${viewport.label}`, async ({
      page,
    }) => {
      test.slow();
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      for (const pageCheck of pageChecks) {
        await page.goto(pageCheck.url, { waitUntil: "domcontentloaded" });
        await expect(
          page.getByRole(pageCheck.heading.role, {
            name: pageCheck.heading.name,
          })
        ).toBeVisible();
        await expectNoHorizontalOverflow(page);
      }
    });
  }
});
