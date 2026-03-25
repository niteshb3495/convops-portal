"use client";

import { useState } from "react";
import UpgradeModal from "@/components/UpgradeModal";

interface SimulateIncidentProps {
  isPro: boolean;
  onDemoComplete?: () => void;
}

type Stage =
  | "idle"
  | "alerting"
  | "investigating"
  | "results"
  | "confirming"
  | "resolved";

// Realistic fake incident scenarios
const SCENARIOS = [
  {
    id: "ecs-oom",
    title: "ECS Service — Error Spike",
    alarm: "api-service · ErrorRate > 5% · 3 min",
    account: "prod-account (123456789012)",
    region: "eu-central-1",
    severity: "P1",
    investigationSteps: [
      "Pulling CloudWatch logs for api-service…",
      "Checking ECS task status and stopped reason…",
      "Fetching memory utilisation metrics (last 30 min)…",
      "Checking recent CloudWatch events for deploy activity…",
    ],
    rootCause:
      "Container api-worker-3 stopped with reason: OutOfMemoryError (limit: 512MB). Memory rose from 340MB → 620MB over 8 min before the task was killed. 1 of 4 tasks currently in STOPPED state.",
    explanation:
      "ConvOps detected the OOM stop reason from ECS task metadata and confirmed the memory spike in CloudWatch metrics. A deploy event (v2.4.1) was logged 23 minutes before the spike — this is likely related, but ConvOps cannot confirm the code-level cause. You'll need to check the deploy diff or enable a profiler to find the root cause in code.",
    urgency: "This issue is actively impacting service performance — 1 task down, error rate at 5% and rising.",
    suggestedFix: "Restart the ECS service to cycle the stopped container and restore all 4 tasks to RUNNING.",
    whatWillHappen: "ECS will stop and replace all running tasks, cycling the container that hit the OOM limit.",
    whyItHelps: "Restarting clears the memory state of the faulty container, returning all 4 tasks to a healthy running state and stopping the error spike.",
    expectedOutcome: "ErrorRate drops back to baseline (<0.1%). All 4 tasks RUNNING. Full capacity restored in ~60 seconds.",
    action: "Run fix now — Restart ECS service",
    resolvedMessage: "✅ ECS service restarted. All 4 tasks RUNNING. ErrorRate back to 0.1%. Capacity restored — investigate v2.4.1 deploy when ready.",
  },
  {
    id: "lambda-timeout",
    title: "Lambda — Repeated Timeouts",
    alarm: "payment-processor · Duration > 28s · 5 invocations",
    account: "prod-account (123456789012)",
    region: "eu-central-1",
    severity: "P2",
    investigationSteps: [
      "Fetching Lambda execution logs (last 15 min)…",
      "Checking RDS CPU and connection count metrics…",
      "Correlating Lambda timeout timestamps with RDS load…",
      "Checking for other Lambdas hitting the same RDS instance…",
    ],
    rootCause:
      "Lambda avg duration: 27.8s (limit: 30s). RDS CPU: 94%. RDS connection count: 487/500. Timeouts started 14 minutes ago, correlating with RDS connection saturation. 3 other Lambdas share the same RDS instance.",
    explanation:
      "ConvOps can see that Lambda is timing out and that RDS connections are nearly exhausted at the same time — the correlation is strong. What ConvOps cannot tell you: why connections are being held open. That requires inspecting your application code (e.g. missing connection release in error paths). The RDS reboot will clear stale connections and restore availability now.",
    urgency: "Payment processing is timing out — users are experiencing failed transactions right now.",
    suggestedFix: "Reboot RDS to clear the saturated connection pool and restore Lambda response times.",
    whatWillHappen: "RDS will reboot (typically 1–2 min downtime), clearing all active and stale connections. The pool resets to 0.",
    whyItHelps: "With the connection pool cleared, Lambdas can acquire fresh connections immediately instead of queuing and timing out.",
    expectedOutcome: "Lambda avg duration drops from 27.8s back to <500ms. Connection count resets to ~10/500. Payment processing restored.",
    action: "Run fix now — Reboot RDS instance",
    resolvedMessage: "✅ RDS rebooted. Connection count: 12/500. Lambda avg duration back to 340ms. Payment processing restored — audit connection handling when ready.",
  },
];

