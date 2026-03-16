"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { SendHorizontal } from "lucide-react";
import { UsageMeter } from "@/lib/healthfit/contracts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type CoachPanelProps = {
  initialMessages: Array<{
    id: string;
    role: string;
    content: string;
    createdAt: string;
  }>;
  initialConversationId?: string;
  promptSuggestions?: string[];
  aiUsage?: UsageMeter;
  supportLane?: "priority" | "standard";
  upgradePrompt?: string | null;
};

export function CoachPanel({
  initialMessages,
  initialConversationId,
  promptSuggestions = [],
  aiUsage,
  supportLane,
  upgradePrompt,
}: CoachPanelProps) {
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const coachLocked = Boolean(aiUsage && aiUsage.limit <= 0);

  const handleSubmit = () => {
    if (!message.trim() || coachLocked) return;
    setError(null);
    const optimisticMessage = {
      id: `local-${Date.now()}`,
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, optimisticMessage]);
    setMessage("");

    startTransition(async () => {
      const response = await fetch("/api/coach/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          message: optimisticMessage.content,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        setError(payload.error ?? "Coach chat failed");
        setMessages((current) =>
          current.filter((item) => item.id !== optimisticMessage.id)
        );
        setMessage(optimisticMessage.content);
        return;
      }

      setConversationId(payload.data.conversationId);
      setMessages((current) => [
        ...current.filter((item) => item.id !== optimisticMessage.id),
        optimisticMessage,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: payload.data.message,
          createdAt: new Date().toISOString(),
        },
      ]);
    });
  };

  return (
    <div className="soft-panel flex h-[70vh] flex-col overflow-hidden">
      <div className="border-b border-border/70 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
              AI coach
            </p>
            <h2 className="mt-1 text-2xl font-semibold">Daily guidance</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {supportLane ? (
              <div className="pill">
                {supportLane === "priority" ? "Priority support" : "Standard support"}
              </div>
            ) : null}
            {aiUsage ? (
              <div className="rounded-full border border-border bg-white/70 px-3 py-1 text-xs font-medium text-muted-foreground">
                {aiUsage.limit > 0
                  ? `${aiUsage.remaining} of ${aiUsage.limit} AI messages left today`
                  : "AI coach locked on current plan"}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {promptSuggestions.length > 0 ? (
          <div className="surface-card px-4 py-4">
            <p className="text-sm font-medium text-foreground">
              Premium prompt starters
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {promptSuggestions.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setMessage(prompt)}
                  className="rounded-full border border-primary/15 bg-primary/8 px-3 py-2 text-left text-xs font-medium text-primary transition hover:bg-primary/12"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {messages.length === 0 ? (
          <div className="rounded-[1.5rem] bg-secondary px-4 py-4 text-sm text-muted-foreground">
            {coachLocked
              ? "Upgrade to a paid plan to unlock personalized coach conversations and daily prompt guidance."
              : "Ask about workouts, nutrition choices, adherence, or how to simplify your routine today."}
          </div>
        ) : null}
        {messages.map((item) => (
          <div
            key={item.id}
            className={item.role === "assistant" ? "mr-10" : "ml-10"}
          >
            <div
              className={
                item.role === "assistant"
                  ? "rounded-[1.5rem] rounded-tl-md bg-secondary px-4 py-3 text-sm text-foreground"
                  : "rounded-[1.5rem] rounded-tr-md bg-primary px-4 py-3 text-sm text-primary-foreground"
              }
            >
              <p className="whitespace-pre-wrap">{item.content}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-border/70 px-5 py-4">
        <div className="grid gap-3">
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={
              coachLocked
                ? "Upgrade to Pro or Elite to use the AI coach."
                : "What should I focus on today to stay on track?"
            }
            className="min-h-28 rounded-[1.5rem] border-white/70 bg-white/80"
            disabled={coachLocked}
          />
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Wellness guidance only. No diagnosis or medical treatment advice.
              </p>
              {upgradePrompt ? (
                <p className="text-xs text-muted-foreground">{upgradePrompt}</p>
              ) : null}
            </div>
            {coachLocked ? (
              <Button asChild className="rounded-full">
                <Link href="/dashboard/billing">Upgrade for AI coach</Link>
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isPending} className="rounded-full">
                <SendHorizontal className="mr-2 size-4" />
                Send
              </Button>
            )}
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
