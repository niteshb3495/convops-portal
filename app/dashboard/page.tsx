import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import AccountCard from "./AccountCard";

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
            <span className="text-sm text-zinc-400">{email}</span>
            <SignOutButton redirectUrl="/">
              <button className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300 hover:border-zinc-500 hover:text-zinc-50 transition-colors">
                Sign out
              </button>
            </SignOutButton>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-zinc-50">AWS Accounts</h1>
          {accounts.length > 0 && (
            // TODO: For Solo plan — disable if 1 account exists and show tooltip "Upgrade to Team for multiple accounts"
            // Currently always enabled (no plan detection yet)
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
            <p className="text-sm text-zinc-400 mb-6 max-w-sm">
              Connect your first AWS account to get started.
            </p>
            <Link
              href="/dashboard/connect"
              className="rounded-lg bg-zinc-50 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-white transition-colors"
            >
              Connect AWS Account
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
