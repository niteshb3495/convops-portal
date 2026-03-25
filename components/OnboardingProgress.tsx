"use client";

type OnboardingStep = "connect" | "demo" | "live";

interface OnboardingProgressProps {
  currentStep: OnboardingStep;
}

const STEPS: { key: OnboardingStep; label: string; description: string }[] = [
  { key: "connect", label: "Connect AWS",  description: "Deploy the CloudFormation stack" },
  { key: "demo",    label: "Run demo",     description: "Simulate an incident" },
  { key: "live",    label: "Go live",      description: "Receive your first real alert" },
];

const STEP_ORDER: OnboardingStep[] = ["connect", "demo", "live"];

export default function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  const currentIdx = STEP_ORDER.indexOf(currentStep);

  // Don't show once user is fully live
  if (currentStep === "live" && currentIdx >= STEP_ORDER.length) return null;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-6 py-5 mb-6">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-4">Getting started</p>
      <div className="flex items-start gap-0">
        {STEPS.map((step, idx) => {
          const isDone    = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isPending = idx > currentIdx;

          return (
            <div key={step.key} className="flex items-start flex-1 min-w-0">
              {/* Step node + connector */}
              <div className="flex flex-col items-center flex-shrink-0">
                {/* Circle */}
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                    isDone
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : isCurrent
                      ? "border-indigo-500 bg-indigo-600 text-white"
                      : "border-zinc-700 bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {isDone ? (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
              </div>

              {/* Label + description */}
              <div className="ml-3 pt-0.5 min-w-0 flex-1 pr-4">
                <p className={`text-sm font-semibold leading-tight ${
                  isDone ? "text-emerald-400" : isCurrent ? "text-zinc-100" : "text-zinc-500"
                }`}>
                  {step.label}
                </p>
                <p className={`text-xs mt-0.5 leading-snug ${
                  isCurrent ? "text-zinc-400" : "text-zinc-600"
                }`}>
                  {step.description}
                </p>
              </div>

              {/* Connector line (not after last) */}
              {idx < STEPS.length - 1 && (
                <div className={`h-px w-full mt-3.5 mx-1 ${isDone ? "bg-emerald-700" : "bg-zinc-700"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
