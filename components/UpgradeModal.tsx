"use client";

import { useEffect, useRef } from "react";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  actionLabel?: string; // e.g. "Restart ECS service"
}

export default function UpgradeModal({ open, onClose, actionLabel }: UpgradeModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Close on backdrop click
  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
    >
      <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-8 shadow-2xl">
        {/* Icon */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 mb-5">
          <svg
            className="h-6 w-6 text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
            />
          </svg>
        </div>

        {/* Copy */}
        <h2 className="text-xl font-bold text-zinc-50 mb-2">Run this fix instantly</h2>
        <p className="text-sm text-zinc-400 mb-1">
          Upgrade to execute actions directly from chat and resolve incidents faster.
        </p>
        {actionLabel && (
          <div className="mt-3 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 mb-1">
            <p className="text-xs text-zinc-500 mb-1">Requested action</p>
            <p className="text-sm font-medium text-zinc-200">{actionLabel}</p>
          </div>
        )}

        {/* What you get */}
        <ul className="mt-4 mb-6 space-y-2">
          {[
            "Execute actions from WhatsApp & Slack",
            "Restart, scale, reboot — approved with one reply",
            "Automation rules for recurring incidents",
            "Team access + on-call routing",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-zinc-300">
              <svg
                className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              {item}
            </li>
          ))}
        </ul>

        {/* CTAs */}
        <a
          href="mailto:nitesh@convops.io?subject=ConvOps Pro Upgrade"
          className="flex items-center justify-center w-full rounded-lg bg-amber-500 py-3 text-sm font-semibold text-zinc-950 hover:bg-amber-400 transition-colors mb-3"
        >
          Upgrade to Pro
        </a>
        <button
          onClick={onClose}
          className="w-full text-sm text-zinc-500 hover:text-zinc-300 transition-colors py-1"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
