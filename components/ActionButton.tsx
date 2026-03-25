"use client";

import { useState } from "react";
import UpgradeModal from "@/components/UpgradeModal";
import type { ActionsFlag } from "@/lib/features";

interface ActionButtonProps {
  label: string;                          // e.g. "Restart ECS service"
  actionsFlag: ActionsFlag;               // from getFeatureFlags()
  isPro: boolean;                         // from getUserPlan()
  onExecute?: () => void | Promise<void>; // called only for pro users when actionsFlag=true
  className?: string;
}

/**
 * ActionButton — single component for all action states.
 *
 * State matrix:
 * ┌─────────────────────┬───────────────────────────────────────────────────┐
 * │ actionsFlag         │ Behaviour                                         │
 * ├─────────────────────┼───────────────────────────────────────────────────┤
 * │ false               │ Button hidden entirely                            │
 * │ "preview"           │ Button shown, click → preview modal (no execution)│
 * │ true + free user    │ Button shown, click → upgrade modal               │
 * │ true + pro user     │ Button shown, click → onExecute() called          │
 * └─────────────────────┴───────────────────────────────────────────────────┘
 *
 * BACKEND SAFETY: onExecute() is NEVER called for free users or in preview mode.
 * All backend action logic remains fully intact — gating is UI-only.
 */
export default function ActionButton({
  label,
  actionsFlag,
  isPro,
  onExecute,
  className,
}: ActionButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"upgrade" | "preview">("upgrade");
  const [executing, setExecuting] = useState(false);

  // Hidden mode — render nothing
  if (actionsFlag === false) return null;

  async function handleClick() {
    if (actionsFlag === "preview") {
      // Preview mode — show what would happen, no execution
      setModalMode("preview");
      setModalOpen(true);
      return;
    }

    if (actionsFlag === true) {
      if (!isPro) {
        // Free user — show upgrade modal, do NOT call onExecute
        setModalMode("upgrade");
        setModalOpen(true);
        return;
      }

      // Pro user — execute the action
      if (onExecute) {
        setExecuting(true);
        try {
          await onExecute();
        } finally {
          setExecuting(false);
        }
      }
    }
  }

  const isProButton = actionsFlag === true && isPro;
  const isFreeButton = actionsFlag === true && !isPro;
  const isPreviewButton = actionsFlag === "preview";

  return (
    <>
      <UpgradeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        actionLabel={label}
        mode={modalMode}
      />

      <div className="relative group">
        <button
          onClick={handleClick}
          disabled={executing}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isProButton
              ? "bg-indigo-600 text-white hover:bg-indigo-500"
              : isFreeButton
              ? "bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100"
              : "bg-zinc-800 border border-indigo-800/50 text-indigo-300 hover:border-indigo-600"
          } ${className ?? ""}`}
        >
          {executing ? (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>
          )}

          {executing ? "Executing…" : label}

          {/* Pro badge for free users */}
          {isFreeButton && (
            <span className="ml-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 text-xs font-semibold text-amber-400">
              Pro
            </span>
          )}

          {/* Preview badge */}
          {isPreviewButton && (
            <span className="ml-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 px-1.5 py-0.5 text-xs font-semibold text-indigo-400">
              Preview
            </span>
          )}
        </button>

        {/* Tooltip — visible on hover for free/preview users */}
        {(isFreeButton || isPreviewButton) && (
          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-300 whitespace-nowrap shadow-lg">
              {isFreeButton ? "Fix this instantly from chat · Requires Pro plan" : "Preview mode · Upgrade to enable real execution"}
              <div className="absolute top-full left-4 border-4 border-transparent border-t-zinc-700" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
