import { db } from "@/lib/drizzle/client";
import { notifications } from "@/lib/drizzle/schema";
import { createId } from "@/lib/healthfit/ids";

export async function queueNotification(props: {
  userId: string;
  type: string;
  title: string;
  body: string;
  channel?: string;
  metadata?: Record<string, unknown>;
}) {
  const now = new Date().toISOString();

  await db.insert(notifications).values({
    id: createId("notif"),
    userId: props.userId,
    type: props.type,
    title: props.title,
    body: props.body,
    channel: props.channel ?? "in_app",
    status: "queued",
    metadata: props.metadata ?? {},
    createdAt: now,
    updatedAt: now,
  });
}
