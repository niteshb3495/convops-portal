export type OnboardingStep = "connect" | "demo" | "live";

export function getOnboardingStep(
  unsafeMetadata: Record<string, unknown>,
  hasAccounts: boolean
): OnboardingStep {
  const step = unsafeMetadata.onboardingStep as OnboardingStep | undefined;

  // If explicitly set, trust it
  if (step === "demo" || step === "live") return step;

  // If no explicit step but has accounts → at least on demo step
  if (hasAccounts) return step ?? "demo";

  return "connect";
}
