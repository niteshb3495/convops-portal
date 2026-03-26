"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

const REGIONS = [
  { value: "us-east-1", label: "US East (N. Virginia) — us-east-1" },
  { value: "us-east-2", label: "US East (Ohio) — us-east-2" },
  { value: "us-west-1", label: "US West (N. California) — us-west-1" },
  { value: "us-west-2", label: "US West (Oregon) — us-west-2" },
  { value: "af-south-1", label: "Africa (Cape Town) — af-south-1" },
  { value: "ap-east-1", label: "Asia Pacific (Hong Kong) — ap-east-1" },
  { value: "ap-south-1", label: "Asia Pacific (Mumbai) — ap-south-1" },
  { value: "ap-south-2", label: "Asia Pacific (Hyderabad) — ap-south-2" },
  { value: "ap-southeast-1", label: "Asia Pacific (Singapore) — ap-southeast-1" },
  { value: "ap-southeast-2", label: "Asia Pacific (Sydney) — ap-southeast-2" },
  { value: "ap-southeast-3", label: "Asia Pacific (Jakarta) — ap-southeast-3" },
  { value: "ap-southeast-4", label: "Asia Pacific (Melbourne) — ap-southeast-4" },
  { value: "ap-northeast-1", label: "Asia Pacific (Tokyo) — ap-northeast-1" },
  { value: "ap-northeast-2", label: "Asia Pacific (Seoul) — ap-northeast-2" },
  { value: "ap-northeast-3", label: "Asia Pacific (Osaka) — ap-northeast-3" },
  { value: "ca-central-1", label: "Canada (Central) — ca-central-1" },
  { value: "ca-west-1", label: "Canada (Calgary) — ca-west-1" },
  { value: "eu-central-1", label: "Europe (Frankfurt) — eu-central-1" },
  { value: "eu-central-2", label: "Europe (Zurich) — eu-central-2" },
  { value: "eu-west-1", label: "Europe (Ireland) — eu-west-1" },
  { value: "eu-west-2", label: "Europe (London) — eu-west-2" },
  { value: "eu-west-3", label: "Europe (Paris) — eu-west-3" },
  { value: "eu-south-1", label: "Europe (Milan) — eu-south-1" },
  { value: "eu-south-2", label: "Europe (Spain) — eu-south-2" },
  { value: "eu-north-1", label: "Europe (Stockholm) — eu-north-1" },
  { value: "il-central-1", label: "Israel (Tel Aviv) — il-central-1" },
  { value: "me-south-1", label: "Middle East (Bahrain) — me-south-1" },
  { value: "me-central-1", label: "Middle East (UAE) — me-central-1" },
  { value: "sa-east-1", label: "South America (São Paulo) — sa-east-1" },
];

const SERVICES = [
  {
    id: "ecs",
    label: "ECS",
    description: "Restart services, update task counts",
    actions: ["ecs:UpdateService", "ecs:StopTask", "ecs:RunTask"],
  },
  {
    id: "ec2",
    label: "EC2",
    description: "Reboot and start/stop instances",
    actions: ["ec2:RebootInstances", "ec2:StartInstances", "ec2:StopInstances"],
  },
  {
    id: "rds",
    label: "RDS",
    description: "Reboot database instances and clusters",
    actions: ["rds:RebootDBInstance", "rds:RebootDBCluster"],
  },
  {
    id: "lambda",
    label: "Lambda",
    description: "Invoke functions, update concurrency",
    actions: ["lambda:InvokeFunction", "lambda:PutFunctionConcurrency", "lambda:DeleteFunctionConcurrency"],
  },
  {
    id: "asg",
    label: "Auto Scaling",
    description: "Scale groups up/down",
    actions: ["autoscaling:SetDesiredCapacity", "autoscaling:UpdateAutoScalingGroup", "autoscaling:ExecutePolicy"],
  },
  {
    id: "ssm",
    label: "SSM",
    description: "Run commands on instances via SSM",
    actions: ["ssm:SendCommand", "ssm:CancelCommand"],
  },
];

