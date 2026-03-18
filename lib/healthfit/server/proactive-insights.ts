import { eq } from "drizzle-orm";
import { format } from "date-fns";
import { db } from "@/lib/drizzle/client";
import { notifications, users } from "@/lib/drizzle/schema";
import { ProactiveBrief } from "@/lib/healthfit/contracts";
import {
  buildCoachMemorySnapshot,
  CoachMemorySnapshot,
  buildProactiveBrief,
} from "@/lib/healthfit/server/coach-intelligence";
import { queueNotification } from "@/lib/healthfit/server/notifications";

function matchesNotificationKey(
  notification: {
    type: string;
    metadata: unknown;
  },
  type: string,
  dateKey: string
) {
  const metadata =
    typeof notification.metadata === "object" && notification.metadata !== null
      ? (notification.metadata as Record<string, unknown>)
      : {};

  return notification.type === type && metadata.date === dateKey;
}

function buildDailyNotificationId(userId: string, type: string, dateKey: string) {
  return `notif-${userId}-${type}-${dateKey}`;
}

export async function ensureProactiveInsights(
  userId: string,
  memoryInput?: CoachMemorySnapshot
): Promise<ProactiveBrief | null> {
  if (!memoryInput) {
    const user = await db.query.users.findFirst({
      where: eq(users.supabaseUserId, userId),
    });

    if (!user?.onboardingCompleted) {
      return null;
    }
  }

  const memory = memoryInput ?? (await buildCoachMemorySnapshot(userId));
  const brief = buildProactiveBrief(memory);
  const dateKey = format(new Date(), "yyyy-MM-dd");
  const recentNotifications = await db.query.notifications.findMany({
    where: eq(notifications.userId, userId),
    orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
    limit: 24,
  });

  if (
    !recentNotifications.some((notification) =>
      matchesNotificationKey(notification, "daily_brief", dateKey)
    )
  ) {
    await queueNotification({
      id: buildDailyNotificationId(userId, "daily_brief", dateKey),
      userId,
      type: "daily_brief",
      title: brief.title,
      body: brief.summary,
      metadata: {
        date: dateKey,
        generatedAt: brief.generatedAt,
        nextActions: brief.nextActions,
        recoveryStatus: memory.weeklyBrief.recoveryStatus,
        momentum: memory.weeklyBrief.momentum,
      },
    });
  }

  if (
    memory.checkInStale &&
    !recentNotifications.some((notification) =>
      matchesNotificationKey(notification, "checkin_nudge", dateKey)
    )
  ) {
    await queueNotification({
      id: buildDailyNotificationId(userId, "checkin_nudge", dateKey),
      userId,
      type: "checkin_nudge",
      title: "Your coach needs a fresher signal",
      body: "Add a quick check-in so the AI can react to your current energy, stress, and recovery.",
      metadata: {
        date: dateKey,
        reason: "stale_checkin",
      },
    });
  }

  if (
    memory.weeklyBrief.recoveryStatus === "recover" &&
    !recentNotifications.some((notification) =>
      matchesNotificationKey(notification, "recovery_nudge", dateKey)
    )
  ) {
    await queueNotification({
      id: buildDailyNotificationId(userId, "recovery_nudge", dateKey),
      userId,
      type: "recovery_nudge",
      title: "Recovery should lead today's decisions",
      body: "Your recent signals suggest it is worth simplifying the next 24 hours and protecting sleep, hydration, and lower-intensity movement.",
      metadata: {
        date: dateKey,
        reason: "recovery_status_recover",
      },
    });
  }

  if (
    (memory.weeklyBrief.momentum === "needs_attention" ||
      memory.weeklyBrief.recoveryStatus === "recover") &&
    !recentNotifications.some((notification) =>
      matchesNotificationKey(notification, "program_replan_nudge", dateKey)
    )
  ) {
    await queueNotification({
      id: buildDailyNotificationId(userId, "program_replan_nudge", dateKey),
      userId,
      type: "program_replan_nudge",
      title: "An adaptive week is ready to help",
      body: "Use the AI replanner to rebuild this week around your latest consistency and recovery signals.",
      metadata: {
        date: dateKey,
        reason: "adaptive_week_ready",
      },
    });
  }

  return brief;
}
