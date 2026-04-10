"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import UsageMeter from "@/components/UsageMeter";
import { getUserPlan } from "@/lib/plan";

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
  const plan = getUserPlan(user?.unsafeMetadata ?? {});
  const [removing, setRemoving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);

  async function handleTestAlert() {
    setTesting(true);
    setTestResult(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_CONVOPS_API_URL;
      const apiKey = process.env.NEXT_PUBLIC_CONVOPS_API_KEY;
      const res = await fetch(`${apiUrl}/test-alert`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey ?? "", "X-Api-Key": apiKey ?? "" },
        body: JSON.stringify({ accountId: account.accountId, region: account.region }),
      });
      setTestResult(res.ok ? "success" : "error");
    } catch {
      setTestResult("error");
    } finally {
      setTesting(false);
      setTimeout(() => setTestResult(null), 5000);
    }
  }

  async function handleRemove() {
    if (!user) return;
    setRemoving(true);
    const existing = (user.unsafeMetadata.awsAccounts as AwsAccount[]) ?? [];
    const updated = existing.map((a) =>
      a.id === account.id ? { ...a, status: "removed" } : a
    );
    const remaining = updated.filter((a) => a.status !== "removed");
    await user.update({
      unsafeMetadata: {
        ...user.unsafeMetadata,
        awsAccounts: updated,
      },
    });
    router.refresh();
  }

  const serviceLabels: string[] = [];

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
                <dt className="text-zinc-500 w-28 shrink-0 mt-0.5">Access</dt>
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

            {/* Test alert button — shown when connected */}
            {account.status === "connected" && (
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={handleTestAlert}
                  disabled={testing}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-indigo-600 hover:text-indigo-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {testing ? (
                    <>
                      <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Sending…
                    </>
                  ) : (
                    <>
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                      </svg>
                      Send test alert
                    </>
                  )}
                </button>
                {testResult === "success" && (
                  <span className="text-xs text-emerald-400">✅ Test alert sent — check WhatsApp</span>
                )}
                {testResult === "error" && (
                  <span className="text-xs text-red-400">❌ Failed — check your setup</span>
                )}
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
      {plan === "free" && <UsageMeter accountId={account.accountId} />}
    </div>
  );
}
