import { expect, test } from "@playwright/test";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";

config({ path: ".env.local", quiet: true });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;

const hasRequiredEnv = Boolean(supabaseUrl && serviceRoleKey && databaseUrl);

test.describe("password authentication", () => {
  test.skip(
    !hasRequiredEnv,
    "Requires Supabase service role credentials and DATABASE_URL."
  );

  test("member can sign in with email and password", async ({ page }) => {
    test.setTimeout(120_000);

    const admin = createClient(supabaseUrl!, serviceRoleKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    const sql = postgres(databaseUrl!, {
      ssl: "require",
      max: 1,
      prepare: false,
    });
    const email = `codex-password-e2e-${Date.now()}@example.com`;
    const password = "StrongPass!12345";
    let userId: string | null = null;

    try {
      const { data: createdUser, error: createError } =
        await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: "Codex Password Member",
          },
        });

      if (createError || !createdUser.user) {
        throw createError ?? new Error("Failed to create password auth user.");
      }

      userId = createdUser.user.id;

      await page.goto("/login");
      await expect(page.getByRole("tab", { name: "Password" })).toBeVisible();
      await expect(page.getByRole("tab", { name: "Magic link" })).toBeVisible();
      await page.getByTestId("password-sign-in-email").fill(email);
      await page.getByTestId("password-sign-in-password").fill(password);
      await page.getByTestId("password-sign-in-submit").click();

      await page.waitForURL(/\/onboarding$/, { timeout: 30_000 });
      await expect(
        page.getByRole("heading", {
          name: "Let's build a plan that matches your real life.",
        })
      ).toBeVisible();

      const rows = await sql<{
        email: string;
        onboarding_completed: boolean;
      }[]>`
        select email, onboarding_completed
        from public.users
        where supabase_user_id = ${userId}
      `;

      expect(rows[0]?.email).toBe(email);
      expect(rows[0]?.onboarding_completed).toBe(false);
    } finally {
      await sql`
        delete from public.users
        where supabase_user_id = ${userId ?? "__missing__"}
      `;

      if (userId) {
        await admin.auth.admin.deleteUser(userId);
      }

      await sql.end({ timeout: 5 });
    }
  });
});
