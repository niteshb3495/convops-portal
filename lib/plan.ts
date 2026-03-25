/**
 * ConvOps Plan Utilities
 *
 * Free plan:  Connect AWS, receive alerts, view investigations, see root cause + suggested fixes.
 * Pro plan:   Execute actions (restart, scale, etc.), chat-based actions, automation rules, team features.
 *
 * Free action trial: 1 free action execution allowed before upgrade is required.
 */

export type Plan = "free" | "pro";

export interface UserPlanMeta {
  plan?: Plan;
  freeActionsUsed?: number; // tracked in Clerk unsafeMetadata
  planActivatedAt?: string;
}

export const FREE_ACTION_LIMIT = 1;

export function getUserPlan(unsafeMetadata: Record<string, unknown>): Plan {
  const meta = unsafeMetadata as UserPlanMeta;
  return meta.plan === "pro" ? "pro" : "free";
}

export function getFreeActionsUsed(unsafeMetadata: Record<string, unknown>): number {
  const meta = unsafeMetadata as UserPlanMeta;
  return typeof meta.freeActionsUsed === "number" ? meta.freeActionsUsed : 0;
}

export function canExecuteAction(unsafeMetadata: Record<string, unknown>): boolean {
  const plan = getUserPlan(unsafeMetadata);
  if (plan === "pro") return true;
  // Free plan: allow up to FREE_ACTION_LIMIT trial actions
  const used = getFreeActionsUsed(unsafeMetadata);
  return used < FREE_ACTION_LIMIT;
}

export function getRemainingFreeActions(unsafeMetadata: Record<string, unknown>): number {
  const plan = getUserPlan(unsafeMetadata);
  if (plan === "pro") return Infinity;
  const used = getFreeActionsUsed(unsafeMetadata);
  return Math.max(0, FREE_ACTION_LIMIT - used);
}
