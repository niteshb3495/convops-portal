"use client";

import { useEffect, useState } from "react";

interface UsageCounter {
  used: number;
  limit: number;
}

interface UsageData {
  plan: string;
  unlimited: boolean;
  month?: string;
  incidents?: UsageCounter;
  investigations?: UsageCounter;
  actions?: UsageCounter;
}

function MeterBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = Math.min(Math.round((used / limit) * 100), 100);
  const near = pct >= 80;
  const critical = pct >= 100;
  const color = critical
    ? "bg-red-500"
    : near
    ? "bg-amber-500"
    : "bg-indigo-500";

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-zinc-400">{label}</span>
        <span className={`text-xs font-mono font-medium ${critical ? "text-red-400" : near ? "text-amber-400" : "text-zinc-300"}`}>
          {used} / {limit}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function UsageMeter({ accountId }: { accountId: string }) {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_CONVOPS_API_URL;
    const apiKey = process.env.NEXT_PUBLIC_CONVOPS_API_KEY;
    if (!apiUrl || !accountId) { setLoading(false); return; }

    fetch(`${apiUrl}/usage?accountId=${encodeURIComponent(accountId)}`, {
      headers: { "x-api-key": apiKey ?? "" },
    })
      .then((r) => r.json())
      .then((data) => { setUsage(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [accountId]);

  if (loading) {
    return (
      <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 animate-pulse">
        <div className="h-3 w-24 bg-zinc-800 rounded mb-3" />
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => <div key={i} className="h-1.5 w-full bg-zinc-800 rounded-full" />)}
        </div>
      </div>
    );
  }

  if (!usage || usage.unlimited) return null;

  const { incidents, investigations, actions, month } = usage;
  if (!incidents) return null;

  const nearLimit =
    (incidents.used / incidents.limit >= 0.8) ||
    (investigations!.used / investigations!.limit >= 0.8) ||
    (actions!.used / actions!.limit >= 0.8);

  return (
    <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-zinc-400">
          Free plan usage — {month}
        </span>
        {nearLimit && (
          <a
            href="mailto:info@convops.io?subject=ConvOps Pro Upgrade"
            className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            Upgrade to Pro →
          </a>
        )}
      </div>
      <div className="space-y-2.5">
        <MeterBar label="Incidents"       used={incidents.used}       limit={incidents.limit} />
        <MeterBar label="Investigations"  used={investigations!.used}  limit={investigations!.limit} />
        <MeterBar label="Actions"         used={actions!.used}         limit={actions!.limit} />
      </div>
    </div>
  );
}
