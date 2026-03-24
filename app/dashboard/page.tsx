import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const email = user.emailAddresses[0]?.emailAddress ?? "";
  const meta = user.unsafeMetadata as {
    awsAccountId?: string;
    region?: string;
    whatsappNumber?: string;
  };

  const isConnected = !!meta.awsAccountId;

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
        <h1 className="text-2xl font-bold text-zinc-50 mb-8">ConvOps Dashboard</h1>

        {isConnected ? (
          /* Connected state */
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
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
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-semibold text-zinc-100">AWS Account Connected</h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950 border border-emerald-800 px-2 py-0.5 text-xs font-medium text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Active
                    </span>
                  </div>
                  <dl className="mt-2 space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <dt className="text-zinc-500 w-28 shrink-0">Account ID</dt>
                      <dd className="font-mono text-zinc-300">{meta.awsAccountId}</dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <dt className="text-zinc-500 w-28 shrink-0">Region</dt>
                      <dd className="font-mono text-zinc-300">{meta.region}</dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <dt className="text-zinc-500 w-28 shrink-0">Alerts to</dt>
                      <dd className="font-mono text-zinc-300">{meta.whatsappNumber}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              <Link
                href="/dashboard/connect"
                className="shrink-0 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:border-zinc-500 hover:text-zinc-50 transition-colors"
              >
                Reconnect
              </Link>
            </div>
          </div>
        ) : (
          /* Not connected state */
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
            <h2 className="text-lg font-semibold text-zinc-100 mb-1">Connect your AWS account</h2>
            <p className="text-sm text-zinc-400 mb-6 max-w-sm">
              Link your AWS account to start receiving ConvOps alerts via WhatsApp. Takes about 2 minutes.
            </p>
            <Link
              href="/dashboard/connect"
              className="rounded-lg bg-zinc-50 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-white transition-colors"
            >
              Connect AWS Account
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
