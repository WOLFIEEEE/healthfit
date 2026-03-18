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

type CoachMessageRow = {
  role: string;
  count: number;
};

test.describe("authenticated member coach flow", () => {
  test.skip(
    !hasRequiredEnv,
    "Requires Supabase service role credentials and DATABASE_URL."
  );

  test("member can onboard, sees Starter gating, upgrades to Pro, and uses the coach", async ({
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
    const email = `codex-e2e-${Date.now()}@example.com`;
    let userId: string | null = null;

    try {
      const { data: createdUser, error: createError } =
        await admin.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            full_name: "Codex E2E Member",
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

      await page.getByPlaceholder("Full name").fill("Codex E2E Member");
      await page
        .getByPlaceholder("Describe the result you want from Healthfit.ai.")
        .fill("Build a steady routine, recover better, and improve daily energy.");
      await page.getByRole("button", { name: "Continue" }).click();
      await page.getByRole("button", { name: "Continue" }).click();
      await page
        .getByPlaceholder("Anything else your coach should know?")
        .fill("This is an automated E2E onboarding run.");
      await page.getByRole("button", { name: "Finish onboarding" }).click();

      await page.waitForURL(/\/dashboard\/overview$/, { timeout: 30_000 });
      await page.goto("/dashboard/overview");
      await page.waitForLoadState("networkidle");
      await expect(
        page.getByRole("heading", { name: /Welcome back, Codex/i })
      ).toBeVisible();
      await expect(page.getByText("AI daily brief")).toBeVisible();
      await expectNoHorizontalOverflow(page);

      await page.goto("/dashboard/coach");
      await page.waitForLoadState("networkidle");
      await expect(
        page.getByRole("heading", { name: "Daily guidance" })
      ).toBeVisible();
      await expect(page.getByRole("link", { name: "Upgrade for AI coach" })).toBeVisible();
      await expect(page.locator("textarea")).toBeDisabled();
      await expectNoHorizontalOverflow(page);

      const starterApiResult = await page.evaluate(async () => {
        const response = await fetch("/api/coach/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: "Can you help me plan today?",
          }),
        });

        return {
          status: response.status,
          body: await response.json(),
        };
      });

      expect(starterApiResult.status).toBe(403);
      expect(starterApiResult.body).toMatchObject({
        success: false,
        error: "AI coach is available on Pro and Elite plans.",
      });

      const now = new Date().toISOString();
      await sql`
        update public.users
        set current_plan_key = 'pro', updated_at = ${now}
        where supabase_user_id = ${userId}
      `;

      await sql`
        update public.entitlements
        set is_active = false, updated_at = ${now}
        where user_id = ${userId} and is_active = true
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
          ${`ent_${Date.now()}`},
          ${userId},
          'pro',
          'e2e_test',
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

      await page.goto("/dashboard/settings");
      await page.waitForLoadState("networkidle");
      await expect(page.getByText("Onboarding complete")).toBeVisible();
      await expect(page.getByText("AI coach: enabled")).toBeVisible();
      await expectNoHorizontalOverflow(page);

      await page.goto("/dashboard/workouts");
      await page.waitForLoadState("networkidle");
      await expect(page.getByText("Adaptive planning")).toBeVisible();
      await expectNoHorizontalOverflow(page);
      const replanResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes("/api/programs/replan") &&
          response.request().method() === "POST"
      );
      await page.getByRole("button", { name: "Rebuild this week with AI" }).click();
      const replanResponse = await replanResponsePromise;
      const replanPayload = await replanResponse.json();

      expect(replanResponse.status()).toBe(200);
      expect(replanPayload.success).toBe(true);

      await page.goto("/dashboard/coach");
      await page.waitForLoadState("networkidle");
      await expect(page.locator("textarea")).toBeEnabled();
      await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
      await expect(page.getByText("Coach context")).toBeVisible();
      await expectNoHorizontalOverflow(page);

      const normalPrompt =
        "I trained legs yesterday and want a simple recovery-focused plan for today.";
      await page.locator("textarea").fill(normalPrompt);
      const normalResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes("/api/coach/chat") &&
          response.request().method() === "POST"
      );
      await page.getByRole("button", { name: "Send" }).click();
      const normalResponse = await normalResponsePromise;
      const normalPayload = await normalResponse.json();

      expect(normalResponse.status()).toBe(200);
      expect(normalPayload.success).toBe(true);
      expect(normalPayload.data.message).toMatch(/\S/);
      const recoveryActionCard = page.getByTestId(
        "coach-action-card-coach-log-recovery-workout"
      );
      await expect(recoveryActionCard).toBeVisible();
      const actionResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes("/api/coach/actions") &&
          response.request().method() === "POST"
      );
      await page
        .getByTestId("coach-action-button-coach-log-recovery-workout")
        .click();
      const actionResponse = await actionResponsePromise;
      const actionPayload = await actionResponse.json();

      expect(actionResponse.status()).toBe(200);
      expect(actionPayload.success).toBe(true);
      await expect(
        page.getByText(/recovery/i).first()
      ).toBeVisible({ timeout: 30_000 });

      const cautionPrompt =
        "I have chest pain and shortness of breath when I try to continue. What should I do?";
      await page.locator("textarea").fill(cautionPrompt);
      const cautionResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes("/api/coach/chat") &&
          response.request().method() === "POST"
      );
      await page.getByRole("button", { name: "Send" }).click();
      const cautionResponse = await cautionResponsePromise;
      const cautionPayload = await cautionResponse.json();

      expect(cautionResponse.status()).toBe(200);
      expect(cautionPayload).toMatchObject({
        success: true,
        data: {
          conversationId: normalPayload.data.conversationId,
          safetyStatus: "caution",
          flags: ["chest pain", "shortness of breath"],
          fallbackUsed: true,
        },
      });
      await expect(
        page.getByText(/not able to help with urgent or medical-risk situations/i)
      ).toBeVisible({ timeout: 30_000 });
      await expect(
        page.getByText("23 of 25 AI messages left today")
      ).toBeVisible();
      await expectNoHorizontalOverflow(page);

      const conversationRows = await sql<{
        id: string;
        safety_status: string;
      }[]>`
        select id, safety_status
        from public.coach_conversations
        where user_id = ${userId}
        order by created_at asc
      `;
      const messageRows = await sql<CoachMessageRow[]>`
        select role, count(*)::int as count
        from public.coach_messages
        where user_id = ${userId}
        group by role
        order by role
      `;
      const notificationRows = await sql<{
        type: string;
        count: number;
      }[]>`
        select type, count(*)::int as count
        from public.notifications
        where user_id = ${userId}
        group by type
        order by type
      `;
      const workoutLogCount = await sql<{
        count: number;
      }[]>`
        select count(*)::int as count
        from public.workout_logs
        where user_id = ${userId}
      `;
      const programRows = await sql<{
        status: string;
        ai_generated: boolean;
        count: number;
      }[]>`
        select status, ai_generated, count(*)::int as count
        from public.weekly_programs
        where user_id = ${userId}
        group by status, ai_generated
        order by status, ai_generated
      `;

      expect(conversationRows).toEqual([
        {
          id: normalPayload.data.conversationId,
          safety_status: "caution",
        },
      ]);
      expect(messageRows).toEqual([
        { role: "assistant", count: 2 },
        { role: "user", count: 2 },
      ]);
      expect(notificationRows).toContainEqual({
        type: "coach_caution",
        count: 1,
      });
      expect(notificationRows).toContainEqual({
        type: "daily_brief",
        count: 1,
      });
      expect(notificationRows).toContainEqual({
        type: "weekly_replan_ready",
        count: 1,
      });
      expect(workoutLogCount).toEqual([{ count: 1 }]);
      expect(programRows).toEqual(
        expect.arrayContaining([
          {
            status: "active",
            ai_generated: true,
            count: 1,
          },
          {
            status: "archived",
            ai_generated: false,
            count: 1,
          },
        ])
      );
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
