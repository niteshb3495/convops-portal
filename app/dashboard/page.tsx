import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import AccountCard from "./AccountCard";
import SimulateIncidentWrapper from "./SimulateIncidentWrapper";
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

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const email = user.emailAddresses[0]?.emailAddress ?? "";
  const meta = user.unsafeMetadata as { awsAccounts?: AwsAccount[] };
  const accounts = (meta.awsAccounts ?? []).filter((a) => a.status !== "removed");
  const plan = getUserPlan(user.unsafeMetadata);
  const isPro = plan === "pro";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold tracking-tight text-zinc-50">ConvOps</span>
            <span className="text-zinc-600">/</span>
            <span className="text-lg font-semibold text-zinc-300">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Plan badge */}
            {isPro ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-950 border border-amber-700 px-2.5 py-1 text-xs font-semibold text-amber-400">
                ⚡ Pro
              </span>
            ) : (
              <Link
                href="mailto:nitesh@convops.io?subject=ConvOps Pro Upgrade"
                className="inline-flex items-center gap-1 rounded-full bg-zinc-800 border border-zinc-600 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:border-amber-600 hover:text-amber-400 transition-colors"
              >
                Free · Upgrade to Pro
              </Link>
            )}
            <Link href="/dashboard/security" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              Security
            </Link>
            <span className="text-sm text-zinc-400">{email}</span>
            <SignOutButton redirectUrl="/">
              <button className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300 hover:border-zinc-500 hover:text-zinc-50 transition-colors">
                Sign out
              </button>
            </SignOutButton>
          </div>
        </div>
      </header>

      {/* Free plan info banner */}
      {!isPro && accounts.length > 0 && (
        <div className="border-b border-zinc-800 bg-zinc-900/50 px-6 py-3">
          <div className="mx-auto max-w-5xl flex items-center justify-between gap-4">
            <p className="text-sm text-zinc-400">
              <span className="font-medium text-zinc-300">Free plan:</span> Alerts, investigations, and root cause analysis are fully included.
              Upgrade to Pro to execute actions from chat.
            </p>
            <Link
              href="mailto:nitesh@convops.io?subject=ConvOps Pro Upgrade"
              className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-amber-400 transition-colors"
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-6 py-10">

        {/* Simulate incident — always visible, drives aha moment */}
        <SimulateIncidentWrapper isPro={isPro} />

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-zinc-50">AWS Accounts</h1>
          {accounts.length > 0 && (
            <Link
              href="/dashboard/connect"
              className="rounded-lg bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-white transition-colors"
            >
              + Add AWS Account
            </Link>
          )}
        </div>

        {accounts.length === 0 ? (
          /* Empty state */
          <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-10 flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 mb-4">
              <svg
                className="h-6 w-6 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-zinc-100 mb-1">Connect your first AWS account</h2>
            <p className="text-sm text-zinc-400 mb-2 max-w-sm">
              Free plan includes alerts, full AI investigation, and root cause analysis.
            </p>
            <p className="text-xs text-zinc-500 mb-6 max-w-sm">
              No credit card required.
            </p>
            <Link
              href="/dashboard/connect"
              className="rounded-lg bg-zinc-50 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-white transition-colors"
            >
              Connect AWS Account — Free
            </Link>
          </div>
        ) : (
          /* Accounts list */
          <div className="space-y-4">
            {accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
