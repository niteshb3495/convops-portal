"use client";

import { useEffect, useRef } from "react";

export type UpgradeModalMode = "upgrade" | "preview";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  actionLabel?: string;
  mode?: UpgradeModalMode; // "upgrade" (default) | "preview"
}

export default function UpgradeModal({
  open,
  onClose,
  actionLabel,
  mode = "upgrade",
}: UpgradeModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  if (!open) return null;

  const isPreview = mode === "preview";

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
    >
      <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-8 shadow-2xl">

        {/* Icon */}
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl mb-5 ${
          isPreview
            ? "bg-indigo-500/10 border border-indigo-500/20"
            : "bg-amber-500/10 border border-amber-500/20"
        }`}>
          {isPreview ? (
            <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          ) : (
            <svg className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
            </svg>
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-zinc-50 mb-2">
          {isPreview ? "Preview mode" : "Run this fix instantly"}
        </h2>

        {/* Body */}
        <p className="text-sm text-zinc-400 mb-1">
          {isPreview
            ? "This is a preview. ConvOps can execute this action for you directly from chat — but real execution requires Pro."
            : "ConvOps can execute this action for you directly from chat. Upgrade to Pro to resolve incidents faster."}
        </p>

        {/* Requested action */}
        {actionLabel && (
          <div className="mt-3 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 mb-1">
            <p className="text-xs text-zinc-500 mb-1">Requested action</p>
            <p className="text-sm font-medium text-zinc-200">{actionLabel}</p>
          </div>
        )}

        {/* Preview mode: what would happen */}
        {isPreview && actionLabel && (
          <div className="mt-3 rounded-lg border border-indigo-800/40 bg-indigo-950/20 px-4 py-3 mb-1">
            <p className="text-xs text-indigo-400 font-semibold mb-1">What would happen</p>
            <p className="text-xs text-zinc-400">
              ConvOps would send a confirmation request to your WhatsApp/Slack. Once you reply YES,
              the action executes against your AWS account and an audit log entry is written.
              No manual AWS console access needed.
            </p>
          </div>
        )}

        {/* What you get with Pro */}
        <ul className="mt-4 mb-6 space-y-2">
          {[
            "Fix this instantly from chat",
            "Restart, scale, reboot — one reply",
            "Automation rules for recurring incidents",
            "Team access + on-call routing",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-zinc-300">
              <svg className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              {item}
            </li>
          ))}
        </ul>

        {/* Requires Pro plan note */}
        <p className="text-xs text-zinc-600 text-center mb-4">Requires Pro plan · $49/mo · No credit card to start</p>

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
