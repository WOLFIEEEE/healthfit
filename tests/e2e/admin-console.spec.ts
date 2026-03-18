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

test.describe("admin console", () => {
  test.skip(
    !hasRequiredEnv,
    "Requires Supabase service role credentials and DATABASE_URL."
  );

  test("admin can review assigned plan, effective access, and caution signals", async ({
    page,
  }, testInfo) => {
    test.setTimeout(120_000);

    const baseURL = testInfo.project.use.baseURL;

    if (typeof baseURL !== "string") {
      throw new Error("Playwright baseURL is required for this test.");
    }

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
    const suffix = Date.now();
    const adminEmail = `codex-admin-e2e-${suffix}@example.com`;
    const memberId = `codex-admin-member-${suffix}`;
    const memberEmail = `codex-admin-member-${suffix}@example.com`;
    const memberName = `Codex Admin Member ${suffix}`;
    const now = new Date().toISOString();
    let adminUserId: string | null = null;

    try {
      const { data: createdAdmin, error: createAdminError } =
        await admin.auth.admin.createUser({
          email: adminEmail,
          email_confirm: true,
          user_metadata: {
            full_name: "Codex Admin E2E",
          },
        });

      if (createAdminError || !createdAdmin.user) {
        throw createAdminError ?? new Error("Failed to create the admin auth user.");
      }

      adminUserId = createdAdmin.user.id;

      const { data: linkData, error: linkError } =
        await admin.auth.admin.generateLink({
          type: "magiclink",
          email: adminEmail,
          options: {
            redirectTo: `${baseURL}/api/auth/callback`,
          },
        });

      if (linkError || !linkData.properties.hashed_token) {
        throw linkError ?? new Error("Failed to generate the admin magic link.");
      }

      await page.goto(
        `${baseURL}/api/auth/callback?token_hash=${linkData.properties.hashed_token}&type=magiclink`,
        { waitUntil: "domcontentloaded" }
      );
      await page.waitForURL(/\/onboarding$/, { timeout: 30_000 });

      await sql`
        update public.users
        set
          role = 'admin',
          onboarding_completed = true,
          wellness_consent_accepted = true,
          disclaimer_accepted = true,
          updated_at = ${now}
        where supabase_user_id = ${adminUserId}
      `;

      const [adminRecord] = await sql<{
        role: string;
        onboarding_completed: boolean;
      }[]>`
        select role, onboarding_completed
        from public.users
        where supabase_user_id = ${adminUserId}
      `;

      expect(adminRecord?.role).toBe("admin");
      expect(adminRecord?.onboarding_completed).toBe(true);

      const { error: updateAdminMetadataError } =
        await admin.auth.admin.updateUserById(adminUserId, {
          user_metadata: {
            ...(createdAdmin.user.user_metadata ?? {}),
            onboardingCompleted: true,
          },
          app_metadata: {
            role: "admin",
          },
        });

      if (updateAdminMetadataError) {
        throw updateAdminMetadataError;
      }

      await sql`
        insert into public.users (
          supabase_user_id,
          email,
          full_name,
          role,
          current_plan_key,
          onboarding_completed,
          wellness_consent_accepted,
          disclaimer_accepted,
          last_active_at,
          created_at,
          updated_at
        )
        values (
          ${memberId},
          ${memberEmail},
          ${memberName},
          'member',
          'starter',
          true,
          true,
          true,
          ${now},
          ${now},
          ${now}
        )
      `;

      await sql`
        insert into public.member_profiles (
          user_id,
          timezone,
          goal_summary,
          last_check_in_at,
          created_at,
          updated_at
        )
        values (
          ${memberId},
          'Asia/Kolkata',
          'Recover better while building consistency.',
          ${now},
          ${now},
          ${now}
        )
      `;

      await sql`
        insert into public.entitlements (
          id,
          user_id,
          plan_key,
          source,
          is_active,
          ai_daily_message_limit,
          features,
          created_at,
          updated_at
        )
        values (
          ${`ent_admin_${suffix}`},
          ${memberId},
          'pro',
          'system',
          true,
          25,
          ${JSON.stringify({
            aiCoach: true,
            weeklyPrograms: true,
            advancedAnalytics: true,
            premiumPrograms: false,
            progressPhotos: true,
            prioritySupport: false,
            customHabitTemplates: true,
            aiDailyMessages: 25,
            maxActiveGoals: 5,
          })}::jsonb,
          ${now},
          ${now}
        )
      `;

      await sql`
        insert into public.coach_conversations (
          id,
          user_id,
          title,
          safety_status,
          last_message_at,
          created_at,
          updated_at
        )
        values (
          ${`conv_admin_${suffix}`},
          ${memberId},
          'Chest discomfort after interval run',
          'caution',
          ${now},
          ${now},
          ${now}
        )
      `;

      await sql`
        insert into public.notifications (
          id,
          user_id,
          channel,
          type,
          title,
          body,
          status,
          metadata,
          created_at,
          updated_at
        )
        values (
          ${`notif_admin_${suffix}`},
          ${memberId},
          'in_app',
          'daily_brief',
          'Admin E2E brief',
          'Monitor plan mismatch and follow up on the caution thread.',
          'queued',
          '{}'::jsonb,
          ${now},
          ${now}
        )
      `;

      const adminPage = await page.context().newPage();
      await adminPage.goto("/admin");
      await adminPage.waitForLoadState("networkidle");

      await expect(
        adminPage.getByRole("heading", { name: "Operations console" })
      ).toBeVisible();
      await expect(
        adminPage.getByRole("heading", { name: "Plan exceptions" })
      ).toBeVisible();
      await expect(
        adminPage.getByRole("heading", { name: "Member access view" })
      ).toBeVisible();
      await expect(adminPage.getByText(memberName).first()).toBeVisible();
      await expect(adminPage.getByText(memberEmail).first()).toBeVisible();
      await expect(adminPage.getByText("System entitlement").first()).toBeVisible();
      await expect(
        adminPage.getByText("Does not match assigned plan").first()
      ).toBeVisible();
      await expect(
        adminPage.getByText("Chest discomfort after interval run")
      ).toBeVisible();
      await expect(adminPage.getByText("Admin E2E brief")).toBeVisible();
      await expectNoHorizontalOverflow(adminPage);
      await adminPage.goto("/dashboard/coach");
      await adminPage.waitForLoadState("networkidle");
      await expect(
        adminPage.getByRole("link", { name: "Admin" }).first()
      ).toBeVisible();
      await expect(adminPage.locator("textarea")).toBeEnabled();
      await expect(adminPage.getByText("Unlimited AI access").first()).toBeVisible();
      await expect(
        adminPage.getByRole("link", { name: "Upgrade for AI coach" })
      ).toHaveCount(0);

      const coachApiResult = await adminPage.evaluate(async () => {
        const response = await fetch("/api/coach/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: "Give me a quick admin test plan for today.",
          }),
        });

        return {
          status: response.status,
          body: await response.json(),
        };
      });

      expect(coachApiResult.status).toBe(200);
      expect(coachApiResult.body.success).toBe(true);
      await expectNoHorizontalOverflow(adminPage);
      await adminPage.close();
    } finally {
      await sql`
        delete from public.users
        where supabase_user_id in (${memberId}, ${adminUserId ?? "__missing__"})
      `;

      if (adminUserId) {
        await admin.auth.admin.deleteUser(adminUserId);
      }

      await sql.end({ timeout: 5 });
    }
  });
});
