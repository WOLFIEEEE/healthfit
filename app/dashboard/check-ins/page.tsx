import { eq } from "drizzle-orm";
import { CheckInForm } from "@/components/dashboard/check-in-form";
import { db } from "@/lib/drizzle/client";
import { checkIns } from "@/lib/drizzle/schema";
import { requireCurrentAppUser } from "@/lib/healthfit/server/auth";

export default async function CheckInsPage() {
  const user = await requireCurrentAppUser();
  const recentCheckIns = await db.query.checkIns.findMany({
    where: eq(checkIns.userId, user.supabaseUserId),
    orderBy: (table, helpers) => [helpers.desc(table.createdAt)],
    limit: 8,
  });

  return (
    <div className="space-y-6">
      <CheckInForm />
      <section className="soft-panel px-6 py-6">
        <h2 className="text-2xl font-semibold">Recent reflections</h2>
        <div className="mt-4 grid gap-3">
          {recentCheckIns.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No check-ins yet. Your summaries will appear here after the first one.
            </p>
          ) : (
            recentCheckIns.map((checkIn) => (
              <div key={checkIn.id} className="rounded-[1.5rem] bg-white/75 px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-medium">
                    {new Date(checkIn.createdAt).toLocaleDateString()}
                  </p>
                  <div className="text-sm text-muted-foreground">
                    Mood {checkIn.moodScore} • Energy {checkIn.energyScore} • Adherence{" "}
                    {checkIn.adherenceScore}
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {checkIn.aiSummary}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