const STEP_DELAY = 800; // ms between investigation steps

export default function SimulateIncident({ isPro, onDemoComplete }: SimulateIncidentProps) {
  const [stage, setStage] = useState<Stage>("idle");
  const [scenario] = useState(() => SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)]);
  const [investigationStep, setInvestigationStep] = useState(0);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  function reset() {
    setStage("idle");
    setInvestigationStep(0);
    setUpgradeOpen(false);
  }

  async function runSimulation() {
    // Stage 1: show alert
    setStage("alerting");
    await delay(1400);

    // Stage 2: investigating — step through each log line
    setStage("investigating");
    for (let i = 1; i <= scenario.investigationSteps.length; i++) {
      await delay(STEP_DELAY);
      setInvestigationStep(i);
    }
    await delay(600);

    // Stage 3: show results
    setStage("results");
  }

  function handleActionClick() {
    if (!isPro) {
      setUpgradeOpen(true);
    } else {
      setStage("confirming");
    }
  }

  async function handleConfirm() {
    setStage("resolved");
    // Notify parent that demo is complete (advances onboarding step)
    onDemoComplete?.();
  }

  return (
    <>
      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        actionLabel={scenario.action}
      />

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 mb-6">
        {/* Header row */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-300">Try ConvOps without waiting for a real incident</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Simulate a realistic AWS incident and see exactly what ConvOps would do.</p>
          </div>
          {stage === "idle" && (
            <button
              onClick={runSimulation}
              className="shrink-0 flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
              </svg>
              Simulate an incident
            </button>
          )}
          {stage !== "idle" && stage !== "resolved" && (
            <button
              onClick={reset}
              className="shrink-0 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Reset
            </button>
          )}
          {stage === "resolved" && (
            <button
              onClick={reset}
              className="shrink-0 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Run again
            </button>
          )}
        </div>

        {/* ── IDLE state ── */}
        {stage === "idle" && (
          <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900/30 px-6 py-8 flex flex-col items-center text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 mb-3">
              <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <p className="text-sm text-zinc-500">Click <strong className="text-zinc-400">Simulate an incident</strong> to see ConvOps in action — no AWS account needed.</p>
          </div>
        )}

        {/* ── ALERTING state ── */}
        {stage === "alerting" && (
          <div className="rounded-lg border border-red-800/60 bg-red-950/20 px-5 py-4 animate-pulse">
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5">🚨</span>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-bold text-red-400">URGENT ALERT</span>
                  <span className="rounded-full bg-red-900/60 border border-red-800 px-2 py-0.5 text-xs font-semibold text-red-300">{scenario.severity}</span>
                </div>
                <p className="text-sm font-mono text-zinc-300">{scenario.alarm}</p>
                <p className="text-xs text-zinc-500 mt-1">{scenario.account} · {scenario.region}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── INVESTIGATING state ── */}
        {stage === "investigating" && (
          <div className="space-y-3">
            <div className="rounded-lg border border-red-800/40 bg-red-950/10 px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="text-base">🚨</span>
                <div>
                  <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">Alert — {scenario.severity}</span>
                  <p className="text-sm font-mono text-zinc-300">{scenario.alarm}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="h-4 w-4 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">Investigating…</span>
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                {scenario.investigationSteps.map((step, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 transition-opacity duration-300 ${i < investigationStep ? "opacity-100" : "opacity-0"}`}
                  >
                    {i < investigationStep - 1 ? (
                      <svg className="h-3 w-3 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    ) : (
                      <span className="h-3 w-3 shrink-0" />
                    )}
                    <span className={i < investigationStep - 1 ? "text-zinc-400" : "text-zinc-300"}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── RESULTS state ── */}
        {(stage === "results" || stage === "confirming") && (
          <div className="space-y-3">
            {/* Alert badge */}
            <div className="rounded-lg border border-red-800/40 bg-red-950/10 px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="text-base">🚨</span>
                <div>
                  <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">Alert — {scenario.severity}</span>
                  <p className="text-sm font-mono text-zinc-300">{scenario.alarm}</p>
                </div>
              </div>
            </div>

            {/* Investigation complete */}
            <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Investigation complete</span>
              </div>
              <div className="space-y-1.5 font-mono text-xs text-zinc-400">
                {scenario.investigationSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <svg className="h-3 w-3 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Root cause */}
            <div className="rounded-lg border border-amber-800/40 bg-amber-950/10 px-5 py-4">
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-2">Root Cause</p>
              <p className="text-sm text-zinc-300 leading-relaxed">{scenario.rootCause}</p>
            </div>

            {/* Explanation */}
            <div className="rounded-lg border border-zinc-700 bg-zinc-900/50 px-5 py-4">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">What happened</p>
              <p className="text-sm text-zinc-400 leading-relaxed">{scenario.explanation}</p>
            </div>

            {/* Urgency + Suggested fix + action */}
            <div className="rounded-lg border border-red-900/40 bg-red-950/10 px-4 py-3 flex items-start gap-2">
              <svg className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <p className="text-xs text-red-300">{scenario.urgency}</p>
            </div>

            <div className="rounded-lg border border-indigo-800/40 bg-indigo-950/10 px-5 py-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-1.5">Suggested Fix</p>
                <p className="text-sm font-medium text-zinc-200 leading-relaxed">{scenario.suggestedFix}</p>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="rounded-lg bg-zinc-900/60 border border-zinc-800 px-3 py-2.5">
                  <p className="text-xs font-semibold text-zinc-500 mb-1">What will happen</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">{scenario.whatWillHappen}</p>
                </div>
                <div className="rounded-lg bg-zinc-900/60 border border-zinc-800 px-3 py-2.5">
                  <p className="text-xs font-semibold text-zinc-500 mb-1">Why it helps</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">{scenario.whyItHelps}</p>
                </div>
                <div className="rounded-lg bg-emerald-950/30 border border-emerald-900/40 px-3 py-2.5">
                  <p className="text-xs font-semibold text-emerald-600 mb-1">Expected outcome</p>
                  <p className="text-xs text-emerald-400/80 leading-relaxed">{scenario.expectedOutcome}</p>
                </div>
              </div>

              {stage === "results" && (
                <div>
                  <p className="text-xs text-zinc-500 mb-3 flex items-center gap-1.5">
                    <svg className="h-3 w-3 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    You are in control — no action is taken without your confirmation.
                  </p>
                  <button
                    onClick={handleActionClick}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                    </svg>
                    {scenario.action}
                    {!isPro && <span className="ml-1 rounded-full bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.5 text-xs text-amber-400">Pro</span>}
                  </button>
                </div>
              )}
              {stage === "confirming" && (
                <div className="space-y-3">
                  <div className="rounded-lg border border-amber-700/50 bg-amber-950/20 px-4 py-3">
                    <p className="text-sm text-amber-300 font-medium">Confirm: {scenario.action}?</p>
                    <p className="text-xs text-zinc-500 mt-1">This is a simulation — no real AWS resources will be affected.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleConfirm}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
                    >
                      ✅ YES — Execute
                    </button>
                    <button
                      onClick={reset}
                      className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── RESOLVED state ── */}
        {stage === "resolved" && (
          <div className="space-y-3">
            <div className="rounded-lg border border-emerald-800/50 bg-emerald-950/20 px-5 py-5 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-900/60 border border-emerald-700 mx-auto mb-3">
                <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-emerald-300 mb-1">Incident resolved</p>
              <p className="text-sm text-zinc-400">{scenario.resolvedMessage}</p>
            </div>

            <div className="rounded-lg border border-zinc-700 bg-zinc-900/50 px-5 py-4">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">📋 Audit log entry written</p>
              <div className="font-mono text-xs text-zinc-500 space-y-1">
                <div><span className="text-zinc-600">action:</span> <span className="text-zinc-400">{scenario.action}</span></div>
                <div><span className="text-zinc-600">approved_by:</span> <span className="text-zinc-400">you (phone-bound)</span></div>
                <div><span className="text-zinc-600">timestamp:</span> <span className="text-zinc-400">{new Date().toISOString()}</span></div>
                <div><span className="text-zinc-600">result:</span> <span className="text-emerald-400">success</span></div>
              </div>
            </div>

            <p className="text-xs text-zinc-500 text-center pt-1">
              This was a simulation. Connect your AWS account to get real alerts like this.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