const CFN_ENDPOINT = "https://ewvdzp6c79.execute-api.eu-central-1.amazonaws.com/prod/webhook";
const CFN_TEMPLATE =
  "https://convops-cfn-templates.s3.eu-central-1.amazonaws.com/customer-convops-setup.yaml";

type AlertChannel = "whatsapp" | "slack" | "both";

function buildStackUrl(accountId: string, region: string, selectedServices: string[]) {
  const params = new URLSearchParams({
    templateURL: CFN_TEMPLATE,
    stackName: "convops-setup",
    [`param_ExternalId`]: `CONVOPS-${accountId}`,
    [`param_ConvOpsEndpoint`]: CFN_ENDPOINT,
    [`param_Services`]: selectedServices.join(","),
  });
  return `https://console.aws.amazon.com/cloudformation/home?region=${region}#/stacks/create/review?${params.toString()}`;
}

function alertChannelLabel(channel: AlertChannel, whatsappNumber: string) {
  if (channel === "whatsapp") return `WhatsApp (${whatsappNumber})`;
  if (channel === "slack") return "Slack";
  return "WhatsApp + Slack";
}

export default function ConnectPage() {
  const { user } = useUser();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 fields
  const [accountId, setAccountId] = useState("");
  const [region, setRegion] = useState("eu-central-1");
  const [alertChannel, setAlertChannel] = useState<AlertChannel>("both");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [slackWebhook, setSlackWebhook] = useState("");
  const [accountIdError, setAccountIdError] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>(["ecs", "ec2", "rds"]);

  // Step 3 state
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const needsWhatsapp = alertChannel === "whatsapp" || alertChannel === "both";
  const needsSlack = alertChannel === "slack" || alertChannel === "both";

  const step1Valid =
    !!accountId &&
    (!needsWhatsapp || !!whatsappNumber) &&
    (!needsSlack || !!slackWebhook);

  function toggleService(id: string) {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  }

  function validateAndNext() {
    if (!/^\d{12}$/.test(accountId)) {
      setAccountIdError("Account ID must be exactly 12 digits.");
      return;
    }
    setAccountIdError("");
    setStep(2);
  }

  async function verify() {
    setVerifying(true);
    setError("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_CONVOPS_API_URL;
      const apiKey = process.env.NEXT_PUBLIC_CONVOPS_API_KEY;
      const res = await fetch(`${apiUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey ?? "",
        },
        body: JSON.stringify({ accountId, region, alertChannel, whatsappNumber, slackWebhook, selectedServices }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Request failed with status ${res.status}`);
      }
      // Persist to Clerk unsafeMetadata — append to awsAccounts array
      const existing = (user?.unsafeMetadata.awsAccounts as object[] | undefined) ?? [];
      await user?.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          awsAccounts: [
            ...existing,
            {
              id: crypto.randomUUID(),
              accountId,
              region,
              alertChannel,
              whatsappNumber,
              slackWebhook,
              selectedServices,
              status: "connected",
              connectedAt: new Date().toISOString(),
            },
          ],
        },
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setVerifying(false);
    }
  }

  const CHANNEL_OPTIONS: { value: AlertChannel; label: string }[] = [
    { value: "whatsapp", label: "WhatsApp" },
    { value: "slack", label: "Slack" },
    { value: "both", label: "Both" },
  ];

  const writeAccessLabel = "Read-only (CloudWatch, logs, resource metadata)";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="mx-auto max-w-2xl flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <span className="text-lg font-bold tracking-tight text-zinc-50">ConvOps</span>
          <span className="text-zinc-600">/</span>
          <span className="text-lg font-semibold text-zinc-300">Connect AWS Account</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-10">
          {([1, 2, 3] as const).map((n) => (
            <div key={n} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  step === n
                    ? "bg-zinc-50 text-zinc-950"
                    : step > n
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {step > n ? (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                ) : (
                  n
                )}
              </div>
              {n < 3 && <div className={`h-px w-8 ${step > n ? "bg-emerald-600" : "bg-zinc-800"}`} />}
            </div>
          ))}
        </div>

        {/* ── Step 1 ── */}
        {step === 1 && (
          <div>
            <h1 className="text-xl font-bold text-zinc-50 mb-1">Enter your AWS details</h1>
            <p className="text-sm text-zinc-400 mb-4">
              We&apos;ll use these to set up the ConvOps stack in your account.
            </p>

            {/* Trust banner */}
            <div className="flex items-start gap-3 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 mb-6">
              <svg className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-zinc-200">Read-only access by default</p>
                <p className="text-xs text-zinc-500 mt-0.5">ConvOps requests read access to CloudWatch, logs, and resource metadata. No changes are made to your infrastructure without your explicit approval.</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Account ID */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  AWS Account ID
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={12}
                  placeholder="123456789012"
                  value={accountId}
                  onChange={(e) => {
                    setAccountId(e.target.value.replace(/\D/g, "").slice(0, 12));
                    setAccountIdError("");
                  }}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 font-mono"
                />
                {accountIdError && (
                  <p className="mt-1.5 text-xs text-red-400">{accountIdError}</p>
                )}
              </div>

              {/* Region */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  AWS Region
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                >
                  {REGIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Alert Channel */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Alert Channel
                </label>
                <div className="inline-flex rounded-lg bg-zinc-900 border border-zinc-700 p-0.5 gap-0.5">
                  {CHANNEL_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAlertChannel(opt.value)}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        alertChannel === opt.value
                          ? "bg-white text-zinc-950"
                          : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* WhatsApp field */}
              {needsWhatsapp && (
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    WhatsApp number for alerts
                  </label>
                  <input
                    type="tel"
                    placeholder="+49 151 12345678"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  />
                  <p className="mt-1.5 text-xs text-zinc-500">Include country code, e.g. +1 555 000 0000</p>
                </div>
              )}

              {/* Slack field */}
              {needsSlack && (
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Slack Incoming Webhook URL
                  </label>
                  <p className="text-xs text-zinc-500 mb-2">
                    Slack integration — enter your Slack webhook URL
                  </p>
                  <input
                    type="url"
                    placeholder="https://hooks.slack.com/services/..."
                    value={slackWebhook}
                    onChange={(e) => setSlackWebhook(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 font-mono"
                  />
                </div>
              )}
            </div>

            <button
              onClick={validateAndNext}
              disabled={!step1Valid}
              className="mt-8 w-full rounded-lg bg-zinc-50 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Generate Setup Link
            </button>

            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-zinc-600">
              <span className="flex items-center gap-1">
                <svg className="h-3 w-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Read-only by default
              </span>
              <span className="flex items-center gap-1">
                <svg className="h-3 w-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                No auto-actions
              </span>
              <span className="flex items-center gap-1">
                <svg className="h-3 w-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Full audit log
              </span>
            </div>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <div>
            <h1 className="text-xl font-bold text-zinc-50 mb-1">Launch CloudFormation Stack</h1>
            <p className="text-sm text-zinc-400 mb-6">
              Click Launch Stack — it opens in your AWS console and takes about 2 minutes.
            </p>

            {/* ACTIONS_DISABLED — Write Access selector hidden until Pro plan launches.
                To re-enable: uncomment this entire block.
            <div className="mb-6">
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Write Access <span className="text-zinc-500 font-normal">(optional — you can skip and add later)</span>
              </label>
              <p className="text-xs text-zinc-500 mb-2">
                Read-only by default. Select services ConvOps can take action on when you reply to an alert.
              </p>
              <div className="flex items-start gap-2 rounded-lg border border-amber-800/50 bg-amber-950/30 px-3 py-2.5 mb-3">
                <p className="text-xs text-amber-300/80">
                  <span className="font-semibold text-amber-300">EKS note:</span> Alerts and AI analysis work for EKS via CloudWatch Container Insights. Pod restarts and rollbacks are not yet supported.
                </p>
              </div>
              <div className="space-y-2">
                {SERVICES.map((svc) => {
                  const isSelected = selectedServices.includes(svc.id);
                  return (
                    <button key={svc.id} type="button" onClick={() => toggleService(svc.id)}
                      className={`w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${isSelected ? "border-zinc-500 bg-zinc-800" : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"}`}>
                      <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${isSelected ? "border-zinc-400 bg-zinc-400" : "border-zinc-600 bg-transparent"}`}>
                        {isSelected && <svg className="h-2.5 w-2.5 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-zinc-200">{svc.label}</span>
                        <span className="ml-2 text-xs text-zinc-500">{svc.description}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            */}

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 mb-6 space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-zinc-500 w-32 shrink-0">Account ID</span>
                <span className="font-mono text-zinc-300">{accountId}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-zinc-500 w-32 shrink-0">Region</span>
                <span className="font-mono text-zinc-300">{region}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-zinc-500 w-32 shrink-0">Alert channel</span>
                <span className="text-zinc-300">{alertChannelLabel(alertChannel, whatsappNumber)}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-zinc-500 w-32 shrink-0">Access</span>
                <span className="text-zinc-300">{writeAccessLabel}</span>
              </div>
            </div>

            <a
              href={buildStackUrl(accountId, region, selectedServices)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-amber-500 py-3 text-sm font-semibold text-zinc-950 hover:bg-amber-400 transition-colors"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                />
              </svg>
              Launch Stack in AWS
            </a>

            <p className="mt-5 text-sm text-zinc-400 text-center">
              Once the stack is deployed, click Continue below.
            </p>

            <button
              onClick={() => setStep(3)}
              className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-900 py-2.5 text-sm font-semibold text-zinc-200 hover:border-zinc-500 hover:text-zinc-50 transition-colors"
            >
              I have deployed the stack
            </button>

            <button
              onClick={() => setStep(1)}
              className="mt-3 w-full text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              ← Back
            </button>
          </div>
        )}

        {/* ── Step 3 ── */}
        {step === 3 && (
          <div>
            <h1 className="text-xl font-bold text-zinc-50 mb-1">Confirm connection</h1>
            <p className="text-sm text-zinc-400 mb-8">
              We&apos;ll verify your setup by reaching out to your AWS account.
            </p>

            {!success && !error && !verifying && (
              <>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 mb-6 space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-zinc-500 w-32 shrink-0">Account ID</span>
                    <span className="font-mono text-zinc-300">{accountId}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-zinc-500 w-32 shrink-0">Region</span>
                    <span className="font-mono text-zinc-300">{region}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-zinc-500 w-32 shrink-0">Alert channel</span>
                    <span className="text-zinc-300">{alertChannelLabel(alertChannel, whatsappNumber)}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-zinc-500 w-32 shrink-0">Access</span>
                    <span className="text-zinc-300">{writeAccessLabel}</span>
                  </div>
                </div>
                <button
                  onClick={verify}
                  className="w-full rounded-lg bg-zinc-50 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-white transition-colors"
                >
                  Verify connection
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="mt-3 w-full text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  ← Back
                </button>
              </>
            )}

            {verifying && (
              <div className="flex flex-col items-center py-10 gap-4">
                <svg
                  className="h-8 w-8 animate-spin text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                <p className="text-sm text-zinc-400">
                  We are verifying your setup… this takes up to 60 seconds
                </p>
              </div>
            )}

            {success && (
              <div className="flex flex-col items-center py-10 gap-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-950 border border-emerald-700">
                  <svg
                    className="h-7 w-7 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-semibold text-zinc-50">AWS account connected!</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    You can add more accounts from the dashboard.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="mt-2 rounded-lg bg-zinc-50 px-6 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-white transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            )}

            {error && !verifying && (
              <div className="flex flex-col items-center py-10 gap-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-950 border border-red-800">
                  <svg
                    className="h-7 w-7 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-semibold text-zinc-50">Verification failed</p>
                  <p className="mt-1 text-sm text-red-400 max-w-sm">{error}</p>
                </div>
                <button
                  onClick={() => { setError(""); verify(); }}
                  className="mt-2 rounded-lg bg-zinc-50 px-6 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-white transition-colors"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
