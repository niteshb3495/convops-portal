"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OnboardingProgress from "@/components/OnboardingProgress";
import SimulateIncident from "@/components/SimulateIncident";
import type { OnboardingStep } from "@/lib/onboarding";

interface OnboardingSectionProps {
  initialStep: OnboardingStep;
  isPro: boolean;
}

export default function OnboardingSection({ initialStep, isPro }: OnboardingSectionProps) {
  const { user } = useUser();
  const router = useRouter();

  async function advanceToDemo() {
    if (!user) return;
    await user.update({
      unsafeMetadata: { ...user.unsafeMetadata, onboardingStep: "demo" },
    });
    router.refresh();
  }

  async function advanceToLive() {
    if (!user) return;
    await user.update({
      unsafeMetadata: { ...user.unsafeMetadata, onboardingStep: "live" },
    });
    // No WA notification here — simulation only, no real account connected
    router.refresh();
  }

  // Once live, show nothing (onboarding complete)
  if (initialStep === "live") {
    return (
      <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 px-5 py-4 mb-6 flex items-start gap-3">
        <svg className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-emerald-300">You&apos;re ready.</p>
          <p className="text-sm text-zinc-400 mt-0.5">ConvOps will notify you on your next alert. Nothing to do — just wait for the first incident.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-2">
      {/* Progress indicator */}
      <OnboardingProgress currentStep={initialStep} />

      {/* Step 1: Connect AWS */}
      {initialStep === "connect" && (
        <div className="rounded-xl border border-indigo-800/40 bg-indigo-950/10 px-6 py-5 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-950 border border-indigo-800">
              <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-zinc-100 mb-1">Connect AWS to analyse your first alert</p>
              <p className="text-sm text-zinc-400 mb-4">Deploy a CloudFormation template (~2 min). ConvOps gets read access to CloudWatch and logs — no changes to your infra without your approval.</p>
              <Link
                href="/dashboard/connect"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                Connect AWS Account
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Run demo — show simulate incident inline */}
      {initialStep === "demo" && (
        <div className="mb-6">
          <div className="rounded-xl border border-indigo-800/30 bg-indigo-950/10 px-5 py-3 mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
              </svg>
              <p className="text-sm font-semibold text-zinc-200">AWS connected ✓</p>
              <span className="text-zinc-600">·</span>
              <p className="text-sm text-zinc-400">Run a simulated incident to see how ConvOps works</p>
            </div>
            <button
              onClick={advanceToLive}
              className="shrink-0 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              Skip
            </button>
          </div>
          <SimulateIncident isPro={isPro} onDemoComplete={advanceToLive} />
        </div>
      )}
    </div>
  );
}
