import { CoachPanel } from "@/components/dashboard/coach-panel";
import { MembershipIntelligenceCard } from "@/components/dashboard/membership-intelligence-card";
import { WeeklyPerformanceCard } from "@/components/dashboard/weekly-performance-card";
import { getCoachSnapshot } from "@/lib/healthfit/server/dashboard";
import { requireCurrentAppUser } from "@/lib/healthfit/server/auth";
import { getPremiumExperienceSnapshot } from "@/lib/healthfit/server/premium";

export default async function CoachPage() {
  const user = await requireCurrentAppUser();
  const [snapshot, premium] = await Promise.all([
    getCoachSnapshot(user.supabaseUserId),
    getPremiumExperienceSnapshot(user.supabaseUserId),
  ]);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
      <div className="space-y-6">
        <WeeklyPerformanceCard brief={premium.weeklyBrief} />
        <MembershipIntelligenceCard membership={premium.membership} />
      </div>
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
    </div>
  );
}
