/**
 * ConvOps Feature Flag System
 *
 * All gating is purely UI-side. Backend action APIs remain fully functional.
 * Feature flags control VISIBILITY and EXECUTION TRIGGERS only — never the
 * underlying action handlers, IAM roles, or integrations.
 *
 * Feature: "actions_enabled"
 *   - false          → action buttons hidden (user sees investigation + suggested fix only)
 *   - "preview"      → action buttons shown, clicking reveals preview modal (no real execution)
 *   - true           → action buttons fully available (gated by plan)
 *
 * This is read from Clerk unsafeMetadata (per-user override) with a global
 * default. In production this would be backed by a remote flag store.
 */

export type ActionsFlag = false | "preview" | true;

export interface FeatureFlags {
  actions_enabled: ActionsFlag;
}

// Global default — change this to roll out actions to all users
const GLOBAL_DEFAULTS: FeatureFlags = {
  actions_enabled: false, // false = hidden until Pro plan launches. Change to true to release.
};

/**
 * Resolve feature flags for a user.
 * Per-user overrides in Clerk unsafeMetadata take precedence over global defaults.
 */
export function getFeatureFlags(unsafeMetadata: Record<string, unknown>): FeatureFlags {
  const meta = unsafeMetadata as { featureFlags?: Partial<FeatureFlags> };
  const overrides = meta.featureFlags ?? {};
  return {
    actions_enabled: overrides.actions_enabled !== undefined
      ? overrides.actions_enabled
      : GLOBAL_DEFAULTS.actions_enabled,
  };
}

/**
 * Convenience helpers
 */
export function actionsHidden(flags: FeatureFlags): boolean {
  return flags.actions_enabled === false;
}

export function actionsInPreview(flags: FeatureFlags): boolean {
  return flags.actions_enabled === "preview";
}

export function actionsAvailable(flags: FeatureFlags): boolean {
  return flags.actions_enabled === true;
}
