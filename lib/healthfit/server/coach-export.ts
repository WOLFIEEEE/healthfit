import { and, eq, asc } from "drizzle-orm";
import { db } from "@/lib/drizzle/client";
import { coachConversations, coachMessages } from "@/lib/drizzle/schema";
import { format } from "date-fns";

export async function exportConversation(
  userId: string,
  conversationId: string,
  exportFormat: "markdown" | "json"
): Promise<{ content: string; filename: string }> {
  const conversation = await db.query.coachConversations.findFirst({
    where: and(
      eq(coachConversations.id, conversationId),
      eq(coachConversations.userId, userId)
    ),
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const messages = await db.query.coachMessages.findMany({
    where: eq(coachMessages.conversationId, conversationId),
    orderBy: [asc(coachMessages.createdAt)],
  });

  const dateStr = format(new Date(), "yyyy-MM-dd");
  const idSlice = conversationId.slice(0, 8);

  if (exportFormat === "json") {
    const data = messages.map((m) => ({
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    }));
    return {
      content: JSON.stringify(data, null, 2),
      filename: `healthfit-coach-${idSlice}-${dateStr}.json`,
    };
  }

  const lines = [
    `# Healthfit.ai Coach Conversation`,
    `**Title:** ${conversation.title}`,
    `**Exported:** ${dateStr}`,
    "",
    "---",
    "",
  ];

  for (const msg of messages) {
    const ts = msg.createdAt
      ? format(new Date(msg.createdAt), "MMM d, yyyy h:mm a")
      : "";
    const roleLabel = msg.role === "user" ? "You" : "Coach";
    lines.push(`**${roleLabel}** — ${ts}\n`);
    lines.push(msg.content);
    lines.push("\n---\n");
  }

  return {
    content: lines.join("\n"),
    filename: `healthfit-coach-${idSlice}-${dateStr}.md`,
  };
}
