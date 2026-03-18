"use client";

import { useState } from "react";
import { Check, Copy, Gift, Users } from "lucide-react";

type ReferralStats = {
  pending: number;
  signed_up: number;
  converted: number;
  total: number;
};

type ReferralCardProps = {
  code: string;
  stats: ReferralStats;
};

export function ReferralCard({ code, stats }: ReferralCardProps) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
    }
  }

  return (
    <div className="surface-card rounded-[1.75rem] p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Gift className="size-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold">Refer a Friend</h3>
          <p className="text-xs text-muted-foreground">
            Share your code and earn rewards
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 rounded-full bg-muted/60 px-5 py-3 text-center">
          <span className="text-sm font-mono font-semibold tracking-wider">
            {code}
          </span>
        </div>
        <button
          onClick={copyCode}
          className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          aria-label="Copy referral code"
        >
          {copied ? (
            <Check className="size-4" />
          ) : (
            <Copy className="size-4" />
          )}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-muted/40 p-3 text-center">
          <p className="text-lg font-semibold tabular-nums">{stats.pending}</p>
          <p className="text-[11px] text-muted-foreground">Pending</p>
        </div>
        <div className="rounded-2xl bg-muted/40 p-3 text-center">
          <p className="text-lg font-semibold tabular-nums">{stats.signed_up}</p>
          <p className="text-[11px] text-muted-foreground">Signed Up</p>
        </div>
        <div className="rounded-2xl bg-muted/40 p-3 text-center">
          <p className="text-lg font-semibold tabular-nums">{stats.converted}</p>
          <p className="text-[11px] text-muted-foreground">Converted</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Users className="size-3.5" />
        <span>{stats.total} total referrals</span>
      </div>
    </div>
  );
}
