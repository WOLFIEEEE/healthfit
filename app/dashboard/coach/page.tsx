import {
  BrainCircuit,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { CoachPanel } from "@/components/dashboard/coach-panel";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { MembershipIntelligenceCard } from "@/components/dashboard/membership-intelligence-card";
import { WeeklyPerformanceCard } from "@/components/dashboard/weekly-performance-card";
import { getCoachSnapshot } from "@/lib/healthfit/server/dashboard";
import { requireCurrentAppUser } from "@/lib/healthfit/server/auth";
import { getPremiumExperienceSnapshot } from "@/lib/healthfit/server/premium";

function humanizeValue(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default async function CoachPage() {
  const user = await requireCurrentAppUser();
  const [snapshot, premium] = await Promise.all([
    getCoachSnapshot(user.supabaseUserId),
    getPremiumExperienceSnapshot(user.supabaseUserId),
  ]);
  const aiAccessValue = premium.membership.aiUsage.unlimited
    ? "Unlimited"
    : premium.membership.aiUsage.limit > 0
      ? `${premium.membership.aiUsage.remaining} left`
      : "Locked";

  return (
    <div className="space-y-8 xl:space-y-10">
      <CoachPanel
        initialConversationId={snapshot.conversations[0]?.id}
        initialMessages={snapshot.recentMessages.map((message) => ({
          id: message.id,
          role: message.role,
          content: message.content,
          createdAt: message.createdAt,
          actions: message.actions,
        }))}
        promptSuggestions={premium.coachPrompts}
        aiUsage={premium.membership.aiUsage}
        supportLane={premium.membership.supportLane}
        upgradePrompt={premium.membership.upgradePrompt}
        coachContext={snapshot.context}
        brief={snapshot.brief}
      />

      <section className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-4">
        <DashboardStatCard
          icon={BrainCircuit}
          label="AI access"
          value={aiAccessValue}
          detail={premium.membership.aiUsage.helper}
          tone="brand"
        />
        <DashboardStatCard
          icon={MessageSquareText}
          label="Prompt starters"
          value={premium.coachPrompts.length}
          detail="Fast coach prompts you can use when you want guidance without typing from scratch."
        />
        <DashboardStatCard
          icon={Sparkles}
          label="Momentum"
          value={humanizeValue(snapshot.context?.momentum ?? premium.weeklyBrief.momentum)}
          detail={
            snapshot.context?.currentFocus ??
            premium.weeklyBrief.summary
          }
        />
        <DashboardStatCard
          icon={ShieldCheck}
          label="Support lane"
          value={humanizeValue(premium.membership.supportLane)}
          detail={
            premium.membership.upgradePrompt ??
            "Your support lane controls the level of responsiveness and feature coverage across the workspace."
          }
        />
      </section>

      <div className="grid gap-10 xl:grid-cols-2 2xl:gap-12">
        <WeeklyPerformanceCard brief={premium.weeklyBrief} />
        <MembershipIntelligenceCard membership={premium.membership} />
      </div>
    </div>
  );
}
