"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import UpgradeModal from "@/components/UpgradeModal";
import { canExecuteAction, getFreeActionsUsed, getUserPlan, FREE_ACTION_LIMIT } from "@/lib/plan";

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

// Example actions — in production these would come from live incident context
const DEMO_ACTIONS = [
  { id: "restart-ecs", label: "Restart ECS service" },
  { id: "reboot-ec2", label: "Reboot EC2 instance" },
  { id: "reboot-rds", label: "Reboot RDS instance" },
];

export default function AccountCard({ account }: { account: AwsAccount }) {
  const { user } = useUser();
  const router = useRouter();
  const [removing, setRemoving] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | undefined>();

  const meta = user?.unsafeMetadata ?? {};
  const plan = getUserPlan(meta);
  const freeUsed = getFreeActionsUsed(meta);
  const freeRemaining = Math.max(0, FREE_ACTION_LIMIT - freeUsed);
  const isPro = plan === "pro";

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

  async function handleActionClick(actionLabel: string) {
    if (!user) return;

    if (canExecuteAction(meta)) {
      // Allow the action — if free plan, consume one free trial action
      if (!isPro) {
        const newUsed = freeUsed + 1;
        await user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            freeActionsUsed: newUsed,
          },
        });
        router.refresh();
      }
      // TODO: trigger actual action execution via API
      alert(`Action triggered: ${actionLabel} (demo)`);
    } else {
      // Show upgrade modal — user has used their free trial
      setPendingAction(actionLabel);
      setUpgradeOpen(true);
    }
  }

  const serviceLabels =
    account.selectedServices.length === 0
      ? []
      : account.selectedServices.map((s) => s.toUpperCase());

  return (
    <>
      <UpgradeModal
        open={upgradeOpen}
        onClose={() => { setUpgradeOpen(false); setPendingAction(undefined); }}
        actionLabel={pendingAction}
      />

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
              <div className="flex items-center gap-2 mb-2 flex-wrap">
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
                {/* Plan badge */}
                {isPro ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-950 border border-amber-700 px-2 py-0.5 text-xs font-semibold text-amber-400">
                    ⚡ Pro
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-xs font-medium text-zinc-400">
                    Free
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

              {/* Free trial action counter */}
              {!isPro && (
                <div className="mt-4 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-zinc-400">Free action trial</span>
                    <span className="text-xs text-zinc-500">{freeUsed}/{FREE_ACTION_LIMIT} used</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-700">
                    <div
                      className="h-1.5 rounded-full bg-amber-500 transition-all"
                      style={{ width: `${Math.min(100, (freeUsed / FREE_ACTION_LIMIT) * 100)}%` }}
                    />
                  </div>
                  {freeRemaining > 0 ? (
                    <p className="mt-1.5 text-xs text-zinc-500">
                      {freeRemaining} free action{freeRemaining !== 1 ? "s" : ""} remaining — try it before you commit
                    </p>
                  ) : (
                    <p className="mt-1.5 text-xs text-amber-400">
                      Free trial used — upgrade to Pro to keep executing actions
                    </p>
                  )}
                </div>
              )}

              {/* Demo action buttons — shown when account is connected */}
              {account.status === "connected" && (
                <div className="mt-4">
                  <p className="text-xs text-zinc-500 mb-2">Quick actions</p>
                  <div className="flex flex-wrap gap-2">
                    {DEMO_ACTIONS.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleActionClick(action.label)}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors border ${
                          isPro || freeRemaining > 0
                            ? "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100"
                            : "border-amber-800/50 bg-amber-950/20 text-amber-400 hover:bg-amber-950/40"
                        }`}
                      >
                        {!isPro && freeRemaining === 0 && (
                          <span className="mr-1">⚡</span>
                        )}
                        {action.label}
                      </button>
                    ))}
                  </div>
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
    </>
  );
}
