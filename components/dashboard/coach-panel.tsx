"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { SendHorizontal } from "lucide-react";
import {
  CoachAction,
  CoachContextSnapshot,
  ProactiveBrief,
  UsageMeter,
} from "@/lib/healthfit/contracts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type CoachPanelProps = {
  initialMessages: Array<{
    id: string;
    role: string;
    content: string;
    createdAt: string;
    actions?: CoachAction[];
  }>;
  initialConversationId?: string;
  promptSuggestions?: string[];
  aiUsage?: UsageMeter;
  supportLane?: "priority" | "standard";
  upgradePrompt?: string | null;
  coachContext?: CoachContextSnapshot;
  brief?: ProactiveBrief | null;
};

export function CoachPanel({
  initialMessages,
  initialConversationId,
  promptSuggestions = [],
  aiUsage,
  supportLane,
  upgradePrompt,
  coachContext,
  brief,
}: CoachPanelProps) {
  const router = useRouter();
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [messages, setMessages] = useState(initialMessages);
  const [usage, setUsage] = useState(aiUsage);
  const [context, setContext] = useState(coachContext);
  const [currentBrief, setCurrentBrief] = useState(brief);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const messageViewportRef = useRef<HTMLDivElement | null>(null);
  const planLocked = Boolean(usage && usage.limit <= 0 && !usage.unlimited);
  const dailyLimitReached = Boolean(
    usage && !usage.unlimited && usage.limit > 0 && usage.remaining <= 0
  );
  const coachDisabled = planLocked || dailyLimitReached;
  const coachExamples = [
    "I had chicken rice for lunch, around 650 calories and 40g protein.",
    "I finished a 35 minute walk at effort 6 today.",
    "Check-in: mood 7, energy 6, stress 4, adherence 8, sleep 7.5 hours.",
  ];

  useEffect(() => {
    const viewport = messageViewportRef.current;

    if (!viewport) {
      return;
    }

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  const handleCoachAction = async (action: CoachAction) => {
    setActionFeedback(null);

    if (action.type === "navigate") {
      router.push(action.href);
      return;
    }

    setActiveActionId(action.id);

    try {
      const response = await fetch("/api/coach/actions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(action),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        setActionFeedback(payload.error ?? "Coach action failed");
        return;
      }

      setActionFeedback(payload.data.message ?? "Coach action completed.");
      router.refresh();
    } finally {
      setActiveActionId(null);
    }
  };

  const decrementUsage = () => {
    setUsage((current) => {
      if (!current || current.limit <= 0 || current.unlimited) {
        return current?.unlimited
          ? {
              ...current,
              used: current.used + 1,
            }
          : current;
      }

      if (current.limit <= 0) {
        return current;
      }

      const used = Math.min(current.used + 1, current.limit);
      const remaining = Math.max(current.limit - used, 0);
      const percentage = current.limit > 0 ? Math.round((used / current.limit) * 100) : 0;

      return {
        ...current,
        used,
        remaining,
        percentage,
        status: percentage >= 80 || remaining === 0 ? "near_limit" : "available",
        helper:
          remaining === 0
            ? `${current.label} limit reached for today.`
            : `${remaining} messages remaining today`,
      };
    });
  };

  const handleSubmit = () => {
    if (!message.trim() || coachDisabled) return;
    setError(null);
    setActionFeedback(null);
    const optimisticMessage = {
      id: `local-${Date.now()}`,
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
      actions: [],
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
        if (response.status === 429) {
          setUsage((current) =>
            current
              ? {
                  ...current,
                  used: current.limit,
                  remaining: 0,
                  percentage: 100,
                  status: "near_limit",
                  helper: `${current.label} limit reached for today.`,
                }
              : current
          );
        }
        setMessages((current) =>
          current.filter((item) => item.id !== optimisticMessage.id)
        );
        setMessage(optimisticMessage.content);
        return;
      }

      setConversationId(payload.data.conversationId);
      setContext(payload.data.context ?? coachContext);
      setCurrentBrief(payload.data.brief ?? brief ?? null);
      setMessages((current) => [
        ...current.filter((item) => item.id !== optimisticMessage.id),
        optimisticMessage,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: payload.data.message,
          createdAt: new Date().toISOString(),
          actions: payload.data.actions ?? payload.data.structured?.actions ?? [],
        },
      ]);
      decrementUsage();
    });
  };

  return (
    <div className="soft-panel min-w-0 grid min-h-[82svh] overflow-hidden md:min-h-[86svh] xl:min-h-[calc(100vh-10.5rem)] xl:grid-rows-[auto_minmax(0,1fr)]">
      <div className="border-b border-border/70 px-6 py-6 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
              AI coach
            </p>
            <h2 className="mt-1 text-2xl font-semibold">Daily guidance</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
              Tell coach what you ate, trained, completed, or how your day felt and it can capture the log for you while keeping the conversation going.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {supportLane ? (
              <div className="pill">
                {supportLane === "priority" ? "Priority support" : "Standard support"}
              </div>
            ) : null}
            {usage ? (
              <div className="rounded-full border border-border bg-white/70 px-3 py-1 text-xs font-medium text-muted-foreground">
                {usage.unlimited
                  ? "Unlimited AI access"
                  : usage.limit > 0
                  ? `${usage.remaining} of ${usage.limit} AI messages left today`
                  : "AI coach locked on current plan"}
              </div>
            ) : null}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {context?.badges.map((badge) => (
            <div
              key={`${badge.label}-${badge.value}`}
              className={
                badge.tone === "positive"
                  ? "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                  : badge.tone === "attention"
                    ? "rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
                    : "rounded-full border border-border bg-white/70 px-3 py-1 text-xs font-medium text-muted-foreground"
              }
            >
              {badge.label}: {badge.value}
            </div>
          ))}
          {currentBrief?.nextActions[0] ? (
            <div className="rounded-full border border-primary/15 bg-primary/8 px-3 py-1 text-xs font-medium text-primary">
              Next: {currentBrief.nextActions[0]}
            </div>
          ) : null}
        </div>
        {context?.summary || currentBrief?.summary ? (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Coach context
            </p>
            <p className="mt-2 max-w-4xl text-sm leading-7 text-muted-foreground">
              {context?.summary ?? currentBrief?.summary}
            </p>
          </div>
        ) : null}
      </div>
      <div className="min-h-0 flex flex-col">
        <div
          ref={messageViewportRef}
          className="flex-1 overflow-y-auto px-5 py-6 sm:px-7 sm:py-7"
        >
          <div className="space-y-5">
            {messages.length === 0 ? (
              <div className="rounded-[1.75rem] bg-secondary px-6 py-6 text-sm text-muted-foreground">
                {planLocked
                  ? "Upgrade to a paid plan to unlock personalized coach conversations and direct logging from chat."
                  : dailyLimitReached
                    ? "You have used today's AI coach allowance. Come back tomorrow for a fresh set of messages."
                    : "Ask a question or simply tell coach what you ate, trained, completed, or how the day felt."}
              </div>
            ) : null}
            {messages.map((item) => (
              <div
                key={item.id}
                className={item.role === "assistant" ? "flex justify-start" : "flex justify-end"}
              >
                <div className="w-full max-w-[min(100%,52rem)]">
                  <div
                    className={
                      item.role === "assistant"
                        ? "rounded-[1.75rem] rounded-tl-md bg-secondary px-5 py-4 text-sm text-foreground shadow-[0_18px_40px_-34px_rgba(61,110,71,0.24)]"
                        : "rounded-[1.75rem] rounded-tr-md bg-primary px-5 py-4 text-sm text-primary-foreground shadow-[0_18px_40px_-34px_rgba(46,114,78,0.4)]"
                    }
                  >
                    <p className="whitespace-pre-wrap leading-7">{item.content}</p>
                  </div>
                  {item.role === "assistant" && item.actions?.length ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {item.actions.map((action) => (
                        <div
                          key={action.id}
                          data-testid={`coach-action-card-${action.id}`}
                          className="rounded-[1.25rem] border border-border/70 bg-white/80 px-4 py-4"
                        >
                          <p className="text-sm font-medium text-foreground">
                            {action.label}
                          </p>
                          <p className="mt-1 text-xs leading-6 text-muted-foreground">
                            {action.description}
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-3 rounded-full bg-white/75"
                            data-testid={`coach-action-button-${action.id}`}
                            disabled={action.type !== "navigate" && activeActionId === action.id}
                            onClick={() => handleCoachAction(action)}
                          >
                            {action.type !== "navigate" && activeActionId === action.id
                              ? "Working..."
                              : action.type === "navigate"
                                ? "Open"
                                : "Run action"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-border/70 px-5 py-5 sm:px-7">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {coachExamples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setMessage(example)}
                  className="rounded-full border border-border/70 bg-white/80 px-3 py-2 text-left text-xs font-medium text-foreground transition hover:border-primary/25 hover:bg-white"
                >
                  {example}
                </button>
              ))}
              {promptSuggestions.slice(0, 4).map((prompt) => (
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
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={
                planLocked
                  ? "Upgrade to Pro or Elite to use the AI coach."
                  : dailyLimitReached
                    ? "Today's AI message limit has been reached."
                    : "Tell coach what you ate, trained, completed, or how you feel today."
              }
              className="min-h-32 rounded-[1.75rem] border-white/70 bg-white/80 sm:min-h-36"
              disabled={coachDisabled}
            />
            <div className="flex flex-col items-start gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Wellness guidance only. No diagnosis or medical treatment advice.
                </p>
                {upgradePrompt ? (
                  <p className="text-xs text-muted-foreground">{upgradePrompt}</p>
                ) : null}
              </div>
              {planLocked ? (
                <Button asChild className="rounded-full">
                  <Link href="/dashboard/billing">Upgrade for AI coach</Link>
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isPending || dailyLimitReached}
                  className="rounded-full"
                >
                  <SendHorizontal className="mr-2 size-4" />
                  {dailyLimitReached ? "Limit reached today" : "Send"}
                </Button>
              )}
            </div>
            {actionFeedback ? (
              <p className="text-sm text-primary">{actionFeedback}</p>
            ) : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
