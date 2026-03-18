import { expect, test } from "@playwright/test";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";
import { expectNoHorizontalOverflow } from "./support/layout";

config({ path: ".env.local", quiet: true });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;

const hasRequiredEnv = Boolean(supabaseUrl && serviceRoleKey && databaseUrl);

test.describe("responsive authenticated dashboard", () => {
  test.skip(
    !hasRequiredEnv,
    "Requires Supabase service role credentials and DATABASE_URL."
  );

  test("member dashboard pages fit on a mobile viewport after onboarding", async ({
    page,
  }, testInfo) => {
    test.setTimeout(120_000);
    test.slow();

    const baseURL = testInfo.project.use.baseURL;

    if (typeof baseURL !== "string") {
      throw new Error("Playwright baseURL is required for this test.");
    }

    await page.setViewportSize({ width: 390, height: 844 });

    const admin = createClient(supabaseUrl!, serviceRoleKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    const sql = postgres(databaseUrl!, { ssl: "require" });
    const email = `codex-e2e-responsive-${Date.now()}@example.com`;
    let userId: string | null = null;

    try {
      const { data: createdUser, error: createError } =
        await admin.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            full_name: "Codex Responsive Member",
          },
        });

      if (createError || !createdUser.user) {
        throw createError ?? new Error("Failed to create the test auth user.");
      }

      userId = createdUser.user.id;

      const { data: linkData, error: linkError } =
        await admin.auth.admin.generateLink({
          type: "magiclink",
          email,
          options: {
            redirectTo: `${baseURL}/api/auth/callback`,
          },
        });

      if (linkError || !linkData.properties.hashed_token) {
        throw linkError ?? new Error("Failed to generate a magic link.");
      }

      await page.goto(
        `${baseURL}/api/auth/callback?token_hash=${linkData.properties.hashed_token}&type=magiclink`,
        { waitUntil: "domcontentloaded" }
      );
      await page.waitForURL(/\/onboarding$/, { timeout: 30_000 });

      await page.getByPlaceholder("Full name").fill("Codex Responsive Member");
      await page
        .getByPlaceholder("Describe the result you want from Healthfit.ai.")
        .fill("Build a calmer, sustainable wellness routine that works on mobile too.");
      await page.getByRole("button", { name: "Continue" }).click();
      await page.getByRole("button", { name: "Continue" }).click();
      await page
        .getByPlaceholder("Anything else your coach should know?")
        .fill("This is a responsive E2E onboarding run.");
      await page.getByRole("button", { name: "Finish onboarding" }).click();

      await page.waitForURL(/\/dashboard\/overview$/, { timeout: 30_000 });

      const dashboardPages = [
        {
          url: "/dashboard/overview",
          locator: page.getByRole("heading", { name: /Welcome back, Codex/i }),
        },
        {
          url: "/dashboard/workouts",
          locator: page.getByText("Adaptive planning"),
        },
        {
          url: "/dashboard/billing",
          locator: page.getByRole("heading", { name: /Plan options/i }),
        },
        {
          url: "/dashboard/coach",
          locator: page.getByRole("heading", { name: /Daily guidance/i }),
        },
        {
          url: "/dashboard/settings",
          locator: page.getByText("Onboarding complete"),
        },
      ];

      for (const dashboardPage of dashboardPages) {
        await page.goto(dashboardPage.url, { waitUntil: "domcontentloaded" });
        await expect(dashboardPage.locator).toBeVisible();
        await expectNoHorizontalOverflow(page);
      }
    } finally {
      if (userId) {
        await sql`
          delete from public.users
          where supabase_user_id = ${userId}
        `;

        await admin.auth.admin.deleteUser(userId);
      }

      await sql.end();
    }
  });
});
