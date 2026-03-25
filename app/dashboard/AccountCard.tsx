"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AwsAccount {
  id: string;
  accountId: string;
  region: string;
  alertChannel: "whatsapp" | "slack" | "both";
  whatsappNumber?: string;
  slackWebhook?: string;
  selectedServices: string[];
  status: "connected" | "pending" | "removed";
  connectedAt: string;
}

const ALERT_CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  slack: "Slack",
  both: "Both",
};

export default function AccountCard({ account }: { account: AwsAccount }) {
  const { user } = useUser();
  const router = useRouter();
  const [removing, setRemoving] = useState(false);

  async function handleRemove() {
    if (!user) return;
    setRemoving(true);
    const existing = (user.unsafeMetadata.awsAccounts as AwsAccount[]) ?? [];
    await user.update({
      unsafeMetadata: {
        ...user.unsafeMetadata,
        awsAccounts: existing.map((a) =>
          a.id === account.id ? { ...a, status: "removed" } : a
        ),
      },
    });
    router.refresh();
  }

  const serviceLabels =
    account.selectedServices.length === 0
      ? []
      : account.selectedServices.map((s) => s.toUpperCase());

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
            <svg
              className="h-5 w-5 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 0 0 3 3h7.5a3 3 0 0 0 3-3m-13.5 0v-4.5A2.25 2.25 0 0 1 7.5 7.5h9a2.25 2.25 0 0 1 2.25 2.25v4.5"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="font-mono text-base font-semibold text-zinc-100">
                {account.accountId}
              </span>
              {account.status === "connected" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950 border border-emerald-800 px-2 py-0.5 text-xs font-medium text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-950 border border-yellow-800 px-2 py-0.5 text-xs font-medium text-yellow-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                  Pending
                </span>
              )}
            </div>

            <dl className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <dt className="text-zinc-500 w-28 shrink-0">Region</dt>
                <dd className="font-mono text-zinc-300">{account.region}</dd>
              </div>
              <div className="flex items-start gap-2">
                <dt className="text-zinc-500 w-28 shrink-0 mt-0.5">Write access</dt>
                <dd className="flex flex-wrap gap-1">
                  {serviceLabels.length === 0 ? (
                    <span className="text-zinc-500">Read-only</span>
                  ) : (
                    serviceLabels.map((label) => (
                      <span
                        key={label}
                        className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-xs font-medium text-zinc-300"
                      >
                        {label}
                      </span>
                    ))
                  )}
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <dt className="text-zinc-500 w-28 shrink-0">Alert channel</dt>
                <dd className="text-zinc-300">
                  {ALERT_CHANNEL_LABELS[account.alertChannel] ?? account.alertChannel}
                </dd>
              </div>
            </dl>

            {/* Waiting for first alert — shown when connected, no incidents yet */}
            {account.status === "connected" && (
              <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                <p className="text-xs text-zinc-500">
                  ✅ Monitoring active — ConvOps will alert you when CloudWatch fires an URGENT alarm.
                  Actions become available during a live incident.
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleRemove}
          disabled={removing}
          className="shrink-0 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:border-red-800 hover:text-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {removing ? "Removing…" : "Remove"}
        </button>
      </div>
    </div>
  );
}
