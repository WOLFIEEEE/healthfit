"use client";

import { useState } from "react";
import { Bell, Loader2, Save } from "lucide-react";

type NotificationPreferencesFormProps = {
  initialPreferences?: {
    frequency: string;
    includeCoachSummary: boolean;
    includeWeeklyStats: boolean;
    includeAchievements: boolean;
  };
};

export function NotificationPreferencesForm({
  initialPreferences,
}: NotificationPreferencesFormProps) {
  const [frequency, setFrequency] = useState(
    initialPreferences?.frequency ?? "weekly"
  );
  const [includeCoachSummary, setIncludeCoachSummary] = useState(
    initialPreferences?.includeCoachSummary ?? true
  );
  const [includeWeeklyStats, setIncludeWeeklyStats] = useState(
    initialPreferences?.includeWeeklyStats ?? true
  );
  const [includeAchievements, setIncludeAchievements] = useState(
    initialPreferences?.includeAchievements ?? true
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch("/api/notifications/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frequency,
          includeCoachSummary,
          includeWeeklyStats,
          includeAchievements,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="surface-card rounded-[1.75rem] p-6 space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Bell className="size-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold">Email Digest</h3>
          <p className="text-xs text-muted-foreground">
            Choose what to include in your email updates
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Frequency</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="mt-1.5 w-full rounded-full border border-border/70 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="never">Never</option>
          </select>
        </div>

        <ToggleRow
          label="Coach Summary"
          description="Include AI coach insights in your digest"
          checked={includeCoachSummary}
          onChange={setIncludeCoachSummary}
        />

        <ToggleRow
          label="Weekly Stats"
          description="Include your workout and nutrition stats"
          checked={includeWeeklyStats}
          onChange={setIncludeWeeklyStats}
        />

        <ToggleRow
          label="Achievements"
          description="Notify about new badges and milestones"
          checked={includeAchievements}
          onChange={setIncludeAchievements}
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? (
          <Loader2 className="size-4 animate-spin" />
        ) : saved ? (
          <Save className="size-4" />
        ) : null}
        {saved ? "Saved" : saving ? "Saving..." : "Save Preferences"}
      </button>
    </form>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`inline-block size-4 transform rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </label>
  );
}
