import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const email = user.emailAddresses[0]?.emailAddress ?? "";

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

        {/* Status card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
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
              <h2 className="font-semibold text-zinc-100">Your ConvOps setup</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Connect your AWS account to get started
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
