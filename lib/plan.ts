/**
 * ConvOps Plan Utilities
 *
 * Free plan:  Connect AWS, receive alerts, view investigations, see root cause + suggested fixes.
 * Pro plan:   Execute actions (restart, scale, reboot), chat-based actions, automation, team features.
 *
 * IMPORTANT: Plan logic controls UI gating only.
 * All backend action APIs, IAM roles, and integrations remain fully functional regardless of plan.
 * Execution is gated BEFORE the API call is triggered from the UI — never at the API level.
 */

export type Plan = "free" | "pro";

export interface UserPlanMeta {
  plan?: Plan;
  planActivatedAt?: string;
}

export function getUserPlan(unsafeMetadata: Record<string, unknown>): Plan {
  const meta = unsafeMetadata as UserPlanMeta;
  return meta.plan === "pro" ? "pro" : "free";
}

export function isPro(unsafeMetadata: Record<string, unknown>): boolean {
  return getUserPlan(unsafeMetadata) === "pro";
}

export function isFree(unsafeMetadata: Record<string, unknown>): boolean {
  return getUserPlan(unsafeMetadata) === "free";
}

/**
 * Whether the current user can EXECUTE an action from the UI.
 * Free users: NO — clicking an action opens the upgrade modal instead.
 * Pro users: YES — action is triggered normally.
 *
 * This is the single gating point. Never call backend APIs without checking this.
 */
export function canExecuteAction(unsafeMetadata: Record<string, unknown>): boolean {
  return isPro(unsafeMetadata);
}
