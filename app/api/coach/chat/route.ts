import { and, eq, gte } from "drizzle-orm";
import { startOfDay } from "date-fns";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/drizzle/client";
import {
  coachConversations,
  coachMessages,
  entitlements,
  memberProfiles,
  users,
} from "@/lib/drizzle/schema";
import { coachMessageSchema } from "@/lib/healthfit/contracts";
import { createId } from "@/lib/healthfit/ids";
import { generateCoachReply } from "@/lib/healthfit/server/ai";
import {
  executeCoachAction,
  isAutomaticCoachLogAction,
} from "@/lib/healthfit/server/coach-actions";
import { resolvePlanAccess } from "@/lib/healthfit/server/access";
import {
  buildCoachActions,
  buildCoachContextSnapshot,
  buildCoachMemorySnapshot,
  buildCoachPromptContext,
  buildProactiveBrief,
} from "@/lib/healthfit/server/coach-intelligence";
import { queueNotification } from "@/lib/healthfit/server/notifications";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = coachMessageSchema.parse(await request.json());
    const [userRecord, profile, activeEntitlement] = await Promise.all([
      db.query.users.findFirst({
        where: eq(users.supabaseUserId, user.id),
      }),
      db.query.memberProfiles.findFirst({
        where: eq(memberProfiles.userId, user.id),
      }),
      db.query.entitlements.findFirst({
        where: and(eq(entitlements.userId, user.id), eq(entitlements.isActive, true)),
        orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
      }),
    ]);

    if (!userRecord) {
      return NextResponse.json(
        { success: false, error: "Member profile not found" },
        { status: 404 }
      );
    }

    const access = resolvePlanAccess({
      role: userRecord.role,
      currentPlanKey: userRecord.currentPlanKey,
      activeEntitlementPlanKey: activeEntitlement?.planKey ?? null,
      activeEntitlementAiDailyLimit: activeEntitlement?.aiDailyMessageLimit ?? null,
    });
    if (access.aiDailyLimit <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "AI coach is available on Pro and Elite plans.",
        },
        { status: 403 }
      );
    }

    const todayMessages = access.isUnlimited
      ? []
      : await db.query.coachMessages.findMany({
          where: and(
            eq(coachMessages.userId, user.id),
            eq(coachMessages.role, "user"),
            gte(coachMessages.createdAt, startOfDay(new Date()).toISOString())
          ),
          limit: access.aiDailyLimit + 1,
        });

    if (!access.isUnlimited && todayMessages.length >= access.aiDailyLimit) {
      return NextResponse.json(
        {
          success: false,
          error: "You have reached your AI coach limit for today.",
        },
        { status: 429 }
      );
    }

    let memory = await buildCoachMemorySnapshot(user.id);
    let coachContext = buildCoachContextSnapshot(memory);
    let proactiveBrief = buildProactiveBrief(memory);
    const now = new Date().toISOString();
    let conversationId = payload.conversationId;

    if (conversationId) {
      const existingConversation = await db.query.coachConversations.findFirst({
        where: and(
          eq(coachConversations.id, conversationId),
          eq(coachConversations.userId, user.id)
        ),
      });

      if (!existingConversation) {
        return NextResponse.json(
          { success: false, error: "Conversation not found" },
          { status: 404 }
        );
      }
    } else {
      conversationId = createId("conv");
      await db.insert(coachConversations).values({
        id: conversationId,
        userId: user.id,
        title: payload.message.slice(0, 48),
        safetyStatus: "clear",
        lastMessageAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }

    await db.insert(coachMessages).values({
      id: createId("msg"),
      conversationId,
      userId: user.id,
      role: "user",
      content: payload.message,
      safetyFlags: [],
      promptSnapshot: {
        coachContext,
        memoryContext: buildCoachPromptContext(memory),
      },
      structuredOutput: {},
      createdAt: now,
      updatedAt: now,
    });

    const reply = await generateCoachReply({
      conversationId,
      message: payload.message,
      goalSummary:
        profile?.goalSummary ??
        "better energy, strong routines, and consistent training",
      activityLevel: profile?.activityLevel ?? "moderate",
      experienceLevel: profile?.experienceLevel ?? "beginner",
      memoryContext: buildCoachPromptContext(memory),
      habitSlugs: memory.habitSlugs,
      sessionLengthMin: memory.sessionLengthMin,
    });
    const loggedActions = (reply.structured.loggedActions ?? []).filter(
      isAutomaticCoachLogAction
    );
    const autoAppliedMessages: string[] = [];
    const autoApplyErrors: string[] = [];

    if (reply.safetyStatus === "clear" && loggedActions.length > 0) {
      for (const action of loggedActions) {
        try {
          const result = await executeCoachAction(user.id, action);
          autoAppliedMessages.push(result.message);
        } catch (error) {
          autoApplyErrors.push(
            error instanceof Error ? error.message : "A coach log could not be saved."
          );
        }
      }

      memory = await buildCoachMemorySnapshot(user.id);
      coachContext = buildCoachContextSnapshot(memory);
      proactiveBrief = buildProactiveBrief(memory);
    }

    const coachActions = buildCoachActions({
      memory,
      message: payload.message,
      safetyStatus: reply.safetyStatus,
    }).filter(
      (action) =>
        !loggedActions.some(
          (loggedAction) =>
            loggedAction.type === action.type &&
            isAutomaticCoachLogAction(loggedAction)
        )
    );
    const actionSummary = [
      autoAppliedMessages.length > 0
        ? `Captured for you:\n- ${autoAppliedMessages.join("\n- ")}`
        : null,
      autoApplyErrors.length > 0
        ? `Could not save automatically:\n- ${autoApplyErrors.join("\n- ")}`
        : null,
    ]
      .filter(Boolean)
      .join("\n\n");
    const assistantMessage = actionSummary
      ? `${actionSummary}\n\n${reply.message}`
      : reply.message;
    const structuredReply = {
      ...reply.structured,
      actions: coachActions,
      loggedActions,
      context: coachContext,
    };

    await db.insert(coachMessages).values({
      id: createId("msg"),
      conversationId,
      userId: user.id,
      role: "assistant",
      content: assistantMessage,
      safetyFlags: reply.flags,
      model: process.env.HEALTHFIT_AI_MODEL ?? "fallback",
      promptSnapshot: {
        goalSummary: profile?.goalSummary,
        activityLevel: profile?.activityLevel,
        experienceLevel: profile?.experienceLevel,
        memoryContext: buildCoachPromptContext(memory),
      },
      structuredOutput: structuredReply,
      createdAt: now,
      updatedAt: now,
    });

    await db
      .update(coachConversations)
      .set({
        safetyStatus: reply.safetyStatus,
        lastMessageAt: now,
        updatedAt: now,
      })
      .where(eq(coachConversations.id, conversationId));

    if (reply.safetyStatus === "caution") {
      await queueNotification({
        userId: user.id,
        type: "coach_caution",
        title: "Coach conversation flagged for caution",
        body: "A recent coach message included safety-sensitive language.",
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...reply,
        message: assistantMessage,
        structured: structuredReply,
        actions: coachActions,
        context: coachContext,
        brief: proactiveBrief,
        autoAppliedMessages,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to send coach message",
      },
      { status: 400 }
    );
  }
}
