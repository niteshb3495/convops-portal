import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import AccountCard from "./AccountCard";
import OnboardingSection from "./OnboardingSection";
import { getUserPlan } from "@/lib/plan";
import { getOnboardingStep } from "@/lib/onboarding";

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
  const onboardingStep = getOnboardingStep(user.unsafeMetadata, accounts.length > 0);

  // Advance onboarding to "demo" automatically when AWS is connected
  // (handled client-side via OnboardingSection which reads the step)

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

      {/* Free plan info banner — only show after onboarding */}
      {!isPro && onboardingStep === "live" && (
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

        {/* Onboarding section — progress + contextual next step */}
        <OnboardingSection initialStep={onboardingStep} isPro={isPro} />

        {/* AWS Accounts */}
        {accounts.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-zinc-50">AWS Accounts</h2>
              <Link
                href="/dashboard/connect"
                className="rounded-lg bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-white transition-colors"
              >
                + Add Account
              </Link>
            </div>
            <div className="space-y-4">
              {accounts.map((account) => (
                <AccountCard key={account.id} account={account} />
              ))}
            </div>
          </>
        )}

      </main>
    </div>
  );
}
